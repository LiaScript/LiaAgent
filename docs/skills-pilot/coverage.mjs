// Skills pilot: rule coverage. Run from the project root: node docs/skills-pilot/coverage.mjs
// 1. Every protected phrase of specs/check-specs.mjs for the three piloted tasks must stand in its skill,
//    and we report WHERE: in SKILL.md (always read) or in a reference (read when its condition holds).
// 2. Every non-empty line of the old task file must stand in the skill folder (rules moved, none lost);
//    lines that only point to the old task files of the pilot are listed separately.
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const norm = text => text.replace(/\s+/g, " ").trim();
const pilot = { "quick-fix": "lia-quick-fix", "update-dashboard": "lia-update-dashboard", "build-session": "lia-build-session" };

const checkSpecs = readFileSync(join(root, "specs/check-specs.mjs"), "utf8");
const required = task => {
  const line = checkSpecs.split("\n").find(l => l.startsWith(`  "tasks/${task}.md": [`));
  return JSON.parse(line.slice(line.indexOf("["), line.lastIndexOf("]") + 1));
};

const skillFiles = skill => {
  const dir = join(root, ".claude/skills", skill);
  const files = { "SKILL.md": readFileSync(join(dir, "SKILL.md"), "utf8") };
  for (const f of readdirSync(join(dir, "references"))) files[`references/${f}`] = readFileSync(join(dir, "references", f), "utf8");
  return files;
};

let missingTotal = 0;
const summary = [];
for (const [task, skill] of Object.entries(pilot)) {
  const files = skillFiles(skill);
  const where = {};
  const missing = [];
  for (const phrase of required(task)) {
    const hit = Object.entries(files).find(([, text]) => norm(text).includes(norm(phrase)));
    if (hit) (where[hit[0]] ??= []).push(phrase); else missing.push(phrase);
  }
  const all = norm(Object.values(files).join("\n"));
  const oldLines = readFileSync(join(root, "specs/tasks", `${task}.md`), "utf8").split("\n").map(norm).filter(Boolean);
  const lost = oldLines.filter(l => !all.includes(l));
  missingTotal += missing.length;
  const total = required(task).length;
  const inCore = (where["SKILL.md"] ?? []).length;
  summary.push({ task, skill, protected: total, inCore, inReferences: total - inCore - missing.length, missing: missing.length,
    oldLines: oldLines.length, linesKept: oldLines.length - lost.length });
  console.log(`\n== ${task} → ${skill}`);
  console.log(`protected phrases: ${total} · in SKILL.md ${inCore} · in references ${total - inCore - missing.length} · missing ${missing.length}`);
  for (const [file, list] of Object.entries(where)) if (file !== "SKILL.md") console.log(`  ${file}: ${list.length}`);
  for (const phrase of missing) console.log(`  MISSING: ${phrase}`);
  console.log(`old task lines kept verbatim: ${oldLines.length - lost.length} of ${oldLines.length}`);
  for (const l of lost) console.log(`  changed: ${l.slice(0, 150)}`);
}
console.log("\n" + JSON.stringify(summary));
process.exit(missingTotal ? 1 : 0);
