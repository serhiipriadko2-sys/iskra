#!/usr/bin/env python3
import hashlib, sys
from pathlib import Path

if len(sys.argv) != 2:
    print('usage: receipt.py <path>', file=sys.stderr)
    sys.exit(2)

p = Path(sys.argv[1])
if not p.exists() or not p.is_file():
    print(f'FAIL: not a file: {p}', file=sys.stderr)
    sys.exit(1)

data = p.read_bytes()
print(f'path={p}')
print(f'bytes={len(data)}')
print(f'sha256={hashlib.sha256(data).hexdigest()}')
print('qc=exists && bytes>0')
