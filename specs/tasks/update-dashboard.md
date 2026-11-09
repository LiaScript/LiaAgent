# Task: update-dashboard

## Purpose

Derive the instructor-facing overview from the project sections and write it as
one semantic JSON data block into `journal.md` → `## Dashboard`. The LiaScript
Dashboard library (`dashboard/README.md`) renders it via `@Dashboard.View`.

The dashboard is **derived state**. It is never the source of truth.

## Inputs

- `journal.md` main metadata header (`language:`, template `import:` lines)
- `journal.md` → `## Course Context`, `## Outline`, `## Didactics`, `## Agenda`,
  `## Sessions` (overview table, `#### Validation Report`, `#### Persona Reviews`),
  `## Templates` (the line `__Template selection:__` and the briefs `### {id} (in development)` —
  the template step of the course process, Rules → Template step), `## Validation` → `### Latest Validation Summary`,
  `## Publishing` (repository, viewer URL, state — for the publishing step of the course process)
- `journal.md` → `## Agents` → `### Learner Personas` — headings only, for actions
- `templates/project-dashboard.yaml` — semantic data shape
- `dashboard/README.md` — component API of the installed library
- `data/agent-links.md` — link format, action lines, and which commands fit which state
- The `commands:` maps of `agents/*-agent.yaml` — the only commands that may appear as links
- Rule sheets, read completely with this task (`data/agent-links.md` → Chat Conduct → Rule sheets): `data/chat-language.md`, `data/journal-links.md`

## Output

- `journal.md` → `## Dashboard`: exactly one fenced `json @Dashboard.View` block
- `import: ./specs/dashboard/README.md` in the main metadata header (once)
- The action lines (`<!-- class="journal-actions" -->` paragraphs) directly below
  the section headings listed in `data/journal-links.md` → Action lines

## Automatic Trigger

Run this task automatically after any task that changes project state:

- `:init-course`, `:scaffold`, `:analyze-existing`
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
   overview …" (translated) **before** reading and generating anything. Never
   generate the dashboard data while the last visible sign of life is older
   than about 30 seconds.
1. Read the source sections listed above — now, not from memory. Identify course
   title, target audience, duration and file structure. Empty placeholders
   (`{{...}}`, "not yet filled") do not count as completed planning. Keep sample
   values visibly provisional.
2. **Computed by `write-dashboard.mjs`** (step 8) from the journal — do not work these out by hand, read
   the list the script prints after the run:
   - the units (agenda rows and `### {n}. {title}` subsections), their `title`, `state`, `href` (the
     subsection's anchor), `view` (once the material exists), `usable` (the report's line "usable with
     learners now"), `approved` (the dated approval in the unit's decisions) and `statusLabel`, and the same status wording in each unit's status line and Notes
     cell in `## Sessions` — from the check report's outcome line once a check ran, so a wrong state word
     is fixed in the report, never in these copies;
   - the check step's state once the check passed and the instructor approved (`done`, also while own
     photos are still to come — the unit then no longer holds the course back: `next` moves on to the next
     unit, inserting the photo stays a ➕ card);
   - the course steps that follow from the journal: building blocks while no template is chosen ("checked per
     unit – none needed so far (k of N)", `done` once every unit's sketch says none), the course check after
     the last unit (its label names the units approved so far), publishing by `Delivery` (see Rules);
   - the image step's state (from the `#### Images` entries) and the steps of a unit that has none yet
     (those of another unit, else the language pack's `unitSteps` — so the first agenda's units get
     them too);
   - `selected`: the course view (`""`) until the unit of `next` is begun, then that unit;
   - `unitsNote`, the one-line note under `## Sessions`, shown above the units;
   - the command of `next`, the recommended unit `selected`, the action lines of step 10 and the "More
     options" cards of the second way for the next unit, the template suggestion and a brief, the
     agenda card `alongside` the next button while templates are next and the required agenda is missing,
     and the card "Also possible: suggest building blocks" (translated) alongside it while the selection in
     `## Templates` is open and templates are not next;
   - `links`, `unitsTitle`, `unitLabel` and `footer` (“As of {date}”).
   The rules it applies are tested code: `specs/dashboard/derive-dashboard.mjs` (unit state),
   `actions.mjs` (next action and action lines), `journal-model.mjs` (status wording). Its inputs are
   records of yours: the instructor's approval of a unit's material is a dated decision line written
   with the approval form (`tasks/quick-fix.md` → Approval after a review, `tasks/coauthor-materials.md`
   step 7) — a review with fixes alone is no approval; Done ✅ and the report are written by
   `:validate-course`.
3. **Words stay yours, button words come from the pack.** Where the script finds your command right it
   keeps your `title` and `why` — also a ✏️ `quick-fix` with its description instead of revising, where
   every open point is one small change (only you can judge that), and the command of a step that
   produces a missing item that is not an image. Button words (`next.label`, the action lines) come from
   the language pack (`templates/i18n/{lang}.json` → `actions`) whenever it has the action, so overview,
   action lines and chat use one word; a step text that quotes the old word is updated with it. Where it
   changes a command it takes all words of the pack; without a pack it keeps your label or, for a new
   command, writes nothing and names the words you write into the draft or the line — then run it again.
   When it changes the command, a step text that still names the old next action is listed under
   "Words still to write": rewrite that step (its state and words) — the current course step is the one
   `next` advances.
   **A course step just finished** (context, outline, didactics, agenda saved): leave `next` as it is —
   the script sets command and words — and quote the button word from its list in the step texts and
   the chat link.
4. **The texts of each unit** (yours): `summary` never contradicts the unit's state and does not repeat
   `usable`, the first line of its card. Every unit has the same process steps from the start (computed, step 2); fill
   `why`, `result` (what exists, e.g. "{n} inserted" for the image step) and `next` (what remains, e.g.
   the remaining images plus the `__To do:__` lines of the image entries) from evidence. A generated
   draft is not instructor approval, and a session PASS is not a course publication PASS. A step that is
   `done` returns to an earlier state only through a check result (FAIL, concerns), never through a
   later decision or new work: new work of another kind is its own step. A persona review alone never
   changes the state; a change it leads to makes the unit `review` until the re-check.
5. **The words of `next`**, when the script keeps your command: an understandable `title` and `why`, and
   a `label` only where the pack has none (Rules → "next names one step"). Further optional actions go as cards into `explore`.
6. **Open points (mandatory checklist).** `validate-journal.mjs` lists the preparations the course frame
   names ("Preparations named in the course frame"); every listed sentence gets a `prepare` item with a
   link to the course frame, or an `internal` note why not. Re-read all source sections and add
   every hit to `decisions`:
   - A `## Course Context` summary value that contradicts its technical field
     (e.g. a described layout vs. `File Structure: Mode`).
   - Provisional entries ("provisional", "to be decided") in a section whose topic
     has since been saved elsewhere.
   - Numbers that disagree between sections (number of units, lessons, minutes).
   - Session Type slugs that are duplicated (`slug`), or — with several types — a type display name equal to a terminology word (`type-name`).
   - Preparation tasks for the instructor recorded in a section (equipment, printouts, accounts).
   - Agenda phases led by the instructor outside the material (opening, closing,
     one-to-one talks, checklists to print) → `prepare`, with `how`.
   - A brief under `## Templates` (`### {id} (in development)`) that lacks a required field, has an
     unknown `__State:__`, or is `ready to test` without its folder `lia-templates/{id}/README.md`
     (hint `template-brief` of the validation script) → `decide`, key `template-brief-{id}`; `how` says
     what is missing and who completes it (the brief together with the instructor, the folder through the
     development assistant). Plain words: German "Baustein", never "Template" or "Vorlage".
   Never fix foreign sections silently — listing them is this task's job. Every
   item gets a unique `key` (the hint key printed by the validation script, e.g.
   `provisional`, `slug`, `type-name`, `preparation`, `file-structure`, `template-brief`; several items for one
   hint use `{hint}-{topic}`; open priority issues of a persona review use `review-{unit}-{n}`
   (`decide`), prompt-only images and open `own` image spots `image-{unit}-{slug}` (`prepare`: create
   the image elsewhere or with `:generate-image` once an image route exists; for `own`: provide the
   photo)) and a `kind`:
   - `decide` — the instructor must decide; `how` says where and how.
   - `prepare` — the instructor must do or get something before using the material; `how` says how.
   - `internal` — cleanup the agent does itself at the next suitable write (old
     notes, duplicate slugs). No `how`; rendered collapsed for experts. Resolve it
     at the next write and mention it in that task's completion message.
   Titles never repeat the group name. Empty list if there is nothing open.
7. Produce the JSON following `templates/project-dashboard.yaml`. No HTML, CSS,
   JavaScript, progress percentages or duplicated totals — the library derives
   counts from `units[].state`. Always include the global course `process`, also
   once units exist — the view offers it as the "whole course" entry next to the
   units. An empty project uses `units: []` plus that global
   `process`; it shows no fake 0/1 or invalid percentage.
8. Keep the `## Dashboard` heading line unchanged and replace the whole JSON block
   below it **in one write**: write the complete JSON with the file-write tool
   to `.cache/dashboard.json` and run `node specs/dashboard/write-dashboard.mjs
   .cache/dashboard.json` (on its own). It first sets every field that follows
   from the journal (step 2: the unit fields, missing process steps, `links`,
   `unitsTitle`, `unitLabel` and `footer`) and lists each one it
   changed — read that list: a text of yours that contradicts a changed state
   needs rewriting. In the same write it gives each unit's status line and
   Notes cell in `## Sessions` the same wording as `statusLabel` (from the
   check report's outcome line once a check ran) — a wrong state word is
   fixed in the report, never in these copies. Then it checks the data, replaces the whole
   block in one step and runs the validation of step 9; never edit the block
   field by field, never with shell heredocs or inline scripts.
   `node specs/dashboard/derive-dashboard.mjs --check` shows without writing which
   derived fields of the overview no longer match the journal.
   **Fresh cache:** after each run the script stores `_journalHash` (the hash of
   the block it wrote) in the cache file. If `.cache/dashboard.json` carries it,
   change only the keys the triggering write affects — plus every text the
   re-read of the Rules finds stale — with the edit tool and run the script; it
   refuses a cache whose hash no longer matches the journal block ("cache
   stale"). Write the whole draft only when the cache is missing, has no
   `_journalHash` or was refused. Before a whole draft send a status with its
   duration (`data/agent-links.md` → Progress feedback). Fill
   `unitLabel` (`{one, many}`) and `unitsTitle` from `## Course Context` →
   Terminology in the course language (while `sessions-called` is unset: the
   course-language word for the template's default unit word, the same word
   as the `## Sessions` suffix). If the course language is neither
   German nor English, also fill `labels` with all fixed texts of the library
   in the course language (keys and placeholders: `specs/dashboard/README.md`
   → `labels`); otherwise fill only `labels.decide` and `labels.prepare` with
   the library's built-in group titles of that language, so the chat can name
   the groups exactly as the page shows them (`data/chat-wording.md` → Name
   things as the overview does) — plus, only where the course has its own word
   for the learners, `usable.yes`, `usable.limited`, `usable.no` and
   `viewMaterial` with that word; never `plan`. Keep the translated suffix of
   `## Sessions` and `## Agenda` in line with that terminology and update
   `links` in the same run. Ensure the template import exists once in the header; CSS and
   JavaScript are owned by the library. Document the template in `## Templates`
   via the `tasks/manage-templates.md` procedure if it is missing there.
9. **Validate** with `node specs/dashboard/validate-journal.mjs` (run from the
   project root, on its own — no pipes or `;`, it prints its own exit code).
   Exit code 2 means likely contradictions while `decisions` is empty, or a
   malformed report: fix (step 6) and run it again. Do not use other ad-hoc
   commands (e.g. `python3 -m json.tool`).
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
10. Refresh the action lines. `write-dashboard.mjs` (step 8) writes the lines of `## Course Context`,
    `## Outline`, `## Didactics`, `## Agenda`, `## Sessions` and every `### {n}. {title}` (one main action
    of that unit and, once the material exists, 👁 how the learners see it), and the one-line note under
    `## Sessions`. For the other sections listed in `data/journal-links.md` → Action lines:
    - Replace the `<!-- class="journal-actions" -->` paragraph directly below the heading, or insert one
      there, with the commands from that table that fit the current state, with concrete arguments.
      Further commands of a session go into its `<details><summary>Technical settings and more
      actions</summary>` block directly after the action line (block order:
      `templates/session-skeleton.yaml` → `section_layout.entry_order`).
    - Leave a line that already says the right thing untouched. When several
      lines change at once (a language switch, a new unit word), put all of them
      into one `localize-journal.mjs` map (`data/chat-language.md` → Language
      before the frame) instead of one edit per line — every write reloads the
      preview.
    - If an action line ended up below a `#### Validation Report`,
      `#### Persona Reviews`, or `#### Images` block, move it back directly below
      the `###` heading.
    - Touch nothing else in source sections. This task writes only:
      1. the action lines, and the further commands inside the sessions'
         "Technical settings and more actions" blocks — never their Type or Method lines;
      2. the translated suffix of the `## Sessions` and `## Agenda` headings, kept in
         line with the terminology (step 8) — the start of every heading stays unchanged;
      3. the dashboard template `import:` line in the main header, once (step 8);
      4. the `## Templates` entry of the dashboard template, via `tasks/manage-templates.md`
         and only if it is missing (step 8);
      5. the layout changes of `migrate-journal.mjs`, only after the instructor's
         "Update" (step 9);
      6. the one-line note under `## Sessions`, which follows the state (computed, `actions.mjs` → `sessionsNote`);
      7. each unit's status line and Notes cell in `## Sessions`, written by `write-dashboard.mjs` (step 8).
11. Confirm the dashboard was updated only after step 9 passed, and name the next
    recommended command. If the MCP gate is open (`data/agent-links.md`), `goto` the
    Dashboard slide, check with `get_state`, and post the next action as an
    `agent:` link to the preview chat (Chat Offers). Never present a renderer
    check as course validation.

## Rules

- All facts and workflow decisions come from source sections, never from the dashboard.
  If dashboard and source sections disagree, trust the source and regenerate.
- Never ask the instructor to update the dashboard manually.
- Links only for commands that exist in an agent's `commands:` map and fit the
  current state — never `exit`, never a command whose prerequisites are missing.
  Every `agent:` link in the data carries its readable `command`.
- The layout is owned by the library in `specs/dashboard/`. Changes to the
  appearance belong there; never invent a new layout per update and never add
  HTML, CSS, tables or a Mermaid map to `## Dashboard`.
- Keep one data set for the composed view; do not repeat numeric progress in the
  subtitle — describe the state in words. Texts that mention open points
  (`subtitle`, `next`, `why`) name them by their titles, not by a count; a count,
  if any, counts exactly the items of the group it names.
- Write all visible texts in the course language (`## Course Context` →
  Language; while that is still empty, the header's `language:`) and address
  the instructor as `## Course Context` → `Instructor Address` says (while
  empty: the formal form of that language). For the empty project keep the
  meaning of the template texts and translate them, including a real date in
  `footer` instead of a placeholder. `Person` is the learners' address in the material
  and is never used for dashboard texts.
- **One ranking of the three measures:** (1) usable with learners now (`usable`, from the
  check report) — the first line of the card and the first thing a text about the unit
  says; (2) open points (`statusLabel`, counting the points still open); (3) process
  steps (the step counter). Status words never discourage a unit that is usable: no
  "nothing finished" in `subtitle`, `summary` or `why` while a unit is usable — the
  library's progress line then names it ("Approved: none yet · Usable now: …").
- **The planning link** (`href`) is always named "See planning" by the library
  (translated) — never set `labels.plan` in German or English, never a label that
  hides the target ("To unit 1").
- Plain language for the instructor: no command names, slugs, file names or
  section keys in `title`, `subtitle`, `why`, `label` or `description` — those
  belong only in `command` and `href`.
- Use the terminology from `## Course Context` → `__Terminology:__`
  (`sessions-called`) for `unitsTitle` and all unit wording.
- **`next` names one step.** The script sets these words itself when it changes the command, and `next.label` whenever the language pack has the action. `next.title` is exactly the title of the step it advances, as the process panel shows it: when `next` belongs to a unit, that unit's current step plus the unit ("Insert images – unit 1", translated) — the course step stays visible in the course process, never in `next.title`; otherwise the current course step. `next.label` is the same step as an action with the same key noun (title "Outline and learning objectives" → button "Create outline"; "Insert images – unit 1" → "Insert images for unit 1"). Name each unit step by its result ("Plan the unit" for the planning sketch); the step, `next`, the unit's action line and chat offers use the same words. A command that serves another purpose in the same unit (images after the text) gets its own step (step 4) — never a new label for an existing step.
- `process.steps[].result` states what exists, without a leading status word (the library adds its own label), and only what holds for every item.
- `explore` items never use the icon of `next`: optional actions use ➕ or the icon of their agent, so exactly one ▶️ button stands for the next step.
- The JSON block is only ever written through `specs/dashboard/write-dashboard.mjs` (step 8) — one write, never field by field.
- Exactly one definition of "finished" per project, stated once in
  `process.note` (finished = validation PASS and Done ✅). Process-step `why`
  texts never define "finished". On every run re-read all existing texts of
  the data (`why`, `note`, `summary`, `subtitle`, and `result`/`next` of every
  step) against the current rules **and the current state**, and rewrite
  contradicting or stale ones — e.g. a `why` that says a task "cannot be
  solved without the images" after those images were inserted. Refresh `why`
  and `result` of every step the triggering write touched. The previous block
  is not a template: a fresh cache (step 8) saves rewriting unchanged keys,
  never this check.
- Use "finished/done" only for units whose check passed without an open ⏳ item (Done ✅) and that are approved. Instructor approval is "approved", never "finished" — in process steps, `why` texts and `note`.
- Keep the global process steps stable from the empty journal on: the agenda step
  is listed as `optional` until `Agenda required` is set, then `planned` (yes) or
  removed with a `note` (no). The last step, publishing, is `planned` (counted, computed with the label
  "needed – after all units are checked", translated) when the course frame says learners open the course
  by link or platform (`## Course Context` → Course Profile → `Delivery:`), otherwise `optional` until the
  publishing gate is PASS; `done` once `## Publishing` → `__State:__`
  starts with `published` (an English key, never translated). Its `why` never contradicts its state; where the link will live (a public page or
  the school's platform) is a `decide` item before the course check when the frame does not say it. Never let the number of steps change without a `note`.
- **Template step:** the global step "Templates for activities" (translated, German "Bausteine für
  Aktivitäten" — never "Template" and never "Vorlage" in a German text for the instructor; to teachers
  „Vorlage“ means a photocopy master) stands between the didactics and
  the agenda and is counted. Its state comes from `## Templates` (the line that starts with
  `## Templates`, layout `templates/course-templates.yaml`) — the line `__Template selection:__`
  (missing = `open`) and the briefs `### {id} (in development)`:
  1. `planned` while `## Didactics` is not saved.
  2. Didactics saved, selection `open` (also a missing selection line), no brief, and the template
     suggestion is `next` (no agenda saved and no unit planned yet): the step is `current`.
  3. Selection still `open`, no brief, but the agenda is saved or the first unit is planned: `planned`
     (not `current`), `next` = "Checked with every planning sketch – so far: {unit n}: none / needs …"
     (translated, from the units' building-blocks lines, `templates/session-skeleton.yaml`) — never a
     deadline such as "before the material of unit 1". The step `current` is always the one `next`
     advances (step 3).
  4. A brief not yet adopted exists — whatever the selection value (`open`, or a `done – …` that does
     not name it) — and takes precedence over 2 and 3: `current` while the brief's action is `next`,
     otherwise `planned` (the step `current` is the one `next` advances; `write-dashboard.mjs` names
     another current step under "Words still to write"); `result` by the briefs' `__State:__` —
     "{n} in development" (translated, German "{n} in Entwicklung") for `brief` and `in development`,
     "{n} ready to test" (German "{n} bereit zum Ausprobieren") for `ready to test`, both joined with
     " · " when both occur (`validate-journal.mjs` warns about "in development" once every open brief is
     ready to test). The agenda and the units do not wait for a brief: the agenda step keeps the state it has
     without the brief (`planned`, `current` while it is being created, `done` once saved). Whether the
     brief, the template suggestion, the agenda or a unit is `next` and which becomes a card is computed
     (step 2).
  5. Selection `done – …` (ids or `none needed`) without an open brief: `done`, `result` = the names of
     the adopted entries as `## Templates` shows them — every entry except `### Dashboard`, also one
     without `__Catalog id:__`; "none needed" (translated) only when there is no such entry.
  **Existing journals:** a Dashboard whose `process.steps` lack this step gets it at the next run,
  directly after the didactics step, in the state above (a missing selection line is `open`; with an agenda or unit in progress
  rule 3 applies and `next` stays with them), and `process.note` gets one appended sentence
  (e.g. "New: the step “Templates for activities” – ready-made building blocks for activities, or your
  own.", translated); the definition of "finished" in the note stays as it is.
- `plan` (provisional planning) only while Outline/Didactics assign content to
  lessons and no `## Agenda` exists yet; once the agenda is confirmed every agenda
  row is a unit and `plan` is removed.
- **Anchors (LiaScript):** an anchor is the full heading text in lower case,
  spaces and "-" collapsed to single "-", **punctuation kept** ("." "?" "–" ":").
  Examples: `## Outline – Learning goals` → `#outline-–-learning-goals`;
  `### 3. Why do leaves fall?` → `#3.-why-do-leaves-fall?`; a unit's check
  report `#### Validation report – Unit 2` → `#validation-report-–-unit-2`.
  Report headings are unique per unit (`templates/session-validation.yaml`), and
  every link that names a check report (a decision's `href`, an action) targets
  that report's anchor, never the unit heading. An unknown anchor
  silently opens slide 1, a bare slide number (`#10`) breaks when slides are
  added — use neither. Link only headings outside HTML blocks: a heading inside a
  `<section>` block (e.g. an agent subsection under `## Agents`) is no slide —
  link its enclosing `##` heading and name the subsection in the text.
  `validate-journal.mjs` checks every `#` link.
- Publishing remains gated by `## Validation` → `### Latest Validation Summary`:
  `Mode: course` and `Result: PASS`.
- Keep `## Dashboard` near the top of `journal.md`, directly after the course title.
