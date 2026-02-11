# Отчет о состоянии SOT (Source of Truth)

**Дата отчета**: 2026-02-12
**Версия SOT**: `vΩ.SoT40.2` (от 2026-02-09)
**Статус целостности**: ✅ **VERIFIED** (345 файлов, хеши совпадают)

## 1. Основные характеристики
- **Манифест**: `ISKRA_MANIFEST.md` (vΩ.10.0).
- **Реестр**: `ledger/sot.json` (версия `sot-ledger/1`).
- **Лог изменений**: `governance/changelog.md` (последняя запись vΩ.SoT40.2).

## 2. Ключевые изменения (vΩ.SoT40.2)
- **Консолидация**: Файлы из временной папки `Update/` перенесены в канонические разделы (`core`, `system`, `governance`, `metrics`, `mind`).
- **Лимит SoT40**: Поддерживается структура из ~40 ключевых файлов, определяющих ядро системы.
- **Новые модули**:
  - **Horizon**: Добавлена документация (vΩ.3.10-sot40).
  - **Council Graph Pack**: Добавлен каркас связей GraphRAG (`SYSTEM/COUNCIL_GRAPH_PACK.md`).
- **Очистка**: Удалены дубликаты и устаревшие файлы (cleanup).

## 3. Структура SOT (по разделам)
*   **Core (Ядро)**:
    *   Обновлены: `telos.md`, `principles.md`, `mantra.md`, `voices.md`.
    *   Сохранены: `busido_iskry.txt`, `liber_ignis.txt`.
*   **System (Система)**:
    *   Обновлены: `architecture.md`, `cognitive_architecture.md`.
    *   Добавлены: `council_graph_pack.md`.
*   **Governance (Управление)**:
    *   Обновлены: `changelog.md`, `memory_stack.md`.
*   **Metrics (Метрики)**:
    *   Актуализированы: `metrics_bundle.md`, `indices.md`.

## 4. Техническая верификация
Выполнена проверка скриптом `tools/verify_ledger.py`:
```
Ledger OK (345 files)
```
Хеши всех отслеживаемых файлов совпадают с зафиксированными в реестре.

---
**Вывод**: SOT находится в **стабильном, целостном состоянии** (`vΩ.SoT40.2`), все последние изменения (Research, Horizon, SoT40 Refactoring) корректно интегрированы и верифицированы.
