#!/usr/bin/env python3
"""Regenerate ledger/sot.json (SHA-256) for SoT files.

Usage:
  python tools/update_ledger.py

Notes:
- Excludes ledger/sot.json and ledger/checksum.asc to avoid self-reference loops.
- Intended for local use; CI only verifies.
"""
from __future__ import annotations
import hashlib, json, os
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

INCLUDE_DIRS = ["core","system","governance","metrics","mind","appendix","tools",".github"]
INCLUDE_FILES = ["manifest.yml","README.md","CONTRIBUTING.md","ISKRA_MANIFEST_v╬⌐.md","LIBER_INITIUM.md"]

EXCLUDE = {
    Path("ledger/sot.json"),
    Path("ledger/checksum.asc"),
}

def sha256_file(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1024*1024), b""):
            h.update(chunk)
    return h.hexdigest()

def main() -> None:
    out = {"version": "sot-ledger/1", "sha256": {}}
    # directories
    for d in INCLUDE_DIRS:
        p = ROOT / d
        if not p.exists():
            continue
        for file in sorted(p.rglob("*")):
            if file.is_dir():
                continue
            rel = file.relative_to(ROOT)
            if rel in EXCLUDE:
                continue
            out["sha256"][str(rel).replace(os.sep,"/")] = sha256_file(file)

    # top-level files
    for f in INCLUDE_FILES:
        p = ROOT / f
        if p.exists() and p.is_file():
            rel = p.relative_to(ROOT)
            if rel not in EXCLUDE:
                out["sha256"][str(rel).replace(os.sep,"/")] = sha256_file(p)

    ledger = ROOT / "ledger"
    ledger.mkdir(exist_ok=True)
    (ledger / "sot.json").write_text(json.dumps(out, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Updated {ledger/'sot.json'} with {len(out['sha256'])} entries")

if __name__ == "__main__":
    main()
