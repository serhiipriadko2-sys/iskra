#!/usr/bin/env python3
"""Fail if package code imports other packages via deep ../..../src paths."""

from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
TARGETS = [ROOT / "packages", ROOT / "apps"]
ALLOWED_SEGMENTS = {"./src", "../src"}
PATTERN = re.compile(r"from\s+['\"](?P<path>[^'\"]+)['\"]")

violations: list[tuple[Path, int, str]] = []
for base in TARGETS:
    if not base.exists():
        continue
    for file_path in base.rglob("*.ts"):
        if file_path.suffix not in {".ts", ".tsx", ".mts", ".cts"}:
            continue
        content = file_path.read_text(encoding="utf-8")
        for line_number, line in enumerate(content.splitlines(), start=1):
            match = PATTERN.search(line)
            if not match:
                continue
            value = match.group("path")
            if "/src" not in value:
                continue
            if not value.startswith("."):
                continue
            if any(value.startswith(prefix) for prefix in ALLOWED_SEGMENTS):
                continue
            violations.append((file_path.relative_to(ROOT), line_number, value))

if violations:
    print("Forbidden deep src imports detected:")
    for file_path, line_number, value in violations:
        print(f" - {file_path}:{line_number} -> {value}")
    sys.exit(1)

print("OK: no forbidden deep src imports found")
