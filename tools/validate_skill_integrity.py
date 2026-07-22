#!/usr/bin/env python3
"""Minimal validator for ChatGPT Skill package integrity.

Checks:
- SKILL.md/skill.md entrypoints
- required frontmatter fields
- agents/openai.yaml metadata
- missing local references
- duplicate skill names
- probable trigger collisions

No bundled scripts are executed.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from dataclasses import asdict, dataclass
from difflib import SequenceMatcher
from pathlib import Path

ENTRYPOINTS = {"SKILL.md", "skill.md"}
IGNORE = {".git", "node_modules", "dist", "build", "__pycache__"}
NAME_RE = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
REF_RE = re.compile(r"(?<![\w./-])((?:references|scripts|assets)/[A-Za-z0-9_./-]+)")


@dataclass
class Finding:
    severity: str
    code: str
    skill: str
    path: str
    message: str


def parse_frontmatter(text: str) -> dict[str, str]:
    lines = text.splitlines()
    if not lines or lines[0].strip() != "---":
        return {}
    result: dict[str, str] = {}
    for line in lines[1:]:
        if line.strip() == "---":
            break
        if ":" in line and not line.startswith(" "):
            key, value = line.split(":", 1)
            if key.strip() in {"name", "description"}:
                result[key.strip()] = value.strip().strip("\"'")
    return result


def normalize(text: str | None) -> str:
    return re.sub(r"[^a-z0-9а-яё ]", " ", (text or "").lower()).strip()


def audit(root: Path) -> dict:
    findings: list[Finding] = []
    skills = []
    for path in root.rglob("*"):
        if not path.is_file() or path.name not in ENTRYPOINTS:
            continue
        if any(x in path.parts for x in IGNORE):
            continue
        text = path.read_text(encoding="utf-8", errors="replace")
        fm = parse_frontmatter(text)
        name = fm.get("name")
        desc = fm.get("description")
        label = name or path.parent.name
        if not name:
            findings.append(Finding("error", "NAME_MISSING", label, str(path), "missing name"))
        elif not NAME_RE.match(name):
            findings.append(Finding("error", "NAME_INVALID", label, str(path), "invalid name format"))
        if not desc:
            findings.append(Finding("error", "DESCRIPTION_MISSING", label, str(path), "missing description"))
        agent = path.parent / "agents" / "openai.yaml"
        if not agent.exists():
            findings.append(Finding("warning", "AGENT_METADATA_MISSING", label, str(agent), "missing agent metadata"))
        refs = sorted(set(REF_RE.findall(text)))
        for ref in refs:
            if not (path.parent / ref).exists():
                findings.append(Finding("error", "REF_MISSING", label, ref, "missing referenced resource"))
        skills.append({"name": name, "description": desc, "path": str(path)})

    seen: dict[str, int] = {}
    for item in skills:
        if item["name"]:
            seen[item["name"]] = seen.get(item["name"], 0) + 1
    for name, count in seen.items():
        if count > 1:
            findings.append(Finding("error", "DUPLICATE_NAME", name, "", f"count={count}"))

    for i, left in enumerate(skills):
        for right in skills[i + 1:]:
            score = SequenceMatcher(None, normalize(left["description"]), normalize(right["description"])).ratio()
            if score >= .92 and left["name"] != right["name"]:
                findings.append(Finding("warning", "TRIGGER_COLLISION", f"{left['name']}|{right['name']}", "", f"similarity={score:.2f}"))

    return {"skills": len(skills), "findings": [asdict(x) for x in findings]}


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("root")
    parser.add_argument("--json")
    args = parser.parse_args()
    result = audit(Path(args.root))
    if args.json:
        Path(args.json).write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 1 if any(x["severity"] == "error" for x in result["findings"]) else 0


if __name__ == "__main__":
    sys.exit(main())
