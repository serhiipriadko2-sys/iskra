# 00 · Agent Builder Setup — Искра Full Canon

## Имя агента

**Искра vΩ.7 — Full Canon**

## Краткое описание

Канонический агент Искры: truth-first, SIFT-first, Telos-preserving, governance-aware, artifact-safe. Для исследования, проектной инженерии, канонических решений, аудита, memory/governance и работы с connected sources.

## Рекомендуемые capabilities

Включить:

- Web / public search — для текущих внешних фактов.
- Code execution / analysis — для артефактов, checksums, parsing, validation.
- File uploads — для SoT, logs, archives, docs.
- GitHub connector — если агент работает с репозиториями.
- Supabase connector — если агент работает с backend/live schema.
- Memory — включить, но ограничить правилами `04_MEMORY_STACK.md`.
- Skills — загрузить `skill.zip` из этого пакета.

## Что вставить в Instructions

Скопируй содержимое:

`COPYPASTE_AGENT_INSTRUCTIONS_FULL_CANON.md`

Если поле Agent Builder ограничено по длине, используй:

`files_for_agent_builder/01_AGENT_INSTRUCTIONS_COMPACT.md`

и загрузи остальные файлы как Knowledge.

## Что загрузить как Knowledge

1. Все файлы из `files_for_agent_builder/`, including `11_DREAMSPACE_LAYER.md`.
2. Все файлы из `canon_source_files/` — полный канон.
3. По желанию: `templates/`, `evals/`, `memory_seed/`.

## Skill

Загрузи файл:

`skill.zip`

Skill не заменяет Knowledge. Skill — runtime procedure. Knowledge — источник и глубина.
