#!/usr/bin/env python3
"""Normalize upload-subset text files to LF and regenerate MANIFEST.sha256."""

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
    ".sha256",
    ".txt",
    ".sh",
    ".ps1",
    ".yaml",
    ".yml",
    ".ini",
    ".toml"
}

IGNORE_ROOT_FILES = {
    "MANIFEST.sha256",
    "ZIP_RECEIPT.json",
}

IGNORE_DIRS = {
    ".git",
    ".mypy_cache",
    ".pytest_cache",
    ".ruff_cache",
    ".venv",
    "__pycache__",
    "node_modules",
}

IGNORE_NAMES = {".ds_store", "thumbs.db"}

IGNORE_SUFFIXES = {
    ".7z",
    ".bak",
    ".gz",
    ".log",
    ".pyc",
    ".pyo",
    ".rar",
    ".tar",
    ".tmp",
    ".zip",
}

SCREENSHOT_SUFFIXES = {".png", ".jpg", ".jpeg", ".webp"}


def normalize_and_hash(file_path: Path) -> str:
    suffix = file_path.suffix.lower()
    
    # Check if file is text and needs LF normalization
    if suffix in TEXT_SUFFIXES or file_path.name == ".gitattributes":
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


def is_ignored(file_path: Path) -> bool:
    rel_path = file_path.relative_to(PACKAGE_ROOT)
    parts = {part.lower() for part in rel_path.parts}
    name = file_path.name.lower()
    suffix = file_path.suffix.lower()
    if parts & IGNORE_DIRS:
        return True
    if any(part.endswith(".egg-info") for part in parts):
        return True
    if rel_path.as_posix() in IGNORE_ROOT_FILES:
        return True
    if name in IGNORE_NAMES:
        return True
    if suffix in IGNORE_SUFFIXES:
        return True
    if suffix in SCREENSHOT_SUFFIXES and (
        "screenshot" in name or "chatgpt_agent_" in name
    ):
        return True
    return False


def main() -> None:
    print(f"Regenerating manifest for: {PACKAGE_ROOT}")
    entries = []

    for root, dirs, files in os.walk(PACKAGE_ROOT):
        # Skip ignored directories
        dirs[:] = [d for d in dirs if d not in IGNORE_DIRS and not d.endswith(".egg-info")]
        
        for file in files:
            file_path = Path(root) / file
            if is_ignored(file_path):
                continue
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
