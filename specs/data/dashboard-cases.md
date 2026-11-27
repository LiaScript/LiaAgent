# Dashboard Cases

Parts of `tasks/update-dashboard.md` that only some runs need. That task names the part and its case; read
the named part only (from its heading to the next `##`), and only when the case applies.

## Whole draft

When `.cache/dashboard.json` is missing, has no `_journalHash` or was refused (`tasks/update-dashboard.md`
step 8). Read `templates/project-dashboard.yaml` completely first; before the draft send a status with its
duration.

Produce the JSON following `templates/project-dashboard.yaml`. No HTML, CSS,
JavaScript, progress percentages or duplicated totals. Always include the global
course `process`; an empty project uses `units: []` plus that `process`.

The same `labels` rules apply when the course language or the course's word for the learners changes:

**`labels`:** if the course language is neither German nor English, fill all fixed texts of the library
(`specs/dashboard/README.md` → `labels`); otherwise only `labels.decide` and `labels.prepare` with the
library's built-in group titles of that language, so the chat names the groups as the page shows them —
plus, only where the course has its own word for the learners, `usable.yes`, `usable.limited`,
`usable.no` and `viewMaterial`; never `plan`. Keep the translated suffix of `## Sessions` and `## Agenda`
in line with `## Course Context` → Terminology (the script derives the unit words from it). Ensure the
template import exists once in the header; document the template in `## Templates` via the
`tasks/manage-templates.md` procedure if it is missing there.

## Process steps

When the run's task changed `## Course Context` → `__Track:__`, `Agenda required` or `Delivery`, `## Agenda`,
`## Templates` or `## Publishing`, or the Dashboard has no `process` yet or (full track) lacks the template
step. `write-dashboard.mjs` computes the states; these rules decide the list, the `note` and your texts.

- **Process steps per track:** the course `process.steps` are the keys of `stepsOf(track, mode)`
  (`specs/dashboard/tracks.mjs`; `## Course Context` → `__Track:__`, missing = `full`), in order. Full track: the
  titles of the empty journal; else (translated) frame "Frame and learning objectives", outline "Outline and
  learning objectives", look "Look", material "Write the material", check "Check", publish "Publish", brief
  "Request and brief", build "Build and test", try "Try and approve"; design: Frame → Look → Images → Check → Publish
  (scope look drops Images, images drops Look). The first run on a light track replaces
  the empty journal's steps with that list, a track switch with a `note`; `validate-journal.mjs` checks the
  count. process.later is derived, never written by hand.
- Keep the process steps of the track stable from its first Dashboard on: the agenda step (full track)
  is listed as `optional` until `Agenda required` is set, then `planned` (yes) or
  removed with a `note` (no). The last step, publishing, is `planned` with its label when the course frame
  says learners open the course by link or platform (`Delivery:`, computed), otherwise `optional` until the
  publishing gate is PASS; `done` once `## Publishing` → `__State:__`
  starts with `published` (an English key, never translated). Its `why` never contradicts its state; where
  the link will live (a public page or the school's platform) is a `decide` item before the course check
  when the frame does not say it. Never let the number of steps change without a `note`.
- **Template step:** in the full track, the global step "Templates for activities" (translated, German "Bausteine für
  Aktivitäten" — never "Template" and never "Vorlage" in a German text for the instructor; to teachers
  „Vorlage“ means a photocopy master) stands between the didactics and the agenda and is counted. Its
  state, `next` and cards are computed from `## Templates` (`__Template selection:__`, missing = `open`, and
  the briefs `### {id} (in development)`); the agenda step keeps the state it has without a brief. Yours:
  - `result` while a brief is not adopted, by its `__State:__`: "{n} in development" (translated, German
    "{n} in Entwicklung") for `brief` and `in development`, "{n} ready to test" (German "{n} bereit zum
    Ausprobieren") for `ready to test`, joined with " · " when both occur.
  - Selection `done – …` without an open brief: `result` = the names of the adopted entries as
    `## Templates` shows them — every entry except `### Dashboard`; "none needed" (translated) only when
    there is no such entry.
  **Existing journals:** a full-track Dashboard whose `process.steps` lack this step gets it at the next run,
  directly after the didactics step, and `process.note` gets one appended sentence (e.g. "New: the step
  “Templates for activities” – ready-made building blocks for activities, or your own.", translated); the
  definition of "finished" in the note stays as it is.

## Older journal layout

When `validate-journal.mjs` names an older journal layout (`tasks/update-dashboard.md` step 9).

**Older journal layout:** if it names an older journal layout (`{{…}}`
skeletons in unfilled sections, `#### Validation Report` headings of an older
template), run `node specs/dashboard/migrate-journal.mjs --check` and show its
list in plain words ("Your journal still uses an older layout. I would update
it – only the presentation, none of your entries:" plus the list, translated),
with "Update" / "Not now" (tier "confirm in chat"). "Update" → run
`node specs/dashboard/migrate-journal.mjs`, then validate again; a line it
lists under "Left for you" is a section filled by hand — name it and propose
filling or removing that line in the same form. "Not now" → write no
Dashboard and say that the overview stays at its last state until then.

## Action lines by hand

When the run's task changed a section whose action line is not marked computed in `data/journal-links.md` →
Action lines (Visual Identity, Templates, Agents, Validation, Publishing, Notes Backup), or a session's
further commands. What this task may write stays as `tasks/update-dashboard.md` step 10 lists it.

- Replace the `<!-- class="journal-actions" -->` paragraph directly below the heading, or insert one
  there, with the commands from that table that fit the current state, with concrete arguments.
  Further commands of a session go into its `<details><summary>Technical settings and more
  actions</summary>` block directly after the action line (block order:
  `templates/session-skeleton.yaml` → `section_layout.entry_order`).
- Leave a line that already says the right thing untouched. Several line changes at once (a language
  switch, a new unit word) go into one `localize-journal.mjs` map instead of one edit per line.
- If an action line ended up below a `####` block, move it back directly below the `###` heading.
