#!/usr/bin/env python3
"""Verify SoT40 receipt consistency and anti-empty quality controls."""

from __future__ import annotations

import argparse
import hashlib
import json
import sys
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as file_obj:
        for chunk in iter(lambda: file_obj.read(8192), b""):
            digest.update(chunk)
    return digest.hexdigest()


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--receipt", default=str(ROOT / "dist" / "sot40" / "receipt.json"))
    args = parser.parse_args()

    receipt_path = Path(args.receipt).resolve()
    if not receipt_path.exists():
        raise FileNotFoundError(f"Receipt not found: {receipt_path}")

    receipt = json.loads(receipt_path.read_text(encoding="utf-8"))
    zip_path = ROOT / receipt["zip_path"]

    if not zip_path.exists():
        raise FileNotFoundError(f"Zip not found: {zip_path}")

    actual_sha = sha256_file(zip_path)
    actual_bytes = zip_path.stat().st_size

    with zipfile.ZipFile(zip_path, "r") as archive:
        zip_files = [name for name in archive.namelist() if not name.endswith("/")]

    errors: list[str] = []
    if receipt.get("sha256") != actual_sha:
        errors.append("sha256 mismatch")
    if receipt.get("bytes") != actual_bytes:
        errors.append("bytes mismatch")
    if receipt.get("file_count") != len(zip_files):
        errors.append("file_count mismatch")

    qc = receipt.get("qc", {})
    if not qc.get("anti_empty", False):
        errors.append("qc.anti_empty is false")
    if not qc.get("zip_exists", False):
        errors.append("qc.zip_exists is false")

    if errors:
        print("SoT40 receipt verification failed:")
        for error in errors:
            print(f" - {error}")
        sys.exit(1)

    print("OK: SoT40 receipt verified")


if __name__ == "__main__":
    main()
