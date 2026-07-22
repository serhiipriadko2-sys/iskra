#!/usr/bin/env python3
"""Static integrity checks for ChatGPT Skill trees and Iskra registry files."""

from __future__ import annotations

import argparse
import json
import re
import sys
from dataclasses import asdict, dataclass
from difflib import SequenceMatcher
from pathlib import Path
from typing import Any

ENTRYPOINT_NAMES = {"SKILL.md", "skill.md"}
IGNORED_DIRS = {".git", ".venv", "venv", "node_modules", "__pycache__", "dist", "build"}
NAME_RE = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
RAW_LOCAL_REF_RE = re.compile(r"(?<![\w./-])((?:references|scripts|assets)/[A-Za-z0-9_./-]+)")
MARKDOWN_LINK_RE = re.compile(r"\[[^\]]*\]\(([^)]+)\)")
SKILL_URI_RE = re.compile(r"skills://([a-z0-9][a-z0-9-]*)")
ALLOWED_REGISTRY_STATUSES = {"ACTIVE", "ABSORB", "DEPRECATED", "CODEX_ONLY"}
MAX_ENTRYPOINT_BYTES = 2_000_000
MAX_AGENT_METADATA_BYTES = 512_000


@dataclass(frozen=True)
class Finding:
    severity: str
    code: str
    skill: str
    path: str
    message: str


@dataclass(frozen=True)
class SkillRecord:
    entrypoint: str
    directory: str
    name: str | None
    description: str | None
    referenced_skills: tuple[str, ...]
    local_references: tuple[str, ...]


def _is_ignored(path: Path) -> bool:
    return any(part in IGNORED_DIRS for part in path.parts)


def find_entrypoints(root: Path) -> list[Path]:
    return sorted(
        (
            path
            for path in root.rglob("*")
            if path.is_file()
            and path.name in ENTRYPOINT_NAMES
            and not _is_ignored(path.relative_to(root))
        ),
        key=lambda path: path.as_posix(),
    )


def _strip_yaml_scalar(value: str) -> str:
    value = value.strip()
    if len(value) >= 2 and value[0] == value[-1] and value[0] in {'"', "'"}:
        return value[1:-1]
    return value


def parse_frontmatter(text: str) -> tuple[dict[str, str], str]:
    lines = text.splitlines()
    if not lines or lines[0].strip() != "---":
        return {}, text
    end = next((index for index, line in enumerate(lines[1:], start=1) if line.strip() == "---"), None)
    if end is None:
        return {}, text
    data: dict[str, str] = {}
    current_key: str | None = None
    for line in lines[1:end]:
        if not line.strip() or line.lstrip().startswith("#"):
            continue
        if not line.startswith((" ", "\t")) and ":" in line:
            key, raw = line.split(":", 1)
            current_key = key.strip()
            if current_key in {"name", "description"}:
                data[current_key] = _strip_yaml_scalar(raw)
        elif current_key in {"name", "description"} and line.startswith((" ", "\t")):
            data[current_key] = (data.get(current_key, "") + " " + line.strip()).strip()
    return data, "\n".join(lines[end + 1 :])


def extract_local_references(body: str) -> list[str]:
    references = {reference.rstrip(".,;:!?") for reference in RAW_LOCAL_REF_RE.findall(body)}
    for target in MARKDOWN_LINK_RE.findall(body):
        target = target.strip().split("#", 1)[0]
        if target and not re.match(r"^[a-z]+://", target) and target.startswith(
            ("references/", "scripts/", "assets/", "../", "./")
        ):
            references.add(target)
    return sorted(references)


def normalize_description(value: str | None) -> str:
    if not value:
        return ""
    normalized = re.sub(r"[^a-z0-9\u0400-\u04ff -]+", " ", value.lower())
    return re.sub(r"\s+", " ", normalized).strip()


def description_similarity(left: str | None, right: str | None) -> float:
    left_normalized = normalize_description(left)
    right_normalized = normalize_description(right)
    if not left_normalized or not right_normalized:
        return 0.0
    return SequenceMatcher(a=left_normalized, b=right_normalized).ratio()


def _inside(candidate: Path, root: Path) -> bool:
    try:
        candidate.relative_to(root)
        return True
    except ValueError:
        return False


def _finalize_report(
    kind: str,
    source: str,
    strict: bool,
    records: list[SkillRecord],
    findings: list[Finding],
) -> dict[str, Any]:
    sorted_findings = sorted(findings, key=lambda item: (item.severity, item.code, item.skill, item.path))
    errors = sum(item.severity == "error" for item in sorted_findings)
    warnings = sum(item.severity == "warning" for item in sorted_findings)
    return {
        "schema_version": "iskra.skill-integrity-report.v1",
        "kind": kind,
        "source": source,
        "strict": strict,
        "summary": {
            "skills": len(records),
            "errors": errors,
            "warnings": warnings,
            "status": "FAIL" if errors or (strict and warnings) else "PASS",
        },
        "skills": [asdict(record) for record in records],
        "findings": [asdict(item) for item in sorted_findings],
    }


def audit_tree(root: Path, strict: bool = False) -> dict[str, Any]:
    root = root.resolve()
    findings: list[Finding] = []
    records: list[SkillRecord] = []
    entrypoints = find_entrypoints(root)
    if not entrypoints:
        findings.append(Finding("error", "NO_SKILLS", "<root>", str(root), "No SKILL.md or skill.md entrypoints found."))

    for entrypoint in entrypoints:
        if entrypoint.is_symlink():
            findings.append(Finding("error", "ENTRYPOINT_SYMLINK", entrypoint.parent.name, entrypoint.as_posix(), "Skill entrypoint must be a regular file inside the audited root."))
            continue
        try:
            if entrypoint.stat().st_size > MAX_ENTRYPOINT_BYTES:
                findings.append(Finding("error", "ENTRYPOINT_TOO_LARGE", entrypoint.parent.name, entrypoint.as_posix(), f"Skill entrypoint exceeds {MAX_ENTRYPOINT_BYTES} bytes."))
                continue
            text = entrypoint.read_text(encoding="utf-8", errors="replace")
        except OSError as exc:
            findings.append(Finding("error", "ENTRYPOINT_UNREADABLE", entrypoint.parent.name, entrypoint.as_posix(), str(exc)))
            continue
        frontmatter, body = parse_frontmatter(text)
        name = frontmatter.get("name") or None
        description = frontmatter.get("description") or None
        label = name or entrypoint.parent.name
        if not frontmatter:
            findings.append(Finding("error", "FRONTMATTER_MISSING", label, entrypoint.as_posix(), "YAML frontmatter is missing or unclosed."))
        if not name:
            findings.append(Finding("error", "NAME_MISSING", label, entrypoint.as_posix(), "Frontmatter field 'name' is required."))
        elif not NAME_RE.fullmatch(name):
            findings.append(Finding("error", "NAME_INVALID", label, entrypoint.as_posix(), "Skill name must be lowercase kebab-case."))
        if not description:
            findings.append(Finding("error", "DESCRIPTION_MISSING", label, entrypoint.as_posix(), "Frontmatter field 'description' is required."))
        elif len(description.strip()) < 40:
            findings.append(Finding("warning", "DESCRIPTION_THIN", label, entrypoint.as_posix(), "Description is too short to encode reliable trigger boundaries."))

        agent_file = entrypoint.parent / "agents" / "openai.yaml"
        if not agent_file.is_file():
            findings.append(Finding("warning", "AGENT_METADATA_MISSING", label, agent_file.as_posix(), "agents/openai.yaml is missing."))
        elif agent_file.is_symlink():
            findings.append(Finding("error", "AGENT_METADATA_SYMLINK", label, agent_file.as_posix(), "Agent metadata must be a regular file inside the skill directory."))
        elif agent_file.stat().st_size > MAX_AGENT_METADATA_BYTES:
            findings.append(Finding("error", "AGENT_METADATA_TOO_LARGE", label, agent_file.as_posix(), f"Agent metadata exceeds {MAX_AGENT_METADATA_BYTES} bytes."))
        else:
            agent_text = agent_file.read_text(encoding="utf-8", errors="replace")
            if "display_name:" not in agent_text:
                findings.append(Finding("warning", "DISPLAY_NAME_MISSING", label, agent_file.as_posix(), "interface.display_name is missing."))
            if "short_description:" not in agent_text:
                findings.append(Finding("warning", "SHORT_DESCRIPTION_MISSING", label, agent_file.as_posix(), "interface.short_description is missing."))

        local_references = extract_local_references(body)
        for reference in local_references:
            candidate = (entrypoint.parent / reference).resolve()
            if not _inside(candidate, root):
                findings.append(Finding("warning", "REF_OUTSIDE_ROOT", label, reference, "Reference resolves outside the audited root."))
            elif not candidate.exists():
                findings.append(Finding("error", "REF_MISSING", label, reference, "Referenced local resource does not exist."))

        records.append(
            SkillRecord(
                entrypoint=entrypoint.relative_to(root).as_posix(),
                directory=entrypoint.parent.relative_to(root).as_posix(),
                name=name,
                description=description,
                referenced_skills=tuple(sorted(set(SKILL_URI_RE.findall(body)))),
                local_references=tuple(local_references),
            )
        )

    by_name: dict[str, list[SkillRecord]] = {}
    for record in records:
        if record.name:
            by_name.setdefault(record.name, []).append(record)
    for name, group in sorted(by_name.items()):
        if len(group) > 1:
            findings.append(Finding("error", "DUPLICATE_NAME", name, ", ".join(item.entrypoint for item in group), "Multiple entrypoints declare the same skill name."))

    for index, left in enumerate(records):
        for right in records[index + 1 :]:
            score = description_similarity(left.description, right.description)
            if score >= 0.92 and left.name != right.name:
                findings.append(
                    Finding(
                        "warning",
                        "TRIGGER_COLLISION",
                        f"{left.name or left.directory} | {right.name or right.directory}",
                        f"{left.entrypoint} <> {right.entrypoint}",
                        f"Descriptions are {score:.1%} similar and may compete for implicit invocation.",
                    )
                )
    return _finalize_report("filesystem", str(root), strict, records, findings)


def _registry_finding(code: str, skill: str, path: str, message: str, severity: str = "error") -> Finding:
    return Finding(severity, code, skill, path, message)


def audit_registry(path: Path, strict: bool = False) -> dict[str, Any]:
    findings: list[Finding] = []
    try:
        registry = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        findings.append(_registry_finding("REGISTRY_UNREADABLE", "<registry>", str(path), str(exc)))
        return _finalize_report("registry", str(path), strict, [], findings)

    if registry.get("schema_version") != "iskra.skill-registry.v1":
        findings.append(_registry_finding("REGISTRY_SCHEMA_INVALID", "<registry>", str(path), "schema_version must equal iskra.skill-registry.v1."))

    entries = registry.get("skills")
    if not isinstance(entries, list):
        findings.append(_registry_finding("REGISTRY_SKILLS_INVALID", "<registry>", str(path), "skills must be an array."))
        entries = []

    targets_raw = registry.get("targets", [])
    if not isinstance(targets_raw, list):
        findings.append(_registry_finding("REGISTRY_TARGETS_INVALID", "<registry>", str(path), "targets must be an array."))
        targets_raw = []

    target_names: set[str] = set()
    for index, target in enumerate(targets_raw):
        target_path = f"targets[{index}]"
        if not isinstance(target, dict):
            findings.append(_registry_finding("TARGET_INVALID", "<target>", target_path, "target must be an object."))
            continue
        name = target.get("skill")
        if not isinstance(name, str) or not NAME_RE.fullmatch(name):
            findings.append(_registry_finding("TARGET_NAME_INVALID", str(name), target_path, "target skill must be lowercase kebab-case."))
            continue
        if name in target_names:
            findings.append(_registry_finding("TARGET_DUPLICATE", name, target_path, "target skill is duplicated."))
        target_names.add(name)
        if target.get("status") != "PLANNED":
            findings.append(_registry_finding("TARGET_STATUS_INVALID", name, target_path, "target status must equal PLANNED."))
        if not target.get("acceptance_gate"):
            findings.append(_registry_finding("TARGET_GATE_MISSING", name, target_path, "planned target requires acceptance_gate."))

    names: set[str] = set()
    statuses = {status: 0 for status in ALLOWED_REGISTRY_STATUSES}
    replacements: dict[str, str] = {}
    entry_by_name: dict[str, dict[str, Any]] = {}

    for index, entry in enumerate(entries):
        entry_path = f"skills[{index}]"
        if not isinstance(entry, dict):
            findings.append(_registry_finding("ENTRY_INVALID", "<entry>", entry_path, "skill entry must be an object."))
            continue
        name = entry.get("skill")
        label = str(name)
        if not isinstance(name, str) or not NAME_RE.fullmatch(name):
            findings.append(_registry_finding("ENTRY_NAME_INVALID", label, entry_path, "skill must be lowercase kebab-case."))
            continue
        if name in names:
            findings.append(_registry_finding("ENTRY_DUPLICATE", name, entry_path, "skill appears more than once."))
        names.add(name)
        entry_by_name[name] = entry

        status = entry.get("status")
        if status not in ALLOWED_REGISTRY_STATUSES:
            findings.append(_registry_finding("ENTRY_STATUS_INVALID", name, entry_path, f"status must be one of {sorted(ALLOWED_REGISTRY_STATUSES)}."))
        else:
            statuses[status] += 1
        if not entry.get("owner"):
            findings.append(_registry_finding("ENTRY_OWNER_MISSING", name, entry_path, "owner is required."))
        if not entry.get("trigger_scope"):
            findings.append(_registry_finding("ENTRY_SCOPE_MISSING", name, entry_path, "trigger_scope is required."))
        if not isinstance(entry.get("dependencies"), list):
            findings.append(_registry_finding("ENTRY_DEPENDENCIES_INVALID", name, entry_path, "dependencies must be an array."))
        if not isinstance(entry.get("evidence"), list) or not entry.get("evidence"):
            findings.append(_registry_finding("ENTRY_EVIDENCE_MISSING", name, entry_path, "evidence must be a non-empty array."))

        replacement = entry.get("replacement")
        if status == "ABSORB":
            if not isinstance(replacement, str) or not NAME_RE.fullmatch(replacement):
                findings.append(_registry_finding("ABSORB_REPLACEMENT_MISSING", name, entry_path, "ABSORB requires a valid replacement."))
            else:
                replacements[name] = replacement
        elif replacement is not None:
            findings.append(_registry_finding("REPLACEMENT_FORBIDDEN", name, entry_path, "Only ABSORB entries may define replacement."))

        if status == "CODEX_ONLY" and entry.get("source_surface") != "plugin":
            findings.append(_registry_finding("CODEX_SURFACE_INVALID", name, entry_path, "CODEX_ONLY entries must use source_surface=plugin."))

    overlap = names & target_names
    for name in sorted(overlap):
        findings.append(_registry_finding("TARGET_CONFLICT", name, name, "planned target already exists in the current inventory."))

    allowed_replacement_names = names | target_names
    for source, replacement in replacements.items():
        if replacement not in allowed_replacement_names:
            findings.append(_registry_finding("REPLACEMENT_UNKNOWN", source, source, f"replacement '{replacement}' is neither a registry skill nor a planned target."))
        elif replacement in names and entry_by_name[replacement].get("status") not in {"ACTIVE", "CODEX_ONLY"}:
            findings.append(_registry_finding("REPLACEMENT_NOT_OPERATIONAL", source, source, f"replacement '{replacement}' must be ACTIVE, CODEX_ONLY, or PLANNED."))

    for source in replacements:
        visited: set[str] = set()
        current = source
        while current in replacements:
            if current in visited:
                findings.append(_registry_finding("REPLACEMENT_CYCLE", source, source, "replacement chain contains a cycle."))
                break
            visited.add(current)
            current = replacements[current]

    summary = registry.get("summary")
    if not isinstance(summary, dict):
        findings.append(_registry_finding("SUMMARY_INVALID", "<registry>", str(path), "summary must be an object."))
    else:
        expected = {
            "inventory_total": len(entries),
            "active": statuses["ACTIVE"],
            "absorb": statuses["ABSORB"],
            "deprecated": statuses["DEPRECATED"],
            "codex_only": statuses["CODEX_ONLY"],
            "planned_targets": len(target_names),
            "target_operational_stack": statuses["ACTIVE"] + statuses["CODEX_ONLY"],
        }
        for key, value in expected.items():
            if summary.get(key) != value:
                findings.append(_registry_finding("SUMMARY_MISMATCH", "<registry>", f"summary.{key}", f"expected {value}, found {summary.get(key)!r}."))

    records = [
        SkillRecord(
            entrypoint=str(path),
            directory="registry",
            name=entry.get("skill") if isinstance(entry, dict) else None,
            description=entry.get("trigger_scope") if isinstance(entry, dict) else None,
            referenced_skills=(),
            local_references=(),
        )
        for entry in entries
    ]
    return _finalize_report("registry", str(path), strict, records, findings)


def combine_reports(reports: list[dict[str, Any]], strict: bool) -> dict[str, Any]:
    errors = sum(report["summary"]["errors"] for report in reports)
    warnings = sum(report["summary"]["warnings"] for report in reports)
    return {
        "schema_version": "iskra.skill-integrity-report.v1",
        "kind": "combined",
        "strict": strict,
        "summary": {
            "reports": len(reports),
            "skills": sum(report["summary"]["skills"] for report in reports),
            "errors": errors,
            "warnings": warnings,
            "status": "FAIL" if errors or (strict and warnings) else "PASS",
        },
        "reports": reports,
    }


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Audit Skill package and registry integrity without executing bundled code.")
    parser.add_argument("source", type=Path)
    mode = parser.add_mutually_exclusive_group()
    mode.add_argument("--registry-only", action="store_true")
    mode.add_argument("--tree-only", action="store_true")
    parser.add_argument("--strict", action="store_true")
    parser.add_argument("--json-out", type=Path)
    args = parser.parse_args(argv)

    if not args.source.exists():
        print(f"error: source not found: {args.source}", file=sys.stderr)
        return 2

    if args.registry_only or (args.source.is_file() and not args.tree_only):
        report = audit_registry(args.source, strict=args.strict)
    else:
        report = audit_tree(args.source, strict=args.strict)

    if args.json_out:
        args.json_out.parent.mkdir(parents=True, exist_ok=True)
        args.json_out.write_text(json.dumps(report, ensure_ascii=False, indent=2, sort_keys=True) + "\n", encoding="utf-8")

    summary = report["summary"]
    print(f"skills={summary['skills']} errors={summary['errors']} warnings={summary['warnings']} status={summary['status']}")
    for finding in report["findings"]:
        print(f"{finding['severity'].upper()} {finding['code']} {finding['skill']}: {finding['message']} [{finding['path']}]")
    return 1 if summary["status"] == "FAIL" else 0


if __name__ == "__main__":
    raise SystemExit(main())
