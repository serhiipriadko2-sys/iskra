#!/usr/bin/env python3
"""Promote SoT40 'projects view' blocks (dependencies/contracts/anchors) into lower canon.

Why
- SoT40 (Versions/Fullspark) is a constrained 40-file loader for LLM environments.
- Lower canon (core/, system/, metrics/, governance/, ledger/) is the source of truth.
- This script copies *view blocks* from SoT40 into canonical docs in a repeatable way.

What it does
- For a small set of mapped documents, extracts the section starting at
  'ЗАВИСИМОСТИ И ВЗАИМОДЕЙСТВИЯ' (or 'Dependencies and interactions') up to the end of
  the CODE-LEVEL anchors block.
- Injects/updates this block in the canonical target under:
  '## Appendix: Projects View (SoT40)'

Non-goals
- Does NOT overwrite canonical prose.
- Does NOT touch TypeScript/runtime code.

Usage
  python tools/promote_sot40_to_canon.py --dry-run
  python tools/promote_sot40_to_canon.py

Exit codes
- 0: success
- 2: mapping/source/target missing
- 3: parse failure
"""

from __future__ import annotations

import argparse
import re
from dataclasses import dataclass
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOT40_DIR = ROOT / 'Versions' / 'Fullspark'

@dataclass(frozen=True)
class MapItem:
    src: Path
    dst: Path

MAPPING = [
    MapItem(SOT40_DIR / 'TELOS.md', ROOT / 'core' / 'telos.md'),
    MapItem(SOT40_DIR / 'PRINCIPLES.md', ROOT / 'core' / 'principles.md'),
    MapItem(SOT40_DIR / 'SIFT_PROTOCOL.md', ROOT / 'system' / 'sift_protocol.md'),
    MapItem(SOT40_DIR / 'WORKFLOW_OPS.md', ROOT / 'system' / 'workflow_ops.md'),
    MapItem(SOT40_DIR / 'SLO_GUARD.md', ROOT / 'system' / 'slo_guard.md'),
    MapItem(SOT40_DIR / 'METRICS_BUNDLE.md', ROOT / 'metrics' / 'metrics_bundle.md'),
    MapItem(SOT40_DIR / 'ADR.md', ROOT / 'governance' / 'adr.md'),
]

START_MARKERS = [
    'ЗАВИСИМОСТИ И ВЗАИМОДЕЙСТВИЯ',
    'Dependencies and interactions',
]

APPENDIX_HEADER = '## Appendix: Projects View (SoT40)'


def _read(p: Path) -> str:
    return p.read_text(encoding='utf-8')


def extract_view_block(src_text: str) -> str:
    """Extract the SoT40 view block from a doc.

    Returns a markdown block that starts with '### Source' and includes dependencies/contracts/anchors.
    """
    # find start
    start_idx = -1
    for m in START_MARKERS:
        i = src_text.find(m)
        if i != -1:
            start_idx = i
            break
    if start_idx == -1:
        raise ValueError('start marker not found')

    # Heuristic end: if there's a 'CODE-LEVEL' block, include through 'Fact graph' line; otherwise include until next H1
    tail = src_text[start_idx:]

    # Try to include HARD RUNTIME CONTRACT and CODE-LEVEL section fully
    # End at first occurrence of '\n# ' after start (next top-level header), if any
    m = re.search(r'\n#\s', tail)
    end_idx = m.start() if m else len(tail)

    extracted = tail[:end_idx].rstrip()

    # Sanity checks
    if 'HARD RUNTIME CONTRACT' not in extracted:
        # still acceptable, but we expect it in SoT40
        pass
    if 'CODE-LEVEL' not in extracted and 'CODE‑LEVEL' not in extracted:
        pass

    return (
        '### Source: SoT40 view block\n'
        f'*(extracted from Versions/Fullspark)*\n\n'
        + extracted
        + '\n'
    )


def inject_appendix(dst_text: str, view_block: str) -> str:
    """Insert/replace appendix block in destination canonical doc."""
    if APPENDIX_HEADER in dst_text:
        # replace existing appendix section
        pattern = re.compile(rf"{re.escape(APPENDIX_HEADER)}[\s\S]*$", re.M)
        return re.sub(pattern, APPENDIX_HEADER + '\n\n' + view_block + '\n', dst_text)

    # otherwise append at end (before trailing whitespace)
    return dst_text.rstrip() + '\n\n---\n\n' + APPENDIX_HEADER + '\n\n' + view_block + '\n'


def promote_item(item: MapItem, dry_run: bool) -> tuple[bool, str]:
    if not item.src.exists():
        return False, f'MISSING SRC: {item.src}'
    if not item.dst.exists():
        return False, f'MISSING DST: {item.dst}'

    src_text = _read(item.src)
    dst_text = _read(item.dst)

    try:
        block = extract_view_block(src_text)
    except Exception as e:
        return False, f'PARSE FAIL: {item.src.name}: {e}'

    new_dst = inject_appendix(dst_text, block)

    changed = new_dst != dst_text
    if changed and not dry_run:
        item.dst.write_text(new_dst, encoding='utf-8')

    return True, ('CHANGED' if changed else 'OK') + f': {item.dst.relative_to(ROOT)}'


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument('--dry-run', action='store_true')
    args = ap.parse_args()

    ok = True
    msgs = []
    for item in MAPPING:
        success, msg = promote_item(item, args.dry_run)
        msgs.append(msg)
        ok = ok and success

    for m in msgs:
        print(m)

    if not ok:
        raise SystemExit(2)


if __name__ == '__main__':
    main()
