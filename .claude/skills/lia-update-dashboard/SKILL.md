---
name: lia-update-dashboard
description: LiaAgent command `:update-dashboard`. Derives the instructor overview (`journal.md` → `## Dashboard`, one `json @Dashboard.View` block) and the action lines via `write-dashboard.mjs`; the agent writes only the texts and the open points. Use after every task that changes project state (list in references/triggers.md) and when the instructor asks to refresh the overview.
---

# :update-dashboard

Derive the instructor-facing overview from the project sections and write it as
one semantic JSON data block into `journal.md` → `## Dashboard`. The LiaScript
Dashboard library (`dashboard/README.md`) renders it via `@Dashboard.View`.

The dashboard is **derived state**. It is never the source of truth. Most of it is
computed by `write-dashboard.mjs`; this task writes the texts and the open points.

## Load only what applies

Read a reference **completely** as soon as its condition holds:

| Condition | Reference |
|---|---|
| Which tasks call this one | `references/triggers.md` (for callers; not needed inside this task) |
| Step 6 — always (the open points are a mandatory checklist) | `references/open-points.md` |
| A light track (`__Track:__` other than `full`), a first Dashboard on a track, or a track switch | `references/tracks.md` |
| Full track and the step "Templates for activities" (`## Templates` has a selection line or briefs) | `references/template-step.md` |
| `validate-journal.mjs` names an older journal layout | `references/migration.md` |

## Inputs

- `journal.md` main metadata header (`language:`, template `import:` lines)
- `journal.md` → `## Course Context`, `## Outline`, `## Didactics`, `## Agenda`,
  `## Sessions` (overview table, `#### Validation Report`, `#### Persona Reviews`),
  `## Templates` (`__Template selection:__` and the briefs `### {id} (in development)`),
  `## Validation` → `### Latest Validation Summary`, `## Publishing`
- `journal.md` → `## Agents` → `### Learner Personas` — headings only, for actions
- `templates/project-dashboard.yaml` — semantic data shape; fields marked (computed) are set by the script
- `data/agent-links.md` — link format and which commands fit which state
- Rule sheets, read completely with this task (`data/agent-links.md` → Chat Conduct → Rule sheets): `data/journal-links.md`; `data/chat-language.md` only when this run changes the course language
- `dashboard/README.md` → `labels` only when the course language is neither German nor English

## Output

- `journal.md` → `## Dashboard`: exactly one fenced `json @Dashboard.View` block
- `import: ./specs/dashboard/README.md` in the main metadata header (once)
- The action lines (`<!-- class="journal-actions" -->` paragraphs) directly below
  the section headings listed in `data/journal-links.md` → Action lines

## Steps

0. **Sign of life first** (MCP gate open): when called right after a save, the
   calling task has already sent "✅ Saved: …". Send a status "Updating the
   overview …" (translated) **before** reading and generating anything.
1. Read the source sections listed above — now, not from memory. Empty placeholders
   (`{{...}}`, "not yet filled") do not count as completed planning. Keep sample
   values visibly provisional.
2. **Computed by `write-dashboard.mjs`** (step 8) from the journal — do not work these out by hand, read
   the list the script prints after the run. It sets every field marked (computed) in
   `templates/project-dashboard.yaml` — unit list, state, links, status wording, `usable`, `approved`, the
   unit and course process steps it can tell from the journal, `selected`, `unitsNote`, unit words,
   `footer` — the command of `next`, the "More options" cards, every unit's status line and Notes cell in
   `## Sessions` and the action lines of step 10. The status wording comes from the check report's outcome
   line, so a wrong state word is fixed in the report, never in its copies. The rules are tested code
   (`derive-dashboard.mjs`, `actions.mjs`, `journal-model.mjs`). Its inputs are records of yours: the
   instructor's approval of a unit's material is a dated decision line written with the approval form
   (`tasks/quick-fix.md` → Approval after a review, `tasks/coauthor-materials.md` step 7) — a review with
   fixes alone is no approval; Done ✅ and the report are written by `:validate-course`.
3. **Words stay yours, button words come from the pack.** Where the script finds your command right it
   keeps your `title` and `why`. Two choices stay with you: a ✏️ `quick-fix` with its description instead of
   revising, where every open point is one small change (only you can judge that), and the command of a
   step that produces a missing item that is not an image. Button words come from the language pack
   (`templates/i18n/{lang}.json` → `actions`). Where the script lists "Words still to write" (a new command
   without pack words, a step text that still names the old next action), write them into the draft or the
   line and run it again. After a course step was saved, quote the button word it lists in the step texts
   and the chat link.
4. **The texts of each unit** (yours): `summary` never contradicts the unit's state and does not repeat
   `usable`, the first line of its card; it describes the unit, never the changes made to it (those stand in
   the report's block "Changed after the check"). Fill each step's `why`, `result` (what exists, e.g. "{n} inserted"
   for the image step) and `next` (what remains, e.g. the `__To do:__` lines of the image entries) from
   evidence. A generated draft is not instructor approval, and a session PASS is not a course publication
   PASS. A step that is `done` returns to an earlier state only through a check result (FAIL, concerns);
   new work of another kind is its own step. A persona review alone never changes the state; a change it
   leads to makes the unit `review` until the re-check.
5. **The words of `next`**, when the script keeps your command: an understandable `title` and `why`, and
   a `label` only where the pack has none (Rules → "next names one step"). Further optional actions go as
   cards into `explore`.
6. **Open points (mandatory checklist)** — `references/open-points.md`, read completely.
7. Produce the JSON following `templates/project-dashboard.yaml`. No HTML, CSS,
   JavaScript, progress percentages or duplicated totals. Always include the global
   course `process`; an empty project uses `units: []` plus that `process`.
8. Write the JSON with the file-write tool to `.cache/dashboard.json` and run
   `node specs/dashboard/write-dashboard.mjs .cache/dashboard.json` (on its own). It derives (step 2),
   checks, replaces the whole block and the `## Sessions` lines in one write, lists every field it changed
   (rewrite a text of yours that contradicts a changed state) and prints the validation of step 9 — never
   edit the block field by field, never with shell heredocs or inline scripts.
   `node specs/dashboard/derive-dashboard.mjs --check` shows without writing what no longer matches.
   **Fresh cache:** if `.cache/dashboard.json` carries `_journalHash`, change only the keys the
   triggering write affects — plus every text the re-read of the Rules finds stale — and run the script;
   it refuses a stale cache. A change to `## Course Context` (access, learners, time, language) affects
   every text that names it: search the draft for the old wording
   (`node specs/dashboard/find.mjs -i "<old word>" .cache/dashboard.json`) and rewrite those keys in the
   same draft. Write the whole draft only when the cache is missing, has no `_journalHash`
   or was refused. Before a whole draft send a status with its duration.
   **`labels`:** if the course language is neither German nor English, fill all fixed texts of the library
   (`specs/dashboard/README.md` → `labels`); otherwise only `labels.decide` and `labels.prepare` with the
   library's built-in group titles of that language, so the chat names the groups as the page shows them —
   plus, only where the course has its own word for the learners, `usable.yes`, `usable.limited`,
   `usable.no` and `viewMaterial`; never `plan`. Keep the translated suffix of `## Sessions` and `## Agenda`
   in line with `## Course Context` → Terminology (the script derives the unit words from it). Ensure the
   template import exists once in the header; document the template in `## Templates` via the
   `tasks/manage-templates.md` procedure if it is missing there.
9. **Validate:** read the `validate-journal.mjs` result `write-dashboard.mjs` prints (or run
   `node specs/dashboard/validate-journal.mjs` on its own). Exit code 2: fix (step 6) and run again. No
   other ad-hoc commands (e.g. `python3 -m json.tool`).
   **Older journal layout:** `references/migration.md`.
10. Action lines: lines marked computed in `data/journal-links.md` → Action lines are written by the
    script. For the other sections listed there:
    - Replace the `<!-- class="journal-actions" -->` paragraph directly below the heading, or insert one
      there, with the commands from that table that fit the current state, with concrete arguments.
      Further commands of a session go into its `<details><summary>Technical settings and more
      actions</summary>` block directly after the action line (block order:
      `templates/session-skeleton.yaml` → `section_layout.entry_order`).
    - Leave a line that already says the right thing untouched. Several line changes at once (a language
      switch, a new unit word) go into one `localize-journal.mjs` map instead of one edit per line.
    - If an action line ended up below a `####` block, move it back directly below the `###` heading.
    - Touch nothing else in source sections. This task writes only:
      1. the action lines, and the further commands inside the sessions'
         "Technical settings and more actions" blocks — never their Type or Method lines;
      2. the translated suffix of the `## Sessions` and `## Agenda` headings, kept in
         line with the terminology (step 8) — the start of every heading stays unchanged;
      3. the dashboard template `import:` line in the main header, once (step 8);
      4. the `## Templates` entry of the dashboard template, via `tasks/manage-templates.md`
         and only if it is missing (step 8);
      5. the layout changes of `migrate-journal.mjs`, only after the instructor's "Update" (step 9);
      6. the one-line note under `## Sessions`, status lines and Notes cells — all through `write-dashboard.mjs` (computed, `actions.mjs` → `sessionsNote`, `journal-model.mjs` → `statusText`).
11. Confirm the dashboard was updated only after step 9 passed, and name the next
    recommended command. If the MCP gate is open (`data/agent-links.md`), `goto` the
    Dashboard slide, check with `get_state`, and post the next action as an
    `agent:` link to the preview chat (Chat Offers). Never present a renderer
    check as course validation.

## Rules

- All facts and workflow decisions come from source sections, never from the dashboard.
  If dashboard and source sections disagree, trust the source and regenerate.
- Never ask the instructor to update the dashboard manually.
- Links only for commands that fit the current state — never `exit`, never a command whose prerequisites
  are missing. `validate-journal.mjs` rejects a command that is not in the agent's `commands:` map. Every
  `agent:` link in the data carries its readable `command`.
- The layout is owned by the library in `specs/dashboard/`; never add HTML, CSS, tables or a Mermaid map
  to `## Dashboard`.
- Do not repeat numeric progress in the subtitle — describe the state in words. Texts that mention open
  points (`subtitle`, `next`, `why`) name them by their titles, not by a count; a count, if any, counts
  exactly the items of the group it names.
- Write all visible texts in the course language (`## Course Context` → Language; while empty, the header's
  `language:`) and address the instructor as `Instructor Address` says (while empty: the formal form of
  that language). For the empty project keep the meaning of the template texts and translate them.
  `Person` is the learners' address in the material, never used for dashboard texts.
- **One ranking of the three measures:** (1) usable with learners now (`usable`, from the
  check report) — the first line of the card and the first thing a text about the unit
  says; (2) open points (`statusLabel`, counting the points still open); (3) process
  steps (the step counter). Status words never discourage a unit that is usable: no
  "nothing finished" in `subtitle`, `summary` or `why` while a unit is usable.
- Plain language for the instructor: no command names, slugs, file names or section keys in `title`,
  `subtitle`, `why`, `label` or `description` — those belong only in `command` and `href`. Unit wording
  follows `## Course Context` → `__Terminology:__` (`sessions-called`).
- **`next` names one step.** When you write its words, `next.title` is exactly the title of the step it advances, as the process panel shows it: for a unit, that unit's current step plus the unit ("Insert images – unit 1", translated); otherwise the current course step. `next.label` is the same step as an action with the same key noun (title "Outline and learning objectives" → button "Create outline"). Name each unit step by its result ("Plan the unit" for the planning sketch); the step, `next`, the unit's action line and chat offers use the same words. A command that serves another purpose in the same unit (images after the text) gets its own step — never a new label for an existing step.
- `process.steps[].result` states what exists, without a leading status word (the library adds its own label), and only what holds for every item.
- Exactly one definition of "finished" per project, stated once in
  `process.note` (finished = validation PASS and Done ✅). Process-step `why`
  texts never define "finished". On every run re-read all existing texts of
  the data (`why`, `note`, `summary`, `subtitle`, and `result`/`next` of every
  step) against the current rules **and the current state**, and rewrite
  contradicting or stale ones — e.g. a `why` that says a task "cannot be
  solved without the images" after those images were inserted. The previous block
  is not a template: a fresh cache (step 8) saves rewriting unchanged keys,
  never this check.
- Use "finished/done" only for units whose check passed without an open ⏳ item (Done ✅) and that are approved. Instructor approval is "approved", never "finished" — in process steps, `why` texts and `note`.
- **Process steps per track** and keeping them stable: `references/tracks.md`.
- **Template step:** `references/template-step.md`.
- `plan` (provisional planning) only while Outline/Didactics assign content to
  lessons and no `## Agenda` exists yet; once the agenda is confirmed every agenda
  row is a unit and `plan` is removed.
- **Anchors (LiaScript):** an anchor is the full heading text in lower case,
  spaces and "-" collapsed to single "-", **punctuation kept** ("." "?" "–" ":").
  Examples: `## Outline – Learning goals` → `#outline-–-learning-goals`;
  `### 3. Why do leaves fall?` → `#3.-why-do-leaves-fall?`; a unit's check
  report `#### Validation report – Unit 2` → `#validation-report-–-unit-2`.
  Every link that names a check report (a decision's `href`, an action) targets
  that report's anchor, never the unit heading. Link only headings outside HTML blocks: a heading inside a
  `<section>` block is no slide — link its enclosing `##` heading and name the subsection in the text.
  `validate-journal.mjs` checks every `#` link.
- Publishing remains gated by `## Validation` → `### Latest Validation Summary`:
  `Mode: course` and `Result: PASS`.
- Keep `## Dashboard` near the top of `journal.md`, directly after the course title.
