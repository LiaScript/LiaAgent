# Task: validate-course – course mode

The course-mode procedure of `tasks/validate-course.md` (`:validate-course` without a number, and its "One unit, one
run"). Read with that task, completely; its Inputs, Output, Validation Storage and Publishing Gate apply unchanged.

## Course Mode Steps (`:validate-course`)

1. Load `journal.md` → `## Course Context` to understand course type and applicable conventions.
2. Load `checklists/course-quality-checklist.md` — apply only the checks relevant for this course type (skip sections marked with conditions that don't apply). The steps below group the checks; **every** applicable checklist item is applied, also one no step names — report it under the closest category of the summary.
3. Load `data/liascript-cheat-sheet.md` as syntax reference. If the skill `liascript-syntax` is available (see `data/skills.md`), use it as second reference (see `tasks/validate-syntax.md`).

4. **Check Context & Foundation:**
   - `journal.md` → `## Course Context` complete (course type, terminology, agenda flag, conventions)
   - `journal.md` → `## Outline`: title, target audience, time commitment `[not single-lesson]`, abstract, learning objectives
   - `journal.md` → `## Didactics`: instructor persona, didactic concept, style, difficulty level, Session Types (each with slug, criterion, and required-elements checklist)
   - `journal.md` → `## Didactics` has both `__Didactic Framework:__` and `__Default Session Method:__` set (the latter may explicitly be `none`). If either is missing entirely, flag this as a gap rather than silently skipping — same principle as an undefined Session Type (see `data/didactic-methods.md`).
   - `journal.md` → `## Agents` exists and contains scoped `### Coauthor` and `### Learner Personas` containers

4b. **Check Templates** `[if `journal.md` → `## Templates` exists or material files use template macros]`:
   - Every template documented in `journal.md` → `## Templates` has a matching `import: {url}` line in the main project metadata header — except briefs `### {id} (in development)`, which have no import yet
   - Every material file using a documented template macro has the matching `import: {url}` line in its own LiaScript metadata header (in a multi-file material the relative form `../../lia-templates/{id}/README.md` matches the project's `./lia-templates/{id}/README.md`)
   - Template usage in materials follows the documented examples and constraints in `## Templates`
   - **Publishing gate — templates:** FAIL if `## Templates` holds a brief `### {id} (in development)` whose `__Used in:__` names a unit (that unit relies on a template that is not adopted yet), or if an `import:` line of a published document points to a path the course project's `.gitignore` excludes (the published course could not load it — e.g. an outsourced `lia-templates/{id}/` with its own repository: import its published `{repo-url}@{tag}` instead). Published documents are the material headers (multi-file `materials/{n}-{slug}/README.md`, single-file the root `README.md`); the journal header counts only when `journal.md` itself is published (`tasks/create-project.md` step 5) — its `import: ./specs/dashboard/README.md` is no finding while `journal.md` and `specs/` stay unpublished.

5. **Check Agenda** `[if journal.md → ## Agenda has content, or the agenda flag is yes]`:
   - All sessions have title, duration, type, learning objective
   - `[if journal.md → ## Didactics → __Default Session Method:__ is not "none"]` All sessions have a Method assigned
   - Learning objectives align with `journal.md` → `## Outline`

6. **Check Session Progress:**
   - Load `journal.md` → `## Sessions` as primary source
   - Confirm the overview appears directly below `## Sessions` (status list, then the technical table in `<details>`) and `validate-journal.mjs` reports no error or warning on `## Sessions` — those are findings
   - All expected sessions have a row in the overview table (expected: the agenda's rows; without an agenda the number in `## Course Context` → Units, else the Outline's Session Overview)
   - Cross-check: every ✅ Skeleton row has a matching `### {number}. {title}` subsection in `journal.md` → `## Sessions`
   - Cross-check: every ✅ Material row has its material document (`validate-journal.mjs` reports a missing one)
   - All sessions marked ✅ Done `[required before publishing]`

7. **Check each material document** (same LiaScript + content checks as Session Mode Step 4).
   For each material file, fill `templates/session-validation.yaml` with `Mode: course` and create or replace the matching validation report — heading plus `<section data-key="validation-report">…</section>` at its place in the entry order (see Validation Storage rules above) — in that session subsection under `journal.md` → `## Sessions`. Then set Done in the overview table exactly as in session mode step 6 — in both directions: a unit whose report no longer passes, or has an open ⏳ item, goes back to Done ❌.

8. **Consistency check across project memory and materials:**
   - Terminology consistent (sessions-called from `journal.md` → `## Course Context` used throughout)
   - Persona tone consistent across all materials
   - Learning objectives from `journal.md` → `## Outline` traceable into materials — through `journal.md` → `## Agenda` if there is one
   - Numbering correct and no gaps

9. **Replace `journal.md` → `## Validation` → `### Latest Validation Summary`** — bold labels in the course language with their English `data-key`, never `####` or `#####` headings (each would become its own slide). Visible first: the outcome in the words of `outcome_words` and what is still missing, in plain words — no English labels, no method abbreviations without their name. The English key lines `Date:`, `Mode:`, `Result:` that the publishing gate reads stay as a list inside `<details><summary>{"Technical part", translated}</summary>` (lines directly below each other would merge into one paragraph):

   ```
   **{"Outcome", translated}:** {outcome words} ({date})

   <details><summary>{"Technical part", translated}</summary>

   - Date: YYYY-MM-DD
   - Mode: course
   - Result: PASS / FAIL / PASS with concerns
   - Issues found: N
   - Mechanical open: N
   - Sessions checked: N

   </details>

   <!-- data-key="course-findings" -->
   **{"Course-level findings", translated}:**

   - **{"Foundation", translated}:** [issue or ✅ OK]
   - **{"Templates", translated}:** [issue or ✅ OK / SKIPPED]
   - **{"Agenda", translated}:** [issue or ✅ OK / SKIPPED (course type)]
   - **{"Session progress", translated}:** [issue or ✅ OK]
   - **{"Materials", translated}:** Session {N} — {title}: [issue or ✅ OK]
   - **{"Consistency", translated}:** [issue or ✅ OK]

   <!-- data-key="recommended-actions" -->
   **{"Recommended actions", translated}:**
   1. [Concrete action with file reference]
   ```

   **Course result:** the worst of (a) the course-level checks, rated with `result_rules` of `templates/session-validation.yaml`, and (b) every unit's current report — a unit with an open ⏳ item or Done ❌ makes the course FAIL (publishing waits for it), a unit whose outcome says "short re-check open" gives PASS with concerns (resolved only by running the re-check, never accepted as is), open pedagogical concerns of a unit or of the course give PASS with concerns, otherwise PASS. On the design track the design course result applies instead (Design track: design check only).
10. Run `tasks/update-dashboard.md` to update `journal.md` → `## Dashboard` in place (validation state, publishing gate, session progress).
11. After all session validation reports and the latest summary are created: suggest next step. The completion message links the summary's own heading (the full anchor of `### Latest Validation Summary…`), never the `## Validation` slide above it. A duration it names is measured (`data/agent-links.md` → Durations).
    - If issues exist: per unit as in session mode step 8 — ✏️ `:quick-fix {number}` when every open point of the unit is one quick-fix change, otherwise `:coauthor-materials {number}` — then rerun `:validate-course`.
    - If no issues: "Course is ready for publishing. Next step: `:agent development` → `:create-project`"

---

### Iteration (mechanical checks only)

Applies only when `:validate-course` runs directly in course mode. Called as a sub-procedure (e.g. by `:build-session` in session mode), it runs once and returns — the caller's own loop iterates, so loops never nest.

**Loop:** Repeat "fix `[mechanical]` issues → rerun `:validate-course`" until every `[mechanical]`-tagged item in `checklists/course-quality-checklist.md` passes (`Mechanical open: 0` in the summary), or after 5 iterations — whichever comes first.

- **Confirm each round of fixes:** before the first change of a round, list its fixes (unit, page title, before → after) in **one** chat confirmation, as step 4b does; the changes follow `tasks/quick-fix.md` (that confirmation covers its scope and save confirmation). Declined fixes leave the loop and count as found.

- In scope for the loop: LiaScript syntax findings from `tasks/validate-syntax.md`, broken links/alt text, a required element that is present but malformed (wrong syntax, missing label), structural gaps — everything tagged `[mechanical]`. A required element that is **missing** is missing content: it goes to the instructor (next item). `[advisory]` items such as the duration flag are not in scope: the loop cannot fix them without inventing or cutting content.
- Items only the instructor can resolve are not in scope either, even when tagged `[mechanical]` — missing content or a missing unit, an approval, an answer (e.g. "all sessions Done", "no session without material"). List them at once; if only such items remain, stop now — further iterations would change nothing.
- Never auto-loop on `[pedagogical]`-tagged items — always surface those to the instructor immediately (core rule: critical sparring partner, not a rubber stamp).
- On hitting the 5-iteration cap without a clean mechanical pass: stop, list the remaining `[mechanical]` FAIL items, and hand back to the instructor instead of continuing.
- See `CLAUDE.md` → "Iteration Pattern" for the general convention. Under Claude Code this can additionally be driven with `/goal "journal.md → ## Validation → ### Latest Validation Summary shows Mechanical open: 0, or stop after 5 iterations"`.

---
