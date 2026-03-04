#!/usr/bin/env python3
"""Build phase-1 classification and governance-gate input from ingest manifests."""

from __future__ import annotations

import json
from collections import Counter
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
INGEST_DIR = REPO_ROOT / 'ingest'
COVERAGE_FILE = INGEST_DIR / 'baseline_coverage_manifest.json'
SECURITY_FILE = INGEST_DIR / 'security_scan_report.json'
PHASE1_FILE = INGEST_DIR / 'phase1_classification.json'


def main() -> None:
    coverage = json.loads(COVERAGE_FILE.read_text(encoding='utf-8'))
    security = json.loads(SECURITY_FILE.read_text(encoding='utf-8'))

    entries: list[dict[str, object]] = coverage['entries']

    tier_counter = Counter(str(entry.get('tier', 'unknown')) for entry in entries)
    action_counter = Counter(str(entry.get('action', 'unknown')) for entry in entries)

    core_candidates = [
        {
            'source_path': entry['source_path'],
            'target_path': entry.get('target_path', ''),
            'reason': entry.get('reason', ''),
        }
        for entry in entries
        if str(entry.get('tier')) == 'tier1_core_candidate'
    ]

    binary_payloads = [
        finding for finding in security.get('findings', []) if finding.get('type') == 'binary_payload'
    ]

    phase1 = {
        'phase': 'phase1_classification',
        'source_archive': coverage.get('source_archive'),
        'entries_total': coverage.get('entries_total'),
        'counts': {
            'by_tier': dict(tier_counter),
            'by_action': dict(action_counter),
            'core_candidates': len(core_candidates),
            'security_findings': security.get('findings_total', 0),
            'binary_payloads': len(binary_payloads),
        },
        'governance_gate': {
            'requires_adr_for_core': True,
            'core_candidates': core_candidates,
        },
        'security_gate': {
            'findings': security.get('findings', []),
            'binary_payloads': binary_payloads,
        },
    }

    PHASE1_FILE.write_text(json.dumps(phase1, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(f"Phase1 classification written: {PHASE1_FILE}")


if __name__ == '__main__':
    main()
