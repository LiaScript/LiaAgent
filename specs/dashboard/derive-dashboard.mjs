// Derives the mechanical fields of the Dashboard from journal.md, so the agent writes only the texts.
// Derived (tasks/update-dashboard.md steps 2 and 8): the unit list (agenda rows and subsections), each unit's
// `title`, `state`, `href`, `view`, `usable` and `statusLabel`, the state of its image step, process steps
// for units that have none yet, the section `links`, and the date in `footer` (only when something changed).
// The same status wording also goes into ## Sessions: each unit's status line and its Notes cell
// (journal-model.mjs → statusText; the check report's outcome line is its source once a check ran).
// Actions (actions.mjs): the command of `next` and of each unit's action line in ## Sessions, and the
// recommended unit `selected`. Their words stay the agent's while the command is right; a changed command
// takes the words of the language pack (`actions`) – without a pack the agent writes them (`missing`).
// Untouched: every text the agent writes – subtitle, summaries, why/result/next of steps, next, explore,
// decisions, plan, notice – and the global course process.
//
//   node specs/dashboard/derive-dashboard.mjs [--check | --write] [--draft <file>] [journal.md]
//
// Without a mode it prints what would change. --check exits 1 when the Dashboard block differs from the
// derived fields. --write writes the derived data through write-dashboard.mjs (one write, then validation).
// --draft derives from a draft file (e.g. .cache/dashboard.json) instead of the journal's block.
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { readJournal, usableState, loadPacks, anchorOf, statusText, patchSessions } from "./journal-model.mjs";
import { courseNext, accepts, wordsOf, nextTitle, patchUnitActions, patchSectionActions, patchSessionsNote, exploreCards } from "./actions.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const workingStates = ["current", "draft", "review", "revision"];

// Display state of a unit (tasks/update-dashboard.md step 2). States are exclusive; the later one wins.
export function unitState(unit, { selected } = {}) {
  const report = unit.report;
  if (!unit.heading && !unit.material) return { state: "planned", why: "no planning sketch yet" };
  if (!unit.material) return String(selected) === unit.n
    ? { state: "current", why: "planning sketch, recommended next unit" }
    : { state: "planned", why: "planning sketch only, material open" };
  if (!report?.result) return unit.approved
    ? { state: "review", why: "material approved, check open" }
    : { state: "draft", why: "material written, not approved yet" };
  if (report.changedSince) return { state: "review", why: `${report.changedSince} point(s) changed after the check, short re-check open` };
  if (report.result === "FAIL") return { state: "revision", why: "check: correction needed" };
  if (report.result === "PASS with concerns") return { state: "current", why: "passed with concerns, decision needed" };
  if (report.deferred) return { state: "current", why: "passed, ⏳ items still open" };
  if (!unit.done) return { state: "current", why: "passed, Done not set in the overview table" };
  if (!unit.approved) return { state: "current", why: "passed, waiting for the instructor's approval" };
  return { state: "done", why: "passed, Done ✅, approved" };
}

const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const clone = value => JSON.parse(JSON.stringify(value));
const isImageStep = (step, terms) => [terms.imageStep, "Insert images"].some(title => title && step.title?.toLowerCase().includes(title.toLowerCase()))
  || /\b(bilder|images?|fotos?|photos?)\b/i.test(step.title ?? "");

// The short "what is missing" of a usable line: the text after the colon, up to the first sentence end.
function missingOf(text) {
  const rest = String(text ?? "").split(/:\s*/).slice(1).join(": ").trim();
  const first = rest.split(/(?<=[.!?])\s+|;\s*/)[0].replace(/[.!?]$/, "").trim();
  return first.length > 80 ? `${first.slice(0, 79)}…` : first;
}

function today(language, sample) {
  const now = new Date();
  const pad = number => String(number).padStart(2, "0");
  const [y, m, d] = [now.getFullYear(), pad(now.getMonth() + 1), pad(now.getDate())];
  if (/^\d{1,2}\.\s?\d{1,2}\.\s?\d{4}$/.test(sample ?? "") || (!sample && language === "de")) return `${d}.${m}.${y}`;
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(sample ?? "")) return `${m}/${d}/${y}`;
  return `${y}-${m}-${d}`;
}

// Returns { data, changes }: the data with every derived field set, and one entry per changed field.
export function derive(journal, input, { date } = {}) {
  const data = clone(input);
  const changes = [];
  const set = (target, key, value, path, why) => {
    if (same(target[key], value)) return;
    changes.push({ path, from: target[key], to: value, why });
    if (value === undefined) delete target[key];
    else target[key] = value;
  };
  const { terms } = journal;
  const existing = new Map((data.units ?? []).map(unit => [String(unit.id), unit]));
  const template = (data.units ?? []).find(unit => unit.process?.steps?.length);

  // A new unit, or one without steps, gets the same material steps as the others, all still to come.
  const freshSteps = () => template.process.steps.map(step => ({
    title: step.title, state: isImageStep(step, terms) ? "optional" : "planned", ...(step.why ? { why: step.why } : {})
  }));

  // The next action decides the recommended unit; only "done" matters for it, which does not depend on it.
  const unitWord = journal.terminology ?? journal.pack?.unitWord?.one ?? data.unitLabel?.one ?? "unit";
  const unitsWord = journal.headings.find(heading => heading.key === "Sessions")?.suffix ?? journal.pack?.unitWord?.many ?? data.unitLabel?.many ?? "units";
  const doneStates = new Map(journal.units.map(facts => [facts.n, unitState(facts).state]));
  const expected = courseNext(journal, doneStates, data.selected);
  const nextUnit = expected && (expected.params.number ?? expected.params.file);
  if (nextUnit && data.selected !== "" && String(data.selected) !== String(nextUnit)) {
    set(data, "selected", typeof data.selected === "number" ? Number(nextUnit) : String(nextUnit), "selected", "unit of the next action");
  }
  const missing = [];

  // Units: agenda rows and subsections. Without an agenda the units the overview already lists stay as well
  // (a course without a separate agenda takes them from the outline).
  const known = new Set(journal.units.map(unit => unit.n));
  const units = [];
  const sessions = [];
  for (const facts of journal.units) {
    const unit = existing.get(facts.n) ?? (() => {
      const title = facts.title ?? facts.agendaTitle ?? `${facts.n}`;
      changes.push({ path: `units[${facts.n}]`, from: undefined, to: title, why: facts.inAgenda ? "row in the agenda" : "subsection in ## Sessions" });
      return { id: Number(facts.n), title, state: "planned", ...(template ? { process: { title, steps: freshSteps() } } : {}) };
    })();
    const path = `units[${facts.n}]`;
    // The title of the subsection or the technical table; the agenda row only for a unit without a title yet.
    const title = facts.title ?? (String(unit.title ?? "").trim() ? null : facts.agendaTitle);
    if (title) set(unit, "title", title, `${path}.title`, facts.heading ? "heading of the subsection" : facts.title ? "technical table in ## Sessions" : "agenda row");
    if (unit.process && title) set(unit.process, "title", title, `${path}.process.title`, "unit title");
    if (template && !unit.process?.steps?.length) set(unit, "process", { title: unit.title, steps: freshSteps() }, `${path}.process`, "every unit gets the same steps from the start");

    const { state, why } = unitState(facts, { selected: data.selected });
    set(unit, "state", state, `${path}.state`, why);
    set(unit, "href", facts.heading?.anchor, `${path}.href`, facts.heading ? "anchor of the subsection" : "no subsection yet");
    set(unit, "view", facts.material ? { ...(unit.view?.label ? { label: unit.view.label } : {}), href: `agent:teaching/preview?file=${facts.n}`, command: `:preview ${facts.n}` } : undefined,
      `${path}.view`, facts.material ? "material exists (Material ✅)" : "no material yet");
    const status = statusText(facts, terms);
    if (status) set(unit, "statusLabel", status, `${path}.statusLabel`, facts.report?.outcome ? "outcome of the check report" : "planning sketch, material and image entries");
    sessions.push({ n: facts.n, title: facts.title, status });

    // usable follows the report's line "usable with learners now"; keep the agent's short "missing" while the state holds.
    const reported = facts.report && usableState(facts.report.usableText);
    if (!facts.report) set(unit, "usable", undefined, `${path}.usable`, "no check report yet");
    else if (reported && unit.usable?.state !== reported) {
      const missing = facts.report.missing.length ? facts.report.missing.slice(0, 3) : [missingOf(facts.report.usableText) || "–"];
      set(unit, "usable", reported === "yes" ? { state: "yes" } : { state: reported, missing },
        `${path}.usable`, "line \"usable with learners now\" of the check report");
    }

    // The image step follows the image entries: open while one is open, done once all are placed. Without
    // entries it keeps its state (older journals track images only as markers in the material).
    const imageStep = unit.process?.steps?.find(step => isImageStep(step, terms));
    const { total, placed, open } = facts.images;
    if (imageStep && total) set(imageStep, "state", open ? (facts.material ? "current" : "planned") : "done", `${path} step "${imageStep.title}".state`, `${placed} of ${total} image entries placed`);
    units.push(unit);
  }
  // Units the overview lists but the journal does not: removed only when an agenda decides which units exist.
  for (const unit of data.units ?? []) {
    if (known.has(String(unit.id))) continue;
    if (journal.hasAgenda) changes.push({ path: `units[${unit.id}]`, from: unit.title, to: undefined, why: "neither in the agenda nor in ## Sessions" });
    else units.push(unit);
  }
  if (data.units || units.length) set(data, "units", units.sort((a, b) => Number(a.id) - Number(b.id)), "units", "order of the units");
  if (data.selected != null && data.selected !== "" && !units.some(unit => String(unit.id) === String(data.selected))) set(data, "selected", undefined, "selected", "unit no longer exists");

  // Section links the overview lists follow their heading line: its anchor, labelled with its translated
  // suffix (a translated heading changes the anchor). Which sections are linked stays the agent's choice.
  if (Array.isArray(data.links)) {
    const links = data.links.map(link => {
      const href = String(link.href ?? "");
      const heading = journal.headings.find(item => href === anchorOf(item.key) || href.startsWith(`${anchorOf(item.key)}-–-`));
      return heading ? { ...link, label: heading.suffix ?? link.label, href: heading.anchor } : link;
    });
    set(data, "links", links, "links", "anchors of the section headings");
  }

  // next: the command follows the journal; the agent's words stay while the command is right.
  if (expected) {
    if (data.next && accepts(expected, data.next.href)) {
      if (data.next.href === expected.href) {
        set(data.next, "command", expected.command, "next.command", "readable command of the next action");
        set(data.next, "icon", expected.icon, "next.icon", "icon of the next action");
      }
    } else {
      const words = wordsOf(expected, journal, { unit: unitWord, units: unitsWord, n: nextUnit, id: expected.params.id ?? expected.params.name });
      const title = nextTitle(expected, data, unitWord) ?? words?.title ?? words?.label;
      if (!words || !title) missing.push({ where: "next", action: expected, title });
      else set(data, "next", { icon: expected.icon, title, why: words.why, label: words.label, href: expected.href, command: expected.command },
        "next", `next action by the journal: ${expected.command}`);
    }
  }

  // "More options": the cards of the second way for the next unit, of the templates and of a brief while they
  // are not `next` (actions.mjs → exploreCards); a right card keeps its words, a managed card no longer
  // right goes. Never the icon of `next`: these cards use ➕.
  if (expected) {
    const { cards, managed } = exploreCards(journal, expected, data.next?.href);
    const explore = Array.isArray(data.explore) ? data.explore : [];
    const result = explore.filter(item => !managed.test(String(item.href ?? "")) || cards.some(card => accepts(card, item.href)))
      .map(item => cards.some(card => accepts(card, item.href)) && item.icon === data.next?.icon ? { ...item, icon: "➕" } : item);
    for (const card of cards.filter(card => !explore.some(item => accepts(card, item.href)))) {
      const words = wordsOf(card, journal, { unit: unitWord, units: unitsWord, n: card.params.number, id: card.params.id ?? card.params.name });
      if (!words) { missing.push({ where: "explore", action: card }); continue; }
      result.push({ icon: card.icon, title: words.title ?? words.label, description: words.why, label: words.label, href: card.href, command: card.command });
    }
    if (result.length || data.explore) set(data, "explore", result, "explore", "cards of the second way, the templates and a brief");
  }

  // Unit words from the terminology and the ## Sessions suffix.
  const sessionsSuffix = journal.headings.find(heading => heading.key === "Sessions")?.suffix;
  if (sessionsSuffix) set(data, "unitsTitle", sessionsSuffix, "unitsTitle", "suffix of ## Sessions");
  if (journal.terminology || sessionsSuffix) {
    const label = { one: journal.terminology ?? data.unitLabel?.one ?? sessionsSuffix, many: sessionsSuffix ?? data.unitLabel?.many ?? journal.terminology };
    set(data, "unitLabel", label, "unitLabel", "terminology (sessions-called) and suffix of ## Sessions");
  }

  // The footer dates the derived state: renewed only when something else changed.
  if (changes.length && typeof data.footer === "string") {
    const old = data.footer.match(/\d{4}-\d{2}-\d{2}|\d{1,2}\.\s?\d{1,2}\.\s?\d{4}|\d{1,2}\/\d{1,2}\/\d{4}/)?.[0];
    const now = date ?? today(journal.language, old);
    if (old && old !== now) set(data, "footer", data.footer.replace(old, now), "footer", "date of the derived state");
  }
  return { data, changes, sessions, missing, unitWord, unitsWord };
}

// The lines of ## Sessions that follow the derived data: status lines, Notes cells and the units' action
// lines – patched into `source` (the journal text to be written), for one write together with the block.
export function patchJournal(source, journal, derived) {
  const wordsFor = (expected, values = {}) => wordsOf(expected, journal, { unit: derived.unitWord, units: derived.unitsWord, ...values });
  const steps = [
    text => patchSessions(text, derived.sessions),
    text => patchUnitActions(text, journal, wordsFor),
    text => patchSectionActions(text, journal, wordsFor),
    text => patchSessionsNote(text, journal, wordsFor)
  ];
  let text = source;
  const changes = [];
  const missing = [];
  for (const step of steps) {
    const result = step(text);
    text = result.source;
    changes.push(...result.changes);
    missing.push(...(result.missing ?? []));
  }
  return { source: text, changes, missing };
}

// What the agent still has to write because no language pack has the words of an action.
export const missingText = item => item.where === "next"
  ? `- next: the next action is ${item.action.href} (command "${item.action.command}", icon ${item.action.icon}${item.title ? `, title "${item.title}"` : ""}) – write its title, label and why in the course language into the draft's next and run again`
  : item.where === "explore" ? `- explore: add the card ${item.action.href} (command "${item.action.command}", icon ➕) with title, description and label in the course language to the draft and run again`
  : item.where.startsWith("one-line note") ? `- ${item.where}: write it in the course language (${item.action.key === "note-planned" ? "the units are planned in the agenda and created one after another, starting with unit 1" : "{n} of {N} units created; the next one follows after the material of unit {k}"}) and run again`
  : `- ${item.where}: the action is [${item.action.icon} <label>](${item.action.href}) ${item.action.code} – write that link in the course language (keep the link and the command) and run again`;

const shown = value => value === undefined ? "–" : typeof value === "string" ? `"${value.length > 70 ? `${value.slice(0, 69)}…` : value}"` : JSON.stringify(value).slice(0, 90);
export const describe = change => `- ${change.path}: ${shown(change.from)} → ${shown(change.to)} (${change.why})`;

// Derive a draft object against the journal file; used by write-dashboard.mjs before it writes.
export function deriveForJournal(journalFile, draft, options) {
  const source = readFileSync(journalFile, "utf8");
  const journal = readJournal(source, { projectDir: dirname(resolve(journalFile)), packs: loadPacks() });
  const derived = derive(journal, draft, options);
  // The lines of ## Sessions that differ from the derived state.
  const patched = patchJournal(source, journal, derived);
  return { ...derived, journal, changes: [...derived.changes, ...patched.changes], missing: [...derived.missing, ...patched.missing] };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const mode = args.find(arg => arg === "--check" || arg === "--write");
  const draftIndex = args.indexOf("--draft");
  const draftFile = draftIndex >= 0 ? args[draftIndex + 1] : null;
  const positional = args.filter((arg, index) => !arg.startsWith("--") && !(draftIndex >= 0 && index === draftIndex + 1));
  const journalFile = positional[0] ?? ["journal.md", resolve(here, "..", "..", "journal.md")].find(path => existsSync(path));
  if (!journalFile || !existsSync(journalFile)) {
    console.error("No journal found – run from the course project root or name it: node specs/dashboard/derive-dashboard.mjs [--check | --write] [--draft <file>] [journal.md]");
    console.log("Exit code: 2");
    process.exit(2);
  }
  const block = readFileSync(journalFile, "utf8").match(/```json @Dashboard\.View\n([\s\S]*?)\n```/);
  let input;
  try {
    input = draftFile ? JSON.parse(readFileSync(draftFile, "utf8")) : JSON.parse(block?.[1] ?? "");
  } catch (error) {
    console.error(`No readable Dashboard data (${draftFile ?? journalFile}): ${error.message}`);
    console.log("Exit code: 2");
    process.exit(2);
  }
  const { _journalHash, ...base } = input;
  const { data, changes, missing } = deriveForJournal(journalFile, base);
  if (missing.length) {
    console.log("Words still to write (no language pack has them):");
    missing.forEach(item => console.log(missingText(item)));
  }
  if (!changes.length && !missing.length) {
    console.log("Dashboard matches the journal: no derived field differs.");
    console.log("Exit code: 0");
    process.exit(0);
  }
  console.log(`Derived from the journal (${changes.length} field${changes.length === 1 ? "" : "s"}):`);
  changes.forEach(change => console.log(describe(change)));
  if (mode === "--check") { console.log("Exit code: 1"); process.exit(1); }
  if (mode === "--write") {
    const cache = join(dirname(resolve(journalFile)), ".cache");
    mkdirSync(cache, { recursive: true });
    const out = draftFile ?? join(cache, "dashboard.json");
    writeFileSync(out, JSON.stringify(data, null, 2) + "\n");
    const run = spawnSync(process.execPath, [resolve(here, "write-dashboard.mjs"), out, journalFile], { encoding: "utf8" });
    process.stdout.write(run.stdout);
    process.stderr.write(run.stderr);
    process.exit(run.status ?? 1);
  }
  console.log("Exit code: 0");
}
