# Task: validate-course

## Purpose

Checks the consistency, completeness, and LiaScript syntax correctness of the project memory and course materials.
Can be run in two modes:

- **Session mode** (`:validate-course {number}`) — checks a single material file after co-authoring
- **Course mode** (`:validate-course`) — checks the entire course before publishing

## Inputs

- `journal.md` → `## Course Context` — course type and conventions
- `journal.md` → `## Templates` — LiaScript template imports, macros, and examples (if present)
- `checklists/course-quality-checklist.md` — structured checklist, read completely: every item is judged against this unit's material
- `tasks/validate-syntax.md` — full LiaScript syntax check, called as a sub-procedure (single source of truth for syntax rules), read completely
- `data/duration-heuristic.md` — reading time + activity time estimate, compared against the declared duration, read completely
- `data/didactic-methods.md` — Session Method `Required` checklists, read completely if a session method is in use
- `templates/session-validation.yaml` — template for each stored session validation report (heading, outcome words, layout), read completely
- `templates/session-skeleton.yaml` — read completely: status words of the overview and `section_layout.entry_order` (where the report goes)
- `data/session-types.md` — read completely: objectives and duration of a session, resolving its type (step 2)
- `tasks/update-dashboard.md` (it names when `templates/project-dashboard.yaml` is needed) — read right before the overview is written (step 6)
- File Structure mode from `journal.md` → `## Course Context` → `__File Structure:__` (see `data/file-structure-modes.md`)
- For session mode: the material document for this session (resolved per File Structure mode), matching overview row in `journal.md` → `## Sessions`, and matching `### {number}. {title}` subsection in `journal.md` → `## Sessions`
- For course mode: `journal.md` sections (`## Outline`, `## Didactics`, `## Agenda`, `## Sessions`) and all material documents (`materials/` in multi-file mode, or the `##` chapters of root `README.md` in single-file mode)
- **Reading plan by mode.** Read the files above for a session check. **Short re-check** (step 0): only `tasks/validate-syntax.md`,
  `templates/session-validation.yaml` → `result_rules` and `recheckExplain`, the `checklists/course-quality-checklist.md` items of
  the changed pages' Type and Method, and the rule sheets; the other files only when a new finding the change caused needs them (a replaced point:
  `templates/session-validation.yaml` completely; an overview item by hand: `tasks/update-dashboard.md`). **Concerns only** (step 0):
  the report and the rule sheets. **Course mode:** also `tasks/validate-course-full.md`, read completely.
- Rule sheets, read completely with this task (`data/agent-links.md` → Chat Conduct → Rule sheets): `data/chat-dialog.md`, `data/chat-checks.md`, `data/journal-links.md`

## Output

- **Session mode**: create or replace `#### Validation Report` inside the matching session subsection in `journal.md` → `## Sessions`
- **Course mode**: validate all material files and create or replace `#### Validation Report` inside each matching session subsection in `journal.md` → `## Sessions`

## Validation Storage

Per-session validation is stored directly with the matching session in `journal.md` → `## Sessions`.
Each session has at most one current validation report, rendered from `templates/session-validation.yaml`.

Rules:
- Store the report under the matching `### {number}. {title}` session subsection.
- The report heading is in the course language and unique per unit: `#### {"Validation report", translated} – {unit word} {number}`, with `<section data-key="validation-report">` directly below it (`templates/session-validation.yaml` → `layout`). Tasks find the report by that key; where a task says `#### Validation Report`, it means this block. In older journals a heading that starts with `#### Validation Report` is the same report: replace it with the new heading at its place in the entry order.
- The report heading stands outside; everything below it is wrapped in one `<section data-key="validation-report">` block, findings as **bold labels**, the technical part in `<details>` below the visible summary (template `layout`); `validate-journal.mjs` rejects other forms.
- If the session already has a validation report, replace it completely (also its heading and position).
- Every link that names a check report — a decision's `href`, an action, a chat message — targets that report's heading anchor (`tasks/update-dashboard.md` → Anchors), never the unit heading; the completion message of a check links it.
- Do not keep historical session validation reports.
- Session mode does not update `journal.md` → `## Validation` — except with one unit and on the design track (next rules).
- **One unit, one run:** when the journal has exactly one unit and `__Track:__` is `mini` or `convert`, `:validate-course 1` also runs the course-level checks (course mode steps 4–6 and 8) and replaces `### Latest Validation Summary` (course mode step 9, `Mode: course`) in the same write as the report — one run covers both, the short re-check of step 0 included (it refreshes the summary too); `:validate-course` without a number does the same. The whole `README.md` is unit 1 (every `check-material` finding counts), and the light-track exceptions of `checklists/course-quality-checklist.md` → Usage note apply. On a light track the unit check **is** the course check: the summary never plans a second course check and never waits for the approval (the approval is unit 1's decision; the overview computes it). Every later write that changes unit 1's report (a quick-fix re-check, `:validate-course 1`) or records its approval rewrites the summary in the same write: `Date:`, `Result:` (step 9 formula), outcome, session progress, materials and recommended actions — no new run; a change to `## Course Context` or `## Outline` in the same save re-runs course steps 4 and 8 there.
- **Design track: design check only** (`__Track:__` `design`): the unit's file is its recorded path in the Material cell of `## Sessions` (never the File Structure mode), and the whole file is the unit — every `check-material` finding is in scope. It checks only what the design track changes: syntax (`tasks/validate-syntax.md`), the header (the theme of `## Visual Identity`, no second theme on top, template imports kept), images (path, alt text, credit, licence and the checklist's image items — `node specs/dashboard/read-source.mjs <file>` lists them; an `existing` entry counts as placed, a kept unclear licence carries `terms.licenseUnclearKept` in the entry and in the credits) and contrast (`check-material.mjs`: each `contrast {ratio}:1 < {need}:1` error is a `[mechanical]` ❌). Step 4b fixes only the header, image lines, alt texts and the credits chapter; a contrast finding is fixed in `## Visual Identity` and written into every file by `:apply-theme`, never in one header (that file would lose the theme, and `:apply-theme` would bring the old colour back). **Only these four design checks apply; every other item is a content hint:** learning objectives, duration, Type and Method, persona and style, templates, `reference-checker`, facts, and the content-like `check-material` findings (answer patterns, options that give the answer away) — not judged, and those report fields say "not checked – design track" (translated); `result_rules` count only the design checks, and `Unit entry (journal)` covers only the lines the design track owns (image block, report, decisions). A content observation never makes the check FAIL, never gives PASS with concerns and never stands under "Still missing": it is a hint ("Note: …") in the report, and the overview gets one `decide` item `content-hints-{n}` with `source: {check: n}`, its `href` on the report heading, `how` one line per hint (page title + one sentence) and the Teaching-Agent's `:quick-fix {n}` — as `layout-suggestions-{n}` (`tasks/review-images.md`). There is no learner review (`review-as-persona`) and no `:try-as-learner` offer: the content did not change. Done and approval as on every track (step 6, `tasks/quick-fix.md` → Approval after a review). No separate course check runs: every unit done is the course check (computed; publishing waits for every unit), and `:validate-course` without a number runs this check for each unit not done. `### Latest Validation Summary`, which publishing reads (`tasks/create-project.md`), follows the unit reports without a new run (`Mode: course`, step 9 form): **design course result = PASS exactly when every unit is done (passed and approved), otherwise FAIL**; the course-level checks (a) of step 9 are skipped (Outline and Didactics wait). The write that makes the last unit done writes it, and so does every later write that changes a unit's report or approval; before that no unit check writes the summary, so no `Result: PASS` stands while a unit is not done.
- Full course validation replaces `journal.md` → `## Validation` → `### Latest Validation Summary` for publishing decisions.
- For publishing decisions, use `### Latest Validation Summary` as the authoritative course-level gate state.
- Publishing requires `Mode: course` and `Result: PASS`; a passing session-mode validation never unlocks publishing by itself.

---

## Session Mode Steps (`:validate-course {number}`)

0. **Concerns only:** if the unit's current report says PASS with concerns and nothing changed since it (no material change, no entry in its "Changed after the check" block newer than the report), do not check again: say so in one line and go straight to the concerns (step 8, "With **PASS with concerns**"), then rewrite the report's outcome, status line and overview. A new full check runs only after a change.
   **Short re-check:** if the report's outcome says "short re-check open" (changes after the check, `tasks/quick-fix.md` → Change path), check only the pages named in its "Changed after the check" block — `tasks/validate-syntax.md` for those pages, `check-material.mjs` (or say that no browser was available), the Type and Method items those pages carry (not on the design track), every open point that names them, and on each of those pages the requirements `## Course Context` sets for every page (e.g. read-aloud for every visible sentence and task: compare the narration blocks with the visible text line by line); the result rules stay the same. When the re-check finds nothing new on those pages, **one command closes it:** `node specs/dashboard/close-recheck.mjs {number} --checked "<how it was checked>"` — it marks each dated line " · re-checked: {how}" (`terms.recheckDone`), drops the " – {n} point(s) changed since – short re-check open" part of the outcome and the limit of "usable now", removes the re-check from the recommended actions, sets Done ✅ without an open ⏳ item, on a light track makes the course summary ready again, and updates the overview (status line, Notes cell, its open point) in one write — never write those lines by hand, and no Dashboard rules for that. With a new finding on those pages: replace only the affected points, drop that part of the outcome, status line, Notes cell and overview, remove the re-check from the recommended actions, set Done as step 6 does, and keep the dated lines as the record, each now ending " · re-checked: {how}" (`terms.recheckDone`, the words of its own check) — a dated line without it still counts as a change since. A problem found outside those pages, or on them but not caused by the change (it stood there before the check; also one that contradicts the report or the course summary), follows `tasks/quick-fix.md` → Findings outside the change: not fixed, not written into the report or the course summary, one `decide` point (`add-point.mjs`; several in one `--from` list, one write), named once in the closing message. Announce it with its duration (`templates/session-validation.yaml` → `recheckExplain`).
1. Load `journal.md` → `## Course Context` for course type and conventions.
2. Load the learning objectives and declared duration of this session (`data/session-types.md` → "Objectives and duration of a session" — from `## Agenda`, without an agenda from `## Outline`). Design track: skip (Design track: design check only).
3. Load `data/liascript-cheat-sheet.md` as syntax reference. If the skill `liascript-syntax` is available (see `data/skills.md`), use it as second reference (see `tasks/validate-syntax.md`).
3b. Load `checklists/course-quality-checklist.md` and apply **every** item of the categories that concern one unit — Session Subsections, Session Materials, LiaScript Syntax — for this session, also items the checks below do not repeat. A session PASS must not hide a `[mechanical]` item the course check would fail later. Design track: only the items of the four design checks; every other item is a content hint.
4. Open the material document for this session — resolved from `journal.md` → `## Course Context` → `__File Structure:__` (see `data/file-structure-modes.md`): `materials/{number}-{slug}/README.md` in multi-file mode, or the matching `##` chapter in root `/README.md` in single-file mode (light track: the whole `README.md` is unit 1; design track: its recorded path) — and check (design track: only syntax, header, images and contrast count; every other check below is a content hint, Design track above):

   **Content checks:**
   - [ ] All learning objectives of this session (step 2) are addressed
   - [ ] No section is vague, content-free, or placeholder-only
   - [ ] References present where content claims are made
   - [ ] `[only if the skill `reference-checker` is available — see `data/skills.md` — and web access exists]` The session's references verified with `reference-checker`; record its summary (✅ / ⚠️ / 🚨 counts) and every 🚨 entry as findings in the report. Without the skill or web access, skip this check and say so in one line.
   - [ ] Content satisfies the `Required` checklist of this session's declared type in `journal.md` → `## Didactics` → `__Session Types:__` (see `data/session-types.md`). If the type has no required elements defined, flag this as a Session Types gap rather than skipping the check.
   - **Required means in this unit:** a `Required` element of the type or method is met only by this unit's own material. A reference to another unit ("the explaining follows in unit 4") counts only with a recorded decision (`:save-decision`, scope e.g. "all units of this method"); otherwise it is ❌ (result rule 2) — or, if the element does not fit this unit at all, a Session Types / Method gap the instructor decides.
   - [ ] `[if the session has a **Method:** line]` Content satisfies the `Required` checklist of the declared Session Method in `data/didactic-methods.md` — checked independently of, and in addition to, the Type check above.
   - If the script reports "no installed Playwright found" or "has no browser of its own", offer the install once per conversation as `data/chat-checks.md` → Offering the Rendered Check says.
   - In single-file mode `check-material.mjs` reads the whole `README.md`: count only the findings on this unit's chapter slides (it names each slide's title); findings of other chapters belong to their units. On a light track every finding counts (One unit, one run).
   - [ ] Image options fit the learners' device: only as measured by `check-material` (its viewport report — name the window) or looked at by the instructor; otherwise "not measured" plus a preparation item (checklist, `data/chat-checks.md` → Say how you checked). A missing warning is no measurement.
   - [ ] Answer options give nothing away and texts match their pictures: the "Answer patterns" warnings of `check-material`, plus a read of every question, option, hint and page text against its picture (checklist → Session Materials)
   - [ ] The unit entry in `journal.md` (summary, content) describes the material as it is now: no to-dos or remarks about fixed points, factual statements checked as in the material — report field `Unit entry (journal)`.
   - [ ] Estimated duration per `data/duration-heuristic.md` (reading time + activity time, not word count alone) is within 70%–150% of the declared duration of this session (step 2). This is `[advisory]` — record the flag either way as a hint, never as ❌ or ⏳, and never change the result because of it.

   **Persona & style checks:**
   - [ ] Tone matches the Coauthor role from `journal.md` → `## Agents` → `### Coauthor`
   - [ ] Terminology matches `journal.md` → `## Course Context` (sessions-called, etc.)

   **LiaScript syntax checks:**
   - Run `tasks/validate-syntax.md` for this material and fold its findings into this report. Do not restate the individual syntax rules here — `validate-syntax.md` is the single source of truth for them.

   **Template checks** `[if `journal.md` → `## Templates` exists or the material uses template macros]`:
   - [ ] Every template macro used in the material is documented in `journal.md` → `## Templates`
   - [ ] The material metadata header includes the matching `import: {url}` line for every used template (a local template `./lia-templates/{id}/README.md` matches in a multi-file material as `../../lia-templates/{id}/README.md`, relative to its folder)
   - [ ] The project metadata header includes the matching `import: {url}` line for every documented template — briefs `### {id} (in development)` are exempt: they have no import yet
   - [ ] Template use follows the examples and constraints documented in `## Templates`

4b. **Fix during the check** (session mode; not when called from `:build-session`, whose loop fixes mechanical items): before setting the result, offer in **one** chat confirmation to fix every `[mechanical]` finding that needs no content decision (one targeted change each, `tasks/quick-fix.md` steps 2–3, all in one material write; then `check-material` again). Fixed items no longer count (result rule 0) and are listed as fixed during the check. One round, no loop; declined or not cleanly fixed items count as found.
5. Fill `templates/session-validation.yaml` for this session with (design track: the result from the design checks only, content fields "not checked – design track", Design track above):
   - Material path
   - The visible outcome words and the mandatory line "usable with learners now" (template `outcome_words`)
   - Result: PASS / FAIL / PASS with concerns — apply `result_rules` of the template in their order (deferrals ⏳ decided in the first run; other ❌ on required/mechanical → FAIL; open pedagogical ❌ → PASS with concerns; otherwise PASS). Publishing metadata (contact address, license) is never a finding of a unit check — the publishing gate checks it.
   - Mode: session
   - Date
   - Content findings
   - Type consistency findings
   - Persona & style findings
   - LiaScript syntax findings
   - Method consistency, the duration hint, the reference check summary and template findings — each in its own field of the template, also when there is nothing to report there
   - Recommended actions — check them against the session's decisions list (`data-key="decisions"`) first; never recommend something the instructor has already decided against
   - Page titles of the material as references — never line numbers
   - The visible plain-language summary (`**Outcome:**`, usable with learners now, what works, what is still missing) above the technical `<details>`, as the template's `layout` describes
   - The field `Unit entry (journal)` (step 4)
6. Create or replace the rendered report — heading plus `<section data-key="validation-report">…</section>` (see Validation Storage rules above) — in the matching session subsection under `journal.md` → `## Sessions`, after the skeleton fields and before `#### Images` (`templates/session-skeleton.yaml` → `section_layout.entry_order`).
   Update the overview table in `## Sessions`: set **Done ✅** only with `Result: PASS` (not "PASS with concerns") and no open ⏳ item; otherwise set Done ❌ — also when it was ✅ before. The status line follows the report (computed).
   Right after this write send "✅ Saved: …" with the outcome and the line "usable with learners now" as two paragraphs (a blank line between them — a single line break becomes a space in the chat), plus the anchor link to the report — never hold the result back until the overview is written. Details follow in step 7.
   Then run `tasks/update-dashboard.md` to update `journal.md` → `## Dashboard` in place.
7. **Chat summary:** name every ❌, every ⏳ with its step, every `[pedagogical]` finding (also those you consider minor) and every `[advisory]` hint in plain words. Never write "everything else is fine" while the report lists open points; a checklist item is never downgraded to a "hint". A `check-material` warning about another unit (an older unit that breaks a project rule) is named here once, with the offer to fix it (`:quick-fix`) — never only in the terminal.
   If no issues found: confirm "Session {number} ({type}) — ✅ Syntax and content verified." with the anchor link to the report heading, and offer `:try-as-learner {number}` once (only when the MCP gate is open). Design track: "Session {number} — ✅ design checked; content not checked." (translated), and no `:try-as-learner` offer.
   **Only own photos left** (PASS, the only ⏳ items are pictures the instructor supplies): the approval does not wait for them. After the result, ask once in a form "Do you approve {unit} {n} – your photo can follow later?" (translated) with "Approve", "Look at it first" (👁 the learners' view) and "Later". "Approve" records `- **{date}:** material approved` (translated) in the session's decisions list — one write, then `write-dashboard`.
8. If issues found: confirm the report was saved, list the blockers briefly, and offer the fix: when every open point is one `:quick-fix` covers (one change each, no content decision), offer ✏️ `:quick-fix {number}` with its description; otherwise `:coauthor-materials {number}` (`data/journal-links.md` → Action lines). Design track: always ✏️ `:quick-fix {number}`, and for a content wish the track switch (`tasks/activate-section.md`), never `:coauthor-materials`.
   With **PASS with concerns**: go through the concerns one at a time, as at the Publishing Gate — fix it now (`:quick-fix`, or `:coauthor-materials {number}`) or accept it as is with a short reason — for this unit (a dated entry in the session's decisions list) or, if the same concern applies to every unit, for the whole course (one `:save-decision`); listed in the save summary. A concern whose acceptance would contradict `## Course Context` (e.g. a special need of the target group, such as read-aloud for a learner with dyslexia) is named as such and needs its own explicit confirmation. Then, if something was fixed, the short re-check of the changed area (`tasks/quick-fix.md` → Change path) inside this run: its dated line ends with "· re-checked: {how}" (`terms.recheckDone`, translated) and the outcome line gets no "short re-check open" — the check is complete; if every concern was accepted, the outcome becomes PASS without a new check. When called from `:build-session`, do not ask — return the result to the caller, whose loop decides.
   **A concern that waits for the instructor** ("I'll decide once I've looked at it on the tablet", translated) is no decision yet: keep it under the report's open items as `- ⏸ {concern} – {what the instructor will do first}` and add the look as a preparation item. When the instructor comes back to it, remove the ⏸ and decide it as above. Only the check result words come from this task: another assistant never announces them ("it will then say 'passed – …'"), and only a check names the unit's check time.

---

## Course Mode Steps (`:validate-course`)

In `tasks/validate-course-full.md`, read completely — only in course mode (`:validate-course` without a number) and
for "One unit, one run" above (its short re-check only when a new finding changes the course summary: step 9 there;
`close-recheck.mjs` refreshes it otherwise). Any other session check never reads it.

## Publishing Gate

**Enforced after every course-mode validation run. Controls access to publishing commands.**

| Result                 | Agent behavior                                                                                                                                                                                                          |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 🔴 FAIL               | Block publishing. Open pedagogical concerns are gone through in the same pass as for PASS with concerns (fix or accept — for this unit or for the whole course), so the next run does not stop at them. State: "⛔ Publishing Gate: FAIL. Please resolve all issues in `journal.md` → `## Validation` and rerun `:validate-course`. `:create-project` and `:update-project` are locked until PASS." |
| 🟡 PASS with concerns | Publishing stays locked. List every open concern in plain words and go through them one at a time: fix it now (`:quick-fix`, or `:coauthor-materials {number}` for broader changes) or accept it as is with a short reason. Record each accepted concern with the save confirmation — session finding: a dated entry in that session's decisions list; course-level finding: `:save-decision`. Then rerun `:validate-course`: accepted concerns no longer count (see `result_rules` in `templates/session-validation.yaml`). Never offer "publish anyway". |
| 🟢 PASS               | Only if `Mode: course`: suggest handoff: "✅ Publishing Gate: PASS. Ready for publishing. Next step: `:agent development` → `:create-project`"                                                                                          |

**Rule:** Never suggest or assist with `:create-project` or `:update-project` unless `journal.md` → `## Validation` → `### Latest Validation Summary` contains both `Mode: course` and `Result: PASS` — regardless of how the instructor asks.
