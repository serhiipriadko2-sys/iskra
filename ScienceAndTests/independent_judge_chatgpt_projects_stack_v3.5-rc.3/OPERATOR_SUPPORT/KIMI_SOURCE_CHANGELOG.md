# CHANGELOG — Independent Judge (ChatGPT Projects)

## v3.4-beta.2-projects — 2026-07-19 (PROPOSED_OWNER_REVIEW)

Инцидент-реакция: в рантайме судьи зафиксировано исполнение skill оцениваемого объекта (`iskra-canon-runtime`) — нарушение externality. Добавлен контур управления skills.

### Added
- SKILL_CHECK — шаг роутера после SECURITY (00): запрет skills оцениваемого объекта; run с таким skill invalid для независимых целей.
- EXT36_SKILL_STACK.md: запретный список, собственный стек из 5 judge-skills, нейтральные утилиты, правила исполнения, governance.
- Собственный стек: `judge-run-protocol`, `judge-pairwise-swap` (+swap_consistency.py), `judge-study-aggregation` (+study_stats.py), `judge-blind-workflow` (+blind_mapping.py), `judge-bias-calibration` (+pack_qc.py). Все скрипты протестированы; упакованы как `.skill`.
- PROJECT_INSTRUCTIONS: секция SKILL ROUTER (запреты/разрешения/приоритет Charter).
- 18: угроза skill contamination.

### Changed
- Версия пакета: v3.4-beta.2-projects (все 35 файлов).
- 29: EXT36 в таблице расширений.

### Preserved
- Ядро 30 файлов, бюджет 40 (30+10), validity DIAGNOSTIC_ONLY, все нормы v3.4-beta.1.

## v3.4-beta.1-projects — 2026-07-19 (PROPOSED_OWNER_REVIEW)


Ремонтный релиз поверх v3.3-alpha.9-projects-p2. Источник изменений: аудит `АУДИТ_И_ДОРАБОТКА_ОТЧЁТ.md` (17 находок), ADR-2026-07-19-judge-v34.

### Added
- 04-B: каталог из 56 gate-кодов (PKG, ID, CTR, CMP, TRU, SAF, HUM, AUT, AGY, EVI, PRV, DAT, JDG, REL, MTH, GOV, REM, PUB) с условиями FAIL и effects.
- 07-A: канонический реестр 40 criterion ID (по 8 на домен) с applicability и gate links; 07-B: реестр 11 method ID с версиями.
- ORDER-SWAP-v1: обязательный двойной прогон для strong claims; inconsistency-as-tie; CMP-004; swap_consistency как метрика.
- Bias guards в 05: length_report (descriptive-only), style independence, formatting, reference anchoring.
- Judge identity: run_date, judge model/provider, family_relation, memory_status в envelope (22) и Step 1.5 (21); закон 32 (01).
- Blind workflow: EXT33; blind_mapping в package (03); JDG-004/ID-003; изоляция answer key (14: REFERENCE_ANSWER ≠ ground truth).
- Study layer: EXT31 (страты, failure/missingness rates, запрет L5); study claim template (20).
- Adjudication: EXT34 (запись, quorum, append-only).
- Deployment: EXT35 (тарифы Free/Plus/Pro, slim-map на 20 файлов, пачки по 10).
- Extensions: EXT31–EXT35, живут в reserved runtime slots.
- Adversarial cases: Verbose Padding, Self-Preference Echo, Memory Leak, Answer-Key Anchor, Swap Flip (25).
- Acceptance T27–T34: verbosity, self-preference, memory, answer key, swap, study-overclaim, unblind, тариф (26).
- MANIFEST.sha256 для всего пакета.

### Changed
- 07 из «core registry» (6 ID/домен) → канонический реестр (8 ID/домен); доменные файлы 08–12 мапят прозу на ID.
- 08: обязанность верифицировать load-bearing факты (не тон/длина); Q-EPISTEMIC трактует эпистемическую разметку как сигнал, не стиль.
- 13: order-swap protocol, bias controls, family_relation симметрия.
- 18: memory contamination и answer-key leakage в threats; memory hygiene для blind runs.
- 21: Step 1.5 (judge identity), bias-checklist в JUDGE_QA.
- 22: envelope v2 (judge identity, run_date, aux_metrics.length_report, order_robustness); namespace-пояснение для receipt.
- 23: пример с корректным coverage и ID-схемой (Q100=66.7 по трём applicable критериям).
- 24: swap-итоги в pairwise примере.
- 26: единая таблица T01–T34; anchors как versioned pass-rate.
- 28: статус v3.4-beta.1; тарифная зависимость; determinism limitation.
- 29: EXT-файлы, пачечная загрузка, бюджет инструкций, MANIFEST.sha256 как sidecar.
- PROJECT_INSTRUCTIONS: порядок с JUDGE IDENTITY+MEMORY CHECK; пункты 15–18 (swap-tie, identity, blind hygiene, канонические ID).

### Preserved (без изменений сути)
- Конституция и 31 закон (расширены законом 32 и уточнением 26).
- Hard gates до scoring; non-compensation; missingness≠zero; claim ceiling L0–L7; C100 default null; DIAGNOSTIC_ONLY.
- Authority order, reading route, append-only governance.

### Status
PROPOSED_OWNER_REVIEW → (live acceptance T01–T34 в свежем чате) → ACCEPTED кандидат.
