// Derives the mechanical fields of the Dashboard from journal.md, so the agent writes only the texts.
// Derived (tasks/update-dashboard.md steps 2–4, 8): the unit list (agenda rows and subsections), each unit's
// `title`, `state`, `href`, `view`, `usable` and `statusLabel`, the state of its image step, process steps
// for units that have none yet, the section `links`, and the date in `footer` (only when something changed).
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
import { readJournal, usableState, loadPacks, anchorOf } from "./journal-model.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const workingStates = ["current", "draft", "review", "revision"];

// Display state of a unit (tasks/update-dashboard.md step 3). States are exclusive; the later one wins.
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

  // Units: agenda rows and subsections. Without an agenda the units the overview already lists stay as well
  // (a course without a separate agenda takes them from the outline).
  const known = new Set(journal.units.map(unit => unit.n));
  const units = [];
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
    if (facts.status) set(unit, "statusLabel", facts.status, `${path}.statusLabel`, "status line in ## Sessions");

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
  return { data, changes };
}

const shown = value => value === undefined ? "–" : typeof value === "string" ? `"${value.length > 70 ? `${value.slice(0, 69)}…` : value}"` : JSON.stringify(value).slice(0, 90);
export const describe = change => `- ${change.path}: ${shown(change.from)} → ${shown(change.to)} (${change.why})`;

// Derive a draft object against the journal file; used by write-dashboard.mjs before it writes.
export function deriveForJournal(journalFile, draft, options) {
  const journal = readJournal(readFileSync(journalFile, "utf8"), { projectDir: dirname(resolve(journalFile)), packs: loadPacks() });
  return derive(journal, draft, options);
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
  const { data, changes } = deriveForJournal(journalFile, base);
  if (!changes.length) {
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
    const run = spawnSync(process.execPath, [resolve(here, "write-dashboard.mjs"), out, journalFile, "--no-derive"], { encoding: "utf8" });
    process.stdout.write(run.stdout);
    process.stderr.write(run.stderr);
    process.exit(run.status ?? 1);
  }
  console.log("Exit code: 0");
}
