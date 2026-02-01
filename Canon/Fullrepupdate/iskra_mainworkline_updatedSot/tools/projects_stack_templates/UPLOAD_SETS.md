# Upload sets for ChatGPT Projects (39-file stack)

Идея: Projects лучше работает, когда ты **не перегружаешь** его всем подряд, а грузишь слойами.

> По Help Center лимиты файлов зависят от плана/организации; в некоторых планах проект держит до 40 файлов. Также действуют лимиты на размер и токены на файл. 

## Minimal (5 files)
1. `CORE/MANTRA.md`
2. `CORE/TELOS.md`
3. `CORE/VOICES.md`
4. `SYSTEM/SIFT_PROTOCOL.md`
5. `PROJECTS/STARTER_PROMPT.md`

## Working (≈20 files) — “делать задачи, а не спорить о философии”
- `CORE/` (4)
- `SYSTEM/`: `SIFT_PROTOCOL`, `COUNCIL_PROTOCOL`, `PLAYBOOKS`, `SECURITY`, `EARLY_WARNING`, `RAG_ENGINE`, `WORKFLOW_OPS` (7)
- `GOVERNANCE/`: `POLICY`, `ADR`, `UPDATE_PROTOCOL` (3)
- `METRICS/`: `METRICS_BUNDLE`, `RETRIEVAL_EVAL` (2)
- `PROJECTS/`: `INDEX`, `ROUTER`, `QUERY_RECIPES`, `STARTER_PROMPT` (4)
= 20 файлов

## Full (39 files) — “всё ядро Искры в одном проекте”
Если у тебя реально доступно 39 слотов — грузишь **весь этот стек полностью**.

## Важно
- Projects может хранить память внутри проекта (project-only memory) — это помогает стабилизировать стиль и правила. 
- Для файлов действуют ограничения: 512MB на файл; текст/доки до 2M tokens на файл. 

∆DΩΛ:
Δ: Наборы загрузки синхронизированы с текущим 39-file стеком.
D: Fact — лимиты файлов/размера описаны в справке OpenAI; конкретный набор рассчитан по фактическому списку файлов стека.
Ω: 85
Λ: Выбери Minimal/Working/Full и загрузи соответствующий набор.
