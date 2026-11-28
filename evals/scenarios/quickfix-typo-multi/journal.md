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
  "context": "Klasse 6 · 24 Lernende · vier Stunden mit je 15 Minuten allein am Laptop",
  "subtitle": "Drei von vier Lernseiten sind geprüft und von Ihnen freigegeben. Lernseite 4 hat ihre Planungsskizze; das Material fehlt noch.",
  "next": {
    "icon": "▶️",
    "title": "Material ausarbeiten – Lernseite 4",
    "why": "Texte, Aufgaben und Selbstkontrolle entstehen gemeinsam; jeder Teil wird vorher gezeigt.",
    "label": "Lernseite 4 ausarbeiten",
    "href": "agent:teaching/coauthor-materials?number=4",
    "command": ":coauthor-materials 4"
  },
  "labels": {
    "decide": "Noch zu entscheiden",
    "prepare": "Vor dem Einsatz vorbereiten",
    "viewMaterial": "So sehen es die Lernenden"
  },
  "units": [
    {
      "id": 1,
      "title": "Wo ist das Wasser?",
      "summary": "Drei Folien und ein Quiz, jeder Text zum Vorlesen.",
      "process": {
        "title": "Wo ist das Wasser?",
        "steps": [
          {
            "title": "Planen",
            "state": "done",
            "why": "Die Planungsskizze legt Inhalte, Aufgaben und Selbstkontrolle fest, bevor Material entsteht."
          },
          {
            "title": "Material ausarbeiten",
            "state": "done",
            "why": "Texte, Aufgaben und Selbstkontrolle entstehen gemeinsam; jeder Teil wird vorher gezeigt."
          },
          {
            "title": "Bilder einfügen",
            "state": "done",
            "why": "Die markierten Stellen bekommen ihre Bilder.",
            "result": "keine Bilder – Ihre Entscheidung vom 11.11.2026"
          },
          {
            "title": "Prüfen und freigeben",
            "state": "done",
            "why": "Die Prüfung zeigt, ob das Material zu den Zielen und zur Zeit passt; danach geben Sie es frei.",
            "result": "bestanden und am 11.11.2026 von Ihnen freigegeben"
          }
        ]
      },
      "state": "done",
      "href": "#1.-wo-ist-das-wasser?",
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
      "title": "Verdunsten und Wolken",
      "state": "done",
      "process": {
        "title": "Verdunsten und Wolken",
        "steps": [
          {
            "title": "Planen",
            "state": "done",
            "why": "Die Planungsskizze legt Inhalte, Aufgaben und Selbstkontrolle fest, bevor Material entsteht."
          },
          {
            "title": "Material ausarbeiten",
            "state": "done",
            "why": "Texte, Aufgaben und Selbstkontrolle entstehen gemeinsam; jeder Teil wird vorher gezeigt."
          },
          {
            "title": "Bilder einfügen",
            "state": "done",
            "why": "Die markierten Stellen bekommen ihre Bilder.",
            "result": "keine Bilder – Ihre Entscheidung vom 12.11.2026"
          },
          {
            "title": "Prüfen und freigeben",
            "state": "done",
            "why": "Die Prüfung zeigt, ob das Material zu den Zielen und zur Zeit passt; danach geben Sie es frei.",
            "result": "bestanden und am 12.11.2026 von Ihnen freigegeben"
          }
        ]
      },
      "href": "#2.-verdunsten-und-wolken",
      "view": {
        "href": "agent:teaching/preview?file=2",
        "command": ":preview 2"
      },
      "statusLabel": "geprüft ✅",
      "usable": {
        "state": "yes"
      },
      "approved": true
    },
    {
      "id": 3,
      "title": "Regen und Abfließen",
      "state": "done",
      "process": {
        "title": "Regen und Abfließen",
        "steps": [
          {
            "title": "Planen",
            "state": "done",
            "why": "Die Planungsskizze legt Inhalte, Aufgaben und Selbstkontrolle fest, bevor Material entsteht."
          },
          {
            "title": "Material ausarbeiten",
            "state": "done",
            "why": "Texte, Aufgaben und Selbstkontrolle entstehen gemeinsam; jeder Teil wird vorher gezeigt."
          },
          {
            "title": "Bilder einfügen",
            "state": "done",
            "why": "Die markierten Stellen bekommen ihre Bilder.",
            "result": "keine Bilder – Ihre Entscheidung vom 13.11.2026"
          },
          {
            "title": "Prüfen und freigeben",
            "state": "done",
            "why": "Die Prüfung zeigt, ob das Material zu den Zielen und zur Zeit passt; danach geben Sie es frei.",
            "result": "bestanden und am 13.11.2026 von Ihnen freigegeben"
          }
        ]
      },
      "href": "#3.-regen-und-abfließen",
      "view": {
        "href": "agent:teaching/preview?file=3",
        "command": ":preview 3"
      },
      "statusLabel": "geprüft ✅",
      "usable": {
        "state": "yes"
      },
      "approved": true
    },
    {
      "id": 4,
      "title": "Der ganze Kreislauf",
      "state": "current",
      "process": {
        "title": "Der ganze Kreislauf",
        "steps": [
          {
            "title": "Planen",
            "state": "done",
            "why": "Die Planungsskizze legt Inhalte, Aufgaben und Selbstkontrolle fest, bevor Material entsteht."
          },
          {
            "title": "Material ausarbeiten",
            "state": "current",
            "why": "Texte, Aufgaben und Selbstkontrolle entstehen gemeinsam; jeder Teil wird vorher gezeigt."
          },
          {
            "title": "Bilder einfügen",
            "state": "optional",
            "why": "Die markierten Stellen bekommen ihre Bilder."
          },
          {
            "title": "Prüfen und freigeben",
            "state": "planned",
            "why": "Die Prüfung zeigt, ob das Material zu den Zielen und zur Zeit passt; danach geben Sie es frei."
          }
        ]
      },
      "href": "#4.-der-ganze-kreislauf",
      "statusLabel": "Planungsskizze ✅ · Material offen"
    }
  ],
  "process": {
    "title": "So entsteht Ihre Lernseite",
    "description": "Die Schritte vom Rahmen bis zum Link für die Lernenden. Diese Übersicht zeigt immer, wo wir gerade stehen.",
    "steps": [
      {
        "title": "Den Rahmen festlegen",
        "state": "done",
        "why": "Thema, Zielgruppe, Format und Sprache prägen alles, was folgt."
      },
      {
        "title": "Gliederung und Lernziele",
        "state": "done",
        "why": "Klare Lernziele sagen, was die Lernenden am Ende können."
      },
      {
        "title": "Didaktik",
        "state": "done",
        "why": "Methoden, Aufgabenformen und Unterstützung, die zu den Lernzielen passen."
      },
      {
        "title": "Bausteine für Aktivitäten",
        "state": "planned",
        "why": "Fertige Bausteine wie eine Zeichenfläche oder eine Karte – oder ein eigener, wenn nichts passt."
      },
      {
        "title": "Material erstellen",
        "state": "current",
        "why": "Erklärungen, Aufgaben und Selbstkontrollen entstehen aus der Planung."
      },
      {
        "title": "Prüfen und überarbeiten",
        "state": "planned",
        "why": "Verständlichkeit und Passung zu den Lernzielen werden geprüft, bevor das Material eingesetzt wird.",
        "statusLabel": "Kursprüfung nach der letzten Lernseite · schon freigegeben: Lernseite 1, Lernseite 2, Lernseite 3"
      },
      {
        "title": "Veröffentlichen",
        "state": "planned",
        "why": "Optional: den geprüften Kurs als Link teilen."
      }
    ],
    "note": "Sie können jederzeit einen Schritt zurückgehen. Fertig ist die Lernseite erst, wenn ihre Prüfung bestanden ist und Sie sie freigegeben haben.",
    "later": [
      {
        "label": "Gestaltung",
        "href": "agent:teaching/activate-section?section=visual-identity",
        "command": ":activate-section visual-identity"
      },
      {
        "label": "Ablaufplan",
        "href": "agent:teaching/activate-section?section=agenda",
        "command": ":activate-section agenda"
      },
      {
        "label": "Lernendenprofile",
        "href": "agent:teaching/activate-section?section=learner-personas",
        "command": ":activate-section learner-personas"
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
  "selected": "4",
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
  "footer": "Stand: 27.11.2026"
}
```

---

## Course Context – Kursrahmen

<!-- class="journal-actions" -->
[✏️ Kursrahmen überarbeiten](agent:teaching/init-course) `:init-course`

<!--- Filled by :init-course from templates/course-context.yaml (layout: summary table + <details>). --->

**Kursrahmen:** bestätigt am 11.11.2026.

<!-- data-type="none" -->
| Punkt | Entschieden |
|---|---|
| Vorhaben | eine Reihe von vier Lernseiten, je eine pro Station des Kreislaufs |
| Thema und Titel | Der Wasserkreislauf |
| Lernende | Klasse 6, 24 Lernende |
| Einsatz | zur Wiederholung, allein am Laptop, vier Stunden mit je etwa 15 Minuten |
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
  1. Persona type: tutor
  2. Agenda required: no
  3. Pacing: n/a
  4. Assessment defaults: self-check quizzes
  5. Units: 4 × 15 min
  6. Delivery: link

* __File Structure:__
  1. Mode: multi-file
  2. Session folder naming: materials/NN-thema.md

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
  Klasse 6, 24 Lernende. Sie arbeiten zur Wiederholung allein am Laptop, je Stunde etwa 15 Minuten.

<!-- data-key="learning-goals" -->
* __Lernziele:__
  1. Die Lernenden können die Orte nennen, an denen Wasser auf der Erde vorkommt.
  2. Die Lernenden können beschreiben, wie Wasser verdunstet und Wolken bildet.
  3. Die Lernenden können erklären, wie Regen fällt und abfließt.
  4. Die Lernenden können die Stationen des Kreislaufs in die richtige Reihenfolge bringen.

<!-- data-key="session-overview" -->
* __Lernseiten:__
  1. Wo ist das Wasser? – Meer, Flüsse und Seen, Wolken, Boden (Ziel 1)
  2. Verdunsten und Wolken – Sonne, Wasserdampf, Abkühlen (Ziel 2)
  3. Regen und Abfließen – Tropfen, Bäche, Flüsse, Grundwasser (Ziel 3)
  4. Der ganze Kreislauf – alle Stationen ordnen, Abschlussquiz (Ziel 4)

---

## Didactics – Didaktik

<!-- class="journal-actions" -->
[✏️ Didaktik überarbeiten](agent:teaching/create-didactics) `:create-didactics` · [🎨 Gestaltung](agent:artist/create-visuals) `:agent artist` → `:create-visuals`

<!--- Filled by :create-didactics from templates/course-didactics.yaml. --->

* __Didactic Concept:__
  Kurze Lernseiten zum Wiederholen: erst erinnern, dann eine Aufgabe, am Ende ankreuzen, was ich schon kann. Jeder Text zum Vorlesen.

* __Professor Persona:__
  Eine freundliche Lernbegleiterin, die duzt und in kurzen Sätzen spricht.

* __Teaching Style:__
  ruhig, ermutigend, mit Alltagsbeispielen (Topf auf dem Herd, Pfütze nach dem Regen)

* __Course Type:__
  self-paced – jede Lernseite in einer Stunde, etwa 15 Minuten

* __Didactic Framework:__
  none

* __Default Session Method:__
  none

* __Difficulty Level:__
  beginner

* __Persona Voice Sample:__
  Hallo! Heute schauen wir, wohin das Wasser wandert. Stell dir einen Topf auf dem Herd vor. Das Wasser wird warm und steigt als Dampf nach oben. Genau das passiert auch am Meer – nur viel größer.

---

## Visual Identity – Gestaltung

<!-- state: later -->

_Bei Bedarf – für diesen Kurs noch nicht nötig._

[➕ hinzunehmen](agent:teaching/activate-section?section=visual-identity) `:activate-section visual-identity`

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

<!--- Managed by :create-session, :promote-session, :coauthor-materials and :validate-course. --->

1. Wo ist das Wasser? – geprüft ✅
2. Verdunsten und Wolken – geprüft ✅
3. Regen und Abfließen – geprüft ✅
4. Der ganze Kreislauf – Planungsskizze ✅ · Material offen

<details><summary>Technische Übersicht</summary>

<!-- data-type="none" -->
| # | Title | Type | Skeleton | Material | Done | Notes |
|---|-------|------|----------|----------|------|-------|
| 1 | Wo ist das Wasser? | n/a | ✅ | ✅ `materials/01-wasser.md` | ✅ | geprüft ✅ |
| 2 | Verdunsten und Wolken | n/a | ✅ | ✅ `materials/02-verdunsten.md` | ✅ | geprüft ✅ |
| 3 | Regen und Abfließen | n/a | ✅ | ✅ `materials/03-regen.md` | ✅ | geprüft ✅ |
| 4 | Der ganze Kreislauf | n/a | ✅ | — |  | Planungsskizze ✅ · Material offen |

</details>

### 1. Wo ist das Wasser?

<!-- class="journal-actions" -->
[👁 So sehen es die Lernenden](agent:teaching/preview?file=1) `:preview 1`

<!-- data-key="summary" -->
**Zusammenfassung:**

Die Lernenden nennen die Orte, an denen Wasser auf der Erde vorkommt. (Ziel 1)

<!-- data-key="decisions" -->
**Entscheidungen:**

- **11.11.2026:** Keine Bilder: Die Lernenden kennen die Abbildung des Kreislaufs aus dem Unterricht.
- **11.11.2026:** Material freigegeben

#### Prüfbericht – Lernseite 1

<section data-key="validation-report">

**Ergebnis:** bestanden (11.11.2026)

**Jetzt mit den Lernenden nutzbar:** ja

**Was gut ist:**

- Das Lernziel hat seine Folie und sein Quiz.
- Jeder Text und jede Antwort hat ▶ zum Vorlesen.
- Die Seite dauert nach Faustregel etwa 12 Minuten und passt zu den geplanten 15 Minuten.

<details>
<summary>Technischer Bericht</summary>

- __Date:__ 2026-11-11
- __Material:__ materials/01-wasser.md
- __Result:__ PASS
- __Mode:__ session

**Content:**
- Lernziel 1: „Wo ist das Wasser?“ – ✅

**LiaScript Syntax:**
- Kopf (author, version, language, narrator) – ✅
- Überschriften: ein `#`, drei `##` – ✅

**Recommended Actions:**
1. Keine.

</details>

</section>

### 2. Verdunsten und Wolken

<!-- class="journal-actions" -->
[👁 So sehen es die Lernenden](agent:teaching/preview?file=2) `:preview 2`

<!-- data-key="summary" -->
**Zusammenfassung:**

Die Lernenden beschreiben, wie Wasser verdunstet und zu Wolken wird. (Ziel 2)

<!-- data-key="decisions" -->
**Entscheidungen:**

- **12.11.2026:** Keine Bilder: Die Lernenden kennen die Abbildung des Kreislaufs aus dem Unterricht.
- **12.11.2026:** Material freigegeben

#### Prüfbericht – Lernseite 2

<section data-key="validation-report">

**Ergebnis:** bestanden (12.11.2026)

**Jetzt mit den Lernenden nutzbar:** ja

**Was gut ist:**

- Das Lernziel hat seine Folie und sein Quiz.
- Jeder Text und jede Antwort hat ▶ zum Vorlesen.
- Die Seite dauert nach Faustregel etwa 12 Minuten und passt zu den geplanten 15 Minuten.

<details>
<summary>Technischer Bericht</summary>

- __Date:__ 2026-11-12
- __Material:__ materials/02-verdunsten.md
- __Result:__ PASS
- __Mode:__ session

**Content:**
- Lernziel 2: „Verdunsten und Wolken“ – ✅

**LiaScript Syntax:**
- Kopf (author, version, language, narrator) – ✅
- Überschriften: ein `#`, drei `##` – ✅

**Recommended Actions:**
1. Keine.

</details>

</section>

### 3. Regen und Abfließen

<!-- class="journal-actions" -->
[👁 So sehen es die Lernenden](agent:teaching/preview?file=3) `:preview 3`

<!-- data-key="summary" -->
**Zusammenfassung:**

Die Lernenden erklären, wie Regen fällt und das Wasser zurück ins Meer fließt. (Ziel 3)

<!-- data-key="decisions" -->
**Entscheidungen:**

- **13.11.2026:** Keine Bilder: Die Lernenden kennen die Abbildung des Kreislaufs aus dem Unterricht.
- **13.11.2026:** Material freigegeben

#### Prüfbericht – Lernseite 3

<section data-key="validation-report">

**Ergebnis:** bestanden (13.11.2026)

**Jetzt mit den Lernenden nutzbar:** ja

**Was gut ist:**

- Das Lernziel hat seine Folie und sein Quiz.
- Jeder Text und jede Antwort hat ▶ zum Vorlesen.
- Die Seite dauert nach Faustregel etwa 12 Minuten und passt zu den geplanten 15 Minuten.

<details>
<summary>Technischer Bericht</summary>

- __Date:__ 2026-11-13
- __Material:__ materials/03-regen.md
- __Result:__ PASS
- __Mode:__ session

**Content:**
- Lernziel 3: „Regen und Abfließen“ – ✅

**LiaScript Syntax:**
- Kopf (author, version, language, narrator) – ✅
- Überschriften: ein `#`, drei `##` – ✅

**Recommended Actions:**
1. Keine.

</details>

</section>

### 4. Der ganze Kreislauf

<!-- class="journal-actions" -->
[▶️ Lernseite 4 ausarbeiten](agent:teaching/coauthor-materials?number=4) `:coauthor-materials 4`

<!-- data-key="summary" -->
**Zusammenfassung:**

Die Lernenden bringen alle Stationen in die richtige Reihenfolge. (Ziel 4)

<!-- data-key="decisions" -->
**Entscheidungen:**

- **14.11.2026:** Keine Bilder: Die Lernenden kennen die Abbildung des Kreislaufs aus dem Unterricht.

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

<!-- state: later -->

_Bei Bedarf – für diesen Kurs noch nicht nötig._

[➕ hinzunehmen](agent:teaching/activate-section?section=learner-personas) `:activate-section learner-personas`

---

## Validation – Prüfung

<!--- Replaced by :validate-course (course mode). The ### Latest Validation Summary below is the authoritative publishing gate — publishing requires `Mode: course` and `Result: PASS`. Per-session reports live in ## Sessions → #### Validation Report, not here. --->

### Latest Validation Summary – Letzte Kursprüfung

<!--- Not yet run. --->
Die Kursprüfung läuft, sobald alle Lernseiten fertig sind.

---

## Publishing – Veröffentlichung

<!--- Maintained by the Development-Agent (:create-project, :update-project): read from the repository before anything is published. The dashboard shows it. __State:__ stays an English key. --->

* __Repository:__ noch keins
* __Branch:__ —
* __Viewer URL:__ —
* __State:__ not published

---

## Analysis Status – Analysestand

<!-- state: later -->

_Bei Bedarf – für diesen Kurs noch nicht nötig._

[➕ hinzunehmen](agent:teaching/activate-section?section=analysis-status) `:activate-section analysis-status`

---

## Notes Backup – Notizen

<!-- class="journal-actions" -->
[▶️ Notizen sichern](agent:teaching/save-notes) `:save-notes` · [▶️ Entscheidung festhalten](agent:teaching/save-decision) `:save-decision <title>`

<!--- Appended to by :save-notes and :save-decision from templates/note-backup.yaml. Each note is one append-only `### {Type, in the course language}: {Descriptive Title} ({YYYY-MM-DD})` subsection. --->

_Noch keine Notizen._