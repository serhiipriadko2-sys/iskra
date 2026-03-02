#!/usr/bin/env python3
"""Check that an archive does NOT contain forbidden (regen/heavy) paths.

Usage:
  python tools/check_zip_denylist.py path/to/archive.zip

Exit codes:
  0 OK
  2 Forbidden paths found
  1 Error (bad args, unreadable zip)
"""

from __future__ import annotations

import argparse
import sys
import zipfile

DEFAULT_DENY_PREFIXES = [
    "node_modules/",
    "dist/",
    ".next/",
    ".turbo/",
    ".cache/",
    "coverage/",
    "build/",
]


def main(argv: list[str]) -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("zip_path", help="Path to .zip archive")
    ap.add_argument(
        "--deny",
        action="append",
        default=[],
        help="Additional denied prefixes (repeatable). Example: --deny .pnpm-store/",
    )
    args = ap.parse_args(argv)

    deny = DEFAULT_DENY_PREFIXES + args.deny

    try:
        with zipfile.ZipFile(args.zip_path, "r") as zf:
            offenders: list[str] = []
            for name in zf.namelist():
                # Normalize to forward slashes; zip uses '/'
                for prefix in deny:
                    if name.startswith(prefix) or ("/" + prefix) in name:
                        offenders.append(name)
                        break
    except Exception as e:
        print(f"ERROR: cannot read zip: {e}", file=sys.stderr)
        return 1

    if offenders:
        print("DENYLIST FAIL: forbidden paths found:")
        for n in offenders[:200]:
            print(f"- {n}")
        if len(offenders) > 200:
            print(f"… and {len(offenders)-200} more")
        return 2

    print("DENYLIST OK: no forbidden paths")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
