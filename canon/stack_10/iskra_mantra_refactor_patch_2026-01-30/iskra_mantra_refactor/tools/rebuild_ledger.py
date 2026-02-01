#!/usr/bin/env python3
"""Rebuild ledger/hashes.json and ledger/sot.json for the current tree.

Design choice:
- hashes.json excludes itself and ledger/sot.json to avoid self-referential recursion.

Usage:
  python tools/rebuild_ledger.py --root .

Exit code:
  0 on success, 1 on error.
"""

from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path


def sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--root", default=".", help="project root (default: .)")
    ap.add_argument(
        "--id",
        default="2026-01-30__MANTRA__LIBER_SEMEN_vΩ__refactor",
        help="ledger entry id",
    )
    ap.add_argument(
        "--when",
        default="2026-01-30T00:00:00Z",
        help="timestamp string for the entry",
    )
    ap.add_argument(
        "--what",
        default=(
            "Rewrite MANTRA.md to LIBER SEMEN vΩ SoT; split IGNIS overlay; "
            "add metrics/definitions/vows/SIFT/validators and voice engine"
        ),
        help="human description",
    )
    args = ap.parse_args()

    root = Path(args.root).resolve()
    ledger_dir = root / "ledger"
    ledger_dir.mkdir(parents=True, exist_ok=True)

    hashes_path = ledger_dir / "hashes.json"
    sot_path = ledger_dir / "sot.json"

    exclude = {str(hashes_path.resolve()), str(sot_path.resolve())}

    files = sorted([p for p in root.rglob("*") if p.is_file() and str(p.resolve()) not in exclude])

    index = {}
    for p in files:
        rel = str(p.relative_to(root))
        data = p.read_bytes()
        index[rel] = {"sha256": sha256_bytes(data), "bytes": len(data)}

    hashes_path.write_text(json.dumps(index, ensure_ascii=False, indent=2), encoding="utf-8")

    entry = {
        "id": args.id,
        "when": args.when,
        "what": args.what,
        "actor": "ISKRIV+SAM (automation)",
        "files": [{"path": rel, **meta} for rel, meta in index.items()],
    }
    sot_path.write_text(json.dumps([entry], ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"ledger rebuilt: {len(index)} files")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
