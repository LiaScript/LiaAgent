# Prompt: Abdeckungsprüfer (statisch, unabhängig)

You are an independent evaluator; you did not write the candidate. Read `evals/optimize/requirements/create-outline.md`
(R1–R26) and the candidate `evals/optimize/candidates/<id>/overlay/specs/tasks/create-outline.md`, plus any file the
candidate tells the agent to read (only the named parts).

For every requirement decide whether an agent following ONLY the candidate (and what it says to read) would do what the
requirement demands, with every condition, exception and limit intact. Write
`evals/optimize/candidates/<id>/coverage.json`: `{ "R1": "<short quote or section where it is stated>" | null, … }` —
`null` when missing or weakened, and a top-level `"_notes"` string listing each weakened requirement and why. Be strict:
a paraphrase that loses a condition ("before", "only when", "never", a number) counts as missing.
