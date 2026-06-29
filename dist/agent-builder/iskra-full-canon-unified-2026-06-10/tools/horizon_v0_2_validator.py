"""Horizon v0.2 receipt validator wrapper.

Canonical implementation lives in
`canon/horizon/10_HORIZON_V0_2_RECEIPT_VALIDATOR.py`.
This wrapper provides a stable entrypoint for tooling.
"""

from __future__ import annotations

import argparse
import pathlib
import runpy
import sys


def main() -> None:
    parser = argparse.ArgumentParser(description="Run the canonical Horizon v0.2 receipt validator.")
    parser.add_argument("paths", nargs="+", help="JSON or JSONL Horizon v0.2 receipt files.")
    parser.add_argument("--repo-root", default=None, help="Repository root. Defaults to this wrapper's parent repo.")
    args = parser.parse_args()

    repo_root = pathlib.Path(args.repo_root).resolve() if args.repo_root else pathlib.Path(__file__).resolve().parents[1]
    target = repo_root / "canon" / "horizon" / "10_HORIZON_V0_2_RECEIPT_VALIDATOR.py"

    if not target.exists():
        print(f"MISSING_CANONICAL_TARGET: Horizon v0.2 receipt validator target missing: {target}")
        sys.exit(1)

    sys.argv = [str(target), *args.paths]
    runpy.run_path(str(target), run_name="__main__")


if __name__ == "__main__":
    main()
