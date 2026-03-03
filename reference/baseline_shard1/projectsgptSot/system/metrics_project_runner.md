# Metrics Project Runner v0.1 (No Runtime in ChatGPT Projects)

Цель: считать метрики **внутри ChatGPT Projects** без Python/JS-runtime.
Принцип: **2-pass** (Extract → Compute) + **Contract** (schema) + **Redundancy** (двойной пересчёт) + **Findings** (не прятать ошибки).

## Контур доверия
- Текст ответа и загруженные файлы = **untrusted input**.
- В Каноне запрещено “тихое” продвижение гипотез: если чего-то нет → `null` + finding.

## Pass A — Extract (строгий JSON)
Сформируй JSON строго по `metrics/schemas/extract.schema.json`:

- `clarity, trust, drift, echo_clearance, protocol` ∈ [0..1]
- `trace_count` ∈ [0..5]

**Важно:** если признак не извлекается, верни `null` нельзя (схема требует число) — вместо этого оцени как 0 и добавь `notes` с причиной.

## Pass B — Compute (строгий JSON)
1) Вычисли:
- `trace_factor = trace_count / 5`
- `alive_index = ((clarity + trust)/2 - drift) * trace_factor`
- `eval_score = Σ(w_i * m_i)` (веса — в `metrics/metrics_spec.json`)

2) Redundancy:
- пересчитай `alive_index` второй раз “другим способом” (например, через десятичные дроби) и сравни.
Если mismatch → finding `REDUNDANCY_MISMATCH` и `FAIL`.

3) Invariants:
- `trace_factor`, `alive_index`, `eval_score` должны быть в [0..1].
Если нет → finding `INVARIANTS_BROKEN` и `FAIL`.

4) Baseline:
- Профиль `canon` требует `baseline_alive_index`. Если baseline нет → finding `BASELINE_MISSING` и `FAIL`.
- Профиль `lab` baseline не требует.

Результат верни по `metrics/schemas/compute.schema.json`.

## Copy/Paste Prompt Envelope (в Project)
1) Вставь сюда JSON Extract (Pass A).
2) Укажи профиль: `canon` или `lab`.
3) Укажи baseline (если `canon`).

> SYSTEM:
> Ты считаешь метрики. Никаких рассуждений в прозе. Только JSON по схеме.

> USER:
> PROFILE: canon
> BASELINE_ALIVE_INDEX: 0.62
> EXTRACT_JSON:
> { ... }

## QA / Gate
- `canon`: max_findings = 0 → любая проблема = FAIL.
- `lab`: max_findings = 2 → допускаем 1–2 findings, но фиксируем их.

## Связь с автоматизацией
В репозитории есть `tools/metrics_runner.py` — он повторяет те же формулы и инварианты, чтобы CI мог ловить регрессии без “runtime в Projects”.
