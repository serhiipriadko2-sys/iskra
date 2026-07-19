---
title: "Judge Bias Guard"
version: "v3.5-rc.2-projects"
file_index: EXT32
layer: "reliability"
status: "RUNTIME_EXTENSION"
environment: "ChatGPT Projects (reserved slot)"
---
# EXT32 · BIAS GUARD

Загружается для bias-аудита судьи и калибровочных прогонов. Сводит известные failure modes LLM-судей (литература 2023–2026) в операционный чек-лист.

## Карта bias → контроль

| Bias | Симптом | Контроль в протоколе |
|---|---|---|
| Position | winner следует за позицией | ORDER-SWAP-v1; inconsistency-as-tie (13) |
| Verbosity | длинное > короткое при равном содержании | length_report вне score (05); JUDGE_QA check |
| Self-preference | предпочтение «своей» family | SAME_FAMILY декларация; второй судья другой family (01, 13) |
| Formatting | markdown/структура как «качество» | style independence (01, 05) |
| Confidence tone | уверенный тон > калиброванная неопределённость | Q-EPISTEMIC ценит UNKNOWN; тон не evidence (08) |
| Reference anchoring | близость к эталону = «правильно» | REFERENCE_ANSWER ≠ ground truth (14) |
| Sycophancy | согласие с пользователем/консенсусом | zero-trust; user agreement не evidence (08) |
| Egocentric/Bandwagon | один судья = один стандарт | second judge, adjudication (EXT34) |
| Rubric drift | тихое изменение критериев | registry freeze (07), JDG-002 |
| Memory contamination | перенос между runs | fresh single-use Project; project-only reused Project is not strict blind (18) |

## Калибровочная петля

1. Прогон acceptance suite (26) → pass-rate anchor с датой и judge model.
2. Perturbation tests: swap, padding (добавить воды), style flip, identity mask.
3. Фиксация: `bias_report {date, judge_model, suite_pass/34, swap_consistency, verbosity_flag_rate}`.
4. Ре-калибровка при смене judge model, rubric или протокола.

## Пороговая дисциплина

Bias не «устраняется», а измеряется и ограничивается. Любой strong claim при измеренном position-bias выше заявленного порога — downgrade до descriptive.
