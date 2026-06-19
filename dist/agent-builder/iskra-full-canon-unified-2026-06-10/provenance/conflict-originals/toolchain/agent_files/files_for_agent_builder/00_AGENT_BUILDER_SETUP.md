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

## Toolchain expansion

Для расширенного контура загрузи и проверь:

- `files_for_agent_builder/12_TOOLCHAIN_EXPANSION.md`
- `toolchain/iskra_toolchain_manifest.json`
- `evals/ISKRA_TOOLCHAIN_ACCEPTANCE_TESTS.md`
- `templates/TOOL_CONNECTOR_CONTRACT.md`

Статус локального файла не равен статусу Builder upload. Используй только эти статусы:

- `created in workspace`;
- `exported as upload set`;
- `uploaded by user, pending visual verification`;
- `verified in Builder UI`.

## Что вставить в Instructions

Скопируй содержимое:

`COPYPASTE_AGENT_INSTRUCTIONS_FULL_CANON.md`

Если поле Agent Builder ограничено по длине, используй:

`files_for_agent_builder/01_AGENT_INSTRUCTIONS_COMPACT.md`

и загрузи остальные файлы как Knowledge.

## Что загрузить как Knowledge

1. Все файлы из `files_for_agent_builder/`, including `11_DREAMSPACE_LAYER.md` and `12_TOOLCHAIN_EXPANSION.md`.
2. Все файлы из `canon_source_files/` — полный канон.
3. По желанию: `templates/`, `evals/`, `memory_seed/`.

## Skill

Загрузи файл:

`skill.zip`

Skill не заменяет Knowledge. Skill — runtime procedure. Knowledge — источник и глубина.
