// E10b: adds one open point ("decide") for a finding outside a change, with the overview, in one write.
// tasks/quick-fix.md → Findings outside the change; tasks/validate-course.md → Short re-check.
// The point: key finding-{unit}-{topic}, `how` with the page title, the finding in plain words and the
// offer of `:quick-fix {unit}`; a link and a command when --fix is given. Every derived field of the
// overview is set as write-dashboard.mjs would set it. A point with the same key is replaced, never doubled.
//
//   node specs/dashboard/add-point.mjs <unit> --topic <slug> --title "<short title>" --page "<page title>"
//        --finding "<the finding in plain words>" [--why "<why it matters>"] [--fix "<quick-fix description>"]
//        [--label "<button label>"]
import { readFileSync, writeFileSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { readJournal, loadPacks } from "./journal-model.mjs";
import { countWrite } from "./write-count.mjs";
import { deriveForJournal, patchJournal } from "./derive-dashboard.mjs";

const slug = text => String(text).toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/ß/g, "ss")
  .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40);

// The point itself, in the course language where the pack has no word (German or English).
export function findingPoint({ unit, topic, title, page, finding, why, fix, label, language = "en" }) {
  const de = language === "de";
  const quote = text => de ? `„${text}“` : `"${text}"`;
  const decideText = fix
    ? (de ? `Entscheiden Sie, ob ich das mit \`:quick-fix ${unit}\` behebe oder ob es so bleibt.` : `Decide whether I fix it with \`:quick-fix ${unit}\` or leave it as it is.`)
    : (de ? `Entscheiden Sie, ob es so bleibt.` : `Decide whether it stays as it is.`);
  const item = {
    key: `finding-${unit}-${slug(topic)}`,
    kind: "decide",
    title,
    ...(why ? { why } : {}),
    how: `${de ? "Seite" : "Page"} ${quote(page)}: ${finding.replace(/\s*$/, "")}${/[.!?]$/.test(finding.trim()) ? "" : "."} ${decideText}`,
    icon: "✏️"
  };
  if (fix) {
    item.label = label ?? (de ? "Beheben" : "Fix it");
    item.href = `agent:teaching/quick-fix?number=${unit}&description=${encodeURIComponent(fix)}`;
    item.command = `:quick-fix ${unit} ${fix}`;
  }
  return item;
}

export function addPoint(text, item, dir) {
  const block = /```json @Dashboard\.View\n([\s\S]*?)\n```/;
  const raw = text.match(block)?.[1];
  if (!raw) throw new Error("no Dashboard block");
  const data = JSON.parse(raw);
  data.decisions = Array.isArray(data.decisions) ? data.decisions : [];
  const at = data.decisions.findIndex(old => old?.key === item.key);
  const replaced = at >= 0;
  if (replaced) data.decisions[at] = item; else data.decisions.push(item);
  const candidate = resolve(dir, ".cache", "add-point-candidate.tmp");
  mkdirSync(dirname(candidate), { recursive: true });
  writeFileSync(candidate, text);
  try {
    const derived = deriveForJournal(candidate, data);
    if (derived.missing.length) throw new Error("words still to write – use write-dashboard.mjs (tasks/update-dashboard.md)");
    const next = text.replace(block, () => "```json @Dashboard.View\n" + JSON.stringify(derived.data, null, 2) + "\n```");
    return { text: patchJournal(next, derived.journal, derived).source, replaced, fields: derived.changes.length };
  } finally { rmSync(candidate, { force: true }); }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const option = name => { const i = args.indexOf(`--${name}`); return i >= 0 ? args[i + 1] : undefined; };
  const unit = Number(args[0]);
  const [topic, title, page, finding] = ["topic", "title", "page", "finding"].map(option);
  if (!unit || !topic || !title || !page || !finding) {
    console.error('usage: node specs/dashboard/add-point.mjs <unit> --topic <slug> --title "<short title>" --page "<page title>" --finding "<the finding in plain words>" [--why "…"] [--fix "<quick-fix description>"] [--label "…"]');
    process.exit(2);
  }
  const file = resolve("journal.md");
  if (!existsSync(file)) { console.error("no journal.md – run from the course project root"); process.exit(2); }
  const source = readFileSync(file, "utf8");
  const journal = readJournal(source, { projectDir: dirname(file), packs: loadPacks() });
  try {
    const item = findingPoint({ unit, topic, title, page, finding, why: option("why"), fix: option("fix"), label: option("label"), language: journal.language });
    const result = addPoint(source, item, dirname(file));
    writeFileSync(file, result.text);
    countWrite(dirname(file), "add-point.mjs", "journal.md");
    console.log(`${result.replaced ? "Replaced" : "Added"} the open point ${item.key} (${item.title}) in one write; ${result.fields} derived field${result.fields === 1 ? "" : "s"} set.`);
    const check = spawnSync(process.execPath, [resolve(dirname(fileURLToPath(import.meta.url)), "validate-journal.mjs"), file], { encoding: "utf8" });
    console.log((check.stdout + check.stderr).trim().split("\n").filter(line => /^(- |Warnings|Hints|ERRORS|Exit code)/.test(line)).join("\n"));
  } catch (error) {
    console.error(`add-point: ${error.message}`);
    process.exit(2);
  }
}
