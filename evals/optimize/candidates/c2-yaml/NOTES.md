# c2-yaml — declarative workflow

- One header line, then one YAML block: `purpose`, `inputs`, `reads` (file + exact part + `when`), `not_read`, `dialog`, `steps` (id/do/ask_if/never/check/by_course_type), `save` (before/write/keep/never/correct), `after`.
- `reads` makes the reading plan explicit: `chat-dialog.md` not read completely; only `## 2. Fit the narrow chat` (preview chat) and `Changing another section` (if a foreign section changes); `update-dashboard.md` + `project-dashboard.yaml` before the overview draft, which bring `journal-links.md` completely.
- `dialog` inlines the §1 rules this task uses (same set as c1). "A new writing rule for all units" omitted — never triggered by an outline save.
- All `never` rules of step 5 grouped (no "Grundstufe", no content question in the save form, no own addition first named in the save preview); time-check repetition and open gap → `decisions` as `check`.
- Journal-writing rules (heading, action line, provenance comment, "still empty" note, no `{{…}}`) under `save.keep/never`.
- Word count (wc -w): 1214 vs original 1053 (+161). Read set before the save: terminal ~7,071 vs 8,352 (−1,281); preview chat ~7,567 (−785).
