// Module for derive-dashboard.mjs and write-dashboard.mjs (no command of its own).
// Reads the facts of journal.md that the overview is derived from: section headings, the units (agenda rows,
// `### {n}. {title}` subsections, the technical table, the status list), each unit's check report, its image
// entries and whether its material is approved. Pure: it takes the journal text and returns data, so that
// derive-dashboard.mjs (writer) and the tests read the journal the same way.
import { readFileSync, readdirSync } from "node:fs";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));

// Language packs (templates/i18n/*.json): the state words of a course language under `terms`.
export function loadPacks(dir = resolve(here, "..", "templates", "i18n")) {
  try {
    return readdirSync(dir).filter(item => item.endsWith(".json")).map(item => JSON.parse(readFileSync(join(dir, item), "utf8")));
  } catch { return []; }
}

// The English state words (templates/session-validation.yaml → outcome_words); a pack overrides them.
export const englishTerms = {
  skeleton: "planning sketch",
  imageStep: "Insert images",
  passedMissing: "passed – still missing: {what}",
  recheckShort: "{n} point(s) changed since – short re-check open",
  correctionOpen: "correction needed: {open} of {n} points open",
  usableYes: "yes", usableLimited: "yes, with limits: {what}", usableNo: "not yet: {why}"
};

// LiaScript slide anchor: full heading text, lower case, spaces and "-" collapse to one "-", punctuation stays.
export const anchorOf = text => "#" + String(text).trim().toLowerCase().replace(/-/g, " ").split(/\s+/).filter(Boolean).join("-");

const datePattern = /(?:\d{4}-\d{2}-\d{2}|\d{1,2}\.\s?\d{1,2}\.\s?\d{4}|\d{1,2}\/\d{1,2}\/\d{4})/;
const stripComments = text => text.replace(/<!--[\s\S]*?-->/g, "");
// "not approved", "noch nicht freigegeben" … do not count.
const approvedWord = /(?<!\b(?:nicht|noch nicht|not|not yet)\s)\b(freigegeben|approved)\b/i;
// Image statuses (tasks/create-image.md): placed in the material, or still open.
const placedStatuses = ["inserted", "generated"];

export function readJournal(source, { projectDir = ".", packs = loadPacks() } = {}) {
  const language = (source.match(/^language:\s*(\w+)/m)?.[1] ?? "en").slice(0, 2).toLowerCase();
  const pack = packs.find(item => String(item.language ?? "").slice(0, 2).toLowerCase() === language);
  const terms = { ...englishTerms, ...(pack?.terms ?? {}) };

  // ## headings outside code blocks: "## Outline – Gliederung" → key "Outline", suffix "Gliederung".
  const body = source.replace(/^<!--[\s\S]*?-->/, "").replace(/```[\s\S]*?```/g, block => block.replace(/[^\n]/g, " "));
  const headings = [...body.matchAll(/^## (.+?)\s*$/gm)].map(match => {
    const [key, ...rest] = match[1].split(/\s+–\s+/);
    return { key: key.trim(), suffix: rest.join(" – ").trim() || null, text: match[1], anchor: anchorOf(match[1]) };
  });
  const section = key => source.match(new RegExp(`^## ${key}\\b[^\\n]*\\n([\\s\\S]*?)(?=^## |(?![\\s\\S]))`, "m"))?.[1] ?? "";

  const context = section("Course Context");
  // "sessions-called: Lesson", or in older journals "sessions-called: unit (Einheit)": the word in the course language.
  const called = context.match(/sessions-called:\s*([\p{L}\w-]+)(?:\s*\(([^)]+)\))?/u);
  const terminology = called ? (called[2] ?? called[1]).trim() : null;

  const agenda = agendaUnits(section("Agenda"));
  const sessions = section("Sessions");
  const units = readUnits(sessions, terms);

  // Every unit the journal knows: agenda rows, subsections, table rows and status lines.
  const numbers = [...new Set([...agenda.map(row => row.n), ...units.keys()])].sort((a, b) => Number(a) - Number(b));
  const list = numbers.map(n => {
    const unit = units.get(n) ?? emptyUnit(n);
    const agendaRow = agenda.find(row => row.n === n);
    return { ...unit, inAgenda: Boolean(agendaRow), title: unit.heading?.title ?? unit.tableTitle ?? null, agendaTitle: agendaRow?.title ?? null };
  });

  return { language, terms, headings, terminology, hasAgenda: agenda.length > 0, units: list, projectDir };
}

// The units table of ## Agenda (templates/course-agenda.yaml): the table after `<!-- data-type="none" -->`,
// never the technical table in <details>. No. cell as plain digits ("1", "1.", "1\." accepted).
function agendaUnits(agenda) {
  const visible = agenda.replace(/<details>[\s\S]*?<\/details>/g, "");
  const [, marked] = visible.split(/<!--\s*data-type="none"\s*-->/);
  let lines = (marked ? marked.trimStart() : stripComments(visible)).split("\n");
  if (marked) {
    const end = lines.findIndex(line => !/^\s*\|/.test(line));
    if (end !== -1) lines = lines.slice(0, end);
  }
  // The title column: the first header that names a title or topic, else the column after the number.
  const cells = line => line.replace(/^\s*\|/, "").replace(/\|\s*$/, "").split("|").map(cell => cell.trim());
  const header = lines.find(line => /^\s*\|/.test(line));
  const named = header ? cells(header).findIndex(cell => /titel|title|thema|topic/i.test(cell)) : -1;
  const column = named > 0 ? named : 1;
  return lines.filter(line => /^\s*\|\s*\d+\\?\.?\s*\|/.test(line) && !line.includes("{{")).map(line => {
    const row = cells(line);
    // "Title (required)" → "Title"; "**Title.** objective …" → "Title".
    const text = (row[column] ?? "").replace(/^\*\*(.+?)\*\*.*$/, "$1").replace(/[.:]$/, "").replace(/\s*\([^()]*\)$/, "").trim();
    return { n: row[0].match(/\d+/)[0], title: text || null };
  });
}

function emptyUnit(n) {
  return { n, heading: null, tableTitle: null, material: false, done: false, notes: null, statusLine: null, report: null, images: { total: 0, placed: 0, open: 0 }, approved: false };
}

function readUnits(sessions, terms) {
  const units = new Map();
  const unit = n => units.get(n) ?? units.set(n, emptyUnit(n)).get(n);

  // Overview part: everything before the first ### subsection.
  const overview = sessions.split(/^### /m)[0];
  // (1) the status list "{n}. {title} – {status}" (comments and the technical <details> block left out)
  for (const match of stripComments(overview).replace(/<details>[\s\S]*?<\/details>/g, "").matchAll(/^(\d+)\.\s+(.+?)\s*$/gm)) {
    unit(match[1]).statusLine = match[2];
  }
  // (2) the technical table | # | Title | Type | Method | Skeleton | Material | Done | Notes |
  const header = sessions.match(/^\|\s*#\s*\|(.*)\|\s*$/m)?.[1].split("|").map(cell => cell.trim()) ?? [];
  const column = (name, fromEnd) => header.indexOf(name) >= 0 ? header.indexOf(name) : header.length - fromEnd;
  if (header.length >= 6) {
    for (const row of sessions.matchAll(/^\|\s*(\d+)\s*\|(.*)\|\s*$/gm)) {
      const cells = row[2].split("|").map(cell => cell.trim());
      const item = unit(row[1]);
      item.tableTitle = cells[column("Title", header.length)] || null;
      item.material = Boolean(cells[column("Material", 3)]?.includes("✅"));
      item.done = Boolean(cells[column("Done", 2)]?.includes("✅"));
      item.notes = cells[column("Notes", 1)] ?? null;
    }
  }
  // (3) the subsections ### {n}. {title}
  const parts = sessions.split(/^(?=### \d+\.\s)/m).slice(1);
  for (const part of parts) {
    const [, n, title] = part.match(/^### (\d+)\.\s+(.+?)\s*$/m);
    const item = unit(n);
    item.heading = { title, anchor: anchorOf(`${n}. ${title}`) };
    item.report = readReport(part);
    item.images = readImages(part);
    // The skeleton part (summary, decisions …) before the first #### block holds the approval record.
    item.approved = approvedWord.test(stripComments(part.split(/^#### /m)[0]));
  }
  // The status word after the title: "{title} – {status}" (titles may contain dashes themselves).
  for (const item of units.values()) {
    if (!item.statusLine) continue;
    const title = [item.heading?.title, item.tableTitle].find(candidate => candidate && item.statusLine.startsWith(candidate));
    const rest = title ? item.statusLine.slice(title.length) : item.statusLine.replace(/^.*?\s(?=[–-]\s)/, "");
    item.status = rest.match(/^\s*[–-]\s+(.+)$/)?.[1] ?? null;
  }
  return units;
}

// A check report: a #### heading that starts with "Validation Report" (older journals), or any #### heading
// directly followed by <section data-key="validation-report">. Visible part: the outcome line (first bold
// line), the line "usable with learners now" (second bold line); technical part: `__Result:__`.
function readReport(part) {
  const lines = part.split("\n");
  const start = lines.findIndex((line, index) => {
    const heading = line.match(/^#### (.+?)\s*$/);
    const after = lines.slice(index + 1).find(item => item.trim())?.trim() ?? "";
    return heading && (/^Validation Report\b/.test(heading[1]) || /^<section\s+data-key=["']validation-report["']/.test(after));
  });
  if (start < 0) return null;
  const title = lines[start].slice(5).trim();
  const rest = lines.slice(start + 1);
  const end = rest.findIndex(line => /^#{1,4}\s/.test(line));
  const text = (end >= 0 ? rest.slice(0, end) : rest).join("\n");
  const visible = text.split("<details>")[0];
  const bold = visible.split("\n").map(line => line.trim()).filter(line => /^\*\*[^*\n]+:\*\*\s*\S/.test(line))
    .map(line => line.replace(/^\*\*[^*\n]+:\*\*\s*/, ""));
  const outcome = bold[0] ?? "";
  // "… (23.10.2026) – 2 points changed since – short re-check open": the count after the dated outcome.
  const changed = outcome.match(new RegExp(`${datePattern.source}\\)\\s+[–-]\\s+(\\d+)\\s`))?.[1];
  return {
    title,
    anchor: anchorOf(title),
    result: text.match(/__Result:__\s*(PASS with concerns|PASS|FAIL)\b/)?.[1] ?? null,
    outcome,
    usableText: bold[1] ?? null,
    changedSince: changed ? Number(changed) : 0,
    deferred: text.includes("⏳"),
    // The visible ⏳ items ("Still missing"), shortened to what is missing: "6 photos on the reading pages".
    missing: visible.split("\n").map(line => line.match(/^\s*[-*]\s+⏳\s*(.+)$/)?.[1]).filter(Boolean).map(shortItem).filter(Boolean)
  };
}

// "6 photos on „Hello“ (…): nothing found – at the step …" → "6 photos on „Hello“": without parentheses,
// up to the first colon or the first dash outside quotation marks.
function shortItem(text) {
  const plain = text.replace(/\s*\([^()]*\)/g, "").trim();
  let depth = 0;
  for (let index = 0; index < plain.length; index++) {
    const char = plain[index];
    if (char === "„" || char === "“" && depth === 0 || char === "«") depth++;
    else if (char === "“" || char === "”" || char === "»") depth = Math.max(0, depth - 1);
    else if (char === '"') depth = depth ? depth - 1 : 1;
    else if (!depth && (char === ":" || /^\s[–-]\s/.test(plain.slice(index - 1, index + 2)))) return plain.slice(0, char === ":" ? index : index - 1).trim();
  }
  return plain.replace(/[.!?]$/, "");
}

// Image entries (tasks/create-image.md): <section> blocks with `#### {slug}` and `__Status:__`.
function readImages(part) {
  const statuses = [...part.matchAll(/<section(?![^>]*validation-report)\b[^>]*>([\s\S]*?)<\/section>/g)]
    .map(block => block[1].match(/^\s*[*-]\s+__Status:__[ \t]*(\S+)/m)?.[1].toLowerCase()).filter(Boolean);
  const placed = statuses.filter(status => placedStatuses.includes(status)).length;
  return { total: statuses.length, placed, open: statuses.length - placed };
}

// "usable with learners now": its value → yes | limited | no, by the prefixes of the English and pack terms.
export function usableState(text, packs = loadPacks()) {
  const prefix = term => String(term ?? "").split(/[:{]/)[0].trim().toLowerCase();
  const value = String(text ?? "").trim().toLowerCase();
  const prefixes = key => [englishTerms[key], ...packs.map(pack => pack.terms?.[key])].map(prefix).filter(Boolean);
  // "no" and "limited" first: "yes, with limits" also starts with "yes".
  return [["no", "usableNo"], ["limited", "usableLimited"], ["yes", "usableYes"]]
    .find(([, key]) => prefixes(key).some(item => value.startsWith(item)))?.[0] ?? null;
}
