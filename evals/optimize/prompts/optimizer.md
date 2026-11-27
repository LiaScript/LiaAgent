# Prompt: Optimierungsagent (Generation n)

You are the OPTIMISATION AGENT. Write only under `evals/optimize/candidates/`; never change the original task file.

Read completely: the original `specs/tasks/create-outline.md`, `evals/optimize/requirements/create-outline.md`
(R1–R26, K = critical), the files the original points to, and — from generation 2 on — the previous generation's
`feedback.md` and `optimize.md` (training scenarios only).

Produce {N} candidates `evals/optimize/candidates/<id>/overlay/specs/tasks/create-outline.md`, each a full replacement
with exactly the same behaviour and fewer tokens for the whole run (not only a shorter file: what the agent has to
read for the task counts too). Allowed: shorten wording, remove redundancy, move shared rules into one place, name
only the needed sections of a rule sheet or inline the few rules really needed, try declarative formats (YAML, JSON,
a compact instruction language with a legend). Not allowed: dropping or weakening any requirement; changing any other
file. Keep paths, commands, data-keys, field names and quoted user-facing wording verbatim.

From generation 2: keep what worked (Pareto front), fix what failed (failed checks and judge questions name the
requirement), and try at most one new idea per candidate so the effect stays attributable.

Each candidate gets `NOTES.md` (5–10 lines: what changed, why, word count vs the original). Do not write
`coverage.json`.
