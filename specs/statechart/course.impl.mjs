// Guards of course.machine.json (E20). Context: { journal, states, selected } as actions.mjs → courseNext gets
// them: `states` maps unit number → overview state, `selected` is the recommended unit.
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createMachine } from "./interpreter.mjs";
import { awaitsOwnMedia, outlineShort, unitIsCourseCheck } from "../dashboard/actions.mjs";
import { unitByMachine } from "./unit.impl.mjs";

const here = dirname(fileURLToPath(import.meta.url));
export const courseConfig = JSON.parse(readFileSync(resolve(here, "course.machine.json"), "utf8"));

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

// Which unit a hand-over state means.
const unitOf = {
  working,
  unplanned: c => c.journal.units.find(unit => !unit.heading),
  one: c => c.journal.units.find(unit => unit.n === "1"),
  designOpen
};

// The machine's next action for the course: { path, action, unit? }. A unit state asks that unit's machine;
// the design track turns its "revise" into a targeted fix (tasks/validate-course.md → Design track).
export function courseByMachine(journal, states, selected) {
  const context = { journal, states, selected };
  const { path } = courseMachine.resolve(context);
  const meta = courseMachine.meta(path);
  if (!meta.unit) return { path: path.join("."), action: meta.action ?? null };
  const unit = unitOf[meta.unit](context);
  let action = unitByMachine(unit, { selected }).action;
  if (meta.variant === "design" && action === "revise-unit") action = "revise-unit:quick-fix";
  return { path: path.join("."), action, unit: unit.n };
}
