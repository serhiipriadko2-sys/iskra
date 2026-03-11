#!/usr/bin/env python3
"""Implementation-first status checker for Scientific Turn and XCode.

This script avoids narrative-only snapshots and derives status from repository facts.
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
    return (REPO_ROOT / rel_path).read_text(encoding="utf-8")


def _find(rel_path: str, pattern: str) -> bool:
    return re.search(pattern, _read(rel_path), flags=re.MULTILINE) is not None


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

    # If integration exists but tracker still open -> partial.
    integration_present = scientific_checks[2].found and scientific_checks[3].found
    tracker_open = scientific_checks[0].found and scientific_checks[1].found
    scientific_status = "partial" if integration_present and tracker_open else "unknown"

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
            pattern=r"export function validateExplainable",
            found=_find(
                "runtime/src/xcode/validateExplainable.ts",
                r"export function validateExplainable",
            ),
        ),
    ]

    runtime_contract_present = all(c.found for c in xcode_checks[1:])
    governance_open = xcode_checks[0].found
    xcode_status = "partial" if runtime_contract_present and governance_open else "unknown"

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
