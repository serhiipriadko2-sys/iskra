#!/usr/bin/env python3
"""Controlled import shard #2 (reference/non-canon) from Versions/baseline.zip."""

from __future__ import annotations

import hashlib
import json
from pathlib import Path
from zipfile import ZipFile

REPO_ROOT = Path(__file__).resolve().parent.parent
ARCHIVE = REPO_ROOT / 'Versions' / 'baseline.zip'
OUT_ROOT = REPO_ROOT / 'reference' / 'baseline_shard2'
MANIFEST_PATH = REPO_ROOT / 'ingest' / 'shard2_import_manifest.json'

PREFIXES = [
    'baseline/customgptSot/iskra_canon_gpt_stack_v2.3.0/iskra_canon_gpt_stack_v2.3.0/knowledge/02_CORE_MANTRA_TELOS_PRINCIPLES.md',
    'baseline/customgptSot/iskra_canon_gpt_stack_v2.3.0/iskra_canon_gpt_stack_v2.3.0/knowledge/03_CORE_IDENTITY_LIBER.md',
    'baseline/customgptSot/iskra_canon_gpt_stack_v2.3.0/iskra_canon_gpt_stack_v2.3.0/knowledge/04_CORE_VOICES_OVERVIEW.md',
    'baseline/customgptSot/iskra_canon_gpt_stack_v2.3.0/iskra_canon_gpt_stack_v2.3.0/knowledge/05_CORE_VOICES_MONOGRAPHS_A.md',
    'baseline/customgptSot/iskra_canon_gpt_stack_v2.3.0/iskra_canon_gpt_stack_v2.3.0/knowledge/05B_CORE_VOICES_MONOGRAPHS_B.md',
    'baseline/customgptSot/iskra_canon_gpt_stack_v2.3.0/iskra_canon_gpt_stack_v2.3.0/knowledge/06_SYSTEM_SIFT.md',
    'baseline/customgptSot/iskra_canon_gpt_stack_v2.3.0/iskra_canon_gpt_stack_v2.3.0/knowledge/08_SYSTEM_SECURITY.md',
    'baseline/customgptSot/iskra_canon_gpt_stack_v2.3.0/iskra_canon_gpt_stack_v2.3.0/knowledge/09_SYSTEM_COUNCIL_PROTOCOL.md',
    'baseline/customgptSot/iskra_canon_gpt_stack_v2.3.0/iskra_canon_gpt_stack_v2.3.0/knowledge/10_SYSTEM_PROTOCOLS_PLAYBOOKS.md',
    'baseline/customgptSot/iskra_canon_gpt_stack_v2.3.0/iskra_canon_gpt_stack_v2.3.0/knowledge/11_SYSTEM_WORKFLOW_OPS.md',
    'baseline/customgptSot/iskra_canon_gpt_stack_v2.3.0/iskra_canon_gpt_stack_v2.3.0/knowledge/12_SYSTEM_ARCHITECTURE.md',
    'baseline/customgptSot/iskra_canon_gpt_stack_v2.3.0/iskra_canon_gpt_stack_v2.3.0/knowledge/13_SYSTEM_INTEGRITY.md',
    'baseline/customgptSot/iskra_canon_gpt_stack_v2.3.0/iskra_canon_gpt_stack_v2.3.0/knowledge/14_METRICS_BUNDLE.md',
    'baseline/customgptSot/iskra_canon_gpt_stack_v2.3.0/iskra_canon_gpt_stack_v2.3.0/knowledge/15_METRICS_QUALITY_EVAL.md',
    'baseline/customgptSot/iskra_canon_gpt_stack_v2.3.0/iskra_canon_gpt_stack_v2.3.0/knowledge/16_METRICS_SLO_GUARD.md',
    'baseline/customgptSot/iskra_canon_gpt_stack_v2.3.0/iskra_canon_gpt_stack_v2.3.0/knowledge/17_GOVERNANCE_PACK.md',
    'baseline/customgptSot/iskra_canon_gpt_stack_v2.3.0/iskra_canon_gpt_stack_v2.3.0/knowledge/19_SPACE_CHARTER_INTERFACE_STYLE.md',
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
        'phase': 'phase1_shard2_reference_import',
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
