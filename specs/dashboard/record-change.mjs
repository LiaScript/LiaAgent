#!/usr/bin/env node
// Records a change made after a unit's check in one journal write (experiment E1, evals/experiments):
// the dated line under "Changed after the check", the outcome suffix "– {n} point(s) changed since – short
// re-check open", "usable with learners now" with that limit, Done ❌ in the technical table, the short
// re-check as recommended action and – on a light track with one unit – the course summary. With
// --rechecked the mini-check was the short re-check: only the dated line, ending "· re-checked: {how}".
//
// Run from the course project root:
//   node specs/dashboard/record-change.mjs <unit> --page "<page title>" --change "<what changed>" --checked "<how it was checked>" [--rechecked] [--date <date>]
// Prints every line it changed; then run node specs/dashboard/write-dashboard.mjs (tasks/update-dashboard.md).
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { readJournal, loadPacks, englishTerms } from "./journal-model.mjs";
import { localTime } from "./now.mjs";
import { countWrite } from "./write-count.mjs";

const fill = (term, values) => String(term).replace(/\{(\w+)\}/g, (match, key) => values[key] ?? match);
// "{n} Punkt(e)" → "1 Punkt" / "2 Punkte"; "point(s)" → "point" / "points".
const plural = (text, n) => text.replace(/(\p{L}+)\((\p{L}+)\)/gu, (_, word, ending) => n === 1 ? word : word + ending);

export function recordChange(source, { unit, page, change, checked, rechecked = false, date, isoDate, terms, unitWord, track }) {
  const lines = source.split("\n");
  const changes = [];
  const set = (index, text, why) => { if (lines[index] !== text) { changes.push({ line: index + 1, from: lines[index], to: text, why }); lines[index] = text; } };

  // The unit entry and its check report.
  const head = lines.findIndex(line => new RegExp(`^### ${unit}\\. `).test(line));
  if (head < 0) throw new Error(`no unit ${unit} under ## Sessions`);
  const entryEnd = lines.findIndex((line, index) => index > head && /^#{1,3} /.test(line));
  const reportHead = lines.findIndex((line, index) => index > head && (entryEnd < 0 || index < entryEnd) && /^#### /.test(line)
    && lines.slice(index + 1, index + 4).some(next => /data-key="validation-report"/.test(next)));
  if (reportHead < 0) throw new Error(`unit ${unit} has no check report – a change before the check is no change after the check`);
  const reportEnd = (() => { const end = lines.findIndex((line, index) => index > reportHead && (/^#{1,4} /.test(line) || /^<\/section>/.test(line))); return end < 0 ? lines.length : end; })();
  const inReport = predicate => { for (let i = reportHead; i < reportEnd; i++) if (predicate(lines[i])) return i; return -1; };

  // 1. The dated line under "Changed after the check".
  const changedLabel = terms.changedAfterCheck ?? englishTerms.changedAfterCheck;
  const dated = `- ${date} · ${page} · ${change} · ${checked}${rechecked ? ` · ${terms.recheckDone ?? englishTerms.recheckDone}: ${checked}` : ""}`;
  let block = inReport(line => line.startsWith(`**${changedLabel}:**`));
  if (block < 0) {
    // After the "What works" list (the first label-only line), before the next label ("Still missing") or the
    // technical part – the order of templates/session-validation.yaml.
    const labelsOnly = [];
    for (let i = reportHead; i < reportEnd; i++) if (/^\*\*[^*]+:\*\*\s*$/.test(lines[i])) labelsOnly.push(i);
    const details = inReport(line => /^<details>/.test(line));
    const at = [labelsOnly[1], details].filter(index => index > reportHead).sort((a, b) => a - b)[0] ?? reportEnd;
    lines.splice(at, 0, `**${changedLabel}:**`, "", dated, "");
    changes.push({ line: at + 1, from: null, to: `**${changedLabel}:** + ${dated}`, why: "dated line of the change" });
    return finish();
  }
  let last = block + 1;
  while (last + 1 < lines.length && (lines[last + 1].startsWith("- ") || !lines[last + 1].trim()) && !/^\*\*/.test(lines[last + 1])) last++;
  while (!lines[last].trim()) last--;
  lines.splice(last + 1, 0, dated);
  changes.push({ line: last + 2, from: null, to: dated, why: "dated line of the change" });
  return finish();

  function finish() {
    if (rechecked) return { text: lines.join("\n"), changes };
    // Recompute the report bounds after the insertion.
    const end = (() => { const e = lines.findIndex((line, index) => index > reportHead && (/^#{1,4} /.test(line) || /^<\/section>/.test(line))); return e < 0 ? lines.length : e; })();
    const find = predicate => { for (let i = reportHead; i < end; i++) if (predicate(lines[i])) return i; return -1; };
    const count = (() => {
      const label = find(line => line.startsWith(`**${changedLabel}:**`));
      // The list right below the label: blank lines before it, then "- " lines; anything else ends it.
      let n = 0, i = label + 1;
      while (i < end && !lines[i].trim()) i++;
      for (; i < end && lines[i].startsWith("- "); i++) if (!lines[i].includes(`${terms.recheckDone ?? englishTerms.recheckDone}:`)) n++;
      return n;
    })();
    const suffix = plural(fill(terms.recheckShort ?? englishTerms.recheckShort, { n: count }), count);
    const tail = String(terms.recheckShort ?? englishTerms.recheckShort).split(" – ").at(-1);

    // 2. The outcome line keeps its words and gets the suffix (an older suffix is replaced).
    const outcome = find(line => /^\*\*(Ergebnis|Outcome|Result|Resultado|Résultat):\*\*/.test(line));
    if (outcome >= 0) set(outcome, `${lines[outcome].split(" – ").filter(part => !part.includes(tail) && !/^\d+ \p{L}/u.test(part)).join(" – ")} – ${suffix}`, "outcome: short re-check open");

    // 3. Usable with learners now: yes → yes, with limits: short re-check open.
    const usableLabel = terms.usableNow ?? englishTerms.usableNow;
    const usable = find(line => line.startsWith(`**${usableLabel}:**`) || /^\*\*Usable with learners now:\*\*/i.test(line));
    if (usable >= 0) {
      const value = lines[usable].replace(/^\*\*[^*]+:\*\*\s*/, "");
      const yes = String(terms.usableYes ?? englishTerms.usableYes).toLowerCase();
      const limited = fill(terms.usableLimited ?? englishTerms.usableLimited, { what: tail });
      if (value.trim().toLowerCase() === yes) set(usable, lines[usable].replace(value, limited), "usable: limited until the re-check");
      else if (!value.includes(tail) && value.toLowerCase().startsWith(String(terms.usableLimited ?? englishTerms.usableLimited).split(/[:{]/)[0].toLowerCase())) set(usable, `${lines[usable]}; ${tail}`, "usable: the re-check added to the limits");
    }

    // 4. The short re-check as recommended action (a "none" line goes).
    const action = `${terms.recheckAction ?? englishTerms.recheckAction}: \`:validate-course ${unit}\``;
    const actions = find(line => /^\s*(\*\*|__)(Recommended Actions|Empfohlene Schritte)[^*_]*(\*\*|__)\s*:?\s*$/i.test(line));
    if (actions >= 0 && !lines.slice(actions, end).some(line => line.includes(`:validate-course ${unit}`))) {
      let first = actions + 1;
      while (first < end && !lines[first].trim()) first++;
      if (/^\s*\d+[.)]\s+(?:[—–-]+|keine?|nichts|none|nothing|n\/a)\.?\s*$/iu.test(lines[first])) set(first, `1. ${action}`, "recommended action: the short re-check");
      else { lines.splice(first, 0, `1. ${action}`); changes.push({ line: first + 1, from: null, to: `1. ${action}`, why: "recommended action: the short re-check" }); }
    }

    // 5. Done ❌ in the technical table of ## Sessions until the re-check.
    const row = lines.findIndex(line => new RegExp(`^\\|\\s*${unit}\\s*\\|`).test(line));
    const header = row > 0 ? lines.slice(0, row).reverse().find(line => /^\|.*\bDone\b.*\|/.test(line)) : null;
    if (row >= 0 && header) {
      const column = header.split("|").map(cell => cell.trim()).indexOf("Done");
      const cells = lines[row].split("|");
      if (cells[column]?.includes("✅")) { cells[column] = cells[column].replace("✅", "❌"); set(row, cells.join("|"), "Done ❌ until the re-check"); }
    }

    // 6. Light track, one unit: the course summary follows unit 1's report (tasks/validate-course.md → One unit, one run).
    if (["mini", "convert"].includes(track)) {
      const summaryHead = lines.findIndex(line => /^### Latest Validation Summary/.test(line));
      const summaryEnd = summaryHead < 0 ? -1 : (() => { const e = lines.findIndex((line, index) => index > summaryHead && /^#{1,3} |^---\s*$/.test(line)); return e < 0 ? lines.length : e; })();
      if (summaryHead >= 0) for (let i = summaryHead; i < summaryEnd; i++) {
        if (/^\s*-\s*Result:\s*PASS\s*$/.test(lines[i])) set(i, lines[i].replace(/PASS\s*$/, "PASS with concerns"), "course summary: an open short re-check blocks publishing");
        if (/^\s*-\s*Date:\s*\d{4}-\d{2}-\d{2}/.test(lines[i])) set(i, lines[i].replace(/\d{4}-\d{2}-\d{2}/, isoDate), "course summary: date");
        const visible = lines[i].match(/^\*\*([^*]+):\*\*\s*(.+?)(\s*\([^)]*\))?\s*$/);
        if (visible && /Ergebnis|Outcome/i.test(visible[1])) set(i, `**${visible[1]}:** ${fill(terms.courseRecheckOpen ?? englishTerms.courseRecheckOpen, { unit: unitWord, n: unit })} (${date})`, "course summary: not ready to publish yet");
      }
    }
    return { text: lines.join("\n"), changes };
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const option = name => { const i = args.indexOf(`--${name}`); return i >= 0 ? args[i + 1] : undefined; };
  const unit = Number(args[0]);
  const page = option("page"), change = option("change"), checked = option("checked");
  if (!unit || !page || !change || !checked) {
    console.error('usage: node specs/dashboard/record-change.mjs <unit> --page "<page title>" --change "<what changed>" --checked "<how it was checked>" [--rechecked] [--date <date>] [--iso-date <YYYY-MM-DD>]');
    process.exit(2);
  }
  const file = resolve("journal.md");
  if (!existsSync(file)) { console.error("no journal.md – run from the course project root"); process.exit(2); }
  const source = readFileSync(file, "utf8");
  const journal = readJournal(source, { projectDir: dirname(file), packs: loadPacks() });
  // A given --date also sets the ISO date of the course summary, so the two never disagree.
  const isoFrom = text => {
    const de = text?.match(/^(\d{1,2})\.\s?(\d{1,2})\.\s?(\d{4})$/);
    if (de) return `${de[3]}-${de[2].padStart(2, "0")}-${de[1].padStart(2, "0")}`;
    const us = text?.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (us) return `${us[3]}-${us[1].padStart(2, "0")}-${us[2].padStart(2, "0")}`;
    return /^\d{4}-\d{2}-\d{2}$/.test(text ?? "") ? text : null;
  };
  const isoDate = option("iso-date") ?? isoFrom(option("date")) ?? localTime(new Date(), "Europe/Berlin").text.split(" ")[1];
  const [y, m, d] = isoDate.split("-");
  const date = option("date") ?? (journal.language === "de" ? `${d}.${m}.${y}` : isoDate);
  try {
    const { text, changes } = recordChange(source, { unit, page, change, checked, rechecked: args.includes("--rechecked"), date, isoDate, terms: journal.terms, unitWord: journal.terminology ?? "unit", track: journal.track });
    writeFileSync(file, text);
    countWrite(dirname(file), "record-change.mjs", "journal.md");
    console.log(`Recorded the change after the check of unit ${unit} in one write (${changes.length} line${changes.length === 1 ? "" : "s"}):`);
    changes.forEach(item => console.log(`- line ${item.line}: ${item.why}${item.from ? `\n    was: ${item.from}` : ""}\n    now: ${item.to}`));
    console.log("Next: node specs/dashboard/write-dashboard.mjs (the overview follows the report).");
  } catch (error) {
    console.error(`record-change: ${error.message}`);
    process.exit(2);
  }
}
