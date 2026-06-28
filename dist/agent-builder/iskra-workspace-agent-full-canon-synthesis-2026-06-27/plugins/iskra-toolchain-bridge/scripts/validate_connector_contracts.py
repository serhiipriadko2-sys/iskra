#!/usr/bin/env python3
"""Validate Iskra toolchain connector contracts."""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path


REQUIRED_CONTRACTS = [
    "agent-builder.md",
    "artifact-manager.md",
    "browser-automation.md",
    "github.md",
    "monitoring.md",
    "schedule-runner.md",
    "secrets-vault.md",
    "supabase.md",
]

REQUIRED_SECTIONS = [
    "## Purpose",
    "## Scope",
    "## Operations",
    "## Secret Handling",
    "## Verification",
    "## Rollback",
    "## Delta",
]

TOKEN_PATTERNS = [
    re.compile(r"sk-[A-Za-z0-9_-]{20,}"),
    re.compile(r"ghp_[A-Za-z0-9_]{20,}"),
    re.compile(r"github_pat_[A-Za-z0-9_]{20,}"),
    re.compile(r"service_role\s*[:=]\s*['\"][A-Za-z0-9._-]{20,}", re.I),
    re.compile(r"OPENAI_API_KEY\s*=\s*['\"][^'\"]+['\"]", re.I),
]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--plugin-root",
        default=str(Path(__file__).resolve().parents[1]),
        help="Path to iskra-toolchain-bridge plugin root.",
    )
    return parser.parse_args()


def load_json(path: Path, errors: list[str]) -> dict:
    try:
        value = json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError:
        errors.append(f"missing {path}")
        return {}
    except json.JSONDecodeError as exc:
        errors.append(f"invalid json {path}: {exc}")
        return {}
    if not isinstance(value, dict):
        errors.append(f"{path} must be a JSON object")
        return {}
    return value


def validate_plugin_manifest(plugin_root: Path, errors: list[str]) -> None:
    manifest = load_json(plugin_root / ".codex-plugin" / "plugin.json", errors)
    if not manifest:
        return
    if manifest.get("name") != "iskra-toolchain-bridge":
        errors.append("plugin name must be iskra-toolchain-bridge")
    skills = manifest.get("skills")
    if skills != "skills":
        errors.append("plugin manifest field skills must resolve to skills")
    skill_path = plugin_root / "skills" / "iskra-toolchain-bridge" / "SKILL.md"
    if not skill_path.is_file():
        errors.append("missing skill SKILL.md")


def validate_contract(path: Path, errors: list[str]) -> None:
    if not path.is_file():
        errors.append(f"missing contract {path.name}")
        return
    text = path.read_text(encoding="utf-8")
    for section in REQUIRED_SECTIONS:
        if section not in text:
            errors.append(f"{path.name} missing section {section}")
    if "| Operation | Read/Write | Approval required | Evidence returned |" not in text:
        errors.append(f"{path.name} missing operation table header")
    for pattern in TOKEN_PATTERNS:
        if pattern.search(text):
            errors.append(f"{path.name} appears to contain a secret-like value")


def main() -> int:
    args = parse_args()
    plugin_root = Path(args.plugin_root).resolve()
    errors: list[str] = []

    validate_plugin_manifest(plugin_root, errors)

    contracts_dir = plugin_root / "contracts"
    if not contracts_dir.is_dir():
        errors.append("missing contracts directory")
    else:
        found = sorted(path.name for path in contracts_dir.glob("*.md"))
        for required in REQUIRED_CONTRACTS:
            validate_contract(contracts_dir / required, errors)
        extras = sorted(set(found) - set(REQUIRED_CONTRACTS))
        if extras:
            errors.append(f"unexpected contract files: {', '.join(extras)}")

    if errors:
        print("connector_contracts=FAIL")
        for error in errors:
            print(f"- {error}")
        return 1

    print("connector_contracts=PASS")
    print(f"contracts={len(REQUIRED_CONTRACTS)}")
    print(f"plugin_root={plugin_root}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
