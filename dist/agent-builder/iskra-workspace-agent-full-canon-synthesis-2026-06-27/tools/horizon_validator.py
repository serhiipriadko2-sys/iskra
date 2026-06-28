"""Horizon validator wrapper.

Canonical implementation lives in `canon/horizon/09_HORIZON_VALIDATOR.py`.
This wrapper provides a stable entrypoint for tooling.
"""

from __future__ import annotations

import argparse
import pathlib
import runpy
import sys


def main() -> None:
    parser = argparse.ArgumentParser(description="Run the canonical Horizon validator.")
    mode = parser.add_mutually_exclusive_group()
    mode.add_argument("--strict", action="store_true", help="Fail when the canonical validator target is missing.")
    mode.add_argument("--optional", action="store_true", help="Warn and exit 0 when the canonical validator target is missing.")
    parser.add_argument("--repo-root", default=None, help="Repository root. Defaults to this wrapper's parent repo.")
    args = parser.parse_args()

    repo_root = pathlib.Path(args.repo_root).resolve() if args.repo_root else pathlib.Path(__file__).resolve().parents[1]
    target = repo_root / "canon" / "horizon" / "09_HORIZON_VALIDATOR.py"
    optional = args.optional

    if not target.exists():
        message = f"MISSING_CANONICAL_TARGET: Horizon validator target missing: {target}"
        if optional:
            print(f"WARN: {message}")
            sys.exit(0)
        print(message)
        sys.exit(1)

    mode_arg = "--optional" if optional else "--strict"
    sys.argv = [str(target), mode_arg, "--repo-root", str(repo_root)]
    runpy.run_path(str(target), run_name="__main__")


if __name__ == "__main__":
    main()
