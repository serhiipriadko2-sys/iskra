"""Horizon weaver wrapper.

Canonical implementation lives in `canon/horizon/09_HORIZON_WEAVER.py`.
This wrapper provides a stable entrypoint for tooling.
"""

from __future__ import annotations

import pathlib
import runpy


def main() -> None:
    repo_root = pathlib.Path(__file__).resolve().parents[1]
    target = repo_root / 'canon' / 'horizon' / '09_HORIZON_WEAVER.py'
    runpy.run_path(str(target), run_name='__main__')


if __name__ == '__main__':
    main()
