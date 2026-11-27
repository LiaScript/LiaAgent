# Task: quick-fix

## Purpose

Fast, focused correction of a single well-defined issue in an existing material file, without running a full co-authoring session.

**Change path after a check:** every change to a unit that already has a validation report — also changes asked for in the chat or after `:try-as-learner` — follows this task: full new wording shown → save confirmation → mini-validation of the changed area (`tasks/validate-syntax.md` scoped to the changed block, persona and figure rules from `## Didactics`, `node specs/dashboard/check-material.mjs <material file>` when a browser is available (without one: `data/chat-checks.md` → Offering the Rendered Check) — without one, say so in `--checked`; the mini-check then rests on `validate-syntax` and the next `:validate-course`) → **one command records the change:** `node specs/dashboard/record-change.mjs {number} --page "<page title>" --change "<change>" --checked "<how it was checked: mini-check, measured at {window}, or looked at by the instructor>"` (a layout claim only as measured, `data/chat-checks.md` → Say how you checked). It writes the dated line under "Changed after the check", the outcome suffix " – {n} point(s) changed since – short re-check open", "usable with learners now" with that limit, Done ❌, the short re-check as recommended action and, on a light track, the course summary, in one write — never write those lines by hand, and explain the short re-check where the instructor first meets it (`templates/session-validation.yaml` → `outcome_words`). Yours stay: a fully fixed point leaves "Still missing", a partly fixed one stays there with what is still open, and a FAIL outcome counts the points still open (`outcome_words`: "correction needed: {open} of {n} points open") — those words before the suffix, in the map of "One journal write per fix" The same write updates the overview: the open point of the short re-check and every derived field — no draft, no `write-dashboard.mjs` and no Dashboard rules for that.

**Findings outside the change:** a problem the fix or its mini-validation finds outside the changed passage (also one that contradicts the report) is neither fixed nor written into the report: it becomes one `decide` point of the overview, written by **one command:** `node specs/dashboard/add-point.mjs {number} --topic <slug> --title "<short title>" --page "<page title>" --finding "<the finding in plain words>" --fix "<quick-fix description>"` (key `finding-{unit}-{topic}`, the overview derived in the same write, no Dashboard rules for it); several findings go into one JSON list for **one** call, `add-point.mjs {number} --from <file>` (`[{"topic", "title", "page", "finding", "fix"}]`) — and each is named once in the closing message.

**Only changes are "changed after the check":** a confirmation that changes no material (the instructor accepts a statement as it is) is a dated entry in the session's decisions list, never a line in the block "Changed after the check".

**One journal write per fix:** every other journal line the fix touches — image entries, and every line that still names the fixed item as open (unit summary, "Still missing", step `next`, an image entry's `__To do:__`) — goes into one replacement map (`node specs/dashboard/localize-journal.mjs <map.json>`), right after `record-change.mjs`; remove or update those lines, never leave a done to-do standing. **Find them first:** before the map is written, search the unit entry and its report with `node specs/dashboard/find.mjs` for the page title, the changed item and its old wording, and put every sentence that names the changed item or contradicts the change (summary, content, "What works", "Still missing") into the same map. **The Notes cell states the state, not a list of changes:** status line, Notes cell and `statusLabel` are not in the map — `write-dashboard.mjs` copies the report's outcome line. After the map run `node specs/dashboard/derive-dashboard.mjs --write` (derived fields only, no Dashboard rules to read); an item written by hand (Inputs) goes last, never before the journal lines it describes. Every change after a check makes the unit "short re-check open" (`tasks/validate-course.md` → Short re-check) — **unless the mini-validation already was that re-check:** it covered every changed page with `validate-syntax`, rendered them with `check-material.mjs`, and went through the Type and Method items those pages carry and every open point that names them. Then call `record-change.mjs` with `--rechecked`: the dated line ends with "· re-checked: {how}" and nothing else opens; such a re-check sets Done ✅/❌ as `tasks/validate-course.md` step 6 does, and the save summary names it. The outcome line states the check result only — whether the unit still waits for an approval is computed by the overview, never written there. Removing whole entries (e.g. image entries): `localize-journal.mjs --help` shows the map format, including removing a block by its heading — do not read the script's source. Publishing metadata in the header (`email:`, `version:`) set by `:create-project` / `:update-project` is not a content change and does not reopen a check.

**Cases read by part** (`data/quick-fix-cases.md`, only the part that applies): **Approval after a review** — the unit is not approved yet (the approval form at the end of the task); **Design track** — `__Track:__` `design`; **Called from another task** — `:build-session` or `:validate-course` runs this task. Without such a case, none of it is read.

Minimal overhead for small, targeted changes (typos, broken syntax, swapping one example, fixing a quiz answer, correcting a link).

## Inputs

- `number`: session number
- the session's type — resolved from the session number as described in `data/session-types.md` → "Resolving a session's type"; never a command parameter
- `description`: what to fix (brief, e.g., "Typo in section 3", "Fix quiz syntax in slide 5", "Replace example for learning objective 2")
- The material document to change — resolved from `journal.md` → `## Course Context` → `__File Structure:__` (see `data/file-structure-modes.md`): `materials/{number}-{slug}/README.md` in multi-file mode, or the matching `##` chapter in root `/README.md` in single-file mode (light track: the whole `README.md` is unit 1); on the design track the unit's recorded path (`data/file-structure-modes.md` → Recorded paths)
- `journal.md` → `## Course Context` — for conventions and terminology
- `tasks/validate-syntax.md` → Checks — only the items for the constructs on the changed lines (single source of truth for syntax rules); the whole task only when the fix changes structure (headings, quizzes, code blocks)
- When the fix writes or rewrites learner text — a question, answer option, hint, feedback line, instruction or read-aloud text; not a spelling fix of single words: `data/liascript-cheat-sheet.md` → "Quizzes for young learners / self-checks" and "Controls as learners see them", read completely
- After a check: `templates/session-validation.yaml` → `outcome_words` (only the words of a FAIL outcome's open count and the explanation of the short re-check); the block "Changed after the check", the outcome suffix and the status words are written by `record-change.mjs` and the overview scripts
- `tasks/update-dashboard.md` (it names when `templates/project-dashboard.yaml` is needed) — only for an overview item written by hand (a changed unit summary; after the approval `derive-dashboard.mjs --write` is enough), read right before that write; the change path itself and `derive-dashboard.mjs --write` need neither
- Rule sheets, read completely with this task (`data/agent-links.md` → Chat Conduct → Rule sheets): `data/chat-checks.md`; by part: `data/chat-dialog.md` → 1. Ask little, show everything, then write once (2. Fit the narrow chat only with the MCP gate open), `data/journal-links.md` → Field keys in journal sections (the rest only for a link or action line written by hand — the change path, the open points and the approval entry write none)

## Output

- Updated material document (single targeted change only)
- Short inline confirmation of what was changed and PASS/FAIL of mini-validation

## Steps

1. **Scope confirmation:** State what will be changed and the acceptance criterion:
   - "I will [describe the change] in [material document]. The change is complete when [condition]. Correct? (Yes / Adjust scope)"

2. **Prepare the targeted change only** — no refactoring, no adjacent edits, no style improvements beyond the stated fix. Nothing is written yet.
   - New or changed learner text follows the current patterns of `data/liascript-cheat-sheet.md` (hints read aloud where `narrator:` is set, controls named as the page shows them). If a pattern is not applied because a decision is still open, say so in the form of step 2a and offer both variants in the same form. A writing rule for every unit is a course decision (rules for writing the material, `:save-decision`), never an open point of one unit. A pattern the instructor reports in one unit (e.g. answer options that give the answer away) is searched in every unit and proposed as such a rule.

2a. **Show and confirm:** show the full new wording of every changed passage — page title, before → after, never only a description of the change — and ask "Save" / "Change something" (translated). Journal entries that follow the save are named in plain words ("the change is recorded in the check report with today's date and how it was checked", translated) — never a line with `{…}` placeholders: how it was checked is only known after the mini-validation. This is the single write confirmation of this task; "Change something" returns to step 2.

2b. **Save** after "Save": the material in one write. The journal follows right after the mini-validation of step 3, because the dated line names how the change was checked: after a check `record-change.mjs` (Change path above), then the other lines in one map ("One journal write per fix" above).

3. **Mini-validation of the affected section:**
   - Run `tasks/validate-syntax.md` scoped to the changed area — do not restate syntax rules here.
   - If the skill `liascript-syntax` is available (see `data/skills.md`), consult it when the fix touches a construct the cheat sheet does not cover.
   - Persona/tone consistent with `journal.md` → `## Didactics`? (skip on the design track: Didactics waits) While Didactics waits on a mini or convert track: with `## Course Context` → Conventions (tone, person) and `### Coauthor`.
   - No unintended regression in surrounding content?

4. **Report result:**
   - ✅ the fix is applied and checked — said in the course language, with how it was checked
   - ⚠️ the problem is larger than expected: [describe], with the offer to open `:coauthor-materials {number}` — in the course language
   - After every save the overview is current: `record-change.mjs` wrote it, `derive-dashboard.mjs --write` after a map; `tasks/update-dashboard.md` only for an item written by hand (Inputs).
   - After "Approve": offer `:try-as-learner {number}` once if the chat has not offered it yet, except on the design track — a link with the MCP gate open, else named as the next step in the preview (`:open-chat`).

5. **Escalate if scope grows:** If the fix reveals structural issues or multiple sections need rework, stop and escalate to `:coauthor-materials` — do NOT proceed silently.

**Loop:** After applying a fix, re-check the specific issue (step 3). If still unresolved, repeat once more — max 2 attempts total. If the second attempt also reveals structural issues or doesn't resolve cleanly, stop and escalate to `:coauthor-materials` per step 5 — do not attempt a third fix. See `CLAUDE.md` → "Iteration Pattern" for the general convention.

---

## When to use vs. :coauthor-materials

| Situation                            | Use                   |
| ------------------------------------ | --------------------- |
| Single typo or broken syntax         | `:quick-fix`          |
| Wrong link or missing alt text       | `:quick-fix`          |
| Swap one example or code snippet     | `:quick-fix`          |
| Fix one quiz answer                  | `:quick-fix`          |
| Reword answer options or gap cards so that none gives the answer away (same task, same correct answer) | `:quick-fix` |
| Multiple sections need rework        | `:coauthor-materials` |
| Learning objective not covered       | `:coauthor-materials` |
| Structural or content change         | `:coauthor-materials` |
| Change a task's type (e.g. tapping → dragging), add or remove a task, or depart from the saved planning sketch — also when a check asks for it | `:coauthor-materials` (inside `:build-session`: ask the instructor first, `tasks/build-session.md` step 1d) |
| Persona tone inconsistent throughout | `:coauthor-materials` |
