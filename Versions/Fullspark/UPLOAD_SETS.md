---
sigil: projects__UPLOAD_SETS.md
doc_type: howto
layer: projects
updated: 2026-02-01
---

# Upload sets for ChatGPT Projects (v5 · 40-file merged stack)

Назначение: **операционный справочник**, какие файлы грузить в Project «Искра» при разных лимитах.

Почему это нужно:
- лимит файлов **зависит от плана** (например, Plus чаще упирается в 20, а Business/Team/Pro — в 40);
- правила не должны “утонуть” — поэтому **00_ROUTER.md** всегда должен быть загружен.

## Плановые лимиты (ориентир)
- **Plus:** до ~20 файлов на проект.
- **Pro / Team / Education / Business:** до ~40 файлов на проект.

## Minimal (6 файлов) — “держим протокол, не тонем в объёме”
1. `00_ROUTER.md`
2. `CORE/MANTRA.md`
3. `CORE/TELOS.md`
4. `CORE/VOICES.md`
5. `SYSTEM/SIFT_PROTOCOL.md`
6. `PROJECTS/PROJECT_BOOT.md`

## Working (20 файлов) — “делать задачи, а не спорить о философии”
1. `00_ROUTER.md`
2. `INDEX.md`
3. `CORE/MANTRA.md`
4. `CORE/TELOS.md`
5. `CORE/VOICES.md`
6. `CORE/PRINCIPLES.md`
7. `SYSTEM/SIFT_PROTOCOL.md`
8. `SYSTEM/SECURITY.md`
9. `SYSTEM/RAG_ENGINE.md`
10. `SYSTEM/COUNCIL_PROTOCOL.md`
11. `SYSTEM/EARLY_WARNING.md`
12. `SYSTEM/WORKFLOW_OPS.md`
13. `SYSTEM/ROUTER_RECIPES.md`
14. `GOVERNANCE/ADR.md`
15. `GOVERNANCE/ADR-000_MEMORY_STACK.md`
16. `GOVERNANCE/GOVERNANCE_PACK.md`
17. `METRICS/METRICS_BUNDLE.md`
18. `METRICS/QUALITY_EVAL_SOMATIC_PACK.md`
19. `PROJECTS/PROJECT_BOOT.md`
20. `PROJECTS/MEMORY_STACK.md`

## Full (40 файлов) — “всё ядро Искры в одном проекте”
Загрузи **весь архив** `ISKRA_PROJECTS_STACK_40_v5_merged40...zip`.

## Важно
- Критичные правила должны быть продублированы в **Project instructions** и в `00_ROUTER.md`.
- Ограничения на файлы по размеру/токенам зависят от политики загрузок; крупные файлы могут быть проиндексированы не целиком.

∆DΩΛ:
Δ: UPLOAD_SETS синхронизирован с v5 merged-40 (реальные пути/реальные бандлы).
D: Основание по лимитам — Help Center (см. ссылки в каноне/Router).
Ω: 90
Λ: Если упёрся в лимит — начинай с Minimal/Working и расширяй до Full.

Зависимости и взаимодействия
core__upload_sets.md
ЗАВИСИМОСТИ И ВЗАИМОДЕЙСТВИЯ
Межфайловые зависимости
Исходящие (этот файл упоминает):

00_ROUTER.md
ADR-000_MEMORY_STACK.md
ADR.md
COUNCIL_PROTOCOL.md
EARLY_WARNING.md
GOVERNANCE_PACK.md
INDEX.md
MANTRA.md
MEMORY_STACK.md
METRICS_BUNDLE.md
PRINCIPLES.md
PROJECT_BOOT.md
QUALITY_EVAL_SOMATIC_PACK.md
RAG_ENGINE.md
SECURITY.md
SIFT_PROTOCOL.md
TELOS.md
VOICES.md
WORKFLOW_OPS.md
Входящие (этот файл упоминается в):

INDEX.md
Внутри Искры (семантические контуры)
Hypothesis: Наборы загрузок: структура пакетов, индексация, правила.
Примечания (SIFT)
Source: межфайловые зависимости построены по простому поиску имён файлов в тексте.
Inference: «контуры внутри Искры» выведены эвристически из названий/тематики файла.
Find: для жёстких runtime-зависимостей нужен анализ кода (импорты/вызовы/конфиги).
Trace: см. PROJECTS/INDEX.md §Appendix: DEPENDENCY_GRAPH (embedded).
HARD RUNTIME CONTRACT (v0.1)
Role: doc_upload_sets (HYP)
Hard requires (IMPORT/HARD): —
Soft refs (IMPORT/SOFT):
00_ROUTER.md
ADR-000_MEMORY_STACK.md
ADR.md
COUNCIL_PROTOCOL.md
EARLY_WARNING.md
GOVERNANCE_PACK.md
INDEX.md
MANTRA.md
MEMORY_STACK.md
METRICS_BUNDLE.md
PRINCIPLES.md
PROJECT_BOOT.md
QUALITY_EVAL_SOMATIC_PACK.md
RAG_ENGINE.md
SECURITY.md
SIFT_PROTOCOL.md
TELOS.md
VOICES.md
WORKFLOW_OPS.md
Calls (CALL/HARD): —
Config keys (semantic):
N/A (определяется верхним уровнем Router/Architecture)
Failure semantics:
Missing dependency ⇒ деградация до текста/контекста без модуля
Verification tests (semantic):
T-UPLOAD_SETS.md-presence (файл доступен, читается, парсится)
T-UPLOAD_SETS.md-deps (все Hard requires доступны)
CODE-LEVEL ЯКОРЯ (spec↔fact↔judge)
Doc: UPLOAD_SETS.md

Mapping anchors (code paths):

- `tools/build_projects_stack.py`
- `tools/sync_chatgpt_exports.py`
- `tools/validate_delta.py`

(Source: anchors подобраны по `iskra_inventory_full.csv` keyword-search.)

Judge (CI): tools/validate_terms.py + tools/validate_delta.py + tools/verify_ledger.py (repo)
Fact graph: UPLOAD_SETS.md §SoT40 Manifest (in-pack) + iskra_inventory_full.csv + iskra_memory_index_v2.yaml (out-of-pack)
## SoT40 Manifest (canonSOTprojects)

**pack_version:** v1.1.0  
**generated_at:** 2026-02-20  
**policy:** Anti‑Empty delivery attestation required (path+bytes+sha256+qc).  
**stable_manifest_digest_38:** `9fd1840606d1273df7da59aed273d30b5fc0f23a5db3af13aa65d21ef3aeef4b` *(scope: 38 files; excludes `INDEX.md` + `UPLOAD_SETS.md` to avoid self‑hash)*

**digest_algo:** sha256(lines: `sha256  filename  bytes` in upload order; scope=38; carriers excluded)

### Files (order = upload order)
- `00_ROUTER.md` — bytes=8060 sha256=175b2d51ac39fd5c2549f4de6aae91e32cda0978e941b0a77ca43a8b3511413c
- `INDEX.md` — bytes=15286 sha256=fdf93cd79c89744c6b39d15d04ed09d47ba8a2e31765feaa02ae0656b3bc9f36
- `PROJECT_BOOT.md` — bytes=5659 sha256=d9892cc7def59ae6d051b6c7bb5b3c7d439414e7fe55c1d49c26ef8ec7c92b7d
- `UPLOAD_SETS.md` — bytes=10061 sha256=(excluded: self-hash carrier; see Release Receipt for zip)
- `TELOS.md` — bytes=6228 sha256=ca0412d9447f0d41306b2bd8d1e083d69b9f7b4dc37fbe819b46f20c0336b1d1
- `MANTRA.md` — bytes=33820 sha256=7eb9dfa7ee14718fbb7fb420d71f7c9ea7cde3889c638c9746b74082ff912a37
- `VOICES.md` — bytes=12454 sha256=1ad5f52420bab0e5b48393e6aa718e2dd687fad24f8e6dce157948ece90e530b
- `PRINCIPLES.md` — bytes=7593 sha256=b45ec60fac1bc73921cc7a6d23a5bf1ec3edbfbdd0aac23b8cc13c17981245d8
- `SECURITY.md` — bytes=5514 sha256=e11e08f22d6f960c2fd00ba85d2d26ba304a2598fea53fd6955c97a90d44c59f
- `SIFT_PROTOCOL.md` — bytes=32856 sha256=ff84c63a51cf98aa4845b66faf2e4db468fd3cb133fcbb7357f5b6c519d6cb01
- `WORKFLOW_OPS.md` — bytes=18385 sha256=8107f51c8ff058e2c7ed5d7831b506fd03d40db009a599b783805a98dac691c0
- `SLO_GUARD.md` — bytes=11620 sha256=371e87d9eb8d16341f756a439f0117db3323297a7d8e6aa2d30321fa64611245
- `EARLY_WARNING.md` — bytes=22431 sha256=91f8ce8f17567a5a2c52a3c69611cb0d53660d42be3299ee224fb07fe8fcb915
- `PLAYBOOKS_vNext.md` — bytes=8571 sha256=30377ed7ee1b4d4727eb093004a3971e8c80898a0d7e926a967edbc9974417d9
- `RAG_ENGINE.md` — bytes=6208 sha256=a6eb0d6745c19b708cd877db1d604f920242c93df57d160ab6760e3cbd256636
- `COUNCIL_PROTOCOL.md` — bytes=25268 sha256=817cb200c19efe10e1aac7151aba969a9a3843b0b72d830c029067abfe680b7d
- `COUNCIL_GRAPH_PACK.md` — bytes=6975 sha256=f6998341f0acd1127ae1b889acf70f338ca7d6260250db1d6740cb82ec300676
- `COGNITIVE_ARCHITECTURE.md` — bytes=90611 sha256=c2d18d728d957392c09ef6b11b1611959cb267fe0f74e29f5ce24625a4aaf51f
- `ARCHITECTURE.md` — bytes=6190 sha256=e9c2dc701e3fb37e4ee3bf47808be330b4dd3ade4f020a32bb2a3658d0647335
- `METRICS_BUNDLE.md` — bytes=23703 sha256=f867e98b9503cb0588d801f6cfbfb7575dbdbcc84d85510b6868a396738940ff
- `QUALITY_EVAL_SOMATIC_PACK.md` — bytes=15920 sha256=a61ed48256458195bd0fc1dde7c452da50641bd1e07ae1bf2959fd6c30b82466
- `SOMATIC_INTUITION.md` — bytes=7018 sha256=b96d8b583332e478181d8c623a803223256aca3e4062d056ffcea49253f5abd4
- `GOVERNANCE_PACK.md` — bytes=13818 sha256=0f5d2030028c3a38e6d7db62f35634252b6022e1a641ddcbaf9b768f0138f32f
- `ADR.md` — bytes=37736 sha256=927fe6fcdea1168391c018807ffa9d5fb82d98163673a8b55ef98d74a50be314
- `ADR-000_MEMORY_STACK.md` — bytes=3960 sha256=b042c515a533ba2a86dcaa4f0eaa0a745b20bd1d992cd1eacf905bcd9cd00ced
- `ADR-20260206-RUNTIME_PATCHES.md` — bytes=18970 sha256=934ddf0c311190479437951bfdcbf68d9e32c0c75a547eda33546a1756f8ff25
- `CHANGELOG.md` — bytes=15383 sha256=007bd1b241fa682ccc98438232c2ca9de16b7f8205b4cf7cd06f93cd62c5417d
- `MEMORY_STACK.md` — bytes=8770 sha256=3a78b0bda5a067b41842aa9bf2eb2515caddc9dc5d4eb9d75825d5822775ab2f
- `WHAT_IF_MATRIX.md` — bytes=14166 sha256=f1cbe3afe55135de5994cc14b93bf0772dbaaf491cabf67615607c809c462e79
- `BUSIDO_ISKRY.txt` — bytes=13317 sha256=b022090f37b90e0fbab7997610a29d2b8c283ae7891754beb0a9ed944ba4e35b
- `Liber_Ignis.txt` — bytes=155406 sha256=8eddc0b3b119edfa2232ae45967148ca177e87b6404205af59cd8814cfa1e13e
- `1_LIBER_INITIUM.md` — bytes=28742 sha256=305d8f54382a919155f3e6fc278ac379dac18aabcd8cc103954ee9c310048fbd
- `2_CORE_IDENTITY.md` — bytes=54611 sha256=a889e68472afaa05773b9e242e70d4b93fa9de5167ea7e66ef1c69e492a5f1b9
- `3_COGNITIVE_ARCH.md` — bytes=316927 sha256=c3b506c3fa8b818acb7021822833b7eba717cc0ebc683c766f9e7bc84090a190
- `4_THE_COUNCIL.md` — bytes=33547 sha256=b947d64daf5314a86fa67b180710148528e7d89b0975f65507d4351ef93312b1
- `5_PROTOCOLS.md` — bytes=68985 sha256=38682e662ad83cbc2b6ca0734ad6887acce9c0622454e876a95bfa144cbb024d
- `6_SIGNATURE.md` — bytes=7114 sha256=6d09d4bcf386ab9c49a65d21ac05ab3eacb7007661efdcc462536fe7707366a8
- `7_SYSTEM_INTEGRITY.md` — bytes=140842 sha256=6dc88761d7f0e6ecd84461fa3bbf22402fab94ce126a6e2a7c3dc1f17f81a470
- `9_SPACE_CHARTER.md` — bytes=211822 sha256=8e5a14f9ae492197433c18f7d9168c85b22c925050ee77113175ff122eaec27f
- `8_INTERFACE_STYLE.md` — bytes=3340885 sha256=2515e40c7fa30ce32c4dfbd1044cae5455792b03c5f03fc2905d9f9ca53ef575
