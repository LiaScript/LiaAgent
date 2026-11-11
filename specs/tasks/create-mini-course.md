# Task: create-mini-course

## Purpose

Writes the material of a **mini course** — one root `README.md` with an overview, the slides of the short outline and a quiz for each learning objective — and keeps it in `## Sessions` as **unit 1**. So the unit check, quick fixes, trying it as a learner and the overview work exactly as for any unit (`:validate-course 1`, `:quick-fix 1 …`, `:try-as-learner 1`); there is no second state model. Runs in the mini track after `:init-course`, which saved the short frame and the short outline with its 1–3 learning objectives. There is no planning sketch and no `:promote-session` step.

**IMPORTANT:** Strictly follow the LiaScript syntax rules, especially for headings and slides (`data/liascript-cheat-sheet.md`).

Tier: **start interview** — the dialog starts at once; its save confirmation (step 5) is the single write confirmation.

## Inputs

- `journal.md` → `## Course Context`: `__Track:__` (must be `mini`), Terminology (`sessions-called`), Course Profile (Units — the length of the lesson —, Delivery), Conventions (Language, Tone, Person, Author, Contact), Additional Notes (entries "For …" noted for the material)
- `journal.md` → `## Outline` — the short outline: Title, Target Audience, the 1–3 learning objectives (`data-key="learning-goals"`) and the slide list (`data-key="session-overview"`)
- `journal.md` → `## Agents` → `### Coauthor` — only when its `__Customization Status:__` is active; otherwise write in the voice of a friendly tutor that fits the learners and `Person`
- `journal.md` → `## Templates` — adopted templates, if any (usually none)
- `journal.md` → `## Sessions` — only to see whether unit 1 exists already
- `tasks/coauthor-materials.md` — read completely: its dialog style, fact check, critical engagement rules, images and the save of its step 6 apply as written, with the differences of this task
- `data/file-structure-modes.md` → "Creating the material document" and "single-file" (the whole file is unit 1)
- `data/liascript-cheat-sheet.md` — syntax reference, Quizzes for young learners, Controls as learners see them
- `checklists/course-quality-checklist.md` → Session Materials — the self-check before the save
- `templates/session-skeleton.yaml` — the shapes of the unit heading, its summary field and the overview table (`section_layout`)
- `tasks/update-dashboard.md` and `templates/project-dashboard.yaml` — read right before the overview is written
- Optional skills, only if installed (`data/skills.md`; a missing one is offered once per conversation, `data/skills.md` → Installing a Missing Skill): `liascript-syntax` as authoring reference, `reference-checker` for the sources of the material
- Rule sheets, read completely with this task (`data/agent-links.md` → Chat Conduct → Rule sheets): `data/chat-dialog.md`, `data/chat-checks.md`, `data/journal-links.md`

Sections marked when needed are not read (`tasks/activate-section.md` → Rules); the mini course needs neither the didactics nor a schedule.

## Output

- Root `README.md` — the mini course; the whole `README.md` is unit 1
- `journal.md` → `## Sessions`: unit 1 — heading `### 1. {title}` with its goal — and its row in the technical overview table (Material ✅)
- `journal.md` → `## Dashboard`, the status line, the Notes cell and the action lines — through `tasks/update-dashboard.md` (`write-dashboard.mjs`)

## Steps

1. **Check the frame.**
   - `__Track:__` is not `mini` → say in one line that this task writes a mini course and name the step of the overview instead; stop.
   - The short outline has no 1–3 learning objectives or no slide list → no mini course without them: say so and offer `:create-outline`; stop.
   - Unit 1 already has material (Material ✅) → this task does not write it again: offer to change it together (`:coauthor-materials 1`) or one small change (`:quick-fix 1 …`); stop.
2. **The plan in one message.** Show the course as it will be written, in plain words: the overview (title slide), one slide per entry of the slide list with one sentence each, and for each learning objective the quiz that checks it (which objective, which kind of quiz). About 3–6 slides. Ask for corrections in one round ("Write it like this" / "Change something", translated).
   **Growth check** — here and whenever the plan changes: more than about six slides, more than three objectives or a second topic → the growth offer of `tasks/activate-section.md` → Growth offer, once per occasion; never switch silently.
3. **Write the parts and show them** in the dialog style of `:coauthor-materials` (`tasks/coauthor-materials.md` step 4 applies: fact check before showing, the critical engagement rules, a new rule is applied to every part drafted so far, images as image spots with the source asked once, decisions of the instructor recorded with the save). Show the slides in one or two parts; nothing is saved that the instructor has not seen (`data/chat-dialog.md`).
   - **Learning objectives first:** every one of the 1–3 learning objectives has at least one quiz that checks it, solvable with what the slides show. Flag an objective no slide addresses before going on.
   - **Layout of `README.md`** (single-file, `data/file-structure-modes.md`): the metadata header as "Creating the material document" step 2 says; the course title as the only `#` heading with the title slide below it (the overview: 2–3 sentences for the learners — what it is about, what they will be able to do, how to start — in the learners' address, readable aloud); then each slide of the slide list as a `##` heading. Further sub-headings only inside an HTML block, a list or a blockquote.
4. **Self-check before the save** — `tasks/coauthor-materials.md` step 6 (the Session Materials items of the checklist, "Self-check against the checklist: …" as a fixed line of the save summary), plus: every objective has its quiz; about 3–6 slides.
5. **Save — one save confirmation** for the material ("Save" / "Change something"). The save summary names its three writes, in this order:
   1. root `README.md`, one write (the file-edit tool);
   2. `journal.md` → `## Sessions`, one write (one map for the line replacer, or `write_section`): the one-line note (the mini note of `tasks/init-course.md` M4, or in an older journal "_No units yet …_") goes; the technical overview table gets the row `| 1 | {title} | n/a | ✅ | ✅ | ❌ | |` (the Type column `n/a`: a mini course has no session types; a Method column only if the table has one, then `n/a` there too; the Notes cell stays empty); below the overview the unit `### 1. {title}` — `{title}` is the outline's Title — with only its goal as the summary field (`<!-- data-key="summary" -->` and the bold label "Summary", translated: one or two sentences naming what the learners can do at the end, the objectives of `## Outline`). No technical `<details>` block, no kind line, no content, activities, building blocks or references fields: the material is the plan. Decisions and image spots of step 3 go into the unit in the same write (`templates/session-skeleton.yaml` → `section_layout.entry_order`);
   3. `tasks/update-dashboard.md` with `templates/project-dashboard.yaml` — `write-dashboard.mjs` writes the status line, the Notes cell, the unit's action line and the overview.
   Then send "✅ Saved: …" as `data/chat-dialog.md` says.
6. **Check the material.** Run `node specs/dashboard/check-material.mjs README.md` once (on its own). If it cannot start, say so in one line and what was checked instead; if it reports that Playwright is missing, offer the install once per conversation (`data/chat-checks.md` → Offering the Rendered Check).
7. **Check the unit:** run `:validate-course 1` (`tasks/validate-course.md`) without asking — with one unit in the mini track this one run also writes the course summary in `## Validation` (`tasks/validate-course.md` → One unit, one run). Open points are worked through as that task says.
8. **Offer next steps** (1–3, in the preview chat as `agent:` links, `data/journal-links.md`):
   - After a passing check: offer `:try-as-learner 1` once (only when the MCP gate is open; it runs in the preview) — trying it once as a learner before sharing it.
   - Publishing only when the frame says learners open it by link or platform (the overview's next step), never as a must otherwise.
   - The growth offer of step 2 if the course grew while writing.

## Rules

- Exactly one unit: a second lesson or topic is a switch to the full track (`tasks/activate-section.md` → Track switch), never a unit 2 in the mini track.
- Later changes run through the unit commands with number 1 (`:coauthor-materials 1`, `:quick-fix 1 …`, `:validate-course 1`), never through this task again.
- Approval as in `tasks/coauthor-materials.md` step 7: a dated decision line in unit 1, asked with the approval form; instead of the skeleton update only the goal is kept true to the material. Done ✅ is set only by `:validate-course`.
- No text of yours calls the course "ready" or "finished" before its check passed.
