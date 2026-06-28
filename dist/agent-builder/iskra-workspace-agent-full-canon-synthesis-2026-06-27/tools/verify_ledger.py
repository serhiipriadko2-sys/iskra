#!/usr/bin/env python3
"""
Stub for repo-wide ledger verification.

The full repo ledger (`ledger/sot.json`) is byte-coupled to the exact state of
the repository. It cannot be verified from inside a filtered Builder upload set.

Usage:
  Run this script from a full checkout of the repository root, not from inside
  `dist/agent-builder/iskra-full-canon-unified-2026-06-10/`.

  cd /path/to/iskra-1
  python tools/verify_ledger.py

For the Builder upload set itself, use `sha256sum -c MANIFEST.sha256`.
"""

import sys


def main() -> int:
    print("verify_ledger.py: repo-wide ledger verification requires a full repository checkout.")
    print("Use this script from the repository root, not from the Builder upload set.")
    print("For the upload set, run: sha256sum -c MANIFEST.sha256")
    return 1


if __name__ == "__main__":
    sys.exit(main())
