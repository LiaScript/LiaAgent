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
import { stepsOf, sectionSlug } from "./tracks.mjs";
import { readJournal, englishUnitSteps, englishTerms, usableState, loadPacks, anchorOf, statusText, patchSessions } from "./journal-model.mjs";
import { courseNext, accepts, wordsOf, englishActions, nextTitle, courseStepOf, unitStepOf, patchUnitActions, patchSectionActions, patchSessionsNote, exploreCards, sessionsNote } from "./actions.mjs";

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
// "yes, with limits: 1 photo (headphones); question 4 needs scrolling" → ["1 photo", "question 4 needs scrolling"].
function limitsOf(text) {
  const rest = String(text ?? "").split(/:\s*/).slice(1).join(": ").trim();
  return rest.split(/;\s*/).map(item => item.replace(/\s*\([^()]*\)/g, "").replace(/[.!?]$/, "").trim()).filter(Boolean)
    .map(item => item.length > 80 ? `${item.slice(0, 79)}…` : item).slice(0, 3);
}

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
export function derive(journal, input, { date, previous } = {}) {
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
  // A new unit, or one without steps, gets the same material steps as the others, all still to come; while
  // no unit has steps yet, the steps of the language pack (`unitSteps`, English built in).
  const template = (data.units ?? []).find(unit => unit.process?.steps?.length)?.process.steps
    ?? journal.pack?.unitSteps ?? (journal.language === "en" ? englishUnitSteps : null);
  const freshSteps = () => template.map(step => ({
    title: step.title, state: isImageStep(step, terms) ? "optional" : "planned", ...(step.why ? { why: step.why } : {})
  }));

  // The next action decides the recommended unit; only "done" matters for it, which does not depend on it.
  const unitWord = journal.terminology ?? journal.pack?.unitWord?.one ?? data.unitLabel?.one ?? "unit";
  const unitsWord = journal.headings.find(heading => heading.key === "Sessions")?.suffix ?? journal.pack?.unitWord?.many ?? data.unitLabel?.many ?? "units";
  const doneStates = new Map(journal.units.map(facts => [facts.n, unitState(facts).state]));
  const expected = courseNext(journal, doneStates, data.selected);
  const nextUnit = expected && (expected.params.number ?? expected.params.file);
  // A unit not begun yet (no subsection, no material) shows nothing of its own: the course view stays open.
  const begun = journal.units.some(unit => unit.n === String(nextUnit) && (unit.heading || unit.material));
  if (nextUnit && !begun && data.process?.steps?.length) set(data, "selected", "", "selected", "course view until the next unit is begun");
  else if (nextUnit && String(data.selected) !== String(nextUnit)) {
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
    sessions.push({ n: facts.n, title: facts.title, status, begun: Boolean(facts.heading) });

    // usable follows the report's line "usable with learners now"; keep the agent's short "missing" while the state
    // holds – except for limits: every limit of the line is named, not only the ⏳ items (SK46).
    const reported = facts.report && usableState(facts.report.usableText);
    const limits = reported === "limited" ? limitsOf(facts.report.usableText) : [];
    if (!facts.report) set(unit, "usable", undefined, `${path}.usable`, "no check report yet");
    else if (reported && (unit.usable?.state !== reported || (limits.length && (unit.usable?.missing?.length ?? 0) !== limits.length))) {
      const missing = limits.length ? limits : facts.report.missing.length ? facts.report.missing.slice(0, 3) : [missingOf(facts.report.usableText) || "–"];
      set(unit, "usable", reported === "yes" ? { state: "yes" } : { state: reported, missing },
        `${path}.usable`, "line \"usable with learners now\" of the check report");
    }

    // The image step follows the image entries: open while one is open, done once all are placed. Without
    // entries it keeps its state (older journals track images only as markers in the material).
    const imageStep = unit.process?.steps?.find(step => isImageStep(step, terms));
    // Only own photos still missing: the step waits for the instructor ("planned") – it becomes current again
    // when it is the next action (after the check, SK41).
    const { total, placed, open, waiting = 0 } = facts.images;
    // When the next action inserts this unit's photo, the step stays current – no flip between two rules (R12c).
    const photoNext = expected?.key === "insert-images" && String(expected.params.number) === String(facts.n);
    if (imageStep && total) set(imageStep, "state", open > waiting ? (facts.material ? "current" : "planned") : open ? (photoNext ? "current" : "planned") : "done", `${path} step "${imageStep.title}".state`, `${placed} of ${total} image entries placed${waiting ? `, ${waiting} own photo${waiting === 1 ? "" : "s"} still to come` : ""}`);
    // Only own photos missing: the step says it waits for them, with the count (SK60).
    const waitingWord = String(terms.imagesWaiting ?? englishTerms.imagesWaiting);
    const waitingLabel = imageStep && total && open && open === waiting ? waitingWord.replace("{n}", placed).replace("{m}", total) : undefined;
    if (imageStep && (waitingLabel || String(imageStep.statusLabel ?? "").startsWith(waitingWord.split("{")[0])) && imageStep.statusLabel !== waitingLabel) {
      set(imageStep, "statusLabel", waitingLabel, `${path} step "${imageStep.title}".statusLabel`, waitingLabel ? "only own photos still to come" : "no own photo waiting any more");
    }
    // Approval (the decisions of the unit): the card names it, and the check step is done once the check passed
    // without changes since and the instructor approved – also while own photos are still to come (SK52).
    set(unit, "approved", facts.approved && facts.material ? true : undefined, `${path}.approved`, facts.approved ? "approval in the decisions of the unit" : "not approved");
    const steps = unit.process?.steps ?? [];
    const checkStep = unitStepOf({ key: "check-unit" }, steps);
    const passed = facts.report?.result === "PASS" && !facts.report.changedSince;
    const approvalWord = terms.approvalOpen ?? englishTerms.approvalOpen;
    if (checkStep && passed && facts.approved) {
      set(checkStep, "state", "done", `${path} step "${checkStep.title}".state`, "passed and approved by the instructor");
      if (checkStep.statusLabel === approvalWord) set(checkStep, "statusLabel", undefined, `${path} step "${checkStep.title}".statusLabel`, "approved");
    } else if (checkStep && passed) {
      // Passed, the approval is the instructor's: the step is up next and says what it waits for (SK60).
      set(checkStep, "state", "current", `${path} step "${checkStep.title}".state`, "passed, waiting for the instructor's approval");
      set(checkStep, "statusLabel", approvalWord, `${path} step "${checkStep.title}".statusLabel`, "terms.approvalOpen");
    }
    // The planning step is done once the planning sketch (### {n}. {title}) is saved.
    const planStep = unitStepOf({ key: "plan-unit" }, steps);
    if (planStep && facts.heading && planStep.state !== "done") set(planStep, "state", "done", `${path} step "${planStep.title}".state`, "planning sketch saved");
    // The material step is done once the material exists and a check ran or the instructor approved it –
    // also after "let it be prepared", where no one approves the draft before the check (SK60).
    const materialStep = unitStepOf({ key: "work-out" }, steps);
    // While "let it be prepared" runs, the material step does not promise the joint way (R12-SK76): the pack's
    // default why of that step is replaced; a why of the agent's own stays.
    const defaultWhy = (journal.pack?.unitSteps ?? englishUnitSteps)[1]?.why;
    const runningWhy = terms.buildRunningStep ?? englishTerms.buildRunningStep;
    // Also after the run: the material was prepared on its own (R12b-SK88).
    if (materialStep && facts.buildRequested && materialStep.why === defaultWhy) set(materialStep, "why", runningWhy, `${path} step "${materialStep.title}".why`, "prepared on its own");
    // The step being worked on is running, not "up next" for the instructor (R12b-SK87).
    const running = facts.buildRequested && !facts.report?.result;
    if (materialStep) set(materialStep, "running", running ? true : undefined, `${path} step "${materialStep.title}".running`, running ? "let it be prepared is running" : "not running");
    if (materialStep && materialStep !== checkStep && facts.material && (facts.report?.result || facts.approved)) {
      set(materialStep, "state", "done", `${path} step "${materialStep.title}".state`, facts.approved ? "material approved" : "material written and checked");
    }
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
  // Without links (missing or empty) the overview lists the core sections the journal has.
  const coreSections = ["Course Context", "Outline", "Didactics", "Agenda", "Sessions", "Notes Backup"];
  if (!Array.isArray(data.links) || !data.links.length) {
    const links = coreSections.map(key => journal.headings.find(heading => heading.key === key)).filter(Boolean)
      .map(heading => ({ label: heading.suffix ?? heading.key, href: heading.anchor }));
    if (links.length) set(data, "links", links, "links", "section links of the journal (none were given)");
  } else {
    const links = data.links.map(link => {
      const href = String(link.href ?? "");
      const heading = journal.headings.find(item => href === anchorOf(item.key) || href.startsWith(`${anchorOf(item.key)}-–-`));
      return heading ? { ...link, label: heading.suffix ?? link.label, href: heading.anchor } : link;
    });
    set(data, "links", links, "links", "anchors of the section headings");
  }

  // Course steps that follow from the journal (SK71, SK62, SK69). Indices as in actions.mjs → courseStep.
  const courseSteps = data.process?.steps ?? [];
  const fillTerm = (key, values) => String(terms[key] ?? englishTerms[key] ?? "").replace(/\{(\w+)\}/g, (match, name) => values[name] ?? match);
  const courseSet = (step, field, value, why) => set(step, field, value, `process step "${step.title}".${field}`, why);
  // Building blocks: while no template is chosen or briefed, each planning sketch decides it for its unit.
  const stepKeys = stepsOf(journal.track, journal.convertMode);
  const stepFor = key => courseSteps[stepKeys.indexOf(key)];
  const blocksStep = stepFor("blocks");
  const { selection: blocksSelection, adopted: adoptedTemplates, briefs: templateBriefs } = journal.templates;
  if (blocksStep && journal.filled.Didactics && blocksSelection === "open" && !adoptedTemplates.length && !templateBriefs.length) {
    const none = String(terms.noBlocks ?? "none").toLowerCase();
    const sketched = journal.units.filter(unit => unit.blocks);
    const noneNeeded = sketched.filter(unit => unit.blocks.toLowerCase().replace(/^[^\p{L}]+/u, "").startsWith(none));
    const total = journal.units.length;
    if (total && noneNeeded.length === total) {
      courseSet(blocksStep, "state", "done", "every planning sketch: no building block needed");
      courseSet(blocksStep, "result", fillTerm("blocksNone", {}), "every planning sketch: no building block needed");
      courseSet(blocksStep, "statusLabel", undefined, "decided for every unit");
      courseSet(blocksStep, "next", undefined, "decided for every unit");
    } else if (sketched.length && noneNeeded.length === sketched.length && blocksStep.state !== "done") {
      courseSet(blocksStep, "statusLabel", fillTerm("blocksPerUnit", { unit: unitWord, k: sketched.length, N: total }), "decided with each planning sketch");
      courseSet(blocksStep, "next", undefined, "the label says it");
    }
  }
  // Checking the course: after the last unit; meanwhile it names the units already approved.
  const checkCourseStep = stepFor("check");
  const approvedUnits = journal.units.filter(unit => unit.approved && unit.material);
  if (checkCourseStep && ["planned", "optional"].includes(checkCourseStep.state)) {
    const label = approvedUnits.length ? fillTerm("checkCourseLater", { unit: unitWord, units: approvedUnits.map(unit => `${unitWord} ${unit.n}`).join(", ") }) : undefined;
    if (label || String(checkCourseStep.statusLabel ?? "").startsWith(fillTerm("checkCourseLater", { unit: unitWord }).split("{")[0].split(" – ")[0])) courseSet(checkCourseStep, "statusLabel", label, "units approved so far");
  }
  // Publishing: required when learners open the course by link or platform (Course Profile → Delivery).
  const publishStep = stepFor("publish");
  if (publishStep && ["link", "platform"].includes(journal.delivery) && publishStep.state === "optional") {
    courseSet(publishStep, "state", "planned", `learners open the course by ${journal.delivery}`);
    courseSet(publishStep, "statusLabel", fillTerm("publishNeeded", { units: unitsWord }), `learners open the course by ${journal.delivery}`);
  }

  // Sections marked "when needed" (tracks.mjs → laterMarker): one entry each, in the order of the journal.
  if (data.process) {
    const later = (journal.later ?? []).map(key => {
      const heading = journal.headings.find(item => item.key === key);
      return { label: heading?.suffix ?? key, href: `agent:teaching/activate-section?section=${sectionSlug(key)}` };
    });
    set(data.process, "later", later.length ? later : undefined, "process.later", "sections marked when needed");
  }

  // next: the command follows the journal. While it is right, the agent's title and why stay; the button
  // label comes from the language pack when it has one, so overview, action lines and chat use one word.
  // A step text that quotes the old label gets the new one.
  if (expected) {
    if (data.next && accepts(expected, data.next.href)) {
      if (data.next.href === expected.href) {
        set(data.next, "command", expected.command, "next.command", "readable command of the next action");
        set(data.next, "icon", expected.icon, "next.icon", "icon of the next action");
      }
      const label = wordsOf(expected, journal, { unit: unitWord, units: unitsWord, n: nextUnit, id: expected.params.id ?? expected.params.name })?.label;
      const before = data.next.label;
      if (label && before && label !== before) {
        set(data.next, "label", label, "next.label", "button word of the language pack");
        // A new button word (same command, another state, e.g. check → re-check) brings its own why – when the
        // old why is the pack's why of another action; a why of the agent's own stays (SK53).
        const values = { unit: unitWord, units: unitsWord, n: nextUnit };
        const why = wordsOf(expected, journal, values)?.why;
        const keys = Object.keys(journal.pack?.actions ?? (journal.language === "en" ? englishActions : {}));
        const packWhy = keys.some(key => key !== expected.key && wordsOf({ ...expected, key }, journal, values)?.why === data.next.why);
        if (why && packWhy) set(data.next, "why", why, "next.why", "why of the new button word");
        for (const step of data.process?.steps ?? []) for (const field of ["why", "result", "next"]) {
          if (typeof step[field] === "string" && step[field].includes(before)) set(step, field, step[field].split(before).join(label), `process step "${step.title}".${field}`, "quotes the button word");
        }
      }
    } else {
      // The step texts that still send the instructor to the old next action are the agent's to rewrite.
      const before = data.next?.label;
      if (before) for (const step of data.process?.steps ?? []) for (const field of ["why", "result", "next"]) {
        if (typeof step[field] === "string" && step[field].includes(before)) missing.push({ where: "step", step: step.title, field, old: before, action: expected });
      }
      const words = wordsOf(expected, journal, { unit: unitWord, units: unitsWord, n: nextUnit, id: expected.params.id ?? expected.params.name });
      const title = nextTitle(expected, data, unitWord, { track: journal.track, convertMode: journal.convertMode }) ?? words?.title ?? words?.label;
      // A why the agent has just written for the new step (it differs from the one in the journal) stays (SP56).
      const fresh = typeof data.next?.why === "string" && data.next.why.trim() && previous && data.next.why !== previous.next?.why;
      if (!words || !title) missing.push({ where: "next", action: expected, title });
      else set(data, "next", { icon: expected.icon, title, why: fresh ? data.next.why : words.why, label: words.label, href: expected.href, command: expected.command },
        "next", `next action by the journal: ${expected.command}`);
    }
  }

  // A running "let it be prepared" is a state, not a button (R12-SK75): the view shows it without a link.
  if (data.next) set(data.next, "running", expected?.key === "build-running" ? true : undefined, "next.running", expected?.key === "build-running" ? "let it be prepared is running" : "nothing runs");

  // The step `next` advances is the one in progress – in the course and in its unit: a planned (or optional)
  // one becomes current; another current course step contradicts `next` and is the agent's to rewrite.
  if (expected) {
    const steps = data.process?.steps ?? [];
    const target = courseStepOf(expected, steps, { track: journal.track, convertMode: journal.convertMode });
    if (target && ["planned", "optional"].includes(target.state)) set(target, "state", "current", `process step "${target.title}".state`, "the step the next action advances");
    if (target) for (const step of steps) {
      if (step !== target && step.state === "current") missing.push({ where: "current", step: step.title, target: target.title, action: expected });
    }
    const n = expected.params.number ?? expected.params.file;
    const unit = n == null ? null : (data.units ?? []).find(item => String(item.id) === String(n));
    const unitStep = unit && unitStepOf(expected, unit.process?.steps ?? []);
    if (unitStep && ["planned", "optional"].includes(unitStep.state)) set(unitStep, "state", "current", `units[${n}] step "${unitStep.title}".state`, "the step the next action advances");
  }

  const iconOf = item => item?.icon || (String(item?.href ?? "").startsWith("agent:") ? "▶️" : "");
  // "More options": the cards of the second way for the next unit, of the templates and of a brief while they
  // are not `next` (actions.mjs → exploreCards); a right card keeps its words, a managed card no longer
  // right goes. Never the icon of `next`: these cards use ➕.
  if (expected) {
    const { cards, managed } = exploreCards(journal, expected, data.next?.href);
    const explore = Array.isArray(data.explore) ? data.explore : [];
    // A course step that may come first stands `alongside` the next button (the view shows it there).
    const result = explore.filter(item => !managed.test(String(item.href ?? "")) || cards.some(card => accepts(card, item.href)))
      // Any card – managed or the agent's – with the icon of `next` (an agent: link without one shows ▶️) gets ➕ (SK32).
      .map(item => iconOf(item) && iconOf(item) === iconOf(data.next) ? { ...item, icon: "➕" } : item)
      .map(item => {
        const card = cards.find(card => accepts(card, item.href));
        if (card?.alongside && !item.alongside) return { ...item, alongside: true };
        if (card && !card.alongside && item.alongside) { const { alongside, ...rest } = item; return rest; }
        return item;
      });
    for (const card of cards.filter(card => !explore.some(item => accepts(card, item.href)))) {
      const words = wordsOf(card, journal, { unit: unitWord, units: unitsWord, n: card.params.number, id: card.params.id ?? card.params.name });
      if (!words) { missing.push({ where: "explore", action: card }); continue; }
      result.push({ icon: card.icon, title: words.title ?? words.label, description: words.why, label: words.label, href: card.href, command: card.command, ...(card.alongside ? { alongside: true } : {}) });
    }
    if (result.length || data.explore) set(data, "explore", result, "explore", "cards of the second way, the templates and a brief");
  }

  // The one-line note under ## Sessions ("planned in the agenda …", "{n} of {N} created …") also stands in
  // the overview, above the units; none once every unit is created or without an agenda.
  const note = sessionsNote(journal, (expected, values) => wordsOf(expected, journal, { unit: unitWord, units: unitsWord, ...values }));
  const noteText = note?.words?.label?.replace(/^_|_$/g, "");
  set(data, "unitsNote", noteText || undefined, "unitsNote", "one-line note under ## Sessions");

  // Unit words from the terminology and the ## Sessions suffix.
  const sessionsSuffix = journal.headings.find(heading => heading.key === "Sessions")?.suffix;
  if (sessionsSuffix) set(data, "unitsTitle", sessionsSuffix, "unitsTitle", "suffix of ## Sessions");
  if (journal.terminology || sessionsSuffix) {
    // An inflected plural the agent wrote ("von 4 Modulen") stays while it starts with the suffix's word.
    const own = data.unitLabel?.many;
    const keepsOwn = own && sessionsSuffix && own.toLowerCase().startsWith(sessionsSuffix.toLowerCase());
    const label = { one: journal.terminology ?? data.unitLabel?.one ?? sessionsSuffix, many: keepsOwn ? own : sessionsSuffix ?? own ?? journal.terminology };
    set(data, "unitLabel", label, "unitLabel", "terminology (sessions-called) and suffix of ## Sessions");
  }

  // The footer dates the derived state ("As of {date}" from the pack), renewed only when something else
  // changed. An event in it ("planning sketch saved") would outlive the next step, so none is kept (SK31).
  const datePattern = /\d{4}-\d{2}-\d{2}|\d{1,2}\.\s?\d{1,2}\.\s?\d{4}|\d{1,2}\/\d{1,2}\/\d{4}/;
  const old = typeof data.footer === "string" ? data.footer.match(datePattern)?.[0] ?? null : null;
  if (changes.length) {
    const now = date ?? today(journal.language, old);
    const text = String(journal.terms?.asOf ?? englishTerms.asOf).replace("{date}", now);
    if (data.footer !== text) set(data, "footer", text, "footer", "date of the derived state");
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
export const missingText = item => item.where === "current"
  ? `- process step "${item.step}" is current, but the next action (${item.action.command}) advances "${item.target}" – rewrite "${item.step}" (state and words: done, or planned with when it comes) in the draft and run again`
  : item.where === "step"
  ? `- process step "${item.step}".${item.field} still names the old next action "${item.old}", but the next action is now ${item.action.command} – rewrite that step (its state and words) in the draft and run again`
  : item.where === "next"
  ? `- next: the next action is ${item.action.href} (command "${item.action.command}", icon ${item.action.icon}${item.title ? `, title "${item.title}"` : ""}) – write its title, label and why in the course language into the draft's next and run again`
  : item.where === "explore" ? `- explore: add the card ${item.action.href} (command "${item.action.command}", icon ➕) with title, description and label in the course language to the draft and run again`
  : item.where.startsWith("one-line note") ? `- ${item.where}: write it in the course language (${item.action.key === "note-planned" ? "the units are planned in the agenda and created one after another, starting with unit 1" : "{n} of {N} units created; unit {m} follows once unit {k} is done"}) and run again`
  : `- ${item.where}: the action is [${item.action.icon} <label>](${item.action.href}) ${item.action.code} – write that link in the course language (keep the link and the command) and run again`;

const shown = value => value === undefined ? "–" : typeof value === "string" ? `"${value.length > 70 ? `${value.slice(0, 69)}…` : value}"` : JSON.stringify(value).slice(0, 90);
// A new `next` is listed with its words uncut: the agent quotes its label in step texts and the chat link.
const shownNext = next => ["title", "label", "command"].filter(key => next?.[key]).map(key => `${key} "${next[key]}"`).join(", ");
export const describe = change => change.path === "next" && change.to && typeof change.to === "object"
  ? `- next: ${shown(change.from?.href ?? change.from)} → ${shownNext(change.to)} (${change.why})`
  : `- ${change.path}: ${shown(change.from)} → ${shown(change.to)} (${change.why})`;

// Derive a draft object against the journal file; used by write-dashboard.mjs before it writes.
export function deriveForJournal(journalFile, draft, options) {
  const source = readFileSync(journalFile, "utf8");
  const journal = readJournal(source, { projectDir: dirname(resolve(journalFile)), packs: loadPacks() });
  const block = source.match(/```json @Dashboard\.View\n([\s\S]*?)\n```/)?.[1];
  let previous = null;
  try { previous = block ? JSON.parse(block) : null; } catch { previous = null; }
  const derived = derive(journal, draft, { previous, ...options });
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
    console.log("Words still to write (no language pack has them, or a step contradicts the next action):");
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
