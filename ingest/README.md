# Baseline Ingest (Phase 0)

Эта директория хранит артефакты первичной трассировки импорта из `Versions/baseline.zip`.

## Файлы
- `baseline_coverage_manifest.json` — полный список entry архива с planned action.
- `security_scan_report.json` — первичный security-scan по сигнатурам секретов и binary payload.
- `rename_map.json` — карта нормализации путей (пока пусто).
- `phase1_classification.json` — сводка классификации по Truth Ladder и вход для governance-gate.

## Регенерация
```bash
python tools/generate_baseline_manifest.py
python tools/build_phase1_classification.py
python tools/import_phase1_shard.py 1
python tools/import_phase1_shard.py 2
python tools/import_phase1_shard.py 3
# standalone scripts:
python tools/import_phase1_shard1.py
python tools/import_phase1_shard2.py
python tools/import_phase1_shard3.py
python tools/check_shard_registry_consistency.py
```

## PR-C / Shard #1
- Scope: reference/non-canon материалы (`customgptSot` + `projectsgptSot` eval/metrics/tools subset).
- Import manifest: `ingest/shard1_import_manifest.json`.
- Target root: `reference/baseline_shard1/`.


## PR-C / Shard #2
- Scope: additional `customgptSot/knowledge` reference files (non-canon staging).
- Import manifest: `ingest/shard2_import_manifest.json`.
- Target root: `reference/baseline_shard2/`.


## PR-C / Shard #3
- Scope: `repoSot` high-level reference docs/reports (non-canon staging).
- Import manifest: `ingest/shard3_import_manifest.json`.
- Target root: `reference/baseline_shard3/`.

## Governance Gate
Проверка ADR-гейта для Tier-1:
```bash
python tools/check_core_adr_gate.py <changed files>
```

## Политика
- Изменения `core/*` помечаются как `review` и требуют ADR-gate.
- Бинарные payload не импортируются напрямую в репозиторий; применяем attestation-подход.
