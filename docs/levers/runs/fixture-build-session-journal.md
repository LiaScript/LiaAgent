<!--
language: de
color: <span style="display:inline-block;width:1.5rem;height:1.5rem;background-color:@0;border:1px solid #ccc;border-radius:2px;vertical-align:middle;"></span> `@0`

import: ./specs/dashboard/README.md
-->

# Der Wasserkreislauf

Hier wächst Ihr Kursplan. Sie bringen Ihre Idee mit; der Assistent im Chat hilft Ihnen, daraus Lernziele, Aufgaben und fertiges Material zu entwickeln. Sie prüfen jeden Vorschlag und entscheiden, was bleibt. **Ohne Ihre Bestätigung ändert sich nichts an Ihrer Planung und Ihrem Material. Die Übersicht hält der Assistent selbst aktuell.**

<!-- class="journal-start" -->
[Zur Übersicht →](#dashboard-–-übersicht)

## Dashboard – Übersicht

```json @Dashboard.View
{
  "title": "Der Wasserkreislauf",
  "context": "Klasse 6 · 24 Lernende · je Lernseite 15 Minuten allein am Laptop",
  "subtitle": "Der Kurs hat zwei Lernseiten. Lernseite 1 „Der Wasserkreislauf“ ist geprüft und freigegeben. Für Lernseite 2 „Wolken und Regen“ steht die Planungsskizze; das Material dafür fehlt noch.",
  "next": {
    "icon": "▶️",
    "title": "Material ausarbeiten – Lernseite 2",
    "why": "Aus der Planungsskizze entstehen die Texte, die kleine Aufgabe zur Wolke und das Quiz zur Reihenfolge; Sie sehen jeden Teil, bevor er gespeichert wird.",
    "label": "Lernseite 2 ausarbeiten",
    "href": "agent:teaching/coauthor-materials?number=2",
    "command": ":coauthor-materials 2"
  },
  "labels": {
    "decide": "Noch zu entscheiden",
    "prepare": "Vor dem Einsatz vorbereiten",
    "viewMaterial": "So sehen es die Lernenden"
  },
  "units": [
    {
      "id": 1,
      "title": "Der Wasserkreislauf",
      "summary": "Eine Zwischenfolie und drei Folien mit einem Quiz, jeder Text zum Vorlesen.",
      "process": {
        "title": "Der Wasserkreislauf",
        "steps": [
          {
            "title": "Planen",
            "state": "done",
            "why": "Die Planungsskizze legt Inhalte, Aufgaben und Selbstkontrolle fest, bevor Material entsteht.",
            "result": "in der Gliederung geplant: zwei Lernziele, drei Folien"
          },
          {
            "title": "Material ausarbeiten",
            "state": "done",
            "why": "Texte, Aufgaben und Selbstkontrolle entstehen gemeinsam; jeder Teil wird vorher gezeigt.",
            "result": "eine Zwischenfolie, drei Folien, ein Quiz"
          },
          {
            "title": "Bilder einfügen",
            "state": "done",
            "why": "Bilder helfen beim Verstehen, wo ein Wort noch nicht sicher sitzt.",
            "result": "keine Bilder – Ihre Entscheidung vom 11.11.2026"
          },
          {
            "title": "Prüfen und freigeben",
            "state": "done",
            "why": "Die Prüfung zeigt, ob das Material zu den Zielen und zur Zeit passt; danach geben Sie es frei.",
            "result": "bestanden und am 12.11.2026 von Ihnen freigegeben; die Zwischenfolie ist nachgeprüft"
          }
        ]
      },
      "state": "done",
      "href": "#1.-der-wasserkreislauf",
      "view": {
        "href": "agent:teaching/preview?file=1",
        "command": ":preview 1"
      },
      "statusLabel": "geprüft ✅",
      "usable": {
        "state": "yes"
      },
      "approved": true
    },
    {
      "id": 2,
      "title": "Wolken und Regen",
      "summary": "Wie aus Wasserdampf Wolken und Regen werden; zum Schluss ordnen die Lernenden die vier Schritte des Kreislaufs in einem Quiz.",
      "process": {
        "title": "Wolken und Regen",
        "steps": [
          {
            "title": "Planen",
            "state": "done",
            "why": "Die Planungsskizze legt Inhalte, Aufgaben und Selbstkontrolle fest, bevor Material entsteht.",
            "result": "Planungsskizze mit fünf Folien, einer kleinen Aufgabe und einem Quiz zur Reihenfolge"
          },
          {
            "title": "Material ausarbeiten",
            "state": "current",
            "why": "Texte, Aufgaben und Selbstkontrolle entstehen gemeinsam; jeder Teil wird vorher gezeigt.",
            "next": "Lernseite 2 ausarbeiten"
          },
          {
            "title": "Bilder einfügen",
            "state": "planned",
            "why": "Bilder helfen beim Verstehen, wo ein Wort noch nicht sicher sitzt.",
            "next": "keine Bilder geplant – wie im Kursrahmen festgelegt; wird beim Ausarbeiten bestätigt"
          },
          {
            "title": "Prüfen und freigeben",
            "state": "planned",
            "why": "Die Prüfung zeigt, ob das Material zu den Zielen und zur Zeit passt; danach geben Sie es frei.",
            "next": "nach dem Ausarbeiten"
          }
        ]
      },
      "state": "current",
      "href": "#2.-wolken-und-regen",
      "statusLabel": "Planungsskizze ✅ · Material offen"
    }
  ],
  "process": {
    "title": "So entsteht Ihr Kurs",
    "description": "Die Schritte vom Thema bis zum geprüften Material. Diese Übersicht zeigt immer, wo wir gerade stehen.",
    "steps": [
      {
        "title": "Den Rahmen festlegen",
        "state": "done",
        "why": "Thema, Zielgruppe, Format und Sprache prägen alles, was folgt.",
        "result": "Kursrahmen für einen Kurs mit zwei Lernseiten"
      },
      {
        "title": "Gliederung und Lernziele",
        "state": "done",
        "why": "Klare Lernziele sagen, was die Lernenden am Ende können.",
        "result": "zwei Lernziele und zwei Lernseiten: „Der Wasserkreislauf“ und „Wolken und Regen“"
      },
      {
        "title": "Didaktik",
        "state": "done",
        "why": "Methoden, Aufgabenformen und Unterstützung, die zu den Lernzielen passen.",
        "result": "ein wiederkehrender Ablauf „Wiederholungsseite“, eine Lernbegleiterin, die alles vorliest, und Regeln für das Schreiben des Materials"
      },
      {
        "title": "Bausteine für Aktivitäten",
        "state": "planned",
        "why": "Fertige Bausteine wie eine Zeichenfläche oder eine Karte – oder ein eigener, wenn nichts passt.",
        "statusLabel": "wird je Lernseite geprüft – bisher keine nötig (1 von 2)"
      },
      {
        "title": "Material erstellen",
        "state": "current",
        "why": "Erklärungen, Aufgaben und Selbstkontrollen entstehen aus der Planung.",
        "result": "Lernseite 1 „Der Wasserkreislauf“",
        "next": "Lernseite 2 „Wolken und Regen“ ausarbeiten"
      },
      {
        "title": "Prüfen und überarbeiten",
        "state": "planned",
        "why": "Verständlichkeit und Passung zu den Lernzielen werden geprüft, bevor das Material eingesetzt wird.",
        "result": "Lernseite 1 geprüft",
        "statusLabel": "Kursprüfung nach der letzten Lernseite · schon freigegeben: Lernseite 1"
      },
      {
        "title": "Veröffentlichen",
        "state": "planned",
        "why": "Der geprüfte Kurs bekommt einen Link für die Lernenden.",
        "next": "kommt nach der Prüfung des ganzen Kurses"
      }
    ],
    "note": "Sie können jederzeit einen Schritt zurückgehen. Fertig ist eine Lernseite erst, wenn ihre Prüfung bestanden ist und Sie sie freigegeben haben. Seit dem 13.11.2026 ist aus der kleinen Seite ein Kurs mit mehreren Lernseiten geworden, deshalb stehen hier jetzt die Schritte eines Kurses. Einen Ablaufplan gibt es nicht – so haben Sie es entschieden.",
    "later": [
      {
        "label": "Ablaufplan",
        "href": "agent:teaching/activate-section?section=agenda",
        "command": ":activate-section agenda"
      }
    ]
  },
  "decisions": [
    {
      "key": "course-frame-unit-2",
      "kind": "decide",
      "title": "Thema der zweiten Lernseite im Kursrahmen",
      "why": "Im Kursrahmen steht als zweite Lernseite noch „Wasser im Alltag – wofür wir Wasser brauchen und wie man es spart“. Die Gliederung plant jetzt „Wolken und Regen“.",
      "how": "Sagen Sie, welches Thema gilt. Bei „Wolken und Regen“ passe ich den Kursrahmen (Vorhaben und Hinweis für die Gliederung) mit „Kursrahmen überarbeiten“ an; bei „Wasser im Alltag“ überarbeiten wir die Gliederung noch einmal.",
      "href": "#course-context-–-kursrahmen",
      "label": "Kursrahmen ansehen"
    }
  ],
  "explore": [
    {
      "icon": "💬",
      "title": "Einfach fragen",
      "description": "Fragen Sie in eigenen Worten, wann immer etwas unklar ist.",
      "label": "Was kann der Assistent?",
      "href": "agent:teaching/help",
      "command": ":help"
    },
    {
      "icon": "➕",
      "title": "Bausteine für Aktivitäten",
      "description": "Fertige Bausteine für die Aktivitäten – oder die Entscheidung, dass keiner nötig ist.",
      "label": "Bausteine vorschlagen",
      "href": "agent:teaching/suggest-templates",
      "command": ":suggest-templates"
    }
  ],
  "selected": "2",
  "unitsTitle": "Lernseiten",
  "unitLabel": {
    "one": "Lernseite",
    "many": "Lernseiten"
  },
  "links": [
    {
      "label": "Kursrahmen",
      "href": "#course-context-–-kursrahmen"
    },
    {
      "label": "Gliederung",
      "href": "#outline-–-gliederung"
    },
    {
      "label": "Didaktik",
      "href": "#didactics-–-didaktik"
    },
    {
      "label": "Lernseiten",
      "href": "#sessions-–-lernseiten"
    },
    {
      "label": "Notizen",
      "href": "#notes-backup-–-notizen"
    }
  ],
  "footer": "Stand: 24.11.2026"
}
```

---

## Course Context – Kursrahmen

<!-- class="journal-actions" -->
[✏️ Kursrahmen überarbeiten](agent:teaching/init-course) `:init-course`

<!--- Filled by :init-course from templates/course-context.yaml (layout: summary table + <details>). --->

<!--- Track switched from mini to full by :activate-section on 13.11.2026 (the instructor wants a second unit on water in everyday life): type self-paced, two units, no agenda, rows „Vorhaben“ and „Einsatz“ changed, a note for the outline added; the when-needed markers of the mini track removed, the agenda marked when needed. --->

**Kursrahmen:** bestätigt am 11.11.2026, geändert am 13.11.2026.

<!-- data-type="none" -->
| Punkt | Entschieden |
|---|---|
| Vorhaben | ein Kurs mit zwei Lernseiten: „Der Wasserkreislauf“ und eine zweite zum Wasser im Alltag |
| Thema und Titel | Der Wasserkreislauf |
| Lernende | Klasse 6, 24 Lernende |
| Einsatz | zur Wiederholung, allein am Laptop, je Lernseite etwa 15 Minuten, im eigenen Tempo |
| Anrede der Lernenden | du |
| Zugang | über einen Link |
| Sprache der Seite | Deutsch, einfach und freundlich |

<details><summary>Technische Einstellungen für den Assistenten</summary>

* __Course Type:__
  1. Type: self-paced
  2. Working Title: Der Wasserkreislauf
  3. Target Group: Klasse 6, 24 Lernende; arbeiten allein am Laptop

* __Track:__
  1. Track: full
  2. Convert mode: n/a
  3. Source: n/a

* __Terminology:__
  1. sessions-called: Lernseite

* __Course Profile:__
  1. Persona type: coach
  2. Agenda required: no
  3. Pacing: learner-driven
  4. Assessment defaults: self-check quizzes
  5. Units: 2 × 15 min
  6. Delivery: link

* __File Structure:__
  1. Mode: single-file
  2. Session folder naming: n/a

* __Conventions & Standards:__
  1. Language: de
  2. Tone: informal
  3. Person: Du
  4. Instructor Address: Sie
  5. Author: A. Beispiel
  6. Contact: 

* __LiaScript conventions:__
  - keine besonderen

* __Additional Notes:__
  - Für das Material: kurze Sätze, jeder Text zum Vorlesen. Keine Bilder: Die Lernenden kennen die Abbildung des Kreislaufs aus dem Unterricht.
  - Für die Gliederung: Zweite Lernseite zum Wasser im Alltag – wofür wir Wasser brauchen und wie man es spart.

</details>

---

## Outline – Gliederung

<!-- class="journal-actions" -->
[✏️ Gliederung überarbeiten](agent:teaching/create-outline) `:create-outline`

<!--- Filled by :create-outline from templates/course-outline.yaml. --->

<!--- Completed by :create-outline on 24.11.2026: the outline of unit 1 kept word for word and arranged as unit 1; unit 2 „Wolken und Regen“ added (learning goal 2), time frame and short description added. --->

<!-- data-key="title" -->
* __Titel:__
  Der Wasserkreislauf

<!-- data-key="target-audience" -->
* __Zielgruppe:__
  Klasse 6, 24 Lernende. Sie arbeiten zur Wiederholung allein am Laptop, etwa 15 Minuten.

<!-- data-key="time-commitment" -->
* __Zeitrahmen:__
  Zwei Lernseiten mit je etwa 15 Minuten, allein am Laptop im eigenen Tempo.

<!-- data-key="abstract" -->
* __Kurzbeschreibung:__
  Die Lernenden wiederholen den Wasserkreislauf. Auf Lernseite 1 finden sie heraus, wo Wasser auf der Erde vorkommt, und was passiert, wenn die Sonne das Wasser erwärmt. Auf Lernseite 2 verfolgen sie, wie aus Wasserdampf Wolken und Regen werden und wohin das Wasser danach fließt. Jeder Text lässt sich vorlesen; kleine Quizze zeigen den Lernenden selbst, was sie schon können.

<!-- data-key="learning-goals" -->
* __Lernziele:__
  1. Die Lernenden können die Orte nennen, an denen Wasser auf der Erde vorkommt.
     - Sichtbar im Material: Sie schreiben einen weiteren Ort in ein Textfeld (Lernseite 1).
  2. Die Lernenden können die Schritte Verdunsten, Wolkenbildung, Regen und Abfließen in die richtige Reihenfolge bringen.
     - Sichtbar im Material: Sie wählen den Schritt nach dem Verdunsten (Lernseite 1) und ordnen alle vier Schritte in einem Quiz (Lernseite 2).

<!-- data-key="session-overview" -->
* __Lernseiten:__
  Titelfolie „Der Wasserkreislauf“: eine kurze Einführung für die Lernenden, einmal vor beiden Lernseiten.

  1. Lernseite 1 – Der Wasserkreislauf (etwa 15 Minuten)
     - Zwischenfolie „Lernseite: Der Wasserkreislauf“ – die drei Schritte dieser Lernseite
     - Wo ist das Wasser? – Meer, Flüsse und Seen, Wolken, Boden (Ziel 1)
     - Quiz: Was passiert zuerst? – den Schritt nach dem Verdunsten wählen (Ziel 2)
     - Geschafft! – ankreuzen, was ich schon kann
  2. Lernseite 2 – Wolken und Regen: wie aus Wasserdampf Wolken und Regen werden (Ziel 2) (etwa 15 Minuten)
     - Zwischenfolie „Lernseite: Wolken und Regen“ – die Schritte dieser Lernseite
     - Aus Wasserdampf wird eine Wolke – der Wasserdampf steigt auf, kühlt oben ab und wird zu winzigen Tröpfchen (Ziel 2)
     - Aus der Wolke wird Regen – die Tröpfchen werden größer und schwerer und fallen herunter; das Wasser fließt in Bäche, Flüsse und ins Meer (Ziel 2)
     - Quiz: Bring die Schritte in die richtige Reihenfolge – Verdunsten, Wolkenbildung, Regen, Abfließen (Ziel 2, Selbstkontrolle)
     - Geschafft! – ankreuzen, was ich schon kann

---

## Didactics – Didaktik

<!-- class="journal-actions" -->
[✏️ Didaktik überarbeiten](agent:teaching/create-didactics) `:create-didactics` · [🎨 Gestaltung](agent:artist/create-visuals) `:agent artist` → `:create-visuals`

<!--- Filled by :create-didactics from templates/course-didactics.yaml. --->

**Didaktik:** bestätigt am 24.11.2026.

<!-- data-key="didactic-concept" -->
* __Ablauf einer Lernseite:__
  Jede Lernseite ist eine Wiederholung zum Selbermachen: Eine Zwischenfolie nennt die Schritte, dann folgt pro Lernziel eine kurze Erklärung mit einer kleinen Aufgabe, danach ein Quiz zur Selbstkontrolle und zum Schluss die Folie „Geschafft!“. Die Lernenden arbeiten allein am Laptop in ihrem Tempo; jeder Text lässt sich vorlesen. Fehler sind erlaubt: Nach dem ersten falschen Versuch gibt es einen Tipp, der an Bekanntes aus dem Alltag erinnert (z. B. ein Topf mit Wasser auf dem Herd).

<!-- data-key="guiding-figure" -->
* __Begleitfigur:__
  Eine freundliche Lernbegleiterin ohne eigenen Namen. Sie spricht die Lernenden mit „du“ an, liest jeden Text vor und führt Schritt für Schritt durch die Seite. Sie lobt kurz und ehrlich und gibt bei Fehlern einen Tipp statt der Lösung.

<!-- data-key="language-style" -->
* __Sprache:__
  Locker und freundlich, in kurzen Sätzen mit höchstens einem neuen Fachwort pro Satz. Fachwörter wie „verdunsten“ oder „Wasserdampf“ werden beim ersten Mal mit einem Alltagsbeispiel erklärt. Jeder Text ist zum Vorlesen geschrieben.

<!-- data-key="lesson-patterns" -->
* __Wiederkehrender Ablauf:__
  1. Wiederholungsseite – für jede Lernseite dieses Kurses, z. B. Lernseite 2 „Wolken und Regen“: Zwischenfolie → Erklärung mit kleiner Aufgabe → Quiz zur Selbstkontrolle → „Geschafft!“. Muss enthalten: zu jedem Lernziel der Lernseite eine Folie mit Vorlesetext; mindestens ein Quiz zur Selbstkontrolle mit Tipp nach dem ersten Fehler; eine Schlussfolie, die das Gelernte in einem Satz zusammenfasst.

<!-- data-key="difficulty" -->
* __Schwierigkeit:__
  Einstieg auf Wiederholungsniveau: Die Lernenden kennen den Wasserkreislauf und seine Abbildung aus dem Unterricht. Pro Lernseite kommen höchstens drei bis fünf Kernbegriffe vor; schwierige Schritte werden in kleine Teilschritte zerlegt.

<!-- data-key="voice-sample" -->
* __Stimmprobe:__
  „Hallo! Erinnerst du dich? Die Sonne macht das Wasser im Meer warm. Dann steigt es als Wasserdampf nach oben. Oben ist es kalt. Da wird der Dampf wieder zu winzigen Tröpfchen – so entsteht eine Wolke. Klicke auf ▶, dann lese ich dir alles noch einmal vor.“

<details><summary>Technische Einstellungen (nur für den Assistenten)</summary>

* __Teaching Style:__ informal, conversational, read-aloud; short sentences, "du", no images (Course Context, 11.11.2026)
* __Course Type:__ self-paced – learner-driven pacing, two units of about 15 minutes, each worked alone at the laptop
* __Didactic Framework:__ ADDIE
  Clear, iterable phases suit a self-paced course that grows unit by unit.
* __Default Session Method:__ Cognitive Load Pacing (slug: `cognitive-load`)
  Short 15-minute units for grade 6 without images: dosed core concepts and small sub-steps fit better than UDL, whose media-variety requirement conflicts with the no-images decision.
* __Session Types:__
  1. __Wiederholungsseite__ (slug: `wiederholung`) — a self-paced review unit: short explanations per learning goal plus a self-check.
     Required: one slide with read-aloud text per learning goal of the unit; at least one self-check quiz with a hint after the first mistake; a closing slide that sums up what was learned in one sentence.
* __Difficulty Level:__ beginner — review level for grade 6; at most 3–5 core concepts per unit, difficult steps split into sub-steps.

</details>

---

## Visual Identity – Gestaltung

<!-- class="journal-actions" -->
[🎨 Gestaltung](agent:artist/create-visuals) `:agent artist` → `:create-visuals` · [🎨 Logo](agent:artist/create-logo) `:agent artist` → `:create-logo`

<!--- Filled by :create-visuals (optional) from templates/visuals.yaml. --->

_Freiwillig – der Gestaltungsassistent füllt das aus, wenn Bilder und Farben einheitlich aussehen sollen._

---

## Templates – Bausteine

<!-- class="journal-actions" -->
[▶️ Bausteine vorschlagen](agent:teaching/suggest-templates) `:suggest-templates` · [👁 Bausteinkatalog](agent:teaching/preview?file=specs/catalog/README.md) `:preview specs/catalog/README.md` · [▶️ Bausteine verwalten](agent:teaching/manage-templates) `:manage-templates`

<!--- Managed from templates/course-templates.yaml: adopted templates by :manage-templates, the briefs of templates in development by :suggest-templates, the selection line by both, removals included (ownership: agents/teaching-agent.yaml → journal_formatting_rules). --->

Die Bausteine (LiaScript-Templates) dieses Projekts werden im Kopf ganz oben in `journal.md` eingebunden und auch in jeder Materialdatei, die sie nutzt.

Geprüfte Bausteine stehen im Bausteinkatalog (`specs/catalog/README.md`); weitere Bausteine der Gemeinschaft gibt es unter [topics/liascript-template](https://github.com/topics/liascript-template). Ein ausgewählter Baustein wird mit seiner `import:`-Zeile in den Projektkopf eingetragen, hier beschrieben und im Material genauso eingebunden. Ein Baustein, der noch entwickelt wird, steht hier mit einem Steckbrief, bis er übernommen ist.

* __Template selection:__ open

<section>

### Dashboard

* __Import:__
  `./specs/dashboard/README.md`

* __Header entry:__
  `import: ./specs/dashboard/README.md`

* __Purpose:__
  Zeigt die Übersicht des Projekts (nächster Schritt, Einheiten, Arbeitsstand, offene Punkte) aus einem einzigen Datenblock.

* __Use when:__
  1. Den Planungsstand unter `## Dashboard` in `journal.md` anzeigen

* __How to use:__
  1. Die Einbindung im Kopf von `journal.md` stehen lassen.
  2. Den Datenblock mit `:update-dashboard` neu erzeugen, nie von Hand ändern.

* __Special usage notes:__
  1. Beschreibung und Beispiele: `specs/dashboard/README.md`; Prüfung mit `node specs/dashboard/validate-journal.mjs`.

</section>

---

## Agenda – Ablaufplan

<!-- state: later -->

_Bei Bedarf – für diesen Kurs noch nicht nötig._

[➕ hinzunehmen](agent:teaching/activate-section?section=agenda) `:activate-section agenda`

---

## Sessions – Lernseiten

<!-- class="journal-actions" -->
[▶️ Lernseite anlegen](agent:teaching/create-session) `:create-session` · [🔍 Lernseiten prüfen](agent:teaching/validate-course) `:validate-course`

<!--- Managed by :create-session, :promote-session, :coauthor-materials and :validate-course. Overview first — status list, then the technical table in <details> (templates/session-skeleton.yaml → section_layout.overview) — then one `### {n}. {title}` subsection per session. --->

_Lernseite 1 ist fertig; die nächsten Lernseiten entstehen nach der Didaktik._

<!--- One subsection per session, structured like this:

`### {n}. {Session Title}` (the heading line of each subsection)

{{action line: `class="journal-actions"` attribute comment + state-dependent links, see `data/agent-links.md`}}

{{<details> "Technical settings and more actions": **Type:** slug, **Method:** slug, further commands</details>}}

{{visible kind line: display names of type and method}}

Each bold label is in the course language and carries its key comment on the line above it (data-key = summary, content, activities, decisions, references — templates/session-skeleton.yaml); the comment is left out here only because it would end this note.

**{{"Summary", translated}}:**

{{2–4 sentences: focus, didactic intent, known stumbling blocks}}

**{{"Content", translated}}:**

{{topic list / content skeleton per templates/session-skeleton.yaml}}

**{{"Activities", translated}}:**

1. {{activity}}

**{{"Decisions", translated}}:**

- **{{date}}:** {{instructor decision about this unit — added during :coauthor-materials; a bullet with the date in bold, never a numbered item that starts with the date}}

**{{"References", translated}}:**

1. {{reference}}

The block order is fixed in `templates/session-skeleton.yaml` → `section_layout.entry_order`: action line, technical
details, then the skeleton fields; after them the validation report (after :validate-course; a heading in the course
language, "Validation report – {unit} {n}", above `<section data-key="validation-report">`), `#### Images` (created with
the first image entry, by :coauthor-materials or :create-image) and `#### Persona Reviews` (after :review-as-persona),
in this order. Never use `#####` headings inside a session.
--->

1. Der Wasserkreislauf – geprüft ✅
2. Wolken und Regen – Planungsskizze ✅ · Material offen

<details><summary>Technische Übersicht</summary>

<!-- data-type="none" -->
| # | Title | Type | Method | Skeleton | Material | Done | Notes |
|---|-------|------|--------|----------|----------|------|-------|
| 1 | Der Wasserkreislauf | n/a | n/a | ✅ | ✅ | ✅ | geprüft ✅ |
| 2 | Wolken und Regen | wiederholung | cognitive-load | ✅ | ❌ | ❌ | Planungsskizze ✅ · Material offen |

</details>

### 1. Der Wasserkreislauf

<!-- class="journal-actions" -->
[👁 So sehen es die Lernenden](agent:teaching/preview?file=1) `:preview 1`

<!--- Unit 1 of the mini course, written by :create-mini-course on 11.11.2026; the whole root README.md is this unit. --->

<!--- Chapter of README.md since the switch to the full track by :activate-section on 13.11.2026: chapter slide „Lernseite: Der Wasserkreislauf“, a decision and a line under the changes after the check added. --->

<!-- data-key="summary" -->
**Zusammenfassung:**

Die Zwischenfolie „Lernseite: Der Wasserkreislauf“ nennt die drei Schritte der Lernseite. Die Lernenden nennen die Orte, an denen Wasser vorkommt, und bringen die Schritte des Wasserkreislaufs in die richtige Reihenfolge.

<!-- data-key="decisions" -->
**Entscheidungen:**

- **11.11.2026:** Keine Bilder: Die Lernenden kennen die Abbildung des Kreislaufs aus dem Unterricht.
- **11.11.2026:** Ein Quiz mit einer Frage zur Reihenfolge; nach dem ersten Fehler gibt es einen Tipp.
- **12.11.2026:** Material freigegeben
- **13.11.2026:** Kurs mit mehreren Lernseiten; Zwischenfolie „Lernseite: Der Wasserkreislauf“ eingefügt

#### Prüfbericht – Lernseite 1

<section data-key="validation-report">

**Ergebnis:** bestanden (12.11.2026)

**Jetzt mit den Lernenden nutzbar:** ja

**Was gut ist:**

- Beide Lernziele haben ihre Folie: „Wo ist das Wasser?“ (Ziel 1) und „Quiz: Was passiert zuerst?“ (Ziel 2).
- Jeder Text und jede Antwort hat ▶ zum Vorlesen.
- Die Seite dauert nach Faustregel etwa 12 Minuten und passt damit zu den geplanten 15 Minuten.

**Nach der Prüfung geändert:**

- 13.11.2026 · Lernseite: Der Wasserkreislauf · Zwischenfolie eingefügt (Kurs mit mehreren Lernseiten) · nachgeprüft: check-material

<details>
<summary>Technischer Bericht</summary>

- __Date:__ 2026-11-12
- __Material:__ README.md
- __Result:__ PASS
- __Mode:__ session

**Content:**
- Lernziel 1 (Orte des Wassers nennen): „Wo ist das Wasser?“ – ✅
- Lernziel 2 (Schritte ordnen): „Quiz: Was passiert zuerst?“ – ✅

**LiaScript Syntax:**
- Kopf (author, version, language, narrator) – ✅
- Überschriften: ein `#`, drei `##` – ✅

**Recommended Actions:**
1. Keine.

</details>

</section>

### 2. Wolken und Regen

<!-- class="journal-actions" -->
[▶️ Lernseite 2 ausarbeiten](agent:teaching/coauthor-materials?number=2) `:coauthor-materials 2`

<!--- Planning sketch written by :create-session on 24.11.2026 (outline: unit 2, learning goal 2; didactics: Wiederholungsseite, Cognitive Load Pacing). --->

<details>
<summary>Technische Einstellungen und weitere Aktionen</summary>

**Type:** wiederholung

**Method:** cognitive-load

[▶️ Material erzeugen](agent:teaching/promote-session?number=2) `:promote-session 2`

</details>

<!-- data-key="kind" -->
**Art:** Wiederholungsseite

<!-- data-key="summary" -->
**Zusammenfassung:**

Die Lernenden verfolgen, wie aus dem Wasserdampf von Lernseite 1 Wolken und Regen werden und wohin das Regenwasser fließt. Am Ende bringen sie die vier Schritte Verdunsten, Wolkenbildung, Regen und Abfließen in die richtige Reihenfolge (Lernziel 2). Stolperstein: Viele denken, eine Wolke sei Wasserdampf – sie besteht aber aus winzigen Wassertröpfchen; das sagt der Text ausdrücklich.

Die Lernseite dauert nach Faustregel etwa 12 bis 13 Minuten und passt damit zu den geplanten 15 Minuten.

<!-- data-key="content" -->
**Inhalt:**

1. Zwischenfolie „Lernseite: Wolken und Regen“ – die Begleiterin nennt die drei Schritte: eine Wolke entsteht, es regnet, das Quiz.
2. Aus Wasserdampf wird eine Wolke – der Wasserdampf steigt auf; oben ist die Luft kälter; der Dampf kühlt ab und wird wieder zu winzigen Wassertröpfchen; viele Tröpfchen zusammen sehen wir als Wolke. Alltagsbeispiel: Ein kalter Deckel über dem Kochtopf wird nass.
3. Aus der Wolke wird Regen – die Tröpfchen stoßen zusammen und werden größer und schwerer; dann fallen sie als Regen herunter. Das Wasser fließt in Bäche, Flüsse und ins Meer, ein Teil versickert im Boden. Dann beginnt der Kreislauf von vorn.
4. Quiz zur Selbstkontrolle – die vier Schritte ordnen.
5. Geschafft! – ein Satz fasst den Kreislauf zusammen; ankreuzen, was ich schon kann.

Neue Kernbegriffe: Wolkenbildung (Tröpfchen), Regen, Abfließen – Verdunsten und Wasserdampf kennen die Lernenden von Lernseite 1. Jeder Begriff bekommt einen eigenen Satz; statt eines Bildes erinnert der Text an die Abbildung des Kreislaufs aus dem Unterricht. Jeder Text hat eine Vorlesefassung.

<!-- data-key="activities" -->
**Aktivitäten:**

1. Kleine Aufgabe zur Wolke: „Woraus besteht eine Wolke?“ – eine Antwort auswählen (winzige Wassertröpfchen · Rauch · Wasserdampf), mit Tipp nach dem ersten Fehler.
2. Quiz zur Selbstkontrolle: die vier Schritte in die richtige Reihenfolge bringen – für jeden Platz 1 bis 4 einen Schritt aus einer Auswahlliste wählen; genau eine richtige Reihenfolge, Tipp nach dem ersten Fehler („Was macht die Sonne zuerst mit dem Wasser im Meer?“).
3. Geschafft!: ankreuzen, was ich schon kann (Selbsteinschätzung, kein Test).

<!-- data-key="building-blocks" -->
**Bausteine:** keine – Auswahlaufgabe und Reihenfolge mit Auswahllisten bringt LiaScript selbst mit.

<!-- data-key="references" -->
**Quellen:**

1. Gliederung dieses Kurses, Lernziel 2, und Lernseite 1 „Der Wasserkreislauf“ (Wasserdampf und Verdunsten als Vorwissen).
2. Die Abbildung des Wasserkreislaufs aus dem Unterricht, die die Lernenden kennen.


---

## Agents – Assistenten

<!-- class="journal-actions" -->
[▶️ Assistenten anpassen](agent:teaching/configure-agent) `:configure-agent <agent>` · [▶️ Neues Lernendenprofil](agent:teaching/create-learner-persona) `:create-learner-persona`

<!--- Read-scope rule: Coauthor and specialist agents are direct ### subsections; each agent reads only its assigned subsection. --->

_Projektbezogene Einstellungen der Assistenten und Lernendenprofile._

<section>

### Coauthor

_Regeln für das Schreiben des Materials: Stimme der Begleitfigur, Hinweise, Grenzen._

<!--- Rules for writing the material derived by :create-didactics on 24.11.2026 (entries marked data-from="didactics"). --->

* __Customization Status:__ active
* __Role / Persona:__
  Eine freundliche Lernbegleiterin ohne eigenen Namen: spricht die Lernenden mit „du“ an, liest jeden Text vor und führt Schritt für Schritt durch die Seite. <!-- data-from="didactics" -->
* __Behavior Additions:__
  1. Jede Lernseite folgt dem Ablauf Zwischenfolie → Erklärung mit kleiner Aufgabe → Quiz zur Selbstkontrolle → „Geschafft!“. <!-- data-from="didactics" -->
  2. Nach dem ersten falschen Versuch im Quiz einen Tipp geben, der an Bekanntes aus dem Alltag erinnert – nie gleich die Lösung. <!-- data-from="didactics" -->
  3. Fachwörter beim ersten Vorkommen mit einem Alltagsbeispiel erklären. <!-- data-from="didactics" -->
* __Preferred Interaction Style:__
  Locker und freundlich, kurze Sätze, kurzes und ehrliches Lob. <!-- data-from="didactics" -->
* __Project-Specific Rules:__
  1. Jeder Text und jede Antwort bekommt eine Vorlesefassung (Erzählstimme Deutsch Female). <!-- data-from="didactics" -->
  2. Keine Bilder: Die Lernenden kennen die Abbildung des Kreislaufs aus dem Unterricht. <!-- data-from="didactics" -->
  3. Eine Lernseite dauert etwa 15 Minuten allein am Laptop; höchstens drei bis fünf Kernbegriffe pro Lernseite. <!-- data-from="didactics" -->
  4. Alle Lernseiten stehen als Kapitel in einer einzigen Kursdatei (LiaScript). <!-- data-from="didactics" -->
* __Persona Voice Sample:__
  „Hallo! Erinnerst du dich? Die Sonne macht das Wasser im Meer warm. Dann steigt es als Wasserdampf nach oben. Oben ist es kalt. Da wird der Dampf wieder zu winzigen Tröpfchen – so entsteht eine Wolke. Klicke auf ▶, dann lese ich dir alles noch einmal vor.“ <!-- data-from="didactics" -->
* __Boundaries / Never:__
  1. Die Grundregeln für Ablauf, Prüfung, Sicherheit und Quellen nicht außer Kraft setzen.

### Teaching-Agent

* __Customization Status:__ inactive
* __Behavior Additions:__
  1. keine
* __Preferred Interaction Style:__
  keine
* __Project-Specific Rules:__
  1. keine
* __Boundaries / Never:__
  1. Die Grundregeln für Ablauf, Prüfung, Sicherheit und Quellen nicht außer Kraft setzen.

### Artist-Agent

* __Customization Status:__ inactive
* __Behavior Additions:__
  1. keine
* __Preferred Visual Priorities:__
  keine
* __Project-Specific Rules:__
  1. keine
* __Boundaries / Never:__
  1. Die Grundregeln für einheitliche Gestaltung, Barrierefreiheit und Unsicherheit nicht außer Kraft setzen.

### Development-Agent

* __Customization Status:__ inactive
* __Behavior Additions:__
  1. keine
* __Preferred Publishing Workflow:__
  keine
* __Project-Specific Rules:__
  1. keine
* __Boundaries / Never:__
  1. Prüfschwellen, Git-Sicherheit und Veröffentlichungsprüfungen nicht außer Kraft setzen.

</section>

### Learner Personas – Lernendenprofile

<!--- Optional — filled by :create-learner-persona. One `#### Persona: {icon} {name}` subsection per persona (structure: tasks/create-learner-persona.md). --->

_Noch keine Lernendenprofile._

---

## Validation – Prüfung

<!--- Replaced by :validate-course (course mode). The ### Latest Validation Summary below is the authoritative publishing gate — publishing requires `Mode: course` and `Result: PASS`. Per-session reports live in ## Sessions → #### Validation Report, not here. The action line is added by update-dashboard once every unit has material. --->

### Latest Validation Summary – Letzte Kursprüfung

<!--- Written by :validate-course 1 (one unit, one run) on 12.11.2026; rewritten with the approval on 12.11.2026. Outcome and recommendation rewritten for the full track by :activate-section on 13.11.2026 (no new run). --->

**Ergebnis:** noch nicht bereit zum Veröffentlichen – die Prüfung des ganzen Kurses folgt nach der letzten Lernseite (13.11.2026)

<details><summary>Technischer Teil</summary>

- Date: 2026-11-12
- Mode: course
- Result: FAIL
- Issues found: 0
- Mechanical open: 0
- Sessions checked: 1

</details>

<!-- data-key="course-findings" -->
**Ergebnisse für den Kurs:**

- **Grundlagen:** ✅ Kursrahmen und Gliederung (Stand der Prüfung vom 12.11.2026)
- **Bausteine:** ✅ keine im Einsatz (Stand der Prüfung vom 12.11.2026)
- **Ablaufplan:** übersprungen – für diesen Kurs nicht nötig
- **Lernseiten:** Lernseite 1 bestanden (12.11.2026) und freigegeben; nachgeprüft am 13.11.2026 (Zwischenfolie)
- **Material:** Lernseite 1 — Der Wasserkreislauf: ohne Bilder (Entscheidung vom 11.11.2026)

<!-- data-key="recommended-actions" -->
**Empfohlene Schritte:**
1. Die Prüfung des ganzen Kurses folgt nach der letzten Lernseite.

---

## Publishing – Veröffentlichung

<!--- Maintained by the Development-Agent (:create-project, :update-project): read from the repository before anything is published. The dashboard shows it. __State:__ stays an English key. --->

* __Repository:__ noch keins
* __Branch:__ —
* __Viewer URL:__ —
* __State:__ not published

---

## Analysis Status – Analysestand

<!--- Filled by :analyze-existing. --->

_Nur nötig, wenn ein bestehender Kurs überarbeitet wird._

---

## Notes Backup – Notizen

<!-- class="journal-actions" -->
[▶️ Notizen sichern](agent:teaching/save-notes) `:save-notes` · [▶️ Entscheidung festhalten](agent:teaching/save-decision) `:save-decision <title>`

<!--- Appended to by :save-notes and :save-decision from templates/note-backup.yaml. Each note is one append-only `### {Type, in the course language}: {Descriptive Title} ({YYYY-MM-DD})` subsection. --->

_Noch keine Notizen._
