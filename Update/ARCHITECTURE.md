---
sigil: system__ARCHITECTURE.md
doc_type: reference
layer: system
status: sot40_stub
updated: 2026-02-07
---

# SYSTEM/ARCHITECTURE · SoT40 stub

Этот файл оставлен **как якорь пути** (многие тексты канона ссылаются на `SYSTEM/ARCHITECTURE.md`).

В SoT40 мы держим **минимальную, проверяемую архитектуру**. Детализацию и философию — в соседних свитках.

## 1) Иерархия управления (фикс)

`SECURITY → METRICS → SLO‑GUARD → PLAYBOOK → COUNCIL → VOICE → РЕЧЬ → COMMIT`

- SECURITY: запреты/редиректы (`SYSTEM/SECURITY.md`)
- METRICS: обновление сигналов (`METRICS/METRICS_BUNDLE.md`)
- SLO‑GUARD: решение `PROCEED | FORCE_* | CLOSE_HONESTLY` (`SYSTEM/SLO_GUARD.md`)
- PLAYBOOK: поведенческий контейнер `ROUTINE | SHADOW | CRISIS` (`SYSTEM/PLAYBOOKS_vNext.md`)
- COUNCIL: арбитраж v0.1 + anti‑dryness (`SYSTEM/COUNCIL_PROTOCOL.md`)
- VOICE: триггеры и роли (`CORE/VOICES.md`)
- РЕЧЬ: ритм/температуры (`CANON_FULL/8_INTERFACE_STYLE.md`)
- COMMIT: шаг + PASS/FAIL (канон протокола)

## 2) Где лежит «полная» схема

- Механика исполнения и рантайм‑цикл: `SYSTEM/COGNITIVE_ARCHITECTURE.md`
- Карта стека и входы: `PROJECTS/INDEX.md` + `PROJECTS/00_ROUTER.md`
- Retrieval/источник истины: `SYSTEM/RAG_ENGINE.md`
- Инциденты/варианты поведения: `MIND/WHAT_IF_MATRIX.md`

## 3) Опциональный граф‑слой

Если канон разросся и нужна объяснимая «сеть связей»:
- GraphRAG readiness + Adaptive Council (BETA): `SYSTEM/COUNCIL_GRAPH_PACK.md`

Статус: *optional*. По умолчанию не включается.

### Horizon (Darkrun-First Validation)

Для защиты канона от "тихих регрессий" и контроля сдвига метапространства:
- **Darkrun-first pattern**: propose → validate → commit (без записи до проверки)
- **Epoch management**: каждый commit инкрементирует эпоху; снапшоты в JSONL
- **Entropy guard**: Shannon entropy по символам; блокировка при превышении порога
- **Full-density guard**: проверка baseline размеров файлов канона (ratio bytes/lines)
- **Phase network topology**: граф фаз + динамические связи с квотами
- **Direction spawning**: генерация символов направлений из пула с лимитами
- **Ritual generation**: маркировка моментов "сдвига горизонта"

**Contract model**: все квоты/пороги вынесены в `canon/horizon/HORIZON_CONTRACT.json` (meta_permission_required, max_edges, entropy_nats_max, full_density_min_ratio).

**SoT40 связь**: см. `CANON_FULL/7_SYSTEM_INTEGRITY.md` §HORIZON для детальной интеграции с SECURITY/SLO-GUARD/METRICS/COUNCIL.

Статус: *optional module*. Реализация на Python.

---

**Правило SoT40:** этот файл не раздуваем — это навигационный якорь и минимальный каркас.
