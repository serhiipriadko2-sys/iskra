A Intake — хочу закрепить "prompts as code".

B SIFT
- Факт: можно хранить эталонные ответы в репо.
- Интерпретация: эталон = тест, регрессия = падение.

C Frame
- Путь 1: golden ответы + статические линтеры (дешево).
- Путь 2: эталонные входы + модельные ответы + автоматическое сравнение (точнее).

D Step
- Завести manifest кейсов и минимальный dashboard.

E Verify
- PASS/FAIL: PASS если dashboard формируется и содержит cases_total >= 1.

F Close
∆DΩΛ
∆: "prompts as code" = версия, кейс, прогон, отчёт.
D: evals/cases/manifest.json, evals/dashboard.schema.json.
Ω: 70%
Λ: добавить сравнение метрик alive_index против baseline.
