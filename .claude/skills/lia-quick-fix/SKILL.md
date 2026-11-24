---
name: lia-quick-fix
description: LiaAgent Teaching-Agent command `:quick-fix {number} {description}` (also the click `agent:teaching/quick-fix`). Fast correction of one well-defined issue in a LiaScript material file — typo, broken syntax, one example, one quiz answer, a link. Also the change path for every change to a unit that already has a check report, and the approval form after the instructor's review. Called by lia-build-session and validate-course as a sub-procedure.
---

# :quick-fix

Fast, focused correction of a single well-defined issue in an existing material file, without running a full co-authoring session.

Minimal overhead for small, targeted changes (typos, broken syntax, swapping one example, fixing a quiz answer, correcting a link).

## Load only what applies

This file is the whole task for the plain case. Read a reference **completely** as soon as its condition holds — before the step named:

| Condition | Reference | Before |
|---|---|---|
| Called from `:build-session` or `:validate-course` | `references/called-by.md` | step 1 |
| The unit already has a `#### Validation Report` (also changes asked in the chat or after `:try-as-learner`) | `references/after-check.md` | step 2a |
| The fix touches any line of `journal.md` (report lines, image entries, to-dos, unit summary) | `references/journal-lines.md` | step 2b |
| The fix comes from the instructor's own review of material that has no `material approved` decision | `references/approval.md` | step 4 |
| `## Course Context` → `__Track:__ design` | `references/design-track.md` | step 1 |

## Inputs

- `number`: session number
- the session's type — resolved from the session number as described in `data/session-types.md` → "Resolving a session's type"; never a command parameter
- `description`: what to fix (brief, e.g., "Typo in section 3", "Fix quiz syntax in slide 5", "Replace example for learning objective 2")
- The material document to change — resolved from `journal.md` → `## Course Context` → `__File Structure:__` (see `data/file-structure-modes.md`): `materials/{number}-{slug}/README.md` in multi-file mode, or the matching `##` chapter in root `/README.md` in single-file mode (light track: the whole `README.md` is unit 1); on the design track the unit's recorded path (`data/file-structure-modes.md` → Recorded paths)
- `journal.md` → `## Course Context` — for conventions and terminology
- `tasks/validate-syntax.md` — for syntax mini-validation if the fix involves LiaScript (single source of truth for syntax rules)
- When the fix writes learner text: `data/liascript-cheat-sheet.md` → "Quizzes for young learners / self-checks" and "Controls as learners see them", read completely
- After a check: `templates/session-validation.yaml` (block "Changed after the check", outcome words) and `templates/session-skeleton.yaml` (status words), read completely
- the skill `lia-update-dashboard` — invoke it right before the overview is written
- Rule sheets, read completely when their case occurs (`data/agent-links.md` → Chat Conduct → Rule sheets): `data/chat-dialog.md` when the dialog runs in the preview chat (MCP gate open); `data/chat-checks.md` when step 3 reports how the change was checked; `data/journal-links.md` when a journal line is written

## Output

- Updated material document (single targeted change only)
- Short inline confirmation of what was changed and PASS/FAIL of mini-validation

## Steps

1. **Scope confirmation:** State what will be changed and the acceptance criterion:
   - "I will [describe the change] in [material document]. The change is complete when [condition]. Correct? (Yes / Adjust scope)"

2. **Prepare the targeted change only** — no refactoring, no adjacent edits, no style improvements beyond the stated fix. Nothing is written yet.
   - New or changed learner text follows the current patterns of `data/liascript-cheat-sheet.md` (hints read aloud where `narrator:` is set, controls named as the page shows them). If a pattern is not applied because a decision is still open, say so in the form of step 2a and offer both variants in the same form. A writing rule for every unit is a course decision (rules for writing the material, `:save-decision`), never an open point of one unit. A pattern the instructor reports in one unit (e.g. answer options that give the answer away) is searched in every unit and proposed as such a rule.

2a. **Show and confirm:** show the full new wording of every changed passage — page title, before → after, never only a description of the change — and ask "Save" / "Change something" (translated). This is the single write confirmation of this task; "Change something" returns to step 2.

2b. **Save** after "Save": the material in one write; the journal lines in one map ("One journal write per fix" above).

3. **Mini-validation of the affected section:**
   - Run `tasks/validate-syntax.md` scoped to the changed area — do not restate syntax rules here.
   - If the skill `liascript-syntax` is available (see `data/skills.md`), consult it when the fix touches a construct the cheat sheet does not cover.
   - Persona/tone consistent with `journal.md` → `## Didactics`? (skip on the design track: Didactics waits)
   - No unintended regression in surrounding content?

4. **Report result:**
   - ✅ "Fix applied and validated — done."
   - ⚠️ "The problem is larger than expected: [describe]. Should I open `:coauthor-materials {number}`?"
   - After every save invoke the skill `lia-update-dashboard` to update `journal.md` → `## Dashboard` in place.

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
