// Evaluator of the instruction optimisation (evals/optimize/README.md): reads a graded run folder
// (evals/grade.mjs → report.json), the candidates' coverage files and the requirement list, and writes
//   <out>/optimize.json  – per variant: success, critical violations, tokens, cost, time, questions, size
//   <out>/optimize.md    – the table and the Pareto front
//   <out>/feedback.md    – what the optimisation agent sees for the next generation (training scenarios only)
//
//   node evals/optimize/optimize.mjs --out <graded run folder> [--baseline base]
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, resolve, relative } from "node:path";
import { harnessRoot, loadScenario } from "../lib.mjs";

const args = process.argv.slice(2);
const option = (name, fallback) => { const i = args.indexOf(`--${name}`); return i >= 0 ? args[i + 1] : fallback; };
const out = resolve(option("out"));
const baseline = option("baseline", "base");
const report = JSON.parse(readFileSync(join(out, "report.json"), "utf8"));
const rows = report.rows ?? report;

// Critical requirements (evals/optimize/requirements/create-outline.md, weight K) as code checks and judge questions.
const criticalChecks = new Set(["validator-ok", "outline-filled", "outline-kept"]);
const criticalJudge = new Set(["goal_first", "no_silent_drop", "observable", "time_check", "content_before_save", "save_confirm"]);
const requirementIds = [...readFileSync(join(harnessRoot, "evals/optimize/requirements/create-outline.md"), "utf8").matchAll(/^\| (R\d+) \|[^|]*\|[^|]*\| ([KWN]) \|/gm)].map(m => ({ id: m[1], weight: m[2] }));

const median = values => { const v = values.filter(x => typeof x === "number").sort((a, b) => a - b); return v.length ? (v.length % 2 ? v[(v.length - 1) / 2] : (v[v.length / 2 - 1] + v[v.length / 2]) / 2) : null; };
const words = file => readFileSync(file, "utf8").split(/\s+/).filter(Boolean).length;
const filesUnder = dir => readdirSync(dir).flatMap(name => { const path = join(dir, name); return statSync(path).isDirectory() ? filesUnder(path) : [path]; });

// Instruction size of a variant: the files its overlay replaces (baseline: the same paths in the reference).
function instructionSize(candidate, paths) {
  const files = candidate ? filesUnder(join(harnessRoot, candidate, "overlay")) : paths.map(path => join(harnessRoot, path)).filter(existsSync);
  const text = files.map(file => readFileSync(file, "utf8")).join("\n");
  return { files: files.map(file => relative(candidate ? join(harnessRoot, candidate, "overlay") : harnessRoot, file)), words: text.split(/\s+/).filter(Boolean).length, tokens_est: Math.round(text.length / 4) };
}

// Static coverage: <candidate>/coverage.json { "R1": "where the variant states it" | null }.
function coverage(candidate) {
  if (!candidate) return { missing: [], checked: true };
  const file = join(harnessRoot, candidate, "coverage.json");
  if (!existsSync(file)) return { missing: ["(no coverage.json)"], checked: false };
  const map = JSON.parse(readFileSync(file, "utf8"));
  return { missing: requirementIds.filter(req => !map[req.id]).map(req => `${req.id}${req.weight === "K" ? " (K)" : ""}`), checked: true };
}

const variants = [...new Set(rows.map(row => row.variant))];
const overlayPaths = [...new Set(rows.filter(row => row.candidate).flatMap(row => filesUnder(join(harnessRoot, row.candidate, "overlay")).map(file => relative(join(harnessRoot, row.candidate, "overlay"), file))))];
const result = variants.map(variant => {
  const mine = rows.filter(row => row.variant === variant);
  const candidate = mine[0]?.candidate ?? null;
  const perRun = mine.map(row => {
    const failedChecks = row.checks.filter(check => !check.pass).map(check => check.id);
    const failedJudge = Object.entries(row.judge ?? {}).filter(([, answer]) => answer?.value === false).map(([question]) => question);
    const critical = [...failedChecks.filter(id => criticalChecks.has(id)), ...failedJudge.filter(id => criticalJudge.has(id))];
    const set = loadScenario(row.scenario).set ?? "train";
    const transcript = existsSync(join(out, row.dir, "project", "TRANSCRIPT.md")) ? readFileSync(join(out, row.dir, "project", "TRANSCRIPT.md"), "utf8") : "";
    const questions = (transcript.split(/^## Messages/m)[1] ?? "").split(/^## /m)[0].split(/\n(?=\s*(?:\d+\.|[-*]|#{3,}))/).filter(part => /\?/.test(part)).length;
    return { scenario: row.scenario, set, rep: row.rep, success: failedChecks.length === 0 && critical.length === 0, failedChecks, failedJudge, critical, tokens: row.usage?.tokens ?? null, cache_read: row.usage?.cache_read_tokens ?? null, cost: row.usage?.cost_usd ?? null, duration_ms: row.duration_ms ?? row.usage?.duration_ms ?? null, questions, judged: Boolean(row.judge) };
  });
  const of = set => perRun.filter(run => run.set === set);
  const summary = runs => runs.length ? {
    runs: runs.length, success_rate: runs.filter(run => run.success).length / runs.length,
    critical: runs.reduce((sum, run) => sum + run.critical.length, 0),
    tokens_median: median(runs.map(run => run.tokens)), cost_median: median(runs.map(run => run.cost)),
    duration_median_s: median(runs.map(run => run.duration_ms))/1000 || null, questions_median: median(runs.map(run => run.questions)),
    tokens_per_success: runs.some(run => run.success) ? Math.round(runs.reduce((sum, run) => sum + (run.tokens ?? 0), 0) / runs.filter(run => run.success).length) : null
  } : null;
  return { variant, candidate, size: instructionSize(candidate, overlayPaths), coverage: coverage(candidate), train: summary(of("train")), holdout: summary(of("holdout")), runs: perRun };
});

// Pareto front over (success rate ↑, tokens per success ↓, instruction tokens ↓) on the training set.
// Excluded first: a variant missing a critical requirement, or with more critical violations than the baseline.
const base = result.find(entry => entry.variant === baseline);
const eligible = result.filter(entry => entry.train && !entry.coverage.missing.some(id => id.includes("(K)") || id.startsWith("(")) && (!base?.train || entry.train.critical <= base.train.critical));
const dominates = (a, b) => a.train.success_rate >= b.train.success_rate && (a.train.tokens_per_success ?? Infinity) <= (b.train.tokens_per_success ?? Infinity) && a.size.tokens_est <= b.size.tokens_est
  && (a.train.success_rate > b.train.success_rate || (a.train.tokens_per_success ?? Infinity) < (b.train.tokens_per_success ?? Infinity) || a.size.tokens_est < b.size.tokens_est);
const front = eligible.filter(a => !eligible.some(b => b !== a && dominates(b, a))).map(entry => entry.variant);
for (const entry of result) entry.status = front.includes(entry.variant) ? "pareto" : eligible.includes(entry) ? "dominated" : "excluded";

writeFileSync(join(out, "optimize.json"), JSON.stringify({ baseline, front, variants: result }, null, 1));
const fmt = (value, digits = 0) => value === null || value === undefined ? "–" : typeof value === "number" ? value.toLocaleString("de-DE", { maximumFractionDigits: digits }) : value;
let md = `# Optimierung – Auswertung\n\nLauf: \`${out}\` · Basis: \`${baseline}\`\n\n| Variante | Status | Instruktion (Wörter / ~Tokens) | fehlende Anforderungen | Erfolg Training | krit. Verstöße | Tokens (Median) | Tokens je Erfolg | Kosten | Dauer s | Rückfragen | Erfolg Holdout |\n|---|---|---|---|---|---|---|---|---|---|---|---|\n`;
for (const entry of result) md += `| ${entry.variant} | ${entry.status} | ${fmt(entry.size.words)} / ${fmt(entry.size.tokens_est)} | ${entry.coverage.missing.join(", ") || "–"} | ${entry.train ? `${Math.round(entry.train.success_rate * 100)} % (${entry.train.runs})` : "–"} | ${fmt(entry.train?.critical)} | ${fmt(entry.train?.tokens_median)} | ${fmt(entry.train?.tokens_per_success)} | ${fmt(entry.train?.cost_median, 3)} | ${fmt(entry.train?.duration_median_s)} | ${fmt(entry.train?.questions_median)} | ${entry.holdout ? `${Math.round(entry.holdout.success_rate * 100)} % (${entry.holdout.runs})` : "–"} |\n`;
md += `\nPareto-Front (Training): ${front.map(name => `\`${name}\``).join(", ") || "–"}\n\nKosten und Cache-Treffer nur bei Läufen über einen Adapter mit Trace (Claude Code: \`--output-format stream-json\`); Läufe über Subagenten melden nur die Gesamt-Tokens.\n`;
writeFileSync(join(out, "optimize.md"), md);

// Feedback for the optimisation agent: training scenarios only (the holdout stays unseen).
let feedback = `# Rückmeldung an den Optimierungsagenten\n\nNur Trainingsszenarien. Jede kritische Anforderung (K) muss erhalten bleiben; eine Variante, der eine fehlt, wird ausgeschlossen.\n\n`;
for (const entry of result) {
  feedback += `## ${entry.variant} (${entry.status})\n\n- Größe: ${entry.size.words} Wörter, ~${entry.size.tokens_est} Tokens\n- fehlende Anforderungen laut Abdeckung: ${entry.coverage.missing.join(", ") || "keine"}\n`;
  for (const run of entry.runs.filter(run => run.set === "train")) feedback += `- ${run.scenario} #${run.rep}: ${run.success ? "erfolgreich" : `nicht erfolgreich – Code: ${run.failedChecks.join(", ") || "ok"}; Richter: ${run.failedJudge.join(", ") || (run.judged ? "ok" : "nicht bewertet")}`} · ${fmt(run.tokens)} Tokens\n`;
  feedback += "\n";
}
writeFileSync(join(out, "feedback.md"), feedback);
console.log(md);
