import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, writeFileSync, existsSync, mkdtempSync, mkdirSync, rmSync, symlinkSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import "./dashboard.js";

const dashboard = globalThis.LiaDashboard;

test("macro-protected data preserves commas, quotes, and literal code fences", () => {
  const source = { title: 'Text, "Zitat", ```Code``` und ${keinCode}' };
  const json = JSON.stringify(source);
  assert.deepEqual(dashboard.parseInput("``` " + "```" + json + "``` ```"), source);
});

test("the same unit states determine totals and selection; drafts are unfinished", () => {
  const source = { completed: 99, total: 99, units: [
    { id: 1, title: "A", state: "done" },
    { id: 2, title: "B", state: "draft" },
    { id: 3, title: "C", state: "current" },
    { id: 4, title: "D", state: "review" }
  ] };
  const before = JSON.stringify(source);
  const model = dashboard.buildModel(source);
  assert.equal(model.completed, 1);
  assert.equal(model.total, 4);
  assert.equal(model.percent, 25);
  assert.equal(model.selected, "3");
  assert.equal(JSON.stringify(source), before);
});

test("an unstarted project has no fake unit or invalid progress bar", () => {
  const model = dashboard.buildModel({ title: "Neues Vorhaben" });
  assert.equal(model.selected, null);
  assert.equal(model.total, 0);
  assert.doesNotMatch(dashboard.progress(0, 0), /<progress/);
});

test("unknown states and conflicting IDs fail instead of manufacturing progress", () => {
  assert.throws(() => dashboard.buildModel({ units: [{ title: "A", state: "almost-done" }] }));
  assert.throws(() => dashboard.buildModel({ units: [{ id: 1, title: "A" }, { id: 1, title: "B" }] }));
  assert.throws(() => dashboard.buildModel({ units: [{ id: 1, title: "A" }], selected: 2 }));
  assert.throws(() => dashboard.progress(4, 2));
});

test("texts remain text and command links retain their readable fallback", () => {
  const html = dashboard.view("test", {
    title: '<img src=x onerror="alert(1)">',
    next: { label: "Weiter", href: "agent:teaching/help", command: ":help" }
  });
  assert.doesNotMatch(html, /<img/);
  assert.match(html, /&lt;img/);
  assert.match(html, /href="agent:teaching\/help"/);
  assert.match(html, /<code[^>]*>:help<\/code>/);
  assert.throws(() => dashboard.buildModel({ next: { href: "javascript:alert(1)" } }));
  assert.throws(() => dashboard.buildModel({ next: { href: "agent:teaching/help" } }));
});

test("links of open points and units are checked with the data, not only when rendering", () => {
  assert.throws(() => dashboard.buildModel({ decisions: [{ title: "A", how: "B", href: "agent:teaching/create-outline" }] }), /readable command/);
  assert.throws(() => dashboard.buildModel({ decisions: [{ title: "A", how: "B", href: "javascript:alert(1)" }] }), /not supported/);
  assert.throws(() => dashboard.buildModel({ units: [{ id: 1, title: "A", href: "javascript:alert(1)" }] }), /not supported/);
  assert.doesNotThrow(() => dashboard.buildModel({ units: [{ id: 1, title: "A", href: "#1.-a" }],
    decisions: [{ title: "A", how: "B", href: "agent:teaching/create-outline", command: ":create-outline" }, { title: "C", how: "D" }] }));
});

test("open decisions and the provisional plan render and validate", () => {
  const model = dashboard.buildModel({ title: "X", decisions: ["Ein Link oder mehrere?", { title: "Zeitbedarf", why: "Rahmen sagt 4 Stunden" }], plan: { note: "vorläufig", rows: [{ label: "Stunde 1", text: "Wolkenarten" }] } });
  assert.equal(model.decisions.length, 2);
  const html = dashboard.renderComponent("View", "t", { lang: "de", title: "X", decisions: ["A"], plan: { rows: [{ label: "Stunde 1", text: "Wolkenarten" }] } });
  assert.match(html, /Noch zu entscheiden/);
  assert.match(html, /Stunde 1/);
  assert.throws(() => dashboard.buildModel({ plan: { rows: [{ label: "Stunde 1" }] } }));
  assert.throws(() => dashboard.buildModel({ decisions: "kein Array" }));
});

test("open points are grouped by role; internal notes stay collapsed", () => {
  const html = dashboard.renderComponent("View", "k", { lang: "de", title: "X", decisions: [
    { title: "Ein Link oder mehrere?", kind: "decide", how: "Im Chat beantworten" },
    { title: "Kopfhörer-Verteiler besorgen", kind: "prepare", how: "Im Elektromarkt, ca. 10 €" },
    { title: "Kennung module doppelt", kind: "internal" }
  ] });
  assert.match(html, /Noch zu entscheiden/);
  assert.match(html, /Vor dem Einsatz vorbereiten/);
  assert.match(html, /<details class="dashboard-internal"><summary>1 technische Notiz/);
  assert.throws(() => dashboard.buildModel({ decisions: [{ title: "A", kind: "irgendwas" }] }));
});

test("a selected unit links to its plan in the process panel", () => {
  const html = dashboard.renderComponent("View", "u", { lang: "de", title: "X", units: [{ id: 1, title: "Stunde 1", state: "current", href: "#1.-stunde-1" }] });
  assert.match(html, /href="#1\.-stunde-1"[^>]*>Planung ansehen/);
});

test("a course entry returns from a unit to the global process", () => {
  const data = { lang: "de", title: "X", process: { title: "Kursplanung", steps: [{ title: "Lernziele", state: "done" }] },
    units: [{ id: 1, title: "Stunde 1", state: "current", process: { steps: [{ title: "Material", state: "current" }] } }] };
  const html = dashboard.renderComponent("View", "c", data);
  assert.match(html, /data-dashboard-select=""[^>]*>.*Gesamter Kurs/s);
  assert.match(html, /<h3>Stunde 1<\/h3>/);
  const course = dashboard.renderComponent("View", "c2", { ...data, selected: "" });
  assert.match(course, /dashboard-unit-selected" type="button" data-dashboard-select=""/);
  assert.match(course, /<h3>Kursplanung<\/h3>/);
  const withoutGlobal = dashboard.renderComponent("View", "c3", { ...data, process: undefined });
  assert.doesNotMatch(withoutGlobal, /Gesamter Kurs/);
});

test("action buttons show their icon; agent: links default to ▶️", () => {
  const html = dashboard.renderComponent("View", "i", { lang: "de", title: "X",
    next: { label: "Prüfen", href: "agent:teaching/validate-course", command: ":validate-course", icon: "🔍" },
    decisions: [{ title: "A", kind: "decide", how: "B", label: "Gliederung erstellen", href: "agent:teaching/create-outline", command: ":create-outline" }],
    explore: [{ icon: "💬", title: "Fragen", description: "D", label: "Hilfe", href: "agent:teaching/help", command: ":help" }],
    links: [{ label: "Lernziele", href: "#outline" }] });
  assert.match(html, /dashboard-button-primary"[^>]*><span class="dashboard-button-label"><span class="dashboard-button-icon" aria-hidden="true">🔍<\/span> Prüfen/);
  assert.match(html, /<span class="dashboard-button-icon" aria-hidden="true">▶️<\/span> Gliederung erstellen/);
  assert.match(html, /<span class="dashboard-button-icon" aria-hidden="true">💬<\/span> Hilfe/);
  assert.match(html, /<h4>Fragen<\/h4>/);
  assert.doesNotMatch(html, /dashboard-button-icon[^<]*<\/span> Lernziele/);
});

test("unit cards name the step that comes next, else count finished steps (SK24, SK29)", () => {
  const html = dashboard.renderComponent("View", "s", { lang: "de", title: "X", units: [{ id: 1, title: "Stunde 1", state: "current", process: { steps: [{ title: "A", state: "done" }, { title: "B", state: "current" }, { title: "C", state: "planned" }] } }] });
  assert.match(html, /dashboard-unit-steps">Als Nächstes: B</);
  assert.doesNotMatch(html, /von 3 Schritten/, "no count whose total grows when an optional step becomes required");
  // A current step without a result is the next one – nobody works on it yet; with a result it is in progress.
  assert.match(html, /<h4>B<\/h4><span class="dashboard-status dashboard-status-current"><span aria-hidden="true">●<\/span> Als Nächstes</);
  const working = dashboard.renderComponent("View", "s2", { lang: "de", title: "X", units: [{ id: 1, title: "Stunde 1", state: "current", process: { steps: [{ title: "B", state: "current", result: "Teil 1" }] } }] });
  assert.match(working, /<h4>B<\/h4><span class="dashboard-status dashboard-status-current"><span aria-hidden="true">●<\/span> In Arbeit</);
  assert.match(dashboard.renderComponent("View", "s3", { lang: "en", title: "X", units: [{ id: 1, title: "U", state: "current", process: { steps: [{ title: "B", state: "current" }] } }] }), /Up next: B/);
  const none = dashboard.renderComponent("View", "s4", { lang: "de", title: "X", units: [{ id: 1, title: "Stunde 1", state: "planned", process: { steps: [{ title: "A", state: "done" }, { title: "C", state: "planned" }] } }] });
  assert.match(none, /1 von 2 Schritten/);
  const fresh = dashboard.renderComponent("View", "s5", { lang: "de", title: "X", units: [{ id: 2, title: "Stunde 2", state: "planned", process: { steps: [{ title: "A", state: "planned" }, { title: "C", state: "planned" }] } }] });
  assert.doesNotMatch(fresh, /dashboard-unit-steps/, "a unit not begun shows no \"0 of 2\" (SK44)");
});

test("texts follow the course language; English is the fallback", () => {
  assert.match(dashboard.renderComponent("View", "de1", { lang: "de", title: "X" }), /<h3>Fertige Einheiten<\/h3>/);
  assert.match(dashboard.renderComponent("View", "en1", { lang: "en", title: "X" }), /<h3>Units finished<\/h3>/);
  assert.match(dashboard.renderComponent("View", "xx1", { lang: "fr", title: "X" }), /<h3>Units finished<\/h3>/);
});

test("labels translate the fixed texts for any course language", () => {
  const html = dashboard.renderComponent("View", "fr1", { lang: "fr", title: "X",
    labels: { progress: "Progression", unitsHint: "Choisissez une unité.", "state.done": "Terminé",
      progressText: { one: "{done} sur {total} {unit} est terminé", many: "{done} sur {total} {unit} sont terminés" },
      steps: "{done} sur {total} étapes" },
    unitLabel: { one: "module", many: "modules" },
    units: [{ id: "1", title: "A", state: "done" }, { id: "2", title: "B", state: "current", process: { steps: [{ title: "S", state: "done" }] } }] });
  assert.match(html, /<h3>Progression<\/h3>/);
  assert.match(html, /Choisissez une unité\./);
  assert.match(html, /Terminé/);
  assert.match(html, /1 sur 2 modules est terminé/);
  assert.match(html, /1 sur 1 étapes/);
  assert.match(html, /Course plan/, "keys without a label keep the built-in fallback");
});

test("texts from the data are escaped everywhere: labels, unit words, unit titles", () => {
  const evil = "<img src=x onerror=alert(1)>";
  const html = dashboard.renderComponent("View", "x1", { lang: "fr", title: "X",
    labels: { next: evil, why: evil, unitsHint: evil, how: evil, result: evil, showProcess: evil, steps: `${evil} {done}/{total}`, progressText: `{done} ${evil} {total} {unit}` },
    unitLabel: { one: evil, many: evil },
    next: { title: "N", why: "W", label: "Go", href: "#x" },
    decisions: [{ title: "D", kind: "decide", how: "H" }],
    units: [{ id: "1", title: "A", state: "done", process: { steps: [{ title: "S", state: "done", result: "R" }] } }, { id: "2", title: "B", state: "planned" }] });
  assert.doesNotMatch(html, /<img/);
  const empty = dashboard.renderComponent("View", "x2", { lang: "de", title: "X", unitsTitle: evil });
  assert.doesNotMatch(empty, /<img/);
});

test("labels are checked: unknown keys, wrong shapes and placeholders fail", () => {
  assert.throws(() => dashboard.buildModel({ labels: "Progression" }), /labels/);
  assert.throws(() => dashboard.buildModel({ labels: { progres: "Progression" } }), /progres/);
  assert.throws(() => dashboard.buildModel({ labels: { progress: { one: "a", many: "b" } } }), /progress/);
  assert.throws(() => dashboard.buildModel({ labels: { steps: { one: "{done}" } } }), /steps/);
  assert.throws(() => dashboard.buildModel({ labels: { steps: "{fait} sur {total}" } }), /\{fait\}/);
  assert.doesNotThrow(() => dashboard.buildModel({ labels: { internal: { one: "{n} note", many: "{n} notes" } } }));
});

test("labels survive switching the selected unit", () => {
  const listeners = [];
  const root = { dataset: { dashboardView: "fr2" }, innerHTML: "", querySelectorAll: () => [] };
  const page = { CustomEvent: class {}, document: { addEventListener: (type, fn) => listeners.push(fn), dispatchEvent: () => {}, documentElement: {} } };
  vm.runInNewContext(readFileSync(new URL("./dashboard.js", import.meta.url), "utf8"), page);
  page.LiaDashboard.renderComponent("View", "fr2", { lang: "fr", title: "X", labels: { result: "Disponible :" },
    units: [{ id: "1", title: "A", state: "current" }, { id: "2", title: "B", state: "planned", process: { steps: [{ title: "S", state: "done", result: "R" }] } }] });
  const control = { dataset: { dashboardSelect: "2" }, closest: () => root };
  listeners.forEach(fn => fn({ target: { closest: () => control }, preventDefault() {} }));
  assert.match(root.innerHTML, /Disponible :/);
});

test("counts agree in number: the verb follows the finished units, the noun the total", () => {
  // The unit after the finished ones is in progress: a bar at zero only appears once work has begun.
  const units = (done, total) => Array.from({ length: total }, (_, i) => ({ id: String(i + 1), title: "A", state: i < done ? "done" : i === done ? "current" : "planned" }));
  const de = (done, total) => dashboard.renderComponent("View", `de-${done}-${total}`, { lang: "de", title: "X", units: units(done, total) });
  const en = (done, total) => dashboard.renderComponent("View", `en-${done}-${total}`, { lang: "en", title: "X", units: units(done, total) });
  assert.match(de(1, 6), /1 von 6 Einheiten ist abgeschlossen/);
  assert.match(de(2, 6), /2 von 6 Einheiten sind abgeschlossen/);
  assert.doesNotMatch(de(0, 6), /<progress|0 von 6/, "no bar and no count at zero finished units");
  assert.match(de(1, 1), /1 von 1 Einheit ist abgeschlossen/);
  assert.match(en(1, 6), /1 of 6 units is done/);
  assert.match(en(2, 6), /2 of 6 units are done/);
  const step = lang => dashboard.renderComponent("View", `s-${lang}`, { lang, title: "X", units: [{ id: "1", title: "A", state: "current", process: { steps: [{ title: "S", state: "done" }] } }] });
  assert.match(step("de"), /1 von 1 Schritt</);
  assert.match(step("en"), /1 of 1 step</);
});

test("empty states use the course's word for units, and the panel titles are neutral", () => {
  const de = dashboard.renderComponent("View", "e1", { lang: "de", title: "X", unitsTitle: "Kapitel" });
  assert.match(de, /Noch keine Kapitel angelegt\./);
  assert.match(de, /sobald Kapitel angelegt sind/);
  assert.match(de, /<h3>Kapitel<\/h3>/);
  const plain = dashboard.renderComponent("View", "e2", { lang: "de", title: "X", process: { steps: [{ title: "A" }] } });
  assert.match(plain, /<h3>Einheiten<\/h3>/);
  assert.match(plain, /<h3>Arbeitsstand<\/h3>/);
  assert.doesNotMatch(plain, /Meine Einheiten|Unser Arbeitsstand/);
  const en = dashboard.renderComponent("View", "e3", { lang: "en", title: "X", unitsTitle: "Chapters" });
  assert.match(en, /No chapters yet\./);
});

test("unit label follows the course terminology", () => {
  const html = dashboard.renderComponent("View", "u", { lang: "de", title: "X", unitLabel: { one: "Modul", many: "Modulen" }, units: [{ id: "1", title: "A", state: "done" }, { id: "2", title: "B", state: "planned" }] });
  assert.match(html, /1 von 2 Modulen ist abgeschlossen/);
  const plain = dashboard.renderComponent("View", "v", { lang: "de", title: "X", units: [{ id: "1", title: "A", state: "done" }] });
  assert.match(plain, /1 von 1 Einheit ist abgeschlossen/);
  const linked = dashboard.renderComponent("View", "w", { lang: "de", title: "X", unitLabel: { one: "Modul", many: "Module" }, units: [{ id: "1", title: "A", state: "current", href: "#a" }] });
  assert.match(linked, />Planung ansehen /);
});

test("an anchor in an open point is a plain text link named after its target; agent: links stay buttons", () => {
  const html = dashboard.renderComponent("View", "d1", { lang: "de", title: "X", decisions: [
    { title: "Eine Frage?", kind: "decide", how: "B", href: "#outline" },
    { title: "Zweite Frage?", kind: "decide", how: "B", label: "Gliederung ansehen", href: "#outline" },
    { title: "Dritte Frage?", kind: "decide", how: "B", href: "agent:teaching/create-outline", command: ":create-outline" }
  ] });
  assert.match(html, /<a class="dashboard-decision-link" href="#outline">Mehr dazu /);
  assert.match(html, /<a class="dashboard-decision-link" href="#outline">Gliederung ansehen /);
  assert.doesNotMatch(html, /dashboard-button[^>]*href="#outline"/);
  assert.match(html, /dashboard-button" href="agent:teaching\/create-outline"/);
  assert.doesNotMatch(html, /<\/span> (Eine|Zweite|Dritte) Frage\?/, "the question is never the link or button text");
  assert.match(dashboard.renderComponent("View", "d2", { lang: "en", title: "X", decisions: [{ title: "Q?", how: "B", href: "#a" }] }), />More about this </);
});

test("with a provisional plan and no units, the progress line does not claim that no units exist", () => {
  const plan = { rows: [{ label: "Eine sehr lange Überschrift für die erste Einheit", text: "Inhalt" }] };
  const de = dashboard.renderComponent("View", "p1", { lang: "de", title: "X", unitsTitle: "Kapitel", plan });
  assert.match(de, /Die Kapitel sind erst vorläufig geplant\./);
  assert.doesNotMatch(de, /sobald Kapitel angelegt sind/);
  const en = dashboard.renderComponent("View", "p2", { lang: "en", title: "X", plan });
  assert.match(en, /The units are only provisionally planned\./);
  const own = dashboard.renderComponent("View", "p3", { lang: "fr", title: "X", plan, labels: { progressPlan: "Plan provisoire." } });
  assert.match(own, /Plan provisoire\./);
  const withUnits = dashboard.renderComponent("View", "p4", { lang: "de", title: "X", plan, units: [{ id: "1", title: "A", state: "planned" }] });
  assert.doesNotMatch(withUnits, /vorläufig geplant/);
});

test("a unit without work steps shows its state, its summary and a neutral empty text", () => {
  const data = { lang: "de", title: "X", selected: "2", units: [
    { id: "1", title: "A", state: "current", process: { steps: [{ title: "S", state: "current" }] } },
    { id: "2", title: "B", state: "planned", summary: "25 Minuten, eine Aufgabe." }] };
  const html = dashboard.renderComponent("View", "f1", data);
  const panel = html.split('class="dashboard-process"')[1];
  assert.match(panel, /dashboard-process-fallback"><span class="dashboard-status dashboard-status-planned">/);
  assert.match(panel, /<p class="dashboard-process-summary">25 Minuten, eine Aufgabe\.<\/p>/);
  assert.match(panel, /Hier sind noch keine Arbeitsschritte eingetragen\./);
  assert.doesNotMatch(html, /Ablauf/, "the empty text avoids words of the course plan");
  const en = dashboard.renderComponent("View", "f2", { ...data, lang: "en" });
  assert.match(en, /No work steps recorded here yet\./);
  const own = dashboard.renderComponent("View", "f3", { ...data, lang: "fr", labels: { processEmpty: "Aucune étape." } });
  assert.match(own, /Aucune étape\./);
  const course = dashboard.renderComponent("View", "f4", { lang: "de", title: "X" });
  assert.match(course, /Für den Kurs sind noch keine Arbeitsschritte eingetragen\./);
  assert.doesNotMatch(course, /dashboard-process-fallback/);
});

test("the progress line names its subject; labels and progressTitle still win", () => {
  const units = [{ id: "1", title: "A", state: "done" }, { id: "2", title: "B", state: "planned" }];
  assert.match(dashboard.renderComponent("View", "t1", { lang: "de", title: "X", unitsTitle: "Lerneinheiten", units }), /<h3>Fertige Lerneinheiten<\/h3>/);
  assert.match(dashboard.renderComponent("View", "t2", { lang: "de", title: "X", unitLabel: { one: "Modul", many: "Modulen" }, units }), /<h3>Fertige Einheiten<\/h3>/, "the dative form of unitLabel is never a heading");
  assert.match(dashboard.renderComponent("View", "t3", { lang: "en", title: "X", unitLabel: { one: "chapter", many: "chapters" }, units }), /<h3>Chapters finished<\/h3>/);
  assert.match(dashboard.renderComponent("View", "t4", { lang: "en", title: "X", unitsTitle: "Modules", units }), /<h3>Modules finished<\/h3>/);
  assert.match(dashboard.renderComponent("View", "t5", { lang: "fr", title: "X", labels: { progress: "Progression" }, units }), /<h3>Progression<\/h3>/);
  assert.match(dashboard.renderComponent("View", "t6", { lang: "de", title: "X", progressTitle: "Material", labels: { progress: "P" }, units }), /<h3>Material<\/h3>/);
});

test("the course entry says the planning is done and what runs now; without a current step it counts planning steps without optional ones (SK68)", () => {
  const steps = [{ title: "A", state: "done" }, { title: "B", state: "done" }, { title: "C", state: "current" }, { title: "D", state: "optional" }];
  const data = { title: "X", process: { steps }, units: [{ id: "1", title: "U", state: "planned", process: { steps } }] };
  const de = dashboard.renderComponent("View", "k1", { ...data, lang: "de" });
  assert.match(de, /dashboard-course[\s\S]*?Planung fertig · Jetzt: C</);
  assert.doesNotMatch(de, /von 3 Planungsschritten/);
  assert.match(de, /dashboard-unit-number" aria-hidden="true">1[\s\S]*?Als Nächstes: C/);
  assert.match(dashboard.renderComponent("View", "k2", { ...data, lang: "en" }), /Planning done · Now: C</);
  const open = dashboard.renderComponent("View", "k5", { ...data, lang: "de", process: { steps: [{ title: "A", state: "done" }, { title: "B", state: "planned" }, { title: "C", state: "current" }] } });
  assert.match(open, /dashboard-course[\s\S]*?dashboard-unit-steps">Jetzt: C</, "an open step before the current one: no 'planning done'");
  const labelled = dashboard.renderComponent("View", "k6", { ...data, lang: "de", process: { steps: [{ title: "A", state: "done" }, { title: "B", state: "planned", statusLabel: "wird je Einheit geprüft" }, { title: "C", state: "current" }] } });
  assert.match(labelled, /Planung fertig · Jetzt: C/, "a step with its own label does not hold the planning back");
  const one = dashboard.renderComponent("View", "k3", { lang: "de", title: "X", process: { steps: [{ title: "A", state: "done" }] }, units: [{ id: "1", title: "U", state: "current" }] });
  assert.match(one, /1 von 1 Planungsschritt</);
  const own = dashboard.renderComponent("View", "k4", { ...data, lang: "fr", process: { steps: steps.map(step => step.state === "current" ? { ...step, state: "planned" } : step) }, labels: { courseSteps: { one: "{done} sur {total} étape", many: "{done} sur {total} étapes de planification" } } });
  assert.match(own, /2 sur 3 étapes de planification/);
  assert.throws(() => dashboard.buildModel({ labels: { courseSteps: "{n} étapes" } }), /\{n\}/);
});

test("before any material exists, one sentence replaces the progress bar", () => {
  const planned = [{ id: "1", title: "A", state: "planned", process: { steps: [{ title: "S", state: "planned" }, { title: "P", state: "optional" }] } },
    { id: "2", title: "B", state: "planned", process: { steps: [{ title: "S", state: "planned" }] } }];
  const de = dashboard.renderComponent("View", "b1", { lang: "de", title: "X", unitLabel: { one: "Lerneinheit", many: "Lerneinheiten" }, units: planned });
  assert.match(de, /Noch nichts fertig – das Material beginnt mit Lerneinheit 1\./);
  assert.doesNotMatch(de, /<progress/);
  assert.doesNotMatch(de, /0 von 2/);
  const en = dashboard.renderComponent("View", "b2", { lang: "en", title: "X", unitLabel: { one: "chapter", many: "chapters" }, units: planned });
  assert.match(en, /Nothing finished yet – the material starts with chapter 1\./);
  assert.match(dashboard.renderComponent("View", "b3", { lang: "de", title: "X", units: planned }), /beginnt mit Einheit 1\./);
  const own = dashboard.renderComponent("View", "b4", { lang: "fr", title: "X", units: planned, unitLabel: { one: "module", many: "modules" }, labels: { progressStart: "Rien encore – on commence par {unit} {first}." } });
  assert.match(own, /Rien encore – on commence par module 1\./);
  assert.throws(() => dashboard.buildModel({ labels: { progressStart: "{done}" } }), /\{done\}/);
  // Once a step has begun but no unit is finished, the sentence names the running unit – still no bar at zero.
  const begun = structuredClone(planned);
  begun[0].process.steps[0].state = "current";
  const running = dashboard.renderComponent("View", "b5", { lang: "de", title: "X", units: begun });
  assert.match(running, /Noch nichts fertig – Einheit 1 ist in Arbeit, als Nächstes: S\./);
  assert.doesNotMatch(running, /<progress/);
});

test("after the first saved step: no bar at zero, the running unit and its steps instead (R5-D2)", () => {
  const steps = state => [{ title: "Entwurf", state }, { title: "Durchsicht", state: "planned" }, { title: "Prüfung", state: "planned" }, { title: "Teilen", state: "optional" }];
  const units = [{ id: "1", title: "A", state: "planned", process: { steps: steps("done") } },
    { id: "2", title: "B", state: "planned", process: { steps: steps("planned") } },
    { id: "3", title: "C", state: "planned", process: { steps: steps("planned") } },
    { id: "4", title: "D", state: "planned", process: { steps: steps("planned") } }];
  const data = { title: "X", unitLabel: { one: "Lerneinheit", many: "Lerneinheiten" }, units };
  const de = dashboard.renderComponent("View", "r1", { ...data, lang: "de" });
  assert.match(de, /Noch nichts fertig – Lerneinheit 1 ist in Arbeit\./, "no count whose total can grow");
  assert.doesNotMatch(de, /<progress|0 von 4|beginnt mit/);
  const en = dashboard.renderComponent("View", "r2", { ...data, lang: "en", unitLabel: { one: "chapter", many: "chapters" } });
  assert.match(en, /Nothing finished yet – chapter 1 is in progress\./);
  // A later unit that has begun is named, not the first one.
  const later = structuredClone(units);
  later[0].process.steps[0].state = "planned";
  later[2].process.steps[0].state = "done";
  assert.match(dashboard.renderComponent("View", "r3", { ...data, lang: "de", units: later }), /Lerneinheit 3 ist in Arbeit\./);
  const own = dashboard.renderComponent("View", "r4", { ...data, lang: "fr", unitLabel: { one: "module", many: "modules" },
    labels: { progressStarted: "Rien de terminé – {unit} {first} est en cours ({done} sur {total} étapes)." } });
  assert.match(own, /Rien de terminé – module 1 est en cours \(1 sur 3 étapes\)\./);
  assert.throws(() => dashboard.buildModel({ labels: { progressStarted: "{n}" } }), /\{n\}/);
  // The bar returns as soon as one unit is finished – also when its count is low.
  const finished = structuredClone(units);
  finished[0].state = "done";
  const bar = dashboard.renderComponent("View", "r5", { ...data, lang: "de", units: finished });
  assert.match(bar, /<progress value="1" max="4"/);
  assert.match(bar, /1 von 4 Lerneinheiten ist abgeschlossen/);
  assert.doesNotMatch(bar, /Noch nichts fertig/);
});

test("a planned unit with a done step shows the derived chip \"started\" (R5-D1)", () => {
  const unit = (extra = {}) => ({ id: "1", title: "A", state: "planned",
    process: { steps: [{ title: "S", state: "done" }, { title: "T", state: "planned" }, { title: "P", state: "optional" }] }, ...extra });
  const chip = html => html.match(/dashboard-unit-list[\s\S]*?dashboard-status dashboard-status-planned"><span aria-hidden="true">○<\/span> ([^<]*)</)?.[1];
  const de = dashboard.renderComponent("View", "st1", { lang: "de", title: "X", units: [unit()] });
  assert.equal(chip(de), "Angefangen");
  assert.match(de, /aria-label="A: Angefangen;/);
  assert.doesNotMatch(de, /Noch offen<\/span><span class="dashboard-unit-steps">1 von 2/);
  assert.equal(chip(dashboard.renderComponent("View", "st2", { lang: "en", title: "X", units: [unit()] })), "Started");
  assert.equal(chip(dashboard.renderComponent("View", "st3", { lang: "de", title: "X", units: [unit({ statusLabel: "Entwurf begonnen" })] })), "Entwurf begonnen", "an own statusLabel wins");
  assert.equal(chip(dashboard.renderComponent("View", "st4", { lang: "fr", title: "X", labels: { "state.started": "Commencé" }, units: [unit()] })), "Commencé");
  // Only required steps count: a done optional step or no done step keeps "not started".
  const optional = unit({ process: { steps: [{ title: "S", state: "planned" }, { title: "P", state: "done" }] } });
  optional.process.steps[1].state = "optional";
  assert.equal(chip(dashboard.renderComponent("View", "st5", { lang: "de", title: "X", units: [optional] })), "Noch offen");
  const current = dashboard.renderComponent("View", "st6", { lang: "de", title: "X", units: [unit({ state: "current" })] });
  assert.match(current, /dashboard-status-current"><span aria-hidden="true">●<\/span> In Arbeit/);
});

test("the course entry names the units with material while the material is produced (R5-D3, SK24, SK68)", () => {
  const unitSteps = first => [{ title: "Entwurf", state: first }, { title: "Durchsicht", state: "planned" }, { title: "Prüfung", state: "planned" }, { title: "Teilen", state: "optional" }];
  const course = current => [{ title: "A", state: "done" }, { title: "B", state: "done" }, { title: "C", state: "done" }, { title: "D", state: "done" },
    { title: "Material", state: current }, { title: "Prüfen", state: "planned" }, { title: "Veröffentlichen", state: "optional" }];
  const data = (first, current = "current") => ({ title: "X", process: { steps: course(current) },
    units: [1, 2, 3, 4].map(id => ({ id: String(id), title: `U${id}`, state: "planned", process: { steps: unitSteps(id === 1 ? first : "planned") },
      ...(id === 1 && first === "done" ? { view: { href: "materials/1.md" } } : {}) })) });
  const counter = html => html.match(/dashboard-course[\s\S]*?dashboard-unit-steps">([^<]*)</)?.[1];
  assert.equal(counter(dashboard.renderComponent("View", "m1", { ...data("done"), lang: "de" })), "Planung fertig · Jetzt: Material für 1 von 4 Einheiten");
  assert.equal(counter(dashboard.renderComponent("View", "m2", { ...data("done"), lang: "en" })), "Planning done · Now: Material for 1 of 4 units");
  assert.equal(counter(dashboard.renderComponent("View", "m3", { ...data("planned"), lang: "de" })), "Planung fertig · Jetzt: Material", "no unit count before a unit has material");
  assert.equal(counter(dashboard.renderComponent("View", "m4", { ...data("done", "done"), lang: "de" })), "5 von 6 Planungsschritten", "no partial value without a current course step");
  const own = dashboard.renderComponent("View", "m5", { ...data("done"), lang: "fr",
    unitLabel: { one: "module", many: "modules" }, labels: { coursePlanningDone: "Planification terminée", courseNow: "Maintenant : {step}", courseStepsMaterial: "matériel : {done} sur {total} {unit}" } });
  assert.equal(counter(own), "Planification terminée · Maintenant : matériel : 1 sur 4 modules");
  assert.equal(counter(dashboard.renderComponent("View", "m6", { ...data("done"), lang: "de", unitLabel: { one: "Lerneinheit", many: "Lerneinheiten" } })),
    "Planung fertig · Jetzt: Material für 1 von 4 Lerneinheiten");
  assert.throws(() => dashboard.buildModel({ labels: { courseStepsMaterial: "{n}" } }), /\{n\}/);
});

// Runs validate-journal.mjs on a minimal journal with the given Dashboard data.
// `sections`: further Markdown sections inserted before ## Dashboard; `files`: further project files {path: text}.
function validate(data, sections = "", files = {}) {
  const dir = mkdtempSync(join(tmpdir(), "dashboard-check-"));
  const file = join(dir, "journal.md");
  for (const [path, text] of Object.entries(files)) {
    mkdirSync(dirname(join(dir, path)), { recursive: true });
    writeFileSync(join(dir, path), text);
  }
  writeFileSync(file,`<!--\nlanguage: de\n-->\n\n# Kurs\n\n## Outline\n\nText\n\n${sections}## Dashboard\n\n\`\`\`json @Dashboard.View\n${JSON.stringify(data, null, 2)}\n\`\`\`\n`);
  const run = spawnSync(process.execPath, [fileURLToPath(new URL("./validate-journal.mjs", import.meta.url)), file], { encoding: "utf8" });
  rmSync(dir, { recursive: true, force: true });
  return { status: run.status, output: run.stdout + run.stderr };
}
const next = { title: "Weiter", why: "W", label: "Weiter", href: "agent:teaching/create-didactics", command: ":create-didactics" };

test("validate-journal accepts a clean Dashboard", () => {
  const result = validate({ title: "Kurs", next,
    decisions: [{ key: "a", title: "Frage?", how: "B", label: "Gliederung ansehen", href: "#outline" }],
    explore: [{ icon: "💬", title: "Fragen", description: "D", label: "Hilfe", href: "agent:teaching/help", command: ":help" }],
    process: { steps: [{ title: "Rahmen", state: "done", result: "3 Einheiten, ein Link für alles." }] } });
  assert.equal(result.status, 0, result.output);
});

test("validate-journal accepts only commands of an agent's commands: map in agent: links (data and action lines)", () => {
  const known = validate({ title: "Kurs", next, explore: [{ icon: "➕", title: "Bilder", description: "D", label: "Bilder", href: "agent:artist/create-image?number=1", command: ":create-image 1" },
    { icon: "🎨", title: "Gestaltung", description: "D", label: "Wechseln", href: "agent:artist/switch", command: ":agent artist" }] },
    "## Sessions\n\n<!-- class=\"journal-actions\" -->\n[👁 Ansehen](agent:learner/preview?file=1) `:preview 1`\n\n");
  assert.equal(known.status, 0, known.output);
  const typo = validate({ title: "Kurs", next: { ...next, href: "agent:teaching/creat-didactics" } });
  assert.equal(typo.status, 2);
  assert.match(typo.output, /agent:teaching\/creat-didactics: "creat-didactics" is no command of the teaching agent/);
  const line = validate({ title: "Kurs", next }, "## Sessions\n\n<!-- class=\"journal-actions\" -->\n[Hilfe](agent:helper/help) `:help`\n\n");
  assert.match(line.output, /agent:helper\/help: no agent "helper"/);
});

test("validate-journal warns about a wrong form the language pack lists (wrongForms), in the journal and the overview", () => {
  const wrong = validate({ title: "Kurs", next, subtitle: "Noch 1 Bedenken offen" }, "## Sessions\n\nEine Bedenke bleibt offen.\n\n");
  assert.match(wrong.output, /wrong form "Eine Bedenke" – write "ein Punkt"/);
  assert.match(wrong.output, /wrong form "1 Bedenken" – write "ein Punkt"/);
  const right = validate({ title: "Kurs", next, subtitle: "Zwei Bedenken offen" }, "## Sessions\n\nEin Punkt bleibt offen.\n\n");
  assert.doesNotMatch(right.output, /wrong form/);
});

test("validate-journal warns when an internal note records an agreement with the instructor (R12c-SP121)", () => {
  const agreed = validate({ title: "Kurs", next, decisions: [{ key: "images-later", kind: "internal", title: "Frau K. wünscht beim nächsten Mal zuerst die Bildfragen auszubessern" }] });
  assert.match(agreed.output, /internal note "Frau K\. wünscht.*records an agreement with the instructor – make it a prepare item/);
  const own = validate({ title: "Kurs", next, decisions: [{ key: "slug", kind: "internal", title: "Doppelter Kurzname aufräumen" }] });
  assert.doesNotMatch(own.output, /records an agreement/);
});

test("validate-journal reports an open point whose link has no label", () => {
  const result = validate({ title: "Kurs", next, decisions: [{ key: "a", title: "Frage?", how: "B", href: "#outline" }] });
  assert.equal(result.status, 2);
  assert.match(result.output, /"Frage\?": href without label/);
});

test("validate-journal reports an explore button with the icon of the next step", () => {
  const explicit = validate({ title: "Kurs", next: { ...next, icon: "▶️" },
    explore: [{ icon: "▶️", title: "Profil", description: "D", label: "Neu", href: "agent:teaching/create-learner-persona", command: ":create-learner-persona" }] });
  assert.equal(explicit.status, 2);
  assert.match(explicit.output, /explore "Profil": icon ▶️ is the icon of the next step/);
  // Without an icon, both agent: buttons show the default ▶️.
  const implicit = validate({ title: "Kurs", next,
    explore: [{ title: "Profil", description: "D", label: "Neu", href: "agent:teaching/create-learner-persona", command: ":create-learner-persona" }] });
  assert.match(implicit.output, /explore "Profil": icon ▶️/);
  const own = validate({ title: "Kurs", next: { ...next, icon: "🔍" },
    explore: [{ icon: "➕", title: "Profil", description: "D", label: "Neu", href: "agent:teaching/create-learner-persona", command: ":create-learner-persona" }] });
  assert.equal(own.status, 0, own.output);
});

test("validate-journal reports a process result that starts with its own status word", () => {
  const result = validate({ title: "Kurs", next,
    process: { steps: [{ title: "Rahmen", state: "done", result: "Gespeichert: 3 Einheiten." }] },
    units: [{ id: 1, title: "Eins", state: "current", process: { steps: [{ title: "Material", state: "done", result: "done: Entwurf liegt vor." }] } }] });
  assert.equal(result.status, 2);
  assert.match(result.output, /process step "Rahmen": result starts with "Gespeichert:"/);
  assert.match(result.output, /process step "Eins → Material": result starts with "done:"/);
  const plain = validate({ title: "Kurs", next, process: { steps: [{ title: "Rahmen", state: "done", result: "Gespeichert ist der Rahmen: 3 Einheiten." }] } });
  assert.equal(plain.status, 0, plain.output);
});

// A minimal agenda with the units table after `<!-- data-type="none" -->`, as in templates/course-agenda.yaml.
const agenda = (cells, required = true) => `## Course Context\n\nAgenda required: ${required ? "yes" : "no"}\n\n## Agenda – Ablaufplan\n\n<!-- data-type="none" -->\n| Nr. | Einheit | Zeit |\n|---|---|---|\n${cells.map((cell, i) => `| ${cell} | Einheit ${i + 1} | 45 Min. |`).join("\n")}\n\n<details><summary>Technik</summary>\n\n| No. | Type |\n|---|---|\n| 1 | \`a\` |\n\n</details>\n\n`;
const sessions = (note, action = "[▶️ Einheit anlegen](agent:teaching/create-session) `:create-session`") => `## Sessions – Einheiten\n\n<!-- class="journal-actions" -->\n${action}\n\n<!--- _Comment lines are not the note – they are created after the didactics._ --->\n\n${note}\n\n`;
const planned = n => Array.from({ length: n }, (_, i) => ({ id: i + 1, title: `E${i + 1}`, state: "planned", process: { steps: [{ title: "Material", state: "planned" }] } }));

test("validate-journal recognises agenda rows numbered 1, 1. or 1\\.", () => {
  for (const cells of [["1", "2"], ["1.", "2."], ["1\\.", "2\\."]]) {
    const result = validate({ title: "Kurs", next, units: planned(2) }, agenda(cells) + sessions("_Die Einheiten stehen im Ablaufplan._"));
    assert.equal(result.status, 0, `${cells}: ${result.output}`);
  }
  const mismatch = validate({ title: "Kurs", next, units: planned(3) }, agenda(["1\\.", "2\\."]));
  assert.match(mismatch.output, /the agenda has 2 rows, the dashboard shows 3 units/);
});

test("validate-journal names an agenda table without numbered rows instead of claiming there is no agenda", () => {
  const result = validate({ title: "Kurs", next, units: planned(2) }, agenda(["I", "II"]) + sessions("_Die Einheiten stehen im Ablaufplan._"));
  assert.equal(result.status, 2);
  assert.match(result.output, /agenda table found, but no numbered rows recognised \(No\. must be plain digits/);
  assert.doesNotMatch(result.output, /before the required agenda exists/);
  const none = validate({ title: "Kurs", next }, "## Course Context\n\nAgenda required: yes\n\n## Agenda\n\n_Noch leer._\n\n" + sessions("_Noch keine Einheiten._"));
  assert.match(none.output, /offers create-session before the required agenda exists/);
  assert.doesNotMatch(none.output, /agenda table found/);
});

test("validate-journal reports units without material steps, also when no unit has them yet", () => {
  const units = planned(3);
  delete units[1].process;
  units[2].process = { steps: [] };
  const result = validate({ title: "Kurs", next, units });
  assert.equal(result.status, 2);
  assert.match(result.output, /units 2, 3 without process\.steps while unit 1 has them – every unit gets the same material steps/);
  const noneHas = validate({ title: "Kurs", next, units: [{ id: 1, title: "A", state: "planned" }, { id: 2, title: "B", state: "planned" }] });
  assert.equal(noneHas.status, 0, "while no unit has steps: a warning (write-dashboard sets them)");
  assert.match(noneHas.output, /units 1, 2 without process\.steps – every unit/);
});

test("validate-journal reports the empty-state note under Sessions once the agenda plans units", () => {
  const notes = [
    "_No units yet – they are created after the didactics (and the agenda, if one is planned)._",
    "_Noch keine Einheiten – sie entstehen nach der Didaktik (und dem Ablaufplan, wenn einer geplant ist)._",
    "_Noch keine Kapitel – sie entstehen nach der Didaktik (und dem Ablaufplan, wenn einer geplant ist)._"
  ];
  for (const note of notes) {
    const result = validate({ title: "Kurs", next, units: planned(2) }, agenda(["1", "2"]) + sessions(note));
    assert.equal(result.status, 2, note);
    assert.match(result.output, /## Sessions still shows the empty-state note .* although ## Agenda plans 2 units/);
  }
  const before = validate({ title: "Kurs", next }, agenda([]) + sessions(notes[1], "[▶️ Zuerst den Ablaufplan](agent:teaching/create-agenda) `:create-agenda`"));
  assert.equal(before.status, 0, before.output);
  const updated = validate({ title: "Kurs", next, units: planned(2) }, agenda(["1", "2"]) + sessions("_Die Einheiten sind im Ablaufplan geplant und entstehen nacheinander, beginnend mit der ersten._"));
  assert.equal(updated.status, 0, updated.output);
});

test("validate-journal warns about a started unit still planned and an outdated start note (R5-D4)", () => {
  const units = planned(2);
  units[0].href = "#1.-e1";
  const subsection = "### 1. E1\n\nText\n\n";
  for (const note of ["_Die Einheiten sind im Ablaufplan geplant; sie werden nacheinander angelegt, beginnend mit Einheit 1._",
    "_The units are planned in the schedule; they are created one after another, starting with unit 1._",
    "_Die Einheiten entstehen nacheinander, beginnend mit der ersten._"]) {
    const result = validate({ title: "Kurs", next, units }, sessions(note) + subsection);
    assert.equal(result.status, 0, "warnings never change the exit code");
    assert.match(result.output, /Warnings:\n- unit 1 has its subsection \(href\) but state "planned" and no statusLabel/);
    assert.match(result.output, /## Sessions note ".*" says the units are created starting with unit 1, but "### 1\." already exists/);
    assert.match(result.output, /Exit code: 0/);
  }
  // A note naming a unit without its subsection yet, a statusLabel and a matching state are fine.
  const ok = structuredClone(units);
  ok[0].state = "current";
  const clean = validate({ title: "Kurs", next, units: ok }, sessions("_1 von 2 Einheiten angelegt; die nächste folgt nach dem Material von Einheit 1._") + subsection);
  assert.doesNotMatch(clean.output, /Warnings:/);
  const labelled = structuredClone(units);
  labelled[0].statusLabel = "Planungsskizze liegt vor";
  const later = validate({ title: "Kurs", next, units: labelled }, sessions("_Weiter geht es nacheinander, beginnend mit Einheit 2._") + subsection);
  assert.doesNotMatch(later.output, /Warnings:/);
  // Warnings stand next to errors without replacing them.
  const both = validate({ title: "Kurs", next, units, decisions: [{ key: "a", title: "Frage?", how: "B", href: "#outline" }] }, sessions("_Beginnend mit Einheit 1._") + subsection);
  assert.equal(both.status, 2);
  assert.match(both.output, /Warnings:/);
  assert.match(both.output, /href without label/);
});

test("validate-journal warns about the next step, finished words, a reset material step and anchors into <section> (R6-D4)", () => {
  const steps = state => [{ title: "Einheit planen", state: "done" }, { title: "Material ausarbeiten", state }, { title: "Prüfen", state: "planned" }];
  const unit = { id: 1, title: "E1", state: "current", href: "#1.-e1", view: { href: "agent:teaching/preview?file=1", command: ":preview 1" }, summary: "Text von Ihnen freigegeben; Bilder fehlen.", statusLabel: "Material fertig · Bilder fehlen", process: { steps: steps("current") } };
  const unitNext = { title: "Material erstellen", why: "W", label: "Bilder ansehen", href: "agent:teaching/coauthor-materials?number=1", command: ":coauthor-materials 1" };
  const table = "<details><summary>Technik</summary>\n\n<!-- data-type=\"none\" -->\n| # | Title | Type | Method | Skeleton | Material | Done | Notes |\n|---|---|---|---|---|---|---|---|\n| 1 | E1 | a | b | ✅ | ✅ | ❌ | |\n\n</details>\n\n";
  const unitSessions = (status, report = "") => `## Sessions – Einheiten\n\n<!-- class="journal-actions" -->\n[Regeln](#regeln) · [Fehlt](#gibt-es-nicht) · [▶️ Hilfe](agent:teaching/help) \`:help\`\n\n1. E1 – ${status}\n\n${table}### 1. E1\n\n${report}Text\n\n`;
  const agents = "## Agents\n\n<section>\n\n### Regeln\n\nText\n\n</section>\n\n";
  const result = validate({ title: "Kurs", next: unitNext, units: [unit] }, unitSessions("Material fertig · Bilder fehlen") + agents);
  assert.equal(result.status, 0, result.output);
  assert.match(result.output, /next\.title "Material erstellen" is not the current step of unit 1 \("Material ausarbeiten"\)/);
  assert.match(result.output, /next\.label "Bilder ansehen" does not name the step "Material ausarbeiten"/);
  assert.match(result.output, /unit 1: statusLabel "Material fertig · Bilder fehlen" says "fertig", but the unit has no passed check/);
  assert.match(result.output, /unit 1: status line "Material fertig · Bilder fehlen" says "fertig"/);
  assert.match(result.output, /unit 1: material ✅ and approved, but its material step "Material ausarbeiten" is "current"/);
  assert.match(result.output, /action line link #regeln points to a heading inside a <section> block/);
  assert.match(result.output, /action line link #gibt-es-nicht matches no heading/);
  // Matching next step, plain status words, material not yet approved: no warning.
  const clean = validate({ title: "Kurs", next: { ...unitNext, title: "Material ausarbeiten · E1", label: "Material weiter ausarbeiten" },
    units: [{ ...unit, summary: "Text geschrieben; Bilder fehlen.", statusLabel: "Material geschrieben · Prüfung offen" }] },
    unitSessions("Material noch nicht fertig").replace(" · [Fehlt](#gibt-es-nicht)", "").replace("[Regeln](#regeln) · ", ""));
  assert.doesNotMatch(clean.output, /Warnings:/, clean.output);
  // A passed check allows "fertig"; a check with concerns may send the material step back.
  const report = "#### Validation Report\n\n__Result:__ PASS\n\n";
  const done = validate({ title: "Kurs", next: unitNext, units: [{ ...unit, process: { steps: steps("done") } }] }, unitSessions("Material fertig", report));
  assert.doesNotMatch(done.output, /says "fertig"/);
  const concerns = validate({ title: "Kurs", next: unitNext, units: [unit] }, unitSessions("Überarbeitung", "#### Validation Report\n\n__Result:__ PASS with concerns\n\n"));
  assert.doesNotMatch(concerns.output, /material ✅ and approved/);
  // A Dashboard link into a <section> block is an error with the same explanation.
  const linked = validate({ title: "Kurs", next, links: [{ label: "Regeln", href: "#regeln" }] }, agents);
  assert.equal(linked.status, 2);
  assert.match(linked.output, /link #regeln points to a heading inside a <section> block/);
});

// check-material.mjs: the source part runs without a browser.
const { analyseMaterial, isImageMarker } = await import("./check-material.mjs");
const material = [
  "<!--\nlanguage: de\nnarrator: Deutsch Female\n-->\n\n# Wolken\n",
  "    {{|>}}\nHier lernst du Wolken kennen.\n",
  "<!---\nStellen mit „*📷 Foto folgt*“ werden ersetzt.\n--->\n",
  "## Haufenwolke\n",
  "<!--- image: haufenwolke --->\n> 🖼️ _Bild folgt: Haufenwolke am Sommerhimmel_\n",
  "{|>}{Welche Wolke ist das?}\n",
  "- [( )] {|>}{die Federwolke}\n- [(X)] {|>}{die Haufenwolke}\n- [[?]] Schau dir das Bild noch einmal an.\n",
  "## Federwolke\n",
  "<!--- image: federwolke --->\nHier kommt bald ein Foto.\n",
  "📷 Mach selbst ein Foto vom Himmel.\n",
  "<!--- image: regenwolke --->\n![Regenwolke](regenwolke.png)\n",
  "```\n*📷 Foto folgt*\n```\n",
  "### Selbsttest\n",
  "Welche Wolke bringt Regen?\n",
  "<!-- data-solution-button=\"false\" -->\n- [( )] *📷 Foto folgt*\n- [(X)] *📷 foto folgt*\n- [[?]] Hinweis\n",
  "Was passt zur Federwolke?\n",
  "- [[X]] {|>}{hoch}\n- [[ ]] {|>}{tief}\n"
].join("\n");

test("check-material finds image placeholders by symbol, emphasis and authoring note, not by words", () => {
  assert.ok(isImageMarker("> 🖼️ _Image follows: a cloud at noon_"));
  assert.ok(isImageMarker("**📸 Photo coming soon**"));
  assert.ok(isImageMarker("- [( )] *📷 Foto folgt*"));
  assert.ok(!isImageMarker("📷 Take a photo of the sky."), "an instruction with a camera symbol is no placeholder");
  assert.ok(!isImageMarker("*📷 ![Wolke](wolke.png)*"), "a real image is no placeholder");
  const { markers, slides, quizzes, readAloud } = analyseMaterial(material);
  assert.deepEqual(markers.map(marker => marker.slide), ["Haufenwolke", "Federwolke", "Selbsttest", "Selbsttest"],
    "not in comments or code, not above a real image; an authoring note marks any line below it");
  assert.equal(markers[0].text, "🖼️ Bild folgt: Haufenwolke am Sommerhimmel");
  assert.deepEqual(slides, ["Wolken", "Haufenwolke", "Federwolke", "Selbsttest"]);
  assert.equal(quizzes, 3);
  assert.deepEqual(readAloud, { blocks: 1, inline: 5, inHints: 0 }, "read-aloud is counted from the markup, independent of the course language");
});

test("check-material reports quizzes whose options cannot be told apart, and quizzes that depend on missing images", () => {
  const { problems, warnings } = analyseMaterial(material);
  assert.deepEqual(problems, ['quiz on slide "Selbsttest" ("Welche Wolke bringt Regen?"): options not distinguishable – 2 × "📷 Foto folgt"; learners cannot solve it']);
  assert.equal(warnings.length, 4, warnings.join("\n"));
  assert.match(warnings[0], /^quiz on slide "Haufenwolke" \("Welche Wolke ist das\?"\): follows an image placeholder/);
  assert.match(warnings[1], /^quiz on slide "Selbsttest" \("Welche Wolke bringt Regen\?"\): 2 options are image placeholders/);
  assert.match(warnings[2], /quizzes show the player's default feedback lines/);
  assert.match(warnings[3], /^narrator is set, but 2 of 2 quiz hints \(\[\[\?\]\]\) are not read aloud \(slides: Haufenwolke · Selbsttest\)/);
  const same = analyseMaterial("# A\n\nFrage?\n\n- [[X]] {|>}{Hoch}\n- [[ ]] **hoch**\n- [[ ]] tief\n");
  assert.match(same.problems[0], /options not distinguishable – 2 × "Hoch"/, "markup and case do not make options different");
  assert.deepEqual(analyseMaterial("# A\n\n- [( )] ![a](1.png)\n- [(X)] ![a](2.png)\n").problems, [], "different images are different options");
});

test("check-material without a browser prints the source findings and exits with 2, without a stack trace", () => {
  const dir = mkdtempSync(join(tmpdir(), "dashboard-material-"));
  writeFileSync(join(dir, "README.md"), material);
  const script = fileURLToPath(new URL("./check-material.mjs", import.meta.url));
  const run = args => spawnSync(process.execPath, [script, ...args], { cwd: dir, encoding: "utf8", env: { ...process.env, PLAYWRIGHT_MODULE_PATH: join(dir, "no-playwright") } });
  const result = run(["README.md"]);
  const help = run(["--help"]);
  const unknown = run(["--verbose"]);
  const missing = run(["fehlt.md"]);
  rmSync(dir, { recursive: true, force: true });
  const output = result.stdout + result.stderr;
  assert.equal(result.status, 2, output);
  assert.match(output, /Missing images: 4 \(4 placeholders on: Haufenwolke · Federwolke · Selbsttest; files not checked\)/);
  assert.match(output, /Errors \(.*\): 1\n- quiz on slide "Selbsttest"/);
  assert.match(output, /Rendered check not possible: .*CHROMIUM_PATH/);
  assert.match(output, /Rendered check not possible: no installed Playwright found/, "the reason that triggers the install offer (data/chat-checks.md → Offering the Rendered Check)");
  assert.match(output, /Exit code: 2/);
  assert.doesNotMatch(output, /^\s+at /m, "no stack trace");
  assert.equal(help.status, 0);
  assert.match(help.stdout, /^Usage: /);
  assert.equal(unknown.status, 2, "an option is never read as a file name");
  assert.equal(missing.status, 2);
  assert.match(missing.stderr, /Not found: fehlt\.md/);
});

// Runs find.mjs inside a small project folder (with a file next to it, outside the project).
function find(args, setup = () => {}) {
  const dir = mkdtempSync(join(tmpdir(), "dashboard-find-"));
  const project = join(dir, "project");
  mkdirSync(join(project, "materials", "1-intro"), { recursive: true });
  mkdirSync(join(project, "node_modules", "lib"), { recursive: true });
  writeFileSync(join(dir, "outside.md"), "Lernziel außerhalb\n");
  writeFileSync(join(project, "journal.md"), "# Kurs\n\n## Outline\n\nLernziel 1: lesen\nlernziel 2: schreiben\n");
  writeFileSync(join(project, "materials", "1-intro", "README.md"), "# Intro\n\nLernziel im Material\n");
  writeFileSync(join(project, "materials", "notes.txt"), "Lernziel in einer Textdatei\n");
  writeFileSync(join(project, "materials", "plan.yaml"), "goal: Lernziel\n");
  writeFileSync(join(project, "node_modules", "lib", "README.md"), "Lernziel in einer Bibliothek\n");
  setup(project, dir);
  const run = spawnSync(process.execPath, [fileURLToPath(new URL("./find.mjs", import.meta.url)), ...args], { cwd: project, encoding: "utf8" });
  rmSync(dir, { recursive: true, force: true });
  return { status: run.status, stdout: run.stdout, output: run.stdout + run.stderr };
}

test("find.mjs searches journal.md by default and prints file:line: text", () => {
  const result = find(["Lernziel"]);
  assert.equal(result.status, 0, result.output);
  assert.equal(result.stdout, "journal.md:5: Lernziel 1: lesen\nExit code: 0\n");
  const caseless = find(["-i", "^lernziel \\d"]);
  assert.match(caseless.stdout, /journal\.md:5: Lernziel 1: lesen\njournal\.md:6: lernziel 2: schreiben\n/);
  const none = find(["Wolke"]);
  assert.equal(none.status, 1);
  assert.match(none.stdout, /No match for \/Wolke\/ in 1 file\.\nExit code: 1/);
});

test("find.mjs searches folders recursively, only text types, without node_modules", () => {
  const result = find(["Lernziel", "."]);
  assert.equal(result.status, 0, result.output);
  assert.match(result.stdout, /^journal\.md:5: /m);
  assert.match(result.stdout, /^materials\/1-intro\/README\.md:3: Lernziel im Material$/m);
  assert.match(result.stdout, /^materials\/plan\.yaml:1: goal: Lernziel$/m);
  assert.doesNotMatch(result.stdout, /notes\.txt|node_modules|außerhalb/);
  const two = find(["Lernziel", "journal.md", "materials/plan.yaml"]);
  assert.match(two.stdout, /journal\.md:5:[\s\S]*materials\/plan\.yaml:1:/);
});

test("find.mjs refuses paths outside the current folder, also through links", () => {
  for (const path of ["../outside.md", "..", "/etc/hostname"]) {
    const result = find(["Lernziel", path]);
    assert.equal(result.status, 2, path);
    assert.match(result.output, /Refused: .* outside the current folder/, path);
    assert.match(result.stdout, /Exit code: 2/, path);
    assert.doesNotMatch(result.output, /außerhalb/);
  }
  const linked = find(["Lernziel", "link.md"], (project, dir) => symlinkSync(join(dir, "outside.md"), join(project, "link.md")));
  assert.equal(linked.status, 2);
  assert.match(linked.output, /Refused: link\.md points outside the current folder/);
  const walked = find(["Lernziel", "."], (project, dir) => symlinkSync(dir, join(project, "up")));
  assert.equal(walked.status, 0);
  assert.doesNotMatch(walked.output, /außerhalb/, "links inside a folder are not followed");
  const invalid = find(["("]);
  assert.notEqual(invalid.status, 2, "an invalid pattern is searched as plain text (SK57)");
  assert.match(invalid.output, /searched as plain text/);
  assert.equal(find(["-n", "-i", "lernziel"]).status, 0, "-n is accepted, -i may follow it");
  assert.equal(find([]).status, 2);
  assert.match(find(["x", "missing.md"]).output, /Not found: missing\.md/);
});

test("find.mjs stops after 200 hits and says so; long lines are cut around the match", () => {
  const many = find(["Zeile"], project => writeFileSync(join(project, "journal.md"), Array.from({ length: 250 }, (_, i) => `Zeile ${i + 1}`).join("\n")));
  assert.equal(many.status, 0);
  assert.equal(many.stdout.split("\n").filter(line => line.startsWith("journal.md:")).length, 200);
  assert.match(many.stdout, /More than 200 hits – only the first 200 are shown/);
  const long = find(["Treffer"], project => writeFileSync(join(project, "journal.md"), `${"a".repeat(1000)} Treffer ${"b".repeat(1000)}`));
  const line = long.stdout.split("\n")[0];
  assert.match(line, /^journal\.md:1: …a+ Treffer b+…$/);
  assert.ok(line.length < 340, `line too long: ${line.length}`);
});

// Links and images: LiaScript cuts a target at the first unencoded "(" (R7-D1, R7-D2).
const { unencodedUrls, markdownLinks, encodeTarget } = await import("./check-material.mjs");

test("check-material finds link and image targets and bare URLs with unencoded parentheses or spaces", () => {
  const text = [
    "![A](https://example.org/a_(1).jpg?width=330)",
    "![B](https://example.org/b_%281%29.jpg)",
    "[Page](https://example.org/File:c_(2).jpg) and [t](https://example.org/t.png \"a title\")",
    "See https://example.org/File:d_(3).jpg (a bare URL) and (https://example.org/e.jpg).",
    "[space](https://example.org/a b.html) · `[code](x (y).png)` · <img src=\"https://example.org/f_(4).jpg\">"
  ].join("\n");
  const found = unencodedUrls(text);
  assert.deepEqual(found.map(item => [item.line, item.kind, item.url]), [
    [1, "image target", "https://example.org/a_(1).jpg?width=330"],
    [3, "link target", "https://example.org/File:c_(2).jpg"],
    [4, "bare URL", "https://example.org/File:d_(3).jpg"],
    [5, "link target", "https://example.org/a b.html"]
  ], "encoded targets, titles, surrounding parentheses, inline code and HTML attributes are fine");
  assert.equal(found[0].encoded, "https://example.org/a_%281%29.jpg?width=330");
  assert.equal(found[2].encoded, "[…](https://example.org/File:d_%283%29.jpg)");
  assert.equal(encodeTarget("a (b) c"), "a%20%28b%29%20c");
  assert.deepEqual(markdownLinks("- [( )] ![x](a.png)<!-- style=\"max-height: 30vh\" -->").map(link => [link.image, link.target]), [[true, "a.png"]]);
});

test("check-material reports unencoded targets as errors and image options without a size limit as warnings", () => {
  const source = "# A\n\n![x](https://example.org/a_(1).jpg)\n\nWhich one?\n\n- [( )] ![a](https://example.org/1.jpg)\n- [(X)] ![b](https://example.org/2.jpg)<!-- style=\"max-height: 30vh\" -->\n\nAnd now?\n\n- [(X)] ![c](3.png)<!-- style=\"width: 30%\" -->\n- [( )] ![d](4.png)<!-- style=\"max-height: 25vh\" -->\n";
  const { problems, warnings } = analyseMaterial(source);
  assert.deepEqual(problems, ['slide "A", line 3: image target https://example.org/a_(1).jpg contains unencoded "(", ")" – LiaScript cuts it; write https://example.org/a_%281%29.jpg']);
  assert.equal(warnings.length, 1, warnings.join("\n"));
  assert.match(warnings[0], /^quiz on slide "A" \("Which one\?"\): 1 image option without a size limit – put <!-- style="max-height: 30vh" --> directly after each image/);
});

test("validate-journal reports unencoded URLs and incomplete image entries", () => {
  const entry = (slug, lines) => `<section>\n\n#### ${slug}\n\n${lines.join("\n")}\n\n</section>\n\n`;
  const result = validate({ title: "Kurs", next }, `## Sessions\n\n### 1. Eins\n\n#### Images\n\n${entry("bild-1", [
    "* __Status:__ inserted", "* __Source:__ free-photo", "* __File:__ https://example.org/Special:FilePath/a_%281%29.jpg",
    "* __Alt text:__ Ein Bild", "* __Page:__ https://example.org/File:a_(1).jpg"
  ])}${entry("bild-2", ["* __Status:__ candidate", "* __Source:__ free-photo", "* __Candidates:__"])}${entry("bild-3", [
    "* __Status:__ candidate", "* __Source:__ free-photo", "* __Candidates:__", "  1. [File:b.jpg](https://example.org/File:b_(2).jpg) – X – CC BY 4.0"
  ])}`);
  assert.equal(result.status, 2, result.output);
  assert.match(result.output, /line \d+ \(bild-1\): bare URL https:\/\/example\.org\/File:a_\(1\)\.jpg contains unencoded "\(", "\)"/);
  assert.match(result.output, /line \d+ \(bild-3\): link target https:\/\/example\.org\/File:b_\(2\)\.jpg .* write https:\/\/example\.org\/File:b_%282%29\.jpg/);
  assert.match(result.output, /image entry "bild-1" \(unit 1\) is inserted but has no __Author:__, __License:__/);
  assert.match(result.output, /image entry "bild-2" \(unit 1\) is candidate but lists no candidates/);
  assert.doesNotMatch(result.output, /bild-3" \(unit 1\) is candidate/);
});

test("check-material counts hints that are not read aloud only when narrator: is set (R8-D1c)", () => {
  const quiz = "# A\n\nFrage?\n\n- [(X)] {|>}{ja}\n- [( )] {|>}{nein}\n- [[?]] {|>}{Lies noch einmal.}\n- [[?]] Schau genau hin.\n";
  const spoken = analyseMaterial(`<!--\nnarrator: Deutsch Female\n-->\n\n${quiz}`);
  assert.deepEqual(spoken.hints, { total: 2, silent: 1 });
  assert.match(spoken.warnings.join("\n"), /narrator is set, but 1 of 2 quiz hints .* is not read aloud \(slide: A\) – write - \[\[\?\]\] \{\|>\}\{hint text\}/);
  assert.deepEqual(analyseMaterial(quiz).warnings, [], "without a narrator nothing is read aloud");
});

const { fitOnScreen, describeFit, parseViewport, parseArguments, viewportName, defaultViewports } = await import("./check-material.mjs");
const materialChecks = await import("./check-material.mjs");

test("check-material measures question to last option against the visible area, at open and with the question at the top (R8-D1)", () => {
  // Measured once in a 1024×768 window: header 78 px, footer from 710 px; three image options of ~190 px.
  const view = { top: 78, bottom: 710 };
  const options = [{ top: 343, bottom: 555, images: [192] }, { top: 565, bottom: 771, images: [186] }, { top: 781, bottom: 993, images: [192] }];
  const fit = fitOnScreen({ view, question: 301, options });
  assert.deepEqual(fit.open, { visible: 1, fits: false });
  assert.deepEqual(fit.top, { visible: 2, fits: false });
  assert.equal(fit.height, 692);
  assert.equal(fit.available, 632);
  assert.deepEqual(fit.imageMax, { open: 95, top: 170 }, "the summed image heights alone (570 px < 768 px) would claim it fits");
  assert.equal(describeFit(fit, { width: 1024, height: 768 }), "1024×768 landscape: does not fit (at open 1 of 3 options visible; question at the top: 2 of 3 options visible, needs 692 px, has 632 px) – images at most 95 px to fit at open, 170 px with the question at the top (now up to 192 px; in words: about half as high as now)");
  // With images of 95 px the quiz fits at open; in a portrait window it fits as it is.
  const small = options.map((option, index) => ({ top: 343 + index * 107, bottom: 343 + index * 107 + 115, images: [95] }));
  assert.equal(describeFit(fitOnScreen({ view, question: 301, options: small }), { width: 1024, height: 768 }), "1024×768 landscape: fits");
  assert.equal(describeFit(fitOnScreen({ view: { top: 56, bottom: 1042 }, question: 280, options: options.map(option => ({ ...option, bottom: option.bottom - 7 })) }), { width: 810, height: 1080 }), "810×1080 portrait: fits");
  // A quiz further down the slide: not judged at open; it fits once scrolled.
  const below = fitOnScreen({ view, question: 900, options: [{ top: 940, bottom: 980 }, { top: 990, bottom: 1030 }] });
  assert.equal(below.open, null);
  assert.equal(describeFit(below, { width: 1080, height: 810 }), "1080×810 landscape: fits");
  // Cut by the footer at open, but fits with the question at the top: information, not "does not fit".
  assert.match(describeFit(fitOnScreen({ view, question: 650, options: [{ top: 690, bottom: 730 }] }), { width: 1024, height: 768 }), /^1024×768 landscape: fits only once scrolled \(at open 0 of 1 options visible; question at the top: fits\)$/);
});

test("check-material takes window sizes from --viewport, else the default list", () => {
  assert.deepEqual(defaultViewports.map(viewportName), ["1024×768 landscape", "810×1080 portrait", "1080×810 landscape"]);
  assert.deepEqual(parseViewport("810x1080"), { width: 810, height: 1080 });
  assert.deepEqual(parseViewport("1280×800"), { width: 1280, height: 800 });
  assert.throws(() => parseViewport("810"), /WIDTHxHEIGHT/);
  assert.throws(() => parseViewport("100x100"), /between 320 and 3840/);
  assert.deepEqual(parseArguments(["README.md"]), { file: "README.md", sizes: [...defaultViewports] });
  assert.deepEqual(parseArguments(["--viewport", "810x1080", "a.md", "--viewport=1280x800"]), { file: "a.md", sizes: [{ width: 810, height: 1080 }, { width: 1280, height: 800 }] });
  assert.throws(() => parseArguments(["--viewport"]), /needs a size/);
  assert.throws(() => parseArguments(["--verbose"]), /Unknown option --verbose/);
  assert.throws(() => parseArguments(["a.md", "b.md"]), /one file only/);
  assert.deepEqual(parseArguments(["-h"]), { help: true });
});

test("check-material serves the project root, so a material in its own folder loads with its relative imports", () => {
  const { devServer, loadFailure } = materialChecks;
  const call = devServer("materials/1-turtle/README.md", 3041);
  assert.deepEqual(call.args.slice(0, 2), ["--input", "."], "--input <file> serves only the file's folder: the material 404s and ../../lia-templates/… is out of reach");
  assert.equal(call.material, "http://127.0.0.1:3041/materials/1-turtle/README.md");
  assert.equal(call.url, "http://127.0.0.1:3041/liascript/index.html?http://127.0.0.1:3041/materials/1-turtle/README.md");
  assert.equal(devServer("./README.md", 3041).material, "http://127.0.0.1:3041/README.md");
  assert.equal(devServer("materials/2 Wolken/README.md", 3041).material, "http://127.0.0.1:3041/materials/2%20Wolken/README.md");
  // LiaScript shows its own error course when the material does not load; that is no rendered check.
  const errorCourse = ["🙈 Ups, something went wrong", "What is LiaScript?", "Get Help?"];
  assert.equal(loadFailure({ status: 200, titles: ["Das Quadrat"] }, "a.md"), null);
  assert.equal(loadFailure({ status: undefined, titles: ["Das Quadrat"] }, "a.md"), null, "a rendered course counts even if its request was not seen");
  assert.equal(loadFailure({ status: 200, titles: ["Kurs", "Something went wrong? Debugging", "Zweite Seite"] }, "a.md"), null, "a slide of the material may name the words of the error course");
  assert.equal(loadFailure({ status: 200, titles: ["Ups, something went wrong", "Lösung"] }, "a.md"), null, "only LiaScript's own error course, with its help slides");
  assert.deepEqual(loadFailure({ status: 404, titles: errorCourse }, "materials/1-turtle/README.md"), { kind: "not-loaded", text: "the LiaScript DevServer did not load materials/1-turtle/README.md (HTTP 404)" });
  assert.deepEqual(loadFailure({ status: undefined, titles: errorCourse }, "a.md"), { kind: "not-loaded", text: "the LiaScript DevServer did not load a.md (LiaScript shows its error page)" });
  assert.deepEqual(loadFailure({ status: undefined, titles: [] }, "a.md"), { kind: "not-loaded", text: "the LiaScript DevServer did not load a.md (no answer)" });
  assert.deepEqual(loadFailure({ status: 200, titles: [] }, "a.md"), { kind: "not-loaded", text: "the LiaScript DevServer loaded a.md, but no slide rendered" }, "never a pass with Slides: 0");
  assert.deepEqual(loadFailure({ status: 200, titles: errorCourse }, "a.md"), { kind: "unreadable", text: "LiaScript could not read a.md: it shows its own error course instead of the material" });
});

test("check-material: a material LiaScript cannot read is an error (exit 1); a check that could not run is exit 2, with the install hint only for Playwright", () => {
  const { notPossible, reportFailure } = materialChecks;
  assert.match(notPossible("no installed Playwright found (npx playwright … installs one)"), /^Rendered check not possible: no installed Playwright found .*\. Install a browser with "npx playwright install chromium"/);
  assert.match(notPossible("Playwright has no browser of its own and no system Chrome/Chromium was found"), /npx playwright install chromium/);
  assert.equal(notPossible("the LiaScript DevServer did not load a.md (HTTP 404)"), "Rendered check not possible: the LiaScript DevServer did not load a.md (HTTP 404).");
  assert.doesNotMatch(notPossible("the LiaScript DevServer (liadev) did not start: ENOENT"), /npx playwright/);
  assert.equal(reportFailure({ kind: "unreadable", text: "x" }).exit, 1);
  assert.equal(reportFailure({ kind: "not-loaded", text: "x" }).exit, 2);
  assert.equal(reportFailure("no installed Playwright found").exit, 2);
  const source = readFileSync(fileURLToPath(new URL("./check-material.mjs", import.meta.url)), "utf8");
  assert.match(source, /Exit code 0: no errors · 1: errors in the material \(also: LiaScript cannot read it\) · 2: invalid call or the rendered check was not possible/);
});

test("check-material starts its DevServer on a free port and stops it when the run is stopped from outside", async () => {
  const { freePort } = materialChecks;
  const { createServer } = await import("node:net");
  const { spawn } = await import("node:child_process");
  const busy = createServer();
  await new Promise(done => busy.listen(0, "127.0.0.1", done));
  const taken = busy.address().port;
  let port;
  try { port = await freePort(); } finally { busy.close(); }
  assert.ok(Number.isInteger(port) && port > 0 && port !== taken);
  const source = readFileSync(fileURLToPath(new URL("./check-material.mjs", import.meta.url)), "utf8");
  assert.match(source, /devServer\(file, await freePort\(\)\)/, "a fixed port reaches a leftover server of another project, which then answers instead");
  // A fake liadev on PATH that stays alive and a Playwright whose browser never starts: the run waits with its
  // server up; stopping the run must stop the server too.
  const dir = mkdtempSync(join(tmpdir(), "dashboard-stop-"));
  const bin = join(dir, "bin");
  mkdirSync(bin);
  writeFileSync(join(bin, "liadev"), `#!${process.execPath}\nrequire("node:fs").writeFileSync(${JSON.stringify(join(dir, "pid"))}, String(process.pid) + " " + process.argv.slice(2).join(" "));\nsetInterval(() => {}, 1000);\n`, { mode: 0o755 });
  writeFileSync(join(dir, "playwright.cjs"), "module.exports = { chromium: { launch: () => new Promise(() => {}) } };\n");
  writeFileSync(join(dir, "README.md"), "# A\n\nText.\n");
  const script = fileURLToPath(new URL("./check-material.mjs", import.meta.url));
  const alive = pid => { try { process.kill(pid, 0); return true; } catch { return false; } };
  const wait = async (until, ms = 8000) => { for (let t = 0; t < ms && !until(); t += 50) await new Promise(done => setTimeout(done, 50)); return until(); };
  try {
    for (const [signal, code] of [["SIGTERM", 143], ["SIGHUP", 129]]) {
      rmSync(join(dir, "pid"), { force: true });
      const run = spawn(process.execPath, [script, "README.md"], { cwd: dir, stdio: "ignore", env: { ...process.env, PATH: `${bin}:${process.env.PATH}`, PLAYWRIGHT_MODULE_PATH: join(dir, "playwright.cjs"), CHROMIUM_PATH: "" } });
      const exited = new Promise(done => run.on("exit", (status, sig) => done(status ?? sig)));
      assert.ok(await wait(() => { try { return readFileSync(join(dir, "pid"), "utf8").includes("--port"); } catch { return false; } }), "the fake DevServer started");
      const [pid, ...args] = readFileSync(join(dir, "pid"), "utf8").split(" ");
      assert.deepEqual(args.slice(0, 2), ["--input", "."]);
      run.kill(signal);
      assert.equal(await exited, code, `${signal} ends the run with ${code}`);
      const gone = await wait(() => !alive(Number(pid)), 3000);
      if (!gone) process.kill(Number(pid), "SIGKILL");
      assert.ok(gone, `${signal}: the DevServer of the stopped run is still alive`);
    }
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test("open points carry their source; group and state texts are readable and follow labels (R8-D3, R8-D4)", () => {
  const units = [{ id: 1, title: "E1", state: "current", process: { steps: [
    { title: "Material", state: "done" }, { title: "Bilder einfügen", state: "current" }, { title: "Prüfen", state: "review" }] } }];
  const decisions = [
    { title: "Quelle ersetzen?", kind: "decide", how: "B", source: { check: 1, date: "2026-10-23" } },
    { title: "Nachweis kürzen?", kind: "decide", how: "B", source: { check: 1 } },
    { title: "Zeitbedarf?", kind: "decide", how: "B" },
    { title: "Kopfhörer besorgen", kind: "prepare", how: "B" }];
  const html = dashboard.renderComponent("View", "src", { lang: "de", title: "X", units, decisions });
  assert.match(html, /<strong>Quelle ersetzen\?<\/strong> <span class="dashboard-decision-source">aus der Prüfung vom 23\.10\.2026<\/span>/);
  assert.match(html, /<strong>Nachweis kürzen\?<\/strong> <span class="dashboard-decision-source">aus der Prüfung<\/span>/);
  assert.match(html, /Wartet auf: Bilder einfügen/, "a check step behind an open step waits for it");
  assert.doesNotMatch(html, /Zur Durchsicht/);
  assert.match(dashboard.renderComponent("View", "src-en", { lang: "en", title: "X", units, decisions }), /from the check on 2026-10-23/);
  assert.throws(() => dashboard.buildModel({ units, decisions: [{ title: "A", source: { check: 2 } }] }), /source\.check 2 is no unit/);
  assert.throws(() => dashboard.buildModel({ units, decisions: [{ title: "A", source: { unit: 1 } }] }), /Unknown source field: unit/);
  assert.throws(() => dashboard.buildModel({ units, decisions: [{ title: "A", source: "Prüfung" }] }), /must be an object/);
  const texts = dashboard.visibleTexts({ units, decisions }, "de");
  assert.deepEqual(texts.groups.map(group => [group.title, group.count, group.fromCheck]),
    [["Noch zu entscheiden", 3, 2], ["Vor dem Einsatz vorbereiten", 1, 0], ["0 technische Notizen des Assistenten", 0, 0]]);
  assert.deepEqual(texts.states, ["In Arbeit", "Abgeschlossen", "Als Nächstes", "Wartet auf: Bilder einfügen"]);
  // labels.decide / labels.prepare name the groups (update-dashboard writes them); a data field wins.
  const labels = { decide: "Offen", prepare: "Vorbereiten", "state.waiting": "wartet auf {step}", fromCheckOn: "Prüfung {date}" };
  const own = dashboard.visibleTexts({ units, decisions, labels }, "de");
  assert.deepEqual(own.groups.slice(0, 2).map(group => group.title), ["Offen", "Vorbereiten"]);
  assert.ok(own.states.includes("wartet auf Bilder einfügen"));
  const ownHtml = dashboard.renderComponent("View", "src-l", { lang: "de", title: "X", units, decisions, labels });
  assert.match(ownHtml, /<h3>Offen<\/h3>.*<h3>Vorbereiten<\/h3>/s);
  assert.match(ownHtml, /Prüfung 23\.10\.2026/);
  assert.equal(dashboard.visibleTexts({ units, decisions, labels, prepareTitle: "Vorher" }, "de").groups[1].title, "Vorher");
  assert.throws(() => dashboard.buildModel({ labels: { "state.waiting": "wartet {n}" } }), /unknown placeholder \{n\}/);
  assert.match(dashboard.renderComponent("View", "rev", { lang: "de", title: "X", units: [{ id: 1, title: "E1", state: "revision" }] }), /Korrektur nötig/, "a revision does not read like a grade");
});

test("validate-journal prints the visible groups, checks report anchors and the counts in texts (R8-D2, R8-D3)", () => {
  const usable = { state: "no", missing: ["1 Korrektur"] };
  const units = [{ id: 1, title: "E1", state: "current", href: "#1.-e1", usable, process: { steps: [{ title: "Material", state: "current" }] } },
    { id: 2, title: "E2", state: "current", href: "#2.-e2", usable, process: { steps: [{ title: "Material", state: "current" }] } }];
  const report = n => `#### Prüfbericht – Einheit ${n}\n\n<section data-key="validation-report">\n\n**Ergebnis:** Korrektur nötig (1)\n\n**Jetzt mit den Lernenden nutzbar:** noch nicht: 1 Korrektur\n\n<details>\n\n__Result:__ FAIL\n\n</details>\n\n</section>\n\n`;
  const sessionsWith = (first, second) => `## Sessions – Einheiten\n\n### 1. E1\n\nText\n\n${first}### 2. E2\n\nText\n\n${second}`;
  const fromCheck = href => ({ key: "review-1-a", title: "Quelle ersetzen?", how: "B", label: "Zum Prüfbericht", href, source: { check: 1, date: "2026-10-23" } });
  const good = validate({ title: "Kurs", next, units, subtitle: "Zwei Punkte aus der Prüfung entscheiden Sie in Ruhe.",
    decisions: [fromCheck("#prüfbericht-–-einheit-1"), { ...fromCheck("#prüfbericht-–-einheit-1"), key: "review-1-b", title: "Nachweis kürzen?" },
      { key: "c", title: "Zeitbedarf?", how: "B" }, { key: "d", kind: "prepare", title: "Kopfhörer besorgen", how: "B" }] }, sessionsWith(report(1), report(2)));
  assert.equal(good.status, 0, good.output);
  assert.match(good.output, /^Groups \(as shown\): "Noch zu entscheiden" 3 \(2 aus der Prüfung\) · "Vor dem Einsatz vorbereiten" 1$/m);
  assert.match(good.output, /^States \(as shown\): "In Arbeit" · "Als Nächstes"$/m);
  assert.doesNotMatch(good.output, /Warnings:/, good.output);
  // Same report heading twice, a point from the check that links the unit, a count that does not match its group.
  const bad = validate({ title: "Kurs", next, units, subtitle: "Die beiden Punkte unter „Noch zu entscheiden“ haben Zeit.",
    decisions: [fromCheck("#1.-e1"), { key: "c", title: "Zeitbedarf?", how: "B" }, { key: "e", title: "Länge?", how: "B" }, { key: "f", title: "Bilder?", how: "B", label: "Zum Prüfbericht", href: "#2.-e2" }] },
    sessionsWith(report(1), report(1)));
  assert.equal(bad.status, 2, bad.output);
  assert.match(bad.output, /check report heading "#### Prüfbericht – Einheit 1" appears 2 times \(units 1, 2\)/);
  assert.match(bad.output, /open point "Quelle ersetzen\?" comes from the check of unit 1 but links #1\.-e1 – link its report heading #prüfbericht-–-einheit-1/);
  assert.match(bad.output, /open point "Bilder\?": label "Zum Prüfbericht" names a report, but #2\.-e2 is no check report heading/);
  assert.match(bad.output, /subtitle says "beiden Punkte", but "Noch zu entscheiden" lists 4/);
  // The keyed report counts like the old heading: "Done ✅" needs its PASS.
  const missing = validate({ title: "Kurs", next, units, decisions: [{ ...fromCheck(), href: undefined, label: undefined, source: { check: 2 } }] }, sessionsWith(report(1), ""));
  assert.match(missing.output, /source\.check 2, but unit 2 has no check report/);
  // The keyed report counts like the old heading: "Done ✅" needs its PASS, ⏳ blocks it, line numbers are reported.
  const table = "<details><summary>Technik</summary>\n\n| # | Title | Type | Method | Skeleton | Material | Done | Notes |\n|---|---|---|---|---|---|---|---|\n| 1 | E1 | a | b | ✅ | ✅ | ✅ | |\n\n</details>\n\n";
  const doneSessions = body => `## Sessions – Einheiten\n\n${table}### 1. E1\n\nText\n\n${body}`;
  const failed = validate({ title: "Kurs", next, units: [{ ...units[0], process: { steps: [{ title: "Material", state: "done" }] } }] }, doneSessions(report(1)));
  assert.match(failed.output, /unit 1: "Done ✅" without a passed check/);
  const passedKeyed = report(1).replace("FAIL", "PASS").replace("**Ergebnis:** Korrektur nötig (1)", "**Ergebnis:** bestanden");
  const passed = validate({ title: "Kurs", next, units: [{ ...units[0], process: { steps: [{ title: "Material", state: "done" }] } }] }, doneSessions(passedKeyed));
  assert.doesNotMatch(passed.output, /without a passed check/, passed.output);
  const deferred = validate({ title: "Kurs", next, units }, doneSessions(passedKeyed.replace("bestanden", "bestanden · ⏳ Fotos (Zeile 12)")));
  assert.match(deferred.output, /"Done ✅" while ⏳ items are still open/);
  assert.match(deferred.output, /validation report cites line numbers/);
  const inside = validate({ title: "Kurs", next, units }, doneSessions(`<section>\n\n${passedKeyed}</section>\n\n`));
  assert.match(inside.output, /Validation Report heading inside <section>/);
});

// fetch-thumb.mjs: only the pure helpers and the refusals run here, without network.
const thumb = await import("./fetch-thumb.mjs");

test("fetch-thumb reads file pages, file names and upload URLs as one Commons title", () => {
  const title = "File:Cumulus Cloud (16545241268).jpg";
  for (const input of [
    "https://commons.wikimedia.org/wiki/File:Cumulus_Cloud_(16545241268).jpg",
    "https://commons.wikimedia.org/wiki/File:Cumulus_Cloud_%2816545241268%29.jpg",
    "https://commons.wikimedia.org/wiki/Datei:Cumulus_Cloud_(16545241268).jpg",
    "https://commons.wikimedia.org/wiki/Special:FilePath/Cumulus_Cloud_%2816545241268%29.jpg?width=330",
    "https://commons.wikimedia.org/w/index.php?title=File:Cumulus_Cloud_(16545241268).jpg",
    "https://upload.wikimedia.org/wikipedia/commons/6/69/Cumulus_Cloud_%2816545241268%29.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Cumulus_Cloud_%2816545241268%29.jpg/330px-Cumulus_Cloud_%2816545241268%29.jpg",
    "File:Cumulus Cloud (16545241268).jpg",
    "Cumulus_Cloud_(16545241268).jpg"
  ]) assert.equal(thumb.parseTitle(input), title, input);
  assert.throws(() => thumb.parseTitle("https://example.org/wiki/File:a.jpg"), /only commons\.wikimedia\.org and upload\.wikimedia\.org/);
  assert.throws(() => thumb.parseTitle("https://commons.wikimedia.org.evil.example/wiki/File:a.jpg"), /not commons\.wikimedia\.org\.evil\.example/);
  assert.throws(() => thumb.parseTitle("File:ohne-endung"), /ends with its type/);
  assert.throws(() => thumb.parseTitle("../../etc/passwd.jpg"), /not a valid file name/);
  assert.throws(() => thumb.parseTitle(""), /no file given/);
});

test("fetch-thumb encodes the Special:FilePath URL so that ?width= can be appended", () => {
  assert.equal(thumb.filePathUrl("File:Cumulus Cloud (16545241268).jpg"), "https://commons.wikimedia.org/wiki/Special:FilePath/Cumulus_Cloud_%2816545241268%29.jpg");
  assert.equal(thumb.filePathUrl("File:Wolke's Form ä!.jpg"), "https://commons.wikimedia.org/wiki/Special:FilePath/Wolke%27s_Form_%C3%A4%21.jpg");
  assert.doesNotMatch(thumb.filePathUrl("File:a (b) c.jpg"), /[() ]/);
  assert.equal(thumb.encodeUrl("https://commons.wikimedia.org/wiki/File:a (1).jpg"), "https://commons.wikimedia.org/wiki/File:a%20%281%29.jpg");
  assert.equal(thumb.uploadUrl("https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4d/A.jpg/500px-A.jpg?utm_source=x"), "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/A.jpg/500px-A.jpg");
});

test("fetch-thumb strips HTML from author fields and builds safe cache names", () => {
  assert.equal(thumb.stripHtml('<a href="//commons.wikimedia.org/wiki/User:X" title="User:X">Jane&nbsp;Doe</a> &amp; <span>Max&#32;M&#xFC;ller</span><br/>\n (photo)'), "Jane Doe & Max Müller (photo)");
  assert.equal(thumb.stripHtml(undefined), "");
  assert.equal(thumb.safeName("File:Cumulus Cloud (16545241268).jpg"), "Cumulus_Cloud_16545241268");
  assert.equal(thumb.safeName("File:Wolkenhöhe ../../x.JPG"), "Wolkenhohe_.._.._x");
  assert.doesNotMatch(thumb.safeName("File:../../etc/passwd.jpg"), /\//);
});

test("fetch-thumb refuses other hosts and wrong calls with one line and exit code 2, without network", () => {
  const script = fileURLToPath(new URL("./fetch-thumb.mjs", import.meta.url));
  const run = args => spawnSync(process.execPath, [script, ...args], { encoding: "utf8" });
  for (const args of [["https://example.org/File:a.jpg"], ["a.jpg", "--width", "900"], ["a.jpg", "--verbose"], []]) {
    const result = run(args);
    assert.equal(result.status, 2, args.join(" "));
    assert.match(result.stdout, /Exit code: 2/);
    assert.doesNotMatch(result.stdout + result.stderr, /^\s+at /m, "no stack trace");
  }
  assert.match(run(["https://example.org/File:a.jpg"]).stderr, /^fetch-thumb: only commons\.wikimedia\.org and upload\.wikimedia\.org are allowed, not example\.org\n$/);
  assert.match(run(["--help"]).stdout, /^Usage: /);
});

test("check-material counts an image directly above the question into the fit and warns about page photos over 500 px (R9-D1)", () => {
  const view = { top: 78, bottom: 710 };
  const options = [{ top: 880, bottom: 920 }, { top: 930, bottom: 970 }, { top: 980, bottom: 1020 }];
  // Without the image the question alone fits once scrolled; with the photo above it, it never fits.
  assert.equal(describeFit(fitOnScreen({ view, question: 840, options }), { width: 1024, height: 768 }), "1024×768 landscape: fits");
  const withImage = fitOnScreen({ view, question: 840, options, stimulus: { top: 120, height: 700 } });
  assert.equal(withImage.stimulus, true);
  assert.equal(describeFit(withImage, { width: 1024, height: 768 }), "1024×768 landscape: image and question do not fit (at open 0 of 3 options visible; image at the top: 0 of 3 options visible, needs 900 px, has 632 px) – images at most 390 px to fit at open, 432 px with the image at the top (now up to 700 px; in words: about half as high as now)");
  const smaller = fitOnScreen({ view, question: 540, options: [{ top: 580, bottom: 620 }, { top: 630, bottom: 670 }, { top: 680, bottom: 720 }], stimulus: { top: 120, height: 400 } });
  assert.equal(describeFit(smaller, { width: 1024, height: 768 }), "1024×768 landscape: image and question fit only once scrolled (at open 2 of 3 options visible; image at the top: fits) – images at most 390 px to fit at open (now up to 400 px; in words: slightly smaller than now)");
  const source = "# A\n\n![big](https://example.org/a.jpg?width=800)\n\n![ok](https://example.org/b.jpg?width=500)\n\n![thumb](https://example.org/thumb/c.jpg/1024px-c.jpg)\n\nWho is it?\n\n- [(X)] ![o](https://example.org/o.jpg?width=800)<!-- style=\"max-height: 30vh\" -->\n- [( )] ![p](https://example.org/p.jpg?width=330)<!-- style=\"max-height: 30vh\" -->\n";
  const warnings = analyseMaterial(source).warnings.filter(warning => /page photo/.test(warning));
  assert.deepEqual(warnings.map(warning => warning.match(/\(([^)]*)\)/)[1]), ["a.jpg?width=800", "1024px-c.jpg"], "options and photos up to 500 px are not page-photo findings");
  assert.match(warnings[0], /^slide "A": page photo wider than 500 px .* – load it at 500 px \(\?width=500\)/);
});

test("validate-journal compares the changes after a check in outcome line, dated lines and Notes cell, and wants the source of a point that links a report (R9-D3)", () => {
  const units = [{ id: 1, title: "E1", state: "revision", href: "#1.-e1", view: { href: "agent:teaching/preview?file=1", command: ":preview 1" }, usable: { state: "limited", missing: ["kurze Nachprüfung"] }, process: { steps: [{ title: "Material", state: "done" }] } }];
  const table = notes => `<details><summary>Technik</summary>\n\n| # | Title | Type | Method | Skeleton | Material | Done | Notes |\n|---|---|---|---|---|---|---|---|\n| 1 | E1 | a | b | ✅ | ✅ | ❌ | ${notes} |\n\n</details>\n\n`;
  const report = lines => `#### Prüfbericht – Einheit 1\n\n<section data-key="validation-report">\n\n**Ergebnis:** Korrektur nötig: 1 von 3 Punkten offen (23.10.2026) – 2 Punkte seither geändert – kurze Nachprüfung offen\n\n**Jetzt mit den Lernenden nutzbar:** ja, mit Einschränkungen: kurze Nachprüfung\n\n**Nach der Prüfung geändert:**\n\n${lines.map(line => `- 23.10.2026 · S1 · ${line} · Kurzprüfung`).join("\n")}\n\n<details>\n\n__Result:__ FAIL\n\n</details>\n\n</section>\n\n`;
  const sessionsOf = (notes, lines) => `## Sessions – Einheiten\n\n${table(notes)}### 1. E1\n\nText\n\n${report(lines)}`;
  const point = { key: "review-1-a", title: "Hinweise vorlesen?", how: "B", label: "Zum Prüfbericht", href: "#prüfbericht-–-einheit-1" };
  const stale = validate({ title: "Kurs", next, units, decisions: [point] }, sessionsOf("Prüfung: Korrektur nötig: 1 von 3 Punkten offen; Fotos verkleinert", ["Fotos verkleinert"]));
  assert.equal(stale.status, 0, "warnings only");
  assert.match(stale.output, /open point "Hinweise vorlesen\?" links the check report of unit 1 but has no source – set source: \{"check": 1\}/);
  assert.match(stale.output, /unit 1: the report's outcome line says "2 Punkte seither geändert", but its block "Changed after the check" has 1 dated line/);
  assert.match(stale.output, /unit 1: the report says "2 Punkte seither geändert", but the Notes cell does not/);
  const clean = validate({ title: "Kurs", next, units, decisions: [{ ...point, source: { check: 1 } }] },
    sessionsOf("Prüfung: Korrektur nötig: 1 von 3 Punkten offen; 2 Punkte seither geändert; kurze Nachprüfung offen", ["Fotos verkleinert", "Hinweis neu"]));
  assert.equal(clean.status, 0, clean.output);
  assert.doesNotMatch(clean.output, /Warnings:/, clean.output);
  assert.match(clean.output, /"Noch zu entscheiden" 1 \(1 aus der Prüfung\)/);
  // SK48: a change made and re-checked inside the check run itself is no change since.
  const inRun = validate({ title: "Kurs", next, units, decisions: [{ ...point, source: { check: 1 } }] },
    sessionsOf("Prüfung: Korrektur nötig: 1 von 3 Punkten offen; 2 Punkte seither geändert; kurze Nachprüfung offen", ["Fotos verkleinert", "Hinweis neu", "Tipps geändert · nachgeprüft: Seite angezeigt"]));
  assert.doesNotMatch(inRun.output, /dated line/, inRun.output);
});

test("write-dashboard stores the journal hash in the cache and refuses a stale cache (R9-D2)", () => {
  const dir = mkdtempSync(join(tmpdir(), "dashboard-write-"));
  const journal = join(dir, "journal.md");
  const draft = join(dir, "dashboard.json");
  const blockOf = () => readFileSync(journal, "utf8").match(/```json @Dashboard\.View\n([\s\S]*?)\n```/)[1];
  writeFileSync(journal, `<!--\nlanguage: de\n-->\n\n# Kurs\n\n## Outline\n\nText\n\n## Dashboard\n\n\`\`\`json @Dashboard.View\n{"title": "Alt"}\n\`\`\`\n`);
  const run = () => spawnSync(process.execPath, [fileURLToPath(new URL("./write-dashboard.mjs", import.meta.url)), draft, journal], { encoding: "utf8" });
  writeFileSync(draft, JSON.stringify({ title: "Kurs", next }));
  const first = run();
  assert.equal(first.status, 0, first.stdout + first.stderr);
  const cached = JSON.parse(readFileSync(draft, "utf8"));
  assert.match(cached._journalHash, /^[0-9a-f]{16}$/);
  assert.doesNotMatch(blockOf(), /_journalHash/, "the hash stays in the cache, never in the journal");
  assert.match(first.stdout, /matches the journal block/);
  // A small change in the fresh cache is written as it is.
  writeFileSync(draft, JSON.stringify({ ...cached, title: "Kurs neu" }));
  assert.equal(run().status, 0);
  assert.equal(JSON.parse(blockOf()).title, "Kurs neu");
  // The journal block changed since (another write): the cache is refused, the journal stays.
  writeFileSync(journal, readFileSync(journal, "utf8").replace('"Kurs neu"', '"Von anderswo"'));
  writeFileSync(draft, JSON.stringify({ ...JSON.parse(readFileSync(draft, "utf8")), title: "Kurs drei" }));
  const refused = run();
  assert.equal(refused.status, 1);
  assert.match(refused.stderr, /Cache stale, journal unchanged/);
  assert.equal(JSON.parse(blockOf()).title, "Von anderswo");
  // A whole new draft (no hash) is always accepted.
  writeFileSync(draft, JSON.stringify({ title: "Neu entworfen", next }));
  assert.equal(run().status, 0);
  assert.equal(JSON.parse(blockOf()).title, "Neu entworfen");
  // SK32: a result with errors is never written – the journal and the cache stay, the errors are printed.
  const before = readFileSync(journal, "utf8");
  const cache = readFileSync(draft, "utf8");
  writeFileSync(draft, JSON.stringify({ title: "Mit Fehler", next, decisions: [{ key: "a", title: "Ohne Weg" }] }));
  const broken = run();
  assert.equal(broken.status, 2, broken.stdout + broken.stderr);
  assert.match(broken.stderr, /ERRORS this write would add:\n- "Ohne Weg": field how is missing/);
  assert.match(broken.stderr, /Journal unchanged – fix the draft and run again/);
  assert.equal(readFileSync(journal, "utf8"), before);
  assert.notEqual(readFileSync(draft, "utf8"), cache, "the draft stays as written, to be fixed");
  assert.ok(!existsSync(join(dir, ".cache", "journal-candidate.tmp")), "the checked candidate is removed");
  rmSync(dir, { recursive: true, force: true });
});

test("check-material: in a course read aloud, a matrix quiz and default feedback lines are warned (SK40)", () => {
  const head = narrator => `<!--\nlanguage: de\n${narrator ? "narrator: Deutsch Female\n" : ""}@ok: Richtig!\n@no: Noch nicht.\n-->\n\n# Kurs\n\n## Einheit\n\n`;
  const body = "### Wer macht was?\n\nWer macht was?\n\n- [[Königin] [Drohne]]\n- [ (X) ( ) ] legt Eier\n- [ ( ) (X) ] fliegt aus\n\n" +
    "### Frage\n\nWer legt Eier?\n\n<!-- data-text-failed=\"@no\" data-text-solved=\"@ok\" -->\n- [(X)] Königin\n- [( )] Drohne\n\nUnd wer fliegt?\n\n- [( )] Königin\n- [(X)] Drohne\n";
  const read = materialChecks.analyseMaterial(head(true) + body).warnings;
  assert.ok(read.some(text => /^matrix quiz on slide "Wer macht was\?": after a wrong check every row turns red/.test(text)), read.join("\n"));
  assert.ok(read.some(text => /^1 of 2 quizzes show the player's default feedback lines/.test(text)), read.join("\n"));
  assert.ok(!materialChecks.analyseMaterial(head(false) + body).warnings.some(text => /matrix quiz|default feedback/.test(text)), "without a narrator: no such warning");
});

test("check-material reports answer options that give the answer away by their surface (R10-D1)", () => {
  const { describePatterns, articles } = materialChecks;
  const source = [
    "<!--\nlanguage: de\n-->\n\n# Kurs\n\n## Kapitel 1\n\n### Seite A\n",
    "Warum fällt das Blatt?\n\n- [( )] Weil es kalt ist.\n- [(X)] Weil der Baum im Herbst Wasser sparen muss.\n- [( )] Weil es Wind gibt.\n",
    "Wozu dient die Rinde?\n\n- [( )] Damit der Baum wächst.\n- [(X)] Sie schützt den Stamm.\n- [( )] Damit der Baum blüht.\n",
    "Was ist grün?\n\n- [( )] Rinde\n- [(X)] Blatt\n- [( )] Wurzel\n",
    "### Seite B\n",
    "Im Herbst verliert der Baum seine bunten Blätter am Ast.\n",
    "Im Herbst verliert der [->[(Baum)|Wind]] seine bunten [->[(Blätter)|Wurzeln]] am Ast.\n",
    "Aus [[(dem Saft)|Den Wurzeln]] wird Zucker.\n",
    "## Kapitel 2\n\nWas fällt im Herbst?\n\n<!-- data-randomize -->\n- [( )] Im Herbst fällt Schnee.\n- [(X)] Im Herbst fällt Laub.\n- [( )] Im Herbst fällt Hagel.\n"
  ].join("\n");
  const { patterns, warnings } = analyseMaterial(source);
  assert.deepEqual(patterns, { single: 4, longest: 1, built: 1, position: 1, cards: 3, repeated: 1 });
  assert.match(warnings.join("\n"), /answer pattern in "Kapitel 1": the correct option is clearly the longest \(at least 20 % longer than every other\) in 1 of 3 single-choice questions – slide "Seite A" \("Warum fällt das Blatt\?"\)/);
  assert.match(warnings.join("\n"), /answer pattern in "Kapitel 1": the correct option is built differently in 1 of 3 .* \("Wozu dient die Rinde\?"\)/);
  assert.match(warnings.join("\n"), /answer pattern in "Kapitel 1": the correct option is option 2 in 3 single-choice questions in a row/);
  assert.match(warnings.join("\n"), /slide "Seite B": gap cards "dem Saft", "Den Wurzeln" start with an article/);
  assert.match(warnings.join("\n"), /slide "Seite B": in a gap only the correct card "dem Saft" starts with a small letter/);
  assert.match(warnings.join("\n"), /slide "Seite B": the gap sentence "Im Herbst verliert der … seine bunten … am Ast\." also stands as its own line/);
  assert.doesNotMatch(warnings.join("\n"), /Kapitel 2/, "same start for all options, and data-randomize: no pattern");
  assert.equal(describePatterns(patterns), "correct option clearly longest in 1 of 4 single-choice questions · built differently in 1 · same position 3+ times in a row: 1 · gap cards with a cue: 3 · repeated gap sentences: 1");
  // Without a known language only the language-neutral checks run; a hidden read-aloud copy is no twin.
  const english = analyseMaterial("<!--\nlanguage: xx\n-->\n\n# A\n\n<!-- style=\"text-indent: -10000px\" -->\nThe tree loses its leaves in autumn.\n\nThe [[(tree)|wind]] loses its [[(leaves)|roots]] in autumn.\n\nPick: [[(the sap)|the roots]]\n");
  assert.deepEqual(english.warnings, []);
  assert.ok(articles.en.includes("the") && articles.de.includes("dem"));
  // Short single-word options and equally long sentences are no pattern.
  assert.deepEqual(analyseMaterial("# A\n\nQ?\n\n- [( )] Ei\n- [(X)] Raupe\n\nQ2?\n\n- [( )] It grows in spring.\n- [(X)] It falls in autumn.\n").warnings, []);
});

test("check-material counts read-aloud texts in hints apart, and says when no image size helps (R10-D2, R10-D3)", () => {
  const quiz = "<!--\nnarrator: Deutsch Female\n-->\n\n# A\n\nFrage?\n\n- [(X)] {|>}{ja}\n- [( )] {|>}{nein}\n- [[?]] {|>}{Lies noch einmal.}\n";
  assert.deepEqual(analyseMaterial(quiz).readAloud, { blocks: 0, inline: 3, inHints: 1 }, "hints are rendered only when opened");
  const view = { top: 78, bottom: 1042 };
  assert.equal(describeFit(fitOnScreen({ view, question: 1000, options: [{ top: 1030, bottom: 1100, images: [] }, { top: 1110, bottom: 1300, images: [200] }] }), { width: 810, height: 1080 }),
    "810×1080 portrait: fits only once scrolled (at open 0 of 2 options visible; question at the top: fits) – at open the question starts too far down: no image size helps there; split the slide or accept scrolling");
  assert.equal(describeFit(fitOnScreen({ view: { top: 78, bottom: 400 }, question: 100, options: [{ top: 130, bottom: 400, images: [] }, { top: 410, bottom: 520, images: [100] }] }), { width: 810, height: 480 }),
    "810×480 landscape: does not fit (at open 1 of 2 options visible; question at the top: 1 of 2 options visible, needs 420 px, has 322 px) – even without images the text needs nearly the whole screen: no image size helps; split the slide");
  assert.doesNotMatch(describeFit(fitOnScreen({ view: { top: 78, bottom: 400 }, question: 100, options: [{ top: 130, bottom: 400, images: [] }, { top: 410, bottom: 520, images: [100] }] }), { width: 810, height: 480 }), /at most 0 px/);
});

test("validate-journal wants the report's outcome words in the unit's status line and statusLabel (R10-D5) and names write-dashboard for a missing href (R10-D4)", () => {
  const units = label => [{ id: 1, title: "E1", state: "review", href: "#1.-e1", statusLabel: label, usable: { state: "limited", missing: ["1 Foto"] }, process: { steps: [{ title: "Material", state: "done" }] } }];
  const report = "#### Prüfbericht – Einheit 1\n\n<section data-key=\"validation-report\">\n\n**Ergebnis:** bestanden – es fehlt noch: 1 Foto (23.10.2026) – 1 Punkt seither geändert – kurze Nachprüfung offen\n\n**Jetzt mit den Lernenden nutzbar:** ja, mit Einschränkungen: 1 Foto\n\n**Nach der Prüfung geändert:**\n\n- 23.10.2026 · S1 · Satz gekürzt · Kurzprüfung\n\n<details>\n\n__Result:__ PASS\n\n</details>\n\n</section>\n\n";
  const sessionsOf = status => `## Sessions – Einheiten\n\n1. E1 – ${status}\n\n### 1. E1\n\nText\n\n${report}`;
  const same = "bestanden – es fehlt noch: 1 Foto – 1 Punkt seither geändert – kurze Nachprüfung offen";
  const clean = validate({ title: "Kurs", next, units: units(same) }, sessionsOf(same));
  assert.equal(clean.status, 0, clean.output);
  assert.doesNotMatch(clean.output, /Warnings:/, clean.output);
  const other = validate({ title: "Kurs", next, units: units("überarbeitet – Prüfung offen") }, sessionsOf("überarbeitet – Prüfung offen"));
  assert.equal(other.status, 0, "warnings only");
  assert.match(other.output, /unit 1: status line "überarbeitet – Prüfung offen" does not carry the report's outcome "bestanden – es fehlt noch: 1 Foto – 1 Punkt seither geändert – kurze Nachprüfung offen"/);
  assert.match(other.output, /unit 1: statusLabel "überarbeitet – Prüfung offen" does not carry/);
  const missing = validate({ title: "Kurs", next, units: [{ id: 1, title: "E1", state: "current", process: { steps: [{ title: "Material", state: "planned" }] } }] }, "## Sessions – Einheiten\n\n### 1. E1\n\nText\n\n");
  assert.equal(missing.status, 2, missing.output);
  assert.match(missing.output, /unit 1 has a skeleton but no href .* run write-dashboard\.mjs in the same save as the skeleton .* derives the href, the statusLabel and the planning step/);
});

test("a unit card starts with 'usable with learners'; the progress line names usable units instead of 'nothing finished' (R11-S1)", () => {
  const steps = [{ title: "Material", state: "draft" }, { title: "Prüfen", state: "planned" }];
  const data = { lang: "de", title: "X", unitLabel: { one: "Lerneinheit", many: "Lerneinheiten" }, units: [
    { id: 1, title: "A", state: "revision", statusLabel: "Prüfung: Korrektur nötig: 2 von 3 Punkten offen", usable: { state: "no", missing: ["6 Fotos"] }, process: { steps } },
    { id: 2, title: "B", state: "draft", usable: { state: "limited", missing: ["1 Foto", "kurze Nachprüfung"] }, process: { steps } },
    { id: 3, title: "C", state: "planned", process: { steps } }] };
  const html = dashboard.renderComponent("View", "r11a", data);
  const card = html.match(/data-dashboard-select="2"[\s\S]*?<\/button>/)[0];
  assert.ok(card.indexOf("dashboard-usable") < card.indexOf("dashboard-status") && card.indexOf("dashboard-status") < card.indexOf("dashboard-unit-steps"), "usable → open points → steps");
  assert.match(card, /Mit den Lernenden nutzbar: ja, mit Einschränkungen: 1 Foto; kurze Nachprüfung/);
  assert.match(card, /aria-label="B: Mit den Lernenden nutzbar: ja, mit Einschränkungen/);
  assert.match(html, /Freigegeben: noch keine · Schon nutzbar: Lerneinheit 2 \(mit Einschränkungen\)/);
  assert.doesNotMatch(html, /Noch nichts fertig/);
  assert.match(html, /dashboard-process-usable[\s\S]*?noch nicht – es fehlt noch: 6 Fotos/, "the selected unit's panel repeats the answer first");
  const en = dashboard.renderComponent("View", "r11b", { ...data, lang: "en", unitLabel: undefined });
  assert.match(en, /Usable with learners: yes, with limits: 1 Foto; kurze Nachprüfung/, "missing comes from the data as written");
  assert.match(en, /Approved: none yet · Usable now: unit 2 \(with limits\)/);
  // Once a unit is done the bar stays, and a second line names the usable ones.
  const done = dashboard.renderComponent("View", "r11c", { ...data, units: [{ id: 1, title: "A", state: "done", usable: { state: "yes" } }, data.units[1]] });
  assert.match(done, /<progress[\s\S]*?/);
  assert.match(done, /dashboard-progress-usable">Schon nutzbar: Lerneinheit 2 \(mit Einschränkungen\)/);
  // Without usable the old sentence stays.
  assert.match(dashboard.renderComponent("View", "r11d", { ...data, units: [data.units[2]] }), /Noch nichts fertig/);
  // The data is checked: states, missing, fields.
  assert.throws(() => dashboard.buildModel({ units: [{ title: "A", usable: { state: "maybe" } }] }), /Unknown usable state/);
  assert.throws(() => dashboard.buildModel({ units: [{ title: "A", usable: { state: "limited" } }] }), /needs missing/);
  assert.throws(() => dashboard.buildModel({ units: [{ title: "A", usable: { state: "yes", missing: ["x"] } }] }), /use "limited"/);
  assert.throws(() => dashboard.buildModel({ units: [{ title: "A", usable: { state: "yes", why: "x" } }] }), /Unknown usable field/);
  // Any course language: the texts are labels, with {what} and {units}.
  const fr = dashboard.renderComponent("View", "r11e", { ...data, lang: "fr", unitLabel: { one: "unité", many: "unités" }, labels: {
    "usable.limited": "Utilisable : oui, avec limites", usableMissing: "il manque : {what}", checkedNone: "Vérifiées : aucune", usableUnits: "Déjà utilisables : {units}", usableLimitedShort: "avec limites" } });
  assert.match(fr, /Utilisable : oui, avec limites: 1 Foto; kurze Nachprüfung/);
  assert.match(fr, /Vérifiées : aucune · Déjà utilisables : unité 2 \(avec limites\)/);
  assert.throws(() => dashboard.buildModel({ labels: { usableUnits: "{unit}" } }), /\{unit\}/);
  const shown = dashboard.visibleTexts(data, "de");
  assert.deepEqual(shown.usable.map(item => item.state), ["no", "limited"]);
  assert.equal(shown.viewMaterial, "So sehen es die Lernenden");
});

test("a unit with material has its own button for the learners' view; the planning link is always 'see planning' (R11-S2)", () => {
  const view = { href: "agent:teaching/preview?file=1", command: ":preview 1" };
  const data = { lang: "de", title: "X", units: [{ id: 1, title: "A", state: "draft", href: "#1.-a", view }, { id: 2, title: "B", state: "planned", href: "#2.-b" }] };
  const html = dashboard.renderComponent("View", "r11v", data);
  assert.match(html, /<\/button><span class="dashboard-unit-view">[\s\S]*?href="agent:teaching\/preview\?file=1"[\s\S]*?👁<\/span> So sehen es die Lernenden[\s\S]*?:preview 1/, "the button sits below the card, outside the select button");
  assert.match(html, /dashboard-process-link">[\s\S]*?So sehen es die Lernenden[\s\S]*?href="#1\.-a"[^>]*>Planung ansehen/);
  assert.equal((html.match(/dashboard-unit-view/g) ?? []).length, 1, "only units with material get it");
  assert.match(dashboard.renderComponent("View", "r11w", { ...data, lang: "en" }), /How learners see it[\s\S]*?>See planning/);
  assert.match(dashboard.renderComponent("View", "r11x", { ...data, units: [{ ...data.units[0], view: { ...view, label: "So sehen es die Teilnehmenden" } }] }), /So sehen es die Teilnehmenden/);
  assert.throws(() => dashboard.buildModel({ units: [{ title: "A", view: { href: "agent:teaching/preview?file=1" } }] }), /readable command/);
  // planLabel no longer renames the link.
  assert.match(dashboard.renderComponent("View", "r11y", { ...data, units: [{ ...data.units[0], planLabel: "Zu Einheit 1" }] }), />Planung ansehen/);
});

test("validate-journal checks usable, the learners' view, the plan label, outdated wording and dated items (R11-S1, R11-S2, R11-D1, R11-S4)", () => {
  const view = { href: "agent:teaching/preview?file=1", command: ":preview 1" };
  const unitOf = extra => [{ id: 1, title: "E1", state: "review", href: "#1.-e1", process: { steps: [{ title: "Material", state: "done" }] }, ...extra }];
  const table = notes => `<details><summary>Technik</summary>\n\n| # | Title | Type | Method | Skeleton | Material | Done | Notes |\n|---|---|---|---|---|---|---|---|\n| 1 | E1 | a | b | ✅ | ✅ | ❌ | ${notes} |\n\n</details>\n\n`;
  const report = (outcome, usable) => `#### Prüfbericht – Einheit 1\n\n<section data-key="validation-report">\n\n**Ergebnis:** ${outcome}\n\n**Jetzt mit den Lernenden nutzbar:** ${usable}\n\n**Nach der Prüfung geändert:**\n\n- 23.10.2026 · S1 · Satz gekürzt · Kurzprüfung\n\n<details>\n\n__Result:__ PASS\n\n</details>\n\n</section>\n\n`;
  const current = "bestanden – es fehlt noch: 1 Foto (23.10.2026) – 1 Punkt seither geändert – kurze Nachprüfung offen";
  const state = "bestanden – es fehlt noch: 1 Foto – 1 Punkt seither geändert – kurze Nachprüfung offen";
  const action = "[▶️ Bilder einfügen](agent:artist/create-image?number=1) `:agent artist` → `:create-image 1` · [👁 So sehen es die Lernenden](agent:teaching/preview?file=1) `:preview 1`";
  const sessionsOf = ({ status = state, outcome = current, usable = "ja, mit Einschränkungen: 1 Foto", line = action, notes = state, extra = "" } = {}) =>
    `## Sessions – Einheiten\n\n1. E1 – ${status}\n\n${table(notes)}### 1. E1\n\n<!-- class="journal-actions" -->\n${line}\n\nText\n\n${extra}${report(outcome, usable)}`;
  const good = { usable: { state: "limited", missing: ["1 Foto"] }, view, statusLabel: state };
  const clean = validate({ title: "Kurs", next, units: unitOf(good) }, sessionsOf());
  assert.equal(clean.status, 0, clean.output);
  assert.doesNotMatch(clean.output, /Warnings:/, clean.output);
  // R11-S1: usable missing, or saying something else than the report.
  const noUsable = validate({ title: "Kurs", next, units: unitOf({ ...good, usable: undefined }) }, sessionsOf());
  assert.match(noUsable.output, /unit 1 has a check report but no usable – write units\[1\]\.usable \{"state": "limited", "missing": \[what is still missing\]\}/);
  const other = validate({ title: "Kurs", next, units: unitOf({ ...good, usable: { state: "yes" } }) }, sessionsOf({ usable: "noch nicht: 1 Fehler auf der Startseite" }));
  assert.match(other.output, /unit 1: usable is "yes", but the report says .*\(no\) – usable follows the report/);
  // R11-S2: no view, no preview link in the action line, a renamed planning link.
  const hidden = validate({ title: "Kurs", next, units: unitOf({ ...good, view: undefined }), labels: { plan: "Zu Einheit 1" } },
    sessionsOf({ line: action.split(" · ")[0] }));
  assert.equal(hidden.status, 0, "warnings only");
  assert.match(hidden.output, /unit 1 has material \(Material ✅\) but no view – add units\[1\]\.view \{"href": "agent:teaching\/preview\?file=1", "command": ":preview 1"\}, shown as "So sehen es die Lernenden"/);
  assert.match(hidden.output, /unit 1: its action line has no 👁 preview link/);
  assert.match(hidden.output, /labels\.plan "Zu Einheit 1" renames the planning link – it is always "Planung ansehen"/);
  // R11-D1: an outdated report is recognised; the warning recommends the current terms, never the old words.
  const oldOutcome = "bestanden – Bilder einfügen folgt noch (23.10.2026) – 1 Punkt seither geändert – Nachprüfung offen";
  const old = validate({ title: "Kurs", next, units: unitOf({ ...good, statusLabel: "überarbeitet – Prüfung offen" }) },
    sessionsOf({ outcome: oldOutcome, status: "überarbeitet – Prüfung offen", notes: "überarbeitet – Prüfung offen" }));
  assert.equal(old.status, 0, "warnings only");
  assert.match(old.output, /unit 1: the report's outcome .* uses outdated wording \("Bilder einfügen folgt noch", "Nachprüfung offen"\) – never copy it; the current wording is "bestanden – es fehlt noch: \{what\}", "\{n\} Punkt\(e\) seither geändert – kurze Nachprüfung offen"/);
  assert.match(old.output, /unit 1: status line "überarbeitet – Prüfung offen" uses outdated wording \("überarbeitet"\)/);
  assert.match(old.output, /unit 1: statusLabel "überarbeitet – Prüfung offen" uses outdated wording/);
  assert.match(old.output, /unit 1: Notes cell "überarbeitet – Prüfung offen" uses outdated wording/);
  assert.doesNotMatch(old.output, /write "bestanden – Bilder einfügen folgt noch/, "never recommends the outdated outcome");
  const fail = validate({ title: "Kurs", next, units: unitOf(good) }, sessionsOf({ outcome: "Korrektur nötig (3) (23.10.2026) – 1 Punkt seither geändert – kurze Nachprüfung offen" }).replace("__Result:__ PASS", "__Result:__ FAIL"));
  assert.match(fail.output, /uses outdated wording \("Korrektur nötig \(3\)"\) – never copy it; the current wording is "Korrektur nötig: \{open\} von \{n\} Punkten offen"/);
  // "2 of 3 points open" counts the points of the report, not open points of the overview.
  const counted = validate({ title: "Kurs", next, units: unitOf({ ...good, statusLabel: `Korrektur nötig: 2 von 3 Punkten offen` }) }, sessionsOf());
  assert.doesNotMatch(counted.output, /says "3 Punkten"/, counted.output);
  // R11-S4: a numbered item that starts with a date.
  const dated = validate({ title: "Kurs", next, units: unitOf(good) }, sessionsOf({ extra: "**Entscheidungen:**\n\n1. 23.10.2026: Fotos aus einer freien Sammlung.\n2. 2026-10-24: Kürzer.\n\n" }));
  assert.match(dated.output, /2 numbered items start with a date .* write "- \*\*\{date\}:\*\* …"/);
  const bold = validate({ title: "Kurs", next, units: unitOf(good) }, sessionsOf({ extra: "**Entscheidungen:**\n\n- **23.10.2026:** Fotos aus einer freien Sammlung.\n\n" }));
  assert.doesNotMatch(bold.output, /start with a date/, bold.output);
});

const now = await import("./now.mjs");

test("now.mjs prints UTC, the local time with its offset and the age of a chat timestamp (R9-S9)", () => {
  const lines = now.describeNow(new Date("2026-10-23T09:51:00Z"), now.parseTimestamp("2026-10-23T08:40:00Z"), "Europe/Berlin");
  assert.deepEqual(lines, ["UTC: 2026-10-23T09:51:00Z", "Local (this computer): Fri 2026-10-23 11:51 (UTC+02:00, Europe/Berlin)", "Since 2026-10-23T08:40:00Z: 1 h 11 min (older than about an hour: yes)"]);
  assert.match(now.describeNow(new Date("2026-12-01T12:00:00Z"), null, "America/New_York")[1], /07:00 \(UTC-05:00, America\/New_York\)$/);
  assert.equal(now.parseTimestamp("2026-10-23 08:40").toISOString(), "2026-10-23T08:40:00.000Z", "a timestamp without zone is UTC, as in events");
  assert.equal(now.parseTimestamp("1792745400000").toISOString(), new Date(1792745400000).toISOString());
  assert.equal(now.formatDuration(45 * 1000), "45 s");
  assert.equal(now.formatDuration(12 * 60 * 1000), "12 min");
  assert.equal(now.formatDuration(26 * 3600 * 1000), "1 d 2 h");
  assert.throws(() => now.parseTimestamp("gestern"), /invalid timestamp/);
  const script = fileURLToPath(new URL("./now.mjs", import.meta.url));
  const ok = spawnSync(process.execPath, [script], { encoding: "utf8" });
  assert.equal(ok.status, 0);
  assert.match(ok.stdout, /^UTC: \d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z\nLocal \(this computer\): /);
  const bad = spawnSync(process.execPath, [script, "gestern"], { encoding: "utf8" });
  assert.equal(bad.status, 2);
  assert.match(bad.stdout, /Exit code: 2/);
});

// Older journals (R11-D2): journals created before the template change of fe18ee1 still show {{…}}
// skeletons in unfilled sections and the report heading "Validation Report". migrate-journal.mjs moves
// them to the current layout (representation only); the validator points there instead of blocking.
const validatorScript = fileURLToPath(new URL("./validate-journal.mjs", import.meta.url));
const migrateScript = fileURLToPath(new URL("./migrate-journal.mjs", import.meta.url));
const oldJournal = readFileSync(new URL("./fixtures/journal-84484ae.md", import.meta.url), "utf8");
function inProject(text, run) {
  const dir = mkdtempSync(join(tmpdir(), "migrate-check-"));
  writeFileSync(join(dir, "journal.md"), text);
  const script = (path, ...args) => { const result = spawnSync(process.execPath, [path, ...args], { cwd: dir, encoding: "utf8" }); return { status: result.status, output: result.stdout + result.stderr }; };
  try { return run({ validate: () => script(validatorScript), migrate: (...args) => script(migrateScript, ...args), read: () => readFileSync(join(dir, "journal.md"), "utf8") }); }
  finally { rmSync(dir, { recursive: true, force: true }); }
}
const visibleOutsideCode = text => text.replace(/^<!--[\s\S]*?-->/, "").replace(/```[\s\S]*?```/g, "").replace(/<!--[\s\S]*?-->/g, "").replace(/`[^`\n]*`/g, "");

test("validate-journal does not take LiaScript in inline code ({{1}}, {{|>}}) for a template placeholder", () => {
  const result = validate({ title: "Kurs", next }, "## Sessions\n\n### 1. Eins\n\n- Vorlesen ✅ `{{|>}}` vor Absätzen, Animation `{{1}}`\n\n");
  assert.doesNotMatch(result.output, /template placeholder/, result.output);
});

test("an older journal layout is named as such and points to migrate-journal.mjs", () => {
  inProject(oldJournal, ({ validate }) => {
    const result = validate();
    assert.equal(result.status, 2, result.output);
    assert.match(result.output, /older journal layout/);
    assert.match(result.output, /node specs\/dashboard\/migrate-journal\.mjs/);
  });
});

test("migrate-journal brings the empty journal of 84484ae to the current layout", () => {
  inProject(oldJournal, ({ validate, migrate, read }) => {
    const run = migrate();
    assert.equal(run.status, 0, run.output);
    const text = read();
    assert.doesNotMatch(visibleOutsideCode(text), /\{\{/, "no visible placeholder is left");
    assert.match(text, /^# New course$/m);
    assert.match(text, /^## Course Context\n\n<!-- class="journal-actions" -->\n\[▶️ Start course\]/m);
    assert.match(text, /^_Still empty – filled with “Start course”._$/m);
    assert.match(text, /"footer": "new, empty project"/);
    assert.match(text, /^## Agents$/m, "sections without placeholders stay");
    const after = validate();
    assert.equal(after.status, 0, after.output);
  });
});

test("migrate-journal translates the migrated lines with the course's language pack and keeps translated headings", () => {
  const german = oldJournal.replace(/^language: en$/m, "language: de").replace(/^## Course Context$/m, "## Course Context – Kursrahmen").replace(/^## Outline$/m, "## Outline – Gliederung");
  inProject(german, ({ migrate, read }) => {
    const run = migrate();
    assert.equal(run.status, 0, run.output);
    const text = read();
    assert.match(text, /^# Neuer Kurs$/m);
    assert.match(text, /^## Course Context – Kursrahmen\n\n<!-- class="journal-actions" -->\n\[▶️ Kurs starten\]/m);
    assert.match(text, /^_Noch leer – wird mit „Kurs starten“ ausgefüllt._$/m);
    assert.match(text, /^## Outline – Gliederung$/m);
  });
});

test("migrate-journal --check lists the changes and writes nothing", () => {
  inProject(oldJournal, ({ migrate, read }) => {
    const run = migrate("--check");
    assert.equal(run.status, 0, run.output);
    assert.match(run.output, /Course Context/);
    assert.match(run.output, /Visual Identity/);
    assert.equal(read(), oldJournal);
  });
});

test("migrate-journal leaves a partly filled section alone and names it", () => {
  const partly = oldJournal.replace("  {{name of the lecture or course}}", "  Erste Schritte");
  inProject(partly, ({ migrate, read }) => {
    const run = migrate();
    assert.equal(run.status, 2, run.output);
    assert.match(run.output, /Outline.*by hand/);
    assert.match(read(), /^  Erste Schritte$/m);
    assert.match(read(), /^_Still empty – filled with “Start course”._$/m, "the other sections are migrated");
  });
});

test("migrate-journal gives older check reports the current heading with unit word and number, and the section key", () => {
  const journal = `<!--\nlanguage: de\n-->\n\n# Kurs\n\n## Course Context – Kursrahmen\n\n* __Terminology:__\n  1. sessions-called: Baustein\n\n## Sessions – Bausteine\n\n### 1. Eins\n\n#### Validation Report – Prüfbericht\n\n__Date:__ 2026-10-06\n\n- Ergebnis: bestanden\n\n### 2. Zwei\n\n#### Validation Report – Prüfbericht\n\n<section>\n\n**Ergebnis:** bestanden\n\n</section>\n\n---\n\n## Dashboard\n\n\`\`\`json @Dashboard.View\n{"title": "Kurs"}\n\`\`\`\n`;
  inProject(journal, ({ validate, migrate, read }) => {
    const run = migrate();
    assert.equal(run.status, 0, run.output);
    const text = read();
    assert.match(text, /^#### Prüfbericht – Baustein 1\n\n<section data-key="validation-report">\n\n__Date:__ 2026-10-06\n\n- Ergebnis: bestanden\n\n<\/section>\n\n### 2\. Zwei$/m);
    assert.match(text, /^#### Prüfbericht – Baustein 2\n\n<section data-key="validation-report">\n\n\*\*Ergebnis:\*\* bestanden\n\n<\/section>$/m);
    assert.doesNotMatch(validate().output, /appears 2 times/);
  });
});

test("migrate-journal moves a report heading out of its <section> and reads the unit word from \"unit (Einheit)\"", () => {
  const journal = `<!--\nlanguage: de\n-->\n\n# Kurs\n\n## Course Context – Kursrahmen\n\n* __Terminology:__\n  1. sessions-called: unit (Einheit)\n\n## Sessions – Einheiten\n\n### 1. Eins\n\n<section>\n\n#### Validation Report\n\n**Ergebnis:** bestanden\n\n</section>\n\n---\n\n## Dashboard\n\n\`\`\`json @Dashboard.View\n{"title": "Kurs"}\n\`\`\`\n`;
  inProject(journal, ({ validate, migrate, read }) => {
    const run = migrate();
    assert.equal(run.status, 0, run.output);
    assert.match(read(), /^### 1\. Eins\n\n#### Prüfbericht – Einheit 1\n\n<section data-key="validation-report">\n\n\*\*Ergebnis:\*\* bestanden\n\n<\/section>$/m);
    assert.doesNotMatch(validate().output, /heading inside <section>/);
  });
});

test("the old word for the planning sketch ('Skelett ✅', 'skeleton ✅') is outdated wording; a unit title with the word is not", () => {
  const sessions = status => `## Sessions – Einheiten\n\n1. Das Skelett – ${status}\n\n### 1. Das Skelett\n\nText\n\n`;
  const unit = statusLabel => ({ title: "Kurs", next, units: [{ id: 1, title: "Das Skelett", state: "planned", href: "#1.-das-skelett", statusLabel }] });
  const old = validate(unit("Skelett ✅ · Material offen"), sessions("Skelett ✅ · Material offen"));
  assert.match(old.output, /unit 1: status line "Skelett ✅ · Material offen" uses outdated wording .* the current wording is "Planungsskizze"/);
  assert.match(old.output, /unit 1: statusLabel "Skelett ✅ · Material offen" uses outdated wording/);
  const current = validate(unit("Planungsskizze ✅ · Material offen"), sessions("Planungsskizze ✅ · Material offen"));
  assert.doesNotMatch(current.output, /outdated wording/, current.output);
});

// The line replacer (localize-journal.mjs <map.json> <file>): one write for many changes of one file, also
// for the image step – a marker block found by its slug, a replacement of several lines, a new chapter at the end.
const localizeScript = fileURLToPath(new URL("./localize-journal.mjs", import.meta.url));
function replaceIn(text, map) {
  const dir = mkdtempSync(join(tmpdir(), "localize-check-"));
  writeFileSync(join(dir, "README.md"), text);
  writeFileSync(join(dir, "map.json"), JSON.stringify(map));
  const run = spawnSync(process.execPath, [localizeScript, "map.json", "README.md"], { cwd: dir, encoding: "utf8" });
  const after = readFileSync(join(dir, "README.md"), "utf8");
  rmSync(dir, { recursive: true, force: true });
  return { status: run.status, output: run.stdout + run.stderr, after };
}
const markerMaterial = "# Kurs\n\n## Seite 1\n\n<!--- image: blatt — ein Blatt --->\n> 🖼️ _Bild folgt_\n\n## Seite 2\n\n<!--- image: baum — ein Baum --->\n> 🖼️ _Bild folgt_\n\nSieh dir das Foto an.\n";

test("the line replacer replaces a block of lines found by its first line, also when its other lines repeat", () => {
  const run = replaceIn(markerMaterial, { replace: [["<!--- image: blatt — ein Blatt --->\n> 🖼️ _Bild folgt_", "![Ein Blatt](https://example.org/blatt.jpg)"]] });
  assert.equal(run.status, 0, run.output);
  assert.match(run.after, /## Seite 1\n\n!\[Ein Blatt\]\(https:\/\/example\.org\/blatt\.jpg\)\n\n## Seite 2\n\n<!--- image: baum — ein Baum --->\n> 🖼️ _Bild folgt_/);
});

test("the line replacer writes several lines for one and appends a chapter at the end", () => {
  const run = replaceIn(markerMaterial, { replace: [["Sieh dir das Foto an.", "Sieh dir das Foto an.\n\nWas fällt dir auf?"]], append: ["", "## Bildnachweise", "", "- Seite 1: ein Blatt – Autorin – CC BY 4.0"] });
  assert.equal(run.status, 0, run.output);
  assert.match(run.after, /Sieh dir das Foto an\.\n\nWas fällt dir auf\?\n\n## Bildnachweise\n\n- Seite 1: ein Blatt – Autorin – CC BY 4\.0\n$/);
});

test("the line replacer writes nothing when a block does not match exactly once", () => {
  const twice = replaceIn(markerMaterial, { replace: [["<!--- image: blatt — ein Blatt --->", "x"], ["> 🖼️ _Bild folgt_\n\nSieh", "y"]] });
  assert.equal(twice.status, 2, twice.output);
  assert.match(twice.output, /matches 0 blocks/);
  assert.equal(twice.after, markerMaterial, "all or nothing");
});

test("an image placeholder inside a quiz option carries a distinguishing word after it and is still a placeholder", () => {
  assert.ok(isImageMarker("- [( )] 🖼️ _Bild folgt_ Bild 1"));
  assert.ok(isImageMarker("- [[ ]] 🖼️ _Image follows_ picture 2"));
  assert.ok(!isImageMarker("- [( )] 🖼️ ![Bild 1](blatt.jpg)"), "a real image is no placeholder");
  assert.ok(!isImageMarker("📷 _Nimm_ ein Foto vom Himmel auf."), "an instruction is no placeholder");
});

test("the status line is read after the unit title of its heading, and a recommended wording keeps the short re-check", () => {
  const view = { href: "agent:teaching/preview?file=1", command: ":preview 1" };
  const outcome = "bestanden – es fehlt noch: 1 Foto (23.10.2026) – 1 Punkt seither geändert – kurze Nachprüfung offen";
  const state = "bestanden – es fehlt noch: 1 Foto – 1 Punkt seither geändert – kurze Nachprüfung offen";
  const report = `#### Prüfbericht – Einheit 1\n\n<section data-key="validation-report">\n\n**Ergebnis:** ${outcome}\n\n**Jetzt mit den Lernenden nutzbar:** ja, mit Einschränkungen: 1 Foto\n\n**Nach der Prüfung geändert:**\n\n- 23.10.2026 · S1 · Satz gekürzt · Kurzprüfung\n\n<details>\n\n__Result:__ PASS\n\n</details>\n\n</section>\n\n`;
  const sessions = status => `## Sessions – Einheiten\n\n1. Erste Schritte – ${status}\n\n<details><summary>Technik</summary>\n\n| # | Title | Type | Method | Skeleton | Material | Done | Notes |\n|---|---|---|---|---|---|---|---|\n| 1 | Erste Schritte | a | b | ✅ | ✅ | ❌ | ${state} |\n\n</details>\n\n### 1. Erste Schritte\n\n<!-- class="journal-actions" -->\n[▶️ Bilder einfügen](agent:artist/create-image?number=1) \`:agent artist\` → \`:create-image 1\` · [👁 So sehen es die Lernenden](agent:teaching/preview?file=1) \`:preview 1\`\n\nText\n\n${report}`;
  // The overview calls the unit "E1"; the status line uses the heading's title.
  const unit = { id: 1, title: "E1", state: "review", href: "#1.-erste-schritte", view, usable: { state: "limited", missing: ["1 Foto"] }, statusLabel: state, process: { steps: [{ title: "Material", state: "done" }] } };
  const same = validate({ title: "Kurs", next, units: [unit] }, sessions(state));
  assert.doesNotMatch(same.output, /status line .* does not carry/, same.output);
  const short = validate({ title: "Kurs", next, units: [unit] }, sessions("bestanden – es fehlt noch: 1 Foto"));
  assert.match(short.output, /status line "bestanden – es fehlt noch: 1 Foto" does not carry .* write "bestanden – es fehlt noch: 1 Foto – 1 Punkt seither geändert – kurze Nachprüfung offen"/);
});

test("own {one, many} labels for steps choose the form by the total, the progress line by the finished units", () => {
  const steps = { one: "{done} sur {total} étape", many: "{done} sur {total} étapes" };
  const data = { lang: "fr", title: "X", labels: { steps, progressText: { one: "{done} sur {total} {unit} est terminée", many: "{done} sur {total} {unit} sont terminées" } },
    unitLabel: { one: "unité", many: "unités" },
    units: [{ id: 1, title: "A", state: "done", process: { steps: [{ title: "a", state: "done" }, { title: "b", state: "planned" }, { title: "c", state: "planned" }] } }, { id: 2, title: "B", state: "planned" }] };
  const html = dashboard.renderComponent("View", "plural1", data);
  assert.match(html, /1 sur 3 étapes/);
  assert.match(html, /1 sur 2 unités est terminée/);
  const one = dashboard.renderComponent("View", "plural2", { ...data, units: [{ ...data.units[0], process: { steps: [{ title: "a", state: "done" }] } }] });
  assert.match(one, /1 sur 1 étape</);
});

test("validate-journal warns when an inserted free photo has no credit line in the material", () => {
  const page = "https://commons.wikimedia.org/wiki/File:Blatt.jpg";
  const file = "https://commons.wikimedia.org/wiki/Special:FilePath/Blatt.jpg?width=330";
  const journal = `<!--\nlanguage: de\n-->\n\n# Kurs\n\n## Course Context\n\n* __File Structure:__\n  1. Mode: single-file\n\n## Sessions\n\n### 1. Eins\n\n#### Images\n\n<section>\n\n#### blatt\n\n* __Status:__ inserted\n* __Source:__ free-photo\n* __File:__ ${file}\n* __Alt text:__ Ein Blatt\n* __Author:__ A. Autorin\n* __License:__ [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)\n* __Page:__ [Datei](${page})\n\n</section>\n\n## Dashboard\n\n\`\`\`json @Dashboard.View\n${JSON.stringify({ title: "Kurs", next })}\n\`\`\`\n`;
  const run = readme => {
    const dir = mkdtempSync(join(tmpdir(), "credits-check-"));
    writeFileSync(join(dir, "journal.md"), journal);
    writeFileSync(join(dir, "README.md"), readme);
    const result = spawnSync(process.execPath, [validatorScript, join(dir, "journal.md")], { encoding: "utf8" });
    rmSync(dir, { recursive: true, force: true });
    return result.stdout + result.stderr;
  };
  const missing = run(`# Kurs\n\n## Eins\n\n![Ein Blatt](${file})\n`);
  assert.match(missing, /image entry "blatt" \(unit 1\) is an inserted free photo, but README\.md has no credit line for it/);
  const credited = run(`# Kurs\n\n## Eins\n\n![Ein Blatt](${file})\n\n## Bildnachweise\n\n- Seite 1: ein Blatt – A. Autorin – [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) – [Datei](${page})\n`);
  assert.doesNotMatch(credited, /no credit line/, credited);
});

test("validate-journal compares open image entries and placeholders by slug – one photo may stand at several places (SK34)", () => {
  const entry = slug => `<section>\n\n#### ${slug}\n\n* __Status:__ wanted\n* __Source:__ free-photo\n\n</section>\n\n`;
  const journal = `<!--\nlanguage: de\n-->\n\n# Kurs\n\n## Course Context\n\n* __File Structure:__\n  1. Mode: single-file\n\n## Sessions\n\n### 1. Eins\n\n#### Images\n\n${entry("koenigin")}${entry("drohne")}## Dashboard\n\n\`\`\`json @Dashboard.View\n${JSON.stringify({ title: "Kurs", next })}\n\`\`\`\n`;
  const marker = slug => `<!--- image: ${slug} — Bild --->\n> 🖼️ _Bild folgt_\n\n`;
  const run = readme => {
    const dir = mkdtempSync(join(tmpdir(), "slug-check-"));
    writeFileSync(join(dir, "journal.md"), journal);
    writeFileSync(join(dir, "README.md"), readme);
    const result = spawnSync(process.execPath, [validatorScript, join(dir, "journal.md")], { encoding: "utf8" });
    rmSync(dir, { recursive: true, force: true });
    return result.stdout + result.stderr;
  };
  const twice = run(`# Kurs\n\n## Eins\n\n${marker("koenigin")}${marker("drohne")}### Üben\n\n${marker("koenigin")}${marker("drohne")}`);
  assert.doesNotMatch(twice, /image placeholder|without a placeholder|without an image entry/, twice);
  const off = run(`# Kurs\n\n## Eins\n\n${marker("koenigin")}${marker("arbeiterin")}`);
  assert.match(off, /open image entry "drohne" without a placeholder/);
  assert.match(off, /placeholder "arbeiterin" without an image entry/);
});

test("text fields of the wrong type fail in buildModel instead of breaking the page (validator green, page red)", () => {
  assert.throws(() => dashboard.buildModel({ unitsTitle: { one: "Kapitel", many: "Kapiteln" } }), /unitsTitle/);
  assert.throws(() => dashboard.buildModel({ unitLabel: { one: 1, many: 2 } }), /unitLabel/);
  assert.throws(() => dashboard.buildModel({ units: [{ title: "A", statusLabel: ["x"] }] }), /statusLabel/);
  assert.doesNotThrow(() => dashboard.buildModel({ unitsTitle: "Kapitel", unitLabel: { one: "Kapitel", many: "Kapiteln" } }));
});

test("the provisional hint also finds learning objectives saved under their data-key in the course language", () => {
  const journal = `<!--\nlanguage: de\n-->\n\n# Kurs\n\n## Course Context\n\n- Zielgruppe: vorgemerkt, noch offen\n\n## Outline\n\n<!-- data-key="learning-goals" -->\n**Lernziele:**\n\n1. Die Kinder benennen drei Teile.\n\n## Dashboard\n\n\`\`\`json @Dashboard.View\n${JSON.stringify({ title: "Kurs", next })}\n\`\`\`\n`;
  inProject(journal, ({ validate }) => assert.match(validate().output, /provisional/));
});

test("a check report without the line 'usable with learners now' is named", () => {
  const report = "#### Prüfbericht – Einheit 1\n\n<section data-key=\"validation-report\">\n\n**Ergebnis:** bestanden\n\nDas passt: alles.\n\n<details>\n\n__Result:__ PASS\n\n</details>\n\n</section>\n\n";
  const result = validate({ title: "Kurs", next, units: [{ id: 1, title: "E1", state: "review", href: "#1.-e1", usable: { state: "yes" } }] }, `## Sessions\n\n### 1. E1\n\nText\n\n${report}`);
  assert.match(result.output, /unit 1: the check report has no line "usable with learners now"/, result.output);
});

test("small validator and script fixes: course-language advice, finished words with ⏳, report keys with more attributes, clean errors", () => {
  const view = { href: "agent:teaching/preview?file=1", command: ":preview 1" };
  const report = (outcome, attrs = "") => `#### Prüfbericht – Einheit 1\n\n<section data-key="validation-report"${attrs}>\n\n**Ergebnis:** ${outcome}\n\n**Jetzt mit den Lernenden nutzbar:** ja, mit Einschränkungen: 1 Foto\n\n**Nach der Prüfung geändert:**\n\n- 23.10.2026 · S1 · Satz gekürzt · Kurzprüfung\n\n<details>\n\n__Result:__ PASS\n\n⏳ 1 Foto\n\n</details>\n\n</section>\n\n`;
  const table = notes => `<details><summary>Technik</summary>\n\n| # | Title | Type | Method | Skeleton | Material | Done | Notes |\n|---|---|---|---|---|---|---|---|\n| 1 | E1 | a | b | ✅ | ✅ | ❌ | ${notes} |\n\n</details>\n\n`;
  const unit = statusLabel => [{ id: 1, title: "E1", state: "current", href: "#1.-e1", view, usable: { state: "limited", missing: ["1 Foto"] }, statusLabel, process: { steps: [{ title: "Material", state: "done" }] } }];
  const outcome = "bestanden – es fehlt noch: 1 Foto (23.10.2026) – 1 Punkt seither geändert – kurze Nachprüfung offen";
  // 1: the Notes cell advice uses the course language's words.
  const notes = validate({ title: "Kurs", next, units: unit("x") }, `## Sessions – Einheiten\n\n${table("anders")}### 1. E1\n\nText\n\n${report(outcome)}`);
  assert.match(notes.output, /the Notes cell does not .* write the state with the same words: "\{outcome\} – 1 Punkt seither geändert – kurze Nachprüfung offen"/);
  // 6: "fertig" for a unit that still waits for something (⏳) is a finished word too early.
  const early = validate({ title: "Kurs", next, units: unit("fertig – bestanden – es fehlt noch: 1 Foto") }, `## Sessions – Einheiten\n\n### 1. E1\n\nText\n\n${report("bestanden – es fehlt noch: 1 Foto")}`);
  assert.match(early.output, /statusLabel "fertig – bestanden – es fehlt noch: 1 Foto" says "fertig", but the unit has no passed check without open ⏳ items/);
  // 8: a report section with a further attribute is still the report.
  const extra = validate({ title: "Kurs", next, units: unit("bestanden – es fehlt noch: 1 Foto") }, `## Sessions – Einheiten\n\n### 1. E1\n\nText\n\n${report("bestanden – es fehlt noch: 1 Foto", ' class="report"')}`);
  assert.doesNotMatch(extra.output, /has no line "usable with learners now"|without a passed check/, extra.output);
  // 2: no journal, or --lang without a code: a message, never a stack trace.
  const dir = mkdtempSync(join(tmpdir(), "nojournal-"));
  const none = spawnSync(process.execPath, [validatorScript], { cwd: dir, encoding: "utf8" });
  const lang = spawnSync(process.execPath, [localizeScript, "--lang"], { cwd: dir, encoding: "utf8" });
  rmSync(dir, { recursive: true, force: true });
  assert.notEqual(none.status, 0);
  assert.doesNotMatch(none.stdout + none.stderr, /^\s+at /m, "no stack trace without a journal");
  assert.doesNotMatch(lang.stdout + lang.stderr, /^\s+at /m, "no stack trace for --lang without a code");
});

test("the single-unit macro shows the learners' view with its eye icon, as the overview does", () => {
  const html = dashboard.renderComponent("Unit", "u1", { title: "A", state: "draft", view: { href: "agent:teaching/preview?file=1", command: ":preview 1" } });
  assert.doesNotMatch(html, /▶️/, html);
});

test("fetch-thumb takes only standard Commons widths and never downloads an original larger than the preview", () => {
  for (const width of [120, 250, 330, 500]) assert.equal(thumb.checkWidth(width), width);
  for (const width of [20, 300, 499, 501, 1.5]) assert.throws(() => thumb.checkWidth(width), /standard width/);
  assert.equal(thumb.previewUrl({ thumburl: "https://upload.wikimedia.org/x/330px-a.jpg", url: "https://upload.wikimedia.org/a.jpg", width: 4000 }, 330), "https://upload.wikimedia.org/x/330px-a.jpg");
  assert.equal(thumb.previewUrl({ url: "https://upload.wikimedia.org/small.png", width: 200 }, 330), "https://upload.wikimedia.org/small.png", "a small original is its own preview");
  assert.throws(() => thumb.previewUrl({ url: "https://upload.wikimedia.org/big.jpg", width: 4000 }, 330), /no preview/);
});

test("the Dashboard of a journal needs a title (without one the page shows an empty heading)", () => {
  const without = validate({ next });
  assert.equal(without.status, 2, without.output);
  assert.match(without.output, /Dashboard has no title/);
  assert.match(validate({ title: "  ", next }).output, /Dashboard has no title/);
  assert.doesNotThrow(() => dashboard.buildModel({}), "the library itself stays open for single components");
});

// Write budget (data/chat-dialog.md → Changing another section: at most 5 writes per save; build-session's
// runs line): the write scripts count their writes in .cache/writes.json and warn from the 6th within 10 minutes.
const writeCount = await import("./write-count.mjs");

test("the write scripts count their writes and warn from the 6th within ten minutes", () => {
  const dir = mkdtempSync(join(tmpdir(), "writes-"));
  try {
    const at = minutes => new Date(Date.UTC(2026, 9, 23, 10, minutes));
    for (let i = 0; i < 5; i++) assert.equal(writeCount.countWrite(dir, "localize-journal", "journal.md", at(i)), null, `write ${i + 1} is within the budget`);
    const sixth = writeCount.countWrite(dir, "write-dashboard", "journal.md", at(5));
    assert.match(sixth, /^Warning: 6th write within 10 minutes \(5 × localize-journal, 1 × write-dashboard\) – every write reloads the preview/);
    assert.equal(writeCount.countWrite(dir, "localize-journal", "journal.md", at(30)), null, "older writes no longer count");
    assert.equal(JSON.parse(readFileSync(join(dir, ".cache", "writes.json"), "utf8")).length, 7, "the log keeps two hours, so a long run can count all its writes (SK64)");
    writeFileSync(join(dir, ".cache", "writes.json"), "kaputt");
    assert.equal(writeCount.countWrite(dir, "localize-journal", "journal.md", at(31)), null, "a broken log starts again");
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test("the line replacer warns at the 6th write of a project within ten minutes", () => {
  const dir = mkdtempSync(join(tmpdir(), "writes-run-"));
  try {
    writeFileSync(join(dir, "README.md"), "# Kurs\n\nZeile 0\n");
    let output = "";
    for (let i = 0; i < 6; i++) {
      writeFileSync(join(dir, "map.json"), JSON.stringify({ replace: [[`Zeile ${i}`, `Zeile ${i + 1}`]] }));
      const run = spawnSync(process.execPath, [localizeScript, "map.json", "README.md"], { cwd: dir, encoding: "utf8" });
      assert.equal(run.status, 0, run.stdout + run.stderr);
      output = run.stdout;
      if (i < 5) assert.doesNotMatch(output, /Warning: \d+th write/, `run ${i + 1}`);
    }
    assert.match(output, /Warning: 6th write within 10 minutes \(6 × localize-journal\)/);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

// ## Templates (templates/course-templates.yaml): the selection line before <section>, adopted entries with
// `__Catalog id:__`, and briefs `### {id} (in development)` of templates still being developed.
const templatesSection = readFileSync(new URL("./fixtures/templates-section.md", import.meta.url), "utf8");
const briefDecision = { key: "template-brief-turtle-maze", kind: "decide", title: "Eigene Vorlage: Steckbrief ergänzen", how: "Im Abschnitt Vorlagen die fehlenden Angaben nachtragen", label: "Vorlagen ansehen", href: "#templates-–-vorlagen" };

test("validate-journal reads the template selection line: open, done – none needed or done – ids (a)", () => {
  const selection = value => templatesSection.replace("* __Template selection:__ done – python-turtle, turtle-maze", `* __Template selection:__ ${value}`);
  for (const value of ["open", "done – none needed", "done – python-turtle", "done – python-turtle, turtle-maze"]) {
    const result = validate({ title: "Kurs", next }, selection(value));
    assert.equal(result.status, 0, `${value}: ${result.output}`);
  }
  const missing = validate({ title: "Kurs", next }, templatesSection.replace(/^\* __Template selection:__.*\n\n/m, ""));
  assert.equal(missing.status, 0, `no selection line counts as open: ${missing.output}`);
  for (const value of ["offen", "done", "done – ", "done - python-turtle", "done – Python Turtle", "done – python-turtle,"]) {
    const result = validate({ title: "Kurs", next }, selection(value));
    assert.equal(result.status, 2, `${value}: ${result.output}`);
    assert.match(result.output, /__Template selection:__ .* is none of "open", "done – none needed", "done – \{id\}, \{id\}"/, value);
  }
});

test("every id of a done template selection has an entry with its catalog id or a brief in development (b)", () => {
  const unknown = validate({ title: "Kurs", next }, templatesSection.replace("done – python-turtle, turtle-maze", "done – python-turtle, sql-runner"));
  assert.equal(unknown.status, 2, unknown.output);
  assert.match(unknown.output, /template selection names "sql-runner", but ## Templates has no entry with __Catalog id:__ sql-runner and no brief "### sql-runner \(in development\)"/);
  assert.doesNotMatch(unknown.output, /names "python-turtle"/);
  assert.match(unknown.output, /adopt it with :manage-templates sql-runner or write its brief \(:suggest-templates\); if it was removed, take sql-runner out of the selection line \(no id left: "done – none needed", or "open" while an activity is undecided\)/);
  const inCode = validate({ title: "Kurs", next }, templatesSection.replace("* __Catalog id:__ python-turtle", "* __Catalog id:__ `python-turtle`"));
  assert.equal(inCode.status, 0, inCode.output);
  const translated = validate({ title: "Kurs", next }, templatesSection.replace("## Templates – Vorlagen", "## Templates"));
  assert.equal(translated.status, 0, `the heading is matched by its start: ${translated.output}`);
});

test("a brief with a missing field or an unknown state is a hint, listed under decisions as template-brief (c)", () => {
  const clean = validate({ title: "Kurs", next }, templatesSection);
  assert.doesNotMatch(clean.output, /\[template-brief\]/, clean.output);
  const lacking = templatesSection.replace(/^\* __Acceptance:__\n(?:  \d\..*\n)+/m, "* __Acceptance:__\n").replace(/^\* __Audience:__\n.*\n/m, "");
  const hint = validate({ title: "Kurs", next }, lacking);
  assert.equal(hint.status, 2, hint.output);
  assert.match(hint.output, /- \[template-brief\] brief "turtle-maze \(in development\)" lacks __Audience:__, __Acceptance:__/);
  assert.match(hint.output, /hint "template-brief" is missing in decisions/);
  const listed = validate({ title: "Kurs", next, decisions: [briefDecision] }, lacking);
  assert.equal(listed.status, 0, `a hint, never a problem of its own: ${listed.output}`);
  const state = validate({ title: "Kurs", next }, templatesSection.replace("* __State:__ brief", "* __State:__ fertig"));
  assert.match(state.output, /- \[template-brief\] brief "turtle-maze \(in development\)": __State:__ "fertig" is none of "brief", "in development", "ready to test"/);
});

test("an empty ### heading under ## Templates is read without a crash", () => {
  const result = validate({ title: "Kurs", next }, templatesSection.replace("### Python Turtle", "### "));
  assert.doesNotMatch(result.output, /TypeError|^\s+at /m, result.output);
  assert.equal(result.status, 0, `the entry keeps its __Catalog id:__: ${result.output}`);
});

test("a brief ready to test needs __Folder:__ and lia-templates/{id}/README.md next to the journal (d)", () => {
  const ready = templatesSection.replace("* __State:__ brief", "* __State:__ ready to test");
  const noFolder = validate({ title: "Kurs", next }, ready);
  assert.match(noFolder.output, /- \[template-brief\] brief "turtle-maze \(in development\)" is ready to test, but __Folder:__ is empty/);
  const withFolder = ready.replace("* __Folder:__", "* __Folder:__ lia-templates/turtle-maze/");
  const missing = validate({ title: "Kurs", next }, withFolder);
  assert.match(missing.output, /- \[template-brief\] brief "turtle-maze \(in development\)" is ready to test, but lia-templates\/turtle-maze\/README\.md does not exist/);
  const present = validate({ title: "Kurs", next }, withFolder, { "lia-templates/turtle-maze/README.md": "# Turtle maze\n" });
  assert.doesNotMatch(present.output, /\[template-brief\]/, present.output);
  assert.equal(present.status, 0, present.output);
});

test("the template step says ready to test once every open brief is, and never takes next from a unit at work (e)", () => {
  const ready = templatesSection.replace("* __State:__ brief", "* __State:__ ready to test").replace("* __Folder:__", "* __Folder:__ lia-templates/turtle-maze/");
  const files = { "lia-templates/turtle-maze/README.md": "# Turtle maze\n" };
  const step = result => ({ title: "Kurs", next, process: { steps: [{ title: "Vorlagen für Aktivitäten", state: "current", result }] } });
  const stale = validate(step("1 in Entwicklung"), ready, files);
  assert.match(stale.output, /the template step says "1 in Entwicklung", but every open brief is ready to test \(turtle-maze\) – write "ready to test" \(German "bereit zum Ausprobieren"\)/);
  assert.doesNotMatch(validate(step("1 bereit zum Ausprobieren"), ready, files).output, /every open brief is ready to test/);
  assert.doesNotMatch(validate(step("1 in Entwicklung"), templatesSection).output, /every open brief is ready to test/, "a brief still in work is in development");
  const suggest = { title: "Vorlagen für Aktivitäten", why: "W", label: "Vorlagen vorschlagen", href: "agent:teaching/suggest-templates", command: ":suggest-templates" };
  const unit = state => ({ id: "1", title: "E1", state, statusLabel: "Planungsskizze ✅" });
  const taken = validate({ title: "Kurs", next: suggest, units: [unit("current")] }, templatesSection);
  assert.match(taken.output, /next suggests templates although unit 1 is being worked on – next stays with the unit, :suggest-templates goes into explore/);
  assert.doesNotMatch(validate({ title: "Kurs", next: suggest, units: [unit("planned")] }, templatesSection).output, /next suggests templates although/);
  const planned = validate({ title: "Kurs", next: suggest, units: [unit("planned")] }, agenda(["1"]) + templatesSection);
  assert.match(planned.output, /next suggests templates although the agenda is saved – next stays with the agenda and the units, :suggest-templates goes into explore/);
});

test("a brief takes next from a unit at work only when its __Used in:__ names that unit (f)", () => {
  const develop = { title: "Vorlagen für Aktivitäten", why: "W", label: "Vorlage entwickeln", href: "agent:development/develop-template?id=turtle-maze", command: ":develop-template turtle-maze" };
  const unit = (id, state) => ({ id, title: `E${id}`, state, statusLabel: "Planungsskizze ✅" });
  const other = validate({ title: "Kurs", next: develop, units: [unit("1", "current"), unit("2", "planned")] }, templatesSection);
  assert.match(other.output, /next is the brief "turtle-maze" although unit 1 is being worked on and its __Used in:__ does not name it – next stays with the unit, :develop-template turtle-maze goes into explore \(icon ➕\)/);
  assert.doesNotMatch(validate({ title: "Kurs", next: develop, units: [unit("1", "planned"), unit("2", "current")] }, templatesSection).output, /next is the brief/, "unit 2 uses the template");
  assert.doesNotMatch(validate({ title: "Kurs", next: develop, units: [unit("1", "planned")] }, templatesSection).output, /next is the brief/, "no unit at work");
  const ready = templatesSection.replace("* __State:__ brief", "* __State:__ ready to test").replace("* __Folder:__", "* __Folder:__ lia-templates/turtle-maze/");
  const adopt = { ...develop, href: "agent:teaching/manage-templates?name=turtle-maze", command: ":manage-templates turtle-maze" };
  const taken = validate({ title: "Kurs", next: adopt, units: [{ ...unit("1", "draft"), href: "#1.-e1" }] }, ready, { "lia-templates/turtle-maze/README.md": "# Turtle maze\n" });
  // A draft without its planning sketch (existing material taken over by :analyze-existing) is not at work.
  assert.doesNotMatch(validate({ title: "Kurs", next: adopt, units: [unit("1", "draft")] }, ready, { "lia-templates/turtle-maze/README.md": "# Turtle maze\n" }).output, /next is the brief/);
  assert.match(taken.output, /next is the brief "turtle-maze" although unit 1 is being worked on .* :manage-templates turtle-maze goes into explore/);
});

test("__Used in:__ names units by number, by range (2–4, 2-4) or all of them (alle Einheiten, all units)", () => {
  const develop = { title: "Vorlagen für Aktivitäten", why: "W", label: "Vorlage entwickeln", href: "agent:development/develop-template?id=turtle-maze", command: ":develop-template turtle-maze" };
  const at = (usedIn, id) => validate({ title: "Kurs", next: develop, units: [{ id, title: `E${id}`, state: "current", statusLabel: "Planungsskizze ✅" }] },
    templatesSection.replace("* __Used in:__\n  Einheit 2\n", `* __Used in:__\n  ${usedIn}\n`)).output;
  assert.notEqual(templatesSection.replace("* __Used in:__\n  Einheit 2\n", ""), templatesSection, "the fixture names unit 2 under __Used in:__");
  for (const [usedIn, id] of [["Einheit 2–4", "3"], ["units 2-4", "4"], ["Einheiten 2 – 4", "2"], ["Einheit 1, 3", "3"], ["alle Einheiten", "7"], ["all units", "5"], ["in allen Einheiten", "1"]]) {
    assert.doesNotMatch(at(usedIn, id), /next is the brief/, `${usedIn} names unit ${id}`);
  }
  for (const [usedIn, id] of [["Einheit 2–4", "5"], ["units 2-4", "1"], ["Einheit 12", "1"], ["Einheit 1, 3", "2"]]) {
    assert.match(at(usedIn, id), /next is the brief "turtle-maze" although unit \d+ is being worked on/, `${usedIn} does not name unit ${id}`);
  }
});

test("the empty journal has the template step after the didactics and the selection line open, without a finding", () => {
  const template = readFileSync(new URL("../templates/journal.md", import.meta.url), "utf8");
  const steps = JSON.parse(template.match(/```json @Dashboard\.View\n([\s\S]*?)\n```/)[1]).process.steps;
  const at = steps.findIndex(step => step.title === "Didactics");
  assert.equal(steps[at + 1]?.state, "planned", "the step after the didactics is planned");
  assert.doesNotMatch(`${steps[at + 1]?.title} ${steps[at + 1]?.why}`, /\{\{/);
  assert.match(template, /^\* __Template selection:__ open\n\n<section>\n\n### Dashboard$/m, "the selection line is the last line before <section>");
  const dir = mkdtempSync(join(tmpdir(), "empty-templates-"));
  try {
    writeFileSync(join(dir, "journal.md"), template);
    const run = spawnSync(process.execPath, [validatorScript, join(dir, "journal.md")], { encoding: "utf8" });
    assert.equal(run.status, 0, run.stdout + run.stderr);
    assert.doesNotMatch(run.stdout + run.stderr, /Hints:|Warnings:/);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

// ── derive-dashboard.mjs: the fields that follow from the journal are computed, not written by hand ──
import { readJournal, usableState as reportUsable, englishUnitSteps } from "./journal-model.mjs";
import { derive, unitState, missingText, patchJournal } from "./derive-dashboard.mjs";
import { stepsOf, laterOf, isLater, laterMarker, sectionSlug } from "./tracks.mjs";

// A journal with an agenda of three units: unit 1 checked (FAIL, one point changed since, images 1 of 2),
// unit 2 with a planning sketch only, unit 3 only in the agenda.
const deriveJournal = (dashboard, { report = "", decisions = "" } = {}) => `<!--
language: en
-->

# Fractions

## Dashboard – Overview

\`\`\`json @Dashboard.View
${JSON.stringify(dashboard, null, 2)}
\`\`\`

## Course Context – Frame

* __Terminology:__
  1. sessions-called: Lesson

## Outline – Goals

Text

## Didactics – Methods

Text

## Agenda – Schedule

<!-- data-type="none" -->
| No. | Lesson | Time |
|---|---|---|
| 1 | Halves and quarters (required) | 45 min |
| 2 | Comparing fractions (required) | 45 min |
| 3 | Fractions in recipes | 45 min |

## Sessions – Lessons

1. Halves and quarters – check: correction needed (2) – 1 point changed since – short re-check open – images 1 of 2
2. Comparing fractions – planning sketch ✅ · material open

<details><summary>Technical overview</summary>

<!-- data-type="none" -->
| # | Title | Type | Method | Skeleton | Material | Done | Notes |
|---|-------|------|--------|----------|----------|------|-------|
| 1 | Halves and quarters | explore | none | ✅ | ✅ | ❌ | check |
| 2 | Comparing fractions | explore | none | ✅ | ❌ | ❌ | sketch |

</details>

### 1. Halves and quarters

<!-- data-key="decisions" -->
**Decisions:**

${decisions}

${report}

#### Images

<section>

#### pizza

* __Status:__ inserted
* __Source:__ own

</section>

<section>

#### cake

* __Status:__ wanted
* __Source:__ free-photo

</section>

### 2. Comparing fractions

**Summary:** Text

## Notes Backup – Notes

Text
`;
const failReport = `#### Validation report – Lesson 1

<section data-key="validation-report">

**Outcome:** correction needed (2) (2026-11-01) – 1 point changed since – short re-check open

**Usable with learners now:** not yet: the self-check cannot be solved yet.

**Still missing:**

- ⏳ 1 picture on „Cut the cake – 2“ (the cake): nothing found – at the step "Insert images".

<details><summary>Technical report</summary>

__Result:__ FAIL
__Mode:__ session

</details>

</section>`;
const steps = [
  { title: "Plan the lesson", state: "done", why: "W1", result: "Sketch" },
  { title: "Work out the material together", state: "done", why: "W2" },
  { title: "Insert images", state: "optional", why: "W3" },
  { title: "Check and revise", state: "planned", why: "W4" }
];
const deriveData = () => ({
  title: "Fractions", subtitle: "My own words", footer: "As of 2026-11-01",
  links: [{ label: "Course Context", href: "#course-context" }, { label: "Sessions", href: "#sessions-–-units" }, { label: "Website", href: "https://example.org" }],
  units: [
    { id: 1, title: "Halves", state: "draft", summary: "Kept as written", process: { title: "Halves", steps: structuredClone(steps) } },
    { id: 2, title: "Comparing fractions", state: "planned" },
    { id: 9, title: "Removed lesson", state: "planned" }
  ]
});

test("unit state follows the journal: sketch, draft, approval, check result, changes after the check, Done", () => {
  const unit = (facts = {}) => ({ n: "1", heading: { title: "T" }, material: true, done: false, approved: false, report: null, ...facts });
  const report = (facts = {}) => ({ result: "PASS", changedSince: 0, deferred: false, ...facts });
  const cases = [
    [{ heading: null, material: false }, "planned"],
    [{ material: false }, "planned"],
    [{ material: false }, "current", { selected: "1" }],
    [{}, "draft"],
    [{ approved: true }, "review"],
    [{ report: report({ result: "FAIL" }) }, "revision"],
    [{ report: report({ result: "FAIL", changedSince: 2 }) }, "review"],
    [{ report: report({ result: "PASS with concerns" }) }, "current"],
    [{ report: report({ deferred: true }), done: true, approved: true }, "current"],
    [{ report: report(), done: true, approved: false }, "current"],
    [{ report: report(), done: false, approved: true }, "current"],
    [{ report: report(), done: true, approved: true }, "done"]
  ];
  for (const [facts, expected, options] of cases) assert.equal(unitState(unit(facts), options).state, expected, JSON.stringify(facts));
});

test("the agenda title column is found by its header; a bold title is cut from its objective", () => {
  const agenda = "## Agenda\n\n<!-- data-type=\"none\" -->\n| Hour | Kind | Topic and objective |\n|---|---|---|\n| 1 | Lesson | **Halves.** Cut a pizza fairly |\n\n## Sessions\n";
  assert.deepEqual(readJournal(`# C\n\n${agenda}`).units.map(unit => unit.agendaTitle), ["Halves"]);
});

test("the journal model reads units, a report in the course language, image entries and the missing items", () => {
  const journal = readJournal(deriveJournal({}, { report: failReport }));
  assert.deepEqual(journal.units.map(unit => [unit.n, unit.title, unit.agendaTitle]), [["1", "Halves and quarters", "Halves and quarters"], ["2", "Comparing fractions", "Comparing fractions"], ["3", null, "Fractions in recipes"]]);
  const [first, second, third] = journal.units;
  assert.equal(first.report.result, "FAIL");
  assert.equal(first.report.changedSince, 1);
  assert.equal(first.report.anchor, "#validation-report-–-lesson-1");
  assert.deepEqual(first.report.missing, ["1 picture on „Cut the cake – 2“"], "parentheses dropped, cut at the colon, the dash inside quotes kept");
  assert.equal(reportUsable(first.report.usableText), "no");
  assert.deepEqual(first.images, { total: 2, placed: 1, open: 1, waiting: 0 });
  assert.equal(first.status, "check: correction needed (2) – 1 point changed since – short re-check open – images 1 of 2");
  assert.equal(second.heading.anchor, "#2.-comparing-fractions");
  assert.equal(second.material, false);
  assert.equal(third.heading, null);
  assert.equal(journal.terminology, "Lesson");
});

test("derive sets the mechanical fields and leaves every text of the agent as it is", () => {
  const journal = readJournal(deriveJournal(deriveData(), { report: failReport }));
  const { data, changes } = derive(journal, deriveData(), { date: "2026-11-04" });
  const [one, two, three] = data.units;
  assert.deepEqual(data.units.map(unit => unit.id), [1, 2, 3], "unit 9 is neither in the agenda nor in ## Sessions");
  assert.equal(one.title, "Halves and quarters");
  assert.equal(one.state, "review", "FAIL with a change after the check waits for the short re-check");
  assert.equal(one.href, "#1.-halves-and-quarters");
  assert.deepEqual(one.view, { href: "agent:teaching/preview?file=1", command: ":preview 1" });
  assert.deepEqual(one.usable, { state: "no", missing: ["1 picture on „Cut the cake – 2“"] });
  assert.equal(one.statusLabel, "check: correction needed (2) – 1 point changed since – short re-check open – images 1 of 2");
  assert.equal(one.process.steps[2].state, "current", "an open image entry makes the image step current once the material exists");
  assert.equal(one.summary, "Kept as written");
  assert.equal(one.process.steps[0].result, "Sketch");
  assert.equal(data.subtitle, "My own words");
  assert.equal(two.state, "planned");
  assert.equal(two.href, "#2.-comparing-fractions");
  assert.equal(two.view, undefined);
  assert.deepEqual(two.process.steps.map(step => step.state), ["done", "planned", "optional", "planned"], "a unit without steps gets the same steps; its saved planning sketch makes the first one done");
  assert.deepEqual(three.process.steps.map(step => step.state), ["planned", "planned", "optional", "planned"], "a unit without a sketch has not started");
  assert.equal(three.title, "Fractions in recipes", "a new unit takes its title from the agenda");
  const titled = deriveData();
  titled.units.push({ id: 3, title: "Recipes with fractions", state: "planned" });
  assert.equal(derive(journal, titled).data.units[2].title, "Recipes with fractions", "the agenda row does not overwrite a title the overview already has");
  assert.equal(three.href, undefined);
  assert.deepEqual(data.links, [{ label: "Frame", href: "#course-context-–-frame" }, { label: "Lessons", href: "#sessions-–-lessons" }, { label: "Website", href: "https://example.org" }],
    "listed section links follow their translated heading; no section is added, other links stay");
  assert.deepEqual(data.unitLabel, { one: "Lesson", many: "Lessons" });
  assert.equal(data.footer, "As of 2026-11-04");
  assert.ok(changes.every(change => change.why), "every change names its reason");
  dashboard.buildModel(data);
  assert.deepEqual(derive(journal, data, { date: "2026-11-05" }).changes, [], "a second run changes nothing, not even the date");
});

test("derive keeps the agent's inflected unitLabel.many while it belongs to the ## Sessions suffix", () => {
  const journal = readJournal(deriveJournal(deriveData(), { report: failReport }));
  const inflected = deriveData();
  inflected.unitLabel = { one: "Lesson", many: "Lessonsx" };
  assert.deepEqual(derive(journal, inflected).data.unitLabel, { one: "Lesson", many: "Lessonsx" }, "a form after a preposition (German 'von 4 Modulen') stays");
  const renamed = deriveData();
  renamed.unitLabel = { one: "Module", many: "Modules" };
  assert.deepEqual(derive(journal, renamed).data.unitLabel, { one: "Lesson", many: "Lessons" }, "a renamed unit word follows the suffix");
});

test("derive: without image entries the image step keeps its state, all placed make it done; Done needs the approval", () => {
  const journal = readJournal(deriveJournal({}, { report: failReport }));
  journal.units[0].images = { total: 0, placed: 0, open: 0 };
  assert.equal(derive(journal, deriveData()).data.units[0].process.steps[2].state, "optional");
  const marked = deriveData();
  marked.units[0].process.steps[2].state = "current";
  assert.equal(derive(journal, marked).data.units[0].process.steps[2].state, "current", "older journals track images as markers only");
  journal.units[0].images = { total: 2, placed: 2, open: 0 };
  assert.equal(derive(journal, deriveData()).data.units[0].process.steps[2].state, "done");
  const passed = failReport.replace("__Result:__ FAIL", "__Result:__ PASS").replace(" – 1 point changed since – short re-check open", "").replace(/\n- ⏳.*\n/, "\n");
  const done = text => text.replace("| ✅ | ✅ | ❌ | check |", "| ✅ | ✅ | ✅ | checked |");
  assert.equal(derive(readJournal(done(deriveJournal({}, { report: passed }))), deriveData()).data.units[0].state, "current", "without a recorded approval");
  assert.equal(derive(readJournal(done(deriveJournal({}, { report: passed, decisions: "- **2026-11-02:** material approved" }))), deriveData()).data.units[0].state, "done");
});

test("write-dashboard derives before writing and says what it set; --no-derive writes the draft as it is", () => {
  const dir = mkdtempSync(join(tmpdir(), "derive-write-"));
  try {
    const journalFile = join(dir, "journal.md");
    const draft = join(dir, "draft.json");
    const writer = fileURLToPath(new URL("./write-dashboard.mjs", import.meta.url));
    writeFileSync(journalFile, deriveJournal(deriveData(), { report: failReport }));
    writeFileSync(draft, JSON.stringify(deriveData()));
    const run = spawnSync(process.execPath, [writer, draft, journalFile], { encoding: "utf8", cwd: dir });
    assert.match(run.stdout, /Derived from the journal \(\d+ fields set/);
    assert.match(run.stdout, /units\[1\]\.view: – → /);
    const written = JSON.parse(readFileSync(journalFile, "utf8").match(/```json @Dashboard\.View\n([\s\S]*?)\n```/)[1]);
    assert.equal(written.units[0].state, "review");
    const checker = fileURLToPath(new URL("./derive-dashboard.mjs", import.meta.url));
    assert.equal(spawnSync(process.execPath, [checker, "--check", journalFile], { encoding: "utf8", cwd: dir }).status, 0, "the written block matches the journal");
    writeFileSync(draft, JSON.stringify(deriveData()));
    spawnSync(process.execPath, [writer, draft, journalFile, "--no-derive"], { encoding: "utf8", cwd: dir });
    const raw = JSON.parse(readFileSync(journalFile, "utf8").match(/```json @Dashboard\.View\n([\s\S]*?)\n```/)[1]);
    assert.equal(raw.units[0].state, "draft");
    const check = spawnSync(process.execPath, [checker, "--check", journalFile], { encoding: "utf8", cwd: dir });
    assert.equal(check.status, 1);
    assert.match(check.stdout, /units\[1\]\.state: "draft" → "review"/);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

// ── One wording per state: status line, Notes cell and statusLabel come from one function ──
import { statusText, patchSessions, englishTerms } from "./journal-model.mjs";

test("the status wording follows sketch, material, images and – once checked – the report's outcome line", () => {
  const unit = (facts = {}) => ({ n: "1", heading: { title: "T" }, material: true, done: false, report: null, images: { total: 0, placed: 0, open: 0 }, ...facts });
  const report = (facts = {}) => ({ result: "PASS", outcome: "passed (2026-11-01)", changedSince: 0, ...facts });
  const t = englishTerms;
  assert.equal(statusText(unit({ heading: null, material: false }), t), null);
  assert.equal(statusText(unit({ material: false }), t), "planning sketch ✅ · material open");
  assert.equal(statusText(unit(), t), "material written · check open");
  assert.equal(statusText(unit({ images: { total: 3, placed: 0, open: 3 } }), t), "material written · images missing");
  assert.equal(statusText(unit({ images: { total: 3, placed: 1, open: 2 } }), t), "material written · images 1 of 3");
  assert.equal(statusText(unit({ report: report({ result: "FAIL", outcome: "correction needed (2) (2026-11-01)" }) }), t), "check: correction needed (2)", "the date goes, \"check:\" comes before a FAIL");
  assert.equal(statusText(unit({ report: report({ result: "FAIL", outcome: "check: correction needed (2) (01.11.2026)" }) }), t), "check: correction needed (2)", "never twice");
  assert.equal(statusText(unit({ report: report({ outcome: "passed – still missing: 1 photo (2026-11-01)" }), images: { total: 2, placed: 1, open: 1 } }), t), "passed – still missing: 1 photo – images 1 of 2");
  assert.equal(statusText(unit({ done: true, report: report() }), t), "checked ✅");
  assert.equal(statusText(unit({ done: true, report: report({ outcome: "passed (2026-11-01) – 1 point changed since – short re-check open", changedSince: 1 }) }), t), "passed – 1 point changed since – short re-check open");
  const de = JSON.parse(readFileSync(new URL("../templates/i18n/de.json", import.meta.url), "utf8")).terms;
  assert.equal(statusText(unit({ material: false }), { ...englishTerms, ...de }), "Planungsskizze ✅ · Material offen");
  assert.equal(statusText(unit({ report: report({ result: "FAIL", outcome: "Korrektur nötig (3) (23.10.2026)" }) }), { ...englishTerms, ...de }), "Prüfung: Korrektur nötig (3)");
});

test("patchSessions rewrites status lines and Notes cells only, never a numbered line in a comment or a subsection", () => {
  const source = `## Sessions – Lessons

<!--- template:
1. {{activity}}
--->

1. Halves – revised – check open
2. Comparing – planning sketch ✅ · material open

<details><summary>Technical overview</summary>

| # | Title | Type | Method | Skeleton | Material | Done | Notes |
|---|-------|------|--------|----------|----------|------|-------|
| 1 | Halves | explore | none | ✅ | ✅ | ❌ | revised; check open |
| 2 | Comparing | explore | none | ✅ | ❌ | ❌ | planning sketch ✅ · material open |

</details>

### 1. Halves

1. An activity

## Notes Backup
`;
  const { source: patched, changes } = patchSessions(source, [{ n: "1", title: "Halves", status: "check: correction needed (2)" }, { n: "2", title: "Comparing", status: "planning sketch ✅ · material open" }]);
  assert.match(patched, /^1\. Halves – check: correction needed \(2\)$/m);
  assert.match(patched, /^\| 1 \| Halves \| explore \| none \| ✅ \| ✅ \| ❌ \| check: correction needed \(2\) \|$/m);
  assert.match(patched, /^1\. \{\{activity\}\}$/m, "the comment stays");
  assert.match(patched, /^1\. An activity$/m, "the subsection stays");
  assert.equal(changes.length, 2, "unit 2 is already right");
});

test("write-dashboard writes the status lines and Notes cells in the same write as the block", () => {
  const dir = mkdtempSync(join(tmpdir(), "derive-status-"));
  try {
    const journalFile = join(dir, "journal.md");
    const draft = join(dir, "draft.json");
    writeFileSync(journalFile, deriveJournal(deriveData(), { report: failReport }).replace("1. Halves and quarters – check: correction needed (2) – 1 point changed since – short re-check open – images 1 of 2", "1. Halves and quarters – revised – check open"));
    writeFileSync(draft, JSON.stringify(deriveData()));
    const run = spawnSync(process.execPath, [fileURLToPath(new URL("./write-dashboard.mjs", import.meta.url)), draft, journalFile], { encoding: "utf8", cwd: dir });
    assert.match(run.stdout, /## Sessions status line 1: /);
    const text = readFileSync(journalFile, "utf8");
    assert.match(text, /^1\. Halves and quarters – check: correction needed \(2\) – 1 point changed since – short re-check open – images 1 of 2$/m);
    assert.match(text, /\| ✅ \| ✅ \| ❌ \| check: correction needed \(2\) – 1 point changed since – short re-check open – images 1 of 2 \|/);
    const check = spawnSync(process.execPath, [fileURLToPath(new URL("./derive-dashboard.mjs", import.meta.url)), "--check", journalFile], { encoding: "utf8", cwd: dir });
    assert.equal(check.status, 0, check.stdout);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

// ── Next action and action lines: the command follows the journal, the words stay the agent's while it is right ──
import { courseNext, unitAction, patchUnitActions, accepts, courseStepOf, nextTitle } from "./actions.mjs";

const facts = (n, more = {}) => ({ n: String(n), heading: null, material: false, done: false, approved: false, report: null, images: { total: 0, placed: 0, open: 0 }, ...more });
const course = (more = {}) => ({
  language: "en", filled: { "Course Context": true, Outline: true, Didactics: true, Agenda: true }, agendaRequired: "yes", hasAgenda: true,
  templates: { selection: "done – none needed", adopted: [], briefs: [] }, validation: { mode: null, result: null }, published: false,
  units: [facts(1), facts(2)], ...more
});
const nextOf = (journal, selected) => courseNext(journal, new Map(journal.units.map(unit => [unit.n, unitState(unit).state])), selected)?.href ?? null;

test("the course's next action follows the order of the course process", () => {
  assert.equal(nextOf(course({ filled: { "Course Context": false } })), "agent:teaching/init-course");
  assert.equal(nextOf(course({ filled: { "Course Context": true, Outline: false } })), "agent:teaching/create-outline");
  assert.equal(nextOf(course({ filled: { "Course Context": true, Outline: true, Didactics: false } })), "agent:teaching/create-didactics");
  assert.equal(nextOf(course({ hasAgenda: false, units: [], templates: { selection: "open", adopted: [], briefs: [] } })), "agent:teaching/suggest-templates");
  assert.equal(nextOf(course({ hasAgenda: false, units: [] })), "agent:teaching/create-agenda", "templates decided: the required agenda");
  assert.equal(nextOf(course()), "agent:teaching/create-session?number=1");
  assert.equal(nextOf(course(), "2"), "agent:teaching/create-session?number=2", "the recommended unit, also before its sketch");
  assert.equal(nextOf(course({ units: [facts(1, { heading: { title: "A" } }), facts(2)] })), "agent:teaching/coauthor-materials?number=1");
  const brief = state => ({ selection: "open", adopted: [], briefs: [{ id: "maze", state, usedIn: "unit 2" }] });
  assert.equal(nextOf(course({ templates: brief("brief") })), "agent:development/develop-template?id=maze");
  assert.equal(nextOf(course({ templates: brief("ready to test") })), "agent:teaching/manage-templates?name=maze");
  assert.equal(nextOf(course({ templates: brief("brief"), units: [facts(1, { heading: { title: "A" } }), facts(2)] })), "agent:teaching/coauthor-materials?number=1", "a brief for unit 2 waits while unit 1 is worked on");
  const doneUnit = n => facts(n, { heading: { title: "A" }, material: true, done: true, approved: true, report: { result: "PASS", changedSince: 0, deferred: false } });
  assert.equal(nextOf(course({ units: [doneUnit(1), doneUnit(2)] })), "agent:teaching/validate-course");
  assert.equal(nextOf(course({ units: [doneUnit(1), doneUnit(2)], validation: { mode: "course", result: "PASS" } })), "agent:development/create-project");
  const withApproved = course({ units: [doneUnit(1), facts(2)] });
  assert.ok(accepts(courseNext(withApproved, new Map([["1", "done"], ["2", "planned"]])), "agent:teaching/build-session?number=2"), "after an approved unit, letting it be prepared is right too");
});

test("existing material without a planning sketch (improve-existing) is planned first and does not hold the course steps back", () => {
  const existing = n => facts(n, { material: true });
  const takenOver = more => course({ hasAgenda: false, agendaRequired: "no", units: [existing(1), existing(2)], ...more });
  assert.equal(unitAction(existing(1)).href, "agent:teaching/create-session?number=1", "no check without the ### subsection its report goes into");
  assert.equal(nextOf(takenOver({ templates: { selection: "open", adopted: [], briefs: [] } })), "agent:teaching/suggest-templates");
  assert.equal(nextOf(takenOver()), "agent:teaching/create-session?number=1");
  assert.equal(nextOf(takenOver({ units: [existing(1), facts(2, { heading: { title: "B" }, material: true })] })), "agent:teaching/validate-course?number=2", "a unit with its sketch is the one worked on");
});

test("a unit's main action follows its state; a judgement call stays with the agent", () => {
  const begun = more => facts(1, { heading: { title: "A" }, material: true, ...more });
  const report = more => ({ result: "PASS", changedSince: 0, deferred: false, ...more });
  const href = unit => unitAction(unit)?.href ?? null;
  assert.equal(href(facts(1, { heading: { title: "A" } })), "agent:teaching/coauthor-materials?number=1");
  assert.equal(href(begun()), "agent:teaching/validate-course?number=1");
  assert.equal(href(begun({ images: { total: 2, placed: 0, open: 2 } })), "agent:artist/create-image?number=1", "images before the check");
  assert.equal(href(begun({ report: report({ result: "FAIL" }) })), "agent:teaching/coauthor-materials?number=1");
  assert.ok(accepts(unitAction(begun({ report: report({ result: "FAIL" }) })), "agent:teaching/quick-fix?number=1&description=Fix%20the%20hint"), "a small correction with its description is right too");
  assert.equal(href(begun({ report: report({ result: "FAIL", changedSince: 1 }) })), "agent:teaching/validate-course?number=1", "short re-check");
  assert.equal(href(begun({ report: report({ result: "PASS with concerns" }) })), "agent:teaching/validate-course?number=1");
  assert.equal(href(begun({ report: report({ deferred: true }) })), null, "what produces a missing item other than images is the agent's call");
  assert.equal(href(begun({ report: report(), done: true })), "agent:teaching/preview?file=1", "passed: look at it and approve");
  assert.equal(unitAction(begun({ report: report(), done: true, approved: true })).key, "view-unit");
  // SK41: an own photo the instructor still has to supply does not hold the check back; after the check it is left.
  const ownPhoto = { total: 10, placed: 9, open: 1, waiting: 1 };
  assert.equal(href(begun({ images: ownPhoto })), "agent:teaching/validate-course?number=1", "only an own photo open: check first");
  assert.equal(href(begun({ images: { total: 10, placed: 8, open: 2, waiting: 1 } })), "agent:artist/create-image?number=1", "a photo to search still comes first");
  assert.equal(unitAction(begun({ images: ownPhoto, report: report({ deferred: true }) })).key, "approve-waiting", "passed with the photo deferred: approving does not wait for it (SK55)");
  assert.equal(href(begun({ images: ownPhoto, report: report({ deferred: true }), approved: true })), "agent:artist/create-image?number=1", "approved: the photo is what is left");
  // SK47: concerns that all wait for the instructor's look keep the command, the button says so.
  assert.equal(unitAction(begun({ report: report({ result: "PASS with concerns" }) })).key, "resolve-concerns");
  const waits = unitAction(begun({ report: report({ result: "PASS with concerns", concernsWaiting: true }) }));
  assert.equal(waits.key, "concerns-waiting");
  assert.equal(waits.href, "agent:teaching/validate-course?number=1");
});

test("readJournal: a report's ⏸ items wait for the instructor; all open concerns waiting is concernsWaiting (SK47)", () => {
  const concerns = (waiting, open) => failReport.replace("__Result:__ FAIL", "__Result:__ PASS with concerns")
    .replace("**Still missing:**", `**Still open:**\n\n${"- ⏸ Question 4 – decide after looking at it on the tablet.\n".repeat(waiting)}`)
    .replace("__Mode:__ session", `__Mode:__ session\n\n${"- ❌ [pedagogical] images too high\n".repeat(open)}`);
  assert.equal(readJournal(deriveJournal({}, { report: concerns(1, 1) })).units[0].report.concernsWaiting, true);
  assert.equal(readJournal(deriveJournal({}, { report: concerns(1, 2) })).units[0].report.concernsWaiting, false, "another concern is still to decide");
  assert.equal(readJournal(deriveJournal({}, { report: concerns(0, 1) })).units[0].report.concernsWaiting, false);
});

test("readJournal counts an own photo still wanted as waiting; the image step waits for it (SK41)", () => {
  const entry = (slug, status, source) => `<section>\n\n#### ${slug}\n\n* __Status:__ ${status}\n* __Source:__ ${source}\n\n</section>\n\n`;
  const source = deriveJournal({}, { report: failReport }).replace(/#### Images\n[\s\S]*?(?=\n### 2\.)/, `#### Images\n\n${entry("a", "inserted", "free-photo")}${entry("b", "wanted", "own")}`);
  const journal = readJournal(source);
  assert.deepEqual(journal.units[0].images, { total: 2, placed: 1, open: 1, waiting: 1 });
  const step = derive(journal, deriveData()).data.units[0].process.steps.find(item => item.title === "Insert images");
  assert.notEqual(step.state, "current", "the step does not claim to be worked on while the photo is the instructor's");
});

test("next keeps the agent's title and why while its command is right, the button word comes from the pack; else the pack's words; without a pack nothing is invented", () => {
  const journal = readJournal(deriveJournal({}, { report: failReport }));
  const right = { ...deriveData(), next: { title: "My title", why: "My why", label: "My label", href: "agent:artist/create-image?number=1&focus=cake", command: "x" } };
  right.process = { steps: [{ title: "Context", state: "done", next: "Next: „My label“." }] };
  const kept = derive(journal, right).data;
  assert.equal(kept.next.label, "Insert images for Lesson 1", "the pack's button word …");
  assert.equal(kept.next.title, "My title", "… the agent's title and why stay; extra parameters are fine");
  assert.equal(kept.next.why, "My why");
  assert.equal(kept.process.steps[0].next, "Next: „Insert images for Lesson 1“.", "a step text quoting the old word follows");
  const wrong = { ...deriveData(), next: { title: "T", why: "W", label: "Plan unit 2", href: "agent:teaching/create-session?number=2", command: ":create-session 2" } };
  const { data } = derive(journal, wrong);
  assert.equal(data.next.href, "agent:artist/create-image?number=1");
  assert.equal(data.next.command, ":agent artist → :create-image 1");
  assert.equal(data.next.label, "Insert images for Lesson 1");
  assert.equal(data.next.title, "Insert images – Lesson 1", "the unit's step plus the unit");
  assert.equal(data.selected, "1");
  const french = readJournal(deriveJournal({}, { report: failReport }).replace("language: en", "language: fr"));
  const result = derive(french, wrong);
  assert.equal(result.data.next.label, "Plan unit 2", "no French words: the old next stays …");
  assert.equal(derive(french, { ...deriveData(), next: { title: "T", why: "W", label: "Mes mots", href: "agent:artist/create-image?number=1", command: "x" } }).data.next.label, "Mes mots", "a right command without pack words keeps the agent's label");
  assert.equal(result.missing[0].where, "next", "… and the agent is asked for them");
});

test("action lines: one main action of the unit, the learners' view next to it; a right link keeps its command and takes the pack's word", () => {
  const journal = readJournal(deriveJournal({}, { report: failReport }));
  const words = (expected, unit) => ({ label: `L${unit.n}` });
  const source = deriveJournal({}, { report: failReport }).replace("### 1. Halves and quarters\n", "### 1. Halves and quarters\n\n<!-- class=\"journal-actions\" -->\n[🎨 My words](agent:artist/create-image?number=1) `:agent artist` → `:create-image 1` · [▶️ Plan unit 2](agent:teaching/create-session?number=2) `:create-session 2`\n");
  const { source: patched, changes } = patchUnitActions(source, journal, words);
  assert.match(patched, /^\[🎨 L1\]\(agent:artist\/create-image\?number=1\) `:agent artist` → `:create-image 1` · \[👁 How learners see it\]\(agent:teaching\/preview\?file=1\) `:preview 1`$/m,
    "the right main action keeps its command with the pack's word, another unit's action goes, the learners' view comes");
  assert.match(patchUnitActions(source, journal, () => null).source, /^\[🎨 My words\]\(agent:artist\/create-image\?number=1\)/m, "without pack words the agent's words stay");
  assert.match(patched, /### 2\. Comparing fractions\n\n<!-- class="journal-actions" -->\n\[▶️ L2\]\(agent:teaching\/coauthor-materials\?number=2\) `:coauthor-materials 2`\n/, "a missing line is inserted below the heading");
  assert.equal(changes.length, 2);
  assert.equal(patchUnitActions(patched, readJournal(patched), words).changes.length, 0, "a second run changes nothing");
});

test("write-dashboard writes nothing while words are missing and names them", () => {
  const dir = mkdtempSync(join(tmpdir(), "derive-words-"));
  try {
    const journalFile = join(dir, "journal.md");
    const draft = join(dir, "draft.json");
    const text = deriveJournal(deriveData(), { report: failReport }).replace("language: en", "language: fr");
    writeFileSync(journalFile, text);
    writeFileSync(draft, JSON.stringify({ ...deriveData(), next: { title: "T", why: "W", label: "L", href: "agent:teaching/create-outline", command: ":create-outline" } }));
    const run = spawnSync(process.execPath, [fileURLToPath(new URL("./write-dashboard.mjs", import.meta.url)), draft, journalFile], { encoding: "utf8", cwd: dir });
    assert.equal(run.status, 1);
    assert.match(run.stderr, /Words still to write/);
    assert.match(run.stderr, /next: the next action is agent:artist\/create-image\?number=1/);
    assert.equal(readFileSync(journalFile, "utf8"), text, "journal unchanged");
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

// ── Action lines of the sections, the one-line note under ## Sessions and the cards under "More options" ──
import { patchSectionActions, patchSessionsNote, exploreCards, action as makeAction } from "./actions.mjs";
import { wordsOf, awaitsOwnMedia, englishActions } from "./actions.mjs";

test("section action lines: ▶️ create while empty, ✏️ revise once saved; right links take the pack's words, older icons are renewed", () => {
  const source = deriveJournal({}, { report: failReport })
    .replace("## Outline – Goals\n", "## Outline – Goals\n\n<!-- class=\"journal-actions\" -->\n[↻ Revise my goals](agent:teaching/create-outline) `:create-outline`\n")
    .replace("## Didactics – Methods\n", "## Didactics – Methods\n\n<!-- class=\"journal-actions\" -->\n[▶️ Create didactics](agent:teaching/create-didactics) `:create-didactics` · [▶️ Templates](agent:teaching/suggest-templates) `:suggest-templates`\n")
    .replace("## Sessions – Lessons\n", "## Sessions – Lessons\n\n<!-- class=\"journal-actions\" -->\n[▶ Create Lesson](agent:teaching/create-session) `:create-session <number?>`\n");
  const journal = readJournal(source);
  const words = expected => wordsOf(expected, journal, { unit: "Lesson", units: "Lessons" });
  const { source: patched } = patchSectionActions(source, journal, words);
  assert.match(patched, /^\[✏️ Revise outline\]\(agent:teaching\/create-outline\) `:create-outline`$/m, "the pack's word, the current icon");
  assert.match(patched, /^\[✏️ Revise didactics\]\(agent:teaching\/create-didactics\) `:create-didactics` · \[🎨 Visual identity\]\(agent:artist\/create-visuals\) `:agent artist` → `:create-visuals`$/m,
    "a saved section is revised, not created; a link the table does not allow there goes");
  assert.match(patched, /^\[▶️ Create Lesson\]\(agent:teaching\/create-session\) `:create-session <number\?>` · \[🔍 Check Lessons\]\(agent:teaching\/validate-course\) `:validate-course`$/m,
    "the hint in the command stays; checking comes once a unit has material");
  assert.equal(patchSectionActions(patched, readJournal(patched), words).changes.length, 0, "a second run changes nothing");
  const empty = readFileSync(new URL("../templates/journal.md", import.meta.url), "utf8");
  assert.equal(patchSectionActions(empty, readJournal(empty), expected => wordsOf(expected, readJournal(empty), {})).changes.length, 0, "the empty journal is already right");
});

test("an approved unit that only waits for an own photo: approval shown, check step done, the next unit comes, the photo stays a card (SK52, SK55)", () => {
  const entry = (slug, status, source) => `<section>\n\n#### ${slug}\n\n* __Status:__ ${status}\n* __Source:__ ${source}\n\n</section>\n\n`;
  const passed = failReport.replace("__Result:__ FAIL", "__Result:__ PASS").replace(" – 1 point changed since – short re-check open", "")
    .replace("not yet: the self-check cannot be solved yet.", "yes, with limits: 1 photo (headphones)");
  const source = (decisions, photo = entry("b", "wanted", "own")) => deriveJournal({}, { report: passed, decisions }).replace(/#### Images\n[\s\S]*?(?=\n### 2\.)/, `#### Images\n\n${entry("a", "inserted", "free-photo")}${photo}`)
    .replace("2. Comparing fractions – planning sketch ✅ · material open\n", "").replace(/\| 2 \| Comparing fractions .*\n/, "").replace(/### 2\. Comparing fractions\n\n\*\*Summary:\*\* Text\n/, "");
  const approved = readJournal(source("- **2026-11-07:** material approved"));
  assert.equal(awaitsOwnMedia(approved.units[0]), true);
  const { data } = derive(approved, deriveData());
  assert.equal(data.units[0].approved, true, "the card knows the approval");
  assert.equal(data.units[0].process.steps.find(step => step.title === "Check and revise").state, "done", "passed and approved: the check step is done");
  assert.equal(data.units[0].process.steps.find(step => step.title === "Insert images").state, "planned", "the photo waits for the instructor");
  assert.equal(data.next.href, "agent:teaching/create-session?number=2", "the next unit comes");
  assert.ok(data.explore.some(card => card.href === "agent:artist/create-image?number=1" && card.icon === "➕"), "inserting the photo stays a card");
  assert.match(data.unitsNote, /Lesson 1 is approved – Lesson 2 can start now/);
  // Not approved yet: the unit still holds the course, and no card for the photo.
  const open = readJournal(source(""));
  assert.equal(awaitsOwnMedia(open.units[0]), false);
  assert.equal(derive(open, deriveData()).data.next.href, "agent:teaching/preview?file=1", "first the approval – the photo may come after it");
  // A photo still to search (not own) keeps the unit in front.
  const search = readJournal(source("- **2026-11-07:** material approved", entry("b", "wanted", "free-photo")));
  assert.equal(derive(search, deriveData()).data.next.href, "agent:artist/create-image?number=1");
  // The view: "Approved: lesson 1 (with limits: 1 photo)" instead of "Approved: none yet".
  const html = dashboard.renderComponent("View", "sk52", { lang: "de", title: "X", unitLabel: { one: "Einheit", many: "Einheiten" }, units: [
    { id: 1, title: "A", state: "current", approved: true, usable: { state: "limited", missing: ["1 Foto"] } },
    { id: 2, title: "B", state: "draft", usable: { state: "yes" } },
    { id: 3, title: "C", state: "planned" }] });
  assert.match(html, /Freigegeben: Einheit 1 \(mit Einschränkungen: 1 Foto\) · Schon nutzbar: Einheit 2</);
  assert.doesNotMatch(html, /Freigegeben: noch keine/);
});

test("a running 'let it be prepared' shows as such; passed and approved units name it; material and check steps follow the journal (SK58–SK61)", () => {
  const begun = more => ({ n: "2", heading: { title: "B" }, material: false, done: false, approved: false, buildRequested: true, report: null, images: { total: 0, placed: 0, open: 0, waiting: 0 }, ...more });
  assert.equal(unitAction(begun()).key, "build-running", "sketch saved with 'let it be prepared': the run is going");
  assert.equal(unitAction(begun()).href, "agent:teaching/build-session?number=2");
  assert.equal(unitAction(begun({ material: true, images: { total: 3, placed: 1, open: 2, waiting: 0 } })).key, "build-running", "images and check belong to the run as well");
  assert.equal(unitAction(begun({ material: true, report: { result: "PASS", changedSince: 0, deferred: false } })).key, "approve-unit", "the report ends the run");
  assert.equal(unitAction(begun({ buildRequested: false })).key, "work-out");
  const sketch = deriveJournal({}, { decisions: "- **2026-11-07:** preparation requested" });
  assert.equal(readJournal(sketch).units[0].buildRequested, true);
  // The two ways for the next unit stand beside each other.
  const approvedOne = { units: [{ n: "1", heading: { title: "A" }, approved: true }, { n: "2", heading: null }], templates: { selection: "decided", adopted: [], briefs: [] }, filled: {}, terms: {} };
  const { cards } = exploreCards(approvedOne, makeAction("plan-unit", "teaching", "create-session", { number: "2" }), "agent:teaching/create-session?number=2");
  assert.equal(cards.find(card => card.key === "build-unit")?.alongside, true);
  // Passed, not approved: check step up next with "waiting for your approval", material step done.
  const passed = failReport.replace("__Result:__ FAIL", "__Result:__ PASS").replace("correction needed (2) (2026-11-01) – 1 point changed since – short re-check open", "passed – still missing: 1 photo (2026-11-01)")
    .replace("not yet: the self-check cannot be solved yet.", "yes, with limits: 1 photo");
  const steps = derive(readJournal(deriveJournal({}, { report: passed })), deriveData()).data.units[0].process.steps;
  assert.equal(steps[1].state, "done", "material written and checked");
  assert.equal(steps[3].state, "current");
  assert.equal(steps[3].statusLabel, "passed – waiting for your approval");
  const approved = derive(readJournal(deriveJournal({}, { report: passed, decisions: "- **2026-11-07:** material approved" })), deriveData()).data.units[0];
  assert.equal(approved.process.steps[3].state, "done");
  assert.equal(approved.process.steps[3].statusLabel, undefined);
  assert.match(approved.statusLabel, /^approved – still missing: 1 photo/, "the card names the approval");
});

test("course steps that follow from the journal: building blocks per sketch, the course check after the last unit, publishing by delivery; later steps say so (SK69, SK71, SK62)", () => {
  const courseSteps = () => ["Frame", "Goals", "Didactics", "Building blocks", "Agenda", "Material", "Check the course", "Publish"]
    .map((title, index) => ({ title, state: index < 3 || index === 4 ? "done" : index === 5 ? "current" : index === 7 ? "optional" : "planned" }));
  const passed = failReport.replace("__Result:__ FAIL", "__Result:__ PASS").replace("correction needed (2) (2026-11-01) – 1 point changed since – short re-check open", "passed (2026-11-01)")
    .replace("not yet: the self-check cannot be solved yet.", "yes").replace(/\n- ⏳.*\n/, "\n");
  const source = deriveJournal({}, { report: passed, decisions: "- **2026-11-07:** material approved" })
    .replace("### 1. Halves and quarters\n", "### 1. Halves and quarters\n\n<!-- data-key=\"building-blocks\" -->\n**Building blocks:** none – quizzes are enough\n")
    .replace("  1. sessions-called: Lesson", "  1. sessions-called: Lesson\n\n* __Course Profile:__\n  6. Delivery: link");
  const journal = readJournal(source);
  assert.equal(journal.delivery, "link");
  const steps = derive(journal, { ...deriveData(), process: { steps: courseSteps() } }).data.process.steps;
  assert.equal(steps[3].statusLabel, "checked per Lesson – none needed so far (1 of 3)");
  assert.equal(steps[6].statusLabel, "after the last Lesson – approved: Lesson 1");
  assert.equal(steps[7].state, "planned", "learners open the course by link: publishing is required");
  assert.equal(steps[7].statusLabel, "needed – after all Lessons are checked");
  const local = derive(readJournal(source.replace("Delivery: link", "Delivery: print")), { ...deriveData(), process: { steps: courseSteps() } }).data.process.steps;
  assert.equal(local[7].state, "optional");
  // The view: a required step after the current one reads "Later", not "Not started".
  const html = dashboard.renderComponent("View", "later", { lang: "de", title: "X", selected: "", process: { steps: [{ title: "A", state: "current" }, { title: "B", state: "planned" }] }, units: [{ id: "1", title: "U", state: "planned" }] });
  assert.match(html, /Später/);
  assert.match(html, /dashboard-unit-steps">Jetzt: A</, "the first step running: no 'planning done'");
});

test("validate-journal lists the preparations the course frame names and warns when no open point links it (SK72)", () => {
  const dir = mkdtempSync(join(tmpdir(), "sk72-"));
  try {
    const file = join(dir, "journal.md");
    writeFileSync(file, deriveJournal({ title: "Fractions" }).replace("## Course Context – Frame\n", "## Course Context – Frame\n\n* __Additional Notes:__\n  - Clarify before use how a tablet's saved state is reset.\n"));
    const result = spawnSync(process.execPath, [fileURLToPath(new URL("./validate-journal.mjs", import.meta.url)), file], { encoding: "utf8" });
    assert.match(result.stdout, /Preparations named in the course frame[\s\S]*Clarify before use how a tablet/);
    assert.match(result.stdout + result.stderr, /no open point links ## Course Context/);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test("pack words fill {n} from the action's own unit; a new button word brings its pack why, an own why stays (SK53, SK54)", () => {
  const journal = readJournal(deriveJournal({}, { report: failReport }));
  assert.equal(wordsOf({ key: "build-unit", params: { number: "2" } }, journal, { unit: "Lesson" }).label, "Let Lesson 2 be prepared");
  const packWhy = englishActions["work-out"].why;
  const changed = derive(journal, { ...deriveData(), next: { title: "T", why: packWhy, label: "Old word", href: "agent:artist/create-image?number=1", command: "x" } }).data;
  assert.equal(changed.next.why, englishActions["insert-images"].why, "the why of another action follows the new word");
  const own = derive(journal, { ...deriveData(), next: { title: "T", why: "Mine", label: "Old word", href: "agent:artist/create-image?number=1", command: "x" } }).data;
  assert.equal(own.next.why, "Mine");
  const dir = mkdtempSync(join(tmpdir(), "sk54-"));
  try {
    const file = join(dir, "journal.md");
    writeFileSync(file, deriveJournal({ title: "Fractions" }).replace("## Sessions – Lessons\n", "## Sessions – Lessons\n\n<!-- class=\"journal-actions\" -->\n[▶️ Let Lesson {n} be prepared](agent:teaching/build-session?number=2) `:build-session 2`\n"));
    const result = spawnSync(process.execPath, [fileURLToPath(new URL("./validate-journal.mjs", import.meta.url)), file], { encoding: "utf8" });
    assert.match(result.stdout + result.stderr, /raw placeholder in a button word: ▶️ Let Lesson \{n\} be prepared/);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test("the one-line note under ## Sessions follows how many units are created; other italic lines stay", () => {
  const words = journal => (expected, values) => wordsOf(expected, journal, { unit: "Lesson", units: "Lessons", ...values });
  const base = deriveJournal({}, { report: failReport }).replace("## Sessions – Lessons\n", "## Sessions – Lessons\n\n_Managed by the tasks._\n\n<!--- comment\n### {n}. {title}\n--->\n\n_No units yet – they are created after the didactics (and the agenda, if one is planned)._\n");
  const journal = readJournal(base);
  const { source } = patchSessionsNote(base, journal, words(journal));
  assert.match(source, /^_2 of 3 Lessons created; Lesson 3 follows once Lesson 2 is done\._$/m);
  // SK30: the earlier wording named the material as the condition – it is replaced, not kept.
  const old = source.replace(/^_2 of 3 .*$/m, "_2 of 3 Lessons created; the next one follows after the material of Lesson 2._");
  assert.match(patchSessionsNote(old, journal, words(journal)).source, /^_2 of 3 Lessons created; Lesson 3 follows once Lesson 2 is done\._$/m);
  assert.doesNotMatch(source, /No units yet/);
  assert.match(source, /^_Managed by the tasks\._$/m, "another italic line stays");
  assert.match(source, /--->\n\n_2 of 3/, "the note stays outside the comment");
  const none = readJournal(source.replace(/^### [12]\. .*$/gm, "Text"));
  assert.match(patchSessionsNote(source, { ...none, units: none.units.map(unit => ({ ...unit, heading: null })) }, words(none)).source, /^_The Lessons are planned in the agenda and are created one after another, starting with Lesson 1\._$/m);
  const all = { ...journal, units: journal.units.map(unit => ({ ...unit, heading: unit.heading ?? { title: "T" } })) };
  assert.doesNotMatch(patchSessionsNote(source, all, words(all)).source, /follows once|^_\d+ of/m, "all created: no note");
});

test("cards under More options: the second way for the next unit, the templates while they are not next; the agent's other cards stay", () => {
  const journal = readJournal(deriveJournal({}, { report: failReport }));
  const unplanned = { ...journal, units: journal.units.map(unit => unit.n === "1" ? { ...unit, approved: true } : unit) };
  const plan = courseNext(unplanned, new Map([["1", "done"], ["2", "planned"], ["3", "planned"]]), "3");
  const ways = href => exploreCards(unplanned, plan, href).cards.map(card => card.href).filter(item => /session/.test(item));
  assert.deepEqual(ways(plan.href), ["agent:teaching/build-session?number=3"]);
  assert.deepEqual(ways("agent:teaching/build-session?number=3"), ["agent:teaching/create-session?number=3"], "the agent chose the other way");
  const data = { ...deriveData(), explore: [{ icon: "💬", title: "Ask", label: "Help", href: "agent:teaching/help", command: ":help" },
    { icon: "➕", title: "Old", label: "Old", href: "agent:teaching/build-session?number=9", command: ":build-session 9" }] };
  const open = readJournal(deriveJournal({}, { report: failReport }).replace("## Agenda – Schedule", "## Templates\n\n* __Template selection:__ open\n\n## Agenda – Schedule"));
  const explore = derive(open, data).data.explore;
  assert.deepEqual(explore.map(item => item.href), ["agent:teaching/help", "agent:teaching/suggest-templates"], "unit 1 is worked on: the template suggestion is a card; a stale managed card goes");
  assert.equal(explore[1].icon, "➕");
  // SK32: the agent's own card with the icon of `next` (here 🎨, images) gets ➕ instead of a validator error.
  const own = derive(open, { ...data, explore: [{ icon: "🎨", title: "Look", label: "Visual identity", href: "agent:artist/create-visuals", command: ":agent artist → :create-visuals" }] }).data;
  assert.equal(own.next.icon, "🎨");
  assert.equal(own.explore.find(item => item.href === "agent:artist/create-visuals").icon, "➕");
});

test("an outdated report outcome is named once at the report, not again in the copies that follow it", () => {
  const dir = mkdtempSync(join(tmpdir(), "stale-copies-"));
  try {
    const file = join(dir, "journal.md");
    const old = text => text.replaceAll("short re-check open", "re-check open");
    writeFileSync(file, old(deriveJournal({ ...deriveData(), units: [{ id: 1, title: "Halves and quarters", state: "review", statusLabel: old("check: correction needed (2) – 1 point changed since – short re-check open – images 1 of 2") }] }, { report: failReport }))
      .replace("| check |", "| revised |"));
    const run = spawnSync(process.execPath, [fileURLToPath(new URL("./validate-journal.mjs", import.meta.url)), file], { encoding: "utf8" });
    const stale = run.stdout.split("\n").filter(line => /uses outdated wording/.test(line));
    assert.equal(stale.filter(line => /report's outcome/.test(line)).length, 1);
    assert.ok(!stale.some(line => /^- unit 1: (status line|statusLabel) /.test(line)), "status line and statusLabel only copy the report");
    assert.ok(stale.some(line => /Notes cell "revised"/.test(line)), "a word of its own is still named");
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test("a why the agent has just written stays when the script changes the command of next (SP56)", () => {
  const journal = readJournal(deriveJournal({}, { report: failReport }));
  const stale = { icon: "▶️", title: "Old", why: "Old reason", label: "Old", href: "agent:teaching/create-outline", command: ":create-outline" };
  const fresh = derive(journal, { ...deriveData(), next: { ...stale, why: "The pictures make the page complete." } }, { previous: { next: stale } }).data.next;
  assert.equal(fresh.command, ":agent artist → :create-image 1");
  assert.equal(fresh.why, "The pictures make the page complete.");
  const kept = derive(journal, { ...deriveData(), next: stale }, { previous: { next: stale } }).data.next;
  assert.notEqual(kept.why, "Old reason", "an unchanged why of the old step is replaced by the pack's");
});

test("missing section links and a footer without a date are created, not only corrected (T4 R1 SK4)", () => {
  const journal = readJournal(deriveJournal({}, { report: failReport }));
  const { data } = derive(journal, { ...deriveData(), links: [], footer: "Frame saved" }, { date: "2026-11-05" });
  assert.deepEqual(data.links.map(link => link.label), ["Frame", "Goals", "Methods", "Schedule", "Lessons", "Notes"]);
  assert.equal(data.footer, "As of 2026-11-05", "an event in the footer would outlive the next step (SK31)");
  assert.equal(derive(journal, { ...deriveData(), footer: undefined }, { date: "2026-11-05" }).data.footer, "As of 2026-11-05");
  const german = { ...journal, terms: { ...journal.terms, asOf: "Stand: {date}" } };
  assert.equal(derive(german, { ...deriveData(), footer: "Planungsskizze von Einheit 1 gespeichert · 05.11.2026" }, { date: "06.11.2026" }).data.footer, "Stand: 06.11.2026");
  const empty = readFileSync(new URL("../templates/journal.md", import.meta.url), "utf8");
  const emptyData = JSON.parse(empty.match(/```json @Dashboard\.View\n([\s\S]*?)\n```/)[1]);
  assert.deepEqual(derive(readJournal(empty), emptyData).changes, [], "the empty journal keeps its undated footer while nothing else changes");
});

test("the list names a new next with its words uncut, so the agent can quote the label", async () => {
  const { describe } = await import("./derive-dashboard.mjs");
  const line = describe({ path: "next", from: { href: "agent:teaching/create-didactics" }, to: { icon: "▶️", title: "Templates for activities", why: "A very long reason ".repeat(8), label: "Suggest templates", href: "agent:teaching/suggest-templates", command: ":suggest-templates" }, why: "next action by the journal: :suggest-templates" });
  assert.match(line, /^- next: "agent:teaching\/create-didactics" → title "Templates for activities", label "Suggest templates", command ":suggest-templates" \(next action/);
});

test("units of a first agenda get the pack's steps; the course view stays until the next unit is begun; the Sessions note shows in the overview", () => {
  const source = deriveJournal({}, {}).replace(/### 1\. Halves and quarters[\s\S]*?(?=## Notes Backup)/, "").replace(/### 2\. Comparing fractions[\s\S]*?(?=## Notes Backup)/, "")
    .replace(/\| 1 \| Halves and quarters \| explore \| none \| ✅ \| ✅ \| ❌ \| check \|\n\| 2 \| Comparing fractions \| explore \| none \| ✅ \| ❌ \| ❌ \| sketch \|\n/, "");
  const journal = readJournal(source);
  assert.equal(journal.units.filter(unit => unit.heading).length, 0, "fixture: no unit begun");
  const input = { ...deriveData(), process: { steps: [{ title: "Agenda", state: "done" }, { title: "Material", state: "current" }] }, selected: "1" };
  input.units = [];
  const { data } = derive(journal, input);
  assert.deepEqual(data.units[0].process.steps.map(step => step.title), ["Plan", "Work out the material", "Insert images", "Check and approve"]);
  assert.deepEqual(data.units[0].process.steps.map(step => step.state), ["current", "planned", "optional", "planned"], "planning is the step next advances");
  assert.equal(data.selected, "", "course view");
  assert.match(data.unitsNote, /planned in the agenda/);
});

test("a new next action whose old words still stand in a step text asks the agent to rewrite that step", () => {
  const journal = readJournal(deriveJournal({}, { report: failReport }));
  const draft = { ...deriveData(), next: { title: "T", why: "W", label: "Suggest templates", href: "agent:teaching/suggest-templates", command: ":suggest-templates" },
    process: { steps: [{ title: "Templates", state: "current", next: "Click „Suggest templates“." }] } };
  const { missing } = derive(journal, draft);
  const step = missing.find(item => item.where === "step");
  assert.ok(step, "the stale step is named");
  assert.match(missingText(step), /process step "Templates"\.next still names the old next action "Suggest templates"/);
});

test("while templates are next and the required agenda is missing, a card brings the agenda forward; it goes once the agenda exists", () => {
  const base = readJournal(deriveJournal({}, { report: failReport }));
  const journal = { ...base, agendaRequired: "yes", hasAgenda: false, filled: { ...base.filled, Didactics: true }, templates: { selection: "open", adopted: [], briefs: [] } };
  const next = makeAction("suggest-templates", "teaching", "suggest-templates");
  const { cards, managed } = exploreCards(journal, next, next.href);
  assert.ok(cards.some(card => card.href === "agent:teaching/create-agenda"), "agenda card");
  assert.ok(managed.test("agent:teaching/create-agenda"), "managed: it goes when no longer right");
  assert.ok(!exploreCards({ ...journal, hasAgenda: true }, next, next.href).cards.some(card => card.href === "agent:teaching/create-agenda"));
});

test("an alongside card stands below the next button, not in More options", () => {
  const html = dashboard.renderComponent("View", "al1", { lang: "de", title: "X",
    next: { title: "Vorlagen", label: "Vorlagen vorschlagen", href: "agent:teaching/suggest-templates", command: ":suggest-templates" },
    explore: [{ icon: "➕", title: "Ablaufplan", label: "Ablaufplan erstellen", href: "agent:teaching/create-agenda", command: ":create-agenda", alongside: true },
      { icon: "🎨", title: "Gestaltung", label: "Gestaltung", href: "agent:artist/switch", command: ":agent artist" }] });
  assert.match(html, /dashboard-next[\s\S]*dashboard-alongside"><span>Auch möglich:<\/span>[\s\S]*Ablaufplan erstellen/);
  const more = html.slice(html.indexOf("dashboard-explore"));
  assert.doesNotMatch(more, /Ablaufplan erstellen/, "not repeated under More options");
  assert.match(more, /^dashboard-explore" open>/, "one card left: open");
});

test("the step next advances is current in the course and the unit; another current course step is named for rewriting", () => {
  const journal = readJournal(deriveJournal({}, { report: failReport }));
  const draft = { ...deriveData(), process: { steps: ["Context", "Outline", "Didactics", "Templates", "Agenda", "Create material", "Check", "Publish"].map((title, i) => ({ title, state: i < 3 || i === 4 ? "done" : i === 3 ? "current" : i === 7 ? "optional" : "planned" })) } };
  const { data, missing } = derive(journal, draft);
  assert.equal(data.process.steps[5].state, "current", "the material step: next is a unit action");
  const stale = missing.find(item => item.where === "current");
  assert.equal(stale?.step, "Templates");
  assert.match(missingText(stale), /process step "Templates" is current, but the next action \(.*\) advances "Create material"/);
});

test("a unit's building-block line: a need puts the template card alongside, the word for none does not", () => {
  const withLine = text => deriveJournal({}, { report: failReport }).replace("### 2. Comparing fractions\n", `### 2. Comparing fractions\n\n<!-- data-key="building-blocks" -->\n**Building blocks:** ${text}\n`);
  const next = makeAction("work-out", "teaching", "coauthor-materials", { number: 2 });
  const cards = text => { const j = readJournal(withLine(text)); return exploreCards({ ...j, filled: { ...j.filled, Didactics: true }, templates: { selection: "open", adopted: [], briefs: [] } }, next, next.href).cards; };
  assert.equal(readJournal(withLine("a drawing board")).units.find(unit => unit.n === "2").blocks, "a drawing board");
  assert.equal(cards("a drawing board for the sketch").find(card => card.key === "suggest-templates")?.alongside, true);
  assert.ok(!cards("none – plain text and a quiz").find(card => card.key === "suggest-templates")?.alongside);
});

test("a new unit without its status line gets one, in number order", () => {
  const source = deriveJournal({}, { report: failReport }).replace(/^2\. Comparing fractions – .*\n/m, "");
  assert.doesNotMatch(source, /^2\. Comparing fractions/m, "fixture: no status line for unit 2");
  const journal = readJournal(source);
  const derived = derive(journal, deriveData());
  const { source: patched } = patchJournal(source, journal, derived);
  assert.match(patched, /^1\. Halves and quarters – .*\n2\. Comparing fractions – planning sketch ✅ · material open$/m);
  const again = readJournal(patched);
  assert.equal(patchJournal(patched, again, derive(again, deriveData())).changes.filter(change => /status line/.test(change.path)).length, 0, "a second run changes nothing");
  const none = source.replace(/^1\. Halves and quarters – .*\n/m, "");
  const j2 = readJournal(none);
  assert.match(patchJournal(none, j2, derive(j2, deriveData())).source, /^1\. Halves and quarters – .*\n2\. Comparing fractions – .*\n\n<details>/m, "without any status line: above the technical overview");
});

test("check-material: a companion greeting that reads as if the learner greeted the companion is a warning (R12-SK81)", () => {
  const { warnings } = analyseMaterial("# Blüten\n\n    --{{0}}--\nHallo, da bin ich wieder, Mira! Komm mit!\n\n# Zweite\n\nHallo, Kinder! Ich bin Mira.\n");
  const hits = warnings.filter(warning => /reads as if the learner greeted/.test(warning));
  assert.equal(hits.length, 1, warnings.join("\n"));
  assert.match(hits[0], /slide "Blüten": "Hallo, da bin ich wieder, Mira!"/);
  assert.equal(analyseMaterial("# A\n\nHello, here I am again, Max!\n").warnings.filter(warning => /reads as if/.test(warning)).length, 1, "English as well");
  assert.equal(analyseMaterial("# A\n\nIch bin es wieder, Mira! Schau mal.\n").warnings.filter(warning => /reads as if/.test(warning)).length, 1, "also without a greeting word (R12b-SK89)");
  assert.equal(analyseMaterial("# A\n\nIch bin Mira. Schön, dass du da bist, Lea!\n").warnings.filter(warning => /reads as if/.test(warning)).length, 0, "addressing a learner is fine");
});

test("check-material: a project rule 'without scrolling' turns every window it names that needs scrolling into a warning (R12-SK78)", () => {
  const { noScrollRule, noScrollMisfits } = materialChecks;
  const journal = "## Agents\n\n### Coauthor\n\n  11. Bei Fragen mit Bildern sind Frage und alle Bilder auf dem iPad quer ohne Scrollen zu sehen.\n\n### Artist-Agent\n";
  const rule = noScrollRule(journal);
  assert.deepEqual({ orientations: rule.orientations }, { orientations: ["landscape"] });
  assert.match(rule.text, /quer ohne Scrollen/);
  assert.equal(noScrollRule("## Agents\n\n### Coauthor\n\nKurze Sätze.\n"), null, "no rule, no check");
  const fit = [{ slide: "Was kommt zuerst?", question: "Was kommt zuerst?", windows: ["810×1080 portrait: fits only once scrolled (…)", "1024×768 landscape: fits only once scrolled (…)", "1080×810 landscape: fits"] },
    { slide: "Was kommt zuerst?", question: "Was dann?", windows: ["1024×768 landscape: fits only once scrolled (…)"] },
    { slide: "Was kommt zuerst?", question: "Und zuletzt?", windows: ["1024×768 landscape: does not fit (…)"] }];
  const misfits = noScrollMisfits(fit, rule);
  assert.equal(misfits.length, 2, "the first question of a page counts at open; a later one only when it does not fit one screen\n" + misfits.join("\n"));
  assert.match(misfits[1], /Und zuletzt/);
  assert.match(misfits[0], /slide "Was kommt zuerst\?".*1024×768 landscape.*project rule.*quer ohne Scrollen.*not met – a finding/);
  assert.doesNotMatch(misfits[0], /810×1080/, "portrait windows are not named when the rule says landscape");
});

test("a running 'let it be prepared' is a state, not a button: next.running, status word and material step say so (R12-SK75–SK77)", () => {
  const journal = readJournal(deriveJournal({}, { decisions: "- **2026-11-07:** preparation requested" }));
  assert.equal(journal.units[0].buildRequested, true);
  const { data } = derive(journal, { title: "Fractions" });
  assert.equal(data.next.running, true, "the next action is the running preparation");
  assert.equal(data.units[0].statusLabel, "being prepared – planning sketch ✅", "no 'material open' while it is being written");
  assert.match(data.units[0].process.steps[1].why, /on its own/, "the material step does not say 'together' during the run");
  const html = dashboard.renderComponent("View", "r12", { ...data, lang: "en" });
  const hero = html.split('class="dashboard-hero"')[1].split("</header>")[0];
  assert.match(hero, /Running now:/);
  assert.doesNotMatch(hero, /dashboard-button-primary|dashboard-command/, "no big button and no command while it runs");
  assert.equal(data.units[0].process.steps[1].running, true, "the step being worked on is running, not 'up next'");
  const card = html.split('data-dashboard-select="1"')[0];
  assert.doesNotMatch(html.split('class="dashboard-hero"')[1].split("</header>")[0], /Up next/);
  assert.match(dashboard.renderComponent("View", "r12s", { ...data, lang: "en", selected: "1" }), /Running now/, "the running step's chip");
  const done = readJournal(deriveJournal({}, { decisions: "- **2026-11-07:** preparation requested", report: failReport }));
  const after = derive(done, { title: "Fractions" }).data;
  assert.equal(after.next.running, undefined, "the report ends the run");
  assert.equal(after.units[0].process.steps[1].running, undefined);
  // After the run the pack's joint-way text does not come back (R12b-SK88).
  const back = derive(done, { title: "Fractions", units: [{ id: 1, title: "Halves", state: "draft", process: { steps: englishUnitSteps.map(step => ({ ...step, state: "done" })) } }] }).data;
  assert.match(back.units[0].process.steps[1].why, /on its own/);
});

test("a unit number turns the course check into a unit check: next with number=n is not the course action (R12b)", () => {
  const course = makeAction("check-course", "teaching", "validate-course", {}, "🔍");
  assert.equal(accepts(course, "agent:teaching/validate-course"), true);
  assert.equal(accepts(course, "agent:teaching/validate-course?number=4"), false, "number selects one unit – another action");
  const fix = makeAction("quick-fix", "teaching", "quick-fix", { number: "2" }, "✏️");
  assert.equal(accepts(fix, "agent:teaching/quick-fix?number=2&description=Typo"), true, "a description still counts as the same action");
});

test("a course check that failed only on own photos sends next to inserting the photo, not to another course check (R12c-SK93)", () => {
  const unit = (n, waiting) => ({ n, heading: { title: `U${n}` }, material: true, approved: true, done: !waiting, report: { result: "PASS", changedSince: 0 }, images: { total: 2, placed: 2 - waiting, open: waiting, waiting } });
  const journal = validation => ({ filled: { "Course Context": true, Outline: true, Didactics: true }, units: [unit("1", 0), unit("2", 1)], templates: { selection: "decided", adopted: [], briefs: [] },
    hasAgenda: true, agendaRequired: "yes", validation, published: false });
  const states = new Map([["1", "done"], ["2", "current"]]);
  assert.equal(courseNext(journal({ mode: null, result: null }), states).key, "check-course", "before the first course check: check the course");
  const after = courseNext(journal({ mode: "course", result: "FAIL" }), states);
  assert.equal(after.key, "insert-images", "the course check failed only on the photo");
  assert.equal(after.href, "agent:artist/create-image?number=2");
  const steps = ["Frame", "Goals", "Didactics", "Blocks", "Agenda", "Material", "Check", "Publish"].map(title => ({ title }));
  assert.equal(courseStepOf(after, steps).title, "Check", "the photo finishes the course check: that course step stays in progress");
});

test("tracks: steps and later sections per track", () => {
  assert.deepEqual(stepsOf("full"), ["frame","outline","didactics","blocks","agenda","material","check","publish"]);
  assert.deepEqual(stepsOf("convert", "transfer"), ["frame","look","material","check","publish"]);
  assert.deepEqual(stepsOf("convert", "rebuild"), ["frame","outline","look","material","check","publish"]);
  assert.deepEqual(laterOf("full"), []);
  assert.ok(laterOf("template").includes("Sessions"));
  assert.ok(!laterOf("mini").includes("Sessions"), "the README is unit 1");
  for (const [track, mode] of [["mini"], ["convert", "rebuild"], ["convert", "transfer"], ["template"]]) assert.ok(!laterOf(track, mode).includes("Templates"), "Templates holds the Dashboard import and is never when needed");
  assert.equal(sectionSlug("Learner Personas"), "learner-personas");
});
test("readJournal: track, convert mode, source and later sections (also under a translated heading)", () => {
  const src = `<!--\nlanguage: de\n-->\n# K\n\n## Course Context – Kurskontext\n\n* __Track:__\n  1. Track: convert\n  2. Convert mode: transfer\n  3. Source: quelle.pdf\n\n## Didactics – Didaktik\n\n${laterMarker}\n_Bei Bedarf – für diesen Kurs noch nicht nötig._ [➕ hinzunehmen](agent:teaching/activate-section?section=didactics) \`:activate-section didactics\`\n\n## Agents\n\n### Learner Personas\n\n${laterMarker}\n_x_\n`;
  const j = readJournal(src);
  assert.equal(j.track, "convert");
  assert.equal(j.convertMode, "transfer");
  assert.equal(j.source, "quelle.pdf");
  assert.deepEqual(j.later.sort(), ["Didactics", "Learner Personas"]);
  assert.equal(j.filled.Didactics, false);
});
test("readJournal: a journal without a track field is the full track", () => {
  const j = readJournal(readFileSync(new URL("./fixtures/journal-84484ae.md", import.meta.url), "utf8"));
  assert.equal(j.track, "full");
  assert.deepEqual(j.later, []);
});
test("isLater: first non-empty line decides", () => {
  assert.equal(isLater(`\n\n${laterMarker}\ntext`), true);
  assert.equal(isLater(`text\n${laterMarker}`), false);
});

// ── Light tracks: next and course step per track ──
test("full track unchanged: the fixture journal keeps its next and course step", () => {
  const journal = readJournal(readFileSync(new URL("./fixtures/journal-84484ae.md", import.meta.url), "utf8"));
  const states = new Map(journal.units.map(unit => [unit.n, unitState(unit).state]));
  const plain = courseNext(journal, states);
  const explicit = courseNext({ ...journal, track: "full" }, states);
  assert.equal(journal.track, "full");
  assert.equal(explicit?.href, plain?.href);
  const steps = Array.from({ length: 8 }, (_, i) => ({ title: `S${i}` }));
  if (plain) assert.equal(courseStepOf(explicit, steps, { track: "full" })?.title, courseStepOf(plain, steps)?.title);
  assert.equal(courseStepOf(makeAction("create-agenda", "teaching", "create-agenda"), steps, { track: "full" }).title, "S4");
});
test("mini track: frame → outline → write → unit actions → publish only when delivery needs it", () => {
  const base = { track: "mini", filled: { "Course Context": true, Outline: true }, units: [], templates: { selection: "open", adopted: [], briefs: [] }, validation: {}, published: false, delivery: null };
  assert.equal(courseNext({ ...base, filled: { "Course Context": false } }, new Map()).key, "init-course");
  assert.equal(courseNext(base, new Map()).key, "write-mini-course");
  const unit = facts(1, { heading: { title: "A" }, material: true, done: true, approved: true, report: { result: "PASS", changedSince: 0 } });
  const passed = { validation: { mode: "course", result: "PASS" } };
  assert.equal(courseNext({ ...base, ...passed, units: [unit] }, new Map([["1", "done"]])), null);
  assert.equal(courseNext({ ...base, ...passed, units: [unit], delivery: "link" }, new Map([["1", "done"]])).key, "publish");
  const open = facts(1, { heading: { title: "A" }, material: true });
  assert.equal(courseNext({ ...base, units: [open] }, new Map([["1", "current"]])).key, "check-unit");
});
test("convert track: outline only when rebuilding; the run is next before material exists", () => {
  const base = { track: "convert", filled: { "Course Context": true, Outline: false }, units: [], templates: { selection: "open", adopted: [], briefs: [] }, validation: {}, published: false };
  assert.equal(courseNext({ ...base, convertMode: "transfer" }, new Map()).key, "convert-course");
  assert.equal(courseNext({ ...base, convertMode: "rebuild" }, new Map()).key, "create-outline");
});
test("template track: start → develop (also when ready to test) → publish after approval → nothing once published", () => {
  const t = (briefs, published = false) => ({ track: "template", filled: { "Course Context": true }, units: [], templates: { selection: "open", adopted: [], briefs }, validation: {}, published });
  assert.equal(courseNext(t([]), new Map()).key, "start-template");
  assert.equal(courseNext(t([{ id: "map", state: "ready to test" }]), new Map()).href, "agent:development/develop-template?id=map");
  assert.equal(courseNext(t([{ id: "map", state: "approved" }]), new Map()).href, "agent:development/publish-template?id=map");
  assert.equal(courseNext(t([{ id: "map", state: "approved" }], true), new Map()), null);
});
test("courseStepOf follows the track's step list", () => {
  const steps = ["Brief", "Build", "Try", "Publish"].map(title => ({ title }));
  assert.equal(courseStepOf(makeAction("develop-template", "development", "develop-template", { id: "x" }), steps, { track: "template" }).title, "Build");
  const mini = ["Frame", "Material", "Check", "Publish"].map(title => ({ title }));
  assert.equal(courseStepOf(makeAction("write-mini-course", "teaching", "create-mini-course"), mini, { track: "mini" }).title, "Material");
  assert.ok("activate-section" in englishActions && englishActions["activate-section"].label === "Add");
});

// ── Light tracks: overview per track ──
const miniSource = (extra = "") => deriveJournal({})
  .replace("* __Terminology:__", `* __Track:__\n  1. Track: mini\n\n* __Terminology:__`)
  .replace("  1. sessions-called: Lesson", `  1. sessions-called: Lesson${extra}`);
test("derive: when-needed sections become process.later with activate links; the full track has none", () => {
  const marked = miniSource()
    .replace("## Didactics – Methods\n\nText", `## Didactics – Methods\n\n${laterMarker}\nText`)
    .replace("## Agenda – Schedule\n\n", `## Agenda – Schedule\n\n${laterMarker}\n`);
  const process = { steps: ["Frame", "Write", "Check", "Publish"].map(title => ({ title, state: "planned" })) };
  const data = derive(readJournal(marked), { ...deriveData(), process }).data;
  assert.deepEqual(data.process.later.map(item => item.href), ["agent:teaching/activate-section?section=didactics", "agent:teaching/activate-section?section=agenda"]);
  assert.deepEqual(data.process.later.map(item => item.label), ["Methods", "Schedule"]);
  assert.deepEqual(data.process.later.map(item => item.command), [":activate-section didactics", ":activate-section agenda"]);
  assert.equal(derive(readJournal(miniSource()), { ...deriveData(), process }).data.process.later, undefined);
  assert.equal(derive(readJournal(deriveJournal({})), { ...deriveData(), process }).data.process.later, undefined);
});
test("derive: the index rules (blocks, course check, publish) find their step by key, not by position", () => {
  const source = miniSource("\n\n* __Course Profile:__\n  6. Delivery: link");
  const journal = readJournal(source);
  assert.equal(journal.track, "mini");
  const process = { steps: [{ title: "Frame", state: "done" }, { title: "Write", state: "current" }, { title: "Check", state: "planned" }, { title: "Publish", state: "optional" }] };
  const steps = derive(journal, { ...deriveData(), process }).data.process.steps;
  assert.equal(steps[3].state, "planned");
  assert.match(steps[3].statusLabel, /^needed/);
});
test("nextTitle: on a light track the course-level title comes from the track's step list", () => {
  const steps = ["Frame", "Write the course", "Check", "Publish"].map(title => ({ title }));
  const expected = makeAction("write-mini-course", "teaching", "create-mini-course");
  assert.equal(nextTitle(expected, { process: { steps } }, "Lesson", { track: "mini" }), "Write the course");
});
test("view: process.later shows as one collapsed 'When needed' line and is not counted", () => {
  const input = { title: "T", process: { steps: [{ title: "A", state: "done" }, { title: "B", state: "planned" }], later: [{ label: "Didaktik", href: "agent:teaching/activate-section?section=didactics", command: ":activate-section didactics" }] } };
  const model = dashboard.buildModel(input);
  assert.equal(model.process.steps.length, 2);
  const html = dashboard.renderComponent("View", "later-view", { lang: "en", selected: "", ...input, units: [{ id: "1", title: "U", state: "planned" }] });
  assert.match(html, /<details class="dashboard-later"><summary>When needed \(1\)<\/summary>/);
  assert.match(html, /Didaktik/);
  assert.match(html, /1 of 2 planning step/);
});
test("view: German state words – optional is 'Optional', later is 'Bei Bedarf'", () => {
  const html = dashboard.renderComponent("View", "later-de", { lang: "de", selected: "", title: "T", process: { steps: [{ title: "A", state: "optional" }], later: [{ label: "X", href: "agent:teaching/activate-section?section=agenda", command: ":activate-section agenda" }] }, units: [{ id: "1", title: "U", state: "planned" }] });
  assert.match(html, /<summary>Bei Bedarf \(1\)/);
  assert.match(html, /Optional/);
  assert.doesNotMatch(html, />Bei Bedarf</);
});
test("nextTitle: on a light track without a matching step there is no title (no fall-through to the full-track index)", () => {
  const steps = ["Frame", "Write", "Check", "Publish"].map(title => ({ title }));
  assert.equal(nextTitle(makeAction("create-agenda", "teaching", "create-agenda"), { process: { steps } }, "Lesson", { track: "mini" }), null);
});

// ---- Sections marked "when needed" and the track (Task 4) ----

const validateText = text => {
  const dir = mkdtempSync(join(tmpdir(), "dashboard-later-"));
  const file = join(dir, "journal.md");
  writeFileSync(file, text);
  const run = spawnSync(process.execPath, [fileURLToPath(new URL("./validate-journal.mjs", import.meta.url)), file], { encoding: "utf8" });
  rmSync(dir, { recursive: true, force: true });
  return { status: run.status, output: run.stdout + run.stderr, file };
};
const laterBlock = key => `${laterMarker}\n\n_When needed – not needed for this course yet._\n\n[➕ Add](agent:teaching/activate-section?section=${sectionSlug(key)}) \`:activate-section ${sectionSlug(key)}\`\n\n`;
const laterEntry = key => ({ label: key, href: `agent:teaching/activate-section?section=${sectionSlug(key)}`, command: `:activate-section ${sectionSlug(key)}` });
const dashJson = data => `\`\`\`json @Dashboard.View\n${JSON.stringify(data, null, 2)}\n\`\`\``;
const baseNext = { title: "Weiter", why: "W", label: "Weiter", href: "agent:teaching/create-didactics", command: ":create-didactics" };
const journalWith = ({ track = "", outline = "Text\n\n", later = [], dash = {} } = {}) =>
  `<!--\nlanguage: en\n-->\n\n# Course\n\n## Course Context\n\n${track ? `* __Track:__\n  1. Track: ${track}\n  2. Convert mode: n/a\n  3. Source: n/a\n\n` : ""}## Outline\n\n${outline}## Didactics\n\n${later.includes("Didactics") ? laterBlock("Didactics") : "Text\n\n"}## Dashboard\n\n${dashJson({ title: "Course", next: baseNext, ...dash })}\n`;

test("validate-journal rejects content under the when-needed marker", () => {
  const result = validateText(journalWith({ later: ["Didactics"], dash: { process: { steps: [{ title: "A", state: "planned" }], later: [laterEntry("Didactics")] } } }).replace(laterBlock("Didactics"), laterBlock("Didactics") + "Some real didactics text.\n\n"));
  assert.equal(result.status, 2, result.output);
  assert.match(result.output, /## Didactics is marked when needed but has content – remove the marker \(`:activate-section didactics`\) or the content/);
});

test("validate-journal rejects an unknown Track value", () => {
  const result = validateText(journalWith({ track: "turbo" }));
  assert.equal(result.status, 2, result.output);
  assert.match(result.output, /Track: "turbo" is not one of full, mini, convert, template/);
});

test("validate-journal asks for process.later that matches the marked sections", () => {
  const missing = validateText(journalWith({ later: ["Didactics"], dash: { process: { steps: [{ title: "A", state: "planned" }] } } }));
  assert.equal(missing.status, 2, missing.output);
  assert.match(missing.output, /process\.later does not match the sections marked when needed.*derive-dashboard\.mjs --write/);
  const extra = validateText(journalWith({ dash: { process: { steps: [{ title: "A", state: "planned" }], later: [laterEntry("Didactics")] } } }));
  assert.equal(extra.status, 2, extra.output);
  assert.match(extra.output, /process\.later does not match/);
  const fine = validateText(journalWith({ later: ["Didactics"], dash: { process: { steps: [{ title: "A", state: "planned" }], later: [laterEntry("Didactics")] } } }));
  assert.equal(fine.status, 0, fine.output);
});

test("validate-journal: an empty-looking when-needed section is no 'empty' or 'missing' finding", () => {
  const plain = validateText(journalWith({ outline: laterBlock("Outline"), later: ["Outline", "Didactics"], dash: { process: { steps: [{ title: "A", state: "planned" }], later: [laterEntry("Outline"), laterEntry("Didactics")] } } }));
  assert.equal(plain.status, 0, plain.output);
  assert.doesNotMatch(plain.output, /empty|missing/i);
});

for (const track of ["mini"]) test(`${track}-track journal with markers on all laterOf(${track}) sections validates clean`, () => {
  const dir = mkdtempSync(join(tmpdir(), "dashboard-mini-"));
  const file = join(dir, "journal.md");
  let text = readFileSync(fileURLToPath(new URL("../templates/journal.md", import.meta.url)), "utf8");
  text = text.replace(', "next": "Click “Start course” and answer the questions."', "");
  // The first Dashboard write of a light track has the steps of its track (tasks/update-dashboard.md, T7).
  text = text.replace(/("steps": \[\n)[\s\S]*?(\n    \],)/, (_, open, close) => `${open}${stepsOf(track).map(key => `      {"title": "${key}", "state": "planned"}`).join(",\n")}${close}`);
  text = text.replace(/(## Course Context\n)/, `$1\n* __Track:__\n  1. Track: ${track}\n  2. Convert mode: n/a\n  3. Source: n/a\n`);
  for (const key of laterOf(track)) {
    const block = laterBlock(key);
    const pattern = key === "Learner Personas"
      ? /(### Learner Personas[^\n]*\n)[\s\S]*?(?=\n---)/
      : new RegExp(`(## ${key}[^\\n]*\\n)[\\s\\S]*?(?=\\n---\\n\\n## |(?![\\s\\S]))`);
    assert.match(text, pattern, key);
    text = text.replace(pattern, (_, head) => `${head}\n${block}`);
  }
  writeFileSync(file, text);
  try {
    const derived = spawnSync(process.execPath, [fileURLToPath(new URL("./derive-dashboard.mjs", import.meta.url)), "--write", file], { encoding: "utf8" });
    assert.equal(derived.status, 0, derived.stdout + derived.stderr);
    const run = spawnSync(process.execPath, [fileURLToPath(new URL("./validate-journal.mjs", import.meta.url)), file], { encoding: "utf8" });
    assert.equal(run.status, 0, run.stdout + run.stderr);
    assert.doesNotMatch(run.stderr, /when needed/);
    assert.match(readFileSync(file, "utf8"), /## Templates[\s\S]*?### Dashboard\s+\* __Import:__/);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

// ---- The mini course end to end (leichte Straenge T7): the init-course save, then :create-mini-course ----

// What the mini save of tasks/init-course.md writes into the empty journal: the short frame with the Track
// block, the short outline, the when-needed markers and – with the first update-dashboard run – the steps of
// the mini track (tasks/update-dashboard.md → Rules → Process steps per track).
function miniInitJournal({ steps = stepsOf("mini") } = {}) {
  let text = readFileSync(fileURLToPath(new URL("../templates/journal.md", import.meta.url)), "utf8");
  const section = (key, body) => {
    const pattern = new RegExp(`(## ${key}[^\\n]*\\n)[\\s\\S]*?(?=\\n---\\n\\n## )`);
    assert.match(text, pattern, key);
    text = text.replace(pattern, (_, head) => `${head}\n${body}`);
  };
  section("Course Context", `<!-- class="journal-actions" -->\n[▶️ Start course](agent:teaching/init-course) \`:init-course\`\n\n**Course frame:** confirmed on 2026-11-12.\n\n<!-- data-type="none" -->\n| Item | Decided |\n|---|---|\n| Topic | Reading a timetable |\n| Open the material | by link |\n\n<details><summary>Technical settings for the assistant</summary>\n\n* __Course Type:__\n  1. Type: single-lesson\n  2. Working Title: Reading a timetable\n  3. Target Group: adult learners\n\n* __Track:__\n  1. Track: mini\n  2. Convert mode: n/a\n  3. Source: n/a\n\n* __Terminology:__\n  1. sessions-called: lesson\n\n* __Course Profile:__\n  1. Persona type: tutor\n  2. Agenda required: no\n  3. Pacing: n/a\n  4. Assessment defaults: self-check quizzes\n  5. Units: 1 × 20 min\n  6. Delivery: link\n\n* __File Structure:__\n  1. Mode: single-file\n  2. Session folder naming: n/a\n\n* __Conventions & Standards:__\n  1. Language: en\n  2. Tone: informal\n  3. Person: you\n  4. Instructor Address: you\n  5. Author: A. Teacher\n\n</details>\n`);
  section("Outline", `<!-- class="journal-actions" -->\n[▶️ Create outline](agent:teaching/create-outline) \`:create-outline\`\n\n<!-- data-key="title" -->\n* __Title:__\n  Reading a timetable\n\n<!-- data-key="target-audience" -->\n* __Target Audience:__\n  Adult learners\n\n<!-- data-key="learning-goals" -->\n* __Learning Objectives:__\n  1. Learners can find the departure time of a line at a stop.\n  2. Learners can tell how long a trip between two stops takes.\n\n<!-- data-key="session-overview" -->\n* __Slides:__\n  1. What a timetable shows – rows, columns and stops.\n  2. Finding a departure – quiz on objective 1.\n  3. How long it takes – quiz on objective 2.\n`);
  for (const key of laterOf("mini")) {
    if (key === "Learner Personas") text = text.replace(/(### Learner Personas[^\n]*\n)[\s\S]*?(?=\n---)/, (_, head) => `${head}\n${laterBlock(key)}`);
    else section(key, laterBlock(key));
  }
  // The empty-template note of ## Sessions ("… after the didactics") gives way to the mini note.
  assert.match(text, /\n_No units yet[^\n]*\n/);
  text = text.replace(/\n_No units yet[^\n]*\n/, `\n_${englishTerms.miniSessionsNote}_\n`);
  const titles = { frame: "Frame and learning objectives", material: "Write the material", check: "Check", publish: "Publish" };
  const data = JSON.parse(text.match(/```json @Dashboard\.View\n([\s\S]*?)\n```/)[1]);
  data.process.steps = steps.map(key => ({ title: titles[key] ?? key, state: { frame: "done", material: "current", publish: "optional" }[key] ?? "planned", why: "Why." }));
  data.process.note = "A lesson counts as finished once its check has passed and you have approved it.";
  data.next = { title: "Write the material", why: "The short course is written in one go.", label: "Write the course", href: "agent:teaching/create-mini-course", command: ":create-mini-course", icon: "▶️" };
  return text.replace(/```json @Dashboard\.View\n[\s\S]*?\n```/, dashJson(data));
}

// What :create-mini-course saves: unit 1 (heading, goal, table row with Material ✅) and the root README.md.
const miniUnitSave = text => text
  .replace(`\n_${englishTerms.miniSessionsNote}_\n`, "\n")
  .replace(/(\| # \| Title \| Type \| Skeleton \| Material \| Done \| Notes \|\n\|[-|]+\|\n)/, "$1| 1 | Reading a timetable | n/a | ✅ | ✅ | ❌ | |\n")
  .replace(/(<\/details>\n)(\n---\n\n## Agents)/, `$1\n### 1. Reading a timetable\n\n<!-- data-key="summary" -->\n**Summary:**\n\nLearners find a departure time and tell how long a trip takes.\n$2`);
const miniReadme = "<!--\nauthor: A. Teacher\nversion: 0.1.0\nlanguage: en\nnarrator: UK English Female\n-->\n\n# Reading a timetable\n\nWhat a timetable tells you, and how to read it.\n\n## What a timetable shows\n\nRows, columns and stops.\n\n## Finding a departure\n\nWhen does line 4 leave?\n\n[[10:15]]\n";

function inMiniProject(text, files, run) {
  const dir = mkdtempSync(join(tmpdir(), "dashboard-mini-course-"));
  const file = join(dir, "journal.md");
  writeFileSync(file, text);
  for (const [name, content] of Object.entries(files)) writeFileSync(join(dir, name), content);
  const script = name => spawnSync(process.execPath, [fileURLToPath(new URL(`./${name}`, import.meta.url)), ...(name === "derive-dashboard.mjs" ? ["--write"] : []), file], { encoding: "utf8" });
  try { return run({ file, derive: () => script("derive-dashboard.mjs"), validate: () => script("validate-journal.mjs"), read: () => readFileSync(file, "utf8") }); }
  finally { rmSync(dir, { recursive: true, force: true }); }
}
const dashboardOf = text => JSON.parse(text.match(/```json @Dashboard\.View\n([\s\S]*?)\n```/)[1]);
const actionLineOf = (text, heading) => text.split(heading)[1]?.split('<!-- class="journal-actions" -->')[1]?.trimStart().split("\n")[0] ?? "";

test("mini course end to end: the init-course save leaves a Dashboard that derive --write and validate-journal accept", () => {
  inMiniProject(miniInitJournal(), {}, ({ derive, validate, read }) => {
    const derived = derive();
    assert.equal(derived.status, 0, derived.stdout + derived.stderr);
    const run = validate();
    assert.equal(run.status, 0, run.stdout + run.stderr);
    const data = dashboardOf(read());
    assert.equal(data.process.steps.length, stepsOf("mini").length);
    assert.equal(data.next.command, ":create-mini-course");
    assert.deepEqual(data.process.later.map(item => item.command).sort(), laterOf("mini").filter(key => key !== "Analysis Status").map(key => `:activate-section ${sectionSlug(key)}`).sort());
    // ## Sessions offers writing the mini course, never the didactics a mini course marks when needed.
    assert.match(actionLineOf(read(), "\n## Sessions"), /agent:teaching\/create-mini-course/);
    assert.doesNotMatch(read().split("\n## Sessions")[1].split("\n## ")[0], /after the didactics/, "the mini note replaces the empty-template note");
    assert.ok(read().includes(`_${englishTerms.miniSessionsNote}_`));
  });
});

test("mini course end to end: after :create-mini-course the whole README.md is unit 1 and its check is next", () => {
  inMiniProject(miniUnitSave(miniInitJournal()), { "README.md": miniReadme }, ({ derive, validate, read }) => {
    const derived = derive();
    assert.equal(derived.status, 0, derived.stdout + derived.stderr);
    const run = validate();
    assert.equal(run.status, 0, run.stdout + run.stderr);
    const text = read();
    assert.equal(dashboardOf(text).next.command, ":validate-course 1");
    assert.match(text, /^1\. Reading a timetable – material written · check open$/m);
    assert.match(actionLineOf(text, "\n### 1. Reading a timetable"), /agent:teaching\/validate-course\?number=1/);
    assert.doesNotMatch(actionLineOf(text, "\n## Sessions"), /create-didactics|create-session|create-mini-course/);
  });
  // Without README.md the material of unit 1 is missing.
  inMiniProject(miniUnitSave(miniInitJournal()), {}, ({ derive, validate }) => {
    derive();
    const run = validate();
    assert.match(run.stdout + run.stderr, /unit 1: "Material ✅" but the material document is missing \(README\.md\)/);
  });
});

test("validate-journal: a light track's Dashboard has exactly the steps of its track", () => {
  inMiniProject(miniInitJournal({ steps: stepsOf("full") }), {}, ({ derive, validate }) => {
    derive();
    const run = validate();
    assert.equal(run.status, 2, run.stdout + run.stderr);
    assert.match(run.stdout + run.stderr, /process\.steps has 8 steps, the mini track has 4 \(frame, material, check, publish\)/);
  });
});

// ---- Final review fixes of stage 1 (leichte Straenge) ----

// The mini → full switch (tasks/activate-section.md → Track switch): the Track line, the markers of the mini track
// go (each section gets its empty-template content back) – and README.md is restructured in place: the `#` title
// stays, `## {unit 1 title}` is inserted before the first slide, the former `##` slides become `###`.
function switchToFull(text) {
  const template = readFileSync(fileURLToPath(new URL("../templates/journal.md", import.meta.url)), "utf8");
  let result = text.replace(/^(\s*\d+\.\s*Track:\s*)mini\b/m, "$1full");
  for (const key of laterOf("mini")) {
    const pattern = key === "Learner Personas" ? /(### Learner Personas[^\n]*\n)([\s\S]*?)(?=\n---)/ : new RegExp(`(## ${key}[^\\n]*\\n)([\\s\\S]*?)(?=\\n---\\n\\n## |(?![\\s\\S]))`);
    const body = template.match(pattern)[2];
    result = result.replace(pattern, (_, head) => `${head}${body}`);
  }
  // The overview's step list follows the new track (tasks/update-dashboard.md → Process steps per track).
  const titles = { frame: "Frame", outline: "Outline and learning objectives", didactics: "Didactics", blocks: "Building blocks", agenda: "Agenda", material: "Material", check: "Check", publish: "Publish" };
  const states = { frame: "done", outline: "done", didactics: "current", agenda: "optional", publish: "optional" };
  const data = dashboardOf(result);
  data.process.steps = stepsOf("full").map(key => ({ title: titles[key], state: states[key] ?? "planned", why: "Why." }));
  data.next = { title: "Didactics", why: "The course grows into several lessons.", label: "Create didactics", href: "agent:teaching/create-didactics", command: ":create-didactics", icon: "▶️" };
  return result.replace(/```json @Dashboard\.View\n[\s\S]*?\n```/, dashJson(data));
}
const restructureReadme = (readme, unitTitle) => {
  const shifted = readme.replace(/^(#{2,5}) /gm, "#$1 ");
  const first = shifted.search(/^### /m);
  return `${shifted.slice(0, first)}## ${unitTitle}\n\n${shifted.slice(first)}`;
};

test("mini → full switch: README.md is restructured into the chapter of unit 1, else unit 1's material is missing", () => {
  inMiniProject(miniUnitSave(miniInitJournal()), { "README.md": miniReadme }, ({ derive, validate }) => {
    derive();
    const before = validate();
    assert.equal(before.status, 0, before.stdout + before.stderr);
  });
  // Without restructuring: the full track looks for the `##` chapter of unit 1 and finds only slides.
  inMiniProject(switchToFull(miniUnitSave(miniInitJournal())), { "README.md": miniReadme }, ({ derive, validate }) => {
    derive();
    const run = validate();
    assert.equal(run.status, 2, run.stdout + run.stderr);
    assert.match(run.stdout + run.stderr, /unit 1: "Material ✅" but the material document is missing \(README\.md\)/);
  });
  // With the restructured README (one confirmed material write in the same confirmation) it is clean again.
  // The unit title equals the course title here: the chapter keeps it, with the prefix of data/file-structure-modes.md.
  const restructured = restructureReadme(miniReadme, "Lesson: Reading a timetable");
  assert.match(restructured, /^# Reading a timetable\n[\s\S]*^## Lesson: Reading a timetable\n\n### What a timetable shows\n[\s\S]*^### Finding a departure$/m);
  inMiniProject(switchToFull(miniUnitSave(miniInitJournal())), { "README.md": restructured }, ({ derive, validate, read }) => {
    const derived = derive();
    assert.equal(derived.status, 0, derived.stdout + derived.stderr);
    const run = validate();
    assert.equal(run.status, 0, run.stdout + run.stderr);
    const data = dashboardOf(read());
    assert.equal(data.process.later, undefined, "the full track marks nothing");
  });
});

test("validate-journal warns when a journal is on a track whose command is not available yet (stage 1: convert, template)", () => {
  inMiniProject(miniInitJournal().replace(/^(\s*\d+\.\s*Track:\s*)mini\b/m, "$1convert"), {}, ({ validate }) => {
    const run = validate();
    assert.match(run.stdout, /Warnings:[\s\S]*Track: convert[^\n]*not available yet[^\n]*:convert-course/);
  });
  inMiniProject(miniInitJournal(), {}, ({ validate }) => assert.doesNotMatch(validate().stdout, /not available yet/));
});

test("light track: a done unit needs a passed course check before publishing (one unit, one run)", () => {
  const base = { track: "mini", filled: { "Course Context": true, Outline: true }, templates: { selection: "open", adopted: [], briefs: [] }, published: false };
  const unit = facts(1, { heading: { title: "A" }, material: true, done: true, approved: true, report: { result: "PASS", changedSince: 0 } });
  const done = new Map([["1", "done"]]);
  assert.equal(courseNext({ ...base, units: [unit], validation: { mode: "course", result: "FAIL" }, delivery: "link" }, done).key, "check-course");
  assert.equal(courseNext({ ...base, units: [unit], validation: { mode: null, result: null }, delivery: null }, done).key, "check-course");
  assert.equal(courseNext({ ...base, units: [unit], validation: { mode: "course", result: "PASS" }, delivery: "link" }, done).key, "publish");
  assert.equal(courseNext({ ...base, units: [unit], validation: { mode: "course", result: "PASS" }, delivery: null }, done), null);
});

test("derive: the Learner Personas entry of process.later carries the translated suffix of its ### heading", () => {
  const source = miniSource().replace("## Agenda – Schedule\n\n", `## Agents – Agenten\n\n### Learner Personas – Lernendenprofile\n\n${laterMarker}\n_x_\n\n## Agenda – Schedule\n\n`);
  const process = { steps: ["Frame", "Write", "Check", "Publish"].map(title => ({ title, state: "planned" })) };
  const journal = readJournal(source);
  assert.deepEqual(journal.later, ["Learner Personas"]);
  assert.deepEqual(derive(journal, { ...deriveData(), process }).data.process.later.map(item => item.label), ["Lernendenprofile"]);
});

test("Analysis Status stays marked on a light track but is no entry of process.later, and validate-journal accepts that", () => {
  const source = miniSource().replace("## Agenda – Schedule\n\n", `## Analysis Status – Analyse\n\n${laterMarker}\n_x_\n\n## Agenda – Schedule\n\n${laterMarker}\n`);
  const journal = readJournal(source);
  assert.ok(journal.later.includes("Analysis Status"));
  const process = { steps: ["Frame", "Write", "Check", "Publish"].map(title => ({ title, state: "planned" })) };
  assert.deepEqual(derive(journal, { ...deriveData(), process }).data.process.later.map(item => item.command), [":activate-section agenda"]);
  inMiniProject(miniInitJournal(), {}, ({ derive: write, validate, read }) => {
    write();
    const run = validate();
    assert.equal(run.status, 0, run.stdout + run.stderr);
    assert.ok(!dashboardOf(read()).process.later.some(item => item.command === ":activate-section analysis-status"));
  });
});
