# Leichte Stränge – Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Drei leichte Stränge (Mini-Kurs, Umwandeln, Template) mit Abschnittszustand `later` („bei Bedarf“) im selben Journal, plus Chat-Gedächtnis beim Neustart.

**Architecture:** Eine neue Datei `specs/dashboard/tracks.mjs` ist die einzige Quelle für Strang-IDs, Prozessschritte je Strang und `later`-Abschnitte je Strang. `journal-model.mjs` liest Strang und `later`-Vermerke, `actions.mjs`/`derive-dashboard.mjs` leiten `next` und Schritte je Strang ab, `validate-journal.mjs` prüft die Vermerke. Danach folgen die Spec-Texte (Aufgaben, Agenten, Regelblätter), abgesichert durch `check-specs.mjs`.

**Tech Stack:** Node.js ESM, `node:test`, Markdown-/YAML-Specs.

**Spec:** `docs/superpowers/specs/2026-11-11-leichte-straenge-design.md`

## Etappen

Umsetzung in drei Etappen (Entscheidung der Lehrkraft, 2026-11-11):
- **Etappe 1:** Tasks 1–7 (Skripte für alle vier Stränge, Strangwahl, Aktivieren, Chat-Gedächtnis, Mini-Kurs). In `init-course` werden „Umwandeln“ und „Template“ in Etappe 1 **noch nicht angeboten**. Danach Tandem-Test.
- **Etappe 2:** Task 8 (Umwandeln) + Freischalten in `init-course`.
- **Etappe 3:** Task 9 (Template) – vorher neu entscheiden: oberflächliches Journal oder gar keines.
- Task 10 läuft am Ende jeder Etappe für deren Stränge.

## Global Constraints

- Arbeit auf einem Branch `feature/leichte-straenge` (nicht auf `main`).
- Spec-Texte in `specs/` sind Englisch (wie alle bestehenden Aufgaben); sichtbare Texte für Lehrkräfte kommen aus den Sprachpaketen (`specs/templates/i18n/de.json`) bzw. `englishTerms`/`englishActions`.
- Keine Persona-/Testdaten (Bienen, Klasse 3, Sabine, Jonas …) in `specs/` – `node --test specs/check-specs.mjs` wacht darüber.
- Alte Journale ohne Strang-Feld verhalten sich exakt wie heute (`track = "full"`); alle bestehenden Tests in `specs/dashboard/check.mjs` bleiben grün.
- Vermerk-Syntax (genau so): eine Zeile `<!-- state: later -->` als erste nicht-leere Zeile unter der Abschnittsüberschrift.
- Strang-Feld im `## Course Context` (technischer Block):
  ```
  * __Track:__
    1. Track: [full | mini | convert | template]
    2. Convert mode: [transfer | rebuild | n/a]
    3. Source: [file path in the project or URL | n/a]
  ```
- Speichermarke im Chat (genau so): `<!-- saved: {what} -->` am Ende jeder Chat-Nachricht, die eine Speicherung bestätigt; `{what}` = Abschnitt(e) oder Datei(en), z. B. `<!-- saved: Course Context, Outline -->`.
- Deutsches Wort für `later`: „Bei Bedarf“; englisch „When needed“. Der Zustand `optional` heißt auf Deutsch künftig „Optional“ (heute „Bei Bedarf“ in `dashboard.js`).
- Neue Befehle: Teaching `:activate-section {section}`, `:create-mini-course`, `:convert-course`; Development `:start-template`.
- Shell-Regeln aus `CLAUDE.md` gelten weiter; neue erlaubte Befehle nur die in Task 9 genannten.

## Review Focus

1. **Altes Journal mitten im vollen Weg** (kein `__Track:__`, Agenda vorhanden, Units in Arbeit): `next`, Schritte, Zählung exakt wie vorher → Test in Task 2 (`full track unchanged`) mit dem Fixture `fixtures/journal-84484ae.md`.
2. **Halb aktivierter Abschnitt** (Vermerk steht noch, darunter aber Inhalt): Prüfer meldet es, Übersicht zählt ihn nicht doppelt → Test in Task 4.
3. **Vermerk mit Leerzeilen/übersetzter Überschrift** (`## Didactics – Didaktik` + Leerzeile + Vermerk): wird erkannt → Test in Task 1.
4. **Template-Strang nach Veröffentlichung** (`## Publishing` → `published`): `next` ist `null`, keine Schleife zurück zu `develop-template` → Test in Task 2.
5. **Neustart mit leerem oder ganz neuem Chat** (kein `saved`-Marker in den letzten 50 Einträgen): der Agent liest höchstens 50 Einträge und erfindet keine Speicherung → Spec-Satz + Guard in Task 6.

---

## Phase A – Skripte

### Task 1: `tracks.mjs` und Lesen von Strang und Vermerken

**Files:**
- Create: `specs/dashboard/tracks.mjs`
- Modify: `specs/dashboard/journal-model.mjs` (`readJournal`, ca. Z. 66–112)
- Test: `specs/dashboard/check.mjs` (neue Tests am Ende)

**Interfaces:**
- Produces (`tracks.mjs`):
  - `export const trackIds = ["full", "mini", "convert", "template"]`
  - `export const laterMarker = "<!-- state: later -->"`
  - `export function stepsOf(track = "full", mode = null): string[]` – Schrittschlüssel:
    - `full`: `["frame","outline","didactics","blocks","agenda","material","check","publish"]` (Reihenfolge = heutige Indizes 0–7)
    - `mini`: `["frame","material","check","publish"]`
    - `convert`: `["frame","outline","look","material","check","publish"]`; bei `mode === "transfer"` ohne `"outline"`
    - `template`: `["brief","build","try","publish"]`
  - `export function laterOf(track = "full", mode = null): string[]` – Abschnittsschlüssel, die der Strang beim Einrichten auf `later` setzt:
    - `full`: `[]`
    - `mini`: `["Didactics","Visual Identity","Templates","Agenda","Learner Personas","Analysis Status"]`
    - `convert`/`transfer`: `["Outline","Didactics","Templates","Agenda","Learner Personas","Analysis Status"]`
    - `convert`/`rebuild`: `["Didactics","Templates","Agenda","Learner Personas","Analysis Status"]`
    - `template`: `["Outline","Didactics","Visual Identity","Agenda","Sessions","Learner Personas","Validation","Analysis Status"]`
  - `export function isLater(body: string): boolean` – erste nicht-leere Zeile von `body` ist `laterMarker`.
  - `export const sectionSlug = key => key.toLowerCase().replace(/\s+/g, "-")` (`"Learner Personas"` → `"learner-personas"`).
- Produces (`readJournal`-Ergebnis, zusätzlich): `track: string` (Standard `"full"`), `convertMode: "transfer"|"rebuild"|null`, `source: string|null`, `later: string[]` (Schlüssel aller `##`-Abschnitte und von `### Learner Personas` unter `## Agents` mit Vermerk). `filled[key]` ist `false` für `later`-Abschnitte.

- [ ] **Step 1: Write the failing tests**

```js
import { stepsOf, laterOf, isLater, laterMarker, sectionSlug } from "./tracks.mjs";
test("tracks: steps and later sections per track", () => {
  assert.deepEqual(stepsOf("full"), ["frame","outline","didactics","blocks","agenda","material","check","publish"]);
  assert.deepEqual(stepsOf("convert", "transfer"), ["frame","look","material","check","publish"]);
  assert.deepEqual(stepsOf("convert", "rebuild"), ["frame","outline","look","material","check","publish"]);
  assert.deepEqual(laterOf("full"), []);
  assert.ok(laterOf("template").includes("Sessions"));
  assert.ok(!laterOf("mini").includes("Sessions"), "the README is unit 1");
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
```

- [ ] **Step 2: Run** `node --test specs/dashboard/check.mjs` → die drei neuen Tests FAIL (Modul fehlt).
- [ ] **Step 3: Implement** `tracks.mjs` wie oben; in `readJournal` Track per `/^\s*\d+\.\s*Track:\s*(full|mini|convert|template)\b/m` aus `context`, Mode per `/Convert mode:\s*(transfer|rebuild)\b/`, Source per `/^\s*\d+\.\s*Source:\s*(.+)$/m` (Wert `n/a` → `null`); `later` über `section(key)` + `isLater` für jeden Heading-Key und für den `### Learner Personas`-Block in `section("Agents")`; `filled` gibt für `later` `false` zurück.
- [ ] **Step 4: Run** `node --test specs/dashboard/check.mjs` → alle Tests PASS.
- [ ] **Step 5: Commit** `git add specs/dashboard/tracks.mjs specs/dashboard/journal-model.mjs specs/dashboard/check.mjs && git commit -m "Read track and when-needed sections from the journal"`

### Task 2: `next` und Kursschritt je Strang (`actions.mjs`)

**Files:**
- Modify: `specs/dashboard/actions.mjs` (`englishActions` Z. 10–46, `courseStep` Z. 50, `courseNext` Z. 117–153, `courseStepOf` Z. 193–197; Brief-Zustand in `journal-model.mjs` → `readTemplates` unverändert, `state` wird nur neu ausgewertet)
- Test: `specs/dashboard/check.mjs`

**Interfaces:**
- Consumes: `stepsOf`, Journal-Felder `track`, `convertMode`, `later`, `delivery`, `published` aus Task 1.
- Produces:
  - neue Aktionsschlüssel in `englishActions` (mit `title`, `label`, `why`): `"write-mini-course"` → `teaching/create-mini-course`; `"convert-course"` → `teaching/convert-course`; `"start-template"` → `development/start-template`; `"publish-template"` → `development/publish-template?id={id}`; `"activate-section"` (nur `label: "Add"`, für Abschnittsvermerk und Übersicht).
  - `courseStepOf(expected, steps, { track = "full", convertMode = null } = {})` – findet den Schritt über `stepsOf(track, convertMode).indexOf(stepKey)`; `stepKey` je Aktionsschlüssel: `init-course`→`frame` (Strang `template`: `brief`), `create-outline`→`outline`, `create-didactics`→`didactics`, `suggest-templates`/`adopt-template`→`blocks`, `develop-template`→`blocks` (Strang `template`: `build`), `create-agenda`→`agenda`, `check-course`→`check`, `publish`/`publish-template`→`publish`, `start-template`→`brief`, `write-mini-course`/`convert-course`→`material`; Unit-Aktionen wie heute → `material`. Ohne dritten Parameter exakt das heutige Verhalten.

**`courseNext` je Strang** (der Zweig `full` bleibt Zeile für Zeile wie heute):
- `mini`: Kontext leer → `init-course`; Outline leer → `create-outline`; Einheit 1 ohne Material → `write-mini-course`; Einheit 1 offen (`states.get("1") !== "done"`) → `unitAction(unit1)`; `delivery` ∈ {link, platform} und nicht `published` → `publish`; sonst `null`.
- `convert`: wie `mini`, aber Outline nur bei `convertMode === "rebuild"` verlangt, und `convert-course` statt `write-mini-course`.
- `template`: Kontext leer → `init-course`; kein Brief → `start-template`; Brief-Zustand `approved` und nicht `published` → `publish-template` mit `{ id }`; `published` → `null`; jeder andere Brief-Zustand → `develop-template` mit `{ id }` (auch `ready to test`: im Template-Strang nimmt `:develop-template` die Abnahme durch die Lehrkraft wieder auf, kein `adopt-template`).

- [ ] **Step 1: Write the failing tests**

```js
test("full track unchanged: the fixture journal keeps its next and course step", () => { /* derive next for fixtures/journal-84484ae.md once without and once with track "full" explicitly; assert equal hrefs and equal courseStepOf titles */ });
test("mini track: frame → outline → write → unit actions → publish only when delivery needs it", () => {
  const base = { track: "mini", filled: { "Course Context": true, Outline: true }, units: [], templates: { selection: "open", adopted: [], briefs: [] }, validation: {}, published: false, delivery: null };
  assert.equal(courseNext({ ...base, filled: { "Course Context": false } }, new Map()).key, "init-course");
  assert.equal(courseNext(base, new Map()).key, "write-mini-course");
  const unit = facts(1, { heading: { title: "A" }, material: true, done: true, approved: true, report: { result: "PASS", changedSince: 0 } });
  assert.equal(courseNext({ ...base, units: [unit] }, new Map([["1", "done"]])), null);
  assert.equal(courseNext({ ...base, units: [unit], delivery: "link" }, new Map([["1", "done"]])).key, "publish");
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
});
```

Den ersten Test vollständig ausschreiben (Fixture lesen, `courseNext` mit `unitState`-Map wie `nextOf` in `check.mjs` Z. 2080).

- [ ] **Step 2: Run** `node --test specs/dashboard/check.mjs` → neue Tests FAIL.
- [ ] **Step 3: Implement** die Zweige in `courseNext` (früh nach `journal.track` verzweigen, `full` unverändert durchlaufen), `courseStepOf` mit drittem Parameter, neue `englishActions`.
- [ ] **Step 4: Run** → alle PASS.
- [ ] **Step 5: Commit** `"Derive next and course step per track"`

### Task 3: Übersicht ableiten und anzeigen (`derive-dashboard.mjs`, `dashboard.js`)

**Files:**
- Modify: `specs/dashboard/derive-dashboard.mjs` (Kursschritte `courseSteps[3]`, `[6]`, `[7]` ca. Z. 223–260; Aufrufe von `courseStepOf`)
- Modify: `specs/dashboard/dashboard.js` (Z. 7 Symbole, Z. 12/60 Zustandswörter, Z. 396 `counted`, Prozess-Rendering)
- Modify: `specs/dashboard/dashboard.css` (Stil der Zeile „Bei Bedarf“)
- Test: `specs/dashboard/check.mjs`

**Interfaces:**
- Consumes: `stepsOf`, `sectionSlug`, `journal.later`, `courseStepOf(…, { track, convertMode })`.
- Produces: Dashboard-Feld `process.later: [{ label: string, href: string }]` – je `later`-Abschnitt: `label` = übersetzte Überschriftsendung (`heading.suffix`) oder Schlüssel, `href` = `agent:teaching/activate-section?section={sectionSlug(key)}`. Fehlt bei leerem `journal.later` (Feld entfernen).

- [ ] **Step 1: Write the failing tests**

```js
test("derive: when-needed sections become process.later with activate links; the full track has none", () => {
  // journal source with track mini and later markers on Didactics and Agenda → derive(...)
  // assert.deepEqual(data.process.later.map(item => item.href), ["agent:teaching/activate-section?section=didactics", "agent:teaching/activate-section?section=agenda"])
  // same journal without markers → data.process.later === undefined
});
test("derive: the index rules (blocks, course check, publish) find their step by key, not by position", () => {
  // track mini, delivery link, process.steps = 4 steps, publish step state "optional" → publish step becomes "planned" with publishNeeded label
});
test("view: process.later shows as one collapsed 'When needed' line and is not counted", () => {
  const model = dashboard.buildModel({ title: "T", process: { steps: [{ title: "A", state: "done" }, { title: "B", state: "planned" }], later: [{ label: "Didaktik", href: "agent:teaching/activate-section?section=didactics" }] } });
  // assert step total 2; rendered HTML contains a <details> with "When needed" and the link label "Didaktik"
});
test("view: German state words – optional is 'Optional', later is 'Bei Bedarf'", () => { /* assert on the German strings table */ });
```

Die Kommentarzeilen in vollständige Tests umsetzen (Journal-Hilfen wie `deriveJournal` Z. 1751 / `deriveData` Z. 1863 nutzen).

- [ ] **Step 2: Run** → FAIL.
- [ ] **Step 3: Implement**: in `derive` `const keys = stepsOf(journal.track, journal.convertMode); const stepFor = key => courseSteps[keys.indexOf(key)]` und `blocksStep`/`checkCourseStep`/`publishStep` darüber holen; `courseStepOf`-Aufrufe mit `{ track, convertMode }`; `process.later` setzen/entfernen über `set(...)` mit Begründung „sections marked when needed“. In `dashboard.js`: `state.optional` DE → „Optional“, neue Zeichenkette `process.later` DE „Bei Bedarf“ / EN „When needed“; `process.later` als `<details>` unter den Schritten, Einträge als Links.
- [ ] **Step 4: Run** → PASS (alle alten Tests ebenfalls).
- [ ] **Step 5: Commit** `"Show when-needed sections in the overview and find course steps by key"`

### Task 4: Prüfen und Sprachpaket (`validate-journal.mjs`, i18n, Dashboard-Vorlage)

**Files:**
- Modify: `specs/dashboard/validate-journal.mjs`
- Modify: `specs/dashboard/journal-model.mjs` (`englishTerms`: `laterNote`)
- Modify: `specs/templates/i18n/de.json` (`terms.laterNote`, `actions` für die fünf neuen Schlüssel aus Task 2)
- Modify: `specs/templates/project-dashboard.yaml` (`process.later`, Schrittlisten je Strang als Verweis auf `tracks.mjs`)
- Test: `specs/dashboard/check.mjs`

**Interfaces:**
- Produces: `englishTerms.laterNote = "When needed – not needed for this course yet."`; `de.json` `terms.laterNote = "Bei Bedarf – für diesen Kurs noch nicht nötig."`; deutsche `actions`-Wörter: `write-mini-course` „Kurs schreiben“, `convert-course` „Umwandeln starten“, `start-template` „Baustein beginnen“, `publish-template` „Baustein veröffentlichen“, `activate-section` „hinzunehmen“ (je mit `title`/`why` im Stil der vorhandenen Einträge; „Baustein“, nie „Vorlage“ – Regel aus `update-dashboard.md`).

Neue Prüfregeln in `validate-journal.mjs`:
1. Ein `later`-Abschnitt hat außer Vermerk, einer kursiven Notizzeile und einer Aktionszeile weiteren Inhalt → Problem „`## {key}` is marked when needed but has content – remove the marker (`:activate-section {slug}`) or the content“.
2. `Track:` hat einen Wert außerhalb `trackIds` → Problem.
3. `later`-Abschnitte lösen keine der heutigen „leer“/„fehlt“-Meldungen aus (bestehende Regeln für Sessions-Notiz, Agenda-Zeilen usw. überspringen `later`).
4. `process.later` im Dashboard passt nicht zu `journal.later` → Problem mit Hinweis auf `derive-dashboard.mjs --write`.

- [ ] **Step 1: Write the failing tests** – je Regel ein Test, der `validate-journal.mjs` auf einer temporären Journal-Datei ausführt (Muster: bestehende Tests mit `spawnSync` + `mkdtempSync` in `check.mjs`) und die Meldung per `assert.match` prüft; dazu ein Test „mini-track journal with markers on all `laterOf("mini")` sections validates clean“.
- [ ] **Step 2: Run** → FAIL.
- [ ] **Step 3: Implement** die vier Regeln und die Sprachpaket-Einträge.
- [ ] **Step 4: Run** `node --test specs/dashboard/check.mjs` → PASS.
- [ ] **Step 5: Commit** `"Validate when-needed sections and add their words"`

---

## Phase B – Spec-Texte

Für jede Aufgabe gilt: erst die Guard-Sätze in `specs/check-specs.mjs` (Tabelle „File → sentences that must stay“, Z. 15 ff.) eintragen, `node --test specs/check-specs.mjs` → FAIL, dann die Specs schreiben → PASS, dann committen. Die Guard-Sätze sind je Task angegeben; sie müssen wörtlich im Spec-Text stehen.

### Task 5: Strangwahl, Vermerke, Aktivieren

**Files:**
- Modify: `specs/tasks/init-course.md`, `specs/templates/course-context.yaml`, `specs/agents/teaching-agent.yaml`, `CLAUDE.md`, `specs/data/file-structure-modes.md`
- Create: `specs/tasks/activate-section.md`
- Test: `specs/check-specs.mjs`

**Inhalt:**
- `course-context.yaml`: neuer Abschnitt `id: track` mit dem Block aus Global Constraints; `Type`-Liste ohne `single-lesson` für neue Kurse (Kommentar: „older journals may still say single-lesson; they stay valid“).
- **Etappe 1:** Nur die Zweige `full`, `mini` und `improve-existing` werden angeboten; `convert` und `template` stehen im Text als „added in a later stage – not offered yet“ und erscheinen nicht im Formular.
- `init-course.md`, neuer erster Schritt (vor 3a): Formular „What are you planning?“ mit den Optionen aus Spec §4 in Lehrkraft-Sprache; Vorschlag statt Frage, wenn der Chat es schon sagt. Danach je Strang:
  - `full`: weiter wie heute, 3a ohne Option „single lesson“ (Mapping-Tabelle Z. 52–59 anpassen: Option 1 entfällt).
  - `improve-existing`: wie heute.
  - `mini`: eine bis zwei Runden (Thema, Lernende, Umfang, 1–3 Lernziele – vage Ziele hinterfragen); Speichern in **einer** Bestätigung: kurzer Kurskontext (`Mode: single-file`, `sessions-called` wie bei einer Stunde), kurze `## Outline` (Lernziele + Folienliste, je ein Satz), Strang-Feld, Vermerke für `laterOf("mini")`.
  - `convert`: Quelle (Datei im Projekt oder URL) erfragen, sichten (Zusammenfassung in 2–3 Sätzen), Rechtefrage, Weg (transfer/rebuild) als Formular; Speichern in einer Bestätigung: Kurskontext mit Strang-Feld inkl. Mode und Source, bei rebuild die Gliederung, Vermerke für `laterOf("convert", mode)`.
  - `template`: verkürzter Stand (Sprache/Sprachpaket, `language:`-Kopf, Strang-Feld, ein Satz Zweck), Vermerke für `laterOf("template")`, dann `agent:development/switch` mit `:start-template` als nächstem Schritt.
  - Vermerk-Form je Abschnitt: Vermerkzeile, darunter `_{laterNote}_` und die Aktionszeile `[➕ {activate-section label}](agent:teaching/activate-section?section={slug}) \`:activate-section {slug}\``; der bisherige Inhalt des Abschnitts (Notiz + Aktionszeile der leeren Vorlage) wird dabei ersetzt, die Überschrift bleibt.
- `activate-section.md`: Parameter `section` (Slug aus `sectionSlug`); entfernt Vermerk + Notiz + Aktionszeile, setzt den Abschnittsinhalt der leeren Vorlage `specs/templates/journal.md` ein (Bestätigungsstufe „confirm in chat“), schreibt die Übersicht über `derive-dashboard.mjs --write`, bietet dann die passende Aufgabe an (Outline → `:create-outline`, Didactics → `:create-didactics`, Visual Identity → `agent:artist/switch`, Templates → `:suggest-templates`, Agenda → `:create-agenda`, Sessions → `:create-session`, Learner Personas → `:create-learner-persona`, Validation → `:validate-course`). Strangwechsel (z. B. mini → full): Strang-Feld ändern und Vermerke des neuen Strangs setzen/entfernen in einer bestätigten Änderung; nie Inhalt löschen. Wann der Agent von selbst anbietet: Mini/Convert mit mehr als etwa sechs Folien oder einem zweiten Thema.
- `teaching-agent.yaml`: Befehle `:activate-section {section}`, `:create-mini-course`, `:convert-course` (die Aufgaben folgen in Task 7/8); Regel „never read a section marked when needed; a task input that is marked counts as empty – offer `:activate-section` instead of asking for its content“.
- `CLAUDE.md`: Befehlstabelle um die drei Befehle; On Activation Schritt 6: „skip sections whose first line is `<!-- state: later -->`“.
- `file-structure-modes.md`: Mini/Convert sind `single-file` mit genau Einheit 1.

**Guard-Sätze (`check-specs.mjs`):**
- `tasks/init-course.md`: `"What are you planning?"`, `"one confirmation"`, `"<!-- state: later -->"`
- `tasks/activate-section.md`: `"never delete content"`
- `agents/teaching-agent.yaml`: `"never read a section marked when needed"`
- Neuer Test: keine Aufgabe, die nur in einem leichten Strang läuft (`create-mini-course.md`, `convert-course.md`, `start-template.md`), nennt in ihren `## Inputs` einen Abschnitt `## {key}`, der für ihren Strang in `laterOf(...)` steht (Import aus `specs/dashboard/tracks.mjs`; Zuordnung Aufgabe → Strang als Map im Test). Läuft ab Task 9 gegen alle drei Dateien; bis dahin überspringt er fehlende Dateien.

- [ ] Steps: Guards → FAIL → Specs schreiben → `node --test specs/check-specs.mjs` PASS → Commit `"Ask for the track first and let sections wait until needed"`

### Task 6: Chat als Gedächtnis

**Files:**
- Modify: `specs/data/agent-links.md` (Abschnitt „On start and after a gap“, Z. 231 ff.), `specs/data/chat-dialog.md` (Speicherbestätigung), `specs/agents/teaching-agent.yaml` (Startreihenfolge Z. 120), `specs/tasks/start.md`, `specs/tasks/open-chat.md`
- Test: `specs/check-specs.mjs`

**Inhalt** (Spec §6 wörtlich umsetzen):
- `agent-links.md`: beim Start und nach einer Pause `read_chat` mit Standard (`last` weglassen = 50 Einträge); maßgeblich ist der jüngste Eintrag mit `<!-- saved: … -->`; danach Liegendes ist der ungespeicherte Stand. Bild machen (Thema, gespeichert, ungespeichert, offene Frage); ein Satz Anknüpfen statt Begrüßung, wenn die Begrüßungsregel greift; Ungespeichertes nur anbieten; Journal gilt bei Widerspruch – Unterschied nennen und fragen; ohne `saved`-Marker in den 50 Einträgen: nichts als gespeichert annehmen, nur das Journal zählt; Formulare vor dem Neustart sind geschlossen – neu fragen.
- `chat-dialog.md`: jede Nachricht, die eine Speicherung bestätigt, endet mit `<!-- saved: {what} -->` (Global Constraints); nie in Nachrichten ohne Speicherung.
- `teaching-agent.yaml` Startreihenfolge Schritt (5): `read_chat` nennt jetzt auch das Anknüpfen; `start.md` / `open-chat.md`: Verweis auf die Regel.

**Guard-Sätze:**
- `data/agent-links.md`: `"the newest entry with <!-- saved:"`, `"offer to save, never write it silently"`, `"the journal wins"`
- `data/chat-dialog.md`: `"ends with <!-- saved: {what} -->"`

- [ ] Steps: Guards → FAIL → Specs → PASS → Commit `"Pick up the chat after a restart"`

### Task 7: Mini-Kurs (`:create-mini-course`) und Einzel-Einheit-Prüfung

**Files:**
- Create: `specs/tasks/create-mini-course.md`
- Modify: `specs/tasks/validate-course.md` (Session-Modus), `specs/tasks/update-dashboard.md` (Schritte je Strang), `specs/agents/teaching-agent.yaml` (Befehl verweist auf Datei)
- Test: `specs/check-specs.mjs`

**Inhalt `create-mini-course.md`:**
- Inputs: `## Course Context`, `## Outline` (kurz), Regelblätter wie `coauthor-materials.md`; **nicht** Didactics/Agenda/Templates.
- Schritte: Einheit 1 in `## Sessions` anlegen (Überschrift `### 1. {title}`, Tabellenzeile, Statuszeile in der Form von `create-session-skeleton.md`, ohne Planungsskizzen-Felder außer Titel und Ziel); `README.md` schreiben (Übersicht, Folien aus der Gliederung, Quizze je Lernziel) im Dialogstil von `:coauthor-materials` mit einer Speicherbestätigung; `node specs/dashboard/check-material.mjs README.md`; dann `:validate-course 1`; Angebot `:try-as-learner 1`; Wachstumsangebot (Task 5).
- `validate-course.md`: hat das Journal genau eine Einheit und Strang `mini` oder `convert`, schreibt `:validate-course 1` zusätzlich `### Latest Validation Summary` mit `Mode: course` (ein Durchgang deckt beides).
- `update-dashboard.md`: Prozessschritte je Strang = `stepsOf(track, mode)` aus `tracks.mjs` mit übersetzten Titeln (Titelvorschläge: frame „Rahmen & Lernziele“, material „Material schreiben“, check „Prüfen“, publish „Veröffentlichen“, look „Aussehen“, brief „Anliegen & Brief“, build „Bauen & testen“, try „Ausprobieren & freigeben“); `process.later` wird abgeleitet, nie selbst geschrieben; die Regel „keep the global process steps stable“ gilt pro Strang, ein Strangwechsel ändert die Schrittzahl mit `note`.

**Guard-Sätze:**
- `tasks/create-mini-course.md`: `"1–3 learning objectives"`, `"unit 1"`
- `tasks/validate-course.md`: `"exactly one unit"`
- `tasks/update-dashboard.md`: `"stepsOf(track, mode)"`, `"process.later is derived"`

- [ ] Steps: Guards → FAIL → Specs → PASS → Commit `"Add the mini course"`

### Task 8: Umwandeln (`:convert-course`)

**Files:**
- Create: `specs/tasks/convert-course.md`
- Modify: `specs/agents/teaching-agent.yaml` (Ausnahme-Regel wie bei `build-session`: darf Artist- und Learner-Prozeduren als Unterschritte ausführen), `CLAUDE.md` (Agent Coordination → Exception um `:convert-course` ergänzen)
- Test: `specs/check-specs.mjs`

**Inhalt** (Spec §7.2 Schritte 5–8, „am Stück“):
- Start: eine Bestätigung im Chat, die alle Schreibvorgänge des Durchgangs abdeckt (Muster: `build-session.md` → start confirmation); Git/Veröffentlichen/externe Browser bleiben außerhalb.
- Unterschritte: (a) Artist – Aussehen aus der Quelle in `## Visual Identity` (Skill `liascript-theming` wenn installiert, sonst ohne), einmalige Rückfrage nur wenn Farben/Schriften nicht erkennbar; Bilder über `create-image`; (b) Teaching – Einheit 1 anlegen wie in Task 7, `README.md` schreiben, Modus transfer (Reihenfolge bleibt, Quiz aus vorhandenen Fragen, Aufklappen statt Lösungsfolie, Animation statt Folienaufbau, Narrator aus Sprechernotizen) oder rebuild (nach `## Outline`); Bedarf an Interaktion ohne Baustein → `:suggest-templates` anbieten (aktiviert `## Templates`); (c) Prüfen: `check-material.mjs` + `:validate-course 1`; (d) Learner – `review-as-persona` mit der im Kurskontext beschriebenen Zielgruppe (ohne gespeicherte Persona) oder Angebot `:try-as-learner 1`.
- **Loop:** „Repeat steps c–d until the check passes, or after 3 iterations — whichever comes first. On hitting the cap without meeting the condition: stop and report the remaining points to the instructor instead of continuing.“ (Iteration Pattern aus `CLAUDE.md`).
- Quellen lesen: PDF über das Lese-Werkzeug (Seiten), URL über das Web-Werkzeug; `.pptx`: über den Skill `pptx`, falls verfügbar, sonst die Lehrkraft bitten, die Folien als PDF zu exportieren (kein neues Shell-Skript).
- Abschluss: Zusammenfassung + 1–3 nächste Links (`:quick-fix 1`, `:try-as-learner 1`, ggf. Veröffentlichen).

**Guard-Sätze:**
- `tasks/convert-course.md`: `"one start confirmation"`, `"or after 3 iterations"`, `"export the slides as PDF"`, `"Does the instructor have the right to use this source"` (Rechtefrage steht in `init-course`, die Aufgabe prüft, dass sie im Kurskontext beantwortet ist)

- [ ] Steps: Guards → FAIL → Specs → PASS → Commit `"Add the convert run"`

### Task 9: Template-Strang (`:start-template`)

**Files:**
- Create: `specs/tasks/start-template.md`
- Modify: `specs/tasks/develop-template.md`, `specs/tasks/publish-template.md`, `specs/agents/development-agent.yaml`, `CLAUDE.md` (Befehlstabelle, erlaubte Befehle), `specs/templates/course-templates.yaml` (Brief-Zustand `approved`)
- Test: `specs/check-specs.mjs`, `specs/dashboard/check.mjs` (Brief-Zustand `approved` in `validate-journal.mjs` erlaubt)

**Inhalt:**
- `start-template.md` (Development-Agent): Skill-Check `liascript-templates` wie `develop-template.md` Schritt 0; Fragen: neu oder anpassen; bei anpassen: Katalog-Template (Suche `node specs/catalog/search.mjs <query>`) → Fork, oder eigenes GitHub-Repo → Klon; Zweck, Zielgruppe, ein Beispiel. Schreibt den Brief `### {id} (in development)` in `## Templates` mit `__State:__ brief` (Format `course-templates.yaml`), eine Bestätigung im Chat. Fork/Klon: im Terminal bestätigt, nach `lia-templates/{id}/`. Dann `:develop-template {id}`.
- `develop-template.md`: Schritt 1 akzeptiert im Strang `template` einen vom Development-Agenten geschriebenen Brief; bei einem Fork/Klon ist `lia-templates/{id}/` schon vorhanden – anpassen statt neu anlegen; Ende im Strang `template`: Lehrkraft probiert die Template-README in der Vorschau, Freigabe im Chat setzt `__State:__ approved` (statt Übergabe an `:manage-templates`).
- `publish-template.md`: im Strang `template` entfällt das Umstellen der Kurs-Imports; bei einem Fork optional Pull Request ans Original (`gh pr create`), im Terminal bestätigt. Am Ende setzt es im Strang `template` `## Publishing` → `__State:__ published` (davon hängt `courseNext` → `null` aus Task 2 ab).
- `scaffold-course.md` bleibt beim vollen Weg; es schreibt kein Strang-Feld (fehlend = `full`).
- `CLAUDE.md` erlaubte Befehle ergänzen: `gh repo fork <owner/repo> --clone=false` und `git clone <url> lia-templates/{id}` – nur in `:start-template`, im Terminal bestätigt.
- `development-agent.yaml`: Befehl `:start-template`; Schreibbereich um den eigenen Brief in `## Templates` erweitert (nur im Strang `template`).

**Guard-Sätze:**
- `tasks/start-template.md`: `"fork"`, `"clone"`, `"__State:__ brief"`
- `tasks/develop-template.md`: `"__State:__ approved"`
- `tasks/publish-template.md`: `"the course imports stay untouched"`
- Der Inputs-Test aus Task 5 läuft jetzt gegen alle drei Strangaufgaben.

- [ ] Steps: Guards → FAIL → Specs → PASS (beide Testdateien) → Commit `"Add the template track"`

### Task 10: Gesamtprüfung

- [ ] `node --test specs/dashboard/check.mjs` → PASS
- [ ] `node --test specs/check-specs.mjs` (im Repo-Root) → PASS
- [ ] Drei Beispiel-Journale (mini, convert/transfer, template) aus `specs/templates/journal.md` von Hand nach den neuen Regeln einrichten, je `node specs/dashboard/validate-journal.mjs <datei>` und `node specs/dashboard/derive-dashboard.mjs --check <datei>` → keine Meldungen; als Fixtures unter `specs/dashboard/fixtures/` ablegen und einen Test in `check.mjs` ergänzen, der alle drei validiert.
- [ ] Commit `"Add track fixtures"`
- [ ] Tandem-Test in einem neuen Testordner (Aufbau wie test4) – eigene Absprache mit dem Entwickler, nicht Teil dieses Plans.
