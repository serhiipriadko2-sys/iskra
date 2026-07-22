#!/usr/bin/env python3
"""Fail-closed validation for the iskra-canon-runtime skill package."""

from __future__ import annotations

import argparse
import json
import re
import sys
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Any

CANONICAL_KERNEL = (
    "SECURITY → STOP → INVESTIGATE → FIND → TRACE → MYTHIC_INQUIRY → "
    "STATECYCLE_OBSERVE → METRICS_ENGINE → EWS → SHADOW_CHECK → "
    "DREAMSPACE_CHECK → SLO_GUARD → PLAYBOOK → COUNCIL → VOICE → "
    "MYTHIC_EXPRESSION → OUTPUT → VERIFY → RECEIPT → STATECYCLE_COMMIT → ΔDΩΛ"
)
CANONICAL_GUARD_DECISIONS = [
    "PROCEED",
    "FORCE_ISKRIV_1",
    "FORCE_SHADOW",
    "FORCE_CRISIS",
    "CLOSE_HONESTLY",
]
LOCAL_REFERENCE_RE = re.compile(
    r"(?<![\w./-])((?:references|scripts|assets|agents)/[A-Za-z0-9_.\-/]+)"
)
FRONTMATTER_NAME_RE = re.compile(r"^name:\s*([a-z0-9]+(?:-[a-z0-9]+)*)\s*$", re.MULTILINE)
MAX_TEXT_BYTES = 256 * 1024


@dataclass(frozen=True)
class Finding:
    severity: str
    code: str
    path: str
    message: str


def _inside(candidate: Path, root: Path) -> bool:
    try:
        candidate.relative_to(root)
        return True
    except ValueError:
        return False


def _read_text(path: Path, findings: list[Finding], code_prefix: str) -> str:
    try:
        if path.is_symlink():
            findings.append(Finding("error", f"{code_prefix}_SYMLINK", str(path), "Symlinked control files are forbidden."))
            return ""
        size = path.stat().st_size
        if size > MAX_TEXT_BYTES:
            findings.append(Finding("error", f"{code_prefix}_TOO_LARGE", str(path), f"File exceeds {MAX_TEXT_BYTES} bytes."))
            return ""
        return path.read_text(encoding="utf-8")
    except OSError as exc:
        findings.append(Finding("error", f"{code_prefix}_UNREADABLE", str(path), str(exc)))
        return ""


def _resolve_regular_file(root: Path, relative: str, findings: list[Finding], code_prefix: str) -> Path | None:
    if not relative or Path(relative).is_absolute():
        findings.append(Finding("error", f"{code_prefix}_PATH_INVALID", relative, "Path must be non-empty and relative."))
        return None
    candidate = (root / relative).resolve()
    if not _inside(candidate, root):
        findings.append(Finding("error", f"{code_prefix}_OUTSIDE_ROOT", relative, "Path resolves outside the allowed root."))
        return None
    lexical = root / relative
    if lexical.is_symlink():
        findings.append(Finding("error", f"{code_prefix}_SYMLINK", relative, "Symlinked resources are forbidden."))
        return None
    if not candidate.is_file():
        findings.append(Finding("error", f"{code_prefix}_MISSING", relative, "Required regular file does not exist."))
        return None
    return candidate


def _load_json(path: Path, findings: list[Finding], code_prefix: str) -> dict[str, Any]:
    text = _read_text(path, findings, code_prefix)
    if not text:
        return {}
    try:
        value = json.loads(text)
    except json.JSONDecodeError as exc:
        findings.append(Finding("error", f"{code_prefix}_JSON_INVALID", str(path), str(exc)))
        return {}
    if not isinstance(value, dict):
        findings.append(Finding("error", f"{code_prefix}_TYPE_INVALID", str(path), "Top-level JSON value must be an object."))
        return {}
    return value


def _registry_entries(registry: dict[str, Any], findings: list[Finding], path: Path) -> dict[str, dict[str, Any]]:
    entries = registry.get("skills")
    if not isinstance(entries, list):
        findings.append(Finding("error", "REGISTRY_SKILLS_INVALID", str(path), "Registry skills must be an array."))
        return {}
    result: dict[str, dict[str, Any]] = {}
    for index, entry in enumerate(entries):
        if not isinstance(entry, dict) or not isinstance(entry.get("skill"), str):
            findings.append(Finding("error", "REGISTRY_ENTRY_INVALID", f"skills[{index}]", "Registry entry must contain a string skill name."))
            continue
        name = entry["skill"]
        if name in result:
            findings.append(Finding("error", "REGISTRY_ENTRY_DUPLICATE", name, "Registry skill appears more than once."))
            continue
        result[name] = entry
    return result


def validate(skill_dir: Path, skill_root: Path, registry_path: Path) -> dict[str, Any]:
    skill_dir = skill_dir.resolve()
    skill_root = skill_root.resolve()
    registry_path = registry_path.resolve()
    findings: list[Finding] = []

    if skill_dir.name != "iskra-canon-runtime":
        findings.append(Finding("error", "SKILL_DIR_INVALID", str(skill_dir), "Expected the iskra-canon-runtime directory."))
    if not skill_dir.is_dir():
        findings.append(Finding("error", "SKILL_DIR_MISSING", str(skill_dir), "Skill directory does not exist."))

    skill_md = skill_dir / "SKILL.md"
    skill_text = _read_text(skill_md, findings, "SKILL_MD")
    manifest_path = skill_dir / "references" / "runtime-dependencies.json"
    manifest = _load_json(manifest_path, findings, "DEPENDENCY_MANIFEST")
    registry = _load_json(registry_path, findings, "REGISTRY")
    if registry and registry.get("schema_version") != "iskra.skill-registry.v1":
        findings.append(Finding("error", "REGISTRY_SCHEMA_INVALID", str(registry_path), "Unexpected registry schema_version."))
    registry_by_name = _registry_entries(registry, findings, registry_path) if registry else {}

    if manifest.get("schema_version") != "iskra.runtime-dependencies.v1":
        findings.append(Finding("error", "DEPENDENCY_SCHEMA_INVALID", str(manifest_path), "Unexpected dependency manifest schema_version."))
    if manifest.get("kernel_order") != CANONICAL_KERNEL:
        findings.append(Finding("error", "KERNEL_MANIFEST_DRIFT", str(manifest_path), "Kernel Order does not match SoT30 v5.5.6."))
    if CANONICAL_KERNEL not in skill_text:
        findings.append(Finding("error", "KERNEL_SKILL_DRIFT", str(skill_md), "SKILL.md does not contain the exact canonical Kernel Order."))

    guard_decisions = manifest.get("guard_decisions")
    if guard_decisions != CANONICAL_GUARD_DECISIONS:
        findings.append(Finding("error", "GUARD_ENUM_DRIFT", str(manifest_path), "Guard decisions do not match the canonical ordered list."))
    if manifest.get("max_guard_evaluations") != 3:
        findings.append(Finding("error", "GUARD_CAP_DRIFT", str(manifest_path), "Maximum Guard evaluations must equal 3."))
    recompute = manifest.get("recompute_requires")
    if recompute != {"material_signal": True, "strict_alert_increase": True}:
        findings.append(Finding("error", "RECOMPUTE_CONTRACT_DRIFT", str(manifest_path), "Recompute must require material signal and strict alert increase."))

    required_resources = manifest.get("required_resources")
    if not isinstance(required_resources, list) or not required_resources:
        findings.append(Finding("error", "REQUIRED_RESOURCES_INVALID", str(manifest_path), "required_resources must be a non-empty array."))
        required_resources = []
    if len(required_resources) != len(set(required_resources)):
        findings.append(Finding("error", "REQUIRED_RESOURCES_DUPLICATE", str(manifest_path), "required_resources contains duplicates."))
    for relative in required_resources:
        if not isinstance(relative, str):
            findings.append(Finding("error", "RESOURCE_PATH_INVALID", str(relative), "Resource path must be a string."))
            continue
        _resolve_regular_file(skill_dir, relative, findings, "RESOURCE")

    referenced_resources = sorted(set(LOCAL_REFERENCE_RE.findall(skill_text)))
    for relative in referenced_resources:
        _resolve_regular_file(skill_dir, relative.rstrip(".,;:!?"), findings, "SKILL_REFERENCE")

    dispatch_skills = manifest.get("dispatch_skills")
    if not isinstance(dispatch_skills, list) or not dispatch_skills:
        findings.append(Finding("error", "DISPATCH_SKILLS_INVALID", str(manifest_path), "dispatch_skills must be a non-empty array."))
        dispatch_skills = []
    if len(dispatch_skills) != len(set(dispatch_skills)):
        findings.append(Finding("error", "DISPATCH_SKILLS_DUPLICATE", str(manifest_path), "dispatch_skills contains duplicates."))

    for name in dispatch_skills:
        if not isinstance(name, str):
            findings.append(Finding("error", "DISPATCH_NAME_INVALID", str(name), "Dispatch skill name must be a string."))
            continue
        target_dir = (skill_root / name).resolve()
        if not _inside(target_dir, skill_root):
            findings.append(Finding("error", "DISPATCH_OUTSIDE_ROOT", name, "Dispatch skill resolves outside the source root."))
            continue
        target_skill_md = _resolve_regular_file(target_dir, "SKILL.md", findings, "DISPATCH")
        if target_skill_md:
            target_text = _read_text(target_skill_md, findings, "DISPATCH_SKILL_MD")
            match = FRONTMATTER_NAME_RE.search(target_text)
            if not match or match.group(1) != name:
                findings.append(Finding("error", "DISPATCH_NAME_MISMATCH", str(target_skill_md), f"Expected frontmatter name '{name}'."))
        registry_entry = registry_by_name.get(name)
        if registry_entry is None:
            findings.append(Finding("error", "DISPATCH_REGISTRY_MISSING", name, "Dispatch owner is absent from registry-v1."))
        elif registry_entry.get("status") != "ACTIVE":
            findings.append(Finding("error", "DISPATCH_NOT_ACTIVE", name, f"Dispatch owner must be ACTIVE, found {registry_entry.get('status')!r}."))

    errors = sum(item.severity == "error" for item in findings)
    warnings = sum(item.severity == "warning" for item in findings)
    return {
        "schema_version": "iskra.runtime-authority-report.v1",
        "status": "FAIL" if errors else "PASS",
        "skill": "iskra-canon-runtime",
        "summary": {
            "errors": errors,
            "warnings": warnings,
            "required_resources": len(required_resources),
            "dispatch_skills": len(dispatch_skills),
        },
        "findings": [asdict(item) for item in sorted(findings, key=lambda item: (item.severity, item.code, item.path))],
    }


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--skill-dir", type=Path, required=True)
    parser.add_argument("--skill-root", type=Path, required=True)
    parser.add_argument("--registry", type=Path, required=True)
    parser.add_argument("--json-out", type=Path)
    return parser


def main() -> int:
    args = build_parser().parse_args()
    report = validate(args.skill_dir, args.skill_root, args.registry)
    if args.json_out:
        args.json_out.parent.mkdir(parents=True, exist_ok=True)
        args.json_out.write_text(json.dumps(report, ensure_ascii=False, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    summary = report["summary"]
    print(
        f"runtime_authority status={report['status']} errors={summary['errors']} "
        f"warnings={summary['warnings']} resources={summary['required_resources']} "
        f"dispatch={summary['dispatch_skills']}"
    )
    for finding in report["findings"]:
        print(f"{finding['severity'].upper()} {finding['code']} {finding['path']}: {finding['message']}")
    return 0 if report["status"] == "PASS" else 1


if __name__ == "__main__":
    sys.exit(main())
