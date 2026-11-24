#!/usr/bin/env python3
"""Reading load per command: main vs. experiment/levers-tasks vs. experiment/levers-skills.

Run from the project root (any branch): python3 docs/levers/measure.py [--json]

Files are read from the git refs, so all three states are measured from one checkout.
Each scenario lists what the agent must read under the rules of each variant.
"file#Heading" is one section, "file@Prefix" one paragraph (the line starting with Prefix).
Words like docs/regeln-als-werkzeuge.md; tokens estimated as characters / 4 (no offline
tokenizer) — compare ratios, not absolute tokens.
"""
import json, re, subprocess, sys

REFS = {"main": "6608166", "tasks": "experiment/levers-tasks", "skills": "experiment/levers-skills"}
_cache = {}


def show(ref, path):
    key = (ref, path)
    if key not in _cache:
        _cache[key] = subprocess.run(["git", "show", f"{REFS[ref]}:{path}"], capture_output=True, text=True, check=True).stdout
    return _cache[key]


def text_of(ref, item):
    if "@" in item:
        path, _, prefix = item.partition("@")
        for line in show(ref, path).split("\n"):
            if line.startswith(prefix):
                return line
        raise SystemExit(f"{ref}: paragraph not found: {item}")
    path, _, heading = item.partition("#")
    text = show(ref, path)
    if not heading:
        return text
    lines = text.split("\n")
    for i, line in enumerate(lines):
        m = re.match(r"^(#+)\s+(.*)$", line)
        if m and heading.lower() in m.group(2).lower():
            out = [line]
            for nxt in lines[i + 1:]:
                n = re.match(r"^(#+)\s", nxt)
                if n and len(n.group(1)) <= len(m.group(1)):
                    break
                out.append(nxt)
            return "\n".join(out)
    raise SystemExit(f"{ref}: section not found: {item}")


def load(ref, items):
    seen, words, chars = [], 0, 0
    for it in items:
        if it in seen:
            continue
        seen.append(it)
        t = text_of(ref, it)
        words += len(t.split())
        chars += len(t)
    return {"words": words, "tokens_est": round(chars / 4), "files": seen}


S = "specs/"
BASE = ["CLAUDE.md", S + "agents/teaching-agent.yaml", S + "data/agent-links.md", S + "data/chat-wording.md"]
TYPE = S + "data/session-types.md#Resolving a session's type"
PATHS = S + "data/file-structure-modes.md#Resolving paths"
SHEETS = [S + "data/chat-dialog.md", S + "data/chat-checks.md", S + "data/journal-links.md"]
AFTER = [S + "templates/session-validation.yaml", S + "templates/session-skeleton.yaml", S + "tasks/validate-course.md@   **Short re-check:**"]
LIGHT = [S + "tasks/validate-course.md@- **One unit, one run:**"]
CHEAT_ALL = S + "data/liascript-cheat-sheet.md"
CS = S + "data/cheat-sheet/"
CHEAT_IDX = [CHEAT_ALL, CS + "00-checks.md"]
SK = ".claude/skills/"
UD_TASK = [S + "tasks/update-dashboard.md", S + "templates/project-dashboard.yaml", S + "data/journal-links.md"]
UD_SKILL = [SK + "lia-update-dashboard/SKILL.md", SK + "lia-update-dashboard/references/open-points.md",
            SK + "lia-update-dashboard/references/tracks.md", S + "templates/project-dashboard.yaml", S + "data/journal-links.md"]
UD_SKILL_FULL = [x.replace("references/tracks.md", "references/template-step.md") for x in UD_SKILL]
QF = SK + "lia-quick-fix/"
CHECK = [S + "tasks/validate-course.md", S + "checklists/course-quality-checklist.md", S + "data/duration-heuristic.md",
         S + "templates/session-validation.yaml", S + "data/session-types.md", S + "data/didactic-methods.md",
         S + "templates/session-skeleton.yaml", S + "tasks/validate-syntax.md", S + "data/chat-checks.md"]


def cheat_all(ref):
    if ref == "main":
        return [CHEAT_ALL]
    parts = sorted(re.findall(r"`cheat-sheet/([\w.-]+\.md)`", show(ref, CHEAT_ALL)))
    return [CHEAT_ALL] + [CS + p for p in parts]


def scenarios(ref):
    """Read lists of the mini course used in the simulated runs (light track, one unit, preview chat closed)."""
    full = cheat_all(ref)
    syntax_full = [S + "tasks/validate-syntax.md", S + "data/chat-checks.md"] + full
    if ref == "main":
        qf, sheets, ud = [S + "tasks/quick-fix.md"], SHEETS, UD_TASK
        syn_text, syn_quiz = syntax_full, syntax_full
        q2_extra, refs_a, refs_b = AFTER, [], []
    else:
        syn_text = [S + "tasks/validate-syntax.md", S + "data/chat-checks.md"] + CHEAT_IDX + [CS + "02-text-lists-alerts-citations.md"]
        syn_quiz = [S + "tasks/validate-syntax.md", S + "data/chat-checks.md"] + CHEAT_IDX + [CS + "06-quizzes.md", CS + "03-presentation-and-speech.md"]
        q2_extra = AFTER + LIGHT
        if ref == "tasks":
            qf, sheets, ud = [S + "tasks/quick-fix.md"], SHEETS, UD_TASK
            refs_a, refs_b = [], []
        else:
            qf, ud = [QF + "SKILL.md"], UD_SKILL
            sheets = [S + "data/chat-checks.md", S + "data/journal-links.md"]   # chat-dialog only with the gate open
            refs_a = [QF + "references/after-check.md", QF + "references/journal-lines.md", QF + "references/approval.md"]
            refs_b = [QF + "references/after-check.md", QF + "references/journal-lines.md"]
    out = {
        "A quick-fix: quiz gives the answer away, after a check, approval": qf + refs_a + [TYPE, PATHS] + sheets + syn_quiz + q2_extra + ud,
        "B quick-fix: typo, after a check, approved": qf + refs_b + [TYPE, PATHS] + sheets + syn_text + q2_extra + ud,
    }
    # build-session (full track, free photos, no personas, one fix round): main context; subagents separately
    sub = {"1a promote": [S + "tasks/promote-session.md", TYPE, S + "data/session-types.md#Objectives and duration", S + "data/didactic-methods.md", S + "data/file-structure-modes.md", S + "data/chat-dialog.md", S + "data/journal-links.md"] + full,
           "1b photos": [S + "tasks/create-image.md", S + "templates/session-skeleton.yaml", S + "data/file-structure-modes.md", S + "data/chat-checks.md", S + "data/chat-dialog.md", S + "data/journal-links.md"],
           "1c check": CHECK + full,
           "1c report": [S + "templates/session-validation.yaml", S + "tasks/validate-course.md#Validation Storage"]}
    if ref == "main":
        main_ctx = [S + "tasks/build-session.md", TYPE] + SHEETS + [S + "templates/session-skeleton.yaml", S + "data/file-structure-modes.md"] \
            + sub["1a promote"] + sub["1b photos"] + CHECK + full + [S + "tasks/quick-fix.md"] + AFTER + UD_TASK
        subs = {}
    elif ref == "tasks":
        main_ctx = [S + "tasks/build-session.md", TYPE] + SHEETS + [S + "templates/session-skeleton.yaml", S + "data/file-structure-modes.md", S + "tasks/quick-fix.md"] + UD_TASK
        subs = sub
    else:
        main_ctx = [SK + "lia-build-session/SKILL.md", SK + "lia-build-session/references/images.md", SK + "lia-build-session/references/writes.md", TYPE] \
            + SHEETS + [S + "templates/session-skeleton.yaml", S + "data/file-structure-modes.md", QF + "SKILL.md", QF + "references/called-by.md"] + UD_SKILL_FULL
        subs = sub
    out["C build-session: main context"] = main_ctx
    return out, subs


def main():
    res = {}
    for ref in REFS:
        sc, subs = scenarios(ref)
        res[ref] = {"base": load(ref, BASE), **{k: load(ref, v) for k, v in sc.items()},
                    "C build-session: subagents (sum)": {"words": sum(load(ref, v)["words"] for v in subs.values()),
                                                         "tokens_est": sum(load(ref, v)["tokens_est"] for v in subs.values())}}
    if "--json" in sys.argv:
        print(json.dumps({r: {k: {"words": v["words"], "tokens_est": v["tokens_est"]} for k, v in d.items()} for r, d in res.items()}, indent=1, ensure_ascii=False))
        return
    rows = list(res["main"].keys())
    print(f"{'words':<56} {'main':>8} {'tasks':>8} {'skills':>8}   tasks vs main   skills vs main")
    for k in rows:
        m, t, s = (res[r][k]["words"] for r in REFS)
        pct = lambda x: f"{100 * (x / m - 1):+.0f}%" if m else "—"
        print(f"{k:<56} {m:>8} {t:>8} {s:>8}   {pct(t):>12}   {pct(s):>14}")


if __name__ == "__main__":
    main()
