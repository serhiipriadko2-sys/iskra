#!/usr/bin/env python3
"""Zip integrity gate.

Why:
  Corrupted/truncated ZIPs can pass denylist checks but fail extraction.
  This gate ensures the archive can be read and every member CRC passes.

Usage:
  python tools/check_zip_integrity.py /path/to/archive.zip

Exit codes:
  0 OK
  2 Integrity fail
  1 Error
"""

from __future__ import annotations

import sys
import zipfile
from pathlib import Path


def main(argv: list[str]) -> int:
    if len(argv) != 1:
        print("Usage: python tools/check_zip_integrity.py <zip_path>", file=sys.stderr)
        return 1

    zp = Path(argv[0]).resolve()
    if not zp.exists():
        print(f"ERROR: zip not found: {zp}", file=sys.stderr)
        return 1

    try:
        with zipfile.ZipFile(zp, "r") as zf:
            # Basic read
            _ = zf.infolist()
            bad = zf.testzip()  # returns first bad filename or None
            if bad is not None:
                print(f"[FAIL] zip integrity: first bad member: {bad}")
                return 2
    except zipfile.BadZipFile as e:
        print(f"[FAIL] zip integrity: bad zip: {e}")
        return 2
    except Exception as e:
        print(f"[ERROR] zip integrity: {e}")
        return 1

    print("[OK] zip integrity gate")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
