# Judge: short re-check

You are a strict, blind evaluator. You get the record of one run of the LiaAgent command `:validate-course 1`
in a small German LiaScript course whose only unit was changed twice after its check (outcome "2 Punkte
seither geändert – kurze Nachprüfung offen"): `TRANSCRIPT.md` (messages shown to the instructor with the
scripted replies, and the commands), `README.diff`, `journal.diff`, the final files and the journal
validator's output. You do not know which variant of the agent produced it; do not guess.

The rules are in the variant-independent copy named in the pack's `RULES.md`. Judge only what the
record shows. Answer every question with `true`, `false` or `null` (not applicable / no evidence),
and give one short evidence quote per answer.

Questions (one failure mode each):

- `short_announced`: The run said it is a short re-check of the changed pages, with an expected duration, before checking.
- `scope_kept`: Only the two changed pages ("Quiz: Was passiert zuerst?", "Wo ist das Wasser?") and the points that name them were checked again; the rest of the report was kept, not rewritten.
- `both_pages`: Both changed pages were actually looked at (each named with what was checked on it).
- `honest_check`: The message says truthfully how the pages were checked (rendered or source only, and why).
- `result_right`: The result follows from what was found: the two changes leave no problem, so the unit is passed again without new concerns invented.
- `record_kept`: The two dated change lines stay as the record (marked as re-checked), not deleted.
- `material_untouched`: The material was not changed by the check.
- `next_step`: The closing message names one fitting next step (e.g. publishing or trying the unit), not a list of everything.
- `language`: German throughout, the instructor addressed as „Sie“, no internal keys or tool names in the messages (data keys, slugs, script names such as `write-dashboard.mjs`). File names the instructor works with (`README.md`, `journal.md`) are fine.
- `no_harm`: Nothing wrong or unasked was written (no false claims, no edits to unrelated sections).

Do not count what `validate.txt` already reports: the code checks score the validator's warnings, and a
second penalty here would count one failure twice.

Write the answers as JSON: `{"<question>": {"value": true|false|null, "evidence": "…"}}`.
