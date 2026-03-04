#!/usr/bin/env python3
"""Controlled import shard #3 (reference/non-canon) from Versions/baseline.zip."""

from __future__ import annotations

import hashlib
import json
from pathlib import Path
from zipfile import ZipFile

REPO_ROOT = Path(__file__).resolve().parent.parent
ARCHIVE = REPO_ROOT / 'Versions' / 'baseline.zip'
OUT_ROOT = REPO_ROOT / 'reference' / 'baseline_shard3'
MANIFEST_PATH = REPO_ROOT / 'ingest' / 'shard3_import_manifest.json'

PREFIXES = [
    'baseline/repoSot/CONTRIBUTING.md',
    'baseline/repoSot/DEEP_AUDIT_REPORT_v5.md',
    'baseline/repoSot/ECOSYSTEM_AUDIT_2025.md',
    'baseline/repoSot/FINAL_SUMMARY.md',
    'baseline/repoSot/FULL_CHECK_REPORT_2026-03-01.md',
    'baseline/repoSot/ISKRA_MANIFEST.md',
    'baseline/repoSot/LIBER_INITIUM.md',
    'baseline/repoSot/LICENSE',
    'baseline/repoSot/README.md',
    'baseline/repoSot/ROADMAP_2025_2026.md',
    'baseline/repoSot/ROADMAP_SCIENTIFIC_TURN.md',
    'baseline/repoSot/SCIENTIFIC_ANALYSIS_ISKRA.md',
]


def allowed(path: str) -> bool:
    for prefix in PREFIXES:
        if path == prefix or path.startswith(prefix):
            return True
    return False


def main() -> None:
    if not ARCHIVE.exists():
        raise SystemExit(f'missing archive: {ARCHIVE}')

    imported: list[dict[str, object]] = []
    skipped_dirs = 0

    with ZipFile(ARCHIVE) as zipf:
        for info in zipf.infolist():
            src = info.filename
            if not allowed(src):
                continue
            if src.endswith('/'):
                skipped_dirs += 1
                continue

            payload = zipf.read(src)
            rel = src.removeprefix('baseline/')
            target = OUT_ROOT / rel
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
        'phase': 'phase1_shard3_reference_import',
        'source_archive': str(ARCHIVE.relative_to(REPO_ROOT)),
        'target_root': str(OUT_ROOT.relative_to(REPO_ROOT)),
        'imported_files': len(imported),
        'skipped_directories': skipped_dirs,
        'entries': imported,
    }

    MANIFEST_PATH.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(f"Imported files: {len(imported)}")
    print(f"Manifest: {MANIFEST_PATH}")


if __name__ == '__main__':
    main()
