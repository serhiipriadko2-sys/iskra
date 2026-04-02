#!/usr/bin/env python3
"""Implementation-first status checker for Scientific Turn and XCode.

Computes status from repository facts (SoT docs + implementation markers),
not from narrative interpretation.
"""

from __future__ import annotations

import argparse
import json
import re
from dataclasses import dataclass, asdict
from pathlib import Path
from typing import List

REPO_ROOT = Path(__file__).resolve().parents[1]


@dataclass
class CheckItem:
    area: str
    key: str
    file: str
    pattern: str
    found: bool


@dataclass
class AreaResult:
    name: str
    status: str
    checks: List[CheckItem]


def _read(rel_path: str) -> str:
    path = REPO_ROOT / rel_path
    if not path.exists():
        return ""
    return path.read_text(encoding="utf-8")


def _find(rel_path: str, pattern: str) -> bool:
    return re.search(pattern, _read(rel_path), flags=re.MULTILINE) is not None


def _has_conflict_markers(rel_path: str) -> bool:
    content = _read(rel_path)
    return re.search(r'^(<<<<<<<|=======|>>>>>>>)', content, flags=re.MULTILINE) is not None


def _status_scientific(integration_present: bool, tracker_open: bool) -> str:
    if integration_present and tracker_open:
        return "partial"
    if integration_present and not tracker_open:
        return "verified"
    if not integration_present and tracker_open:
        return "false"
    return "unknown"


def _status_xcode(runtime_contract_present: bool, governance_open: bool) -> str:
    if runtime_contract_present and governance_open:
        return "partial"
    if runtime_contract_present and not governance_open:
        return "verified"
    if not runtime_contract_present and governance_open:
        return "false"
    return "unknown"


def run_checks() -> List[AreaResult]:
    scientific_checks = [
        CheckItem(
            area="scientific_turn",
            key="phase2_active_marker",
            file="AGENTS.md",
            pattern=r"\|\s*2\s*\|\s*Quantum Engine\s*\|\s*ACTIVE\s*\|",
            found=_find("AGENTS.md", r"\|\s*2\s*\|\s*Quantum Engine\s*\|\s*ACTIVE\s*\|"),
        ),
        CheckItem(
            area="scientific_turn",
            key="scientific_doc_has_no_conflicts",
            file="docs/SCIENTIFIC_TURN_XCODE_STATUS_2026-03-11.md",
            pattern="no git conflict markers",
            found=not _has_conflict_markers("docs/SCIENTIFIC_TURN_XCODE_STATUS_2026-03-11.md"),
        ),
        CheckItem(
            area="scientific_turn",
            key="task_2_4_unchecked_marker",
            file="AGENTS.md",
            pattern=r"- \[ \]\s*\*\*Task 2\.4:\*\*",
            found=_find("AGENTS.md", r"- \[ \]\s*\*\*Task 2\.4:\*\*"),
        ),
        CheckItem(
            area="scientific_turn",
            key="web_instantiates_core_engine",
            file="apps/iskra-web/src/engineInstance.ts",
            pattern=r"new CoreEngine\(memoryService, metricsEngine, voiceSystem\)",
            found=_find(
                "apps/iskra-web/src/engineInstance.ts",
                r"new CoreEngine\(memoryService, metricsEngine, voiceSystem\)",
            ),
        ),
        CheckItem(
            area="scientific_turn",
            key="web_calls_engine_process_input",
            file="apps/iskra-web/src/hooks/useEngine.ts",
            pattern=r"await engine\.processInput\(text\)",
            found=_find(
                "apps/iskra-web/src/hooks/useEngine.ts",
                r"await engine\.processInput\(text\)",
            ),
        ),
    ]

    scientific_by_key = {c.key: c for c in scientific_checks}
    integration_present = (
        scientific_by_key["web_instantiates_core_engine"].found
        and scientific_by_key["web_calls_engine_process_input"].found
    )
    tracker_open = (
        scientific_by_key["phase2_active_marker"].found
        and scientific_by_key["task_2_4_unchecked_marker"].found
    )
    scientific_status = _status_scientific(integration_present, tracker_open)

    xcode_checks = [
        CheckItem(
            area="xcode",
            key="adr_proposed",
            file="governance/adr_20260220_xcode_explainable_code.md",
            pattern=r"^status:\s*proposed\s*$",
            found=_find(
                "governance/adr_20260220_xcode_explainable_code.md",
                r"^status:\s*proposed\s*$",
            ),
        ),
        CheckItem(
            area="xcode",
            key="xcode_tool_has_no_conflicts",
            file="tools/check_scientific_turn_xcode_impl.py",
            pattern="no git conflict markers",
            found=not _has_conflict_markers("tools/check_scientific_turn_xcode_impl.py"),
        ),
        CheckItem(
            area="xcode",
            key="xcode_spec_registry_reference",
            file="system/xcode_explainable_code.md",
            pattern=r"runtime/src/xcode/registry\.ts",
            found=_find("system/xcode_explainable_code.md", r"runtime/src/xcode/registry\.ts"),
        ),
        CheckItem(
            area="xcode",
            key="xcode_registry_contract",
            file="system/xcode_registry.md",
            pattern=r"how\.length > 0",
            found=_find("system/xcode_registry.md", r"how\.length > 0"),
        ),
        CheckItem(
            area="xcode",
            key="xcode_runtime_registry_exists",
            file="runtime/src/xcode/registry.ts",
            pattern=r"XCODE_REQUIRED",
            found=_find("runtime/src/xcode/registry.ts", r"XCODE_REQUIRED"),
        ),
        CheckItem(
            area="xcode",
            key="engine_explainable_metrics_exists",
            file="packages/engine/src/services/metricsService.ts",
            pattern=r"public updateExplainable\(",
            found=_find("packages/engine/src/services/metricsService.ts", r"public updateExplainable\("),
        ),
        CheckItem(
            area="xcode",
            key="engine_explainable_validator_exists",
            file="packages/engine/src/services/explainableValidator.ts",
            pattern=r"export function validateExplainable",
            found=_find("packages/engine/src/services/explainableValidator.ts", r"export function validateExplainable"),
        ),
        CheckItem(
            area="xcode",
            key="xcode_runtime_validator_exists",
            file="runtime/src/xcode/validateExplainable.ts",
            pattern=r"export\s+(?:function\s+validateExplainable|\{\s*validateExplainable\s*\})",
            found=_find(
                "runtime/src/xcode/validateExplainable.ts",
                r"export\s+(?:function\s+validateExplainable|\{\s*validateExplainable\s*\})",
            ),
        ),
    ]

    xcode_by_key = {c.key: c for c in xcode_checks}
    governance_open = xcode_by_key["adr_proposed"].found
    runtime_contract_present = all(
        c.found for c in xcode_checks if c.key != "adr_proposed"
    )
    xcode_status = _status_xcode(runtime_contract_present, governance_open)

    return [
        AreaResult(name="scientific_turn", status=scientific_status, checks=scientific_checks),
        AreaResult(name="xcode", status=xcode_status, checks=xcode_checks),
    ]


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--json", action="store_true", help="Output JSON")
    parser.add_argument(
        "--strict",
        action="store_true",
        help="Exit non-zero unless all areas are 'verified'",
    )
    args = parser.parse_args()

    results = run_checks()

    if args.json:
        print(json.dumps([asdict(r) for r in results], ensure_ascii=False, indent=2))
    else:
        print("status legend: verified | partial | unknown | false")
        for result in results:
            print(f"[{result.name}] status={result.status}")
            for check in result.checks:
                mark = "PASS" if check.found else "FAIL"
                print(f"  - {mark} {check.key} ({check.file})")

    if args.strict:
        return 0 if all(r.status == "verified" for r in results) else 2
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
