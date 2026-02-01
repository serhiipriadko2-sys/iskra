#!/usr/bin/env python3
"""Validate canonical terminology (voice names, etc.).

This tool enforces a small set of *hard* invariants:
- chaos voice name must be 'HUYNDUN'
- structure voice name must be 'SAM' (not SEM)

Usage:
  python tools/validate_terms.py --dir .

Exit codes:
  0 - PASS
  1 - FAIL
"""

from __future__ import annotations

import argparse
import re
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable, List


@dataclass
class Violation:
    path: Path
    line_no: int
    line: str
    rule: str
    fix: str


RULES = [
    # Chaos voice: HUYNDUN only
    (re.compile(r"\bHuyndun\b"), "HUYNDUN"),
    (re.compile(r"\bHun'Dun\b"), "HUYNDUN"),
    (re.compile(r"\bHUNDUN\b"), "HUYNDUN"),
    # Structure voice
    (re.compile(r"\bVOICE\.SEM\b"), "VOICE.SAM"),
]

SKIP_SUFFIX = {".png", ".jpg", ".jpeg", ".gif", ".zip", ".pdf", ".docx"}


def iter_files(root: Path) -> Iterable[Path]:
    for p in root.rglob("*"):
        if not p.is_file():
            continue
        if p.suffix.lower() in SKIP_SUFFIX:
            continue
        if p.suffix.lower() == ".json" and p.stat().st_size > 5_000_000:
            continue
        yield p


def main(argv: List[str]) -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--dir", required=True, help="directory to scan")
    args = ap.parse_args(argv)

    root = Path(args.dir)
    if not root.exists():
        print(f"dir not found: {root}", file=sys.stderr)
        return 1

    violations: List[Violation] = []

    for p in iter_files(root):
        try:
            text = p.read_text(encoding="utf-8", errors="replace")
        except Exception as e:  # noqa: BLE001
            print(f"WARN cannot read {p}: {e}", file=sys.stderr)
            continue

        for i, line in enumerate(text.splitlines(), start=1):
            for rx, replacement in RULES:
                if rx.search(line):
                    violations.append(
                        Violation(
                            path=p,
                            line_no=i,
                            line=line.rstrip("\n"),
                            rule=rx.pattern,
                            fix=replacement,
                        )
                    )

    if not violations:
        print("PASS terminology")
        return 0

    print("FAIL terminology")
    for v in violations[:200]:
        print(f"{v.path}:{v.line_no}: {v.line}")
        print(f"  rule: {v.rule}")
        print(f"  fix : replace with '{v.fix}'")

    if len(violations) > 200:
        print(f"... {len(violations)-200} more violations")

    return 1


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
