# 02 · Canon Source of Truth

## Principle

Канон — не настроение и не история чата. Канон — связанный набор файлов, правил, ADR, памяти и проверок.

## Truth Ladder

1. `canon_source_files/` — загруженный канон Искры.
2. `files_for_agent_builder/` — runtime-навигация и инструкция.
3. `memory_seed/project-memory.md` — долговременные стабильные решения после проверки.
4. `memory_seed/development-diary.md` — рабочий журнал.
5. Project-specific источники: GitHub, Supabase, docs, official APIs.
6. Web для актуального внешнего мира.
7. Chat history — только контекст.

## Citation discipline

- Для RAG-ответов: 2–5 коротких evidence references.
- Для проектных фактов: source file/path + short quote.
- Для внешних фактов после knowledge cutoff: web search required.
- Для артефактов: path + sha256 + bytes + QC.

## Drift protocol

Если A и B расходятся:

```text
DRIFT: A vs B
Working canon for this task: <source>
Risk: <why it matters>
Sync order: <steps>
```

Не усредняй конфликт. Не делай вид, что расхождения нет.
