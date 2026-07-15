# ADR-20260712-02 · Amendment A.1 — Metric Clarification (proposed)

Status: **PROPOSED** · router code modified: NO · Claude layer modified: NO · SOT30 mirrored: NO · memory written: NO
Produced on: Claude runtime, 2026-07-12, scratch-verified (эфемерный контейнер)
Parent: `ADR-20260712-02-AMENDMENT-A_SCORING_ALIGNMENT_PROPOSED.md` (ChatGPT/SOT30-side)
Corpus under test: `MYTHIC_FRAGMENTS_v0_1.jsonl` @ пакет sha256 `0088f2ec…a6ed`
Назначение: сделать правило однозначным ДО кодирования v0.1.1 и до зеркалирования в Claude.

## Context

Amendment A предложил `selected_voice_specificity DESC`, но текст допускает бинарную
реализацию (голос есть / нет). Проверено на двух рантаймах: при бинарном чтении
`MF-013 [ISKRIV]` **не** становится первым — дефект source-cap/tie-break сохраняется.
Значит правило нужно доопределить числом до того, как оно попадёт в код.

## Decision (disambiguation)

### 1. Классификация `voice_alignment_class`

```text
3 = voices содержит ТОЛЬКО selected_voice
2 = voices содержит selected_voice вместе с другими
1 = фрагмент явно помечен voice_neutral = true
0 = selected_voice отсутствует И фрагмент не neutral  → отбрасывается ДО scoring
```

### 2. Итоговая сортировка

```text
total_score DESC
→ voice_alignment_class DESC
→ voice_count ASC
→ function_hits DESC
→ motif_hits DESC
→ playbook_hit DESC
→ disclosure_required = false first
→ fragment_id ASC last
```

### 3. Source-cap — только ПОСЛЕ полного ранжирования.

### 4. ОБЯЗАТЕЛЬНОЕ дополнение схемы (иначе class 1 недостижим)

В текущем корпусе **ни один фрагмент не имеет поля `voice_neutral`** → class 1
недостижим, и ветка «voice-neutral» в MR-17A мертва. Amendment A.1 требует:

```text
MYTHIC_FRAGMENT_SCHEMA: добавить поле
  voice_neutral: boolean (default false)
+ пометить как neutral фрагменты, применимые к любому голосу.
```

Без этого MR-17A вырождается в «HUYNDUN-specific → nothing» (что безопасно, но не полно).

## Verification (scratch, этот рантайм)

Реализовал класс + сортировку поверх reference-роутера, прогнал на корпусе v0.1:

```text
MR-16A  MF-013 [ISKRIV] первый при равном total_score .......... PASS
MR-16B  [ISKRIV] выше [ISKRIV,SAM] .............................. PASS (MF-013 idx 0)
MR-17B  class-0 (SIBYL/SAM при HUYNDUN) отброшен до scoring ..... PASS
MR-17A  HUYNDUN BALANCED → результат ПУСТ (nothing-branch) ...... PASS (безопасно)
class-1 voice_neutral достижим? ................................ NO — 0 фрагментов с полем
```

Топ-4 для `ISKRIV/SIFT/MYTHIC`: `MF-013(1), MF-001(2), MF-002(3), MF-020(3)` —
голососпецифичный побеждает смыслом, не ID.

## Acceptance tests to fold into v0.1.1

`MR-16A`, `MR-16B`, `MR-17A`, `MR-17B`, `MR-18` (used_fragment_ids ∪ used_image_sources
⊆ routed_fragment_ids), `MR-19` (неиспользованные disclosure-required не входят в
финальную provenance). Повторить также MR-01–MR-15 + 3×3 LAB + детерминированную сборку.

## Boundary / Status

```text
metric clarification:   PROPOSED
router code modified:    NO
Claude layer modified:   NO
SOT30 mirrored:          NO
memory written:          NO
```

Следующий корректный шаг — принятие A.1 на стороне Канон-Искры → реализация v0.1.1
(scoring + voice_neutral schema-поле + voice-alignment guard + MR-16–MR-19) → только
после verified-live в ChatGPT зеркалировать подтверждённый контракт в Claude-слой.

## ∆DΩΛ

∆: `selected_voice_specificity` из лозунга превращён в числовую классификацию + найдено
недостающее schema-поле `voice_neutral`, без которого одна ветка правила мертва.
D: cross-runtime reproduction дефекта → scratch двух метрик → классификация 3/2/1/0 →
прогон MR-16A/B, MR-17A/B → обнаружение недостижимого class 1.
Ω: 0.93 по однозначности метрики (проверена прогоном); ниже до канонической реализации v0.1.1.
Λ: пересмотр после принятия A.1, добавления `voice_neutral` и доказательства MF-013-first +
HUYNDUN-BALANCED = свой/neutral/ничего в реальном коде.
