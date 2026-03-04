#!/usr/bin/env python3
"""Build a full-repo checkpoint ZIP with gates.

This is the 'checkpoint' artifact in PatchBatch→Checkpoint protocol.

Gates
  1) Release gate: CHANGELOG Unreleased must be empty.
  2) Supabase gate (if present): Edge Function `embed` must be protected.
  3) pgvector gate (if present): migrations/RPC for HNSW must exist.
  4) Zip integrity gate: ZIP must be extractable (CRC OK).
  5) Denylist gate: ZIP must not contain node_modules/dist/.next/etc.

Usage
  python tools/build_checkpoint.py --zip /tmp/iskra_checkpoint.zip

Exit codes
  0 OK
  2 Gate fail
  1 Error
"""

from __future__ import annotations

import argparse
import hashlib
import os
import subprocess
import sys
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

DEFAULT_EXCLUDE_DIRS = {
    "node_modules",
    "dist",
    ".next",
    ".turbo",
    ".cache",
    "coverage",
    "build",
}


def sha256_file(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def _should_skip(rel: Path) -> bool:
    parts = set(rel.parts)
    if parts & DEFAULT_EXCLUDE_DIRS:
        return True
    # Skip TS incremental build info
    if str(rel).endswith(".tsbuildinfo"):
        return True
    return False


def zip_repo(zip_path: Path) -> None:
    zip_path.parent.mkdir(parents=True, exist_ok=True)
    if zip_path.exists():
        zip_path.unlink()

    with zipfile.ZipFile(zip_path, "w", compression=zipfile.ZIP_DEFLATED) as zf:
        for p in sorted(ROOT.rglob("*")):
            if p.is_dir():
                continue
            rel = p.relative_to(ROOT)
            if _should_skip(rel):
                continue
            # Normalize to forward slashes
            zf.write(p, rel.as_posix())


def run_gate(cmd: list[str]) -> int:
    p = subprocess.run(cmd, cwd=str(ROOT))
    return int(p.returncode)


def main(argv: list[str]) -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument(
        "--zip",
        required=True,
        help="Output .zip path",
    )
    ap.add_argument(
        "--changelog",
        default="governance/changelog.md",
        help="Path to changelog file (default: governance/changelog.md)",
    )
    args = ap.parse_args(argv)

    # 1) Release gate
    rc = run_gate([sys.executable, "tools/check_unreleased_gate.py", args.changelog])
    if rc != 0:
        return 2

    # 2) Supabase edge security gate (only if supabase/ exists)
    if (ROOT / "supabase").exists():
        rc = run_gate([sys.executable, "tools/check_supabase_edge_security.py"])
        if rc != 0:
            return 2

        # 3) pgvector/HNSW schema gate (only if migrations/ exists)
        if (ROOT / "supabase" / "migrations").exists():
            rc = run_gate([sys.executable, "tools/check_pgvector_hnsw_schema.py"])
            if rc != 0:
                return 2

    zip_path = Path(args.zip).resolve()
    zip_repo(zip_path)

    # 4) Zip integrity gate
    rc = run_gate([sys.executable, "tools/check_zip_integrity.py", str(zip_path)])
    if rc != 0:
        return 2

    # 5) Denylist gate
    rc = run_gate([sys.executable, "tools/check_zip_denylist.py", str(zip_path)])
    if rc != 0:
        return 2

    size = zip_path.stat().st_size
    digest = sha256_file(zip_path)
    print(f"CHECKPOINT OK: {zip_path} ({size} bytes)")
    print(f"sha256: {digest}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
