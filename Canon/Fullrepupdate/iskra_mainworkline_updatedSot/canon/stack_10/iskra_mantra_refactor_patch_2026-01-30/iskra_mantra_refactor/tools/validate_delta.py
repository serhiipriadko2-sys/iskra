#!/usr/bin/env python3
"""Validate ∆DΩΛ signature blocks in markdown/text files.

This tool is intentionally small and dependency-free.

Usage:
  python tools/validate_delta.py path/to/file.md [more files...]
  python tools/validate_delta.py --dir .

Exit codes:
  0 - all files PASS
  1 - at least one FAIL
"""

from __future__ import annotations

import argparse
import os
import re
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable, List, Optional, Tuple


# Match a standalone header line: "∆DΩΛ".
# Important: use explicit [ \t] instead of \s to avoid consuming newlines.
SIGNATURE_HEAD_RE = re.compile(r"^[ \t]*(?:∆|Δ)DΩΛ[ \t]*$", re.MULTILINE)

# Accept:
#   Δ: ...
#   Δ — ...
#   ∆: ...
FIELD_RE = {
    "delta": re.compile(r"^\s*[∆Δ]\s*(?:[:—-])\s*(.+)\s*$"),
    "data": re.compile(r"^\s*D\s*(?:[:—-])\s*(.+)\s*$"),
    "omega": re.compile(r"^\s*Ω\s*(?:[:—-])\s*(.+)\s*$"),
    "lambda": re.compile(r"^\s*Λ\s*(?:[:—-])\s*(.+)\s*$"),
}

DATA_KIND_RE = re.compile(r"\b(Fact|Inference|Hypothesis)\b", re.IGNORECASE)


@dataclass
class SigResult:
    path: Path
    ok: bool
    errors: List[str]


def iter_candidate_files(root: Path) -> Iterable[Path]:
    for p in root.rglob("*"):
        if not p.is_file():
            continue
        # Skip typical binary / huge files
        if p.suffix.lower() in {".png", ".jpg", ".jpeg", ".gif", ".zip", ".pdf", ".docx"}:
            continue
        # Skip known large JSON logs by default
        if p.suffix.lower() in {".json"} and p.stat().st_size > 5_000_000:
            continue
        yield p


def _parse_omega(raw: str) -> Tuple[Optional[float], Optional[str]]:
    """Return (value_0_100, error)."""
    s = raw.strip()
    # Normalize percent
    s = s.replace("%", "").strip()
    # Try float
    try:
        v = float(s)
    except ValueError:
        return None, f"Ω is not a number: '{raw}'"

    # If user gives 0..1 confidence, accept but scale.
    if 0.0 <= v <= 1.0:
        v = v * 100.0

    if not (0.0 <= v <= 100.0):
        return None, f"Ω out of range 0..100: {v} (from '{raw}')"

    return v, None


def validate_text(path: Path, text: str) -> SigResult:
    errors: List[str] = []

    # Find last occurrence of signature header
    matches = list(SIGNATURE_HEAD_RE.finditer(text))
    if not matches:
        return SigResult(path=path, ok=False, errors=["missing ∆DΩΛ header"])

    last = matches[-1]
    tail = text[last.start():]

    # Heuristic: signature should be near end
    # If there's too much content after signature, flag
    if len(tail.splitlines()) > 80:
        errors.append("∆DΩΛ header found, but it is far from the end (more than 80 lines after it)")

    lines = tail.splitlines()

    found = {"delta": None, "data": None, "omega": None, "lambda": None}

    for line in lines:
        if found["delta"] is None:
            m = FIELD_RE["delta"].match(line)
            if m:
                found["delta"] = m.group(1)
                continue
        if found["data"] is None:
            m = FIELD_RE["data"].match(line)
            if m:
                found["data"] = m.group(1)
                continue
        if found["omega"] is None:
            m = FIELD_RE["omega"].match(line)
            if m:
                found["omega"] = m.group(1)
                continue
        if found["lambda"] is None:
            m = FIELD_RE["lambda"].match(line)
            if m:
                found["lambda"] = m.group(1)
                continue

        if all(v is not None for v in found.values()):
            break

    for k, v in found.items():
        if v is None:
            errors.append(f"missing field: {k}")

    # Validate contents if present
    if found["delta"] is not None and len(found["delta"].strip()) == 0:
        errors.append("Δ is empty")

    if found["data"] is not None:
        if len(found["data"].strip()) == 0:
            errors.append("D is empty")
        if not DATA_KIND_RE.search(found["data"]):
            errors.append("D should include Fact/Inference/Hypothesis")

    if found["omega"] is not None:
        _, err = _parse_omega(found["omega"])
        if err:
            errors.append(err)

    if found["lambda"] is not None and len(found["lambda"].strip()) == 0:
        errors.append("Λ is empty")

    return SigResult(path=path, ok=(len(errors) == 0), errors=errors)


def _read_text(path: Path) -> Tuple[Optional[str], Optional[str]]:
    try:
        return path.read_text(encoding="utf-8"), None
    except UnicodeDecodeError:
        try:
            return path.read_text(encoding="utf-8", errors="replace"), None
        except Exception as e:  # noqa: BLE001
            return None, str(e)
    except Exception as e:  # noqa: BLE001
        return None, str(e)


def main(argv: List[str]) -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("paths", nargs="*", help="files to validate")
    ap.add_argument("--dir", dest="dir_", help="validate all candidate files under dir")
    args = ap.parse_args(argv)

    files: List[Path] = []
    if args.dir_:
        root = Path(args.dir_)
        if not root.exists():
            print(f"dir not found: {root}", file=sys.stderr)
            return 1
        files = list(iter_candidate_files(root))
    else:
        files = [Path(p) for p in args.paths]

    if not files:
        print("no files provided", file=sys.stderr)
        return 1

    any_fail = False
    for f in files:
        if not f.exists() or not f.is_file():
            any_fail = True
            print(f"FAIL {f}: not a file")
            continue

        text, err = _read_text(f)
        if err or text is None:
            any_fail = True
            print(f"FAIL {f}: cannot read ({err})")
            continue

        res = validate_text(f, text)
        if res.ok:
            print(f"PASS {f}")
        else:
            any_fail = True
            print(f"FAIL {f}")
            for e in res.errors:
                print(f"  - {e}")

    return 1 if any_fail else 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
