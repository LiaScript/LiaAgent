// E12: closes a passed short re-check in one write – the counterpart of record-change.mjs.
// Only for a re-check that found nothing new on the changed pages (tasks/validate-course.md → Short re-check);
// with a new finding the report is written as the task says.
//   - every dated line under "Changed after the check" ends " · re-checked: {how}" (the record stays)
//   - the outcome loses " – {n} point(s) changed since – short re-check open", "usable now" its re-check limit
//   - the re-check leaves the recommended actions ("none" when nothing is left), Done ❌ → ✅ without an open ⏳
//   - light track: the course summary is ready to publish again (Result PASS, date)
//   - the overview: the re-check's open point goes, every derived field is set (as write-dashboard.mjs does)
//
//   node specs/dashboard/close-recheck.mjs <unit> --checked "<how it was checked>" [--date <date>]
import { readFileSync, writeFileSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { readJournal, loadPacks, englishTerms } from "./journal-model.mjs";
import { localTime, currentDate } from "./now.mjs";
import { countWrite } from "./write-count.mjs";
import { deriveForJournal, patchJournal } from "./derive-dashboard.mjs";

const fill = (term, values) => String(term).replace(/\{(\w+)\}/g, (match, key) => values[key] ?? match);

export function closeRecheck(source, { unit, checked, date, isoDate, terms, unitWord, track, language }) {
  const t = key => terms[key] ?? englishTerms[key];
  const lines = source.split("\n");
  const changes = [];
  const set = (index, text, why) => { if (lines[index] !== text) { changes.push({ line: index + 1, from: lines[index], to: text, why }); lines[index] = text; } };
  const head = lines.findIndex(line => new RegExp(`^### ${unit}\\. `).test(line));
  if (head < 0) throw new Error(`no unit ${unit} under ## Sessions`);
  const entryEnd = lines.findIndex((line, index) => index > head && /^#{1,3} /.test(line));
  const reportHead = lines.findIndex((line, index) => index > head && (entryEnd < 0 || index < entryEnd) && /^#### /.test(line)
    && lines.slice(index + 1, index + 4).some(next => /data-key="validation-report"/.test(next)));
  if (reportHead < 0) throw new Error(`unit ${unit} has no check report`);
  const end = (() => { const e = lines.findIndex((line, index) => index > reportHead && (/^#{1,4} /.test(line) || /^<\/section>/.test(line))); return e < 0 ? lines.length : e; })();
  const find = predicate => { for (let i = reportHead; i < end; i++) if (predicate(lines[i])) return i; return -1; };
  const tail = String(t("recheckShort")).split(" – ").at(-1);

  const outcome = find(line => /^\*\*(Ergebnis|Outcome|Result|Resultado|Résultat):\*\*/.test(line));
  if (outcome < 0 || !lines[outcome].includes(tail)) throw new Error(`unit ${unit}: the report's outcome has no open short re-check – nothing to close`);

  // 1. Dated lines: each marked re-checked.
  const label = find(line => line.startsWith(`**${t("changedAfterCheck")}:**`));
  if (label >= 0) {
    let i = label + 1;
    while (i < end && !lines[i].trim()) i++;
    for (; i < end && lines[i].startsWith("- "); i++)
      if (!new RegExp(`·\\s*${t("recheckDone")}\\b`, "i").test(lines[i])) set(i, `${lines[i]} · ${t("recheckDone")}: ${checked}`, "dated line: re-checked");
  }
  // 2. Outcome without the re-check suffix.
  set(outcome, lines[outcome].split(" – ").filter(part => !part.includes(tail) && !/^\d+ \p{L}/u.test(part)).join(" – "), "outcome: short re-check done");
  // 3. Usable now without the re-check limit.
  const usable = find(line => line.startsWith(`**${t("usableNow")}:**`) || /^\*\*Usable with learners now:\*\*/i.test(line));
  if (usable >= 0) {
    const value = lines[usable].replace(/^\*\*[^*]+:\*\*\s*/, "");
    const limited = fill(t("usableLimited"), { what: tail });
    if (value.trim() === limited) set(usable, lines[usable].replace(value, t("usableYes")), "usable: no limit left");
    else if (value.includes(`; ${tail}`)) set(usable, lines[usable].replace(`; ${tail}`, ""), "usable: the re-check limit removed");
  }
  // 4. The re-check leaves the recommended actions.
  const actions = find(line => /^\s*(\*\*|__)(Recommended Actions|Empfohlene Schritte)[^*_]*(\*\*|__)\s*:?\s*$/i.test(line));
  if (actions >= 0) {
    const items = [];
    for (let i = actions + 1; i < end; i++) { if (!lines[i].trim()) { if (items.length) break; continue; } if (/^\s*\d+[.)]\s/.test(lines[i])) items.push(i); else break; }
    const keep = items.filter(i => !lines[i].includes(`:validate-course ${unit}`));
    if (keep.length < items.length) {
      const texts = keep.map(i => lines[i].replace(/^\s*\d+[.)]\s+/, ""));
      const none = language === "de" ? "Keine." : "None.";
      const fresh = (texts.length ? texts : [none]).map((text, n) => `${n + 1}. ${text}`);
      changes.push({ line: items[0] + 1, from: items.map(i => lines[i]).join(" | "), to: fresh.join(" | "), why: "recommended actions: the short re-check done" });
      lines.splice(items[0], items.at(-1) - items[0] + 1, ...fresh);
    }
  }
  // 5. Done ✅ when no ⏳ item is open in the report.
  const report = lines.slice(reportHead, end).join("\n");
  const row = lines.findIndex(line => new RegExp(`^\\|\\s*${unit}\\s*\\|`).test(line));
  const header = row > 0 ? lines.slice(0, row).reverse().find(line => /^\|.*\bDone\b.*\|/.test(line)) : null;
  if (row >= 0 && header && !report.includes("⏳")) {
    const column = header.split("|").map(cell => cell.trim()).indexOf("Done");
    const cells = lines[row].split("|");
    if (cells[column]?.includes("❌")) { cells[column] = cells[column].replace("❌", "✅"); set(row, cells.join("|"), "Done ✅ after the re-check"); }
  }
  // 6. Light track: the course summary is ready again when it has no other open point.
  if (["mini", "convert"].includes(track)) {
    const summaryHead = lines.findIndex(line => /^### Latest Validation Summary/.test(line));
    const summaryEnd = summaryHead < 0 ? -1 : (() => { const e = lines.findIndex((line, index) => index > summaryHead && /^#{1,3} |^---\s*$/.test(line)); return e < 0 ? lines.length : e; })();
    const summary = summaryHead < 0 ? "" : lines.slice(summaryHead, summaryEnd).join("\n");
    const clean = /Issues found:\s*0\b/.test(summary) && /Mechanical open:\s*0\b/.test(summary);
    const open = fill(t("courseRecheckOpen"), { unit: unitWord, n: unit });
    if (summaryHead >= 0) for (let i = summaryHead; i < summaryEnd; i++) {
      if (clean && /^\s*-\s*Result:\s*PASS with concerns\s*$/.test(lines[i])) set(i, lines[i].replace(/PASS with concerns\s*$/, "PASS"), "course summary: nothing open");
      if (/^\s*-\s*Date:\s*\d{4}-\d{2}-\d{2}/.test(lines[i])) set(i, lines[i].replace(/\d{4}-\d{2}-\d{2}/, isoDate), "course summary: date");
      const visible = lines[i].match(/^\*\*([^*]+):\*\*\s*(.+?)(\s*\([^)]*\))?\s*$/);
      if (clean && visible && visible[2].trim() === open) set(i, `**${visible[1]}:** ${t("courseReady")} (${date})`, "course summary: ready to publish");
    }
  }
  return { text: lines.join("\n"), changes };
}

// The overview: the re-check's open point goes, the derived fields follow the new journal.
export function overviewAfter(text, { unit, terms, dir }) {
  const block = /```json @Dashboard\.View\n([\s\S]*?)\n```/;
  const raw = text.match(block)?.[1];
  if (!raw) return { text, done: false, why: "no Dashboard block" };
  let data;
  try { data = JSON.parse(raw); } catch { return { text, done: false, why: "Dashboard block is not valid JSON" }; }
  const action = terms.recheckAction ?? englishTerms.recheckAction;
  const before = Array.isArray(data.decisions) ? data.decisions : [];
  data.decisions = before.filter(item => !(item?.source?.check === unit && /re-?check|nachprüf/i.test(`${item.key ?? ""} ${item.title ?? ""}`) || (item?.title ?? "").includes(action)));
  const removed = before.length - data.decisions.length;
  const candidate = resolve(dir, ".cache", "close-recheck-candidate.tmp");
  mkdirSync(dirname(candidate), { recursive: true });
  writeFileSync(candidate, text);
  try {
    const derived = deriveForJournal(candidate, data);
    if (derived.missing.length) return { text, done: false, why: "words still to write" };
    const replaced = text.replace(block, () => "```json @Dashboard.View\n" + JSON.stringify(derived.data, null, 2) + "\n```");
    return { text: patchJournal(replaced, derived.journal, derived).source, done: true, removed, fields: derived.changes.length };
  } finally { rmSync(candidate, { force: true }); }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const option = name => { const i = args.indexOf(`--${name}`); return i >= 0 ? args[i + 1] : undefined; };
  const unit = Number(args[0]);
  const checked = option("checked");
  if (!unit || !checked) {
    console.error('usage: node specs/dashboard/close-recheck.mjs <unit> --checked "<how it was checked>" [--date <date>]');
    process.exit(2);
  }
  const file = resolve("journal.md");
  if (!existsSync(file)) { console.error("no journal.md – run from the course project root"); process.exit(2); }
  const source = readFileSync(file, "utf8");
  const journal = readJournal(source, { projectDir: dirname(file), packs: loadPacks() });
  // --date in any of the journal's forms (24.11.2026, 11/24/2026, 2026-11-24); the visible date in the
  // course language's form, the ISO date for the technical part – the two never disagree.
  const given = option("date");
  const de = given?.match(/^(\d{1,2})\.\s?(\d{1,2})\.\s?(\d{4})$/);
  const us = given?.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  const isoDate = de ? `${de[3]}-${de[2].padStart(2, "0")}-${de[1].padStart(2, "0")}`
    : us ? `${us[3]}-${us[1].padStart(2, "0")}-${us[2].padStart(2, "0")}`
    : /^\d{4}-\d{2}-\d{2}$/.test(given ?? "") ? given
    : localTime(currentDate(), "Europe/Berlin").text.split(" ")[1];
  const [y, m, d] = isoDate.split("-");
  const date = journal.language === "de" ? `${d}.${m}.${y}` : isoDate;
  try {
    const terms = journal.terms ?? {};
    const { text, changes } = closeRecheck(source, { unit, checked, date, isoDate, terms, unitWord: journal.terminology ?? "unit", track: journal.track, language: journal.language });
    const overview = overviewAfter(text, { unit, terms, dir: dirname(file) });
    writeFileSync(file, overview.text);
    countWrite(dirname(file), "close-recheck.mjs", "journal.md");
    console.log(`Closed the short re-check of unit ${unit} in one write (${changes.length} change${changes.length === 1 ? "" : "s"}${overview.done ? " and the overview" : ""}):`);
    changes.forEach(item => console.log(`- line ${item.line}: ${item.why}${item.from ? `\n    was: ${item.from}` : ""}\n    now: ${item.to}`));
    if (overview.done) console.log(`- overview: ${overview.removed ? `${overview.removed} re-check point removed, ` : ""}${overview.fields} derived field${overview.fields === 1 ? "" : "s"} set`);
    else console.log(`Overview not written (${overview.why}): run node specs/dashboard/derive-dashboard.mjs --write.`);
    const check = spawnSync(process.execPath, [resolve(dirname(fileURLToPath(import.meta.url)), "validate-journal.mjs"), file], { encoding: "utf8" });
    console.log((check.stdout + check.stderr).trim().split("\n").filter(line => /^(- |Warnings|Hints|ERRORS|Exit code)/.test(line)).join("\n"));
  } catch (error) {
    console.error(`close-recheck: ${error.message}`);
    process.exit(2);
  }
}
