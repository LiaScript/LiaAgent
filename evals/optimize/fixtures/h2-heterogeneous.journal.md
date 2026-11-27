<!--
language: de
color: <span style="display:inline-block;width:1.5rem;height:1.5rem;background-color:@0;border:1px solid #ccc;border-radius:2px;vertical-align:middle;"></span> `@0`

import: ./specs/dashboard/README.md
-->

# Bewerben in Deutschland

Hier wächst Ihr Kursplan. Sie bringen Ihre Idee mit; der Assistent im Chat hilft Ihnen, daraus Lernziele, Aufgaben und fertiges Material zu entwickeln. Sie prüfen jeden Vorschlag und entscheiden, was bleibt. **Ohne Ihre Bestätigung ändert sich nichts an Ihrer Planung und Ihrem Material. Die Übersicht hält der Assistent selbst aktuell.**

<!-- class="journal-start" -->
[Zur Übersicht →](#dashboard-–-übersicht)

## Dashboard – Übersicht

```json @Dashboard.View
{
  "title": "Bewerben in Deutschland",
  "context": "16 Erwachsene, Deutsch zwischen A2 und B1 · im Kursraum, Lehrkraft anwesend, wöchentlich 90 Minuten",
  "subtitle": "Der Kursrahmen steht (eine Reihe mit vier Einheiten im Kurs). Als Nächstes entsteht die Gliederung mit den Lernzielen.",
  "next": {
    "icon": "▶️",
    "title": "Gliederung und Lernziele",
    "why": "Klare Lernziele sagen, was die Lernenden am Ende können.",
    "label": "Gliederung erstellen",
    "href": "agent:teaching/create-outline",
    "command": ":create-outline"
  },
  "unitLabel": {
    "one": "Einheit",
    "many": "Einheiten"
  },
  "unitsTitle": "Einheiten",
  "units": [],
  "process": {
    "title": "So entsteht Ihr Kurs",
    "description": "Die Schritte vom Thema bis zum geprüften Material. Diese Übersicht zeigt immer, wo wir gerade stehen.",
    "steps": [
      {
        "title": "Den Rahmen festlegen",
        "state": "done",
        "why": "Thema, Zielgruppe, Format und Sprache prägen alles, was folgt.",
        "result": "Kursrahmen bestätigt am 20.11.2026"
      },
      {
        "title": "Gliederung und Lernziele",
        "state": "current",
        "why": "Klare Lernziele sagen, was die Lernenden am Ende können."
      },
      {
        "title": "Didaktik",
        "state": "planned",
        "why": "Methoden, Aufgabenformen und Unterstützung, die zu den Lernzielen passen."
      },
      {
        "title": "Bausteine für Aktivitäten",
        "state": "planned",
        "why": "Fertige Bausteine wie eine Zeichenfläche oder eine Karte – oder ein eigener, wenn nichts passt."
      },
      {
        "title": "Ablaufplan",
        "state": "optional",
        "why": "Wird mit dem Rahmen entschieden: Reihenfolge und Dauer der Einheiten."
      },
      {
        "title": "Material erstellen",
        "state": "planned",
        "why": "Erklärungen, Aufgaben und Selbstkontrollen entstehen aus der Planung."
      },
      {
        "title": "Prüfen und überarbeiten",
        "state": "planned",
        "why": "Verständlichkeit und Passung zu den Lernzielen werden geprüft, bevor das Material eingesetzt wird."
      },
      {
        "title": "Veröffentlichen",
        "state": "planned",
        "why": "Optional: den geprüften Kurs als Link teilen.",
        "statusLabel": "nötig – wenn alle Einheiten geprüft sind"
      }
    ],
    "note": "Sie können jederzeit einen Schritt zurückgehen. Fertig ist eine Einheit erst, wenn ihre Prüfung bestanden ist und Sie sie freigegeben haben."
  },
  "explore": [
    {
      "icon": "⚡",
      "title": "Schnellstart",
      "description": "Ein einziges Gespräch füllt Rahmen, Lernziele und Didaktik auf einmal.",
      "label": "Schnellstart",
      "href": "agent:teaching/scaffold",
      "command": ":scaffold"
    },
    {
      "icon": "🔍",
      "title": "Bestehenden Kurs verbessern",
      "description": "Nur wenn es schon LiaScript-Material gibt, das überarbeitet werden soll.",
      "label": "Kurs analysieren",
      "href": "agent:teaching/analyze-existing",
      "command": ":analyze-existing"
    },
    {
      "icon": "💬",
      "title": "Einfach fragen",
      "description": "Fragen Sie in eigenen Worten, wann immer etwas unklar ist.",
      "label": "Was kann der Assistent?",
      "href": "agent:teaching/help",
      "command": ":help"
    }
  ],
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
      "label": "Notizen",
      "href": "#notes-backup-–-notizen"
    }
  ],
  "footer": "Stand: 27.11.2026",
  "unitsPlanned": 4
}
```

---

## Course Context – Kursrahmen

<!-- class="journal-actions" -->
[✏️ Kursrahmen überarbeiten](agent:teaching/init-course) `:init-course`

<!--- Filled by :init-course from templates/course-context.yaml (layout: summary table + <details>). --->

**Kursrahmen:** bestätigt am 20.11.2026.

<!-- data-type="none" -->
| Punkt | Entschieden |
|---|---|
| Vorhaben | eine Reihe mit vier Einheiten im Kurs |
| Thema und Titel | Bewerben in Deutschland |
| Lernende | 16 Erwachsene, Deutsch zwischen A2 und B1 |
| Einsatz | im Kursraum, Lehrkraft anwesend, wöchentlich 90 Minuten |
| Anrede der Lernenden | Sie |
| Zugang | über einen Link |
| Sprache der Seite | Deutsch, einfache Sprache |

<details><summary>Technische Einstellungen für den Assistenten</summary>

* __Course Type:__
  1. Type: lecture-series
  2. Working Title: Bewerben in Deutschland
  3. Target Group: 16 Erwachsene in einem Integrationskurs, Deutsch zwischen A2 und B1

* __Track:__
  1. Track: full
  2. Convert mode: n/a
  3. Source: n/a

* __Terminology:__
  1. sessions-called: Einheit

* __Course Profile:__
  1. Persona type: tutor
  2. Agenda required: yes
  3. Pacing: scheduled
  4. Assessment defaults: reflection, group work
  5. Units: 4 × 90 min
  6. Delivery: link

* __File Structure:__
  1. Mode: multi-file
  2. Session folder naming: `{number}-{slug}`

* __Conventions & Standards:__
  1. Language: de
  2. Tone: informal
  3. Person: Sie
  4. Instructor Address: Sie
  5. Author: F. Beispiel
  6. Contact: 

* __LiaScript conventions:__
  - keine besonderen

* __Additional Notes:__
  - Für die Gliederung: Die Teilnehmenden sollen einen Lebenslauf schreiben und sich in einem Vorstellungsgespräch vorstellen können.

</details>

---

## Outline – Gliederung

<!-- class="journal-actions" -->
[▶️ Gliederung erstellen](agent:teaching/create-outline) `:create-outline`

<!--- Filled by :create-outline from templates/course-outline.yaml. --->

_Noch leer – entsteht mit „Gliederung erstellen“, dem Schritt nach dem Kursrahmen._

---

## Didactics – Didaktik

<!-- class="journal-actions" -->
[▶️ Didaktik planen](agent:teaching/create-didactics) `:create-didactics` · [🎨 Gestaltung](agent:artist/create-visuals) `:agent artist` → `:create-visuals`

<!--- Filled by :create-didactics from templates/course-didactics.yaml. --->

_Noch leer – entsteht mit „Didaktik planen“, dem Schritt nach der Gliederung._

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

<!-- class="journal-actions" -->
[▶️ Ablaufplan erstellen](agent:teaching/create-agenda) `:create-agenda`

<!--- Filled by :create-agenda from templates/course-agenda.yaml (skip if the course profile says agenda: no). --->

_Noch leer – entsteht mit „Ablaufplan erstellen“, dem Schritt nach der Didaktik._

---

## Sessions – Einheiten

<!-- class="journal-actions" -->
[▶️ Zuerst die Didaktik](agent:teaching/create-didactics) `:create-didactics`

<!--- Managed by :create-session, :promote-session, :coauthor-materials and :validate-course. Overview first — status list, then the technical table in <details> (templates/session-skeleton.yaml → section_layout.overview) — then one `### {n}. {title}` subsection per session. --->

_Noch keine Einheiten – sie entstehen nach der Didaktik (und dem Ablaufplan, wenn einer geplant ist)._

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

<details><summary>Technische Übersicht</summary>

<!-- data-type="none" -->
| # | Title | Type | Skeleton | Material | Done | Notes |
|---|-------|------|----------|----------|------|-------|

</details>

---

## Agents – Assistenten

<!-- class="journal-actions" -->
[▶️ Assistenten anpassen](agent:teaching/configure-agent) `:configure-agent <agent>` · [▶️ Neues Lernendenprofil](agent:teaching/create-learner-persona) `:create-learner-persona`

<!--- Read-scope rule: Coauthor and specialist agents are direct ### subsections; each agent reads only its assigned subsection. --->

_Projektbezogene Einstellungen der Assistenten und Lernendenprofile._

<section>

### Coauthor

_Regeln für das Schreiben des Materials: Stimme der Begleitfigur, Hinweise, Grenzen._

* __Customization Status:__ inactive
* __Role / Persona:__
  keine
* __Behavior Additions:__
  1. keine
* __Preferred Interaction Style:__
  keine
* __Project-Specific Rules:__
  1. keine
* __Persona Voice Sample:__
  keine
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

<!--- Not yet run. Format: tasks/validate-course.md, course mode step 9. When the language switches, replace the visible line below with its translation. --->
Die Kursprüfung ist noch nicht gelaufen. Die Prüfungen der einzelnen Einheiten stehen unter „Einheiten“; die Kursprüfung kommt vor dem Veröffentlichen.

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
