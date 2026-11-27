// Guards of course.machine.json (E20). Context: { journal, states, selected } as actions.mjs → courseNext gets
// them: `states` maps unit number → overview state, `selected` is the recommended unit.
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createMachine } from "./interpreter.mjs";
import { unitByMachine } from "./unit.impl.mjs";

const here = dirname(fileURLToPath(import.meta.url));
export const courseConfig = JSON.parse(readFileSync(resolve(here, "course.machine.json"), "utf8"));

// Fact readers the dashboard scripts share (actions.mjs re-exports them).
// Approved by the instructor, passed, nothing changed since – and only own photos still to come (SK55): the
// unit no longer holds the course back; its photo stays a card ("insert images") until it arrives.
export function awaitsOwnMedia(unit) {
  const waiting = unit.images?.waiting ?? 0;
  return Boolean(unit.approved && unit.material && unit.report?.result === "PASS" && !unit.report.changedSince && !unit.report.stale
    && waiting > 0 && unit.images.open === waiting);
}
// The course frame plans more units than the outline describes; false where either count is not readable (T5-67).
export const outlineShort = journal => journal.unitsPlanned != null && journal.unitsInOutline != null && journal.unitsPlanned > journal.unitsInOutline;
// The units the outline does not describe yet: "2", or "2–4" (T5-89).
export const missingUnits = journal => journal.unitsInOutline + 1 === journal.unitsPlanned ? String(journal.unitsPlanned) : `${journal.unitsInOutline + 1}–${journal.unitsPlanned}`;
// A light track with exactly one unit: its check, once passed, approved and unchanged since, is the course check.
// The design track has no course check of its own: every unit done (at least one) is the check.
export function unitIsCourseCheck(journal, states) {
  if (journal.track === "design") return journal.units.length > 0 && journal.units.every(unit => states.get(unit.n) === "done");
  return ["mini", "convert"].includes(journal.track) && journal.units.length === 1 && journal.units[0].n === "1" && states.get("1") === "done";
}

// Does a brief's `__Used in:__` name unit n (as actions.mjs → names).
const names = (usedIn, n) => /\b(all|alle|allen)\b/i.test(usedIn)
  || [...usedIn.matchAll(/(\d+)\s*[–-]\s*(\d+)/g)].some(([, from, to]) => Number(n) >= Number(from) && Number(n) <= Number(to))
  || new RegExp(`(^|\\D)${n}(\\D|$)`).test(usedIn);

const open = c => unit => c.states.get(unit.n) !== "done" && !awaitsOwnMedia(unit);
const working = c => c.journal.units.find(unit => unit.n === String(c.selected) && open(c)(unit)) ?? c.journal.units.find(unit => unit.heading && open(c)(unit));
const brief = c => c.journal.templates.briefs.find(item => !c.journal.templates.adopted.includes(item.id));
const coursePassed = c => c.journal.validation?.mode === "course" && c.journal.validation?.result === "PASS";
const scope = c => c.journal.designScope ?? "both";
const lookSet = c => scope(c) === "images" ? Boolean(c.journal.filled["Visual Identity"]) : c.journal.visualTheme?.length > 0;
const needsLink = c => ["link", "platform", "open"].includes(c.journal.delivery) && !c.journal.published;
const designOpen = c => c.journal.units.find(unit => c.states.get(unit.n) !== "done" && !awaitsOwnMedia(unit)) ?? c.journal.units.find(unit => c.states.get(unit.n) !== "done");

const facts = {
  lightTrack: c => ["mini", "convert"].includes(c.journal.track),
  templateTrack: c => c.journal.track === "template",
  designTrack: c => c.journal.track === "design",
  miniTrack: c => c.journal.track === "mini",
  noFrame: c => !c.journal.filled["Course Context"],
  noOutline: c => !c.journal.filled.Outline,
  outlineShort: c => outlineShort(c.journal),
  noDidactics: c => !c.journal.filled.Didactics,
  briefForWorkingUnit: c => { const b = brief(c), w = working(c); return Boolean(b && (!w || names(b.usedIn, w.n))); },
  briefReady: c => brief(c).state === "ready to test",
  workingUnit: c => Boolean(working(c)),
  blocksOpen: c => c.journal.templates.selection === "open" && !brief(c) && !c.journal.hasAgenda,
  agendaMissing: c => c.journal.agendaRequired === "yes" && !c.journal.hasAgenda,
  unplannedUnit: c => c.journal.units.some(unit => !unit.heading),
  courseFailedOnlyOnOwnMedia: c => c.journal.validation.mode === "course" && c.journal.validation.result === "FAIL"
    && c.journal.units.some(awaitsOwnMedia) && c.journal.units.every(unit => awaitsOwnMedia(unit) || c.states.get(unit.n) === "done"),
  courseCheckOpen: c => c.journal.units.length > 0 && !coursePassed(c),
  publishOpen: c => coursePassed(c) && !c.journal.published,
  accessOpen: c => c.journal.delivery === "open",
  lightOutlineMissing: c => !c.journal.filled.Outline && (c.journal.track === "mini" || c.journal.convertMode === "rebuild"),
  unitOneWithoutMaterial: c => !c.journal.units.find(unit => unit.n === "1")?.material,
  unitOneOpen: c => { const unit = c.journal.units.find(item => item.n === "1"); return c.states.get("1") !== "done" && !awaitsOwnMedia(unit); },
  lightCourseCheckOpen: c => !unitIsCourseCheck(c.journal, c.states) && !coursePassed(c),
  lightPublishOpen: needsLink,
  lookNotSet: c => !lookSet(c),
  scopeImages: c => scope(c) === "images",
  themeToApply: c => scope(c) !== "images" && c.journal.units.some(unit => unit.themeApplied === false),
  imagesToReview: c => scope(c) !== "look" && c.journal.units.some(unit => !unit.imagesReviewed),
  designUnitOpen: c => Boolean(designOpen(c)),
  designPublishOpen: c => unitIsCourseCheck(c.journal, c.states) && needsLink(c),
  noBrief: c => !c.journal.templates.briefs[0],
  published: c => Boolean(c.journal.published),
  briefApproved: c => c.journal.templates.briefs[0].state === "approved"
};
const guards = Object.fromEntries(Object.entries(facts).map(([name, fn]) => [name, ({ context }) => fn(context)]));
export const courseMachine = createMachine(courseConfig, { guards });

// Which unit a state means: the hand-over states, and the units course actions name.
export const unitOf = {
  working,
  unplanned: c => c.journal.units.find(unit => !unit.heading),
  one: c => c.journal.units.find(unit => unit.n === "1"),
  designOpen,
  unreviewed: c => c.journal.units.find(unit => !unit.imagesReviewed),
  waitingMedia: c => c.journal.units.find(awaitsOwnMedia)
};
export const briefOf = brief;

// The machine's next action for the course: { path, action, unit? }. A unit state asks that unit's machine;
// the design track turns its "revise" into a targeted fix (tasks/validate-course.md → Design track).
export function courseByMachine(journal, states, selected) {
  const context = { journal, states, selected };
  const { path } = courseMachine.resolve(context);
  const meta = courseMachine.meta(path);
  if (!meta.unit) return { path: path.join("."), action: meta.action ?? null, meta, context };
  const unit = unitOf[meta.unit](context);
  const own = unitByMachine(unit, { selected }).action;
  const action = meta.variant === "design" && own === "revise-unit" ? "revise-unit:quick-fix" : own;
  return { path: path.join("."), action, unit, meta, context };
}
