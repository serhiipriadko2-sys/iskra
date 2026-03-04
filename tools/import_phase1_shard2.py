#!/usr/bin/env python3
"""Compatibility wrapper for controlled import shard #2."""

from __future__ import annotations

import subprocess
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
SCRIPT = REPO_ROOT / 'tools' / 'import_phase1_shard.py'

if __name__ == '__main__':
    raise SystemExit(subprocess.call([sys.executable, str(SCRIPT), '2']))
