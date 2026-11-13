// Module for derive-dashboard.mjs (no command of its own).
import { sessionsOverview } from "./journal-model.mjs";
import { stepsOf } from "./tracks.mjs";
// Which action comes next: the main action of each unit (data/journal-links.md → the `### {n}. {title}` row)
// and the course's `next` (tasks/update-dashboard.md step 2 and Rules). It decides the command; the words
// for it come from the agent (kept while the command is right) or from the language pack's `actions`
// (English below), so that a changed command never keeps a label of another one.

// Label, title and why of each action in English; a language pack overrides them under `actions`.
// {unit} is the course's word for one unit, {n} its number, {id} a template id.
export const englishActions = {
  "init-course": { title: "Set the frame", label: "Start course", why: "Topic, target group and format are the basis for learning objectives and material." },
  "create-outline": { title: "Outline and learning objectives", label: "Create outline", why: "Clear learning objectives say what the learners can do at the end." },
  // The course frame plans more units than the outline describes (T5-67): the same command, its own words.
  "complete-outline": { title: "Outline and learning objectives", label: "Complete the outline", why: "Learning objectives and a slide plan are still missing for {unit} {k}. We settle them first – then the assistant knows what to write." },
  "create-didactics": { title: "Didactics", label: "Create didactics", why: "Methods, activity types and support that fit the objectives and the learners." },
  "suggest-templates": { title: "Templates for activities", label: "Suggest templates", why: "Ready-made building blocks for the activities – or the decision that none is needed." },
  "develop-template": { title: "Templates for activities", label: "Develop the building block {id}", why: "A building block of your own for an activity that no ready-made one covers." },
  "adopt-template": { title: "Templates for activities", label: "Try and adopt {id}", why: "The building block is ready: try it, then adopt it into the course." },
  "create-agenda": { title: "Agenda", label: "Create agenda", why: "Order and time of the units in your lessons." },
  "plan-unit": { label: "Plan {unit} {n}", why: "The planning sketch fixes content, activities and self-check before material is written." },
  "work-out": { label: "Work out {unit} {n}", why: "Texts, activities and self-check are written together; you see every part first." },
  "insert-images": { label: "Insert images for {unit} {n}", why: "The marked spots get their pictures." },
  "check-unit": { label: "Check {unit} {n}", why: "The check shows whether the material fits the objectives and the time." },
  "recheck-unit": { label: "Re-check {unit} {n}", why: "Points were changed after the check; a short re-check looks at the changed pages." },
  "revise-unit": { label: "Revise {unit} {n}", why: "The check found points that need correcting." },
  "resolve-concerns": { label: "Check {unit} {n}: resolve concerns", why: "The check passed with concerns that need your decision." },
  "concerns-waiting": { label: "Check {unit} {n}: decide once you have looked", why: "A point of the check waits for your look at the learners' device; then decide it here." },
  "approve-unit": { label: "Look at {unit} {n} and approve", why: "The check passed; the material waits for your approval." },
  "build-running": { label: "{unit} {n} is being prepared", why: "The assistant is writing, illustrating and checking the material on its own – nothing to do for you. Afterwards you look at it together." },
  "approve-waiting": { label: "Look at {unit} {n} and approve", why: "The check passed; your own photo can come after the approval." },
  "view-unit": { label: "How learners see it", why: "The checked material as the learners see it." },
  "check-course": { title: "Check and revise", label: "Check the course", why: "The course check comes before publishing." },
  publish: { title: "Publish", label: "Publish course", why: "The checked course gets a link to share." },
  // Delivery open (T5-54): a decision of the instructor, no command – said in the chat once it is known.
  "decide-access": { title: "Publish", label: "Settle access", why: "How the learners open the course is still open. Tell me in the chat as soon as you know – then publishing follows." },
  // The light tracks (mini course, conversion, building block).
  "write-mini-course": { title: "Write the material", label: "Write the course", why: "The short course is written in one go from the frame, without outline and didactics." },
  "convert-course": { title: "Write the material", label: "Start converting", why: "The existing material is carried over into a LiaScript course." },
  "start-template": { title: "Request and brief", label: "Start the building block", why: "Describe what the building block should do; the brief is the basis for building it." },
  "publish-template": { title: "Publish", label: "Publish the building block {id}", why: "The building block is approved; publishing makes it available to others." },
  // The design track (look and/or images of an existing course).
  "design-look": { title: "Look", label: "Set the look", why: "Colours, fonts and the style of the images – what the course already has and what it should feel like." },
  // Scope images: only the style of the images is set, the colours and fonts stay.
  "design-image-style": { title: "Images", label: "Set the image style", why: "The style of the images – what the course already has and what new pictures should look like." },
  "apply-theme": { title: "Look", label: "Apply the look", why: "The new look goes into every course file; you see before and after first." },
  "review-images": { label: "Review images", why: "You decide for each picture: keep it, make it new, replace it or remove it." },
  "activate-section": { label: "Add" },
  // Action lines of the sections and the cards under "More options".
  "revise-context": { label: "Revise course frame" },
  "revise-outline": { label: "Revise outline" },
  "revise-didactics": { label: "Revise didactics" },
  "revise-agenda": { label: "Revise agenda" },
  "visual-identity": { label: "Visual identity" },
  "didactics-first": { label: "Didactics first" },
  "agenda-first": { label: "Agenda first" },
  "create-unit": { label: "Create {unit}" },
  "check-units": { label: "Check {units}" },
  "build-unit": { title: "Let {unit} {n} be prepared", label: "Let {unit} {n} be prepared", why: "After a short planning sketch the assistant writes and checks the material alone; you look at it afterwards." },
  // The one-line note under ## Sessions (tasks/update-dashboard.md → Rules).
  "note-planned": { label: "_The {units} are planned in the agenda and are created one after another, starting with {unit} 1._" },
  "note-progress": { label: "_{n} of {N} {units} created; {unit} {m} follows once {unit} {k} is done._" },
  "note-ready": { label: "_{n} of {N} {units} created; {unit} {k} is approved – {unit} {m} can start now._" }
};

// The global process steps of templates/journal.md, by position: the title of `next` for a course action.
const agentIcons = { artist: "🎨", learner: "🧑‍🎓", development: "🛠️" };

// An action: the agent: link, the readable command (Dashboard) and the command as inline code (action line).
export function action(key, agent, cmd, params = {}, icon) {
  const query = Object.entries(params).map(([name, value]) => `${name}=${encodeURIComponent(value)}`).join("&");
  const typed = `:${cmd}${Object.values(params).length ? ` ${Object.values(params).join(" ")}` : ""}`;
  return {
    key, agent, cmd, params,
    icon: icon ?? agentIcons[agent] ?? "▶️",
    href: `agent:${agent}/${cmd}${query ? `?${query}` : ""}`,
    command: agent === "teaching" ? typed : `:agent ${agent} → ${typed}`,
    code: agent === "teaching" ? `\`${typed}\`` : `\`:agent ${agent}\` → \`${typed}\``,
    also: []
  };
}

// Settling the access (Delivery: open, T5-54): a step of the instructor without a command. Its href is the
// course frame (the overview needs a link target), the view shows it without a button (`next.decide`).
export function decideAccess(journal) {
  const anchor = journal.headings?.find(heading => heading.key === "Course Context")?.anchor ?? "#course-context";
  return { key: "decide-access", agent: null, cmd: null, params: {}, icon: "🔑", href: anchor, command: undefined, code: "", also: [], decide: true };
}
// After the passed course check: publishing, or settling the access first while it is open.
const publishOrDecide = journal => journal.delivery === "open" ? decideAccess(journal) : action("publish", "development", "create-project", {}, "🚀");

// Approved by the instructor, passed, nothing changed since – and only own photos still to come (SK55): the
// unit no longer holds the course back; its photo stays a card ("insert images") until it arrives.
export function awaitsOwnMedia(unit) {
  const waiting = unit.images?.waiting ?? 0;
  return Boolean(unit.approved && unit.material && unit.report?.result === "PASS" && !unit.report.changedSince && !unit.report.stale
    && waiting > 0 && unit.images.open === waiting);
}

// The main action of a unit, or null where it needs a judgement the journal does not record (then the
// agent's action stays). `also`: other actions that are right in the same state (the agent's choice).
export function unitAction(unit) {
  const n = unit.n;
  const report = unit.report;
  // An own photo the instructor still has to supply does not hold the check back (SK41): it stays open
  // ("images 9 of 10"), the check runs, and afterwards it is the step that is left.
  const waiting = unit.images.waiting ?? 0;
  const imagesOpen = unit.images.open - waiting > 0;
  // No planning sketch yet: plan it first, also when material already exists (an existing course taken over
  // by :analyze-existing) – the check stores its report in the unit's ### subsection.
  if (!unit.heading) return action("plan-unit", "teaching", "create-session", { number: n });
  // "Let it be prepared" is running (confirmed with the sketch, no report yet): the button says so and leads
  // back to the same run, never to the joint way (SK58).
  if (unit.buildRequested && !report?.result) return action("build-running", "teaching", "build-session", { number: n }, "⏳");
  if (!unit.material) return { ...action("work-out", "teaching", "coauthor-materials", { number: n }), also: [`agent:teaching/build-session?number=${n}`] };
  // A report of an older version of the material (a spot added after the check, T5-41): the re-check first.
  if (report?.result && report.stale) return action("recheck-unit", "teaching", "validate-course", { number: n }, "🔍");
  // Before a check, and after changes since one: the open images first, then the (re-)check.
  if (!report?.result || report.changedSince) {
    if (imagesOpen) return action("insert-images", "artist", "create-image", { number: n });
    return action(report?.result ? "recheck-unit" : "check-unit", "teaching", "validate-course", { number: n }, "🔍");
  }
  // FAIL: a small correction (quick-fix with its description) is the agent's call, revising is the default.
  if (report.result === "FAIL") return { ...action("revise-unit", "teaching", "coauthor-materials", { number: n }, "✏️"), also: [`agent:teaching/quick-fix?number=${n}&`] };
  // Concerns that all wait for the instructor's look keep the same command, but the button says so (SK47).
  if (report.result === "PASS with concerns") return action(report.concernsWaiting ? "concerns-waiting" : "resolve-concerns", "teaching", "validate-course", { number: n }, "🔍");
  if (imagesOpen) return action("insert-images", "artist", "create-image", { number: n });
  // Only own photos left: approving does not wait for them (SK55, SP78); once approved, the photo is what is left.
  if (waiting) return unit.approved ? action("insert-images", "artist", "create-image", { number: n })
    : action("approve-waiting", "teaching", "preview", { file: n }, "👁");
  // ⏳ items other than images (e.g. generated pictures): which step produces them is the agent's call.
  if (report.deferred) return null;
  if (!unit.done || !unit.approved) return action("approve-unit", "teaching", "preview", { file: n }, "👁");
  return action("view-unit", "teaching", "preview", { file: n }, "👁");
}

// Does a brief's `__Used in:__` name unit n: by number, by range ("2–4") or all of them ("all units")?
function names(usedIn, n) {
  return /\b(all|alle|allen)\b/i.test(usedIn)
    || [...usedIn.matchAll(/(\d+)\s*[–-]\s*(\d+)/g)].some(([, from, to]) => Number(n) >= Number(from) && Number(n) <= Number(to))
    || new RegExp(`(^|\\D)${n}(\\D|$)`).test(usedIn);
}

// The course's next action (tasks/update-dashboard.md step 2, Rules → Template step, first unit).
// `states`: unit number → derived state; `selected`: the recommended unit of the overview.
export function courseNext(journal, states, selected) {
  if (journal.track === "mini" || journal.track === "convert") return lightNext(journal, states);
  if (journal.track === "template") return templateNext(journal);
  if (journal.track === "design") return designNext(journal, states);
  if (!journal.filled["Course Context"]) return action("init-course", "teaching", "init-course");
  if (!journal.filled.Outline) return action("create-outline", "teaching", "create-outline");
  // More units planned (Course Profile → Units) than the outline describes, e.g. after a mini → full switch (T5-67).
  if (outlineShort(journal)) return { ...action("complete-outline", "teaching", "create-outline"), values: { N: journal.unitsPlanned, m: journal.unitsInOutline, k: missingUnits(journal) } };
  if (!journal.filled.Didactics) return action("create-didactics", "teaching", "create-didactics");
  // The unit being worked on: the recommended one (also before its planning sketch) while it is not done,
  // else the first begun unit that is not done. Begun = it has its planning sketch; existing material without
  // one (improve-existing) does not hold the course steps back.
  const open = unit => states.get(unit.n) !== "done" && !awaitsOwnMedia(unit);
  const working = journal.units.find(unit => unit.n === String(selected) && open(unit))
    ?? journal.units.find(unit => unit.heading && open(unit));
  const { selection, adopted, briefs } = journal.templates;
  const brief = briefs.find(item => !adopted.includes(item.id));
  if (brief && (!working || names(brief.usedIn, working.n))) {
    return brief.state === "ready to test"
      ? action("adopt-template", "teaching", "manage-templates", { name: brief.id })
      : action("develop-template", "development", "develop-template", { id: brief.id });
  }
  if (working) return unitAction(working);
  if (selection === "open" && !brief && !journal.hasAgenda) return action("suggest-templates", "teaching", "suggest-templates");
  if (journal.agendaRequired === "yes" && !journal.hasAgenda) return action("create-agenda", "teaching", "create-agenda");
  const unplanned = journal.units.find(unit => !unit.heading);
  if (unplanned) {
    const approvedOne = journal.units.some(unit => unit.approved);
    return { ...unitAction(unplanned), also: approvedOne ? [`agent:teaching/build-session?number=${unplanned.n}`] : [] };
  }
  // A course check that failed only because own photos are still to come: the photo is next, not another
  // check (R12c-SK93).
  const waitingMedia = journal.units.filter(awaitsOwnMedia);
  if (journal.validation.mode === "course" && journal.validation.result === "FAIL" && waitingMedia.length
    && journal.units.every(unit => awaitsOwnMedia(unit) || states.get(unit.n) === "done")) {
    // It finishes the course check, so that course step stays the one in progress.
    return { ...action("insert-images", "artist", "create-image", { number: waitingMedia[0].n }), courseKey: "check-course" };
  }
  if (journal.units.length && !(journal.validation.mode === "course" && journal.validation.result === "PASS")) return action("check-course", "teaching", "validate-course", {}, "🔍");
  if (journal.validation.mode === "course" && journal.validation.result === "PASS" && !journal.published) return publishOrDecide(journal);
  return null;
}

// The course frame plans more units than the outline describes; false where either count is not readable.
// The units the outline does not describe yet: "2", or "2–4" (T5-89).
const missingUnits = journal => journal.unitsInOutline + 1 === journal.unitsPlanned ? String(journal.unitsPlanned) : `${journal.unitsInOutline + 1}–${journal.unitsPlanned}`;
export const outlineShort = journal => journal.unitsPlanned != null && journal.unitsInOutline != null && journal.unitsPlanned > journal.unitsInOutline;

// The light tracks. mini and convert: frame, (outline), the one unit, publish only where the delivery needs a link.
function lightNext(journal, states) {
  if (!journal.filled["Course Context"]) return action("init-course", "teaching", "init-course");
  const mini = journal.track === "mini";
  if (!journal.filled.Outline && (mini || journal.convertMode === "rebuild")) return action("create-outline", "teaching", "create-outline");
  const unit = journal.units.find(item => item.n === "1");
  if (!unit?.material) return mini ? action("write-mini-course", "teaching", "create-mini-course") : action("convert-course", "teaching", "convert-course");
  if (states.get("1") !== "done" && !awaitsOwnMedia(unit)) return lightUnitAction(unit);
  // Publishing needs a passed course check, as on the full track; the unit check refreshes it (one unit, one run).
  // With exactly one unit, that unit checked, approved and unchanged since (state done) is the course check –
  // a course summary that still says FAIL does not hold publishing back (T5-53).
  if (!unitIsCourseCheck(journal, states) && !(journal.validation?.mode === "course" && journal.validation?.result === "PASS")) return action("check-course", "teaching", "validate-course", {}, "🔍");
  if (["link", "platform", "open"].includes(journal.delivery) && !journal.published) return publishOrDecide(journal);
  return null;
}

// A light track with exactly one unit: its check, once passed, approved and unchanged since, is the course check.
// The design track has no course check of its own: every unit done (at least one) is the check.
export function unitIsCourseCheck(journal, states) {
  if (journal.track === "design") return journal.units.length > 0 && journal.units.every(unit => states.get(unit.n) === "done");
  return ["mini", "convert"].includes(journal.track) && journal.units.length === 1 && journal.units[0].n === "1" && states.get("1") === "done";
}

// The design track: the frame, the look (scope look/both: set, then applied to every course file), the images
// (scope images: their style first; images/both: each unit reviewed), each unit's check, publishing where the
// delivery needs a link. No scope reads as both.
function designNext(journal, states) {
  if (!journal.filled["Course Context"]) return action("init-course", "teaching", "init-course");
  const scope = journal.designScope ?? "both";
  if (!lookSet(journal)) return lookAction(journal);
  if (scope !== "images" && journal.units.some(unit => unit.themeApplied === false)) return action("apply-theme", "artist", "apply-theme");
  if (scope !== "look") {
    const unreviewed = journal.units.find(unit => !unit.imagesReviewed);
    if (unreviewed) return action("review-images", "artist", "review-images", { number: unreviewed.n });
  }
  // A unit only waiting for own photos does not hold the others back; once it is the last one left, its own
  // action (the photo, the approval) is next – never nothing while work is left.
  const open = journal.units.find(unit => states.get(unit.n) !== "done" && !awaitsOwnMedia(unit))
    ?? journal.units.find(unit => states.get(unit.n) !== "done");
  if (open) return designUnitAction(open, journal);
  if (unitIsCourseCheck(journal, states) && ["link", "platform", "open"].includes(journal.delivery) && !journal.published) return publishOrDecide(journal);
  return null;
}

// A design unit's main action, in the order of designNext: the look (set, then applied to its course file), its
// images reviewed, then as on every track – its open images, the check, the approval.
// The look is set: scope look/both – a theme in ## Visual Identity; scope images – the section filled (image style).
const lookAction = journal => action((journal.designScope ?? "both") === "images" ? "design-image-style" : "design-look", "artist", "create-visuals");
const lookSet = journal => (journal.designScope ?? "both") === "images" ? Boolean(journal.filled["Visual Identity"]) : journal.visualTheme?.length > 0;

export function designUnitAction(unit, journal) {
  const scope = journal.designScope ?? "both";
  if (!lookSet(journal)) return lookAction(journal);
  if (scope !== "images" && unit.themeApplied === false) return action("apply-theme", "artist", "apply-theme");
  if (scope !== "look" && !unit.imagesReviewed) return action("review-images", "artist", "review-images", { number: unit.n });
  const next = unitAction(unit);
  // A failed design check found points in the header, image lines, alt texts or credits: a targeted fix, never
  // co-authoring the content (tasks/validate-course.md → Design track: design check only).
  if (next?.key === "revise-unit") return action("revise-unit", "teaching", "quick-fix", { number: unit.n }, "✏️");
  return next;
}

// On a light track unit 1 is the course: an action that writes the material (or inserts images before a
// check) advances the course step "material", any other one – the check, its images, the approval – "check" (T5-21).
function lightUnitAction(unit) {
  const next = unitAction(unit);
  if (!next) return next;
  const material = ["plan-unit", "work-out", "build-running"].includes(next.key) || (next.key === "insert-images" && !unit.report?.result);
  return material ? next : { ...next, courseKey: "check-course" };
}

// The building-block track: request and brief, build with the instructor, publish.
function templateNext(journal) {
  if (!journal.filled["Course Context"]) return action("init-course", "teaching", "init-course");
  const brief = journal.templates.briefs[0];
  if (!brief) return action("start-template", "development", "start-template");
  if (journal.published) return null;
  if (brief.state === "approved") return action("publish-template", "development", "publish-template", { id: brief.id });
  return action("develop-template", "development", "develop-template", { id: brief.id });
}

// Is an existing href right for this action: the same command with at least the same parameters (the agent
// may pass more, e.g. a type), or one of the agent's alternatives (`also`; ending in "&": any parameters after it).
const parse = href => {
  const [path, query = ""] = String(href ?? "").split("?");
  return { path, params: Object.fromEntries(query.split("&").filter(Boolean).map(pair => pair.split("=").map(decodeURIComponent))) };
};
// Extra parameters keep an action (a description for quick-fix), except a unit or file the wanted action does
// not name: validate-course?number=4 checks one unit, not the course (R12b).
const scopes = ["number", "file"];
const covers = (wanted, href) => {
  const [want, have] = [parse(wanted), parse(href)];
  return want.path === have.path && Object.entries(want.params).every(([name, value]) => have.params[name] === value)
    && scopes.every(name => name in want.params || !(name in have.params));
};
export const accepts = (expected, href) => Boolean(href) && (covers(expected.href, href)
  || expected.also.some(other => other.endsWith("&") ? String(href).startsWith(other) : covers(other, href)));

// The words of an action in the course language, or null when no pack has them (the agent writes them).
export function wordsOf(expected, journal, values) {
  const words = journal.pack?.actions?.[expected.key] ?? (journal.language === "en" ? englishActions[expected.key] : null);
  if (!words) return null;
  // {n} without a value: the unit of the action itself (an action line of ## Sessions, SK54).
  const own = { n: expected.params?.number ?? expected.params?.file, ...(expected.values ?? {}) };
  const fill = text => text == null ? text : String(text).replace(/\{(\w+)\}/g, (match, name) => values[name] ?? own[name] ?? match);
  return { title: fill(words.title), label: fill(words.label), why: fill(words.why) };
}

// The unit step a unit action advances, among that unit's steps (null for other actions).
export function unitStepOf(expected, steps = []) {
  return {
    "plan-unit": steps[0],
    "work-out": steps.find(item => /materi/i.test(item.title)) ?? steps[1],
    "build-running": steps.find(item => /materi/i.test(item.title)) ?? steps[1],
    "insert-images": steps.find(item => /\b(bilder|images?|fotos?|photos?)\b/i.test(item.title)),
    "review-images": steps.find(item => /\b(bilder|images?|fotos?|photos?)\b/i.test(item.title)),
  }[expected.key] ?? (["check-unit", "recheck-unit", "revise-unit", "resolve-concerns", "concerns-waiting", "approve-unit", "approve-waiting"].includes(expected.key)
    ? steps.find(item => /prüf|check|review|revis/i.test(item.title)) ?? steps.at(-1) : null);
}

// The step key (tracks.mjs) of a course action, by track; null for actions without a course step of their own.
const stepKeys = { "init-course": "frame", "create-outline": "outline", "complete-outline": "outline", "create-didactics": "didactics", "suggest-templates": "blocks", "adopt-template": "blocks",
  "develop-template": "blocks", "create-agenda": "agenda", "check-course": "check", publish: "publish", "decide-access": "publish", "publish-template": "publish",
  "start-template": "brief", "write-mini-course": "material", "convert-course": "material" };

// The design track: the look and image actions advance their step, every other unit action the check. With scope
// images (no look step) the image style belongs to the images; with scope look a stray image action to the check.
const designStepKeys = { "design-look": "look", "design-image-style": "images", "apply-theme": "look", "review-images": "images", "insert-images": "images" };
function designStepOf(key, expected, list) {
  let stepKey = designStepKeys[key] ?? stepKeys[key] ?? (expected.params.number != null || expected.params.file != null ? "check" : null);
  if (stepKey === "look" && !list.includes("look")) stepKey = "images";
  if (stepKey === "images" && !list.includes("images")) stepKey = "check";
  return stepKey;
}

// The course step an action advances: its own one, or for a unit action the material step. `keys`: the step key of
// each shown step (journal-model.mjs → courseStepKeys); without it, by position in the track's list. `mode`: the
// track mode (journal-model.mjs → trackMode); `convertMode` is its older name.
export function courseStepOf(expected, steps = [], { track = "full", mode, convertMode = null, keys = null } = {}) {
  const key = expected.courseKey ?? expected.key;
  if (track === "full" || !track) {
    const list = keys ?? stepsOf("full");
    if (key in stepKeys && list.includes(stepKeys[key])) return steps[list.indexOf(stepKeys[key])] ?? null;
    if (key in stepKeys) return null;
    return expected.params.number != null || expected.params.file != null ? steps.find(item => /materi/i.test(item.title)) ?? steps[list.indexOf("material")] ?? null : null;
  }
  const list = stepsOf(track, mode !== undefined ? mode : convertMode);
  if (track === "design") {
    const index = list.indexOf(designStepOf(key, expected, list));
    return index >= 0 ? steps[index] ?? null : null;
  }
  let stepKey = key === "init-course" && track === "template" ? "brief" : key === "develop-template" && track === "template" ? "build" : stepKeys[key];
  if (!stepKey && (expected.params.number != null || expected.params.file != null)) stepKey = "material";
  // The mini track writes its short outline within the frame step.
  if (stepKey === "outline" && !list.includes("outline")) stepKey = "frame";
  const index = stepKey ? list.indexOf(stepKey) : -1;
  return index >= 0 ? steps[index] ?? null : null;
}

// The title of `next`: the step it advances, as the process panel shows it (Rules → "next names one step").
export function nextTitle(expected, data, unitWord, { track = "full", mode, convertMode = null, keys = null } = {}) {
  const n = expected.params.number ?? expected.params.file;
  if (track && track !== "full" && (n == null || track === "design")) {
    // The design track's units have their own steps (look, images, the unit check): a unit action names its unit's
    // step, as on the full track – the title the validator expects; else the course step with the unit it concerns.
    const own = n != null && unitStepOf(expected, data.units?.find(unit => String(unit.id) === String(n))?.process?.steps ?? []);
    if (own) return `${own.title} – ${unitWord} ${n}`;
    const light = courseStepOf(expected, data.process?.steps ?? [], { track, mode, convertMode });
    return light?.title ? (n == null ? light.title : `${light.title} – ${unitWord} ${n}`) : null;
  }
  if (expected.key in stepKeys) return courseStepOf(expected, data.process?.steps ?? [], { track: "full", keys })?.title ?? null;
  const step = unitStepOf(expected, data.units?.find(unit => String(unit.id) === String(n))?.process?.steps ?? []);
  return step ? `${step.title} – ${unitWord} ${n}` : null;
}

// Each unit's action line (`<!-- class="journal-actions" -->` below `### {n}. {title}`): its main action and,
// once the material exists, 👁 how the learners see it. A link that is already right keeps its command; its
// button word comes from the language pack when the pack has one.
// Returns the new text, one entry per changed line, and the actions that still need words (no pack).
export function patchUnitActions(source, journal, wordsFor) {
  const lines = source.split("\n");
  const changes = [];
  const missing = [];
  const linkPattern = /\[([^\]]+)\]\(([^)\s]+)\)(\s*`[^`]*`(?:\s*→\s*`[^`]*`)?)?/g;
  for (const unit of journal.units.filter(item => item.heading)) {
    const at = lines.findIndex(line => line.startsWith(`### ${unit.n}. `));
    if (at < 0) continue;
    let marker = at + 1;
    while (marker < lines.length && !lines[marker].trim()) marker++;
    const hasLine = lines[marker]?.trim() === '<!-- class="journal-actions" -->';
    const old = hasLine ? lines[marker + 1] ?? "" : "";
    const links = [...old.matchAll(linkPattern)].map(match => ({ text: match[0].trim(), href: match[2] }));
    const expected = journal.track === "design" ? designUnitAction(unit, journal) : unitAction(unit);
    const preview = `agent:teaching/preview?file=${unit.n}`;
    let main = expected && links[0] && accepts(expected, links[0].href) ? relabel(links[0].text, expected.icon, wordsFor(expected, { n: unit.n })) : null;
    if (!expected) main = links[0]?.text ?? null;
    else if (!main) {
      const words = wordsFor(expected, { n: unit.n });
      if (!words) { missing.push({ where: `action line of ${unit.n}`, action: expected }); continue; }
      main = `[${expected.icon} ${words.label}](${expected.href}) ${expected.code}`;
    }
    const parts = [main];
    if (unit.material && expected?.href !== preview) {
      parts.push(links.find(link => link.href === preview)?.text ?? `[👁 ${journal.terms.viewMaterial}](${preview}) \`:preview ${unit.n}\``);
    }
    const next = parts.filter(Boolean).join(" · ");
    if (next === old) continue;
    changes.push({ path: `## Sessions action line ${unit.n}`, from: old || undefined, to: next, why: expected ? `main action: ${expected.command}` : "learners' view next to the main action" });
    if (hasLine) lines[marker + 1] = next;
    else lines.splice(at + 1, 0, "", '<!-- class="journal-actions" -->', next);
  }
  return { source: lines.join("\n"), changes, missing };
}

// The action lines of the core sections (data/journal-links.md → Action lines): ▶️ create while a section is
// empty, ✏️ revise once it is saved. `extras`: further links the table allows there (kept when present).
// `states`: unit number → derived state; once the unit check is the course check (unitIsCourseCheck), ## Sessions
// offers no course check.
function sectionLines(journal, nextUnplanned, approvedOne, states = new Map()) {
  const revise = (key, create, cmd, filled) => filled ? action(`revise-${key}`, "teaching", cmd, {}, "✏️") : action(create, "teaching", cmd);
  // Light tracks (mini, convert): exactly unit 1 – written by the track's own task, then checked; a second unit
  // is a track switch (tasks/activate-section.md), so no create-session here. The design track's units are the
  // existing course files: only the check.
  const light = journal.track === "mini" || journal.track === "convert";
  const firstWritten = journal.units.some(unit => unit.n === "1" && unit.material);
  const checkUnits = unitIsCourseCheck(journal, states) ? [] : [action("check-units", "teaching", "validate-course", {}, "🔍")];
  // Design: `:validate-course` without a number checks each unit not done – offered only once each of them is at its
  // check (look applied, images reviewed and inserted), never from the frame on.
  const notDone = journal.units.filter(unit => states.get(unit.n) !== "done");
  const designChecks = journal.track === "design" && notDone.length > 0 && notDone.every(unit => designUnitAction(unit, journal)?.cmd === "validate-course");
  const sessions = journal.track === "design" ? (designChecks ? checkUnits : [])
    : light ? (firstWritten ? checkUnits
      : [journal.track === "mini" ? action("write-mini-course", "teaching", "create-mini-course") : action("convert-course", "teaching", "convert-course")])
    : !journal.filled.Didactics ? [action("didactics-first", "teaching", "create-didactics")]
    : journal.agendaRequired === "yes" && !journal.hasAgenda ? [action("agenda-first", "teaching", "create-agenda")]
    : [action("create-unit", "teaching", "create-session"),
      ...(nextUnplanned && approvedOne ? [action("build-unit", "teaching", "build-session", { number: nextUnplanned.n })] : []),
      ...(journal.units.some(unit => unit.material) ? [action("check-units", "teaching", "validate-course", {}, "🔍")] : [])];
  return [
    { key: "Course Context", links: [revise("context", "init-course", "init-course", journal.filled["Course Context"])], extras: ["agent:teaching/analyze-existing"] },
    { key: "Outline", links: [revise("outline", "create-outline", "create-outline", journal.filled.Outline)], extras: [] },
    { key: "Didactics", links: [revise("didactics", "create-didactics", "create-didactics", journal.filled.Didactics), action("visual-identity", "artist", "create-visuals")], extras: [] },
    { key: "Agenda", links: [revise("agenda", "create-agenda", "create-agenda", journal.filled.Agenda)], extras: [] },
    { key: "Sessions", links: sessions, extras: [] }
  ];
}

// Icons compared without the emoji variation selector; ↻ is the older icon for revising.
const bareIcon = text => String(text).replace(/\uFE0F/g, "").replace(/^↻/, "✏").trim();
const sameIcon = (label, icon) => bareIcon(label).startsWith(bareIcon(icon));
const withIcon = (link, icon) => link.label.startsWith(icon) ? link.text : link.text.replace(/^\[[^\s\]]+/, `[${icon}`);
// A right link keeps its command but takes the button word of the language pack, when the pack has one.
const relabel = (text, icon, words) => words?.label ? text.replace(/^\[[^\]]*\]/, `[${icon} ${words.label}]`) : text;

// Rewrites the action lines of the core sections. A link that is already right – same command, same kind of
// icon – keeps its command and takes the button word of the language pack (an older form of its icon is renewed); links the table does not allow go.
// A line left without any link goes with its marker (an empty line would pass the marker on to the next block); the
// ## Sessions line comes back directly below its heading (where templates/journal.md has it) once links are due
// again and no marker stands before its first unit – never in a section marked when needed.
export function patchSectionActions(source, journal, wordsFor, states = new Map()) {
  const lines = source.split("\n");
  const changes = [];
  const missing = [];
  const linkPattern = /\[([^\]]+)\]\(([^)\s]+)\)(\s*`[^`]*`(?:\s*→\s*`[^`]*`)?)?/g;
  const nextUnplanned = journal.units.find(unit => !unit.heading && !unit.material);
  const approvedOne = journal.units.some(unit => unit.approved);
  for (const { key, links, extras } of sectionLines(journal, nextUnplanned, approvedOne, states)) {
    const at = lines.findIndex(line => new RegExp(`^## ${key}\\b`).test(line));
    if (at < 0) continue;
    let marker = at + 1;
    while (marker < lines.length && !lines[marker].trim()) marker++;
    const isMarker = line => line?.trim() === '<!-- class="journal-actions" -->';
    let insert = false;
    if (!isMarker(lines[marker])) {
      const end = lines.findIndex((line, index) => index > at && /^#{2,3} /.test(line));
      const region = lines.slice(at + 1, end < 0 ? lines.length : end);
      if (key !== "Sessions" || !links.length || (journal.later ?? []).includes("Sessions") || region.some(isMarker)) continue;
      insert = true;
    }
    const old = insert ? "" : lines[marker + 1] ?? "";
    const present = [...old.matchAll(linkPattern)].map(match => ({ text: match[0].trim(), href: match[2], label: match[1] }));
    const parts = [];
    let lacking = false;
    for (const expected of links) {
      const kept = present.find(link => accepts(expected, link.href) && sameIcon(link.label, expected.icon));
      if (kept) { parts.push(relabel(withIcon(kept, expected.icon), expected.icon, wordsFor(expected))); continue; }
      const words = wordsFor(expected);
      if (!words) { missing.push({ where: `action line of ## ${key}`, action: expected }); lacking = true; break; }
      parts.push(`[${expected.icon} ${words.label}](${expected.href}) ${expected.code}`);
    }
    if (lacking) continue;
    parts.push(...present.filter(link => extras.some(href => link.href.startsWith(href))).map(link => link.text));
    const next = parts.join(" · ");
    if (next === old) continue;
    changes.push({ path: `## ${key} action line`, from: old, to: next || undefined, why: next ? "actions that fit the state of the section" : "no action fits the state of the section" });
    if (insert) lines.splice(at + 1, 0, "", '<!-- class="journal-actions" -->', next);
    else if (next) lines[marker + 1] = next;
    else lines.splice(marker, lines[marker + 2]?.trim() === "" ? 3 : 2);
  }
  return { source: lines.join("\n"), changes, missing };
}

// The one-line note under ## Sessions once the agenda plans the units (tasks/update-dashboard.md → Rules):
// none created yet → planned in the agenda, starting with unit 1; some → "{n} of {N} created …"; all → none.
// Which note is due and its words (null words: no pack has them); also shown in the overview (`unitsNote`).
export function sessionsNote(journal, wordsFor) {
  if (!journal.hasAgenda) return null;
  const created = journal.units.filter(unit => unit.heading);
  const total = journal.units.length;
  // The last created unit approved and only waiting for own photos: the next one may start now (SK55).
  const ready = created.length && awaitsOwnMedia(created.at(-1));
  const key = !created.length ? "note-planned" : created.length < total ? (ready ? "note-ready" : "note-progress") : null;
  // k: the last created unit, m: the next one – it follows once k is done (courseNext).
  const m = journal.units.find(unit => !unit.heading)?.n;
  return { key, created, total, words: key && wordsFor({ key }, { n: created.length, N: total, k: created.at(-1)?.n, m }) };
}

export function patchSessionsNote(source, journal, wordsFor) {
  if (!journal.hasAgenda) return { source, changes: [], missing: [] };
  const { key, created, total, words } = sessionsNote(journal, wordsFor);
  if (key && !words) return { source, changes: [], missing: [{ where: "one-line note under ## Sessions", action: { key, icon: "", href: "", code: "" } }] };
  const lines = source.split("\n");
  const region = sessionsOverview(lines);
  if (!region) return { source, changes: [], missing: [] };
  const { start, end } = region;
  // The note itself: an italic line that speaks about the units being created (the template's empty-state
  // note, its pack translation, or one of the two notes here) – never another italic line.
  const known = [...(journal.pack?.unitLines ?? []), "after the didactics", "nach der Didaktik"].filter(line => /^_|after|nach/.test(line))
    .map(line => line.replace(/^_|_$/g, "").split(/\s+[–-]\s+/).at(-1).toLowerCase().slice(0, 20));
  const isNote = line => /^_.*_$/.test(line) && (/(starting with|beginnend mit|\d+ (of|von) \d+)/i.test(line) || known.some(tail => line.toLowerCase().includes(tail)));
  let comment = false, note = -1, before = -1;
  for (let index = start + 1; index < end; index++) {
    const line = lines[index];
    if (comment || /^\s*<!--/.test(line)) { comment = !line.includes("-->"); continue; }
    if (isNote(line.trim()) && note < 0) note = index;
    if (before < 0 && (/^\d+\.\s/.test(line) || /<details>/.test(line) || /^\|/.test(line))) before = index;
  }
  const wanted = words?.label ?? null;
  const old = note >= 0 ? lines[note] : undefined;
  if ((old ?? null) === wanted) return { source, changes: [], missing: [] };
  if (wanted && note >= 0) lines[note] = wanted;
  else if (wanted) lines.splice(before >= 0 ? before : end, 0, wanted, "");
  else lines.splice(note, lines[note + 1]?.trim() === "" ? 2 : 1);
  return { source: lines.join("\n"), changes: [{ path: "## Sessions one-line note", from: old, to: wanted ?? undefined, why: key ? `${created.length} of ${total} units created` : "all units created" }], missing: [] };
}

// The cards under "More options" this module manages (Rules → first unit, Template step): the second way for
// the next unit, the template suggestion and a brief's action while they are not `next`, and the agenda
// while templates are. Every other card stays the agent's.
const managedCard = /^agent:(artist\/create-image\?number=|teaching\/(build-session\?number=|create-session\?number=|suggest-templates$|create-agenda$|manage-templates\?name=)|development\/develop-template\?id=)/;
export function exploreCards(journal, expected, nextHref) {
  const cards = [];
  if (!expected) return { cards, managed: managedCard };
  const unit = expected.params.number;
  if (expected.key === "plan-unit" && journal.units.some(item => item.approved)) {
    // Two ways for the next unit: the one that is not `next` becomes a card right beside the button (SK59).
    cards.push({ ...(String(nextHref ?? "").startsWith("agent:teaching/build-session")
      ? action("plan-unit", "teaching", "create-session", { number: unit }, "➕")
      : action("build-unit", "teaching", "build-session", { number: unit }, "➕")), alongside: true });
  }
  // An approved unit that only waits for own photos: inserting them stays possible as a card (SK55).
  for (const item of journal.units.filter(awaitsOwnMedia)) {
    const card = action("insert-images", "artist", "create-image", { number: item.n }, "➕");
    if (!accepts(card, expected.href)) cards.push(card);
  }
  const { selection, adopted, briefs } = journal.templates;
  const brief = briefs.find(item => !adopted.includes(item.id));
  const briefAction = brief && (brief.state === "ready to test"
    ? action("adopt-template", "teaching", "manage-templates", { name: brief.id }, "➕")
    : action("develop-template", "development", "develop-template", { id: brief.id }, "➕"));
  // The template suggestion stays a card; it stands alongside the next button while the unit of `next` needs a
  // building block (its line from the planning sketch does not start with the word for "none").
  const nextUnit = journal.units.find(item => item.n === String(unit ?? ""));
  const none = String(journal.terms?.noBlocks ?? "none").toLowerCase();
  const needsBlock = Boolean(nextUnit?.blocks) && !nextUnit.blocks.toLowerCase().replace(/^[^\p{L}]+/u, "").startsWith(none);
  if (journal.filled.Didactics && selection === "open" && !brief && expected.key !== "suggest-templates") cards.push({ ...action("suggest-templates", "teaching", "suggest-templates", {}, "➕"), ...(needsBlock ? { alongside: true } : {}) });
  if (briefAction && !accepts(briefAction, expected.href)) cards.push(briefAction);
  // The agenda may come first while templates (their suggestion or a brief) are next: a card to bring it forward.
  const templatesNext = expected.key === "suggest-templates" || (briefAction && accepts(briefAction, expected.href));
  if (templatesNext && journal.agendaRequired === "yes" && !journal.hasAgenda) cards.push({ ...action("create-agenda", "teaching", "create-agenda", {}, "➕"), alongside: true });
  return { cards, managed: managedCard };
}
