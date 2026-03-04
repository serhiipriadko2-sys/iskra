#!/usr/bin/env python3
"""Controlled import shard #1 (reference/non-canon) from Versions/baseline.zip."""

from __future__ import annotations

import hashlib
import json
from pathlib import Path
from zipfile import ZipFile

REPO_ROOT = Path(__file__).resolve().parent.parent
ARCHIVE = REPO_ROOT / 'Versions' / 'baseline.zip'
OUT_ROOT = REPO_ROOT / 'reference' / 'baseline_shard1'
MANIFEST_PATH = REPO_ROOT / 'ingest' / 'shard1_import_manifest.json'

PREFIXES = [
    'baseline/customgptSot/iskra_canon_gpt_stack_v2.3.0/iskra_canon_gpt_stack_v2.3.0/UPLOAD_GUIDE.md',
    'baseline/customgptSot/iskra_canon_gpt_stack_v2.3.0/iskra_canon_gpt_stack_v2.3.0/builder/INSTRUCTIONS_CANON.md',
    'baseline/customgptSot/iskra_canon_gpt_stack_v2.3.0/iskra_canon_gpt_stack_v2.3.0/evals/',
    'baseline/customgptSot/iskra_canon_gpt_stack_v2.3.0/iskra_canon_gpt_stack_v2.3.0/ops/',
    'baseline/customgptSot/iskra_canon_gpt_stack_v2.3.0/iskra_canon_gpt_stack_v2.3.0/knowledge/00_README_FOR_GPT.md',
    'baseline/customgptSot/iskra_canon_gpt_stack_v2.3.0/iskra_canon_gpt_stack_v2.3.0/knowledge/01_INDEX_ROUTER.md',
    'baseline/customgptSot/iskra_canon_gpt_stack_v2.3.0/iskra_canon_gpt_stack_v2.3.0/knowledge/18_CUSTOM_GPT_OPENAI_ADAPTER.md',
    'baseline/projectsgptSot/CHECKPOINT_MANIFEST.json',
    'baseline/projectsgptSot/evals/',
    'baseline/projectsgptSot/metrics/',
    'baseline/projectsgptSot/packs/evals/',
    'baseline/projectsgptSot/system/metrics_project_runner.md',
    'baseline/projectsgptSot/tools/',
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
        'phase': 'phase1_shard1_reference_import',
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
