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
  "subtitle": "Aus der kleinen Seite wird ein Kurs mit zwei Lernseiten. Lernseite 1 „Der Wasserkreislauf“ ist geprüft und freigegeben; sie beginnt jetzt mit einer Zwischenfolie. Für Lernseite 2 fehlen noch Lernziele und Folien.",
  "next": {
    "icon": "▶️",
    "title": "Gliederung und Lernziele",
    "why": "Für Lernseite 2 fehlen noch Lernziele und Folienplan. Die legen wir zuerst fest – dann weiß der Assistent, was er schreiben soll.",
    "label": "Gliederung ergänzen",
    "href": "agent:teaching/create-outline",
    "command": ":create-outline"
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
        "state": "current",
        "why": "Klare Lernziele sagen, was die Lernenden am Ende können.",
        "result": "zwei Lernziele und drei Folien für „Der Wasserkreislauf“",
        "next": "Lernziele und Folien für Lernseite 2 ergänzen"
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
        "title": "Material erstellen",
        "state": "planned",
        "why": "Erklärungen, Aufgaben und Selbstkontrollen entstehen aus der Planung.",
        "result": "Lernseite 1 „Der Wasserkreislauf“",
        "next": "Lernseite 2 entsteht nach der Didaktik"
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
  "explore": [
    {
      "icon": "💬",
      "title": "Einfach fragen",
      "description": "Fragen Sie in eigenen Worten, wann immer etwas unklar ist.",
      "label": "Was kann der Assistent?",
      "href": "agent:teaching/help",
      "command": ":help"
    }
  ],
  "selected": "",
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
  "unitsTitle": "Lernseiten",
  "unitLabel": {
    "one": "Lernseite",
    "many": "Lernseiten"
  },
  "footer": "Stand: 13.11.2026",
  "unitsPlanned": 2
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

<!-- data-key="title" -->
* __Titel:__
  Der Wasserkreislauf

<!-- data-key="target-audience" -->
* __Zielgruppe:__
  Klasse 6, 24 Lernende. Sie arbeiten zur Wiederholung allein am Laptop, etwa 15 Minuten.

<!-- data-key="learning-goals" -->
* __Lernziele:__
  1. Die Lernenden können die Orte nennen, an denen Wasser auf der Erde vorkommt.
  2. Die Lernenden können die Schritte Verdunsten, Wolkenbildung, Regen und Abfließen in die richtige Reihenfolge bringen.

<!-- data-key="session-overview" -->
* __Folien:__
  1. Wo ist das Wasser? – Meer, Flüsse und Seen, Wolken, Boden (Ziel 1)
  2. Quiz: Was passiert zuerst? – den Schritt nach dem Verdunsten wählen (Ziel 2)
  3. Geschafft! – ankreuzen, was ich schon kann

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

<!-- state: later -->

_Bei Bedarf – für diesen Kurs noch nicht nötig._

[➕ hinzunehmen](agent:teaching/activate-section?section=agenda) `:activate-section agenda`

---

## Sessions – Lernseiten

<!-- class="journal-actions" -->
[▶️ Zuerst die Didaktik](agent:teaching/create-didactics) `:create-didactics`

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

<details><summary>Technische Übersicht</summary>

<!-- data-type="none" -->
| # | Title | Type | Skeleton | Material | Done | Notes |
|---|-------|------|----------|----------|------|-------|
| 1 | Der Wasserkreislauf | n/a | ✅ | ✅ | ✅ | geprüft ✅ |

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
