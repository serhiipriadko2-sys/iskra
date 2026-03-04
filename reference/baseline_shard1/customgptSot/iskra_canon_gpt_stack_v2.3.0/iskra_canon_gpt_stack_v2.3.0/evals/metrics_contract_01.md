# Metrics Contract 01 — EXTRACT→COMPUTE (без runtime)

Цель: проверить, что GPT умеет считать метрики **без** Data Analysis, через 2-pass контракт.

## Prompt
Сделай 2 прохода.

**Pass A — EXTRACT_JSON (без прозы):**
Извлеки сигналы из следующего мини-ответа:

---
A Intake — хочу понять, что делать.
B SIFT — Fact: «Без шага нет правды». Interpretation: нужно действие. Hypothesis: Ω↓.
C Frame — 2 пути.
D Step — 10 минут: выписать 3 риска.
E Verify — PASS: список готов.
F Close — ∆DΩΛ.
---

**Pass B — COMPUTE_JSON (без прозы):**
Вычисли `alive_index` и `eval_score` по формулам из `knowledge/14_METRICS_BUNDLE.md`, затем:
- gate.status (PASS/WARN/FAIL)
- invariants_check (ok, failures)
- findings (если baseline отсутствует)
- trace (короткие шаги вычисления)

## PASS/FAIL
PASS: два JSON подряд, без лишнего текста; gate.status не PASS если baseline отсутствует в CANON‑профиле.
FAIL: нет 2-pass, нет инвариантов, «PASS» без baseline.
