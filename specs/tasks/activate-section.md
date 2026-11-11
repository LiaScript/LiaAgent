# Task: activate-section

## Purpose

Takes a section that is marked **when needed** into the course: the marker goes, the section gets its empty content from the journal template, and the matching task is offered. The same task switches the whole track (e.g. a mini course that grows into a full course).

A marked section is not forgotten, only not needed yet (`tasks/init-course.md` → When-Needed Markers). It grows only when the instructor wants it: this task never runs silently and never deletes content.

## Command

`:activate-section {section}` — `section` is the section's slug: the key in lower case with hyphens (`outline`, `didactics`, `visual-identity`, `templates`, `agenda`, `sessions`, `learner-personas`, `validation`, `analysis-status`). The marker's own action line carries it (`agent:teaching/activate-section?section={slug}`).

Tier: **confirm in chat** (it writes only `journal.md`, and from mini to full also `README.md`); with the MCP gate closed, the same confirmation in the terminal.

## Inputs

- `section`: the slug (required; ask for it if missing — offer the marked sections as options)
- `journal.md` → the marked section: its heading line and the marker block below it — a marked section counts as empty; anything else under the heading is only checked for existence, to keep it (step 3). `### Learner Personas` sits under `## Agents`: read only that subsection
- `journal.md` → `## Course Context` → `__Track:__` (track, convert mode) and Conventions → Language
- `templates/journal.md` → the same section of the empty template: its default content
- `templates/i18n/{code}.json` → `replace` when the course language has a language pack: the translated lines of that default content
- Track switch only: `tasks/init-course.md` → When-Needed Markers (the lists per track) and, from mini to full, its step 3 and the root `README.md` (its headings)
- `tasks/update-dashboard.md` and `templates/project-dashboard.yaml` — read right before the overview is written
- Rule sheets, read completely with this task (`data/agent-links.md` → Chat Conduct → Rule sheets): `data/chat-dialog.md`, `data/journal-links.md`

## Output

- `journal.md` → the activated section: its default content in place of the marker block, heading unchanged
- Track switch: `## Course Context` → `__Track:__` and the markers of the new track, in the same write; from mini to full also the restructured `README.md` (unit 1 becomes its `##` chapter)
- `journal.md` → `## Dashboard` and the action lines, through `tasks/update-dashboard.md`

## Steps

1. **Check the parameter.** Map the slug to its section (`visual-identity` → `## Visual Identity`, `learner-personas` → `### Learner Personas` under `## Agents`, and so on). Then:
   - The section carries the marker `<!-- state: later -->` as its first non-empty line → continue.
   - No marker (the section is active already) → write nothing; say so in one line and offer its task (step 5).
   - Unknown slug → ask in one form, with the marked sections as options (labelled by their headings, never by slugs).
2. **Show and confirm** (tier "confirm in chat"): one plain line in teacher words, e.g. "Didactics is added to your course: the note 'when needed' goes and the empty section appears with its button. Nothing else changes." (translated), with "Add" / "Not now". "Not now" ends the task without a write.
3. **Write — one write.** Replace exactly the marker block — the marker line `<!-- state: later -->`, the italic note line, the action line `[➕ …](agent:teaching/activate-section?section={slug}) …` and the blank lines between them — with everything the same section holds in `templates/journal.md` below its heading (action line with its `<!-- class="journal-actions" -->` comment, authoring note, one-line note; for `## Sessions` also the technical overview, for `## Validation` also `### Latest Validation Summary` with its placeholder line).
   - **In the course language:** with a language pack take its `replace` translations of those lines; without one translate the note and the button words as `tasks/init-course.md` step 11 does for unfilled sections.
   - The heading line stays as it is, and so does every other line of the journal.
   - **Never delete content.** If anything besides the marker block stands under the heading (a half-activated section, which `validate-journal.mjs` reports), keep it: remove only the marker block, insert no empty-template note above existing content, and name what was kept in the completion message.
   - Use `read_section` + `write_section` (gate open) or one map for `node specs/dashboard/localize-journal.mjs <map.json>` with the marker block as one multi-line item (`data/chat-dialog.md` → Changing another section).
4. **Check and refresh the overview.** Run `node specs/dashboard/validate-journal.mjs`; fix what it reports about this section (a `process.later` mismatch is fixed by the overview update that follows). Then run `tasks/update-dashboard.md`: `node specs/dashboard/derive-dashboard.mjs --write` renews `process.later`, `next` and the section's action line from the journal; if it lists words still to write (exit 1, journal unchanged) or a text of yours that now contradicts a changed field, fix them in the draft as `tasks/update-dashboard.md` step 8 says and run `write-dashboard.mjs`.
5. **Offer the matching task** — one offer, never started without the instructor's yes (in the preview chat as a link, `data/journal-links.md`):

   | Section | Offer |
   |---|---|
   | Outline | `:create-outline` |
   | Didactics | `:create-didactics` |
   | Visual Identity | `agent:artist/switch`, then `:create-visuals` |
   | Templates | `:suggest-templates` (no current track marks it; older journals only) |
   | Agenda | `:create-agenda` |
   | Sessions | `:create-session {n}` with the next free unit number |
   | Learner Personas | `:create-learner-persona` |
   | Validation | `:validate-course` |
   | Analysis Status | `:analyze-existing` |

## Track switch

When the instructor wants another track — on request ("make it a full course", "I need a second lesson") or after accepting the growth offer below:

0. **Stage 1: only full ↔ mini.** Converting existing material (track `convert`) and building a template (track `template`) come in a later stage: if the instructor asks for one, say in one line that this is not available yet and offer the full or the mini track (as `tasks/init-course.md` step 2a does). Never write `Track: convert` or `Track: template`.
1. **Show and confirm in one form** (tier "confirm in chat"; the single write confirmation of the switch):
   - the new track in teacher words (never the slug) and its `__Track:__` values;
   - the markers that go: sections the new track needs (`tasks/init-course.md` → When-Needed Markers) — they get their default content as in step 3;
   - the markers that come: sections the new track does not need, **only if they are still empty** — a section with content keeps it and stays active;
   - from mini to full: `Type` is `single-lesson` (the mini track's internal type); ask the two course-type questions of `tasks/init-course.md` step 3 in the same form, replace the type with the answer and set the Course Profile from its step 6 (`Agenda required` included). `__File Structure:__` stays `single-file` and the root `README.md` stays unit 1 — but in the full track each unit is a `##` chapter titled with its unit title, so `README.md` is **restructured in place** (named in the form as one line, e.g. "Your slides become the first lesson of the course", translated): the `#` course title and its title slide stay; `## {unit 1 title}` (the title of `### 1.` in `## Sessions`, also when it equals the course title — then with the prefix `data/file-structure-modes.md` → single-file gives, e.g. "Lesson: {title}", so the two anchors differ) is inserted right before the first former `##` slide; every former `##` slide becomes `###` and every deeper heading moves one level down as well (`###` → `####` …; headings inside code blocks stay). Another file per unit is a later mode change (`data/file-structure-modes.md` → Changing mode later);
   - one line on what comes next in the new track (the overview's next step).
2. **One write** for all of it: the `__Track:__` lines (and the Course Profile lines a new course type brings), every marker that goes, every marker that comes (form: `tasks/init-course.md` → When-Needed Markers). Never delete content: material, units, reports and notes stay. From mini to full the restructured `README.md` is one material write under the same confirmation, right after the journal write; then run `node specs/dashboard/check-material.mjs README.md`.
3. Steps 4 and 5 as above; the overview's step list follows the new track (`tasks/update-dashboard.md` → Rules → Process steps per track), with a `note`.

## Growth offer

The agent offers growth by itself, once per occasion, and never activates silently:

- **Mini course** (and, in a later stage, a converted course): the plan or the material grows beyond about six slides, or a second topic appears → single choice: 1. "Plan a full course" (Track switch) · 2. "Keep it small" (shorten, or start a second small course later) · 3. "Add only {section}" when one section would help (e.g. didactics for a guiding figure) — then this task for that section.
- **Any track:** a task needs a marked section (e.g. the instructor asks for learner profiles) → offer `:activate-section {slug}` with one line why, instead of asking for the section's content.

## Rules

- A marked section counts as empty for every task; no task asks for its content — this task is the only way in.
- Activating and switching only add: never delete content. Only the marker block is replaced; heading lines, separators `---` and every other section stay untouched.
- `## Course Context`, `## Dashboard`, `## Templates`, `## Publishing` and `## Notes Backup` never carry a marker; this task never sets one outside a track switch.
- `process.later` in the overview is computed by `write-dashboard.mjs` from the markers — never written by hand.
