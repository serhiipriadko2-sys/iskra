#!/usr/bin/env python3
"""Fail when local status dumps or obvious Supabase secrets are committed."""

from __future__ import annotations

import re
import subprocess
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]

DENIED_FILENAMES = {
    "supabase_status.txt",
}

SECRET_PATTERNS = [
    re.compile(r"sb_secret_[A-Za-z0-9_-]{16,}"),
    re.compile(r"SUPABASE_SERVICE_ROLE_KEY\s*=\s*(?!REDACTED|your_|<)[^\s]+", re.IGNORECASE),
]


def tracked_files() -> list[str]:
    result = subprocess.run(
        ["git", "ls-files"],
        cwd=ROOT,
        check=True,
        text=True,
        capture_output=True,
    )
    return [line.strip() for line in result.stdout.splitlines() if line.strip()]


def deleted_tracked_files() -> set[str]:
    result = subprocess.run(
        ["git", "ls-files", "--deleted"],
        cwd=ROOT,
        check=True,
        text=True,
        capture_output=True,
    )
    return {line.strip() for line in result.stdout.splitlines() if line.strip()}


def main() -> int:
    failures: list[str] = []
    files = tracked_files()
    deleted = deleted_tracked_files()

    for rel in files:
        path = Path(rel)
        if path.name in DENIED_FILENAMES and rel not in deleted:
            failures.append(f"tracked local status dump: {rel}")

    for denied in DENIED_FILENAMES:
        if (ROOT / denied).exists():
            failures.append(f"local status dump exists in worktree: {denied}")

    for rel in files:
        full = ROOT / rel
        try:
            text = full.read_text(encoding="utf-8", errors="replace")
        except OSError:
            continue

        for pattern in SECRET_PATTERNS:
            if pattern.search(text):
                failures.append(f"secret-like Supabase value in tracked file: {rel}")
                break

    if failures:
        print("[FAIL] sensitive status dump gate")
        for item in failures:
            print(f"- {item}")
        return 1

    print("[OK] no sensitive status dumps")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
