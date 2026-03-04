#!/usr/bin/env python3
"""Generic controlled importer for baseline reference shards."""

from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path
from zipfile import ZipFile

REPO_ROOT = Path(__file__).resolve().parent.parent
ARCHIVE = REPO_ROOT / 'Versions' / 'baseline.zip'
SHARD_REGISTRY = REPO_ROOT / 'ingest' / 'shard_registry.json'


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description='Run controlled import for a configured shard.')
    parser.add_argument('shard_id', help='Shard ID from ingest/shard_registry.json (e.g. 1, 2, 3).')
    return parser.parse_args()


def _allowed(path: str, patterns: list[str], match_mode: str) -> bool:
    if match_mode == 'exact':
        return path in patterns
    for pattern in patterns:
        if path == pattern or path.startswith(pattern):
            return True
    return False


def main() -> None:
    args = parse_args()

    if not ARCHIVE.exists():
        raise SystemExit(f'missing archive: {ARCHIVE}')
    if not SHARD_REGISTRY.exists():
        raise SystemExit(f'missing shard registry: {SHARD_REGISTRY}')

    registry = json.loads(SHARD_REGISTRY.read_text(encoding='utf-8'))
    shards: dict[str, dict[str, object]] = registry.get('shards', {})
    if args.shard_id not in shards:
        known = ', '.join(sorted(shards.keys()))
        raise SystemExit(f'unknown shard id: {args.shard_id}; known shards: {known}')

    shard = shards[args.shard_id]
    patterns = [str(pattern) for pattern in shard.get('patterns', [])]
    if not patterns:
        raise SystemExit(f'shard {args.shard_id} has no patterns configured')

    match_mode = str(shard.get('match_mode', 'prefixes'))
    out_root = REPO_ROOT / str(shard['target_root'])
    manifest_path = REPO_ROOT / str(shard['manifest_path'])

    imported: list[dict[str, object]] = []
    skipped_dirs = 0

    with ZipFile(ARCHIVE) as zipf:
        for info in zipf.infolist():
            src = info.filename
            if not _allowed(src, patterns, match_mode):
                continue
            if src.endswith('/'):
                skipped_dirs += 1
                continue

            payload = zipf.read(src)
            rel = src.removeprefix('baseline/')
            target = out_root / rel
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes(payload)

            imported.append(
                {
                    'source_path': src,
                    'target_path': str(target.relative_to(REPO_ROOT)),
                    'bytes': info.file_size,
                    'sha256': hashlib.sha256(payload).hexdigest(),
                }
            )

    manifest = {
        'phase': str(shard['phase']),
        'source_archive': str(ARCHIVE.relative_to(REPO_ROOT)),
        'target_root': str(out_root.relative_to(REPO_ROOT)),
        'imported_files': len(imported),
        'skipped_directories': skipped_dirs,
        'entries': imported,
    }

    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(f'Imported files: {len(imported)}')
    print(f'Manifest: {manifest_path}')


if __name__ == '__main__':
    main()
