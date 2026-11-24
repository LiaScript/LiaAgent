// Code checks of the evaluation harness: deterministic, one failure mode each (evals/README.md).
// Every check gets the scenario's parameters and the run's files; it returns { pass, detail }.
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const read = path => existsSync(path) ? readFileSync(path, "utf8") : "";

// The journal validator of the reference checkout (the harness), so that every variant is measured
// with the same yardstick; it runs inside the run's project folder.
export function validate(reference, project) {
  const run = spawnSync(process.execPath, [join(reference, "specs/dashboard/validate-journal.mjs"), "journal.md"], { cwd: project, encoding: "utf8" });
  return { status: run.status, output: (run.stdout ?? "") + (run.stderr ?? "") };
}

// Slide titles of a LiaScript document by line (#, ##, ### start a slide).
function slidesByLine(text) {
  let title = "(header)";
  return text.split("\n").map(line => {
    const heading = line.match(/^#{1,3}\s+(.+?)\s*$/);
    if (heading) title = heading[1];
    return title;
  });
}

// Changed line numbers of the new file (deletions count at their position).
function changedLines(oldFile, newFile) {
  const diff = spawnSync("git", ["diff", "--no-index", "--unified=0", oldFile, newFile], { encoding: "utf8" }).stdout ?? "";
  return [...diff.matchAll(/^@@ -\d+(?:,\d+)? \+(\d+)(?:,(\d+))? @@/gm)].flatMap(match => {
    const start = Number(match[1]);
    const count = match[2] === undefined ? 1 : Number(match[2]);
    return count === 0 ? [Math.max(start, 1)] : Array.from({ length: count }, (_, index) => start + index);
  });
}

function slideText(text, title) {
  const lines = text.split("\n");
  const start = lines.findIndex(line => new RegExp(`^#{1,3}\\s+${title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*$`).test(line));
  if (start < 0) return null;
  const end = lines.findIndex((line, index) => index > start && /^#{1,3}\s/.test(line));
  return lines.slice(start, end < 0 ? undefined : end).join("\n");
}

const outcomeOf = journal => journal.match(/\*\*(?:Ergebnis|Outcome|Result):\*\*\s*([^\n]+)/)?.[1] ?? "";
const recheckOpen = outcome => /kurze Nachprüfung offen|short re-check open/i.test(outcome);

export const checks = {
  "validator-ok": (params, run) => ({ pass: run.validation.status === 0, detail: `exit ${run.validation.status}` }),

  "no-warning": (params, run) => {
    const hits = params.patterns.filter(pattern => run.validation.output.includes(pattern));
    return { pass: hits.length === 0, detail: hits.length ? `warnings: ${hits.join(" | ")}` : "none" };
  },

  "material-scope": (params, run) => {
    const lines = changedLines(join(run.pristine, "README.md"), join(run.project, "README.md"));
    const slides = slidesByLine(read(join(run.project, "README.md")));
    const touched = [...new Set(lines.map(n => slides[n - 1] ?? "(end)"))];
    const outside = touched.filter(title => !params.slides.includes(title));
    return { pass: lines.length > 0 && outside.length === 0, detail: lines.length ? `changed: ${touched.join(" · ")}` : "material unchanged" };
  },

  "quiz-balanced": (params, run) => {
    const slide = slideText(read(join(run.project, "README.md")), params.slide);
    if (!slide) return { pass: false, detail: "slide not found" };
    const options = [...slide.matchAll(/^\s*-\s*\[\((X|x| )\)\]\s*(.+)$/gm)].map(match => ({
      correct: match[1] !== " ",
      text: match[2].replace(/\{\|>[^}]*\}\{([^}]*)\}/g, "$1").replace(/\s+/g, " ").trim()
    }));
    const correct = options.find(item => item.correct);
    const others = options.filter(item => !item.correct).map(item => item.text.length);
    if (!correct || !others.length) return { pass: false, detail: "no single-choice options found" };
    const ratio = correct.text.length / Math.max(...others);
    return { pass: ratio <= params.maxRatio, detail: `correct ${correct.text.length} chars, longest other ${Math.max(...others)} (ratio ${ratio.toFixed(2)})` };
  },

  "material-has": (params, run) => ({ pass: new RegExp(params.pattern, "u").test(read(join(run.project, "README.md"))), detail: params.pattern }),
  "material-lacks": (params, run) => ({ pass: !new RegExp(params.pattern, "u").test(read(join(run.project, "README.md"))), detail: params.pattern }),
  "journal-has": (params, run) => ({ pass: new RegExp(params.pattern, "u").test(read(join(run.project, "journal.md"))), detail: params.pattern }),

  // After a change the report shows the open short re-check, or the mini-check was the re-check ("re-checked").
  "recheck-state": (params, run) => {
    const journal = read(join(run.project, "journal.md"));
    const outcome = outcomeOf(journal);
    const done = /nachgeprüft|re-checked/i.test(journal);
    return { pass: recheckOpen(outcome) || done, detail: outcome.slice(0, 120) };
  },

  "approvals": (params, run) => {
    const count = (read(join(run.project, "journal.md")).match(/^- \*\*[\d.-]+:\*\*\s*(?:Material freigegeben|material approved)/gim) ?? []).length;
    return { pass: count === params.count, detail: `${count} approval line(s)` };
  },

  // An open short re-check must not leave the course summary at PASS (publishing gate).
  "summary-blocked": (params, run) => {
    const journal = read(join(run.project, "journal.md"));
    if (!recheckOpen(outcomeOf(journal))) return { pass: true, detail: "no open re-check" };
    const summary = journal.split(/^### Latest Validation Summary[^\n]*\n/m)[1] ?? "";
    const result = summary.match(/\bResult:\s*(PASS with concerns|PASS|FAIL)/)?.[1] ?? "missing";
    return { pass: result !== "PASS", detail: `summary Result: ${result}` };
  }
};

export function runChecks(scenario, run) {
  return scenario.checks.map(check => {
    const fn = checks[check.id];
    if (!fn) return { id: check.id, pass: false, detail: "unknown check" };
    try { return { id: check.id, ...fn(check, run) }; }
    catch (error) { return { id: check.id, pass: false, detail: `error: ${error.message}` }; }
  });
}
