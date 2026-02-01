#!/usr/bin/env python3
"""Verify ledger/sot.json hashes."""
from __future__ import annotations
import hashlib, json, os, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

def sha256_file(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1024*1024), b""):
            h.update(chunk)
    return h.hexdigest()

def main() -> None:
    ledger = ROOT / "ledger" / "sot.json"
    if not ledger.exists():
        print("Missing ledger/sot.json", file=sys.stderr)
        sys.exit(2)
    sot = json.loads(ledger.read_text(encoding="utf-8"))
    bad = []
    for rel, expected in sot.get("sha256", {}).items():
        path = ROOT / rel
        if not path.exists():
            bad.append((rel, "missing", expected))
            continue
        got = sha256_file(path)
        if got != expected:
            bad.append((rel, got, expected))
    if bad:
        print("Ledger verification FAILED:")
        for rel, got, exp in bad[:50]:
            print(f"- {rel}: got {got} expected {exp}")
        sys.exit(1)
    print(f"Ledger OK ({len(sot.get('sha256', {}))} files)")
    sys.exit(0)

if __name__ == "__main__":
    main()
