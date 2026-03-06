#!/usr/bin/env python3
"""Regenerate ledger/sot.json (SHA-256) for SoT files.

Usage:
  python tools/update_ledger.py

Notes:
- Excludes ledger/sot.json and ledger/checksum.asc to avoid self-reference loops.
- Intended for local use; CI only verifies.
"""
from __future__ import annotations
import datetime
import hashlib, json, os
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

INCLUDE_DIRS = ["core","system","governance","metrics","mind","appendix","canon","runtime","tools",".github","docs"]
INCLUDE_FILES = ["manifest.yml","README.md","CONTRIBUTING.md","ISKRA_MANIFEST.md","LIBER_INITIUM.md"]

EXCLUDE = {
    Path("ledger/sot.json"),
    Path("ledger/checksum.asc"),
}

CHECKSUM_DEFAULTS = {
    # Human-readable checksum header (kept stable for verifiers)
    "version": "vΩ.1.2",
    "revision": "rev13-maki-priority+integrity",
    "algorithm": "sha256",
}

def sha256_file(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1024*1024), b""):
            h.update(chunk)
    return h.hexdigest()

def should_exclude(rel_path: Path) -> bool:
    """Check if a path should be excluded from the ledger."""
    parts = rel_path.parts
    path_str = str(rel_path)
    
    # SECURITY: Exclude __pycache__ directories and .pyc files to prevent bytecode smuggling
    if "__pycache__" in parts or path_str.endswith(".pyc"):
        return True
    
    # Exclude node_modules anywhere in the path
    if "node_modules" in parts:
        return True
    
    # Exclude build artifacts
    # Exclude coverage reports
    if "coverage" in parts:
        return True

    if "dist" in parts:
        return True
    
    # Exclude TypeScript build info files
    if path_str.endswith(".tsbuildinfo"):
        return True
    
    return False

def main() -> None:
    out = {"version": "sot-ledger/1", "sha256": {}}
    skipped = []
    
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
            
            # Skip node_modules, dist, and build artifacts
            if should_exclude(rel):
                continue
            
            # Try to get a valid UTF-8 path string
            try:
                path_str = str(rel).replace(os.sep,"/")
                # Test if it can be encoded/decoded properly
                path_str.encode('utf-8').decode('utf-8')
                # Also test JSON serialization
                json.dumps(path_str)
                out["sha256"][path_str] = sha256_file(file)
            except (UnicodeError, UnicodeDecodeError, UnicodeEncodeError) as e:
                # Skip files with invalid UTF-8 filenames
                skipped.append((str(rel), str(e)))
                continue

    # top-level files
    for f in INCLUDE_FILES:
        p = ROOT / f
        if p.exists() and p.is_file():
            rel = p.relative_to(ROOT)
            if rel not in EXCLUDE:
                try:
                    path_str = str(rel).replace(os.sep,"/")
                    path_str.encode('utf-8').decode('utf-8')
                    out["sha256"][path_str] = sha256_file(p)
                except (UnicodeError, UnicodeDecodeError, UnicodeEncodeError) as e:
                    skipped.append((str(rel), str(e)))
                    continue

    ledger = ROOT / "ledger"
    ledger.mkdir(exist_ok=True)
    (ledger / "sot.json").write_text(json.dumps(out, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Updated {ledger/'sot.json'} with {len(out['sha256'])} entries")
    
    if skipped:
        print(f"\n⚠ Skipped {len(skipped)} files with encoding issues:")
        for path, error in skipped[:10]:  # Show first 10
            print(f"  - {path}")
        if len(skipped) > 10:
            print(f"  ... and {len(skipped) - 10} more")

    # Also keep a human-readable checksum file in sync.
    # This is NOT included in sot.json to avoid self-reference loops.
    checksum_path = ledger / "checksum.asc"
    meta = dict(CHECKSUM_DEFAULTS)
    if checksum_path.exists():
        # Preserve version/revision if they were manually bumped.
        for line in checksum_path.read_text(encoding="utf-8").splitlines():
            if line.startswith("version:"):
                meta["version"] = line.split(":", 1)[1].strip()
            elif line.startswith("revision:"):
                meta["revision"] = line.split(":", 1)[1].strip()
            elif line.startswith("algorithm:"):
                meta["algorithm"] = line.split(":", 1)[1].strip()

    meta["updated"] = datetime.date.today().isoformat()

    lines = [
        "-----BEGIN ISKRA CHECKSUM-----",
        f"version: {meta['version']}",
        f"revision: {meta['revision']}",
        f"updated: {meta['updated']}",
        f"algorithm: {meta['algorithm']}",
        "",
        "# path  sha256",
    ]
    for rel in sorted(out["sha256"].keys()):
        lines.append(f"{rel}  {out['sha256'][rel]}")
    lines.append("-----END ISKRA CHECKSUM-----")
    checksum_path.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"Updated {checksum_path}")

if __name__ == "__main__":
    main()
