# Task: update-dashboard

## Purpose

Derive the instructor-facing overview from the project sections and write it as
one semantic JSON data block into `journal.md` → `## Dashboard`. The LiaScript
Dashboard library (`dashboard/README.md`) renders it via `@Dashboard.View`.

The dashboard is **derived state**. It is never the source of truth. Most of it is
computed by `write-dashboard.mjs`; this task writes the texts and the open points.

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

## Automatic Trigger

Run this task automatically after any task that changes project state:

- `:init-course`, `:scaffold`, `:analyze-existing`, `:create-mini-course`, `:activate-section`
- `:create-outline`, `:create-didactics`, `:create-agenda`
- `:configure-agent`, `:suggest-templates`, `:manage-templates`, `:create-learner-persona`
- `:create-session`, `:promote-session`, `:build-session`
- `:coauthor-materials` after approval, `:quick-fix`
- `:validate-course`, `:review-as-persona`
- `:save-notes` or `:save-decision`
- `:create-project` or `:update-project`
- Development-Agent: `:develop-template` (its `__State:__` changes) and `:publish-template`
- Artist-Agent: `:create-visuals`, `:create-logo`, `:create-image`, `:generate-image`
- `:try-as-learner` when it saved changes (they go through `:quick-fix`, which triggers this task)

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
   `usable`, the first line of its card. Fill each step's `why`, `result` (what exists, e.g. "{n} inserted"
   for the image step) and `next` (what remains, e.g. the `__To do:__` lines of the image entries) from
   evidence. A generated draft is not instructor approval, and a session PASS is not a course publication
   PASS. A step that is `done` returns to an earlier state only through a check result (FAIL, concerns);
   new work of another kind is its own step. A persona review alone never changes the state; a change it
   leads to makes the unit `review` until the re-check.
5. **The words of `next`**, when the script keeps your command: an understandable `title` and `why`, and
   a `label` only where the pack has none (Rules → "next names one step"). Further optional actions go as
   cards into `explore`.
6. **Open points (mandatory checklist).** Every `[key]` hint `validate-journal.mjs` prints (e.g. `provisional`,
   `slug`, `type-name`, `preparation`, `file-structure`, `template-brief`) becomes an item with that key — it
   rejects a missing one. It also lists the preparations the course frame names; each gets a `prepare` item
   linking the course frame, or an `internal` note why not. Then re-read the sources for what only a reader
   finds:
   - A `## Course Context` summary value that contradicts its technical field.
   - Numbers that disagree between sections (number of units, lessons, minutes).
   - Preparation tasks recorded in a section (equipment, printouts, accounts), and agenda phases led by
     the instructor outside the material (opening, closing, one-to-one talks) → `prepare`, with `how`.
   - A brief under `## Templates` that the validator flags → `decide`, key `template-brief-{id}`; `how` says
     what is missing and who completes it (the brief together with the instructor, the folder through the
     development assistant). Plain words: German "Baustein", never "Template" or "Vorlage".
   Never fix foreign sections silently — listing them is this task's job. Several items for one hint use
   `{hint}-{topic}`; open priority issues of a persona review use `review-{unit}-{n}` (`decide`), prompt-only
   images and open `own` image spots `image-{unit}-{slug}` (`prepare`: create the image elsewhere or with
   `:generate-image` once an image route exists; for `own`: provide the photo). Each item has a `kind`:
   - `decide` — the instructor must decide; `how` says where and how.
   - `prepare` — the instructor must do or get something before using the material; `how` says how.
   - `internal` — cleanup the agent does itself at the next suitable write. No `how`; rendered collapsed.
     Resolve it at the next write and mention it in that task's completion message.
   Something the instructor agreed to do or to have done next time (e.g. fix older units) is a `prepare`
   item in the instructor's words, with `how` saying what and when — never `internal`.
   Empty list if there is nothing open.
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
   it refuses a stale cache. Write the whole draft only when the cache is missing, has no `_journalHash`
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
   **Older journal layout:** if it names an older journal layout (`{{…}}`
   skeletons in unfilled sections, `#### Validation Report` headings of an older
   template), run `node specs/dashboard/migrate-journal.mjs --check` and show its
   list in plain words ("Your journal still uses an older layout. I would update
   it – only the presentation, none of your entries:" plus the list, translated),
   with "Update" / "Not now" (tier "confirm in chat"). "Update" → run
   `node specs/dashboard/migrate-journal.mjs`, then validate again; a line it
   lists under "Left for you" is a section filled by hand — name it and propose
   filling or removing that line in the same form. "Not now" → write no
   Dashboard and say that the overview stays at its last state until then.
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
- **Process steps per track:** the course `process.steps` are the keys of `stepsOf(track, mode)`
  (`specs/dashboard/tracks.mjs`; `## Course Context` → `__Track:__`, missing = `full`), in order. Full track: the
  titles of the empty journal; else (translated) frame "Frame and learning objectives", outline "Outline and
  learning objectives", look "Look", material "Write the material", check "Check", publish "Publish", brief
  "Request and brief", build "Build and test", try "Try and approve". The first run on a light track replaces
  the empty journal's steps with that list, a track switch with a `note`; `validate-journal.mjs` checks the
  count. process.later is derived, never written by hand.
- Keep the process steps of the track stable from its first Dashboard on: the agenda step (full track)
  is listed as `optional` until `Agenda required` is set, then `planned` (yes) or
  removed with a `note` (no). The last step, publishing, is `planned` with its label when the course frame
  says learners open the course by link or platform (`Delivery:`, computed), otherwise `optional` until the
  publishing gate is PASS; `done` once `## Publishing` → `__State:__`
  starts with `published` (an English key, never translated). Its `why` never contradicts its state; where
  the link will live (a public page or the school's platform) is a `decide` item before the course check
  when the frame does not say it. Never let the number of steps change without a `note`.
- **Template step:** in the full track, the global step "Templates for activities" (translated, German "Bausteine für
  Aktivitäten" — never "Template" and never "Vorlage" in a German text for the instructor; to teachers
  „Vorlage“ means a photocopy master) stands between the didactics and the agenda and is counted. Its
  state, `next` and cards are computed from `## Templates` (`__Template selection:__`, missing = `open`, and
  the briefs `### {id} (in development)`); the agenda step keeps the state it has without a brief. Yours:
  - `result` while a brief is not adopted, by its `__State:__`: "{n} in development" (translated, German
    "{n} in Entwicklung") for `brief` and `in development`, "{n} ready to test" (German "{n} bereit zum
    Ausprobieren") for `ready to test`, joined with " · " when both occur.
  - Selection `done – …` without an open brief: `result` = the names of the adopted entries as
    `## Templates` shows them — every entry except `### Dashboard`; "none needed" (translated) only when
    there is no such entry.
  **Existing journals:** a full-track Dashboard whose `process.steps` lack this step gets it at the next run,
  directly after the didactics step, and `process.note` gets one appended sentence (e.g. "New: the step
  “Templates for activities” – ready-made building blocks for activities, or your own.", translated); the
  definition of "finished" in the note stays as it is.
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
