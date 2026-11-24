#!/usr/bin/env python3
"""Skills pilot: reading load per command, before (task files) and after (skills).

Run from the project root:  python3 docs/skills-pilot/measure.py [--json]

Each scenario lists what the agent must read under the rules of each variant —
derived from the Inputs of the task files / the "Load only what applies" tables
of the skills. "file#Heading" means one section (up to the next heading of the
same or a higher level), "file@57" one paragraph by line. Words are counted like the repo's own table
(docs/regeln-als-werkzeuge.md); tokens are an estimate (characters / 4), there
is no offline tokenizer here — compare ratios, not absolute token counts.
"""
import json, re, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SK = ".claude/skills"


def text_of(item: str) -> str:
    if "@" in item:  # "file@57" or "file@57-60": a paragraph by line numbers
        path, _, rng = item.partition("@")
        a, _, b = rng.partition("-")
        lines = (ROOT / path).read_text(encoding="utf8").split("\n")
        return "\n".join(lines[int(a) - 1:int(b or a)])
    path, _, heading = item.partition("#")
    p = ROOT / path if not path.startswith("specs/") and (ROOT / path).exists() else ROOT / path
    if not p.exists():
        p = ROOT / "specs" / path
    text = p.read_text(encoding="utf8")
    if not heading:
        return text
    lines = text.split("\n")
    for i, line in enumerate(lines):
        m = re.match(r"^(#+)\s+(.*)$", line)
        if m and heading.lower() in m.group(2).lower():
            level = len(m.group(1))
            out = [line]
            for nxt in lines[i + 1:]:
                n = re.match(r"^(#+)\s", nxt)
                if n and len(n.group(1)) <= level:
                    break
                out.append(nxt)
            return "\n".join(out)
    raise SystemExit(f"section not found: {item}")


def load(items):
    seen, words, chars = [], 0, 0
    for it in items:
        if it in seen:
            continue
        seen.append(it)
        t = text_of(it)
        words += len(t.split())
        chars += len(t)
    return {"files": seen, "words": words, "tokens_est": round(chars / 4)}


# Read once per session in both variants (gate open). CLAUDE.md is loaded by the harness.
BASE = ["CLAUDE.md", "specs/agents/teaching-agent.yaml", "specs/data/agent-links.md", "specs/data/chat-wording.md"]

# Shared building blocks (unchanged files outside the pilot).
SESSION_TYPE = "specs/data/session-types.md#Resolving a session's type"
PATHS = "specs/data/file-structure-modes.md#Resolving paths"
SYNTAX = ["specs/tasks/validate-syntax.md", "specs/data/liascript-cheat-sheet.md", "specs/data/chat-checks.md"]
RULE_SHEETS = ["specs/data/chat-dialog.md", "specs/data/chat-checks.md", "specs/data/journal-links.md"]

UD_OLD = ["specs/tasks/update-dashboard.md", "specs/templates/project-dashboard.yaml", "specs/data/journal-links.md"]
UD_NEW = [f"{SK}/lia-update-dashboard/SKILL.md", f"{SK}/lia-update-dashboard/references/open-points.md",
          f"{SK}/lia-update-dashboard/references/template-step.md",
          "specs/templates/project-dashboard.yaml", "specs/data/journal-links.md"]

QF = f"{SK}/lia-quick-fix"
AFTER_CHECK = ["specs/templates/session-validation.yaml", "specs/templates/session-skeleton.yaml",
               "specs/tasks/validate-course.md@57"]

VALIDATE = ["specs/tasks/validate-course.md", "specs/checklists/course-quality-checklist.md",
            "specs/data/duration-heuristic.md", "specs/templates/session-validation.yaml",
            "specs/data/session-types.md", "specs/data/didactic-methods.md",
            "specs/templates/session-skeleton.yaml"] + SYNTAX
BUILD_SHARED = ["specs/templates/session-skeleton.yaml", "specs/data/file-structure-modes.md",
                "specs/tasks/promote-session.md", "specs/tasks/create-image.md"] + VALIDATE

SCENARIOS = {
    "Q1 quick-fix: typo, terminal, unit not yet checked": {
        "old": ["specs/tasks/quick-fix.md", SESSION_TYPE, PATHS] + SYNTAX + RULE_SHEETS + UD_OLD,
        "new": [f"{QF}/SKILL.md", SESSION_TYPE, PATHS] + SYNTAX + UD_NEW,
    },
    "Q2 quick-fix: preview chat, after a check, learner text, approval form": {
        "old": ["specs/tasks/quick-fix.md", SESSION_TYPE, PATHS] + SYNTAX + RULE_SHEETS + AFTER_CHECK + UD_OLD,
        "new": [f"{QF}/SKILL.md", f"{QF}/references/after-check.md", f"{QF}/references/journal-lines.md",
                f"{QF}/references/approval.md", SESSION_TYPE, PATHS] + SYNTAX + RULE_SHEETS + AFTER_CHECK + UD_NEW,
    },
    "U1 update-dashboard: routine run, full track": {
        "old": UD_OLD,
        "new": UD_NEW,
    },
    "B1 build-session: preview chat, free photos, no personas, one fix round": {
        "old": ["specs/tasks/build-session.md", SESSION_TYPE] + RULE_SHEETS + BUILD_SHARED
               + ["specs/tasks/quick-fix.md"] + AFTER_CHECK + UD_OLD,
        "new": [f"{SK}/lia-build-session/SKILL.md", f"{SK}/lia-build-session/references/images.md",
                f"{SK}/lia-build-session/references/writes.md", SESSION_TYPE] + RULE_SHEETS + BUILD_SHARED
               + [f"{QF}/SKILL.md", f"{QF}/references/called-by.md"] + UD_NEW,
    },
}


# ---- Projections (not built in the branch; measured on the real section sizes) ----
# P1: the cheat sheet split by construct, so a fix reads only the sections it touches.
CHEAT = "specs/data/liascript-cheat-sheet.md"
CHEAT_TEXT = [f"{CHEAT}#3) Text, Lists", f"{CHEAT}#16) Common Mistakes"]
CHEAT_QUIZ = [f"{CHEAT}#10) Quizzes & Interaction", f"{CHEAT}#16) Common Mistakes"]
# P2: build-session hands promote, images and the check to subagents; the main context keeps only
# its own skill, the files it writes with, and the results the subagents return.
PROJECTIONS = {
    "Q1 + P1 (cheat sheet by construct)": [c if c != CHEAT else None for c in SCENARIOS["Q1 quick-fix: typo, terminal, unit not yet checked"]["new"]],
    "Q2 + P1 (cheat sheet by construct)": [c if c != CHEAT else None for c in SCENARIOS["Q2 quick-fix: preview chat, after a check, learner text, approval form"]["new"]],
    "B1 + P2 main context with subagents": [f"{SK}/lia-build-session/SKILL.md", f"{SK}/lia-build-session/references/images.md",
        f"{SK}/lia-build-session/references/writes.md", SESSION_TYPE] + RULE_SHEETS
        + ["specs/templates/session-skeleton.yaml", "specs/data/file-structure-modes.md", "specs/templates/session-validation.yaml",
           f"{QF}/SKILL.md", f"{QF}/references/called-by.md"] + UD_NEW,
}
PROJECTIONS["Q1 + P1 (cheat sheet by construct)"] = [c for c in PROJECTIONS["Q1 + P1 (cheat sheet by construct)"] if c] + CHEAT_TEXT
PROJECTIONS["Q2 + P1 (cheat sheet by construct)"] = [c for c in PROJECTIONS["Q2 + P1 (cheat sheet by construct)"] if c] + CHEAT_QUIZ
PROJECTION_BASE = {"Q1 + P1 (cheat sheet by construct)": "Q1 quick-fix: typo, terminal, unit not yet checked",
                   "Q2 + P1 (cheat sheet by construct)": "Q2 quick-fix: preview chat, after a check, learner text, approval form",
                   "B1 + P2 main context with subagents": "B1 build-session: preview chat, free photos, no personas, one fix round"}


def skill_metadata_words():
    """Words of the always-loaded skill descriptions (name + description) of the pilot skills."""
    out = {}
    for d in sorted((ROOT / SK).iterdir()):
        front = (d / "SKILL.md").read_text(encoding="utf8").split("---")[1]
        out[d.name] = len(front.split())
    return out


def main():
    base = load(BASE)
    rows = []
    for name, v in SCENARIOS.items():
        old, new = load(v["old"]), load(v["new"])
        rows.append({"scenario": name, "old": old, "new": new,
                     "saved_words_pct": round(100 * (1 - new["words"] / old["words"]), 1)})
    proj = []
    for name, items in PROJECTIONS.items():
        old = load(SCENARIOS[PROJECTION_BASE[name]]["old"])
        new = load(items)
        proj.append({"scenario": name, "old": old, "new": new,
                     "saved_words_pct": round(100 * (1 - new["words"] / old["words"]), 1)})
    meta = skill_metadata_words()
    if "--json" in sys.argv:
        print(json.dumps({"base": base, "rows": rows, "projections": proj, "skill_metadata_words": meta},
                         ensure_ascii=False, indent=1))
        return
    print(f"Base load per session (both variants): {base['words']} words, ~{base['tokens_est']} tokens")
    print(f"{'Scenario':<72} {'old words':>9} {'new words':>9} {'saved':>6} {'old tok~':>9} {'new tok~':>9}")
    for r in rows:
        print(f"{r['scenario']:<72} {r['old']['words']:>9} {r['new']['words']:>9} {r['saved_words_pct']:>5}% "
              f"{r['old']['tokens_est']:>9} {r['new']['tokens_est']:>9}")
    print("\nProjections (old = the matching scenario above):")
    for r in proj:
        print(f"{r['scenario']:<72} {r['old']['words']:>9} {r['new']['words']:>9} {r['saved_words_pct']:>5}% "
              f"{r['old']['tokens_est']:>9} {r['new']['tokens_est']:>9}")
    commands = len(re.findall(r"^\| `:", (ROOT / "CLAUDE.md").read_text(encoding="utf8"), re.M))
    avg = sum(meta.values()) / len(meta)
    print(f"\nSkill descriptions (always loaded): {meta} → about {avg:.0f} words each;"
          f" for all {commands} Teaching commands as single skills about {avg * commands:.0f} words"
          f" vs. the CLAUDE.md command table today.")


if __name__ == "__main__":
    main()
