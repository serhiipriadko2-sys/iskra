#!/usr/bin/env python3
import sys
from pathlib import Path

if len(sys.argv) != 2:
    print('usage: validate_adoml.py <markdown-file>', file=sys.stderr)
    sys.exit(2)

text = Path(sys.argv[1]).read_text(encoding='utf-8')
required = ['∆:', 'D:', 'Ω:', 'Λ:']
missing = [x for x in required if x not in text]
if missing:
    print('FAIL missing ' + ', '.join(missing))
    sys.exit(1)
print('PASS ∆DΩΛ fields present')
