#!/usr/bin/env python3
"""compose.py — prompt assembler. Role prompt + selected skill files -> one task prompt.

The law lives in small composable files under skills/; roles under prompts/ declare which
skills they need with a frontmatter-style first block:

    ---
    skills: hard-law, comment-policy, plan-first, gates
    env: FORGE_HOST, REPO, WORKTREE, BRANCH, ISSUE, ISSUE_TITLE, ISSUE_BODY, GATES, FJ_HOST, FJ_REPO
    ---

Slots {{NAME}} are filled from --set K=V pairs. Every slot must be filled or compose fails —
agents follow prompts literally, so leftover drafting noise costs a whole run.
"""
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent.parent


def parse_frontmatter(text):
    fm, body = {}, text
    if text.startswith("---"):
        head, _, body = text[3:].partition("---")
        for line in head.strip().splitlines():
            if ":" in line:
                k, _, v = line.partition(":")
                fm[k.strip()] = v.strip()
    return fm, body


def compose(role_path, skill_files, sets):
    text = Path(role_path).read_text()
    fm, role_body = parse_frontmatter(text)
    skill_names = [s.strip() for s in fm.get("skills", "").split(",") if s.strip()]
    parts = [role_body.strip()]
    for name in skill_names:
        p = HERE / "law" / f"{name}.md"
        if not p.exists():
            sys.exit(f"compose: skill not found: {name}")
        parts.append(f"\n\n---\n\n# SKILL: {name}\n\n" + p.read_text().strip())
    out = "\n".join(parts)
    for k, v in sets.items():
        out = out.replace("{{" + k + "}}", v)
    import re
    left = sorted(set(re.findall(r"\{\{([A-Z_0-9]+)\}\}", out)))
    if left:
        sys.exit(f"compose: unfilled slots: {', '.join(left)}")
    return out


if __name__ == "__main__":
    args = sys.argv[1:]
    role = args.pop(0)
    sets, extra_skills = {}, []
    while args:
        if args[0] == "--set":
            k, _, v = args[1].partition("=")
            sets[k] = v
            args = args[2:]
        else:
            extra_skills.append(args.pop(0))
    fm, _ = parse_frontmatter(Path(role).read_text())
    skills = [s.strip() for s in fm.get("skills", "").split(",") if s.strip()]
    skills += [s for s in extra_skills if s not in skills]  # CLI extras appended
    sys.stdout.write(compose(role, skills, sets))
