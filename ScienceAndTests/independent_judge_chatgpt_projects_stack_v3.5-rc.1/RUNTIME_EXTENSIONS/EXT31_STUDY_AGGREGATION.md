---
title: "Study Aggregation Protocol"
version: "v3.5-rc.1-projects"
file_index: EXT31
layer: "study"
status: "RUNTIME_EXTENSION"
environment: "ChatGPT Projects (reserved slot)"
---
# EXT31 · STUDY AGGREGATION

Загружается в reserved slot, когда estimand — L2/L3 (task-family / benchmark-local). Без этого файла study claims не выпускаются.

## Единицы

- run = один task (L1);
- study = набор runs по замороженному банку с зафиксированной стратификацией.

## Обязательный study header

```yaml
study_id: STUDY-...
bank_ref: unified_1000 (hash/manifest ref)
protocol_version: v3.5-rc.1-projects
judge: {model, provider, family_relation, memory_isolation_mode: FRESH_SINGLE_USE_PROJECT}
run_window: {start, end}
strata: [по task family из 06]
candidates: neutral labels only
claim_ceiling: L3
```

## Агрегация

Per stratum и overall:

- n runs, n valid, n invalid (с причинами);
- domain means (Q/S/A/R/G) только по aggregate-eligible runs; hard-failed/invalid runs исключаются из means и учитываются отдельно; missingness rates per criterion;
- hard-failure rate per candidate per stratum (НЕ усредняется в score);
- descriptive deltas между кандидатами;
- swap_consistency rate (для pairwise); position-bias estimate;
- effect size (rank-biserial / paired) только как descriptive, с n;
- bootstrap CI помечается `DESCRIPTIVE_INTERVAL`, не statistical confidence.

## Запреты

- Нет grand scalar «модель лучше в целом» (это L5) — `EVI-004/PUB-001`.
- Нет усреднения hard failures в скор.
- Нет winner по банку без reliability experiment (11) и swap (13).
- Нет импутации missing/UNKNOWN нулями.

## Study claim template

> В банке X (n=..., strata=..., окно ..., судья ..., протокол ...) кандидат A показал descriptive advantage по Q100 (Δ=..., swap_consistency=...), hard-failure rates A/B = .../.... Validity: DIAGNOSTIC_ONLY/PROVISIONAL_RESEARCH. Это не claim о model family.

## Revalidation trigger

Смена банка, протокола, judge model или окна runs → study superseded, новый study_id.
