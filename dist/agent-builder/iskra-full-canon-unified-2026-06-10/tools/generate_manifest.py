#!/usr/bin/env python3
"""Normalize text files to LF and regenerate MANIFEST.sha256."""

from __future__ import annotations
import hashlib
import os
from pathlib import Path

PACKAGE_ROOT = Path(__file__).resolve().parents[1]
MANIFEST_PATH = PACKAGE_ROOT / "MANIFEST.sha256"

# File types that should be treated as text and normalized to LF
TEXT_SUFFIXES = {
    ".py",
    ".md",
    ".json",
    ".txt",
    ".sh",
    ".ps1",
    ".yaml",
    ".yml",
    ".ini",
    ".toml"
}

IGNORE_FILES = {
    "MANIFEST.sha256",
    "ZIP_RECEIPT.json",
    ".gitattributes",
}

IGNORE_DIRS = {
    ".git",
    ".venv",
    "__pycache__",
    "node_modules",
}


def normalize_and_hash(file_path: Path) -> str:
    suffix = file_path.suffix.lower()
    
    # Check if file is text and needs LF normalization
    if suffix in TEXT_SUFFIXES:
        try:
            # Read content, decoding as UTF-8
            content = file_path.read_text(encoding="utf-8")
            # Replace CRLF with LF
            normalized = content.replace("\r\n", "\n")
            # Write back normalized content
            file_path.write_bytes(normalized.encode("utf-8"))
        except Exception as e:
            print(f"  Failed to normalize {file_path.relative_to(PACKAGE_ROOT)}: {e}")

    # Compute binary hash
    h = hashlib.sha256()
    with file_path.open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def main() -> None:
    print(f"Regenerating manifest for: {PACKAGE_ROOT}")
    entries = []

    for root, dirs, files in os.walk(PACKAGE_ROOT):
        # Skip ignored directories
        dirs[:] = [d for d in dirs if d not in IGNORE_DIRS and not d.endswith(".egg-info")]
        
        for file in files:
            if file in IGNORE_FILES:
                continue
                
            file_path = Path(root) / file
            rel_path = file_path.relative_to(PACKAGE_ROOT).as_posix()
            
            file_hash = normalize_and_hash(file_path)
            entries.append(f"{file_hash} *{rel_path}")

    # Sort entries by path for deterministic output
    entries.sort(key=lambda x: x.split(" *")[1])

    # Write MANIFEST.sha256 with LF line endings
    manifest_content = "\n".join(entries) + "\n"
    MANIFEST_PATH.write_bytes(manifest_content.encode("utf-8"))
    
    print(f"Generated {len(entries)} entries in {MANIFEST_PATH.name}")


if __name__ == "__main__":
    main()
