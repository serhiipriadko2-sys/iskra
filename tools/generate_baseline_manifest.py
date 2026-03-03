#!/usr/bin/env python3
"""Generate baseline coverage and security scan manifests from Versions/baseline.zip."""

from __future__ import annotations

import hashlib
import json
import re
from dataclasses import dataclass
from pathlib import Path
from zipfile import ZipFile

REPO_ROOT = Path(__file__).resolve().parent.parent
BASELINE_ZIP = REPO_ROOT / 'Versions' / 'baseline.zip'
INGEST_DIR = REPO_ROOT / 'ingest'
COVERAGE_FILE = INGEST_DIR / 'baseline_coverage_manifest.json'
SECURITY_FILE = INGEST_DIR / 'security_scan_report.json'
RENAME_FILE = INGEST_DIR / 'rename_map.json'

SECRET_PATTERNS = {
    'openai_key_like': re.compile(r'sk-[A-Za-z0-9]{20,}'),
    'jwt_like': re.compile(r'eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}'),
    'aws_access_key_like': re.compile(r'AKIA[0-9A-Z]{16}'),
}


@dataclass
class EntrySummary:
    source_path: str
    bytes: int
    sha256: str
    target_path: str
    action: str
    reason: str
    tier: str
    is_binary: bool


def classify_tier(path: str) -> str:
    if '/core/' in path:
        return 'tier1_core_candidate'
    if '/ledger/' in path:
        return 'tier2_ledger_candidate'
    if '/governance/' in path:
        return 'tier3_governance_candidate'
    if '/system/' in path:
        return 'tier4_system_candidate'
    if '/metrics/' in path:
        return 'tier5_metrics_candidate'
    if '/mind/' in path:
        return 'tier6_mind_candidate'
    if '/appendix/' in path:
        return 'tier7_appendix_candidate'
    return 'reference_or_external'


def planned_action(path: str) -> tuple[str, str]:
    if path.endswith('/'):
        return 'skip', 'directory entry'
    if '/tools/__pycache__/' in path:
        return 'skip', 'derived cache artifact'
    if '/core/' in path:
        return 'review', 'core changes require ADR gate'
    return 'import', 'eligible for staged import'


def detect_binary(blob: bytes) -> bool:
    if b'\x00' in blob:
        return True
    sample = blob[:2048]
    control = sum(1 for b in sample if b < 9 or (13 < b < 32))
    return len(sample) > 0 and control / len(sample) > 0.30


def main() -> None:
    if not BASELINE_ZIP.exists():
        raise SystemExit(f'Missing archive: {BASELINE_ZIP}')

    INGEST_DIR.mkdir(parents=True, exist_ok=True)

    entries: list[EntrySummary] = []
    scan_findings: list[dict[str, object]] = []

    with ZipFile(BASELINE_ZIP) as archive:
        for info in archive.infolist():
            source_path = info.filename
            if source_path.endswith('/'):
                entries.append(
                    EntrySummary(
                        source_path=source_path,
                        bytes=0,
                        sha256='',
                        target_path='',
                        action='skip',
                        reason='directory entry',
                        tier=classify_tier(source_path),
                        is_binary=False,
                    )
                )
                continue

            payload = archive.read(source_path)
            digest = hashlib.sha256(payload).hexdigest()
            action, reason = planned_action(source_path)
            binary = detect_binary(payload)
            target_path = source_path.removeprefix('baseline/')

            entries.append(
                EntrySummary(
                    source_path=source_path,
                    bytes=info.file_size,
                    sha256=digest,
                    target_path=target_path,
                    action=action,
                    reason=reason,
                    tier=classify_tier(source_path),
                    is_binary=binary,
                )
            )

            if binary:
                scan_findings.append(
                    {
                        'type': 'binary_payload',
                        'path': source_path,
                        'bytes': info.file_size,
                    }
                )
                continue

            try:
                text = payload.decode('utf-8')
            except UnicodeDecodeError:
                text = payload.decode('latin-1', errors='ignore')

            for pattern_name, pattern in SECRET_PATTERNS.items():
                for match in pattern.finditer(text):
                    scan_findings.append(
                        {
                            'type': pattern_name,
                            'path': source_path,
                            'snippet': match.group(0)[:20],
                        }
                    )

    coverage_payload = {
        'source_archive': str(BASELINE_ZIP.relative_to(REPO_ROOT)),
        'entries_total': len(entries),
        'status': 'phase0_generated',
        'entries': [entry.__dict__ for entry in entries],
    }

    security_payload = {
        'source_archive': str(BASELINE_ZIP.relative_to(REPO_ROOT)),
        'entries_scanned': len(entries),
        'findings_total': len(scan_findings),
        'findings': scan_findings,
    }

    COVERAGE_FILE.write_text(json.dumps(coverage_payload, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    SECURITY_FILE.write_text(json.dumps(security_payload, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')

    if not RENAME_FILE.exists():
        RENAME_FILE.write_text('[]\n', encoding='utf-8')

    print(f'Coverage entries: {len(entries)}')
    print(f'Security findings: {len(scan_findings)}')


if __name__ == '__main__':
    main()
