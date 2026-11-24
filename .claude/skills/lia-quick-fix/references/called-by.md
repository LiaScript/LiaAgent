# quick-fix — called by another task

**Called from `:build-session`** (mechanical items only): skip the scope confirmation of step 1 and the save confirmation of step 2a — the start confirmation of `:build-session` covers them — and return the change (page title, before → after) to the caller for its closing summary. The change path after a check ("Changed after the check", the outcome suffix) does not apply there: the run writes its report once per iteration after its fixes (`tasks/build-session.md` step c). Escalation (step 5) still stops the caller.

**Called from `:validate-course`** (fix during the check, `tasks/validate-course.md` step 4b, or a round of its course-mode loop): the check's one confirmation of the listed fixes is the scope and save confirmation — skip steps 1 and 2a.
