#!/usr/bin/env python3
"""Validate explicit Delta/Omega/Lambda receipt blocks.

The validator intentionally ignores dependency folders, caches, binary files,
manifests, JSON receipts, and canon prose that merely mentions the signature.

Usage:
  python tools/validate_delta.py path/to/file.md [more files...]
  python tools/validate_delta.py --dir .
"""

from __future__ import annotations

import argparse
import re
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable, List, Optional, Tuple


SKIP_DIRS = {
    ".git",
    ".mypy_cache",
    ".pytest_cache",
    ".ruff_cache",
    ".venv",
    "__pycache__",
    "node_modules",
}
SKIP_NAMES = {
    "MANIFEST.sha256",
    "UNIFIED_QC_RECEIPT.json",
    "ZIP_RECEIPT.json",
    "HORIZON_CONTRACT.json",
    "HORIZON_PROPOSAL_SCHEMA.json",
    "iskra_toolchain_manifest.json",
}
SKIP_SUFFIXES = {
    ".7z",
    ".bin",
    ".docx",
    ".gif",
    ".gz",
    ".ico",
    ".jpeg",
    ".jpg",
    ".lock",
    ".pdf",
    ".png",
    ".pyc",
    ".pyo",
    ".rar",
    ".tar",
    ".zip",
}
TEXT_SUFFIXES = {".md", ".txt", ".yaml", ".yml", ".toml", ".py"}

SIGNATURE_START_RE = re.compile(
    r"(?im)^[ \t]*(?:#{1,6}[ \t]*)?(?:∆DΩΛ|ΔDΩΛ|Delta)\b[ \t:]*.*$"
)
FIELD_RE = {
    "delta": re.compile(r"(?im)^[ \t]*(?:∆|Δ|Delta)[ \t]*(?:[:=—-])[ \t]*(.+)$"),
    "data": re.compile(r"(?im)^[ \t]*(?:D|Data)[ \t]*(?:[:=—-])[ \t]*(.+)$"),
    "omega": re.compile(r"(?im)^[ \t]*(?:Ω|Omega)[ \t]*(?:[:=—-])[ \t]*(.+)$"),
    "lambda": re.compile(r"(?im)^[ \t]*(?:Λ|Lambda)[ \t]*(?:[:=—-])[ \t]*(.+)$"),
}
INLINE_FIELD_RE = {
    "delta": re.compile(r"(?:^|[;,\s])(?:Delta|∆|Δ)[ \t]*(?:=|:)[ \t]*([^;]+)", re.I),
    "data": re.compile(r"(?:^|[;,\s])(?:Data|D)[ \t]*(?:=|:)[ \t]*([^;]+)", re.I),
    "omega": re.compile(r"(?:^|[;,\s])(?:Omega|Ω)[ \t]*(?:=|:)[ \t]*([^;]+)", re.I),
    "lambda": re.compile(r"(?:^|[;,\s])(?:Lambda|Λ)[ \t]*(?:=|:)[ \t]*([^;]+)", re.I),
}
DATA_KIND_RE = re.compile(r"\b(Fact|Facts|Evidence|Data|Inference|Hypothesis|package|local|repo)\b", re.I)
OMEGA_NUMBER_RE = re.compile(r"[-+]?\d+(?:\.\d+)?")


@dataclass
class SigResult:
    path: Path
    ok: bool
    skipped: bool
    errors: List[str]


def should_skip(path: Path) -> bool:
    lowered_parts = {part.lower() for part in path.parts}
    if lowered_parts & SKIP_DIRS:
        return True
    if path.name in SKIP_NAMES:
        return True
    suffix = path.suffix.lower()
    if suffix in SKIP_SUFFIXES:
        return True
    if suffix and suffix not in TEXT_SUFFIXES:
        return True
    if "agent_files" in path.parts and "canon_source_files" in path.parts:
        return True
    return False


def iter_candidate_files(root: Path) -> Iterable[Path]:
    for p in root.rglob("*"):
        if p.is_file() and not should_skip(p):
            yield p


def _parse_omega(raw: str) -> Tuple[Optional[float], Optional[str]]:
    match = OMEGA_NUMBER_RE.search(raw)
    if not match:
        return None, f"Omega is not numeric: '{raw}'"
    value = float(match.group(0))
    if 0.0 <= value <= 1.0:
        value *= 100.0
    if not (0.0 <= value <= 100.0):
        return None, f"Omega out of range 0..100: {value} (from '{raw}')"
    return value, None


def _latest_tail(text: str) -> Optional[str]:
    matches = list(SIGNATURE_START_RE.finditer(text))
    if not matches:
        return None
    return text[matches[-1].start() :]


def _extract_fields(tail: str) -> dict[str, Optional[str]]:
    found: dict[str, Optional[str]] = {"delta": None, "data": None, "omega": None, "lambda": None}

    for key, pattern in FIELD_RE.items():
        match = pattern.search(tail)
        if match:
            found[key] = match.group(1).strip()

    if any(v is None for v in found.values()):
        first_line = tail.splitlines()[0] if tail.splitlines() else tail
        for key, pattern in INLINE_FIELD_RE.items():
            if found[key] is None:
                match = pattern.search(first_line)
                if match:
                    found[key] = match.group(1).strip()

    return found


def validate_text(
    path: Path,
    text: str,
    *,
    strict_missing: bool = False,
    strict_position: bool = False,
    require_data_kind: bool = False,
) -> SigResult:
    tail = _latest_tail(text)
    if tail is None:
        if strict_missing:
            return SigResult(path=path, ok=False, skipped=False, errors=["missing Delta receipt"])
        return SigResult(path=path, ok=True, skipped=True, errors=[])

    errors: List[str] = []
    if strict_position and len(tail.splitlines()) > 80:
        errors.append("Delta receipt starts more than 80 lines before EOF")

    found = _extract_fields(tail)
    if all(value is None for value in found.values()) and not strict_missing:
        return SigResult(path=path, ok=True, skipped=True, errors=[])

    for key, value in found.items():
        if value is None:
            errors.append(f"missing field: {key}")
        elif not value.strip():
            errors.append(f"empty field: {key}")

    if found["data"] is not None and require_data_kind and not DATA_KIND_RE.search(found["data"]):
        errors.append("Data should include evidence kind or source hint")

    if found["omega"] is not None:
        _, err = _parse_omega(found["omega"])
        if err:
            errors.append(err)

    return SigResult(path=path, ok=not errors, skipped=False, errors=errors)


def _read_text(path: Path) -> Tuple[Optional[str], Optional[str]]:
    try:
        return path.read_text(encoding="utf-8"), None
    except UnicodeDecodeError:
        return path.read_text(encoding="utf-8", errors="replace"), None
    except Exception as exc:  # noqa: BLE001
        return None, str(exc)


def main(argv: List[str]) -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("paths", nargs="*", help="files to validate")
    ap.add_argument("--dir", dest="dir_", help="validate candidate files under dir")
    ap.add_argument("--strict-missing", action="store_true", help="fail files without a Delta receipt")
    ap.add_argument("--strict-position", action="store_true", help="require receipt near EOF")
    ap.add_argument(
        "--require-data-kind",
        action="store_true",
        help="require Data/D to include a recognizable evidence/source hint",
    )
    args = ap.parse_args(argv)

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
    checked = 0
    skipped = 0

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

        result = validate_text(
            f,
            text,
            strict_missing=args.strict_missing,
            strict_position=args.strict_position,
            require_data_kind=args.require_data_kind,
        )
        if result.skipped:
            skipped += 1
            continue
        checked += 1
        if result.ok:
            print(f"PASS {f}")
        else:
            any_fail = True
            print(f"FAIL {f}")
            for error in result.errors:
                print(f"  - {error}")

    print(f"SUMMARY checked={checked} skipped={skipped} failed={1 if any_fail else 0}")
    return 1 if any_fail else 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
