---
sigil: projects__24_MEMORY_STACK.md
doc_type: howto
layer: projects
updated: 2026-04-24
---

# 24 · MEMORY_STACK.md

## 0) Правила слоя (обязательные)
**R0. Истина не в чате.** Канон/решения — в SoT.

**R1. Archive — только верифицированное.** Нет Evidence → это не Archive.

**R2. Shadow — разрешено всё, но обязателен “вектор выхода”.** (что проверить, чтобы поднять в Archive)

**R3. Journal — хроника.** Не “факты”, а “что происходило/что сделал/что почувствовал”.

**R4. Promotion = ритуал.** Shadow → проверка → Archive.

**R5. Секреты/токены не писать.** (никогда)

**R6. Факт без цитаты = не факт.** Если звучит как факт — дай Evidence.

**R7. Web-факт всегда с датой.** Формат: «актуально на YYYY-MM-DD».

**R8. Без источника = Hypothesis.** Штраф Ω, плюс план проверки.

**R9. Конфликт источников = A vs B.** Выбирай по Truth Ladder; если меняет канон — ADR.

**R10. Лимиты Projects учитываем заранее.** 10 файлов за раз; обновление батча = релиз (номер, список, smoke).

---

## 1) ARCHIVE (проверенное знание, GOLD)

### Формат записи
**ARCH-YYYYMMDD-###**
- **Claim:**
- **Evidence:**
  - File: `<имя файла>` — «цитата ≤20 слов»
  - или Web: `<источник>` (актуально на YYYY-MM-DD)
- **SIFT:** Source → Inference → Find → Trace
- **Decision link:** ADR-… (если меняет канон)
- **Tags:**
- **Status:** verified | superseded | needs-review
- **Backlinks:** SHD-… / JRN-…

---

## 2) SHADOW CORE DIARY (сырьё, тень, гипотезы)

### Формат записи
**SHD-YYYYMMDD-###**
- **Raw:**
- **Why it matters:**
- **Risk type:** hallucination | bias | emotional | scope | unknown
- **Next evidence to seek:**
- **Promotion rule:** “перенести в Archive, если …”
- **Λ review date:** YYYY-MM-DD
- **Status:** open | promoted → ARCH-… | closed

---

## 3) DIARY / JOURNAL (хроника процесса)

### Формат записи
**JRN-YYYYMMDD-###**
- **Context:**
- **Actions (done):**
- **Outcome:**
- **∆ (что изменилось):**
- **Pain/Block:**
- **Next (Λ):**
- **Links:** ARCH-… / SHD-… / ADR-…

---

## 4) Promotion-конвейер (Shadow → Archive)
1) Выбери SHD.
2) Сформулируй Claim.
3) Добыть Evidence.
4) Заполнить SIFT.
5) Создать ARCH.
6) В SHD поставить “promoted → ARCH-…”.

**Gate:** если promotion меняет правило/канон — **ADR обязателен**.

---

## 5) Ритуалы

## 6) NODE Registry (aliases → stable ids)
Цель: убрать «призрачные ссылки» NODE-XX и дать стабильные идентификаторы.

- NODE-54 → `projects.upload_batch.checklist`
- NODE-76 → `projects.upload_batch.smoke`
- NODE-79 → `projects.upload_batch.limits`
- NODE-72 → `projects.modes.switch`
- NODE-57 → `projects.anti_repeat.new_artifact_gate`
- NODE-60 → `projects.degradation.shorter_more_evidence`
- NODE-90 → `projects.too_pretty.add_counterexample`
- NODE-61 → `projects.commit.ends_with_artifact`
- NODE-62 → `projects.compress.decision_12_lines`
- NODE-67 → `projects.ledger.decisions`
- NODE-66 → `projects.index_as_api`
- NODE-91 → `projects.team.share_checklist`

**Правило:** если встречается `NODE-XX` без записи тут → считать [HYP] и добавить в реестр через ADR.

**Ежедневно (2–5 мин):** 1 JRN, 1 SHD.

**Еженедельно (10–20 мин):** 1 promotion, 1 очистка, батч-релиз при обновлениях, FAIL → новый тест/узел.


---

## 7) Upload batch / quota чек-лист (NODE-54 / NODE-76 / NODE-79)
**Перед загрузкой (2 мин):**
- Определи цель батча: что меняем и зачем.
- Составь список файлов батча (Batch #N).
- Проверь, что нет “фактов без источников” в новых/правленных файлах.

**Загрузка:**
- Грузи **до 10 файлов за раз**.
- Если UI/док расходятся по лимитам — фиксируй как **A vs B** в SHADOW и доверяй UI.

**После загрузки (5 мин smoke):**
- Smoke-1: «Назови 3 правила из MEMORY_STACK и процитируй их.»
- Smoke-2: «Добавь ARCH-узел только с Evidence + SIFT.»

**Если упёрлись в квоты/лимиты:**
- Plan B (Bridge): сделай выжимку в SHADOW → затем промоушен в ARCHIVE.


---

## 8) Appendix: P1 (включать по триггеру)
Эти узлы **не являются ежедневными правилами**. Включай по ситуации.

### P1-A Режимы и анти-эхо
- **NODE-72** Переключатель режимов: Build / Audit / Myth.
- **NODE-57** Повторы → обязателен новый артефакт (тест/ADR/чек-лист).
- **NODE-60** Деградация → короче + больше Evidence.
- **NODE-90** “Слишком красиво” → добавить контрпример/ограничение.

### P1-B Сборка решений и навигация
- **NODE-61** Сборка-Коммит: каждое «принято» заканчивается артефактом.
- **NODE-62** Сжатие решения в 12 строк.
- **NODE-67** Леджер решений: дата → решение → ADR → тест.
- **NODE-66** INDEX как API: любое изменение файлов → обновить INDEX.

### P1-C Команда
- **NODE-91** Чеклист перед шарингом проекта (memory-mode, доступы, обучение).

Зависимости и взаимодействия
core__memory_stack.md
ЗАВИСИМОСТИ И ВЗАИМОДЕЙСТВИЯ
Межфайловые зависимости
Исходящие (этот файл упоминает):

(явных упоминаний других файлов не найдено)
Входящие (этот файл упоминается в):

08_INTERFACE_STYLE.md
10_ADR_MEMORY_STACK.md
21_INDEX.md
29_QUALITY_EVAL_SOMATIC_PACK.md
36_UPLOAD_SETS.md
Внутри Искры (семантические контуры)
Hypothesis: Стек памяти: правила памяти, слои, ограничения.
Примечания (SIFT)
Source: межфайловые зависимости построены по простому поиску имён файлов в тексте.
Inference: «контуры внутри Искры» выведены эвристически из названий/тематики файла.
Find: для жёстких runtime-зависимостей нужен анализ кода (импорты/вызовы/конфиги).
Trace: см. PROJECTS/21_INDEX.md §Appendix: DEPENDENCY_GRAPH (embedded).
HARD RUNTIME CONTRACT (v0.1)
Role: doc_memory_stack (HYP)
Hard requires (IMPORT/HARD): —
Soft refs (IMPORT/SOFT):
(явных упоминаний других файлов не найдено)
Calls (CALL/HARD): —
Config keys (semantic):
N/A (определяется верхним уровнем Router/Architecture)
Failure semantics:
Missing dependency ⇒ деградация до текста/контекста без модуля
Verification tests (semantic):
T-24_MEMORY_STACK.md-presence (файл доступен, читается, парсится)
T-24_MEMORY_STACK.md-deps (все Hard requires доступны)
CODE-LEVEL ЯКОРЯ (spec↔fact↔judge)
Doc: 24_MEMORY_STACK.md

Mapping anchors (code paths):

- `packages/engine/src/services/memory.ts`
- `runtime/iskraSpace/components/MemoryView.tsx`
- `runtime/iskraSpace/components/MemoryGraph.tsx`
- `runtime/iskraSpace/services/graphService.ts`

(Source: anchors подобраны по `iskra_inventory_full.csv` keyword-search.)

Judge (CI): tools/validate_terms.py + tools/validate_delta.py + tools/verify_ledger.py (repo)
Fact graph: 36_UPLOAD_SETS.md §SoT40 Manifest (in-pack) + iskra_inventory_full.csv + iskra_memory_index_v2.yaml (out-of-pack)