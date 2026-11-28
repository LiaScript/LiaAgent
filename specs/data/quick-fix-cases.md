# Quick-fix: cases read by part

The cases of `tasks/quick-fix.md` that only some runs meet. Read only the part that applies, from its heading to the
next one; `node specs/dashboard/status.mjs` shows the unit's state and the track.

## Approval after a review

Applies when the unit is not approved yet (no `material approved` entry in its decisions; in the status its button
is `approve-unit` or `approve-waiting`, or its check is still open).

When the fix comes from the instructor's own review of material that is not approved yet (no `material approved` entry in the session's decisions, e.g. a draft from `:build-session`), end the task — after the mini-validation and the overview update — with one form: "Is {unit} {n} fine like this now?" (translated, with the unit word) and the choices "Approve", "Change something" and "Look at it later" (translated). "Look at it later" writes nothing but keeps the approval open in the overview. Only "Approve" records the approval — a dated entry `- **{date}:** material approved` (translated) in the session's decisions list, written with the file-edit tool, one write; then `node specs/dashboard/derive-dashboard.mjs --write` sets the overview (no Dashboard rules for it); the overview then completes the check step (computed); "Change something" continues with the next fix. On a light track (`__Track:__` `mini` or `convert`) the approval also refreshes the course summary (`tasks/validate-course.md` → One unit, one run): a line of it that still says the approval is open changes in the same write as the entry (only such a line: findings and other verdicts of the summary stay as the last check wrote them), on the design track as `tasks/validate-course.md` → Design track says; after "Approve" step 4 offers trying the unit as a learner. Never infer an approval from a fix or from praise for a single page; an unasked "fine like this" for the whole unit brings this form at once (one click on "Approve") — never a silent entry. Not when called from `:build-session` (no instructor review there).

## Design track

Applies on `__Track:__` `design`.

The suggestions of the overview items `layout-suggestions-{n}` (`tasks/review-images.md`) and `content-hints-{n}` (`tasks/validate-course.md` → Design track) run here as `:quick-fix {n}` in the Teaching-Agent, one change each, on the unit's recorded path; a done suggestion leaves its item. A suggestion larger than that is the track switch to "Content and structure" (`tasks/activate-section.md`), never `:coauthor-materials`.

## Called from another task

Applies only when `:build-session` or `:validate-course` runs this task.

**Called from `:build-session`** (mechanical items only): skip the scope confirmation of step 1 and the save confirmation of step 2a — the start confirmation of `:build-session` covers them — and return the change (page title, before → after) to the caller for its closing summary. The change path after a check ("Changed after the check", the outcome suffix) does not apply there: the run writes its report once per iteration after its fixes (`tasks/build-session.md` step c). Escalation (step 5) still stops the caller.

**Called from `:validate-course`** (fix during the check, `tasks/validate-course.md` step 4b, or a round of its course-mode loop): the check's one confirmation of the listed fixes is the scope and save confirmation — skip steps 1 and 2a.
