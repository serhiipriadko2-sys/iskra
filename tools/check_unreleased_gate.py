#!/usr/bin/env python3
"""Fail the build if CHANGELOG "Unreleased" section has content.

Why
  Before creating a checkpoint release, we require promoting Unreleased
  into a versioned release section (Keep a Changelog discipline).

Rules
  - The file must contain a section header:
      "## [Unreleased]"  or  "## Unreleased"
  - The section is considered NON-EMPTY if it contains any non-blank,
    non-comment line before the next "## " header.

Usage
  python tools/check_unreleased_gate.py governance/changelog.md

Exit codes
  0 OK (Unreleased is empty)
  2 Gate fail (Unreleased has content)
  1 Error (bad args / file unreadable / missing Unreleased section)
"""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path


UNRELEASED_HEADERS = ("## [Unreleased]", "## Unreleased")


def _find_unreleased(lines: list[str]) -> int | None:
    for i, ln in enumerate(lines):
        if ln.strip() in UNRELEASED_HEADERS:
            return i
    return None


def _section_body(lines: list[str], start_idx: int) -> list[str]:
    body: list[str] = []
    for ln in lines[start_idx + 1 :]:
        if re.match(r"^##\s+", ln):
            break
        body.append(ln)
    return body


def _is_comment(line: str) -> bool:
    s = line.strip()
    return s.startswith("<!--") or s.startswith("-->")


def _is_nonempty(body: list[str]) -> bool:
    for ln in body:
        if not ln.strip():
            continue
        if _is_comment(ln):
            continue
        return True
    return False


def main(argv: list[str]) -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument(
        "path",
        nargs="?",
        default="governance/changelog.md",
        help="Path to changelog file (default: governance/changelog.md)",
    )
    args = ap.parse_args(argv)

    path = Path(args.path)
    if not path.exists() or not path.is_file():
        print(f"ERROR: changelog not found: {path}", file=sys.stderr)
        return 1

    try:
        text = path.read_text(encoding="utf-8")
    except Exception as e:
        print(f"ERROR: cannot read changelog: {e}", file=sys.stderr)
        return 1

    lines = text.splitlines()
    idx = _find_unreleased(lines)
    if idx is None:
        print(
            "RELEASE GATE FAIL: missing Unreleased section.\n"
            "Add a header '## [Unreleased]' (or '## Unreleased') and keep it empty before checkpoint.",
            file=sys.stderr,
        )
        return 1

    body = _section_body(lines, idx)
    if _is_nonempty(body):
        print(
            "RELEASE GATE FAIL: Promote Unreleased section in CHANGELOG before checkpoint.\n"
            f"file={path}",
            file=sys.stderr,
        )
        return 2

    print("RELEASE GATE OK: Unreleased is empty")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
