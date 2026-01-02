# ADR-0001: Monorepo (SoT + runtime)

**Status:** Accepted  
**Date:** 2026-01-02

## Decision
Храним Source of Truth (SoT) и исполняемый код в **одном репозитории** (монорепо).

## Rationale
- проще стартовать и не потеряться новичку;
- изменения канона и кода можно фиксировать одним PR/коммитом;
- GitHub Actions можно таргетировать по путям (SoT отдельно от runtime).

## Consequences
- добавляем папку `runtime/` (код) и `tools/` (скрипты для ledger);
- CI SoT ограничиваем path-фильтрами, чтобы не гонять его на изменения runtime.
