#!/usr/bin/env python3
"""Build the pilot skills from the task files: python3 docs/levers/assemble_skills.py

The rules stay in specs/tasks/*.md (the single source); this script cuts them into
`.claude/skills/lia-*/SKILL.md` plus `references/` by text anchors and copies every
rule verbatim. Only the routing text ("Load only what applies") is new. Run it after
every change to quick-fix.md, update-dashboard.md or build-session.md, then
`node docs/skills-pilot/coverage.mjs`.
"""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SK = ROOT / ".claude/skills"


class Doc:
    def __init__(self, name):
        self.lines = (ROOT / "specs/tasks" / name).read_text(encoding="utf8").split("\n")

    def _find(self, prefix, after=0):
        for i in range(after, len(self.lines)):
            if self.lines[i].startswith(prefix):
                return i
        raise SystemExit(f"anchor not found: {prefix!r}")

    def blk(self, start, end=None):
        """Lines from the one starting with `start` up to (not including) the one starting with `end`;
        without `end` only the start line (most rules here are one long line)."""
        i = self._find(start)
        j = self._find(end, i + 1) if end else i + 1
        return "\n".join(self.lines[i:j]).strip("\n")

    def rest(self, start):
        """From the line starting with `start` to the end of the file."""
        return "\n".join(self.lines[self._find(start):]).strip("\n")


def retarget(text):
    for old, new in [
        ("`tasks/update-dashboard.md` and `templates/project-dashboard.yaml` — read right before the overview is written",
         "the skill `lia-update-dashboard` — invoke it right before the overview is written"),
        ("After every save run `tasks/update-dashboard.md` to update", "After every save invoke the skill `lia-update-dashboard` to update"),
        ("`tasks/quick-fix.md` (the fixes of 1d and 2b stay here", "the skill `lia-quick-fix` (the fixes of 1d and 2b stay here"),
        ("`tasks/quick-fix.md` (as soon as a fix or a blocking concern is weighed — its \"When to use\" table decides 1d and 2b)",
         "the skill `lia-quick-fix` (as soon as a fix or a blocking concern is weighed — its \"When to use\" table decides 1d and 2b)"),
        ("`tasks/update-dashboard.md` (step 4)", "the skill `lia-update-dashboard` (step 4)"),
        ("`tasks/update-dashboard.md`, its rule sheets", "the skill `lia-update-dashboard`, its rule sheets"),
        ("d. **Read first, completely:** `tasks/quick-fix.md`", "d. **Invoke first:** the skill `lia-quick-fix`"),
        ("Run `tasks/update-dashboard.md`. Report", "Invoke the skill `lia-update-dashboard`. Report"),
    ]:
        text = text.replace(old, new)
    return text


def write(rel, body):
    p = SK / rel
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(retarget(body).rstrip() + "\n", encoding="utf8")


def table(rows, cols=("Condition", "Reference")):
    head = "| " + " | ".join(cols) + " |\n|" + "---|" * len(cols)
    return head + "\n" + "\n".join("| " + " | ".join(r) + " |" for r in rows)


# ------------------------------------------------------------------ quick-fix
q = Doc("quick-fix.md")
write("lia-quick-fix/SKILL.md", f"""---
name: lia-quick-fix
description: LiaAgent Teaching-Agent command `:quick-fix {{number}} {{description}}` (also the click `agent:teaching/quick-fix`). Fast correction of one well-defined issue in a LiaScript material file — typo, broken syntax, one example, one quiz answer, a link. Also the change path for every change to a unit that already has a check report, and the approval form after the instructor's review. Called by lia-build-session and validate-course as a sub-procedure.
---

# :quick-fix

{q.blk("Fast, focused correction")}

{q.blk("Minimal overhead for small")}

## Load only what applies

This file is the whole task for the plain case. Read a reference **completely** as soon as its condition holds — before the step named:

{table([
    ("Called from `:build-session` or `:validate-course`", "`references/called-by.md`", "step 1"),
    ("The unit already has a `#### Validation Report` (also changes asked in the chat or after `:try-as-learner`)", "`references/after-check.md`", "step 2a"),
    ("The fix touches any line of `journal.md` (report lines, image entries, to-dos, unit summary)", "`references/journal-lines.md`", "step 2b"),
    ("The fix comes from the instructor's own review of material that has no `material approved` decision", "`references/approval.md`", "step 4"),
    ("`## Course Context` → `__Track:__ design`", "`references/design-track.md`", "step 1"),
], ("Condition", "Reference", "Before"))}

## Inputs

{q.blk("- `number`: session number", "- Rule sheets, read completely")}
- Rule sheets, read completely when their case occurs (`data/agent-links.md` → Chat Conduct → Rule sheets): `data/chat-dialog.md` when the dialog runs in the preview chat (MCP gate open); `data/chat-checks.md` when step 3 reports how the change was checked; `data/journal-links.md` when a journal line is written

## Output

{q.blk("- Updated material document", "## Steps")}

## Steps

{q.blk("1. **Scope confirmation:**", "---")}

---

{q.rest("## When to use vs. :coauthor-materials")}
""")

write("lia-quick-fix/references/called-by.md", f"# quick-fix — called by another task\n\n{q.blk('**Called from `:build-session`**')}\n\n{q.blk('**Called from `:validate-course`**')}\n")
write("lia-quick-fix/references/after-check.md", f"# quick-fix — change after a check\n\n{q.blk('**Change path after a check:**')}\n\n{q.blk('**Only changes are')}\n")
write("lia-quick-fix/references/journal-lines.md", f"# quick-fix — journal lines of a fix\n\n{q.blk('**One journal write per fix:**')}\n")
write("lia-quick-fix/references/approval.md", f"# quick-fix — approval after a review\n\n{q.blk('**Approval after a review:**')}\n")
write("lia-quick-fix/references/design-track.md", f"# quick-fix — design track\n\n{q.blk('**Design track:**')}\n")

# ----------------------------------------------------------- update-dashboard
u = Doc("update-dashboard.md")
write("lia-update-dashboard/SKILL.md", f"""---
name: lia-update-dashboard
description: LiaAgent command `:update-dashboard`. Derives the instructor overview (`journal.md` → `## Dashboard`, one `json @Dashboard.View` block) and the action lines via `write-dashboard.mjs`; the agent writes only the texts and the open points. Use after every task that changes project state (list in references/triggers.md) and when the instructor asks to refresh the overview.
---

# :update-dashboard

{u.blk("Derive the instructor-facing overview", "## Inputs")}

## Load only what applies

Read a reference **completely** as soon as its condition holds:

{table([
    ("Which tasks call this one", "`references/triggers.md` (for callers; not needed inside this task)"),
    ("Step 6 — always (the open points are a mandatory checklist)", "`references/open-points.md`"),
    ("A light track (`__Track:__` other than `full`), a first Dashboard on a track, or a track switch", "`references/tracks.md`"),
    ("Full track and the step \"Templates for activities\" (`## Templates` has a selection line or briefs)", "`references/template-step.md`"),
    ("`validate-journal.mjs` names an older journal layout", "`references/migration.md`"),
])}

{u.blk("## Inputs", "## Automatic Trigger")}

## Steps

{u.blk("0. **Sign of life first**", "6. **Open points")}
6. **Open points (mandatory checklist)** — `references/open-points.md`, read completely.
{u.blk("7. Produce the JSON", "   **Older journal layout:**")}
   **Older journal layout:** `references/migration.md`.
{u.blk("10. Action lines:", "## Rules")}

## Rules

{u.blk("- All facts and workflow decisions", "- **Process steps per track:**")}
- **Process steps per track** and keeping them stable: `references/tracks.md`.
- **Template step:** `references/template-step.md`.
{u.rest("- `plan` (provisional planning)")}
""")
write("lia-update-dashboard/references/triggers.md", f"# update-dashboard — automatic triggers\n\n{u.blk('Run this task automatically', '## Steps')}\n")
write("lia-update-dashboard/references/open-points.md", f"# update-dashboard — step 6, open points\n\n{u.blk('6. **Open points', '7. Produce the JSON')}\n")
write("lia-update-dashboard/references/migration.md", f"# update-dashboard — older journal layout (step 9)\n\n{u.blk('   **Older journal layout:**', '10. Action lines:')}\n")
write("lia-update-dashboard/references/tracks.md", f"# update-dashboard — process steps per track\n\n{u.blk('- **Process steps per track:**', '- **Template step:**')}\n")
write("lia-update-dashboard/references/template-step.md", f"# update-dashboard — template step\n\n{u.blk('- **Template step:**', '- `plan` (provisional planning)')}\n")

# -------------------------------------------------------------- build-session
b = Doc("build-session.md")
write("lia-build-session/SKILL.md", f"""---
name: lia-build-session
description: LiaAgent Teaching-Agent command `:build-session {{number}}` (click `agent:teaching/build-session?number=…`, also "Let unit {{n}} be prepared"). Orchestrates one unit end to end — skeleton → generated material → check loop with mechanical fixes → persona review → images — as one bounded run with a single start confirmation, with the reading-heavy steps delegated to subagents.
---

# :build-session

{b.blk("Orchestrates the full pipeline", "## Inputs")}

## Load only what applies

Read a reference **completely** as soon as its condition holds:

{table([
    ("`## Sessions` has no `### {number}. {title}` yet, or the run was asked for before the sketch", "`references/skeleton.md` (step 0)"),
    ("The unit gets images (any spot with source `generated`, `free-photo` or `own`)", "`references/images.md` (step 1b, step 3 and their confirmations)"),
    ("`### Learner Personas` holds at least one persona", "`references/personas.md` (step 2)"),
    ("Always, before the start confirmation", "`references/writes.md` (writes per run)"),
])}

{b.blk("## Inputs", "## Before the start")}

{b.blk("## Before the start", "## Confirmations")}

## Confirmations

{b.blk("- The start confirmation of `:build-session`", "- **Outside the project** it covers nothing")}
- Outside the project and the rendered check: `references/images.md` → Confirmations outside the project.

{b.blk("## Delegation (subagents)", "## Steps")}

## Steps

### 0. Ensure a skeleton exists

{b.blk("If `journal.md` → `## Sessions` has no")} The details of the sketch, the one-form start and the overview patch: `references/skeleton.md`.

### 1. Content loop (mechanical gate)

{b.blk("a. **First iteration only:** if the session")}

b. **First iteration only:** image spots — `references/images.md` → Step 1b.

{b.blk("c. ", "### 2. Persona review loop")}

### 2. Persona review loop

`references/personas.md` — only if `journal.md` → `## Agents` → `### Learner Personas` contains at least one persona.

{b.blk("`[if no personas exist]`")}

### 3. Image finalization

{b.blk("Runs **once**, only if Steps 1 and 2")} The `generated` path: `references/images.md` → Step 3.

{b.blk("### 4. Finalize", "## Writes per run")}

{b.rest("## Cross-agent execution note")}
""")
write("lia-build-session/references/skeleton.md", f"# build-session — step 0, skeleton and start\n\n{b.blk('If `journal.md` → `## Sessions` has no')}\n\n{b.blk('- **Check the sketch before the start:**', '### 1. Content loop')}\n")
write("lia-build-session/references/images.md", f"""# build-session — images

## Confirmations outside the project

{b.blk("- **Outside the project** it covers nothing", "## Delegation (subagents)")}

## Step 1b

{b.blk("b. **First iteration only:** identify spots", "c. ")}

## Step 3 (generated images)

{b.blk("Only for `generated` images:")}
""")
write("lia-build-session/references/personas.md", f"# build-session — step 2, persona review loop\n\n{b.blk('a. For each persona', '`[if no personas exist]`')}\n")
write("lia-build-session/references/writes.md", f"# build-session — writes per run\n\n{b.blk('## Writes per run', '## Cross-agent execution note')}\n")
print("skills written to", SK)
