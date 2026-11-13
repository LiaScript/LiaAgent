// Module for derive-dashboard.mjs and write-dashboard.mjs (no command of its own).
// Reads the facts of journal.md that the overview is derived from: section headings, the units (agenda rows,
// `### {n}. {title}` subsections, the technical table, the status list), each unit's check report, its image
// entries and whether its material is approved. Pure: it takes the journal text and returns data, so that
// derive-dashboard.mjs (writer) and the tests read the journal the same way.
import { readFileSync, readdirSync } from "node:fs";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { isLater, trackIds, stepsOf, englishLightStepTitles } from "./tracks.mjs";

const here = dirname(fileURLToPath(import.meta.url));

// Language packs (templates/i18n/*.json): the state words of a course language under `terms`.
export function loadPacks(dir = resolve(here, "..", "templates", "i18n")) {
  try {
    return readdirSync(dir).filter(item => item.endsWith(".json")).map(item => JSON.parse(readFileSync(join(dir, item), "utf8")));
  } catch { return []; }
}

// The English state words (templates/session-validation.yaml → outcome_words); a pack overrides them.
// The material steps every unit gets from the start when no unit has steps yet (a language pack's `unitSteps`).
export const englishUnitSteps = [
  { title: "Plan", why: "The planning sketch sets contents, tasks and self-check before any material is written." },
  { title: "Work out the material", why: "Texts, tasks and self-check are written together; you see each part first." },
  { title: "Insert images", why: "The marked spots get their pictures." },
  { title: "Check and approve", why: "The check shows whether the material fits the objectives and the time; then you approve it." }
];

export const englishTerms = {
  skeleton: "planning sketch",
  skeletonOnly: "planning sketch ✅ · material open",
  materialWritten: "material written · check open",
  imagesMissing: "material written · images missing",
  imagesPartial: "material written · images {n} of {m}",
  checkCorrection: "check: correction needed ({n})",
  checked: "checked ✅",
  viewMaterial: "How learners see it",
  imageStep: "Insert images",
  noBlocks: "none",
  asOf: "As of {date}",
  laterNote: "When needed – not needed for this course yet.",
  outlineSlides: "Slides",
  miniSessionsNote: "The material is written in one go with “Write the course”.",
  passedMissing: "passed – still missing: {what}",
  passedConcerns: "passed – {n} point(s) to decide",
  blocksPerUnit: "checked per {unit} – none needed so far ({k} of {N})",
  blocksNone: "no building blocks needed",
  checkCourseLater: "course check after the last {unit} · approved so far: {units}",
  publishNeeded: "needed – after all {units} are checked",
  approvalOpen: "passed – waiting for your approval",
  accessOpen: "access still open",
  imagesWaiting: "waiting for your photo – images {n} of {m}",
  approvedMissing: "approved – still missing: {what}",
  buildRunning: "being prepared – planning sketch ✅", buildRunningStep: "The assistant writes, illustrates and checks the material on its own; then you look at it together.", buildRequested: "preparation requested",
  recheckDone: "re-checked",
  recheckShort: "{n} point(s) changed since – short re-check open",
  correctionOpen: "correction needed: {open} of {n} points open",
  usableYes: "yes", usableLimited: "yes, with limits: {what}", usableNo: "not yet: {why}"
};

// LiaScript slide anchor: full heading text, lower case, spaces and "-" collapse to one "-", punctuation stays.
// Older wordings of a term as [pattern, term key] (a pack's `outdatedTerms` likewise): derive recognises a label
// it wrote in the old wording and replaces or removes it (T5-87).
export const englishOutdatedTerms = [["after the last \\p{L}+ – approved:", "checkCourseLater"]];

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
  // How learners open the material (Course Profile → Delivery): link or platform makes publishing required (SK69);
  // open: not decided yet – publishing waits until the instructor settles it (T5-54).
  const delivery = context.match(/Delivery:\s*(link|platform|print|local|open)\b/i)?.[1].toLowerCase() ?? null;

  // The track (full when the field is missing), its convert mode and source.
  const track = context.match(/^\s*\d+\.\s*Track:\s*(full|mini|convert|template)\b/m)?.[1] ?? trackIds[0];
  const convertMode = context.match(/Convert mode:\s*(transfer|rebuild)\b/)?.[1] ?? null;
  const sourceValue = context.match(/^\s*\d+\.\s*Source:\s*(.+)$/m)?.[1].trim();
  const source_ = !sourceValue || /^n\/a$/i.test(sourceValue) ? null : sourceValue;
  // Sections marked "when needed": every ## section and ### Learner Personas under ## Agents.
  const later = headings.map(heading => heading.key).filter(key => isLater(section(key)));
  const personas = section("Agents").match(/^### Learner Personas[^\n]*\n([\s\S]*?)(?=^#{1,3} |(?![\s\S]))/m)?.[1] ?? "";
  if (isLater(personas)) later.push("Learner Personas");
  // "### Learner Personas – Lernendenprofile": the translated suffix labels its when-needed entry.
  const personasSuffix = section("Agents").match(/^### Learner Personas\s+–\s+(.+?)\s*$/m)?.[1] ?? null;

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

  // A section is filled once it holds more than its one-line note ("_Still empty – …_") and its action line.
  const filled = key => {
    if (later.includes(key)) return false;
    const lines = stripComments(section(key)).split("\n").map(line => line.trim()).filter(line => line && !/\]\(agent:/.test(line) && !/^(-{3,}|\*{3,})$/.test(line));
    return lines.length > 1 || (lines.length === 1 && !/^_.*_$/.test(lines[0]));
  };
  // How many units the course frame plans (Course Profile → "Units: 2 × 45 min") and how many the outline
  // describes (T5-67); null where it is not clearly readable – then nothing is compared.
  const unitsPlanned = Number(context.match(/^\s*\d+\.\s*Units:\s*(\d+)\s*[×x]\s*\d/m)?.[1] ?? NaN);
  const unitsInOutline = outlineUnits(section("Outline"), [englishTerms, terms, ...packs.map(item => item.terms ?? {})].map(item => item.outlineSlides));
  const validationSummary = section("Validation").split(/^### Latest Validation Summary[^\n]*\n/m)[1]?.split(/^#{1,3} /m)[0] ?? "";
  return {
    language, terms, pack, headings, terminology, delivery, hasAgenda: agenda.length > 0, units: list, projectDir,
    track, convertMode, source: source_, later, personasSuffix,
    unitsPlanned: Number.isInteger(unitsPlanned) && unitsPlanned > 0 ? unitsPlanned : null, unitsInOutline: later.includes("Outline") ? null : unitsInOutline,
    filled: Object.fromEntries(["Course Context", "Outline", "Didactics", "Agenda"].map(key => [key, filled(key)])),
    agendaRequired: context.match(/Agenda required:\s*(yes|no)/i)?.[1].toLowerCase() ?? null,
    templates: readTemplates(section("Templates")),
    validation: { mode: validationSummary.match(/\bMode:\s*(\w+)/)?.[1] ?? null, result: validationSummary.match(/\bResult:\s*(PASS with concerns|PASS|FAIL)/)?.[1] ?? null },
    published: /^\s*[*-]\s+__State:__\s*published/m.test(section("Publishing"))
  };
}

// The units the outline describes: the entries of its session overview (`data-key="session-overview"`, templates/
// course-outline.yaml) – top-level list items or table rows. The slide list of a mini outline (label "Slides",
// any pack's `terms.outlineSlides`) is the outline of one unit. null when there is no readable overview.
function outlineUnits(outline, slideWords) {
  const after = outline.split(/<!--\s*data-key="session-overview"\s*-->/)[1];
  if (after == null) return null;
  const lines = after.split("\n");
  const labelAt = lines.findIndex(line => line.trim());
  const label = lines[labelAt]?.match(/^\s*[*-]\s+__(.+?):?__/)?.[1].split(/\s+–\s+/)[0].replace(/:$/, "").trim().toLowerCase();
  if (!label) return null;
  const slides = slideWords.filter(Boolean).map(word => word.toLowerCase());
  if (slides.some(word => label.startsWith(word))) return 1;
  const body = [];
  for (const line of lines.slice(labelAt + 1)) {
    if (/^\s*<!--/.test(line) || /^\s*[*-]\s+__/.test(line) || /^(-{3,}|#{1,6}\s)/.test(line)) break;
    body.push(line);
  }
  const items = body.filter(line => /^ {0,3}(?:\d+[.)]|[-*+])\s+\S/.test(line)).length;
  const separator = line => /^\s*\|[\s:|-]+\|\s*$/.test(line) && line.includes("-");
  const rows = body.filter((line, index) => /^\s*\|/.test(line) && !separator(line) && !separator(body[index + 1] ?? "")).length;
  const count = items || rows;
  return count > 0 ? count : null;
}

// The keys (tracks.mjs → stepsOf) of the overview's course steps. The full track may drop a step (the agenda step
// with `Agenda required: no`, the template step in older journals): when every title is a known title of the
// empty journal (English or the course pack), each step gets the key of its title; else by position, as before.
export function courseStepKeys(steps = [], journal = {}) {
  const keys = stepsOf(journal.track ?? "full", journal.convertMode ?? null);
  if ((journal.track ?? "full") !== "full" || !steps.length) return keys;
  const lists = [englishCourseSteps(), journal.pack?.dashboard?.process?.steps].filter(list => list?.length === keys.length);
  const norm = text => String(text ?? "").trim().toLowerCase();
  const byTitle = steps.map(step => keys.find((key, index) => lists.some(list => norm(list[index].title) === norm(step.title))) ?? null);
  const ordered = byTitle.every((key, index) => key && (!index || keys.indexOf(key) > keys.indexOf(byTitle[index - 1])));
  return ordered ? byTitle : keys;
}

// The course steps of the empty journal (templates/journal.md), English; a language pack has them under `dashboard`.
let englishSteps;
export function englishCourseSteps() {
  if (!englishSteps) {
    try {
      const template = readFileSync(resolve(here, "..", "templates", "journal.md"), "utf8");
      englishSteps = JSON.parse(template.match(/```json @Dashboard\.View\n([\s\S]*?)\n```/)[1]).process.steps;
    } catch { englishSteps = []; }
  }
  return englishSteps;
}

// The steps of a track as the empty journal or the language pack names them: full – the empty journal's steps
// (title, state, why); a light track – the titles of `lightStepTitles`. null without words in the course language.
export function trackSteps(journal) {
  const keys = stepsOf(journal.track ?? "full", journal.convertMode ?? null);
  const english = journal.language === "en";
  if ((journal.track ?? "full") === "full") {
    const list = journal.pack?.dashboard?.process?.steps ?? (english ? englishCourseSteps() : null);
    if (!list || list.length !== keys.length) return null;
    return keys.map((key, index) => ({ key, title: list[index].title, state: list[index].state ?? "planned", ...(list[index].why ? { why: list[index].why } : {}) }));
  }
  const titles = journal.pack?.lightStepTitles ?? (english ? englishLightStepTitles : null);
  if (!titles || keys.some(key => !titles[key])) return null;
  return keys.map(key => ({ key, title: titles[key], state: "planned" }));
}

// ## Templates (templates/course-templates.yaml): the selection line before <section> (missing = open), the
// adopted entries (`__Catalog id:__`) and the briefs `### {id} (in development)` with their state and units.
function readTemplates(text) {
  const plain = stripComments(text);
  const entries = plain.split(/^(?=### )/m).slice(1).map(block => ({
    heading: block.match(/^### (.+?)\s*$/m)?.[1] ?? "",
    field: name => block.match(new RegExp(`^\\s*[*-]\\s+__${name}:__[ \\t]*(.*)$`, "m"))?.[1].trim() ?? "",
    block
  }));
  const usedIn = block => (block.split(/__Used in:__/)[1] ?? "").split(/^\s*[*-]\s+__/m)[0].replace(/\s+/g, " ").trim();
  return {
    selection: plain.split(/^<section\b/m)[0].match(/^\s*[*-]\s+__Template selection:__[ \t]*(.*)$/m)?.[1].trim() ?? "open",
    adopted: entries.map(entry => entry.field("Catalog id").replace(/`/g, "")).filter(Boolean),
    briefs: entries.filter(entry => / \(in development\)$/.test(entry.heading))
      .map(entry => ({ id: entry.heading.replace(/ \(in development\)$/, ""), state: entry.field("State"), usedIn: usedIn(entry.block) }))
  };
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
  return { n, heading: null, tableTitle: null, material: false, done: false, notes: null, statusLine: null, report: null, images: { total: 0, placed: 0, open: 0, waiting: 0 }, approved: false, buildRequested: false };
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
    // A report that names fewer missing photos than image entries are open belongs to an older version of the
    // material (a spot was added after the check, T5-41). Placing photos only lowers the open count.
    if (item.report?.result) {
      const named = photosNamed(item.report.missing);
      item.report.stale = named != null && item.images.open > named;
      if (item.report.stale) item.report.photosNamed = named;
    }
    // The skeleton part (summary, decisions …) before the first #### block holds the approval record.
    item.approved = approvedWord.test(stripComments(part.split(/^#### /m)[0]));
    // "Let it be prepared" was confirmed with the planning sketch (tasks/build-session.md): a dated decision
    // with terms.buildRequested. While no check report exists, the run is still going (SK58).
    item.buildRequested = [terms.buildRequested, englishTerms.buildRequested].some(word => word && stripComments(part.split(/^#### /m)[0]).toLowerCase().includes(String(word).toLowerCase()));
    // The building-block line decided with the planning sketch (session-skeleton.yaml → building-blocks).
    const blocks = part.match(/<!--\s*data-key="building-blocks"\s*-->\s*\n\s*\*\*[^*]+\*\*\s*(.*)/);
    if (blocks) item.blocks = blocks[1].trim();
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
    // Concerns that wait for the instructor (a visible "- ⏸ …" item, e.g. "decide after looking at it on the
    // learners' device") against the open concerns of the technical part (❌ lines): all waiting → SK47.
    concernsWaiting: (() => {
      const waiting = visible.split("\n").filter(line => /^\s*[-*]\s+⏸/.test(line)).length;
      const open = text.split("<details>").slice(1).join("").split("\n").filter(line => /^\s*[-*]\s+❌/.test(line)).length;
      return waiting > 0 && waiting >= open;
    })(),
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

// The photos the ⏳ items of a report count: "10 Fotos: …", "1 own photo" → their sum; null when no item names
// pictures or one names them without a number (then the count is unknown and nothing is compared).
const pictureWord = "fotos?|photos?|bilder|bild|images?|pictures?|abbildungen|abbildung|grafiken|grafik|graphics?|diagramme?|diagrams?|illustrations?|illustrationen|illustration|zeichnungen|zeichnung|drawings?";
export function photosNamed(items = []) {
  const word = new RegExp(`(^|[^\\p{L}])(${pictureWord})([^\\p{L}]|$)`, "iu");
  const counted = new RegExp(`(\\d+)\\s+(?:[\\p{L}-]+\\s+)?(?:${pictureWord})(?![\\p{L}])`, "giu");
  let sum = 0, any = false;
  for (const item of items.filter(text => word.test(text))) {
    const counts = [...item.matchAll(counted)].map(match => Number(match[1]));
    if (!counts.length) return null;
    sum += counts.reduce((a, b) => a + b, 0);
    any = true;
  }
  return any ? sum : null;
}

// The status of a unit whose check report belongs to an older version of its material (report.stale):
// "changed after the check – short re-check open", from the pack's words (no "passed" for the new version).
export const recheckOpenText = terms => terms.recheckOpen
  ?? `${terms.changedAfterCheck ?? "changed after the check"} – ${String(terms.recheckShort ?? englishTerms.recheckShort).split(" – ").at(-1)}`;

// Image entries (tasks/create-image.md): <section> blocks with `#### {slug}` and `__Status:__`.
// `waiting`: open entries of the instructor's own photos (Source own, wanted) – they wait for a file from the
// instructor, not for the image step, so they do not hold the check back (SK41).
function readImages(part) {
  const entries = [...part.matchAll(/<section(?![^>]*validation-report)\b[^>]*>([\s\S]*?)<\/section>/g)]
    .map(block => ({ status: block[1].match(/^\s*[*-]\s+__Status:__[ \t]*(\S+)/m)?.[1].toLowerCase(), source: block[1].match(/^\s*[*-]\s+__Source:__[ \t]*(\S+)/m)?.[1].toLowerCase() }))
    .filter(entry => entry.status);
  const placed = entries.filter(entry => placedStatuses.includes(entry.status)).length;
  const waiting = entries.filter(entry => entry.status === "wanted" && entry.source === "own").length;
  return { total: entries.length, placed, open: entries.length - placed, waiting };
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

const datedOutcome = new RegExp(`\\s*\\(${datePattern.source}\\)`, "g");
const fill = (term, values) => String(term).replace(/\{(\w+)\}/g, (match, key) => values[key] ?? match);
// "material written · images {n} of {m}" → "images {n} of {m}": the part that follows another state.
const tail = term => String(term).split(" · ").slice(1).join(" · ") || String(term);

// The approval state is computed from the unit's decisions, never written into the outcome line (templates/
// session-validation.yaml → outcome_words). Older reports that still carry it ("passed – waiting for your
// approval") lose that part here: `approvalTails` lists it in English and every pack (T5-55).
export function approvalTails(terms, packs = loadPacks()) {
  const tail = term => String(term ?? "").split(/\s+–\s+/).slice(1).join(" – ").trim().toLowerCase();
  return [...new Set([terms?.approvalOpen, englishTerms.approvalOpen, ...packs.map(pack => pack.terms?.approvalOpen)].map(tail).filter(Boolean))];
}
export function withoutApproval(outcome, tails) {
  const parts = String(outcome).split(/\s+–\s+/);
  const kept = parts.filter((part, index) => !index || !tails.includes(part.replace(datedOutcome, "").trim().toLowerCase()));
  return { text: kept.join(" – "), carried: kept.length < parts.length };
}

// The one wording of a unit's state (templates/session-skeleton.yaml → section_layout.overview): the status
// line, the Notes cell and the overview's statusLabel all carry it. Before a check it follows from the
// planning sketch, the material and the image entries; once a report exists, its outcome line is the
// source (without its date), "check: " before a FAIL, open images after " – "; Done ✅ → "passed – waiting for
// your approval" until the approval in the decisions, then "checked ✅" (T5-55).
export function statusText(unit, terms) {
  if (!unit.heading && !unit.material) return null;
  // "Let it be prepared" is running until its check report exists: no "material open" meanwhile (R12-SK76).
  if (unit.buildRequested && !unit.report?.result) return terms.buildRunning ?? englishTerms.buildRunning;
  if (!unit.material) return terms.skeletonOnly;
  const { total, placed, open } = unit.images;
  const report = unit.report;
  // An older report without a visible outcome line: its wording is unknown, the status stays as written.
  if (report?.result && !report.outcome) return null;
  if (report?.stale) return recheckOpenText(terms);
  if (!report?.outcome) return !open ? terms.materialWritten : placed ? fill(terms.imagesPartial, { n: placed, m: total }) : terms.imagesMissing;
  // Checked (Done ✅) waits for the approval; only the approval makes it "checked" (T5-55).
  if (unit.done && !report.changedSince && !open) return unit.approved ? terms.checked : terms.approvalOpen ?? englishTerms.approvalOpen;
  // An older outcome line with the approval state keeps it while the approval is open, never after it.
  let outcome = report.outcome.replace(datedOutcome, "").replace(/\s+/g, " ").trim();
  if (unit.approved) outcome = withoutApproval(outcome, approvalTails(terms)).text;
  // Approved by the instructor while something is still missing: "approved – still missing: 1 photo" (SK61).
  const passedHead = String(terms.passedMissing).split("{what}")[0];
  if (unit.approved && report.result === "PASS" && !report.changedSince && outcome.startsWith(passedHead)) {
    // Without the image count: the missing photo is already named (SK70).
    return fill(terms.approvedMissing, { what: outcome.slice(passedHead.length) });
  }
  const prefix = report.result === "FAIL" ? String(terms.checkCorrection).match(/^[^:{(]+:/)?.[0] : null;
  const text = prefix && !outcome.toLowerCase().startsWith(prefix.toLowerCase()) ? `${prefix} ${outcome}` : outcome;
  // An outcome that already names the missing pictures ("still missing: 9 photos") gets no "images missing"
  // after it (T5-22); the count "images n of m" still adds how far the image step is.
  const imageWord = String(tail(terms.imagesMissing)).split(/\s+/)[0].replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const namesImages = new RegExp(`(^|[^\\p{L}])(${[imageWord, "bild", "bilder", "fotos?", "images?", "photos?", "pictures?"].filter(Boolean).join("|")})([^\\p{L}]|$)`, "iu").test(outcome);
  const images = open ? (placed ? fill(tail(terms.imagesPartial), { n: placed, m: total }) : namesImages ? null : tail(terms.imagesMissing)) : null;
  return images ? `${text} – ${images}` : text;
}

// Writes the status of each unit into ## Sessions: its line "{n}. {title} – {status}" in the status list and
// its Notes cell in the technical table. Only lines and cells that exist change; returns the new text and
// one entry per changed line.
// The overview part of ## Sessions: from its heading to the first ## or ### heading outside an HTML comment
// (the template's comment shows a "### {n}. …" example).
export function sessionsOverview(lines) {
  const start = lines.findIndex(line => /^## Sessions\b/.test(line));
  if (start < 0) return null;
  let comment = false;
  for (let index = start + 1; index < lines.length; index++) {
    const line = lines[index];
    if (comment) { comment = !line.includes("-->"); continue; }
    if (/^\s*<!--/.test(line) && !line.includes("-->")) { comment = true; continue; }
    if (/^(## |### )/.test(line)) return { start, end: index };
  }
  return { start, end: lines.length };
}

export function patchSessions(source, units) {
  const lines = source.split("\n");
  const region = sessionsOverview(lines);
  if (!region) return { source, changes: [] };
  const { start, end } = region;
  const changes = [];
  const listed = new Map();
  let comment = false, details = false, header = null;
  for (let index = start + 1; index < end; index++) {
    const line = lines[index];
    if (comment || /^\s*<!--/.test(line)) { comment = !line.includes("-->") ; continue; }
    if (/<details>/.test(line)) details = true;
    if (/<\/details>/.test(line)) { details = false; continue; }
    const tableHeader = line.match(/^\|\s*#\s*\|(.*)\|\s*$/);
    if (tableHeader) { header = tableHeader[1].split("|").map(cell => cell.trim()); continue; }
    const row = line.match(/^\|\s*(\d+)\s*\|(.*)\|\s*$/);
    const item = !details && line.match(/^(\d+)\.\s+(.+?)\s*$/);
    if (item) listed.set(item[1], index);
    const unit = units.find(entry => entry.n === (row?.[1] ?? item?.[1]));
    if (!unit?.status) continue;
    let next = line;
    if (row && header && header.length >= 6) {
      const cells = row[2].split("|").map(cell => cell.trim());
      const at = header.indexOf("Notes") >= 0 ? header.indexOf("Notes") : header.length - 1;
      cells[at] = unit.status;
      next = `| ${row[1]} | ${cells.join(" | ")} |`;
    } else if (item && unit.title) next = `${item[1]}. ${unit.title} – ${unit.status}`;
    if (next !== line) {
      changes.push({ path: `## Sessions ${row ? `Notes cell ${row[1]}` : `status line ${item[1]}`}`, from: row ? line.split("|").at(-2)?.trim() : item[2], to: unit.status, why: "one wording per state" });
      lines[index] = next;
    }
  }
  // A begun unit without its status line (a new unit) gets one, in number order; the first one goes above
  // the technical overview. Positions are looked up again after each insertion.
  const positions = () => {
    const found = new Map();
    const region = sessionsOverview(lines);
    let inComment = false, inDetails = false, detailsLine = -1;
    for (let index = region.start + 1; index < region.end; index++) {
      const line = lines[index];
      if (inComment || /^\s*<!--/.test(line)) { inComment = !line.includes("-->"); continue; }
      if (/<details>/.test(line)) { inDetails = true; if (detailsLine < 0) detailsLine = index; }
      if (/<\/details>/.test(line)) { inDetails = false; continue; }
      const item = !inDetails && line.match(/^(\d+)\.\s+/);
      if (item) found.set(item[1], index);
    }
    return { found, detailsLine };
  };
  for (const unit of units.filter(entry => entry.status && entry.title && entry.begun && !listed.has(entry.n)).sort((a, b) => Number(a.n) - Number(b.n))) {
    const { found, detailsLine } = positions();
    const numbers = [...found.keys()].map(Number);
    const below = numbers.filter(n => n < Number(unit.n)).sort((a, b) => b - a)[0];
    const above = numbers.filter(n => n > Number(unit.n)).sort((a, b) => a - b)[0];
    const text = `${unit.n}. ${unit.title} – ${unit.status}`;
    if (below != null) lines.splice(found.get(String(below)) + 1, 0, text);
    else if (above != null) lines.splice(found.get(String(above)), 0, text);
    else if (detailsLine >= 0) lines.splice(detailsLine, 0, text, "");
    else continue;
    changes.push({ path: `## Sessions status line ${unit.n}`, from: undefined, to: unit.status, why: "a new unit's status line" });
  }
  return { source: lines.join("\n"), changes };
}
