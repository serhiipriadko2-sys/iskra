"""Horizon validator wrapper.

Canonical implementation lives in `canon/horizon/09_HORIZON_VALIDATOR.py`.
This wrapper provides a stable entrypoint for tooling.
"""

from __future__ import annotations

import pathlib
import runpy
import sys


def main() -> None:
    repo_root = pathlib.Path(__file__).resolve().parents[1]
    # NOTE: Some snapshots omit Horizon canon files. This wrapper must not crash in that case.
    target = repo_root / 'canon' / 'horizon' / '09_HORIZON_VALIDATOR.py'
    if not target.exists():
        print(f"WARN: Horizon validator target missing: {target}. Skipping.")
        sys.exit(0)
    runpy.run_path(str(target), run_name='__main__')


if __name__ == '__main__':
    main()
