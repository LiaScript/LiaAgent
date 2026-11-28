// Guards and actions of unit.machine.json (E20). Context: { unit, selected } – `unit` has the shape of
// journal-model.mjs → readJournal().units[i]; `selected` the recommended unit of the overview.
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createMachine } from "./interpreter.mjs";

const here = dirname(fileURLToPath(import.meta.url));
export const unitConfig = JSON.parse(readFileSync(resolve(here, "unit.machine.json"), "utf8"));

const r = c => c.unit.report ?? {};
const waiting = c => c.unit.images?.waiting ?? 0;
const facts = {
  noSketch: c => !c.unit.heading,
  noMaterial: c => !c.unit.material,
  hasMaterial: c => Boolean(c.unit.material),
  hasMaterialAndSketch: c => Boolean(c.unit.material && c.unit.heading),
  buildRunning: c => c.unit.buildRequested && !r(c).result,
  noResult: c => !r(c).result,
  hasResult: c => Boolean(r(c).result),
  noResultApproved: c => !r(c).result && c.unit.approved,
  stale: c => Boolean(r(c).result && r(c).stale),
  changed: c => Boolean(r(c).changedSince),
  changedOrStale: c => Boolean(r(c).changedSince || r(c).stale),
  failed: c => r(c).result === "FAIL",
  concerns: c => r(c).result === "PASS with concerns",
  concernsWaiting: c => Boolean(r(c).concernsWaiting),
  concernsNotWaiting: c => !r(c).concernsWaiting,
  imagesOpen: c => c.unit.images.open - waiting(c) > 0,
  ownPhotos: c => waiting(c) > 0,
  ownPhotosApproved: c => waiting(c) > 0 && c.unit.approved,
  deferred: c => Boolean(r(c).deferred),
  notDeferred: c => !r(c).deferred,
  approved: c => Boolean(c.unit.approved),
  notApproved: c => !c.unit.approved,
  notFinished: c => Boolean(r(c).deferred || !c.unit.done || !c.unit.approved),
  selected: c => String(c.selected) === c.unit.n,
  noMaterialSelected: c => !c.unit.material && String(c.selected) === c.unit.n
};
export const guards = Object.fromEntries(Object.entries(facts).map(([name, fn]) => [name, ({ context }) => fn(context)]));

// The fact change each task write makes – the "effect" of an event.
const set = (c, patch) => ({ unit: { ...c.unit, ...patch } });
const report = (c, patch) => set(c, { report: { ...(c.unit.report ?? {}), ...patch } });
const images = (c, patch) => set(c, { images: { ...c.unit.images, ...patch } });
const effects = {
  sketch: c => set(c, { heading: true }),
  requestBuild: c => set(c, { buildRequested: true }),
  writeMaterial: c => set(c, { material: true }),
  wantImage: c => images(c, { open: c.unit.images.open + 1 }),
  askPhoto: c => images(c, { open: c.unit.images.open + 1, waiting: waiting(c) + 1 }),
  insertImage: c => images(c, { open: c.unit.images.open - 1 }),
  photoArrived: c => images(c, { open: c.unit.images.open - 1, waiting: waiting(c) - 1 }),
  markStale: c => report(c, { stale: true }),
  // A check writes a fresh report: changes and staleness are gone, Done follows the result.
  checkPassed: c => ({ unit: { ...c.unit, done: true, report: { result: "PASS", changedSince: 0, stale: false, deferred: r(c).deferred ?? false } } }),
  checkConcerns: c => ({ unit: { ...c.unit, done: false, report: { result: "PASS with concerns", changedSince: 0, stale: false, concernsWaiting: false } } }),
  checkFailed: c => ({ unit: { ...c.unit, done: false, report: { result: "FAIL", changedSince: 0, stale: false } } }),
  recheckPassed: c => report(c, { changedSince: 0, stale: false }),
  change: c => report(c, { changedSince: (r(c).changedSince ?? 0) + 1 }),
  waitConcerns: c => report(c, { concernsWaiting: true }),
  resolveConcerns: c => ({ unit: { ...c.unit, done: true, report: { ...r(c), result: "PASS", concernsWaiting: false } } }),
  approve: c => set(c, { approved: true }),
  addDeferred: c => report(c, { deferred: true }),
  clearDeferred: c => report(c, { deferred: false })
};
export const actions = Object.fromEntries(Object.entries(effects).map(([name, fn]) => [name, ({ context }) => fn(context)]));

export const unitMachine = createMachine(unitConfig, { guards, actions });

// meta.display: a state, or a list of [guard, state] – the first whose guard holds (null = always).
export function displayOf(path, context, machine = unitMachine) {
  const display = machine.meta(path).display;
  if (!Array.isArray(display)) return display;
  return display.find(([guard]) => guard === null || facts[guard](context))[1];
}

// The machine's answer for one unit: the leaf, its button and its overview state.
export function unitByMachine(unit, { selected } = {}) {
  const context = { unit, selected };
  const { path } = unitMachine.resolve(context);
  return { path: path.join("."), action: unitMachine.meta(path).action ?? null, display: displayOf(path, context) };
}
