<!--
language: en
color: <span style="display:inline-block;width:1.5rem;height:1.5rem;background-color:@0;border:1px solid #ccc;border-radius:2px;vertical-align:middle;"></span> `@0`

import: ./specs/dashboard/README.md
-->

# Garden composting

This is where your course plan grows. You bring your teaching idea; the assistant in the chat helps you turn it into learning objectives, activities and finished material. You check every proposal and decide what is kept. **Nothing in your plan or material changes without your confirmation; the assistant keeps the overview up to date itself.**

<!-- class="journal-start" -->
[Open the overview →](#dashboard)

## Dashboard

```json @Dashboard.View
{
  "title": "Garden composting",
  "context": "Adult learners · two units · opened as a link",
  "subtitle": "Your course now gets its content revised as well. Its new look and the reviewed images stay; both units are checked and approved. The outline comes first.",
  "next": {
    "icon": "▶️",
    "title": "Outline and learning objectives",
    "why": "The outline is still empty. It describes what the two existing units teach and what learners can do at the end – the basis for revising them.",
    "label": "Create outline",
    "href": "agent:teaching/create-outline",
    "command": ":create-outline"
  },
  "unitsTitle": "Units",
  "units": [
    {
      "id": 1,
      "title": "What goes into compost",
      "state": "done",
      "process": {
        "title": "What goes into compost",
        "steps": [
          {
            "title": "Look",
            "state": "done"
          },
          {
            "title": "Images",
            "state": "done"
          },
          {
            "title": "Check and approve",
            "state": "done",
            "why": "The check shows whether the material fits the objectives and the time; then you approve it."
          }
        ]
      },
      "href": "#1.-what-goes-into-compost",
      "view": {
        "href": "agent:teaching/preview?file=1",
        "command": ":preview 1"
      },
      "statusLabel": "checked ✅",
      "usable": {
        "state": "yes"
      },
      "approved": true
    },
    {
      "id": 2,
      "title": "Building a compost bin",
      "state": "done",
      "process": {
        "title": "Building a compost bin",
        "steps": [
          {
            "title": "Look",
            "state": "done"
          },
          {
            "title": "Images",
            "state": "done"
          },
          {
            "title": "Check and approve",
            "state": "done",
            "why": "The check shows whether the material fits the objectives and the time; then you approve it."
          }
        ]
      },
      "href": "#2.-building-a-compost-bin",
      "view": {
        "href": "agent:teaching/preview?file=2",
        "command": ":preview 2"
      },
      "statusLabel": "checked ✅",
      "usable": {
        "state": "yes"
      },
      "approved": true
    }
  ],
  "process": {
    "title": "How your course comes together",
    "description": "The steps from the topic to validated material. This overview always shows where we are.",
    "steps": [
      {
        "title": "Set the frame",
        "state": "done",
        "why": "Topic, target group, format and language shape everything that follows.",
        "result": "course frame for revising the existing course, since 13 Nov 2026 with content and structure"
      },
      {
        "title": "Outline and learning objectives",
        "state": "current",
        "why": "Clear objectives say what learners can do at the end.",
        "next": "Describe the two units and their learning objectives"
      },
      {
        "title": "Didactics",
        "state": "planned",
        "why": "Methods, task formats and support that fit the objectives."
      },
      {
        "title": "Templates for activities",
        "state": "planned",
        "why": "Ready-made building blocks such as a drawing board or a map – or your own if nothing fits."
      },
      {
        "title": "Create material",
        "state": "done",
        "why": "Explanations, tasks and self-checks grow out of the planning.",
        "result": "two existing units with the new look and reviewed images"
      },
      {
        "title": "Check and revise",
        "state": "planned",
        "why": "Clarity and fit to the objectives are checked before the material is used.",
        "statusLabel": "course check after the last unit · approved so far: unit 1, unit 2"
      },
      {
        "title": "Publish",
        "state": "planned",
        "why": "The checked course gets a link for the learners."
      }
    ],
    "note": "You can step back at any time. A unit only counts as finished once its check has passed and you have approved it. Since 13 Nov 2026 the course is revised in content and structure as well, so the steps of a full course show here; the look and the images stay as they are. There is no agenda – as you decided.",
    "later": [
      {
        "label": "Agenda",
        "href": "agent:teaching/activate-section?section=agenda",
        "command": ":activate-section agenda"
      }
    ]
  },
  "explore": [
    {
      "icon": "💬",
      "title": "Just ask",
      "description": "Ask in your own words whenever something is unclear.",
      "label": "What can the assistant do?",
      "href": "agent:teaching/help",
      "command": ":help"
    }
  ],
  "links": [
    {
      "label": "Course Context",
      "href": "#course-context"
    },
    {
      "label": "Outline",
      "href": "#outline"
    },
    {
      "label": "Didactics",
      "href": "#didactics"
    },
    {
      "label": "Visual Identity",
      "href": "#visual-identity"
    },
    {
      "label": "Sessions",
      "href": "#sessions"
    },
    {
      "label": "Notes",
      "href": "#notes-backup"
    }
  ],
  "footer": "As of 2026-11-13",
  "unitLabel": {
    "one": "unit",
    "many": "unit"
  }
}
```

---

## Course Context

<!-- class="journal-actions" -->
[✏️ Revise course frame](agent:teaching/init-course) `:init-course` · [🔍 Analyze course](agent:teaching/analyze-existing) `:analyze-existing`

<!--- Filled by :init-course from templates/course-context.yaml (layout: summary table + <details>). --->

<!--- Track switched from design to full by :activate-section on 13 Nov 2026 (the instructor wants to revise objectives and tasks too): course type stays improve-existing, no agenda (confirmed), row „What should get better“ changed; the when-needed markers of outline, didactics, learner profiles and analysis status removed, the agenda stays marked. --->

**Course frame:** confirmed on 12 Nov 2026, changed on 13 Nov 2026.

<!-- data-type="none" -->
| Item | Decided |
|---|---|
| What should get better | content and structure of the existing course; its new look and images stay |
| Topic and title | Garden composting |
| Learners | adults in a community garden course |
| Open the material | as a link |
| Language of the course | English, friendly, addressing learners as "you" |

<details><summary>Technical settings for the assistant</summary>

* __Course Type:__
  1. Type: improve-existing
  2. Working Title: Garden composting
  3. Target Group: adults in a community garden course; read on their own phone or computer

* __Track:__
  1. Track: full
  2. Convert mode: n/a
  3. Source: course
  4. Design scope: n/a

* __Terminology:__
  1. sessions-called: unit

* __Course Profile:__
  1. Persona type: (from existing)
  2. Agenda required: no
  3. Pacing: (from existing)
  4. Assessment defaults: (from existing)
  5. Units: (from existing)
  6. Delivery: link

* __File Structure:__
  1. Mode: multi-file
  2. Session folder naming: n/a

* __Conventions & Standards:__
  1. Language: en
  2. Tone: conversational
  3. Person: you
  4. Instructor Address: you
  5. Author: A. Teacher
  6. Contact: 

* __LiaScript conventions:__
  - none

* __Additional Notes:__
  - Look and images were revised first (design track, 12–13 Nov 2026); objectives, texts and tasks are revised now.

</details>

---

## Outline

<!-- class="journal-actions" -->
[▶️ Create outline](agent:teaching/create-outline) `:create-outline`

<!--- Filled by :create-outline from templates/course-outline.yaml. --->

_Still empty – created with “Create outline”, the step after the course frame._

---

## Didactics

<!-- class="journal-actions" -->
[▶️ Create didactics](agent:teaching/create-didactics) `:create-didactics` · [🎨 Visual identity](agent:artist/create-visuals) `:agent artist` → `:create-visuals`

<!--- Filled by :create-didactics from templates/course-didactics.yaml. --->

_Still empty – created with “Create didactics”, the step after the outline._

---

## Visual Identity

<!-- class="journal-actions" -->
[🎨 Visual identity](agent:artist/create-visuals) `:agent artist` → `:create-visuals` · [🎨 Logo](agent:artist/create-logo) `:agent artist` → `:create-logo`

<!--- Filled by :create-visuals (optional) from templates/visuals.yaml. --->

* __Color Usage:__
  1. Highlights and links in a calm garden green; text stays dark on light.

* __Course Image Generation Guidelines:__
  1. Plain photos of real gardens, daylight, no people in close-up.

* __LiaScript Theme:__ written from the course look, applied by :apply-theme

  ```text
  @style
  .lia-slide { --color-highlight: #2e7d32; }
  @end
  ```

---

## Templates

<!-- class="journal-actions" -->
[▶️ Suggest templates](agent:teaching/suggest-templates) `:suggest-templates` · [👁 Template catalog](agent:teaching/preview?file=specs/catalog/README.md) `:preview specs/catalog/README.md` · [▶️ Manage templates](agent:teaching/manage-templates) `:manage-templates`

<!--- Managed from templates/course-templates.yaml: adopted templates by :manage-templates, the briefs of templates in development by :suggest-templates, the selection line by both, removals included (ownership: agents/teaching-agent.yaml → journal_formatting_rules). --->

LiaScript templates used by this project are imported in the main metadata header at the top of `journal.md` and should also be imported in any standalone material file that uses their macros.

Checked templates are listed in the template catalog (`specs/catalog/README.md`); more community templates can be found at [topics/liascript-template](https://github.com/topics/liascript-template). When a useful template is selected, add its `import:` line to the project header, document it here, and use the same import in materials that need the template. A template that is still being developed is described here by a brief until it is adopted.

* __Template selection:__ done – none needed

<section>

### Dashboard

* __Import:__
  `./specs/dashboard/README.md`

* __Header entry:__
  `import: ./specs/dashboard/README.md`

* __Purpose:__
  Renders the project overview (next step, units, work process, open points) from one JSON data block.

* __Use when:__
  1. Showing the planning state in `## Dashboard` of `journal.md`

* __How to use:__
  1. Keep the import in the main metadata header.
  2. Regenerate the data block with `:update-dashboard`; never edit it by hand.

* __Special usage notes:__
  1. Component documentation and examples: `specs/dashboard/README.md`; check with `node specs/dashboard/validate-journal.mjs`.

</section>

---

## Agenda

<!-- state: later -->

_When needed – not needed for this course yet._

[➕ Add](agent:teaching/activate-section?section=agenda) `:activate-section agenda`

---

## Sessions

<!-- class="journal-actions" -->
[▶️ Didactics first](agent:teaching/create-didactics) `:create-didactics`

<!--- Managed by :create-session, :promote-session, :coauthor-materials and :validate-course. Overview first — status list, then the technical table in <details> (templates/session-skeleton.yaml → section_layout.overview) — then one `### {n}. {title}` subsection per session. --->

_The units exist; the next step is the outline._

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

1. What goes into compost – checked ✅
2. Building a compost bin – checked ✅

<details><summary>Technical overview</summary>

<!-- data-type="none" -->
| # | Title | Type | Skeleton | Material | Done | Notes |
|---|-------|------|----------|----------|------|-------|
| 1 | What goes into compost | existing | ✅ | ✅ `course/compost-basics.md` | ✅ | checked ✅ |
| 2 | Building a compost bin | existing | ✅ | ✅ `course/compost-practice.md` | ✅ | checked ✅ |

</details>

### 1. What goes into compost

<!-- class="journal-actions" -->
[👁 How learners see it](agent:teaching/preview?file=1) `:preview 1`

Which green and brown material belongs in a compost heap, and why it needs air and water.

<!-- data-key="decisions" -->
**Decisions:**

- **2026-11-12:** images reviewed
- **2026-11-13:** material approved

#### Validation report – unit 1

<section data-key="validation-report">

**Outcome:** passed (13 Nov 2026)

**Usable with learners now:** yes

**What works:**

- The new look is in the header; no second theme on top.
- The photo of the compost heap has an alt text and its credit under "Image credits".
- Text and highlights are easy to read (contrast checked).

<details>
<summary>Technical report</summary>

- __Date:__ 2026-11-13
- __Material:__ course/compost-basics.md
- __Result:__ PASS
- __Mode:__ session

**Content:** not checked – design track

**LiaScript Syntax:**
- Header with the theme of Visual Identity – ✅
- One `#` heading, slides as `##` – ✅

**Images:**
- img/heap.jpg: alt text, credit and licence (CC0) – ✅

**Contrast:**
- check-material: no contrast finding – ✅

**Unit entry (journal):**
- Image block, report and decisions – ✅

**Recommended Actions:**
1. None.

</details>

</section>

#### Images

<section>

#### compost-heap

* __Status:__ existing
* __Place:__ What goes into compost – picture on the slide
* __File:__ img/heap.jpg
* __Alt text:__ A compost heap with layers of leaves and kitchen scraps
* __Author:__ unknown
* __License:__ CC0

</section>

### 2. Building a compost bin

<!-- class="journal-actions" -->
[👁 How learners see it](agent:teaching/preview?file=2) `:preview 2`

Where a compost bin stands and what goes in first.

<!-- data-key="decisions" -->
**Decisions:**

- **2026-11-12:** images reviewed
- **2026-11-13:** material approved

#### Validation report – unit 2

<section data-key="validation-report">

**Outcome:** passed (13 Nov 2026)

**Usable with learners now:** yes

**What works:**

- The new look is in the header; no second theme on top.
- The unit has no images; nothing is missing.
- Text and highlights are easy to read (contrast checked).

<details>
<summary>Technical report</summary>

- __Date:__ 2026-11-13
- __Material:__ course/compost-practice.md
- __Result:__ PASS
- __Mode:__ session

**Content:** not checked – design track

**LiaScript Syntax:**
- Header with the theme of Visual Identity – ✅
- One `#` heading, slides as `##`, the quiz – ✅

**Images:** none in this unit – ✅

**Contrast:**
- check-material: no contrast finding – ✅

**Unit entry (journal):**
- Image block, report and decisions – ✅

**Recommended Actions:**
1. None.

</details>

</section>

#### Images

---

## Agents

<!-- class="journal-actions" -->
[▶️ Configure agent](agent:teaching/configure-agent) `:configure-agent <agent>` · [▶️ New learner persona](agent:teaching/create-learner-persona) `:create-learner-persona`

<!--- Read-scope rule: Coauthor and specialist agents are direct ### subsections; each agent reads only its assigned subsection. --->

_Project-specific settings of the assistants and learner profiles._

<section>

### Coauthor

_Rules for writing the material: voice of the guide, hints, limits._

* __Customization Status:__ inactive
* __Role / Persona:__
  none
* __Behavior Additions:__
  1. none
* __Preferred Interaction Style:__
  none
* __Project-Specific Rules:__
  1. none
* __Persona Voice Sample:__
  none
* __Boundaries / Never:__
  1. Do not override base workflow, validation, safety, or epistemic rules.

### Teaching-Agent

* __Customization Status:__ inactive
* __Behavior Additions:__
  1. none
* __Preferred Interaction Style:__
  none
* __Project-Specific Rules:__
  1. none
* __Boundaries / Never:__
  1. Do not override base workflow, validation, safety, or epistemic rules.

### Artist-Agent

* __Customization Status:__ inactive
* __Behavior Additions:__
  1. none
* __Preferred Visual Priorities:__
  none
* __Project-Specific Rules:__
  1. none
* __Boundaries / Never:__
  1. Do not override base visual consistency, accessibility, or uncertainty rules.

### Development-Agent

* __Customization Status:__ inactive
* __Behavior Additions:__
  1. none
* __Preferred Publishing Workflow:__
  none
* __Project-Specific Rules:__
  1. none
* __Boundaries / Never:__
  1. Do not override validation gates, git safety, or publishing checks.

</section>

### Learner Personas

<!--- Optional — filled by :create-learner-persona. One `#### Persona: {icon} {name}` subsection per persona (structure: tasks/create-learner-persona.md). --->

_No learner profiles yet._

---

## Validation

<!--- Replaced by :validate-course (course mode). The ### Latest Validation Summary below is the authoritative publishing gate — publishing requires `Mode: course` and `Result: PASS`. Per-session reports live in ## Sessions → #### Validation Report, not here. The action line is added by update-dashboard once every unit has material. --->

### Latest Validation Summary

<!--- Written with the approval of unit 2 on 13 Nov 2026 (design track: the unit reports, no new run). Outcome, result and recommendation rewritten for the full track by :activate-section on 13 Nov 2026 (no new run): the design check covered only syntax, header, images and contrast. --->

**Outcome:** not ready to publish yet – the check of the whole course follows after the revision (13 Nov 2026)

<details><summary>Technical part</summary>

- Date: 2026-11-13
- Mode: course
- Result: FAIL
- Issues found: 0
- Mechanical open: 0
- Sessions checked: 2

</details>

<!-- data-key="course-findings" -->
**Course findings:**

- **Basics:** not part of the design check (13 Nov 2026)
- **Units:** unit 1 and unit 2 passed the design check (13 Nov 2026) and are approved; their content was not checked
- **Material:** unit 1 — one photo, kept, credited; unit 2 — no images

<!-- data-key="recommended-actions" -->
**Recommended actions:**
1. The check of the whole course follows after the revision.

---

## Publishing

<!--- Maintained by the Development-Agent (:create-project, :update-project): read from the repository before anything is published. The dashboard shows it. __State:__ stays an English key. --->

* __Repository:__ none yet
* __Branch:__ —
* __Viewer URL:__ —
* __State:__ not published

---

## Analysis Status

<!--- Filled by :analyze-existing. --->

_Only used when an existing course is improved._

---

## Notes Backup

<!-- class="journal-actions" -->
[▶️ Save notes](agent:teaching/save-notes) `:save-notes` · [▶️ Save decision](agent:teaching/save-decision) `:save-decision <title>`

<!--- Appended to by :save-notes and :save-decision from templates/note-backup.yaml. Each note is one append-only `### {Type, in the course language}: {Descriptive Title} ({YYYY-MM-DD})` subsection. --->

_No notes yet._
