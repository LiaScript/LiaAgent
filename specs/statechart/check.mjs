// E20: does the statechart say the same as the code it would replace? Run: node --test specs/statechart/check.mjs
// 1. Equivalence: every combination of unit facts → same button as actions.mjs → unitAction, same overview state
//    as derive-dashboard.mjs → unitState.
// 2. Model-based: from an empty unit, every event sequence (bounded) – the declared target of each transition
//    must contain the state the changed facts resolve to (the documented process and the journal agree).
import test from "node:test";
import assert from "node:assert/strict";
import { unitAction, courseNext, designUnitAction } from "../dashboard/actions.mjs";
import * as legacy from "./legacy.mjs";
import { unitState } from "../dashboard/derive-dashboard.mjs";
import { unitMachine, unitByMachine } from "./unit.impl.mjs";

const bools = [false, true];
export function* unitFacts() {
  const reports = [null, "PASS", "PASS with concerns", "FAIL"];
  const imageSets = [[0, 0], [1, 0], [1, 1], [2, 1], [2, 2]];
  for (const heading of bools) for (const material of bools) for (const buildRequested of bools)
  for (const result of reports) for (const stale of result ? bools : [false]) for (const changedSince of result ? [0, 1] : [0])
  for (const concernsWaiting of result === "PASS with concerns" ? bools : [false]) for (const deferred of result ? bools : [false])
  for (const [open, waiting] of imageSets) for (const approved of bools) for (const done of bools) {
    yield {
      n: "2", heading: heading ? "### 2" : null, material, buildRequested, approved, done,
      images: { total: open, placed: 0, open, waiting },
      report: result ? { result, stale, changedSince, concernsWaiting, deferred } : null
    };
  }
}

test("unit machine: same button and overview state as unitAction/unitState for every fact combination", () => {
  let cases = 0;
  const wrong = [];
  for (const unit of unitFacts()) for (const selected of ["2", "3"]) {
    cases++;
    const code = { action: legacy.unitAction(unit)?.key ?? null, display: unitState(unit, { selected }).state };
    const machine = unitByMachine(unit, { selected });
    if (code.action !== machine.action || code.display !== machine.display) wrong.push({ unit, selected, code, machine });
    // E21: actions.mjs builds the whole action (command, parameters, alternatives) from the machine.
    if (JSON.stringify(unitAction(unit)) !== JSON.stringify(legacy.unitAction(unit))) wrong.push({ unit, whole: true, now: unitAction(unit), before: legacy.unitAction(unit) });
  }
  console.log(`# ${cases} cases, ${wrong.length} differences`);
  for (const item of wrong.slice(0, 5)) console.log("#", JSON.stringify(item));
  assert.equal(wrong.length, 0);
});

test("unit machine: every transition lands where the changed facts resolve to (model-based, depth 9)", () => {
  const start = { unit: { n: "2", heading: null, material: false, buildRequested: false, approved: false, done: false, images: { total: 0, placed: 0, open: 0, waiting: 0 }, report: null }, selected: "2" };
  const events = ["SKETCH_SAVED", "BUILD_REQUESTED", "MATERIAL_WRITTEN", "IMAGE_WANTED", "PHOTO_ASKED", "IMAGE_INSERTED", "PHOTO_ARRIVED",
    "CHECK_PASSED", "CHECK_CONCERNS", "CHECK_FAILED", "RECHECK_PASSED", "CHANGED", "CONCERNS_WAIT", "CONCERNS_RESOLVED", "APPROVED", "DEFERRED_ADDED", "DEFERRED_CLEARED"];
  const key = context => JSON.stringify(context.unit);
  const seen = new Set();
  const reached = new Set();
  const fired = new Set();
  const wrong = [];
  let frontier = [unitMachine.resolve(start)];
  for (let depth = 0; depth < 9 && frontier.length; depth++) {
    const next = [];
    for (const state of frontier) {
      if (seen.has(key(state.context))) continue;
      seen.add(key(state.context));
      reached.add(state.path.join("."));
      for (const type of events) {
        const result = unitMachine.transition(state.path, { type }, state.context);
        if (!result) continue;
        if (result.context.unit.images.open > 2) continue;
        fired.add(type);
        const resolved = unitMachine.resolve(result.context).path.join(".");
        const declared = result.declared.join(".");
        if (!(resolved === declared || resolved.startsWith(declared + ".")) || resolved !== result.path.join("."))
          wrong.push({ from: state.path.join("."), event: type, declared, resolved, landed: result.path.join(".") });
        next.push(result);
      }
    }
    frontier = next;
  }
  const leaves = unitMachine.leaves().map(path => path.join("."));
  console.log(`# ${seen.size} fact states, leaves reached ${leaves.filter(l => reached.has(l)).length}/${leaves.length}, events fired ${fired.size}/${events.length}`);
  const missing = leaves.filter(l => !reached.has(l));
  if (missing.length) console.log("# never reached:", missing.join(", "));
  const unique = [...new Map(wrong.map(w => [`${w.from}|${w.event}|${w.resolved}`, w])).values()];
  for (const item of unique.slice(0, 10)) console.log("#", JSON.stringify(item));
  assert.equal(unique.length, 0);
});

// 3. Course machine: random journals (seeded) on every track → same next action as actions.mjs → courseNext.
import { courseByMachine, courseMachine } from "./course.impl.mjs";

export function randomJournals(count, seed = 20) {
  let s = seed;
  // mulberry32: a small seeded generator (the same journals on every run).
  const rnd = () => { s = (s + 0x6D2B79F5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const pick = list => list[Math.floor(rnd() * list.length)];
  const all = [...unitFacts()];
  const out = [];
  for (let i = 0; i < count; i++) {
    const track = pick(["full", "full", "full", "mini", "convert", "design", "template"]);
    const unitCount = pick([0, 1, 1, 2, 3]);
    const units = Array.from({ length: unitCount }, (_, k) => {
      const n = String(k + 1);
      const finished = { heading: "x", material: true, buildRequested: false, approved: true, done: true, images: { total: 0, placed: 0, open: 0, waiting: 0 }, report: { result: "PASS", stale: false, changedSince: 0, concernsWaiting: false, deferred: false } };
      const photo = { ...finished, images: { total: 1, placed: 0, open: 1, waiting: 1 } };
      const base = structuredClone(pick([finished, finished, finished, photo, pick(all), pick(all)]));
      return { ...base, n, heading: base.heading ? `### ${n}` : null, themeApplied: pick([null, true, false]), imagesReviewed: pick([false, true]) };
    });
    const briefs = pick([[], [], [{ id: "quiz", state: pick(["brief", "in development", "ready to test", "approved"]), usedIn: pick(["2", "all units", "1–2", "3"]) }]]);
    out.push({
      track, units, language: "en", headings: [],
      filled: { "Course Context": rnd() > 0.1, Outline: rnd() > 0.15, Didactics: rnd() > 0.15, "Visual Identity": rnd() > 0.5 },
      unitsPlanned: pick([null, unitCount, unitCount + 1, unitCount + 2]), unitsInOutline: pick([null, unitCount]),
      templates: { selection: pick(["open", "done", null]), adopted: briefs.length && rnd() > 0.7 ? ["quiz"] : [], briefs },
      hasAgenda: rnd() > 0.5, agendaRequired: pick(["yes", "no", null]),
      validation: { mode: pick(["course", "session", null]), result: pick(["PASS", "FAIL", null]) },
      published: rnd() > 0.7, delivery: pick(["link", "platform", "open", "print", "local", null]),
      convertMode: pick(["transfer", "rebuild", null]), designScope: pick(["look", "images", "both", null]),
      visualTheme: pick([[], ["sky"]]), selectedPick: pick(["1", "2", "3", null])
    });
  }
  return out;
}

test("course machine: same next action as courseNext on 200,000 random journals (all tracks)", () => {
  const wrong = [];
  const paths = new Set();
  for (const journal of randomJournals(200000)) {
    const selected = journal.selectedPick;
    const states = new Map(journal.units.map(unit => [unit.n, unitState(unit, { selected }).state]));
    const code = legacy.courseNext(journal, states, selected);
    const codeKey = code ? (code.key === "revise-unit" && code.cmd === "quick-fix" ? "revise-unit:quick-fix" : code.key) : null;
    const machine = courseByMachine(journal, states, selected);
    paths.add(machine.path);
    if (codeKey !== machine.action) wrong.push({ track: journal.track, code: codeKey, machine: machine.path });
    // E21: the whole action of courseNext and of every design unit is the same as before.
    const now = courseNext(journal, states, selected);
    if (JSON.stringify(now) !== JSON.stringify(code)) wrong.push({ track: journal.track, whole: true, path: machine.path, now, before: code });
    if (journal.track === "design") for (const unit of journal.units)
      if (JSON.stringify(designUnitAction(unit, journal)) !== JSON.stringify(legacy.designUnitAction(unit, journal))) wrong.push({ design: unit.n, now: designUnitAction(unit, journal) });
  }
  const leaves = courseMachine.leaves().map(path => path.join("."));
  console.log(`# 200000 journals, ${wrong.length} differences, course states reached ${leaves.filter(l => paths.has(l)).length}/${leaves.length}`);
  const missing = leaves.filter(l => !paths.has(l));
  if (missing.length) console.log("# never reached:", missing.join(", "));
  for (const item of wrong.slice(0, 8)) console.log("#", JSON.stringify(item));
  assert.equal(wrong.length, 0);
});
