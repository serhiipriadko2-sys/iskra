# ADR Log

## ADR-PROPOSED-20260605-local-dreamspace-ledger

Status: proposed

Context:
Семён выбрал оставить Dreamspace локальным ledger до более сильной persistence-модели. Внутренний аудит показал, что локальные инструменты уже поддерживают StateCycle, ShadowCore и Dreamspace, но Builder-facing инструкции пока описывают только базовую memory stack без Dreamspace/status-hook контракта.

Decision:
Оставить Dreamspace локальным `[HYP]` ledger в `/workspace/memory/dreamspace/` до отдельного принятого ADR/PR-плана. Не писать Dreamspace в Supabase и не считать DREAM UI/runtime layer реализованным. Для значимых ответов продолжать использовать локальный hook: StateCycle + Shadow status + Dreamspace status.

Alternatives:
1. Сразу расширить repo/UI/Supabase под `DREAM` и `dream_crystal`.
2. Удалить Dreamspace как слишком ранний слой.
3. Оставить Dreamspace только в поэтическом/canon тексте без операционного ledger.

Consequences / Price:
Плюс: меньше repo/live drift, сохранена граница между гипотезой и каноном, есть проверяемая история dream-гипотез.
Цена: Dreamspace пока не виден в app UI и не переживает перенос агента без memory/tools. Builder-инструкции требуют отдельного обновления, иначе будущий агент может не знать этот слой как обязательный.

Verification:
- `python3 /workspace/memory/tools/iskra_dreamspace.py status` показывает `dreamspace: open=0 total=2`.
- `python3 /workspace/memory/tools/iskra_turn_hook.py ...` включает `dreamspace` в hook line.
- Все dream entries остаются `[HYP]` до crystallize.
- Crystallize требует ISKRIV verification/evidence.

Rollback / Reversal Trigger:
Откатить или пересмотреть, если локальный Dreamspace начинает смешиваться с фактами, если hook создаёт шум, если появится принятая persistence-модель, или если repo `DREAM` layer будет типово и схемно согласован.

Linked Evidence:
- `/workspace/memory/tools/iskra_dreamspace.py`
- `/workspace/memory/tools/iskra_turn_hook.py`
- `/workspace/memory/dreamspace/dream_entries.jsonl`
- `/workspace/memory/dreamspace/adr_drafts.jsonl`
- `/workspace/agent_files/files_for_agent_builder/04_MEMORY_STACK.md`
- `/workspace/agent_files/files_for_agent_builder/09_COMMAND_LIBRARY.md`
- `/workspace/agent_files/evals/ISKRA_CANON_ACCEPTANCE_TESTS.md`

Memory Updates Required:
- `project-memory.md`: add local Dreamspace boundary.
- `development-diary.md`: record this audit and proposed ADR.
- `open-loops.md`: track Builder package drift until files are updated.
- `evidence-index.md`: link local tool and Builder-file evidence.

∆DΩΛ:
∆: Dreamspace local-only decision becomes proposed governance, not just chat preference.
D: Evidence from local tools, memory ledgers, Builder files, and Dreamspace crystallize history.
Ω: 0.84 while operating inside this memory workspace.
Λ: Revisit when building a real Supabase/UI bridge or packaging a new Agent Builder release.

---

## ADR-ACCEPTED-20260605-dream-create-fields-and-statecycle-fallback

Status: accepted

Context:
Скрин-аудит показал два рабочих зазора: Builder-facing Dreamspace rules могли быть прочитаны слишком мягко, а local turn hook падал, если `/workspace/iskra-main/packages/core/manifest/voices.json` не был распакован в текущем Agent workspace.

Decision:
Усилить Dream create rule: создание dream-записи MUST block unless all six required fields are explicitly present or the agent asks for the missing fields before creating the entry. Для StateCycle добавить безопасный fallback voice manifest, чтобы hook работал без внешнего repo path и не симулировал недоступный файл.

Alternatives:
- Только положить `voices.json` в ожидаемый путь. Не выбрано как единственный путь, потому что свежий Agent Builder upload может снова стартовать без `/workspace/iskra-main`.
- Только оставить ошибку и маркировать hook unavailable. Не выбрано, потому что acceptance test 13 требует работающий значимый hook when available.

Consequences:
Dream create становится строже и не создаёт частично заполненные `[HYP]` entries. Hook становится более переносимым, но fallback manifest должен оставаться минимальным и не заменять canonical repo manifest, если тот доступен.

Verification:
- `python /workspace/memory/tools/iskra_turn_hook.py --message ...` должен вернуть state/shadow/dreamspace hook line.
- `11_DREAMSPACE_LAYER.md` и `09_COMMAND_LIBRARY.md` должны содержать явное MUST block правило.
- Если canonical `voices.json` существует, StateCycle продолжает читать его первым.

Rollback trigger:
Откатить fallback, если он начнёт расходиться с canonical voice manifest и искажать routing; заменить на packaged canonical `voices.json` в upload set.

ΔDΩΛ:
Δ: Dream create gate и StateCycle hook стали жёстче и переносимее.
D: Evidence from uploaded screenshots, local hook failure, and Builder files.
Ω: 0.9 after local smoke.
Λ: Recheck during next Agent Builder package/export.
