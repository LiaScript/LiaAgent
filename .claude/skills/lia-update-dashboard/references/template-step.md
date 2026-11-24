# update-dashboard — template step

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
