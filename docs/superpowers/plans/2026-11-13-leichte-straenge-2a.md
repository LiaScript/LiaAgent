# Leichte Stränge, Etappe 2a – Gemeinsame Bausteine + Gestaltung – Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ein fünfter Strang `design` (Aussehen und/oder Bilder eines vorhandenen LiaScript-Kurses, Lehrtext unverändert) auf neuen gemeinsamen Bausteinen (`read-source.mjs`, Visual Identity aus dem Kurs, `:apply-theme`, `:review-images`, Kontrastprüfung). Davor zwei Vorarbeiten aus Tandem-Test 5: eine kleinere Startlektüre und Modelltests für den Strangwechsel.

**Architecture:** Wie in Etappe 1 ist `specs/dashboard/tracks.mjs` die einzige Quelle für Strang-IDs, Schritte und `later`-Abschnitte. `journal-model.mjs` liest dazu Umfang, Kursdatei je Einheit, Theme-Stand und Bildbestand. `actions.mjs`/`derive-dashboard.mjs` leiten `next` ab, `validate-journal.mjs` prüft. Die Bausteine sind ein neues Projektskript (`read-source.mjs`), eine Erweiterung von `check-material.mjs` (Kontrast) und zwei neue Artist-Aufgaben. Danach folgen die Spec-Texte, jeweils abgesichert durch Wächtersätze in `check-specs.mjs`.

**Tech Stack:** Node.js ESM (nur Bordmittel: `node:zlib`, `fetch`), `node:test`, Markdown-/YAML-Specs, `specs/build.py` (erzeugt `CLAUDE.md`, `AGENTS.md` u. a.).

**Spec:** `docs/superpowers/specs/2026-11-11-leichte-straenge-design.md` (Abschnitte 4, 7.4, 7.5, 8–12; Stand c01b0b5). Befunde: `test5/feedback/runde-06-jonas.md` → „Empfehlung für Etappe 2a“, `test5/feedback/runde-06.md`.

## Global Constraints

- Branch `feature/leichte-straenge-2a`, abgezweigt von `feature/leichte-straenge-2` (d2bfe8a); Commit je Task.
- Spec-Texte in `specs/` sind Englisch; Texte für Lehrkräfte kommen aus `specs/templates/i18n/de.json` bzw. `englishTerms`/`englishActions`.
- Keine Persona-/Testdaten (Bienen, Klasse 3, Sabine, Jonas, iPad …) in `specs/` – auch nicht in Fixtures; Testdaten neutral.
- Alte Journale verhalten sich wie heute: nach jedem Skript-Task ist die Ausgabe von `derive-dashboard.mjs --check <j>` und `validate-journal.mjs <j>` für `test/`, `test2/`, `test3/`, `test4/` und `test5/journal.md` identisch zu `d2bfe8a` (Vergleich über `git worktree add`), oder jede Abweichung ist im Commit begründet.
- Grün nach jedem Task: `node --test specs/dashboard/check.mjs` und `node --test specs/check-specs.mjs` im Repo-Root.
- `CLAUDE.md`, `AGENTS.md`, `.github/copilot-instructions.md`, `dist/web-bundle.md`, `.cursor/rules/agent.md`, `.windsurfrules` werden nie von Hand geändert, sondern mit `python3 specs/build.py` aus `specs/agents/*.yaml` erzeugt.
- Leitplanken des Entwurfs (wörtlich als Wächtersätze): Gestaltung ändert keinen Lehrtext, keine Quizze, keine Folienfolge und kein Layout; Bilder mit unklarer Lizenz sind auf „ersetzen“ vorausgewählt; Quiz-Bilder werden nur ersetzt, nie entfernt; Imports von Makro-Templates bleiben immer.
- Wortgrenzen (`check-specs.mjs` → `budgets`) nur mit Begründung im Kommentar anheben.

## Entscheidungen des Plans (Rulings)

- **Kursdatei je Einheit:** statt eines neuen Felds `__File:__` nutzt der Gestaltungs-Strang den vorhandenen Mechanismus „Recorded paths“ (`data/file-structure-modes.md`, Commit 93f9eb6): die Material-Zelle der technischen Tabelle trägt `` ✅ `pfad/zur/datei.md` ``. Er wird auf jeden Projektpfad zu einer `.md`-Datei verallgemeinert. Grund: ein Auflösungsweg für alle Aufgaben statt zwei.
- **Umfang im Strang-Block:** neue Zeile `4. Design scope: [look | images | both | n/a]`; `Convert mode` bleibt für alte Journale. `readJournal` liefert zusätzlich `trackMode` (convert → `convertMode`, design → `designScope`, sonst `null`); alle Aufrufe von `stepsOf`/`laterOf`/`courseStepOf` nutzen `trackMode`.
- **Theme-Teil im Dateikopf:** keine Klammer-Kommentare (der Kopf ist selbst ein HTML-Kommentar). Maßgeblich sind die Zeilen im Block `__LiaScript Theme:__` von `## Visual Identity`. Eine Datei hat das Theme, wenn jede nicht-leere Theme-Zeile in ihrem Kopf steht (`themeApplied`). Fremdes Styling (`link:` auf `.css`, `@style … @end`, Theme-Imports) listet `read-source.mjs` auf; `:apply-theme` fragt es ab.
- **„Bilder durchgesehen“:** eine datierte Zeile in den Entscheidungen der Einheit (`terms.imagesReviewed`), damit eine Einheit ohne Bilder nicht endlos „Bilder durchsehen“ als nächsten Schritt zeigt.
- **Fertig im Gestaltungs-Strang:** wie bei den anderen Wegen: Prüfung bestanden und freigegeben. Veröffentlichen braucht alle Einheiten fertig; eine eigene Kursprüfung gibt es nicht (`unitIsCourseCheck` gilt auch für `design`).
- **Auszug der Quelle (7.5 Nr. 2) kommt mit Etappe 2b.** Im Gestaltungs-Strang ist die Ausgabe von `read-source.mjs` schon der kompakte Auszug; `.cache/source/notes.md` braucht erst das Umwandeln (lange Quellen, Neustart mitten im Durchgang). Ebenso die Gelegenheits-Persona (7.2 Schritt 8).
- **Startlektüre (T5-111):** `teaching-agent.yaml` wird geteilt. Was `build.py` ohnehin in `CLAUDE.md` schreibt (`agent_coordination`, `skills`, `agent_links`, `commands`), wandert nach `agents/teaching-agent.nav.yaml`. Der Start liest nur noch den Kern.

## Review Focus

1. Eine Kursdatei mit fremdem Styling (`link:` auf eine `.css`-Datei, `@style … @end`, Import eines Theme-Templates neben einem Makro-Import): `read-source.mjs` trennt Styling von Makro-Imports, `themeApplied` bleibt `false`, bis das Theme geschrieben ist → Tests in Task 3 und Task 5.
2. Ein Kurspfad mit Leerzeichen oder Klammern außerhalb von `materials/` (`` ✅ `docs/Kurs (neu).md` ``): `recordedPath` liest ihn, `validate-journal` findet die Datei → Test in Task 3.
3. Eine Einheit ohne ein einziges Bild: Nach „Bilder durchgesehen“ ist der nächste Schritt die Prüfung, nicht wieder „Bilder durchsehen“ → Test in Task 4.
4. Umfang `images` mit einer Visual Identity ohne Theme-Block (nur Bildstil): Kein Schritt verlangt `:apply-theme`. Umfang `look` mit Visual Identity, aber ohne Theme-Block: `next` = Aussehen festlegen, keine Schleife → Test in Task 4.
5. Altes Journal mit `Convert mode`, aber ohne Zeile `Design scope`, sowie ein `test4`-Kurs mit Standard-Theme: keine neuen Fehler; die Kontrastprüfung meldet für das LiaScript-Standard-Theme nichts → Vergleich in Task 3 und Task 6.

---

### Task 1: Kleinere Startlektüre (T5-111)

**Files:**
- Create: `specs/agents/teaching-agent.nav.yaml`
- Modify: `specs/agents/teaching-agent.yaml` (die Abschnitte `agent_coordination`, `skills`, `agent_links`, `commands` wandern in die neue Datei; im Kern stehen `agent`, `persona`, `interaction_mode`, `epistemic_rules`, `project_memory`, `agent_customization`, `note_saving`, `dependencies`)
- Modify: `specs/build.py` (lädt für den Teaching-Agent beide Dateien zusammengeführt; Bundle-Reihenfolge nimmt die nav-Datei mit)
- Modify: `specs/check-specs.mjs` (Helfer `teachingAgent()` liest beide Dateien zusammen; jeder bisherige `read("agents/teaching-agent.yaml")`-Test, der einen der wandernden Abschnitte prüft, nutzt ihn)
- Modify (über `teaching-agent.nav.yaml` → `agent_links`, Start order): Schritt (2) liest beim Start nur den Kopf, `## Course Context`, den Dashboard-Block und die `###`-Überschriften von `## Sessions`, den Rest bei Bedarf über `find.mjs`/`read_section`
- Modify: On Activation 3 (Quelle in `build.py` bzw. `specs/main.md`, je nachdem, wo der Text steht): „Read `specs/agents/teaching-agent.yaml` completely once per session (the core; CLAUDE.md carries its commands, links and coordination)“

**Interfaces:**
- Produces: `startLoad(agent: "teaching" | "artist" | "learner" | "development") → { files: string[], bytes: number }` in `specs/check-specs.mjs`. Gezählt werden die festen Startdateien: Agent-Kern-YAML, `data/agent-links.md`, `data/chat-wording.md`, `data/chat-language.md`, `data/chat-memory.md`.

- [ ] **Step 1: Write the failing tests** in `specs/check-specs.mjs`:
```js
test("the fixed start reading stays within its budget (T5-111)", () => {
  for (const agent of ["teaching", "artist", "learner", "development"]) {
    const { bytes, files } = startLoad(agent);
    assert.ok(bytes <= 60_000, `${agent}: start reading ${bytes} bytes > 60000 (${files.join(", ")})`);
  }
  assert.ok(Buffer.byteLength(read("agents/teaching-agent.yaml")) <= 16_000, "teaching-agent.yaml core ≤ 16 kB");
});
test("CLAUDE.md carries what moved to teaching-agent.nav.yaml", () => {
  const claude = readFileSync("CLAUDE.md", "utf8");
  for (const key of Object.keys(yamlCommands(teachingAgent()))) assert.ok(claude.includes(key.split(" ")[0]), key);
});
```
- [ ] **Step 2: Run** `node --test specs/check-specs.mjs`. Expected: FAIL (teaching start ≈ 80 kB).
- [ ] **Step 3: Split the YAML, adapt `build.py`, `check-specs.mjs` and the start-order text.** `python3 specs/build.py` must leave `CLAUDE.md` unchanged in substance: diff only in the On Activation 3 and Start order (2) wording.
- [ ] **Step 4: Run** both suites. Expected: PASS. Check by hand: `git diff --stat CLAUDE.md` shows ≤ 4 changed lines.
- [ ] **Step 5: Commit** `Read only the agent core at start; CLAUDE.md carries commands and links`.

### Task 2: Modelltests für Strangwechsel und Mini-Kurs (Regressionsnetz)

**Files:**
- Create: `specs/dashboard/fixtures/journal-mini-approved.md` (neutral: Thema „Wasserkreislauf“, eine Einheit geprüft und freigegeben, Strang `mini`)
- Create: `specs/dashboard/fixtures/journal-mini-to-full.md` (dasselbe Journal nach dem Wechsel laut `tasks/activate-section.md` → Track switch: Zwischenfolien-Entscheidung, Nachprüfzeile, Zusammenfassung für den vollen Weg, Agenda „bei Bedarf“, Kursrahmen 2 Einheiten, Gliederung 1 Einheit)
- Test: `specs/dashboard/check.mjs`

**Interfaces:**
- Consumes: `deriveJournal(path)`, `validate(...)` helpers that already exist in `check.mjs`.

- [ ] **Step 1: Write the tests**
```js
test("mini → full: no new approval round, outline first, agenda later (T5-71/67/74)", () => {
  const after = deriveJournal(fixture("journal-mini-to-full.md"));
  assert.equal(after.next.href, "agent:teaching/create-outline");
  assert.ok(!after.decisions.some(item => /approve-unit-1/.test(item.key)));
  assert.equal(after.units[0].approved, true);
  assert.deepEqual(after.process.later.map(item => item.href), ["agent:teaching/activate-section?section=agenda"]);
  assert.equal(after.units.length, 1);
  assert.equal(after.unitsPlanned, 2);
  const check = validateFile(fixture("journal-mini-to-full.md"));
  assert.equal(check.status, 0, check.output);
  assert.doesNotMatch(check.output, /Warnings:/, check.output);
});
test("mini, approved: the unit check is the course check (T5-53)", () => {
  const mini = deriveJournal(fixture("journal-mini-approved.md"));
  assert.notEqual(mini.next?.href, "agent:teaching/validate-course");
});
test("a stale approval item next to an approved unit is reported (T5-88)", () => {
  const broken = withDecision(fixture("journal-mini-to-full.md"), { key: "approve-unit-1", kind: "prepare", title: "Unit 1 – look at it and approve", how: "…" });
  assert.match(validateText(broken).output, /unit 1 is approved, but the overview asks to approve it again/);
});
```
(`fixture`, `validateFile`, `validateText`, `withDecision`: kleine Helfer in `check.mjs`, falls es sie noch nicht gibt – `withDecision` hängt ein Element an den Dashboard-Block an.)
- [ ] **Step 2: Run** `node --test specs/dashboard/check.mjs`. Expected: FAIL only where the fixtures do not exist yet.
- [ ] **Step 3: Write both fixtures** by the rules of `tasks/init-course.md` → Mini Track and `tasks/activate-section.md` → Track switch; let the Dashboard block be written by `node specs/dashboard/derive-dashboard.mjs --write <fixture>` (writes only the fixture).
- [ ] **Step 4: Run** the suite. Expected: PASS.
- [ ] **Step 5: Commit** `Model tests for the mini course and the switch to the full track`.

### Task 3: Strang `design` im Journal-Modell

**Files:**
- Modify: `specs/dashboard/tracks.mjs`
- Modify: `specs/dashboard/journal-model.mjs`
- Modify: `specs/dashboard/validate-journal.mjs` (nutzt `recordedPath` aus `journal-model.mjs`; dort gelöscht)
- Test: `specs/dashboard/check.mjs`

**Interfaces:**
- Produces (`tracks.mjs`):
  - `trackIds = ["full", "mini", "convert", "template", "design"]`
  - `stepsOf("design", scope)`: `both`/`null` → `["frame", "look", "images", "check", "publish"]`; `look` → ohne `images`; `images` → ohne `look`
  - `laterOf("design")` → `["Outline", "Didactics", "Agenda", "Learner Personas", "Analysis Status"]`
  - `englishLightStepTitles.images = "Images"`, `englishLightStepTitles.frameDesign = "Frame"`
  - `stepTitleKey(track: string, key: string) → string` (`"frameDesign"` für design/frame, sonst `key`)
- Produces (`journal-model.mjs`, `readJournal(...)` additionally returns):
  - `designScope: "look" | "images" | "both" | null` (aus `Design scope:`)
  - `trackMode: string | null`
  - `visualTheme: string[]` (nicht-leere Zeilen des ```` ```text ````-Blocks unter `__LiaScript Theme:__` in `## Visual Identity`; `[]` ohne Block oder bei `later`)
  - je Einheit: `file: string | null` (Recorded path), `themeApplied: boolean | null` (`null` ohne `visualTheme` oder ohne lesbare Datei), `imagesReviewed: boolean`
  - `placedStatuses` enthält `"existing"`
- Produces (exports): `recordedPath(cell: string) → string | null`: ein Pfad in Backticks, relativ, endet auf `.md`, ohne `..`, ohne Schema; percent-encoding wie in Markdown-Links wird dekodiert. Außerdem `headerOf(markdown: string) → string` (erster HTML-Kommentar vor der ersten `#`-Überschrift, sonst `""`).

- [ ] **Step 1: Write the failing tests**
```js
test("design track: steps per scope, later sections, step titles", () => {
  assert.deepEqual(stepsOf("design", "both"), ["frame", "look", "images", "check", "publish"]);
  assert.deepEqual(stepsOf("design", "look"), ["frame", "look", "check", "publish"]);
  assert.deepEqual(stepsOf("design", "images"), ["frame", "images", "check", "publish"]);
  assert.deepEqual(laterOf("design"), ["Outline", "Didactics", "Agenda", "Learner Personas", "Analysis Status"]);
  assert.equal(stepTitleKey("design", "frame"), "frameDesign");
  assert.equal(stepTitleKey("mini", "frame"), "frame");
});
test("recorded paths: any project .md path, also with spaces and parentheses", () => {
  assert.equal(recordedPath("✅ `docs/Kurs (neu).md`"), "docs/Kurs (neu).md");
  assert.equal(recordedPath("✅ `docs/Kurs%20%28neu%29.md`"), "docs/Kurs (neu).md");
  assert.equal(recordedPath("✅ `README.md`"), "README.md");
  assert.equal(recordedPath("✅ `../x.md`"), null);
  assert.equal(recordedPath("✅ `https://example.org/x.md`"), null);
  assert.equal(recordedPath("✅"), null);
});
test("design journal: scope, files, theme state, reviewed images", () => {
  const j = readJournal(designJournal({ scope: "both", theme: ["@style", ".lia-slide { --x: 1 }", "@end"] }), { projectDir: tmpProject({ "course/a.md": "<!--\n@style\n.lia-slide { --x: 1 }\n@end\n-->\n# A\n", "course/b.md": "<!--\nlink: old.css\n-->\n# B\n" }) });
  assert.equal(j.track, "design"); assert.equal(j.designScope, "both"); assert.equal(j.trackMode, "both");
  assert.deepEqual(j.units.map(u => [u.file, u.themeApplied]), [["course/a.md", true], ["course/b.md", false]]);
  assert.equal(j.units[0].imagesReviewed, false);
});
test("an existing image counts as placed", () => {
  const images = readJournal(designJournal({ images: [{ status: "existing" }, { status: "wanted", source: "free-photo" }] }), { projectDir: tmpProject({}) }).units[0].images;
  assert.deepEqual([images.placed, images.open], [1, 1]);
});
test("old journals: Convert mode without Design scope read as before", () => {
  const j = readJournal(readFileSync(fixture("journal-84484ae.md"), "utf8"));
  assert.equal(j.track, "full"); assert.equal(j.designScope, null); assert.equal(j.trackMode, null);
});
```
(`designJournal(opts)`, `tmpProject(files)`: neue Testhelfer in `check.mjs`. `designJournal` baut ein minimales Journal mit `Track: design`, `Design scope`, zwei Einheiten mit Recorded paths `course/a.md`, `course/b.md`, optional Theme-Block und Bildeinträgen.)
- [ ] **Step 2: Run** `node --test specs/dashboard/check.mjs`. Expected: FAIL.
- [ ] **Step 3: Implement** in `tracks.mjs` and `journal-model.mjs`; `imagesReviewed` = a line in the unit's decisions that contains `terms.imagesReviewed` (English `"images reviewed"`). `validate-journal.mjs` imports `recordedPath` and reads recorded paths in `multi-file` mode as before (the design track writes `Mode: multi-file`).
- [ ] **Step 4: Run** the suite, then the old-journal comparison (Global Constraints). Expected: PASS, identical output.
- [ ] **Step 5: Commit** `Read the design track: scope, course files, theme state, existing images`.

### Task 4: Nächster Schritt und Übersicht im Gestaltungs-Strang

**Files:**
- Modify: `specs/dashboard/actions.mjs`
- Modify: `specs/dashboard/derive-dashboard.mjs`
- Modify: `specs/templates/i18n/de.json`, `specs/dashboard/journal-model.mjs` (`englishActions`, `englishTerms`)
- Modify: `specs/templates/project-dashboard.yaml` (Schritte je Strang: design)
- Test: `specs/dashboard/check.mjs`

**Interfaces:**
- Consumes: Task 3 (`trackMode`, `designScope`, `visualTheme`, `unit.file`, `unit.themeApplied`, `unit.imagesReviewed`).
- Produces (`actions.mjs`):
  - `courseNext` verzweigt `journal.track === "design"` → `designNext(journal, states)`
  - Aktionen (Schlüssel → Agent/Befehl → Kursschritt):
    - `design-look` → `artist`/`create-visuals` → `look`
    - `apply-theme` → `artist`/`apply-theme` → `look`
    - `review-images` → `artist`/`review-images {number}` → `images`
    - im design-Strang zusätzlich: `insert-images` → `images`; `check-unit`/`recheck-unit`/`revise-unit`/`resolve-concerns`/`concerns-waiting`/die Freigabe → `check`
  - `courseStepOf(expected, steps, { track, mode, keys })` (`mode` neu; `convertMode` bleibt als Alias)
  - `unitIsCourseCheck`: `design` → alle Einheiten `done` (mindestens eine)
- Produces (Sprachpaket de):
  - `actions`: `design-look.label` „Aussehen festlegen“, `apply-theme.label` „Aussehen übernehmen“, `review-images.label` „Bilder durchsehen“, je mit kurzem `why` in Alltagswörtern
  - `lightStepTitles`: `images` „Bilder“, `frameDesign` „Rahmen“
  - `terms.imagesReviewed` „Bilder durchgesehen“, `terms.licenseUnclearKept` „Lizenz ungeklärt – von der Lehrkraft behalten“
  - Englisch entsprechend in `englishActions`/`englishTerms`

`designNext` order (Algorithmus, den Tests nicht vollständig festlegen):
1. Course Context leer → `init-course`.
2. Umfang `look`/`both`: kein `visualTheme` → `design-look`; eine Einheit mit `themeApplied === false` → `apply-theme`.
3. Umfang `images`: `## Visual Identity` leer → `design-look` (nur Bildstil).
4. Umfang `images`/`both`: erste Einheit ohne `imagesReviewed` → `review-images {n}`.
5. erste Einheit, die nicht `done` ist → `unitAction(unit)`.
6. Auslieferung `link`/`platform`/`open` und nicht veröffentlicht → `publishOrDecide(journal)`.

- [ ] **Step 1: Write the failing tests**
```js
test("design next: look before images, images before the check, scope respected", () => {
  const next = opts => nextOf(designCourse(opts));
  assert.equal(next({ scope: "both", theme: [] }), "agent:artist/create-visuals");
  assert.equal(next({ scope: "both", theme: ["@style", "x", "@end"], applied: [true, false] }), "agent:artist/apply-theme");
  assert.equal(next({ scope: "both", theme: ["x"], applied: [true, true] }), "agent:artist/review-images?number=1");
  assert.equal(next({ scope: "look", theme: ["x"], applied: [true, true] }), "agent:teaching/validate-course?number=1");
  assert.equal(next({ scope: "images", visualIdentity: true, theme: [] }), "agent:artist/review-images?number=1");
});
test("design next: a unit without images is not reviewed twice", () => {
  assert.equal(nextOf(designCourse({ scope: "images", visualIdentity: true, reviewed: [true, true], images: [[], []] })), "agent:teaching/validate-course?number=1");
});
test("design: overview steps follow the scope and the actions move them", () => {
  const data = deriveData(designJournalText({ scope: "look", theme: ["x"], applied: [true, false] }));
  assert.deepEqual(data.process.steps.map(step => step.title), ["Rahmen", "Aussehen", "Prüfen", "Veröffentlichen"]);
  assert.equal(data.process.steps.find(step => step.state === "current").title, "Aussehen");
});
test("design: publishing waits for every unit, no separate course check", () => {
  assert.equal(nextOf(designCourse({ scope: "look", theme: ["x"], applied: [true, true], done: [true, true], delivery: "link" })), "agent:development/publish");
});
```
(`designCourse(opts)` erzeugt `facts`/`course` wie die vorhandenen Helfer; `designJournalText` ist der Text aus Task 3 mit Sprachpaket de. Der erwartete Veröffentlichen-Link ist der, den `publishOrDecide` heute für `link` liefert – bei Abweichung den vorhandenen Wert aus den Mini-Tests übernehmen.)
- [ ] **Step 2: Run** the suite. Expected: FAIL.
- [ ] **Step 3: Implement** `designNext`, the step mapping, the words and the yaml documentation.
- [ ] **Step 4: Run** the suite and the old-journal comparison. Expected: PASS, identical.
- [ ] **Step 5: Commit** `Derive next step and overview steps for the design track`.

### Task 5: Prüfungen im Validator für den Gestaltungs-Strang

**Files:**
- Modify: `specs/dashboard/validate-journal.mjs`
- Test: `specs/dashboard/check.mjs`

**Interfaces:**
- Consumes: Task 3, Task 4.

- [ ] **Step 1: Write the failing tests**
```js
test("validate: design track needs a scope and a recorded file per unit", () => {
  assert.match(validateText(designJournalText({ scope: null })).output, /Track: design needs Design scope: look, images or both/);
  assert.match(validateText(designJournalText({ files: ["course/a.md", null] })).output, /unit 2 has no recorded course file/);
});
test("validate: a done unit without the theme is a warning (design, look)", () => {
  const out = validateText(designJournalText({ scope: "look", theme: ["x"], applied: [true, false], done: [true, true] })).output;
  assert.match(out, /unit 2 is done, but its file does not carry the theme of ## Visual Identity/);
});
test("validate: a kept image with an unclear licence needs the credit line in the file", () => {
  const out = validateText(designJournalText({ images: [[{ status: "existing", license: "unclear – kept by the instructor" }], []], fileText: "# A\n" })).output;
  assert.match(out, /licence unclear – kept/i);
});
```
- [ ] **Step 2: Run.** Expected: FAIL.
- [ ] **Step 3: Implement.** Missing scope or file → problem (exit 2); theme missing on a done unit → warning; unclear kept licence without `terms.licenseUnclearKept` (or the English term) in the file → warning.
- [ ] **Step 4: Run** the suite and the old-journal comparison. Expected: PASS, identical.
- [ ] **Step 5: Commit** `Validate the design track`.

### Task 6: Baustein „Quelle auslesen“ – `read-source.mjs`

**Files:**
- Create: `specs/dashboard/read-source.mjs`
- Test: `specs/dashboard/check.mjs` (Fixtures werden im Test erzeugt: `.pptx` per `makeZip`, LiaScript-Text inline, PDF als kleiner Text-Stream, HTML inline)
- Modify: `specs/agents/teaching-agent.nav.yaml` → `agent_links` Shell-Liste: `node specs/dashboard/read-source.mjs <file | folder | URL>`; danach `python3 specs/build.py`
- Modify: `specs/check-specs.mjs` (die Shell-Liste in `CLAUDE.md` nennt `read-source.mjs`)

**Interfaces:**
- Produces (exports):
  - `readLiaScript(text: string) → { header: { theme: string[], styling: { kind: "link-css" | "style" | "theme-import", lines: string[] }[], imports: { url: string, kind: "template" | "theme" }[] }, slides: { n: number, level: number, title: string }[], images: { slide: number, alt: string, target: string, credit: boolean }[] }`
    - `kind: "theme"` bei einem Import, dessen URL `theme` oder `design` enthält, sonst `"template"`
    - `credit`: der Dateiname des Ziels steht auf einer Folie, deren Titel `/(bild|image|foto|photo).*(nachweis|credit|quelle|source)|^(quellen|sources|lizenz|licen[cs]e)/i` trifft
  - `listCourses(dir: string) → string[]`: `.md`-Dateien mit LiaScript-Kopf, ohne `node_modules`, `.git`, `.cache`, `specs`, `lia-templates`, `journal.md`
  - `unzip(buffer: Buffer) → Map<string, Buffer>` (nur Stored/Deflate, `zlib.inflateRawSync`)
  - `readPptx(buffer: Buffer) → { slides: { n, title, text: string[], notes: string[], images: string[] }[], theme: { colors: Record<string, string>, fonts: { major: string | null, minor: string | null } } }`
  - `readPdfInfo(buffer: Buffer) → { pages: number, title: string | null, author: string | null }`
  - `readHtml(html: string, baseUrl: string) → { title: string | null, blocks: { type: "h" | "p" | "li", level?: number, text: string }[], images: { src: string, alt: string }[] }`
- CLI: `node specs/dashboard/read-source.mjs <file | folder | URL> [--json]`. Ausgabe kompakt als Text (eine Zeile je Folie/Bild). `.pptx`-Bilder werden nach `.cache/source/{slug}/` entpackt (`slug` aus dem Dateinamen). Exit 0 gelesen · 2 ungültiger Aufruf, unbekanntes Format oder nicht lesbar (eine Zeile Grund).

- [ ] **Step 1: Write the failing tests**
```js
test("read-source: LiaScript header, slides, images and credits", () => {
  const text = "<!--\nimport: https://example.org/macros/README.md\nimport: https://example.org/my-theme/README.md\nlink: style.css\n@style\n.lia { color: red }\n@end\n-->\n# Course\n## One\n![A tree](img/tree.png)\n## Image credits\n- tree.png – CC BY 4.0\n## Two\n![](img/house.png)\n";
  const r = readLiaScript(text);
  assert.deepEqual(r.header.imports.map(i => i.kind), ["template", "theme"]);
  assert.deepEqual(r.header.styling.map(s => s.kind), ["link-css", "style"]);
  assert.deepEqual(r.images.map(i => [i.slide, i.alt, i.credit]), [[2, "A tree", true], [4, "", false]]);
});
test("read-source: pptx slides, notes, images and theme colours", () => {
  const pptx = makeZip({ "ppt/slides/slide1.xml": slideXml("Title one", ["Point"]), "ppt/notesSlides/notesSlide1.xml": notesXml("Say this"), "ppt/slides/_rels/slide1.xml.rels": relsXml({ rId2: "../media/image1.png" }), "ppt/media/image1.png": Buffer.from([137, 80, 78, 71]), "ppt/theme/theme1.xml": themeXml({ accent1: "1F4E79" }, "Calibri", "Arial") });
  const r = readPptx(pptx);
  assert.equal(r.slides[0].title, "Title one");
  assert.deepEqual(r.slides[0].notes, ["Say this"]);
  assert.deepEqual(r.slides[0].images, ["image1.png"]);
  assert.equal(r.theme.colors.accent1, "#1F4E79");
  assert.deepEqual(r.theme.fonts, { major: "Calibri", minor: "Arial" });
});
test("read-source: pdf info, html blocks, folder listing, bad input", () => {
  assert.equal(readPdfInfo(Buffer.from("%PDF-1.4\n1 0 obj<</Type /Page>>endobj 2 0 obj<</Type /Page>>endobj\n/Title (Notes)")).pages, 2);
  const h = readHtml("<h1>T</h1><p>Text <b>bold</b></p><ul><li>A</li></ul><img src='p.png' alt='x'><script>no</script>", "https://example.org/a/");
  assert.deepEqual(h.blocks.map(b => b.type), ["h", "p", "li"]);
  assert.equal(h.images[0].src, "https://example.org/a/p.png");
  const dir = tmpProject({ "a.md": "<!--\nauthor: x\n-->\n# A\n", "journal.md": "<!--\n-->\n# J\n", "node_modules/b.md": "<!--\n-->\n# B\n", "plain.md": "# no header\n" });
  assert.deepEqual(listCourses(dir), ["a.md"]);
  assert.equal(runReadSource(["nothing.xyz"]).status, 2);
});
```
(`makeZip`, `slideXml`, `notesXml`, `relsXml`, `themeXml`, `runReadSource`: Testhelfer in `check.mjs`; `makeZip` schreibt mit `zlib.deflateRawSync` ein gültiges ZIP mit Local-Headern und Central Directory.)
- [ ] **Step 2: Run.** Expected: FAIL (module missing).
- [ ] **Step 3: Implement** `read-source.mjs`. Only `node:` built-ins; URL via global `fetch` with a 15 s timeout.
- [ ] **Step 4: Run** both suites; `python3 specs/build.py`; `node specs/dashboard/read-source.mjs test4` lists the test4 course files (manual check, no output in the commit).
- [ ] **Step 5: Commit** `Add read-source.mjs: compact excerpts of LiaScript, pptx, pdf and web pages`.

### Task 7: Kontrastprüfung in `check-material.mjs`

**Files:**
- Modify: `specs/dashboard/check-material.mjs`
- Test: `specs/dashboard/check.mjs`

**Interfaces:**
- Produces (exports): `contrastRatio(fg: string, bg: string) → number` (CSS `#rgb`, `#rrggbb`, `rgb()`, `rgba()` – Alpha wird über `bg` gemischt; WCAG 2.x relative luminance), `contrastFindings(samples: { slide: number, selector: string, fg: string, bg: string, size: number, weight: number }[]) → { slide, selector, ratio: number, need: number }[]` (`need` 3 bei `size ≥ 24` oder `weight ≥ 700 && size ≥ 18.66`, sonst 4.5; nur Unterschreitungen, je Folie und Selektor einmal).
- Rendered pass: je Folie bis zu 20 Proben aus `h1, h2, h3, p, li, a, label` mit sichtbarem Text. Ein Hintergrund ist das erste nicht-transparente `background-color` der Vorfahren, sonst `#ffffff`. Fund → Fehler (Exit 1) mit der Zeile `contrast {ratio}:1 < {need}:1 on slide {n} ({selector})`.

- [ ] **Step 1: Write the failing tests**
```js
test("contrast: WCAG ratio and thresholds", () => {
  assert.equal(Math.round(contrastRatio("#000", "#fff") * 10) / 10, 21);
  assert.equal(Math.round(contrastRatio("rgb(119, 119, 119)", "#ffffff") * 100) / 100, 4.48);
  assert.equal(Math.round(contrastRatio("rgba(0, 0, 0, 0.5)", "#ffffff") * 100) / 100, 3.95);
  const found = contrastFindings([
    { slide: 1, selector: "p", fg: "#777777", bg: "#ffffff", size: 16, weight: 400 },
    { slide: 1, selector: "h1", fg: "#777777", bg: "#ffffff", size: 32, weight: 700 },
    { slide: 2, selector: "p", fg: "#000000", bg: "#ffffff", size: 16, weight: 400 }
  ]);
  assert.deepEqual(found.map(f => [f.slide, f.selector, f.need]), [[1, "p", 4.5]]);
});
```
- [ ] **Step 2: Run.** Expected: FAIL.
- [ ] **Step 3: Implement** both functions and the sampling in the rendered pass; update `usage`.
- [ ] **Step 4: Run** the suite; manual check: `node specs/dashboard/check-material.mjs` on one test4 material reports no contrast finding (LiaScript default theme).
- [ ] **Step 5: Commit** `Check text contrast in check-material.mjs`.

### Task 8: Strangwahl und Rahmen für Gestaltung (Specs)

**Files:**
- Modify: `specs/tasks/init-course.md`
  - Schritt 2a Option 3 bekommt die Folgefrage „What should get better?“ mit vier Antworten (Inhalt und Aufbau → `full`/`improve-existing` wie heute · nur das Aussehen → `design`/`look` · nur die Bilder → `design`/`images` · beides → `design`/`both`)
  - neuer Abschnitt `## Design Track` (D1–D4): D1 Kursdateien mit `node specs/dashboard/read-source.mjs .` finden, ein Git-Repository mit `git_clone` holen (Terminalbestätigung), eine bloße Web-Adresse lädt die Lehrkraft selbst; D2 eine Frage nach Lernenden, Sprache und Auslieferung; D3 eine Bestätigung: kurzer Kurskontext (`Type: improve-existing`, `Mode: multi-file`, Track-Block `Track: design`, `Design scope`), je Kursdatei eine Einheit in `## Sessions` (Überschrift, ein Satz, leerer `#### Images`-Block, Material-Zelle `` ✅ `pfad` ``), Vermerke `laterOf("design")`; D4 Übergabe `agent:artist/switch`
  - Tabelle „When-Needed Markers“: Zeile `design`
  - Satz „Later stage“ nennt nur noch `convert` und `template`
- Modify: `specs/templates/course-context.yaml` (Track-Liste mit `design`, Zeile `4. Design scope: [look | images | both | n/a]`)
- Modify: `specs/templates/session-skeleton.yaml` (Einheit im Gestaltungs-Strang)
- Modify: `specs/data/file-structure-modes.md` → Recorded paths (jeder Projektpfad; im Gestaltungs-Strang immer)
- Modify: `specs/tasks/update-dashboard.md` → Process steps per track: `design`
- Modify: `specs/check-specs.mjs` (Wächter, Wortgrenzen)

- [ ] **Step 1: Write the guard tests** in `check-specs.mjs`:
```js
test("design track: the follow-up question, the frame and its markers (stage 2a)", () => {
  const init = read("tasks/init-course.md");
  for (const phrase of ["What should get better?", "## Design Track", "`node specs/dashboard/read-source.mjs .`", "Design scope", "never changes teaching text", "| design | Outline, Didactics, Agenda, Learner Personas, Analysis Status |"]) assert.ok(init.includes(phrase), phrase);
  assert.match(read("templates/course-context.yaml"), /Design scope: \[look \| images \| both \| n\/a\]/);
  assert.match(read("data/file-structure-modes.md"), /Recorded paths[\s\S]*design track/);
  assert.match(read("tasks/update-dashboard.md"), /design: Frame → Look → Images → Check → Publish/);
});
```
- [ ] **Step 2: Run** `node --test specs/check-specs.mjs`. Expected: FAIL.
- [ ] **Step 3: Write the spec texts.** The markers table row must match `laterOf("design")` verbatim (an existing guard compares the table with `tracks.mjs`; extend it to `design`).
- [ ] **Step 4: Run** both suites. Expected: PASS.
- [ ] **Step 5: Commit** `Offer the design track and save its frame in one confirmation`.

### Task 9: Aussehen – Visual Identity aus dem Kurs und `:apply-theme` (Specs)

**Files:**
- Modify: `specs/tasks/create-visuals.md` (Variante „From the course or a source“: ohne `## Outline`/`## Didactics`; Eingaben sind die Ausgabe von `read-source.mjs`, vorhandene Farben, Schriften und Logo und zwei bis drei Fragen: Wirkung, Vorgaben, was bleiben soll. Bei Umfang `images` nur der Bildstil. Am Ende, wenn Kursdateien mit Material existieren – auch im vollen Weg: `:apply-theme` anbieten)
- Create: `specs/tasks/apply-theme.md`
  - Eingaben: `## Visual Identity` → `__LiaScript Theme:__`, `read-source.mjs` je Kursdatei
  - fremdes Styling auflisten und in derselben Bestätigung abfragen (Vorauswahl „ersetzen“); Makro-Imports bleiben immer
  - Vorher–Nachher: eine Beispielfolie im Chat mit altem und neuem Kopf
  - eine Bestätigung, je Datei ein Write (nur der Kopf), danach `check-material.mjs` je Datei (Kontrast)
  - Kontrastfund: Farbe vorschlagen, nie still ändern
  - Übersicht aktualisieren
- Modify: `specs/agents/artist-agent.yaml` (`:apply-theme`, `:review-images {number?}` in `commands` und `dependencies`; Leitplanke im Gestaltungs-Strang: nur Dateikopf, Bildzeilen, Alt-Texte, Nachweis-Kapitel)
- Modify: `specs/agents/teaching-agent.nav.yaml` → `agent_coordination`: nach dem Gestaltungsrahmen `agent:artist/switch`; nach `:create-visuals` mit vorhandenem Material `:apply-theme`
- Modify: `specs/check-specs.mjs`; danach `python3 specs/build.py`

- [ ] **Step 1: Write the guard tests**
```js
test("apply-theme: one confirmation, foreign styling asked, macro imports kept, contrast checked", () => {
  const t = read("tasks/apply-theme.md");
  for (const phrase of ["one confirmation", "preselected: replace", "Imports of macro templates always stay", "node specs/dashboard/check-material.mjs", "only the header", "never changes teaching text"]) assert.ok(t.includes(phrase), phrase);
  const artist = read("agents/artist-agent.yaml");
  assert.match(artist, /:apply-theme: "run task `tasks\/apply-theme\.md`/);
  assert.match(artist, /:review-images \{number\?\}: "run task `tasks\/review-images\.md`/);
  assert.match(read("tasks/create-visuals.md"), /From the course or a source/);
});
```
(Der Test für `review-images` schlägt erst nach Task 10 nicht mehr wegen der fehlenden Datei fehl; der vorhandene Test „every task file an agent's commands run exists“ verlangt die Datei, deshalb legt Task 9 `tasks/review-images.md` als Gerüst mit Purpose und Inputs an.)
- [ ] **Step 2: Run.** Expected: FAIL.
- [ ] **Step 3: Write the texts**, rebuild configs.
- [ ] **Step 4: Run** both suites. Expected: PASS.
- [ ] **Step 5: Commit** `Add apply-theme and the look of an existing course`.

### Task 10: Bilder – `:review-images` und Status `existing` (Specs)

**Files:**
- Modify: `specs/tasks/review-images.md`
  - Bildbestand aus `read-source.mjs`; je Bild ein Eintrag `__Status:__ existing` (Folie, Alt-Text, Quelle, Lizenz bekannt/unklar)
  - Formulare mit höchstens 4 Bildern (`data/chat-dialog.md` → Forms): behalten · neu erzeugen · freies Foto · entfernen; unklare Lizenz vorausgewählt auf „ersetzen“
  - „behalten“ bei unklarer Lizenz → `terms.licenseUnclearKept` im Nachweis-Kapitel
  - entfernen: Bildzeile weg, ausdrücklicher Verweis angepasst und gezeigt; Quiz-Bilder nur ersetzen
  - fehlende Alt-Texte vorgeschlagen; neue Bildstellen über „hier ein Bild“ im Vorschau-Kontext
  - eine Bestätigung → ein Material-Write + eine Journal-Map mit der Zeile `imagesReviewed`
  - danach `:create-image {n}` für offene Einträge
  - Layout-Ideen als Vorschlagsliste → Übersicht `decide` `layout-suggestions-{n}` mit `:quick-fix {n}`
- Modify: `specs/tasks/create-image.md` (Status `existing`: platziert, kompakte Felder wie `inserted`; Pfad im Gestaltungs-Strang aus dem Recorded path; neue Bilder in den Bildordner des Kurses, sonst neben die Datei)
- Modify: `specs/data/chat-memory.md` → Protected states nennt „a decision about an existing image“ schon – Wächter ergänzen
- Modify: `specs/check-specs.mjs`

- [ ] **Step 1: Write the guard tests**
```js
test("review-images: existing images, unclear licence preselected replace, quiz images only replaced", () => {
  const t = read("tasks/review-images.md");
  for (const phrase of ["__Status:__ existing", "preselected on \"replace\"", "never silently \"keep\"", "Images that are answer options of a quiz can only be replaced", "at most 4 images per form", "layout-suggestions-{n}", "images reviewed"]) assert.ok(t.includes(phrase), phrase);
  assert.match(read("tasks/create-image.md"), /`existing`/);
});
```
- [ ] **Step 2: Run.** Expected: FAIL.
- [ ] **Step 3: Write the texts.**
- [ ] **Step 4: Run** both suites. Expected: PASS.
- [ ] **Step 5: Commit** `Add review-images: the image inventory of an existing course`.

### Task 11: Gestalterische Prüfung (Specs)

**Files:**
- Modify: `specs/tasks/validate-course.md`
  - neuer Absatz „Design track: design check only“: Syntax (`validate-syntax`), Kopf, Bilder (Pfad, Alt-Text, Nachweis, Lizenz), Kontrast (`check-material.mjs`)
  - inhaltliche Befunde werden nie bewertet und nie FAIL; sie kommen als `internal`/`decide` in die Übersicht (T5-104-Regel), keine Lernenden-Prüfung
  - die Datei kommt aus dem Recorded path
- Modify: `specs/tasks/quick-fix.md` (eine Zeile: Vorschläge aus `layout-suggestions-{n}` laufen über `:quick-fix {n}` im Teaching-Agent)
- Modify: `specs/check-specs.mjs` (Wächter, Wortgrenze `validate-course.md` mit Begründung)

- [ ] **Step 1: Write the guard test**
```js
test("validate-course: the design track checks design only", () => {
  const t = read("tasks/validate-course.md");
  for (const phrase of ["Design track: design check only", "never makes the check FAIL", "no learner review", "recorded path"]) assert.ok(t.includes(phrase), phrase);
});
```
- [ ] **Step 2–4:** Run (FAIL), write, run (PASS).
- [ ] **Step 5: Commit** `Check design only on the design track`.

### Task 12: Strangwechsel `design → full` (Specs + Modelltest)

**Files:**
- Modify: `specs/tasks/activate-section.md` → Track switch: `design → full` (Inhalt und Aufbau): Track `full`, `Type: improve-existing` bleibt, die Vermerke `Outline`/`Didactics`/`Agenda` (nach `Agenda required`) fallen, `## Visual Identity` und die Bildblöcke bleiben, keine neue Freigaberunde für fertige Einheiten, Zusammenfassung nur mit Prüffakten. Der nächste Schritt ist dann `:analyze-existing`/`:create-outline` (wie der volle Weg ihn ableitet).
- Create: `specs/dashboard/fixtures/journal-design-to-full.md` (neutral)
- Test: `specs/dashboard/check.mjs`, `specs/check-specs.mjs`

- [ ] **Step 1: Write the tests**
```js
test("design → full: images and look stay, no approval round, outline next", () => {
  const after = deriveJournal(fixture("journal-design-to-full.md"));
  assert.equal(after.next.href, "agent:teaching/create-outline");
  assert.ok(!after.decisions.some(item => /^approve-unit-/.test(item.key)));
  assert.equal(validateFile(fixture("journal-design-to-full.md")).status, 0);
});
```
In `check-specs.mjs`: `activate-section.md` enthält „design → full“ und „Visual Identity and the image blocks stay“.
- [ ] **Step 2–4:** Run (FAIL), write spec and fixture, run (PASS).
- [ ] **Step 5: Commit** `Switch from the design track to the full track`.

### Task 13: Abschluss-Prüfung der Etappe

- [ ] **Step 1:** `python3 specs/build.py`; `git diff --stat` zeigt nur erwartete Dateien.
- [ ] **Step 2:** Beide Suiten grün; Vergleich der alten Journale (Global Constraints) identisch.
- [ ] **Step 3:** `startLoad` je Agent ausgeben und im Commit-Text nennen (Basis: Teaching ≈ 80 kB vor Task 1).
- [ ] **Step 4:** Entwurf `docs/superpowers/specs/2026-11-11-leichte-straenge-design.md` Kopfzeile: „Etappe 2a umgesetzt“, Abschnitt 10 nennt die Rulings dieses Plans.
- [ ] **Step 5: Commit** `Stage 2a: design track and shared building blocks`.

### Task 14: Tandem-Test 6 (mit der Lehrkraft)

Voraussetzung: Im DevServer sind T5-100 (blasse Nachrichten) und T5-101 (Quittung) behoben, sonst messen die Zeiten die Animation.

- [ ] `test6/` wie test5 aufsetzen (Speicher-Notiz `tandem-test-setup`): Port 3032, Modell in `test6/.claude/settings.json`, Runden mit „neuer Tag“ ≥ 65 min nach dem letzten Chat-Eintrag.
- [ ] Runden:
  - R0 Gestaltung `look` an einem vorhandenen Kurs aus test4
  - R1 `images` an einem fremden LiaScript-Kurs (per `git_clone`), mit einem Bild unklarer Lizenz und einem Quiz-Bild
  - R2 Neustart mitten im Bildschritt
  - R3 Wechsel `design → full`
  - R4 kurzer Mini-Regressionstest (neuer Mini-Kurs mit einem Formular vor dem Schreiben, T5-27/32)
  - R5 Gesamtbewertung und Kosten
- [ ] Danach Plan für Etappe 2b (Umwandeln) auf denselben Bausteinen.
