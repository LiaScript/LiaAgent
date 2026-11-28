// The workflow logic of actions.mjs before E21 (if-chains), kept only as the reference the statechart is
// tested against (specs/statechart/check.mjs). Not used by any script.
import { action } from "../dashboard/actions.mjs";
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
