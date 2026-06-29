#!/usr/bin/env python3
"""Wrapper for the canonical Horizon v0.2 receipt validator."""

from __future__ import annotations

import argparse
import subprocess
import sys
from pathlib import Path


def main() -> int:
    parser = argparse.ArgumentParser(description="Run the Horizon v0.2 receipt validator.")
    parser.add_argument("--repo-root", type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument("paths", nargs="+", type=Path)
    args = parser.parse_args()

    validator = args.repo_root / "canon" / "horizon" / "10_HORIZON_V0_2_RECEIPT_VALIDATOR.py"
    return subprocess.call([sys.executable, str(validator), *[str(path) for path in args.paths]])


if __name__ == "__main__":
    raise SystemExit(main())
