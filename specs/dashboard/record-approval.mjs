// E19: records the approval the instructor gave ("Approve" in the approval form) in one write – the counterpart of
// record-change.mjs. It never decides anything itself: it writes down the instructor's answer, quoted in --instructor-said.
// tasks/quick-fix.md → Approval after a review; tasks/coauthor-materials.md step 7.
//   - the dated line "- **{date}:** Material freigegeben" / "material approved" goes into the unit's decisions
//     (the list is created after the unit summary when the unit has none)
//   - every derived field of the overview is set as write-dashboard.mjs would set it (approved, states, actions)
//   - light track: the lines of the course summary that name the unit are listed – change them in the same turn
//     if they still say the approval is open
// Refuses a unit that is already approved.
//
//   node specs/dashboard/record-approval.mjs <unit> --instructor-said "<the instructor's answer>" [--date <date>]
import { readFileSync, writeFileSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { readJournal, loadPacks } from "./journal-model.mjs";
import { localTime } from "./now.mjs";
import { countWrite } from "./write-count.mjs";
import { deriveForJournal, patchJournal } from "./derive-dashboard.mjs";

const words = language => language === "de"
  ? { label: "Entscheidungen", approved: "Material freigegeben" }
  : { label: "Decisions", approved: "material approved" };
const approvedWord = /(?<!\b(?:nicht|noch nicht|not|not yet)\s)\b(freigegeben|approved)\b/i;

export function approve(source, { unit, date, language }) {
  const w = words(language);
  const lines = source.split("\n");
  const head = lines.findIndex(line => new RegExp(`^### ${unit}\\. `).test(line));
  if (head < 0) throw new Error(`no unit ${unit} under ## Sessions`);
  const next = lines.findIndex((line, index) => index > head && /^#{1,3} /.test(line));
  const end = next < 0 ? lines.length : next;
  const report = lines.findIndex((line, index) => index > head && index < end && /^#### /.test(line));
  const ownEnd = report < 0 ? end : report;
  const own = lines.slice(head, ownEnd).join("\n").replace(/<!--[\s\S]*?-->/g, "");
  const marker = lines.findIndex((line, index) => index > head && index < ownEnd && /data-key="decisions"/.test(line));
  if (marker >= 0 && approvedWord.test(lines.slice(marker, ownEnd).join("\n"))) throw new Error(`unit ${unit} is already approved – nothing to write`);
  const entry = `- **${date}:** ${w.approved}`;
  if (marker >= 0) {
    let last = marker;
    for (let i = marker + 1; i < ownEnd; i++) if (/^- \*\*/.test(lines[i])) last = i; else if (last > marker && lines[i].trim() && !/^\s/.test(lines[i])) break;
    const at = last > marker ? last + 1 : marker + 3;
    lines.splice(at, 0, entry);
    return { text: lines.join("\n"), line: at + 1, created: false };
  }
  // No decisions list yet: after the unit summary block (or before the report).
  const summary = lines.findIndex((line, index) => index > head && index < ownEnd && /data-key="summary"/.test(line));
  let at = ownEnd;
  if (summary >= 0) { at = summary + 1; while (at < ownEnd && !(lines[at].trim() === "" && lines[at - 1].trim() !== "" && !/^\*\*/.test(lines[at - 1]))) at++; }
  while (at > head + 1 && lines[at - 1].trim() === "" && lines[at - 2]?.trim() === "") at--;
  lines.splice(at, 0, "", `<!-- data-key="decisions" -->`, `**${w.label}:**`, "", entry);
  void own;
  return { text: lines.join("\n"), line: at + 5, created: true };
}

// The course summary lines of a light track that name the unit (for the agent to check).
export function summaryLines(text, { unit, unitWord }) {
  const lines = text.split("\n");
  const head = lines.findIndex(line => /^### Latest Validation Summary/.test(line));
  if (head < 0) return [];
  const out = [];
  for (let i = head + 1; i < lines.length && !/^#{1,3} |^---\s*$/.test(lines[i]); i++)
    if (new RegExp(`\\b${unitWord}\\s+${unit}\\b`, "i").test(lines[i]) && !/^<!--/.test(lines[i])) out.push({ line: i + 1, text: lines[i] });
  return out;
}

export function overviewAfter(text, dir) {
  const block = /```json @Dashboard\.View\n([\s\S]*?)\n```/;
  const raw = text.match(block)?.[1];
  if (!raw) return { text, done: false, why: "no Dashboard block" };
  let data;
  try { data = JSON.parse(raw); } catch { return { text, done: false, why: "Dashboard block is not valid JSON" }; }
  const candidate = resolve(dir, ".cache", "record-approval-candidate.tmp");
  mkdirSync(dirname(candidate), { recursive: true });
  writeFileSync(candidate, text);
  try {
    const derived = deriveForJournal(candidate, data);
    if (derived.missing.length) return { text, done: false, why: "words still to write" };
    const replaced = text.replace(block, () => "```json @Dashboard.View\n" + JSON.stringify(derived.data, null, 2) + "\n```");
    return { text: patchJournal(replaced, derived.journal, derived).source, done: true, fields: derived.changes.length };
  } finally { rmSync(candidate, { force: true }); }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const option = name => { const i = args.indexOf(`--${name}`); return i >= 0 ? args[i + 1] : undefined; };
  const unit = Number(args[0]);
  const said = option("instructor-said");
  if (!unit || !said) { console.error('usage: node specs/dashboard/record-approval.mjs <unit> --instructor-said "<the instructor\'s answer>" [--date <date>] – only after the instructor chose "Approve" in the approval form'); process.exit(2); }
  const file = resolve("journal.md");
  if (!existsSync(file)) { console.error("no journal.md – run from the course project root"); process.exit(2); }
  const source = readFileSync(file, "utf8");
  const journal = readJournal(source, { projectDir: dirname(file), packs: loadPacks() });
  const given = option("date");
  const de = given?.match(/^(\d{1,2})\.\s?(\d{1,2})\.\s?(\d{4})$/);
  const isoDate = de ? `${de[3]}-${de[2].padStart(2, "0")}-${de[1].padStart(2, "0")}`
    : /^\d{4}-\d{2}-\d{2}$/.test(given ?? "") ? given
    : localTime(new Date(), "Europe/Berlin").text.split(" ")[1];
  const [y, m, d] = isoDate.split("-");
  const date = journal.language === "de" ? `${d}.${m}.${y}` : isoDate;
  try {
    const result = approve(source, { unit, date, language: journal.language });
    const overview = overviewAfter(result.text, dirname(file));
    writeFileSync(file, overview.text);
    countWrite(dirname(file), "record-approval.mjs", "journal.md");
    const entryLine = overview.text.split("\n").findIndex(line => line === `- **${date}:** ${words(journal.language).approved}`) + 1 || result.line;
    console.log(`Recorded the instructor's approval of unit ${unit} (answer: "${said}") in one write: line ${entryLine} "- **${date}:** ${words(journal.language).approved}"${result.created ? " (new decisions list)" : ""}${overview.done ? `; overview: ${overview.fields} derived field${overview.fields === 1 ? "" : "s"} set` : ""}.`);
    if (!overview.done) console.log(`Overview not written (${overview.why}): run node specs/dashboard/derive-dashboard.mjs --write.`);
    if (["mini", "convert"].includes(journal.track)) {
      const named = summaryLines(overview.text, { unit, unitWord: journal.terminology ?? "unit" });
      if (named.length) {
        console.log("Light track – course summary lines that name this unit (change any that still says the approval is open, in one write):");
        named.forEach(item => console.log(`- line ${item.line}: ${item.text}`));
      }
    }
    const check = spawnSync(process.execPath, [resolve(dirname(fileURLToPath(import.meta.url)), "validate-journal.mjs"), file], { encoding: "utf8" });
    console.log((check.stdout + check.stderr).trim().split("\n").filter(line => /^(- |Warnings|Hints|ERRORS|Exit code)/.test(line)).join("\n"));
  } catch (error) {
    console.error(`record-approval: ${error.message}`);
    process.exit(2);
  }
}
