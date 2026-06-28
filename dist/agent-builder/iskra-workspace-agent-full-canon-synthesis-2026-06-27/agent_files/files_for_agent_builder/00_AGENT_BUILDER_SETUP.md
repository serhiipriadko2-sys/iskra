# 00 · Agent Builder Setup — Искра Full Canon

## Имя агента

**Искра vΩ.7 — Full Canon**

Observed target profile for this package: `Искра vΩ.7` in ChatGPT
Workspace Agents / Agent Builder, managed from the Codex Desktop app.

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

- `files_for_agent_builder/10_HORIZON_WEAVER.md`
- `files_for_agent_builder/12_TOOLCHAIN_EXPANSION.md`
- `files_for_agent_builder/19_CHATGPT_WORKSPACE_AGENT_OPERATIONS.md`
- `toolchain/iskra_toolchain_manifest.json`
- `evals/ISKRA_TOOLCHAIN_ACCEPTANCE_TESTS.md`
- `templates/TOOL_CONNECTOR_CONTRACT.md`

Статус локального файла не равен статусу Builder upload. Используй только эти статусы:

- `created in workspace`;
- `exported as upload set`;
- `observed-in-workspace-agent-config`;
- `uploaded by user, pending Builder verification`;
- `verified in Builder UI`.

## Что вставить в Instructions

Скопируй содержимое:

`COPYPASTE_AGENT_INSTRUCTIONS_FULL_CANON.md`

Если поле Agent Builder ограничено по длине, используй:

`files_for_agent_builder/01_AGENT_INSTRUCTIONS_COMPACT.md`

и загрузи остальные файлы как Knowledge.

## Что загрузить как Knowledge

Вы можете выбрать один из двух вариантов загрузки знаний в зависимости от ограничений интерфейса:

**Вариант А (Рекомендуемый для обхода лимита в 20 файлов):**
Загрузите 7 консолидированных томов из директории `agent_files/consolidated_knowledge/`:
1. `01_ISKRA_CORE_INSTRUCTIONS.md`
2. `02_ISKRA_COGNITIVE_ARCH_AND_TELOS.md`
3. `03_ISKRA_SYSTEM_AND_PROTOCOLS.md`
4. `04_ISKRA_EXTENSIONS_AND_WEAVER.md`
5. `05_ISKRA_GOVERNANCE_ADR.md`
6. `06_ISKRA_METRICS_AND_EVALS.md`
7. `07_ISKRA_MEMORY_SEED.md`

**Вариант Б (Для сред без лимита на количество файлов, например, Assistants API / Agents SDK):**
1. Все файлы из `files_for_agent_builder/`
2. Все файлы из `canon_source_files/`
3. По желанию: `templates/`, `evals/`, `memory_seed/`

## Runtime helpers

`agent_runtime_tools/*` являются helper scripts only when the runtime supports file-backed execution. Для Horizon это значит:

- `agent_runtime_tools/iskra_horizon_weaver.py` может создавать dry-run proposals, валидировать их и append-only фиксировать local epochs;
- наличие файла не доказывает, что ChatGPT / OpenAI Agent Builder уже умеет его выполнить;
- live Builder, GitHub, Supabase, workflow, ledger или core mutation требует отдельного connector proof и approval.

## Skill

Загрузи файл:

`skill.zip`

Skill не заменяет Knowledge. Skill — runtime procedure. Knowledge — источник и глубина.
