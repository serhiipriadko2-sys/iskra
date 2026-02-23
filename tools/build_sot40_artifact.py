#!/usr/bin/env python3
"""Build SoT40 stack zip and receipt for CI anti-empty checks."""

from __future__ import annotations

import argparse
import hashlib
import json
import zipfile
from pathlib import Path

from build_projects_stack import build

ROOT = Path(__file__).resolve().parents[1]


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as file_obj:
        for chunk in iter(lambda: file_obj.read(8192), b""):
            digest.update(chunk)
    return digest.hexdigest()


def collect_files(path: Path) -> list[Path]:
    return sorted([file_path for file_path in path.rglob("*") if file_path.is_file()])


def build_zip(source_dir: Path, zip_path: Path) -> None:
    zip_path.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as archive:
        for file_path in collect_files(source_dir):
            archive.write(file_path, file_path.relative_to(source_dir))


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--out-dir", default=str(ROOT / "dist" / "sot40"), help="Output directory")
    args = parser.parse_args()

    out_dir = Path(args.out_dir).resolve()
    stack_dir = out_dir / "stack"
    zip_path = out_dir / "sot40.zip"
    receipt_path = out_dir / "receipt.json"

    build(stack_dir)
    build_zip(stack_dir, zip_path)

    stack_files = collect_files(stack_dir)
    receipt = {
        "artifact": "SoT40",
        "stack_dir": str(stack_dir.relative_to(ROOT)),
        "zip_path": str(zip_path.relative_to(ROOT)),
        "sha256": sha256_file(zip_path),
        "bytes": zip_path.stat().st_size,
        "file_count": len(stack_files),
        "qc": {
            "anti_empty": len(stack_files) > 0,
            "zip_exists": zip_path.exists(),
            "receipt_version": 1,
        },
    }

    receipt_path.parent.mkdir(parents=True, exist_ok=True)
    receipt_path.write_text(json.dumps(receipt, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    print(f"Built SoT40 artifact: {zip_path}")
    print(f"Wrote receipt: {receipt_path}")


if __name__ == "__main__":
    main()
