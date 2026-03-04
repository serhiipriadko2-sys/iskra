#!/usr/bin/env python3
"""Validate ingest shard registry schema and consistency with manifests/ledger view."""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
INGEST_DIR = REPO_ROOT / 'ingest'
REGISTRY_FILE = INGEST_DIR / 'shard_registry.json'
COVERAGE_FILE = INGEST_DIR / 'baseline_coverage_manifest.json'
LEDGER_ENTRY_FILE = INGEST_DIR / 'ledger_entry_phase0.json'

VALID_MATCH_MODES = {'prefixes', 'exact'}


def load_json(path: Path) -> object:
    if not path.exists():
        raise SystemExit(f'missing required file: {path}')
    return json.loads(path.read_text(encoding='utf-8'))


def match_source(source_path: str, patterns: list[str], match_mode: str) -> bool:
    if match_mode == 'exact':
        return source_path in patterns
    return any(source_path == pattern or source_path.startswith(pattern) for pattern in patterns)


def validate_registry_schema(registry: object) -> tuple[list[str], dict[str, dict[str, object]]]:
    errors: list[str] = []
    if not isinstance(registry, dict):
        return ['registry root must be object'], {}

    shards = registry.get('shards')
    if not isinstance(shards, dict) or not shards:
        return ['registry.shards must be non-empty object'], {}

    compiled: dict[str, dict[str, object]] = {}
    for shard_id, raw in shards.items():
        shard_prefix = f'shard[{shard_id}]'

        if not isinstance(shard_id, str) or not re.fullmatch(r'\d+', shard_id):
            errors.append(f'{shard_prefix}: id must be numeric string')

        if not isinstance(raw, dict):
            errors.append(f'{shard_prefix}: config must be object')
            continue

        required = ['phase', 'target_root', 'manifest_path', 'match_mode', 'patterns']
        missing = [field for field in required if field not in raw]
        if missing:
            errors.append(f"{shard_prefix}: missing required fields: {', '.join(missing)}")
            continue

        phase = raw.get('phase')
        target_root = raw.get('target_root')
        manifest_path = raw.get('manifest_path')
        match_mode = raw.get('match_mode')
        patterns = raw.get('patterns')

        if not isinstance(phase, str) or not phase:
            errors.append(f'{shard_prefix}: phase must be non-empty string')

        if isinstance(phase, str) and not phase.startswith(f'phase1_shard{shard_id}_'):
            errors.append(f'{shard_prefix}: phase must start with phase1_shard{shard_id}_')

        if not isinstance(target_root, str) or not target_root.startswith('reference/'):
            errors.append(f'{shard_prefix}: target_root must start with reference/')

        if not isinstance(manifest_path, str) or not manifest_path.startswith('ingest/'):
            errors.append(f'{shard_prefix}: manifest_path must start with ingest/')

        if isinstance(manifest_path, str) and not manifest_path.endswith('_import_manifest.json'):
            errors.append(f'{shard_prefix}: manifest_path must end with _import_manifest.json')

        if match_mode not in VALID_MATCH_MODES:
            errors.append(f'{shard_prefix}: match_mode must be one of {sorted(VALID_MATCH_MODES)}')

        if not isinstance(patterns, list) or not patterns:
            errors.append(f'{shard_prefix}: patterns must be non-empty list')
            patterns = []

        string_patterns = [pattern for pattern in patterns if isinstance(pattern, str) and pattern]
        if len(string_patterns) != len(patterns):
            errors.append(f'{shard_prefix}: every pattern must be non-empty string')

        if len(string_patterns) != len(set(string_patterns)):
            errors.append(f'{shard_prefix}: duplicate patterns are not allowed')

        if any(not pattern.startswith('baseline/') for pattern in string_patterns):
            errors.append(f'{shard_prefix}: all patterns must start with baseline/')

        compiled[shard_id] = {
            'phase': phase,
            'target_root': target_root,
            'manifest_path': manifest_path,
            'match_mode': match_mode,
            'patterns': string_patterns,
        }

    return errors, compiled


def validate_consistency(
    shards: dict[str, dict[str, object]],
    coverage: object,
    ledger_entry: object,
) -> list[str]:
    errors: list[str] = []

    if not isinstance(coverage, dict) or not isinstance(coverage.get('entries'), list):
        return ['coverage manifest must contain entries list']

    coverage_entries = coverage['entries']
    coverage_by_source = {
        entry.get('source_path'): entry for entry in coverage_entries if isinstance(entry, dict)
    }
    sources = [source for source in coverage_by_source if isinstance(source, str)]

    source_to_shards: dict[str, list[str]] = {}

    for shard_id, shard in shards.items():
        patterns = shard['patterns']
        match_mode = shard['match_mode']
        matched = [source for source in sources if match_source(source, patterns, match_mode)]
        if not matched:
            errors.append(f'shard[{shard_id}] patterns match 0 entries in coverage manifest')
        for source in matched:
            source_to_shards.setdefault(source, []).append(shard_id)

        manifest_path = REPO_ROOT / str(shard['manifest_path'])
        if not manifest_path.exists():
            errors.append(f'shard[{shard_id}] missing manifest file: {manifest_path}')
            continue

        manifest = load_json(manifest_path)
        if not isinstance(manifest, dict):
            errors.append(f'shard[{shard_id}] manifest must be object')
            continue

        if manifest.get('phase') != shard['phase']:
            errors.append(f"shard[{shard_id}] phase mismatch: {manifest.get('phase')} != {shard['phase']}")

        if manifest.get('target_root') != shard['target_root']:
            errors.append(
                f"shard[{shard_id}] target_root mismatch: {manifest.get('target_root')} != {shard['target_root']}"
            )

        entries = manifest.get('entries')
        if not isinstance(entries, list):
            errors.append(f'shard[{shard_id}] manifest.entries must be list')
            continue

        if manifest.get('imported_files') != len(entries):
            errors.append(
                f"shard[{shard_id}] imported_files mismatch: {manifest.get('imported_files')} != {len(entries)}"
            )

        for index, entry in enumerate(entries):
            if not isinstance(entry, dict):
                errors.append(f'shard[{shard_id}] entry[{index}] must be object')
                continue

            source_path = entry.get('source_path')
            target_path = entry.get('target_path')
            if not isinstance(source_path, str):
                errors.append(f'shard[{shard_id}] entry[{index}] missing source_path')
                continue

            if not match_source(source_path, patterns, match_mode):
                errors.append(f'shard[{shard_id}] entry[{index}] source_path out of shard scope: {source_path}')

            if isinstance(target_path, str) and not target_path.startswith(f"{shard['target_root']}/"):
                errors.append(f'shard[{shard_id}] entry[{index}] target_path out of target_root: {target_path}')

            coverage_entry = coverage_by_source.get(source_path)
            if not isinstance(coverage_entry, dict):
                errors.append(f'shard[{shard_id}] entry[{index}] missing in coverage: {source_path}')
                continue

            if entry.get('sha256') != coverage_entry.get('sha256'):
                errors.append(f'shard[{shard_id}] entry[{index}] sha256 mismatch vs coverage: {source_path}')

            if entry.get('bytes') != coverage_entry.get('bytes'):
                errors.append(f'shard[{shard_id}] entry[{index}] bytes mismatch vs coverage: {source_path}')

    overlaps = {source: ids for source, ids in source_to_shards.items() if len(ids) > 1}
    if overlaps:
        sample = next(iter(overlaps.items()))
        errors.append(f'overlap detected: {sample[0]} matched by shards {sample[1]}')

    if isinstance(ledger_entry, dict):
        progress = ledger_entry.get('progress')
        if isinstance(progress, dict):
            manifest_total = 0
            for shard in shards.values():
                manifest_path = REPO_ROOT / str(shard['manifest_path'])
                if manifest_path.exists():
                    manifest = load_json(manifest_path)
                    if isinstance(manifest, dict) and isinstance(manifest.get('entries'), list):
                        manifest_total += len(manifest['entries'])

            imported_entries = progress.get('imported_entries')
            if isinstance(imported_entries, int) and imported_entries != manifest_total:
                errors.append(
                    f'ledger progress mismatch: imported_entries={imported_entries}, manifests_total={manifest_total}'
                )

            entries_total = progress.get('entries_total')
            if isinstance(entries_total, int) and isinstance(coverage.get('entries_total'), int):
                if entries_total != coverage.get('entries_total'):
                    errors.append(
                        f"ledger progress entries_total mismatch: {entries_total} != {coverage.get('entries_total')}"
                    )

            shards_completed = progress.get('shards_completed')
            existing_manifests = sum(
                1 for shard in shards.values() if (REPO_ROOT / str(shard['manifest_path'])).exists()
            )
            if isinstance(shards_completed, int) and shards_completed != existing_manifests:
                errors.append(
                    f'ledger progress shards_completed mismatch: {shards_completed} != {existing_manifests}'
                )

    return errors


def main() -> None:
    registry = load_json(REGISTRY_FILE)
    coverage = load_json(COVERAGE_FILE)
    ledger_entry = load_json(LEDGER_ENTRY_FILE)

    schema_errors, shards = validate_registry_schema(registry)
    consistency_errors = validate_consistency(shards, coverage, ledger_entry)
    errors = schema_errors + consistency_errors

    if errors:
        print('Shard registry consistency check: FAIL')
        for err in errors:
            print(f'- {err}')
        sys.exit(1)

    print(
        f'Shard registry consistency check: OK '
        f'({len(shards)} shards, {coverage.get("entries_total", "?")} coverage entries)'
    )


if __name__ == '__main__':
    main()

