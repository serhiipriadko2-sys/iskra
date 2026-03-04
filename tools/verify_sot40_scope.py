#!/usr/bin/env python3
"""Validate declarative SoT40 scope manifest completeness/consistency."""

from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MANIFEST_PATH = ROOT / "tools" / "sot40_scope_manifest.json"


def main() -> None:
    manifest = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))

    output_targets: list[str] = []
    errors: list[str] = []

    canonical_dir = ROOT / manifest["canonFullSourceDir"]
    for name in manifest["canonFullFiles"]:
        if not (canonical_dir / name).exists():
            errors.append(f"missing canon source: {canonical_dir / name}")
        output_targets.append(f"CANON_FULL/{name}")

    for map_name in ["coreMap", "systemMap", "governanceMap", "mindMap"]:
        mapping = manifest.get(map_name, {})
        for source, target in mapping.items():
            if not (ROOT / source).exists():
                errors.append(f"missing source in {map_name}: {source}")
            output_targets.append(target)

    for template_name in manifest.get("projectTemplates", []):
        template_path = ROOT / "tools" / "projects_stack_templates" / template_name
        if not template_path.exists():
            errors.append(f"missing template: {template_path}")
        output_targets.append(f"PROJECTS/{template_name}")

    duplicates = sorted({item for item in output_targets if output_targets.count(item) > 1})
    if duplicates:
        errors.append(f"duplicate output targets: {', '.join(duplicates)}")

    if errors:
        print("SoT40 scope manifest validation failed:")
        for error in errors:
            print(f" - {error}")
        sys.exit(1)

    print("OK: SoT40 scope manifest is complete and consistent")


if __name__ == "__main__":
    main()
