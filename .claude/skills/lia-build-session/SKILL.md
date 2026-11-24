---
name: lia-build-session
description: LiaAgent Teaching-Agent command `:build-session {number}` (click `agent:teaching/build-session?number=…`, also "Let unit {n} be prepared"). Orchestrates one unit end to end — skeleton → generated material → check loop with mechanical fixes → persona review → images — as one bounded run with a single start confirmation.
---

# :build-session

Orchestrates the full pipeline for one session — skeleton → generated material → validated → persona-reviewed → illustrated — as a single command with a clear stop condition, instead of manually invoking `:promote-session`, `:validate-course`, `:review-as-persona`, `:create-image`, and `:generate-image` one at a time and checking each result by hand.

`promote-session.md` itself is unchanged — this task calls it, and the other existing tasks, as sub-procedures.

## Command

`:build-session {number}`

## Load only what applies

Read a reference **completely** as soon as its condition holds:

| Condition | Reference |
|---|---|
| `## Sessions` has no `### {number}. {title}` yet, or the run was asked for before the sketch | `references/skeleton.md` (step 0) |
| The unit gets images (any spot with source `generated`, `free-photo` or `own`) | `references/images.md` (step 1b, step 3 and their confirmations) |
| `### Learner Personas` holds at least one persona | `references/personas.md` (step 2) |
| Always, before the start confirmation | `references/writes.md` (writes per run) |

## Inputs

- `number`
- the session's type — resolved from the session number as described in `data/session-types.md` → "Resolving a session's type"; never a command parameter
- `journal.md` → `## Sessions` — session skeleton (created if missing, see Step 0)
- declared duration for this session — `data/session-types.md` → "Objectives and duration of a session" (the agenda, without an agenda the length of one unit)
- `journal.md` → `## Agents` → `### Learner Personas` — if present, drives Step 2
- Sub-procedures, each **read completely when its step starts**, **together with every file its own Inputs name** (its checklist, templates and data sheets) — not all before the run; the steps below say what to read first: `tasks/create-session-skeleton.md` (step 0, only without a skeleton), `templates/session-skeleton.yaml` and `data/file-structure-modes.md` (before the first write), `tasks/promote-session.md` (1a), `tasks/create-image.md` (1b), `tasks/generate-image.md` (Phase 0 at 1b only for `generated` spots, and step 3), `tasks/validate-course.md`, `tasks/validate-syntax.md` and `data/duration-heuristic.md` (1c), the skill `lia-quick-fix` (as soon as a fix or a blocking concern is weighed — its "When to use" table decides 1d and 2b), `tasks/review-as-persona.md` (step 2, only with personas), the skill `lia-update-dashboard` (step 4); a later step of the same run may rely on a file read once unless the specs changed
- `data/agent-links.md` → Progress feedback and Long runs — status rhythm and questions during the run
- Rule sheets, read completely with this task (`data/agent-links.md` → Chat Conduct → Rule sheets): `data/chat-dialog.md`, `data/chat-checks.md`, `data/journal-links.md`

## Output

- Fully promoted, validated material for the session
- `#### Validation Report` and (if personas exist) `#### Persona Reviews` in the matching `journal.md` → `## Sessions` subsection
- Real images inserted, replacing placeholders
- Session Done as step 4 says; dashboard updated
- A closing summary (step 4): the runs line with the iterations spent per loop as numbers, every applied fix (page title, before → after), every factual statement that could not be verified (no web access or `reference-checker`) for the instructor to confirm or correct — they keep the unit at "passed with concerns" until then, and `:validate-course {number}` goes through them — final validation result in the outcome words of `templates/session-validation.yaml`, persona verdicts, images per spot (inserted / candidates kept for swapping / none found), and anything that had to be escalated to the instructor


## Before the start

- **Open decisions first:** if open points of the overview (`decisions`) or the unit's skeleton concern this unit, name them and ask them first — in one form, before the start confirmation. A previous unit that is not yet checked is a hint, never a reason to decline the run.
- **Image source per spot:** take it from the rules for writing the material (`### Coauthor`) and `## Visual Identity` (`free-photo`, `generated`, `own`); where neither names one, ask it in the start confirmation (one choice for all spots, changeable per spot later). Without web access during the run, free-photo spots stay `wanted` with "none found" and go into the closing summary with the choice `generated` / `own` — the run never switches a source by itself. If free photos are planned, the start confirmation asks **once** who chooses them (translated): "I choose, you can swap later" (the agent picks the best photo it looked at and keeps the others as candidates) · "I collect up to 3 candidates per spot, you choose afterwards" (nothing inserted; the image step stays open for the choice).
- **The start confirmation** names every kind of project write, the image source and who chooses, and an honest duration — about 15 minutes after the sketch for a unit of about ten pages with free photos (measured in test runs; the photo search is included). Never announce an upper bound ("2 minutes per spot × 13 spots") as the estimate. During the run the remaining time is for the whole run and only ever gets smaller; when a part takes longer, say so once instead of raising the total; it covers what the instructor confirmed, nothing more — a content question that comes up during the run is asked, never decided alone (step 1d).

## Confirmations

- The start confirmation of `:build-session` (tier "confirm in chat", `data/agent-links.md`) covers every write **inside the project** during this run: generated material, validation reports, mechanical fixes, persona reports, image prompts. Sub-procedures called by this task do not ask again — `quick-fix` skips its scope and save confirmations, `validate-course` skips its closing question, `review-as-persona` runs report-only, `create-image` (Free photos) skips its "go" per batch and its choice form — the start decision on who chooses replaces them.
- Sub-procedures called by this task do not refresh the dashboard themselves; Step 4 runs `tasks/update-dashboard.md` once, also when the run stops early. The one exception is the small overview patch of step 0, so that the journal stays valid during the run.
- Nothing stays unseen: the closing summary lists every applied fix with page title and before → after.
- Outside the project and the rendered check: `references/images.md` → Confirmations outside the project.

## Steps

### 0. Ensure a skeleton exists

If `journal.md` → `## Sessions` has no `### {number}. {title}` subsection yet, run `tasks/create-session-skeleton.md` first (one-shot — it asks the instructor for a title the normal way). Otherwise continue. The details of the sketch, the one-form start and the overview patch: `references/skeleton.md`.

### 1. Content loop (mechanical gate)

a. **First iteration only:** if the session's overview-table `Material` column is already ✅, ask the instructor before regenerating — `:promote-session` replaces the material wholesale and would silently discard any prior co-authoring. Otherwise, run `tasks/promote-session.md {number}` to generate the full material — **in parts of at most about a minute of generation each** (e.g. read-aloud pages · tasks · self-check; at most 3 parts, one write each, each part a complete state of the document), with a status naming the part and the remaining time of the run before each one and a look at waiting chat messages between them (`data/agent-links.md` → Long runs).

b. **First iteration only:** image spots — `references/images.md` → Step 1b.

c. **Read first, completely** (first iteration): `tasks/validate-course.md` and the files its Inputs name — `checklists/course-quality-checklist.md`, `tasks/validate-syntax.md`, `data/duration-heuristic.md`, `templates/session-validation.yaml`, `data/session-types.md`, and `data/didactic-methods.md` when the unit has a Method. Judge every checklist item against this unit's material and the project rules under `### Coauthor`; never copy a finding, a `Required` list or a "(from …)" line from another unit's report. Then run `tasks/validate-course.md {number}` (session mode) — this internally calls `tasks/validate-syntax.md` and applies `data/duration-heuristic.md`, and writes `#### Validation Report`. Inside the loop, write the report **once per iteration, after the fixes of step d and their re-check** — also when step d stops the loop, then with the points still open — never a report followed by correction edits of its numbers. A re-check that ran only part of the checks (e.g. only `check-material` for one changed page) is named as such in the report.

d. **Invoke first:** the skill `lia-quick-fix` (its "When to use" table decides here and in 2b). If any `[mechanical]`-tagged item (per `checklists/course-quality-checklist.md`) is FAIL: run `:quick-fix {number} {description}` for each one. If a `:quick-fix` call escalates to `:coauthor-materials` per its own step 5 rule: **stop this loop immediately** and hand off to the instructor — do not invoke `:coauthor-materials` automatically, it requires a human in the loop.
   **Never a "mechanical" fix:** a fix that changes a task's type (e.g. tapping → dragging), adds or removes a task, or departs from the saved planning sketch is a content change (`tasks/quick-fix.md` → "When to use"), also when a `[mechanical]` item such as a Type or Method `Required` element asks for it. If the instructor is in the chat, ask with one form (the change, the reason, "keep as planned") and continue after the answer; otherwise stop the loop and list it.

e. If any `[pedagogical]`-tagged item is flagged, or an `[advisory]` hint is recorded (such as the "possibly too short" duration flag): do not auto-fix. Carry it forward into Step 2. If no personas exist to weigh in (Step 2 will be skipped), surface it directly in the closing report instead.

**Loop:** Repeat c–d until every `[mechanical]` item passes, or after 5 iterations — whichever comes first. On hitting the cap: stop, list the remaining `[mechanical]` FAIL items, and report to the instructor instead of continuing to Step 2. See `CLAUDE.md` → "Iteration Pattern" for the general convention.

### 2. Persona review loop

`references/personas.md` — only if `journal.md` → `## Agents` → `### Learner Personas` contains at least one persona.

`[if no personas exist]`: skip this step entirely. Note in the closing report that no persona review was performed and offer, as one link, trying the unit as a learner (`try-as-learner?number={number}` when the MCP gate is open, otherwise `:create-learner-persona`).

### 3. Image finalization

Runs **once**, only if Steps 1 and 2 both finished clean (did not stop early on a cap or an escalation). If either loop stopped early, skip this step and go to step 4, which runs in every case (report of the last iteration, Done rule, overview, closing summary with the runs line). The `generated` path: `references/images.md` → Step 3.

### 4. Finalize

Mark the session ✅ Done in the `journal.md` → `## Sessions` overview table (if not already) — only if its `#### Validation Report` says `Result: PASS` and lists no open ⏳ item; with "PASS with concerns" Done stays ❌ and the closing summary names the deferred step. Invoke the skill `lia-update-dashboard`. Report the closing summary described in Output above:

- **Measured duration:** the closing write adds the dated decision "prepared in {m} minutes (your time: {k} minutes for the sketch)" (translated) to the unit's decisions, so later estimates rest on it.
- **Runs line** (fixed, translated): "Runs: content check {n} of at most 5 · persona review {n} of at most 3 (or: skipped – no learner profiles) · images {in} of {spots} (inserted and generated)" — in the report's technical part and in the terminal, never in the chat or the report's visible part (it is bookkeeping, not a result for the instructor).
- **Outcome** in the words of `templates/session-validation.yaml` → `outcome_words` (e.g. "passed – still missing: 1 photo", translated) — the report's words. A word the instructor has not seen before is explained where it first appears (the short re-check: "I look over the changed pages once more, about {m} minutes", translated).
- **Duration hint** by its content, never by a name such as "the formula" (`data/duration-heuristic.md` → Naming the estimate).
- **Usable first:** the line "usable with learners now" of the report comes before the outcome details, as on the overview card (`tasks/update-dashboard.md` → One ranking of the three measures).
- **One offer** to try the unit as a learner (`try-as-learner?number={number}` when the MCP gate is open, otherwise `:create-learner-persona` when no personas exist), plus the overview's `next`.
- **Approval stays with the instructor:** the check step waits for the instructor (computed) — offer the learners' view (👁 `preview?file={number}`) for that look. After the instructor's review and any fixes, `tasks/quick-fix.md` → Approval after a review asks the one approval form; only "Approve" completes the check step (computed).

## Cross-agent execution note

Steps 2 and 3 run the Learner-Agent's and Artist-Agent's own task procedures automatically as sub-steps of this loop, rather than through the usual conversational "suggest `:agent X`" handoff (see `CLAUDE.md` → "Agent Coordination" → the `:build-session` exception). Each sub-step still only reads its owning agent's own part of `journal.md` → `## Agents` — the `### Artist-Agent` subsection for the image steps, and for the Learner-Agent only the named `#### Persona:` entry in `### Learner Personas` (it has no `### Learner-Agent` subsection) — the read-scope rule stays in force even though the switch happens automatically instead of by explicit instructor command.

## When to use vs. manual step-by-step

| Situation | Use |
|---|---|
| First pass on a new session, want the full pipeline in one go | `:build-session` |
| Only want to regenerate material without touching validation/personas/images | `:promote-session` |
| Only want to check syntax/content without the full loop | `:validate-course` |
| Want to sit in the room and co-author interactively | `:coauthor-materials` |
| Want to add or refine one image, not run the whole pipeline | `:create-image` / `:generate-image` |
