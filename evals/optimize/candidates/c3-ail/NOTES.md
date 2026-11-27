# c3-ail — Agent Instruction Language

- 7-line legend (`@` file, `⊂` read only part / `⊂ *` completely, `?` ask, `!` never, `→`, `⇐` prefill, `≤`, `|`, `"…"` user wording, `[n]`, `§`, `+`) defines the notation before use.
- READ line gives the whole reading plan in one line: `chat-dialog.md` replaced by `§DIALOG` (the §1 rules this task uses), `⊂ ## 2. Fit the narrow chat` only in the preview chat, `⊂ Changing another section` only if needed; `update-dashboard.md` + `project-dashboard.yaml` before the draft [8], bringing `journal-links.md ⊂ *`.
- Steps [1]–[9] in the original order; every `never` became `!`, every "ask only if" became `?`; course-type rules of [3] kept verbatim as `|` alternatives.
- Journal-writing rules from `journal-links.md` that the save needs inlined in [8].
- "A new writing rule for all units" (§1) omitted — not reachable from this task.
- Word count (wc -w): 1196 vs original 1053 (+143; symbols count as words, token count is lower than prose). Read set before the save: terminal ~7,053 vs 8,352 (−1,299); preview chat ~7,549 (−803).
