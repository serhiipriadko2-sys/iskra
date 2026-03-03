#!/usr/bin/env python3
"""Fail if core/* changes are present without ADR changes in the same file list."""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

ADR_PATH_PREFIXES = ('governance/adr', 'Versions/Fullspark/ADR')


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description='Validate ADR gate for core changes.')
    parser.add_argument('files', nargs='*', help='Changed file paths relative to repo root.')
    return parser.parse_args()


def main() -> int:
    args = parse_args()

    changed_files = [Path(file).as_posix() for file in args.files if file.strip()]
    if not changed_files:
        print('ADR gate: no files provided; pass')
        return 0

    core_changes = [file for file in changed_files if file.startswith('core/')]
    adr_changes = [
        file for file in changed_files if file.startswith(ADR_PATH_PREFIXES)
    ]

    if core_changes and not adr_changes:
        print('ADR gate: FAIL')
        print('core/* changes detected without ADR updates:')
        for file in core_changes:
            print(f' - {file}')
        print('Expected at least one ADR file change under governance/adr* or Versions/Fullspark/ADR*')
        return 1

    print('ADR gate: PASS')
    print(f'core changes: {len(core_changes)}, adr changes: {len(adr_changes)}')
    return 0


if __name__ == '__main__':
    sys.exit(main())
