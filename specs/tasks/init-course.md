# Task: init-course

## Purpose

Initializes a new course project by instantiating `journal.md` from the skeleton template, asking for the **track** (what the instructor is planning) and creating or updating its `## Course Context` section.

This is the **first mandatory step** for every new course project.
The course context acts as the governance layer: it defines the track, the course type, terminology, persona style, conventions, and LiaScript rules that all subsequent tasks will load and follow.

The track decides how much of the journal the course needs: the full track (a course with several units) fills every section in turn; a light track (a mini course) fills only what it needs and marks the other sections "when needed" (see When-Needed Markers below) — they wait, not forgotten, until `:activate-section` takes them in.

## Inputs

- `templates/journal.md` (skeleton for a new `journal.md`)
- Track and course type (asked interactively)
- Working title (optional at this stage)
- Instructor preferences (optional)
- `templates/course-outline.yaml` — only in the mini track (its short outline)
- Rule sheets, read completely with this task (`data/agent-links.md` → Chat Conduct → Rule sheets): `data/chat-dialog.md`, `data/chat-language.md`, `data/journal-links.md`

## Output

- `journal.md` created from `templates/journal.md` if it does not exist yet
- `journal.md` → `## Course Context`, including the `__Track:__` block
- Mini track only: a short `journal.md` → `## Outline` and the when-needed markers of the track
- Optional: `journal.md` main metadata header `import:` lines and `## Templates`
- Structure based on `templates/course-context.yaml`

## Steps

1. Welcome the instructor in one or two sentences, together with the track question of step 2a. Once the track is known, say how many question rounds follow — count them from steps 3, 4, 6 (only when it asks) and 7 in the full track, from steps M1 and M3 (only when it asks) in the mini track, never an estimate; use the same number wherever you announce it. Do not repeat a workflow explanation the instructor already received in this chat.
   - **Reuse what is known.** Before asking, collect everything the instructor already said in this chat (`read_chat` when the preview is connected, otherwise this conversation) or in `journal.md` (topic, audience, number and length of lessons, how learners work, devices). Do not ask for it again; show it as a prefilled assumption ("Noted so far: … Correct?") and let the instructor correct it.
   - **No unfounded recommendations.** Mark an option as recommended only if the instructor's own statements support it, and name that reason in one line. Otherwise give no recommendation.
   - **Language.** Ask in the language the instructor writes in. Until the save (step 9, in the mini track step M4), that language is the course language for all chat messages and option labels (see `data/chat-language.md` → Language before the frame).
2. If `journal.md` does not exist, instantiate it from `templates/journal.md`:
   - Copy the template **1:1, byte for byte** with the single command `cp specs/templates/journal.md journal.md` — no edits, no added comments, no reformatting. The file is already a valid LiaScript document; its first HTML comment is the LiaScript metadata header (`language:`, `@color` macro, `import: ./specs/dashboard/README.md`) and must remain the first comment.
   - Unfilled sections show only their one-line note ("still empty – …"); each task writes its section from its template in `templates/`. This task only fills `## Course Context` (in the mini track also a short `## Outline` and the when-needed markers), the course title, the header's `language:` (course language code, step 7), and `## Dashboard` (via `tasks/update-dashboard.md`).
   - This copy — and the language switch of `data/chat-language.md` → Language before the frame — are the only writes allowed before the save confirmation in step 9 (in the mini track step M4; `data/agent-links.md` → confirmation tiers): they contain nothing the instructor said. Every content change waits for that save.
   - If `journal.md` already exists, leave it untouched and only work on the sections below.
2a. 🎛️ **Track — "What are you planning?"** (form title, translated; single choice). Ask it first, before any other question, in the instructor's own terms — never show the track slugs:
   1. "Plan a course — several lessons, with learning objectives, didactics and material" → track `full` (steps 3–13)
   2. "Something small — one page with an overview, a few slides and quizzes" → track `mini` (Mini Track below, then steps 11–13)
   3. "Improve an existing LiaScript course" → track `full` with course type `improve-existing`: skip step 3, then steps 4–13
   - **Propose instead of asking** when the chat already makes the answer clear (step 1 → Reuse what is known, e.g. "just a short quiz page on …"): show the form with that option preselected and one line "Sounds like {option} — correct?" (translated).
   - **Later stage:** two more tracks are added in a later stage – not offered yet: turning existing material (PDF, slides, web page) into an interactive course (track `convert`), and building or adapting a template (track `template`). They never appear in the form. If the instructor asks for one, say in one line that this is not available yet and offer options 1 and 2.
   - A journal that already has a `__Track:__` block with another track: a change of track is a track switch — follow `tasks/activate-section.md` → Track switch instead of this task.
3. 🎛️ **Order:** ask step 4 (free text) before this form unless its answers are already known, so the options below fit the setting the instructor named. Ask for the course type as **two short questions in the instructor's own terms** (one form, skip what is already known from step 1 or 4). Show only plain labels in the course language, never the type slugs. Phrase the options for the instructor's setting (school, university, adult education) — e.g. "lesson" vs. "session", "pupils" vs. "participants":

   **3a. Scope** (single choice; full track only — something small is the mini track of step 2a, so there is no option "one single lesson"):
   1. Several lessons / a teaching unit or lecture series
   2. A project day, workshop or block event (1–3 days)
   3. A self-study course without joint lessons
   4. Improve existing material

   **3b. How do the learners work?** (single choice; skip for 3 and 4):
   1. I lead the lessons; the material supports me
   2. The learners work on their own at their own pace (e.g. self-study phases, workshop tasks, online)
   3. Mixed

   Map the answers onto the course type and pacing:

   | 3a | 3b | Type | Pacing |
   |---|---|---|---|
   | 1 | 1 or 3 | lecture-series | scheduled |
   | 1 | 2 | self-paced | learner-driven within scheduled lessons (note in Additional Notes) |
   | 2 | any | workshop | event-based |
   | 3 | — | self-paced | learner-driven |
   | 4 | — | improve-existing | (from existing) |

   New courses never get the type `single-lesson`; older journals may still say `single-lesson` — they stay valid, and its rows below still apply to them.

4. 💬 Ask in one free-text question for the **working title, the target group and the time frame** (topic; who the learners are, how many, where they work; how many lessons or meetings, how long, over what period). Give a neutral example that does not echo anything the instructor said. Skip the parts already known (step 1). The time frame fills `Units` (step 8) and decides the file-structure recommendation (step 6).
5. The Teaching-Agent builds LiaScript courses only — never ask for a platform. If the instructor mentions another one, say in one line that this assistant creates LiaScript material, which can later be exported (e.g. as a SCORM package for a learning platform). Accessibility is not asked: LiaScript brings read-aloud (text to speech), screen-reader labels and keyboard navigation for every course, and the material rules (alt texts, read-aloud for what learners must read, the question as the quiz label) apply to every course. Special needs of the learners (e.g. dyslexia, little German) belong to the target group, where the tasks take them into account.
6. Based on the course type, set the profile defaults:

   | Type             | Unit word         | Persona         | Agenda default | Pacing          | Assessment              |
   | ---------------- | ----------------- | --------------- | -------------- | --------------- | ----------------------- |
   | lecture-series   | session           | professor       | yes            | scheduled       | quizzes + assignments   |
   | self-paced       | unit              | coach           | optional       | learner-driven  | self-check quizzes      |
   | workshop         | block             | facilitator     | yes            | event-based     | reflection + group work |
   | single-lesson (older journals) | lesson | tutor     | optional       | n/a             | optional quiz           |
   | improve-existing | (from existing)   | (from existing) | optional       | (from existing) | (from existing)         |

   Also set the **File Structure** default from course type (see `data/file-structure-modes.md`):

   | Type | Default File Structure mode |
   | ---- | ---------------------------- |
   | lecture-series | multi-file |
   | self-paced | multi-file |
   | workshop | multi-file |
   | single-lesson (older journals) | single-file |
   | improve-existing | detected in `:analyze-existing` |

   For a single lesson do not ask (older journals; the mini track sets it in step M4): it is `single-file` (one link); name it in one line of the summary. For every other course type, ask the file structure as a **teacher question** instead of stating a default (single choice, plain labels):
   1. "One link for all units — learners work through the chapters of one course" → `single-file`
   2. "One link per unit — each unit is opened on its own" → `multi-file`
   Ask this only once the time frame (step 4) is known. Recommend 1 if it is up to about 6 short units (one link or QR code; each learner sees all units and their own progress on their device — there is no class overview for the teacher) and say why in one line; otherwise give no recommendation. Never label an option as "usual" or "default", and never offer an internal threshold (e.g. "up to 6") as an answer option.

   **Terminology:** set `sessions-called` to the word the instructor will see for one unit in the journal, in the course language and fitting the setting (e.g. school: the local word for "lesson" or "learning unit"). Use exactly these words in all instructor-facing text and in the Dashboard.

   **Audience override:** for school learners (primary or secondary school), never use the persona type `professor`; use `coach` (learner-driven) or `tutor` (teacher-led, and also for "mixed").

   For **self-paced** and **single-lesson**, 🎛️ ask agenda preference in the instructor's terms ("Shall I create a schedule with order and time per unit?") (structured question — single choice):
   - **Yes** — helps with structure planning, especially for longer content
   - **No** — proceed directly to skeleton and materials

   Set `agenda` in the profile to `yes` or `no` based on the answer.
   For **lecture-series** and **workshop**, agenda is always `yes` (required, no question needed).

7. 🎛️ Ask about project-level conventions in one structured pass (multi-select where applicable):
   - Language: prefill with the language the instructor writes in; ask only if the material should be in another language
   - Tone: formal / informal / conversational (if not answered: informal for school learners, formal otherwise)
   - Person: Sie / Du / you — how *learners* are addressed in the material
   - Author name for the material header (a display name learners and parents see, e.g. title + surname; no private address needed). Contact address (optional, an e-mail learners may write to): needed only before publishing — if not given now, the dashboard lists it as `prepare`, and `:create-project` asks for it.
   - Instructor Address: how the agents address the instructor (default: the formal form of the course language, unless the instructor offers otherwise) — never derived from Person
   - LiaScript conventions: 💬 ask as free text only if instructor has specific requirements

8. Fill the `templates/course-context.yaml` template with the collected inputs, including the `__File Structure:__` field (mode + session folder naming) from step 6, `Units` from the time frame of step 4 and the `__Track:__` block (`Track: full`, `Convert mode: n/a`, `Source: n/a` — also for `improve-existing`).
9. **Before saving:** show a short summary of everything that will be written (this step and step 10), with "Save" / "Change something" — the single write confirmation of this task.
   - The summary table lists under "Decided" **only what the instructor answered**, in the instructor's own words (e.g. describe the course type by the two answers of step 3, not by a translated type slug).
   - Anything you derived or propose (a learning companion, self-checks …) goes into a separate list "Suggestions — not decided yet" or is left out; it is saved only after the instructor accepts it.
   - Below the table, say in one plain-language line **what the mapped keys change in the material** (who leads, how each unit ends, one link or several) — never name or translate a type, pacing or persona key, never use the label of an option the instructor did not choose, and never present the assistant as the persona (the persona is decided in `create-didactics`). That line belongs to the summary only and is not saved; the keys themselves go into the technical block.
   - A revised summary (after "Change something") starts with one line naming every change ("Changed: units 6 → 4; new: preparation"), before the table — no bold markers inside the table.
   - Content the instructor already gave for a later step (e.g. learning objectives, ideas for tasks) goes into `Additional Notes` as "For {step}: …" and is listed below the summary as "noted for later"; the later task reads it from there.
   - A rule the instructor chose for the whole course (e.g. about privacy, recordings, devices) is a row of the summary table ("Agreed rules", translated) — visible on the page, never only in `Additional Notes`.
   Then save:
   - **Language pack first:** if the course language is not English, a language pack exists (`specs/templates/i18n/<code>.json`) and `journal.md` is still the untouched copy of step 2, run `node specs/dashboard/localize-journal.mjs --lang <code>` **before** any other write of this step — the pack replaces lines of the empty template only, so after the first content write it no longer applies (unless it already ran at the language switch, `data/chat-language.md` → Language before the frame).
   - Then replace the content of `journal.md` → `## Course Context` following `templates/course-context.yaml` → `layout` (summary table first, technical `* __Label:__` bullets inside `<details>`, no sub-headings). Leave the action line below the heading as it is — `write-dashboard.mjs` renews it in the same save.
10. If LiaScript conventions mention template imports, run `tasks/manage-templates.md` with `templates/course-templates.yaml`:
    - Add `import: {url}` to the main metadata header if missing
    - Create or update `journal.md` → `## Templates`
    - Move detailed template usage examples to `## Templates` instead of bloating `## Course Context`
    - Leave `* __Template selection:__ open` as it is — the selection for the learning activities follows after the didactics (`:suggest-templates`), which recognises the templates documented here
11. Set `language:` in the metadata header to the course language code; if it is not English, the journal's own texts follow the course language in terminal mode too. **With a language pack** (`specs/templates/i18n/<code>.json`) it already ran in step 9 (or at the language switch); then only the unit word is left: in the pack's `unitLines`, replace its `unitWord` by the word of `sessions-called` (one map, one write). **Without a pack**, apply the journal part of `data/chat-language.md` → "Language before the frame": the course title, the welcome paragraph and its start link, a translated suffix for every fixed `##` / `###` heading (English key first), the one-line notes of unfilled sections and fixed placeholder lines such as the "course check not yet run" line under `## Validation`; headings that name a template keep that name (e.g. `### Dashboard` under `## Templates`), while placeholder values such as "none yet" are translated — except the `__State:__` value under `## Publishing`, an English key (`not published` / `published on …`) read by the dashboard; also the explanatory paragraphs under `## Templates` and `## Agents`, their visible values and boundary lines, and the `<summary>` labels of technical blocks. English stay only keys that tasks read: `__Customization Status:__` (active / inactive), `__State:__`, `Mode:` / `Result:`, and the header rows of technical tables; all line changes in one `localize-journal.mjs` map (`data/chat-language.md` → Language before the frame → Do it fast), never one edit per line and never a rewrite of the file. The chat-only parts of that rule (`lang` for the chat tool, roster labels) apply only with the MCP gate open. Then run `tasks/update-dashboard.md` with `templates/project-dashboard.yaml` to regenerate the `## Dashboard` JSON data block.
12. 🎛️ If no `.mcp.json` exists in the project root and the MCP gate is closed (see `data/agent-links.md`), offer the live dashboard once (single choice):
   1. **Yes** — read `templates/mcp.json` and write it as `.mcp.json` with the file-write tool (no shell copy). Then explain: requires the LiaScript DevServer (`npm install -g @liascript/devserver`); restart the agent (Claude Code: `claude --dangerously-load-development-channels server:liascript`) so `journal.md` opens in the browser with clickable actions.
   2. **No / later** — continue in the terminal; links in `journal.md` stay readable as commands.
13. Confirm completion and suggest the next step based on course type:
    - **lecture-series / workshop** → `:create-outline`
    - **self-paced** → `:create-outline` (agenda depends on instructor answer)
    - **single-lesson** (older journals only) → `:create-outline` → `:create-didactics` → `:create-agenda` (if yes) → `:create-session 1`
    - **mini track** → `:create-mini-course` (the short outline is saved already)
    - **improve-existing** → `:analyze-existing` (scans existing project memory and materials, offers to fill gaps)

    Name the next step exactly as the Dashboard's `next.title` and its button do.

## Mini Track

Option 2 of step 2a. One or two question rounds, then **one confirmation** saves everything. Steps 1, 2, 5 and the rules of step 9 (Decided table, suggestions, noted for later, language pack first) apply as written; steps 3, 4, 6–8 and 10 do not run.

M1. 💬 Ask in one free-text question for **topic, learners, scope and goal**: what it is about; who the learners are (age or level, how many, special needs); how long they work with it or about how many slides; what the learners should be able to do at the end. Skip what is already known (step 1); give a neutral example.
M2. **Learning objectives — no mini course without them.** Turn the answer into 1–3 learning objectives, each one observable sentence ("Learners can …", translated), and a slide list (a title and one sentence per slide, about 3–6 slides, quizzes named where they check an objective). A vague objective ("understand …", "get to know …") is not accepted: say why in one line and propose an observable wording; ask again until 1–3 objectives stand. More than three objectives, more than about six slides or a second topic → **growth offer** (single choice): 1. "Keep it small" (shorten or split, then continue here) · 2. "Plan a course after all" (continue with step 3 in the full track; nothing is saved yet).
M3. 🎛️ Ask only what is still open, in one form: how the learners are addressed (Person), how they open the material (Delivery: link · learning platform · printed · on this computer), the author name for the material header (optional); language, tone and instructor address as prefilled assumptions (defaults of step 7).
M4. **Before saving** — the single write confirmation of this track: show the summary of step 9 (Decided table in the instructor's words), below it the objectives and the slide list exactly as they will be saved, and one plain line naming the parts that wait until needed, in teacher words (e.g. "Didactics, look, schedule and learner profiles are not needed for now — you can add them any time."). "Save" / "Change something". Then save, in this order:
   - the language pack first, exactly as step 9 says;
   - `## Course Context` per `templates/course-context.yaml` → `layout`, short: Course Type (`Type: n/a` — the track says it; Working Title; Target Group), Terminology (`sessions-called`: the word for one lesson in the course language and setting), Course Profile as for one lesson (`Persona type: tutor`, `Agenda required: no`, `Pacing: n/a`, `Assessment defaults: self-check quizzes`, `Units: 1 × {length}`, `Delivery` from M3), File Structure (`Mode: single-file`, `Session folder naming: n/a`), Conventions, Additional Notes, and the Track block (`Track: mini`, `Convert mode: n/a`, `Source: n/a`);
   - a short `## Outline` per `templates/course-outline.yaml` → `layout`: only Title, Target Audience, Learning Objectives (the 1–3 objectives, no level sub-lists needed) and Session Overview (label "Slides", translated: the slide list, one sentence each);
   - the when-needed markers of the mini track (below).
   Write the Course Context, the outline and the markers in one write where the tool allows it (`data/chat-dialog.md` → Changing another section: one map for `localize-journal.mjs`, or one `write_section` per section). Then continue with steps 11–13.

## When-Needed Markers

A section the track does not need gets a marker instead of its empty-template content, in the same save as `## Course Context` — never as a write of its own, and never on a section that already has content. Lists per track (`specs/dashboard/tracks.mjs` → `laterOf`, copied verbatim):

| Track | Sections marked when needed |
|---|---|
| full | none |
| mini | Didactics, Visual Identity, Agenda, Learner Personas, Analysis Status |
| convert, transfer (later stage) | Outline, Didactics, Agenda, Learner Personas, Analysis Status |
| convert, rebuild (later stage) | Didactics, Agenda, Learner Personas, Analysis Status |
| template (later stage) | Outline, Didactics, Visual Identity, Agenda, Sessions, Learner Personas, Validation, Analysis Status |

`## Templates` is never marked: it holds the `### Dashboard` import record every journal needs. `## Course Context`, `## Dashboard`, `## Publishing` and `## Notes Backup` are never marked either.

**Form:** the heading line stays unchanged (also its translated suffix); everything below it up to the separator `---` — the action line, the authoring note and the one-line note of the empty template — is replaced by three lines with blank lines between them:

```markdown
<!-- state: later -->

_{laterNote}_

[➕ {label}](agent:teaching/activate-section?section={slug}) `:activate-section {slug}`
```

- `<!-- state: later -->` is the first non-empty line under the heading, always in this exact form (never translated).
- `{laterNote}` is the language pack's `terms.laterNote` ("When needed – not needed for this course yet."), `{label}` its `actions.activate-section.label` ("Add"); without a pack, translate both into the course language.
- `{slug}` is the section key in lower case with hyphens (`visual-identity`, `learner-personas`, `analysis-status`).
- `### Learner Personas` under `## Agents` gets its own marker in place of its note; the agent subsections under `## Agents` keep their content, and so does every other `###` subsection that holds entries.
- The overview lists the marked sections by itself (`process.later`, computed by `write-dashboard.mjs`) — never write that list by hand.

## Notes

- All subsequent tasks (`:create-outline`, `:create-didactics`, `:create-agenda`, etc.) will read `journal.md` → `## Course Context` and adapt their behavior accordingly. A section marked when needed counts as empty for every task; `:activate-section {slug}` takes it in (`tasks/activate-section.md`).
- The profile defaults are suggestions; the instructor can override any field.
- For `improve-existing`, `:analyze-existing` handles the reverse-engineering of missing `journal.md` sections before improvement work begins.
- The skeleton's formatting rules are binding: no sub-headings inside sections (Course Context uses the `layout` of its template: table + `<details>`), no `###` sub-headings outside `## Sessions` / `## Templates` / `## Agents` / `## Validation` / `## Notes Backup`, and the Dashboard is only ever updated via `tasks/update-dashboard.md`.
