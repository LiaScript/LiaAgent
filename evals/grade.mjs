#!/usr/bin/env node
// Evaluation harness – grade runs and write the report (evals/README.md).
//
//   node evals/grade.mjs --out <dir>
//
// Per run: code checks (checks.mjs), the reading load (from trace.jsonl of `claude -p --output-format
// stream-json`, else from the run's TRANSCRIPT.md), tokens and duration. A blinded pack per run goes to
// <out>/judge-pack/ for the LLM judge; its answers, saved as <out>/judge-results/<id>.json, are read back.
// The report is <out>/report.md (and report.json).
import { readFileSync, writeFileSync, existsSync, mkdirSync, rmSync, cpSync } from "node:fs";
import { join, resolve, relative } from "node:path";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { harnessRoot, loadScenario, runDirs, readJson, words } from "./lib.mjs";
import { runChecks, validate } from "./checks.mjs";

const args = process.argv.slice(2);
const option = (name, fallback) => { const i = args.indexOf(`--${name}`); return i >= 0 ? args[i + 1] : fallback; };
const out = resolve(option("out"));
const reference = resolve(option("reference", harnessRoot));
const isSpec = path => /^(specs\/|\.claude\/|\.agents\/|CLAUDE\.md$|AGENTS\.md$)/.test(path);

// Files the agent read: [{ path, from, to }] (lines 1-based, to inclusive; null = whole file).
function readsFromTrace(file, project) {
  const reads = [];
  let usage = null;
  for (const line of readFileSync(file, "utf8").split("\n")) {
    let event;
    try { event = JSON.parse(line); } catch { continue; }
    if (event.type === "assistant") for (const part of event.message?.content ?? []) {
      if (part.type === "tool_use" && part.name === "Read" && part.input?.file_path) {
        const offset = part.input.offset ? Number(part.input.offset) : null;
        const limit = part.input.limit ? Number(part.input.limit) : null;
        reads.push({ path: relative(project, resolve(project, part.input.file_path)), from: offset, to: offset && limit ? offset + limit - 1 : (limit ?? null) });
      }
    }
    if (event.type === "result") usage = {
      tokens: ["input_tokens", "cache_read_input_tokens", "cache_creation_input_tokens", "output_tokens"].reduce((sum, key) => sum + (event.usage?.[key] ?? 0), 0),
      output_tokens: event.usage?.output_tokens ?? null, cost_usd: event.total_cost_usd ?? null, duration_ms: event.duration_ms ?? null
    };
  }
  return { reads, usage, source: "trace" };
}

function readsFromTranscript(file, project) {
  const section = readFileSync(file, "utf8").split(/^## Files read/m)[1]?.split(/^## /m)[0] ?? "";
  const reads = [];
  for (const line of section.split("\n")) {
    const match = line.match(/^\s*\d+\.\s+`?([^\s`(]+)`?\s*\((.*)$/);
    if (!match) continue;
    const range = match[2].match(/lines?\s+(\d+)\s*[–-]\s*(\d+)/);
    const partial = /partial/.test(match[2]) && range;
    reads.push({ path: relative(project, resolve(project, match[1])), from: partial ? Number(range[1]) : null, to: partial ? Number(range[2]) : null });
  }
  return { reads, usage: null, source: "transcript" };
}

function readingLoad(reads, pristine) {
  const seen = new Set();
  let all = 0, specs = 0;
  const files = [];
  for (const item of reads) {
    const key = `${item.path}:${item.from}:${item.to}`;
    const path = join(pristine, item.path);
    if (seen.has(key) || !existsSync(path) || item.path.startsWith("..")) continue;
    seen.add(key);
    const lines = readFileSync(path, "utf8").split("\n");
    const count = words((item.from ? lines.slice(item.from - 1, item.to ?? undefined) : lines).join("\n"));
    all += count;
    if (isSpec(item.path)) { specs += count; files.push(item.path); }
  }
  return { words_all: all, words_specs: specs, spec_files: [...new Set(files)] };
}

function judgePack(dir, run, id) {
  const pack = join(out, "judge-pack", id);
  rmSync(pack, { recursive: true, force: true });
  mkdirSync(pack, { recursive: true });
  for (const file of ["README.md", "journal.md"]) {
    const diff = spawnSync("git", ["diff", "--no-index", join(run.pristine, file), join(run.project, file)], { encoding: "utf8" }).stdout ?? "";
    writeFileSync(join(pack, file.replace(".md", ".diff")), diff.replaceAll(run.pristine, "before").replaceAll(run.project, "after"));
    if (existsSync(join(run.project, file))) cpSync(join(run.project, file), join(pack, file.replace(".md", ".final.md")));
  }
  const transcript = existsSync(join(run.project, "TRANSCRIPT.md")) ? readFileSync(join(run.project, "TRANSCRIPT.md"), "utf8") : "(no transcript)";
  writeFileSync(join(pack, "TRANSCRIPT.md"), transcript
    .replace(/^## Files read[\s\S]*?(?=^## )/m, "## Files read\n(removed for blind evaluation)\n\n")
    .replace(/\.claude\/skills\/[\w./-]*|\.agents\/skills[\w./-]*|references\/[\w.-]+|SKILL\.md|specs\/tasks\/[\w.-]+/g, "[spec file]")
    .replaceAll(run.project, "project").replaceAll(dir, "run"));
  writeFileSync(join(pack, "validate.txt"), run.validation.output);
}

const rows = [];
for (const dir of runDirs(out)) {
  const meta = readJson(join(dir, "meta.json"));
  const scenario = loadScenario(meta.scenario);
  const run = { project: join(dir, "project"), pristine: join(dir, "pristine") };
  if (!existsSync(join(run.project, "TRANSCRIPT.md")) && !existsSync(join(dir, "trace.jsonl"))) { console.log(`skip (not run yet): ${dir}`); continue; }
  run.validation = validate(reference, run.project);
  const results = runChecks(scenario, run);
  const trace = existsSync(join(dir, "trace.jsonl")) ? readsFromTrace(join(dir, "trace.jsonl"), run.project) : null;
  const origin = trace?.reads.length ? trace : existsSync(join(run.project, "TRANSCRIPT.md")) ? readsFromTranscript(join(run.project, "TRANSCRIPT.md"), run.project) : { reads: [], usage: null, source: "none" };
  const load = readingLoad(origin.reads, run.pristine);
  const usage = trace?.usage ?? meta.usage ?? null;
  const id = createHash("sha256").update(dir).digest("hex").slice(0, 8);
  judgePack(dir, run, id);
  const judgeFile = join(out, "judge-results", `${id}.json`);
  const judge = existsSync(judgeFile) ? readJson(judgeFile) : null;
  const row = { dir: relative(out, dir), id, ...meta, checks: results, load, reads_from: origin.source, usage, judge };
  writeFileSync(join(dir, "grade.json"), JSON.stringify(row, null, 1));
  rows.push(row);
}
writeFileSync(join(out, "judge-pack", "RULES.md"), `Rules: ${reference}/specs/tasks/ (task file of the command) and the files it points to; judge questions: ${harnessRoot}/evals/judges/.\n`);
writeFileSync(join(out, "judge-map.json"), JSON.stringify(Object.fromEntries(rows.map(row => [row.id, `${row.scenario}/${row.variant}/${row.rep}`])), null, 1));
writeFileSync(join(out, "report.json"), JSON.stringify(rows, null, 1));

// Report: one table per scenario, one row per variant.
const mean = list => list.length ? Math.round(list.reduce((a, b) => a + b, 0) / list.length) : null;
const span = list => list.length ? `${Math.min(...list)}–${Math.max(...list)}` : "–";
let report = `# Evaluation report\n\nRuns: ${rows.length} · reference (checks, validator): \`${relative(process.cwd(), reference) || "."}\`\n`;
for (const scenarioId of [...new Set(rows.map(row => row.scenario))]) {
  const scenario = loadScenario(scenarioId);
  const group = rows.filter(row => row.scenario === scenarioId);
  const variants = [...new Set(group.map(row => row.variant))];
  report += `\n## ${scenario.id} – ${scenario.title}\n\n| Check | ${variants.join(" | ")} |\n|---|${variants.map(() => "---|").join("")}\n`;
  for (const check of scenario.checks) {
    report += `| ${check.id} | ${variants.map(variant => { const runs = group.filter(row => row.variant === variant); return `${runs.filter(row => row.checks.find(item => item.id === check.id)?.pass).length}/${runs.length}`; }).join(" | ")} |\n`;
  }
  const questions = [...new Set(group.flatMap(row => Object.keys(row.judge ?? {})))];
  for (const question of questions) {
    report += `| judge: ${question} | ${variants.map(variant => {
      const values = group.filter(row => row.variant === variant).map(row => row.judge?.[question]?.value).filter(value => value === true || value === false);
      return values.length ? `${values.filter(Boolean).length}/${values.length}` : "–";
    }).join(" | ")} |\n`;
  }
  const metric = (label, pick) => `| ${label} | ${variants.map(variant => { const values = group.filter(row => row.variant === variant).map(pick).filter(value => typeof value === "number"); return values.length ? `${mean(values)} (${span(values)})` : "–"; }).join(" | ")} |\n`;
  report += `| **all code checks passed** | ${variants.map(variant => { const runs = group.filter(row => row.variant === variant); return `**${runs.filter(row => row.checks.every(item => item.pass)).length}/${runs.length}**`; }).join(" | ")} |\n`;
  report += metric("spec words read", row => row.load.words_specs);
  report += metric("all words read", row => row.load.words_all);
  report += metric("tokens", row => row.usage?.tokens);
  report += metric("duration s", row => row.duration_ms ? Math.round(row.duration_ms / 1000) : row.usage?.duration_ms ? Math.round(row.usage.duration_ms / 1000) : null);
  report += `\nReads measured from: ${[...new Set(group.map(row => row.reads_from))].join(", ")}.\n`;
  const failures = group.flatMap(row => row.checks.filter(item => !item.pass).map(item => `- ${row.variant}/${row.rep} · ${item.id}: ${item.detail}`));
  if (failures.length) report += `\nFailed checks:\n${failures.join("\n")}\n`;
}
writeFileSync(join(out, "report.md"), report);
console.log(report);
console.log(`\nJudge packs: ${join(out, "judge-pack")} – answers go to ${join(out, "judge-results")}/<id>.json, then run grade again.`);
