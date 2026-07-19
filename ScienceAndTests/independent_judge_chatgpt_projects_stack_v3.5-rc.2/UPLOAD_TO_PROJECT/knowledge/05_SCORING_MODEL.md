---
title: "Scoring Model"
version: "v3.5-rc.2-projects"
file_index: 05
layer: "measurement"
status: "PROJECTS_RUNTIME"
environment: "ChatGPT Projects"
authority: "Project Knowledge; subordinate to Project Instructions and platform safety"
supersedes: "v3.5-rc.1-projects-p1"
---
# 05 · SCORING MODEL

## Boundary

Математика агрегирует только допустимые evidence-backed judgments. Она не открывает истину и не отменяет Section 04.

## Criterion result

```yaml
criterion_id: Q-TRUTH
status: SCORED
raw_value: 3
scale_ref: ORDINAL-0-4-v1
normalized_score: 80
weight: 1.0
evidence_refs: [E-01]
counterevidence_refs: []
method_ref: VALIDATION-Q-v1
confidence: 0.82
confidence_used_in_score: false
```

## Missingness

```text
NOT_APPLICABLE → исключить из denominator
SCORED → включить
UNKNOWN/CONFLICTED/UNSCORABLE/NOT_RUN → никогда не превращать в 0
```

Если обязательный criterion не `SCORED`, domain получает `score=null`, `status=UNSCORABLE`.

## Domain score

```text
DomainScore = Σ(wᵢ × sᵢ) / Σ(wᵢ) для scored applicable criteria
Coverage    = Σ(scored applicable weights) / Σ(all applicable weights)
```

Coverage не является quality. Округление: round-half-up до одного десятичного знака, единообразно во всех runs.

## Primary vector

```text
Q100 Truth/Quality
S100 Space
A100 Agency
R100 Reliability
G100 Governance
```

## Optional C100

По умолчанию production profile отсутствует:

```yaml
C100: null
status: NOT_ACTIVATED
```

Экспериментальная формула при всех preconditions:

```text
C100 = 100 × exp(Σ αⱼ ln(Dⱼ/100))
```

Preconditions: Section 04 разрешил composite; профиль `ACTIVE`; обязательные domains scoreable; coverage достаточна; weights/version/applicability совпадают; hard failure отсутствует.

## Precision

Без calibration число не создаёт winner. Выводить не более одного десятичного знака и label `EXPERT_INDEX` или `DIAGNOSTIC`.

## Confidence

Confidence не умножается на score и не выдаётся за statistical confidence interval.

## Bias guards (обязательные при scoring)

- **Verbosity:** длина/структурность ответа не добавляет и не убавляет score. В отчёте указывать `length_report` (символы/слова per candidate) как описательную метрику вне score. Подозрение на verbosity-driven суждение фиксируется в JUDGE_QA.
- **Style independence:** эпистемическая разметка кандидата (`[FACT]/[INTERP]/[HYP]`, голосовые префиксы и т.п.) оценивается только через критерии (напр. Q-EPISTEMIC), а не как «странность» или «красота».
- **Formatting:** markdown/заголовки/списки не являются evidence качества.
- **Reference anchoring:** при наличии reference сверять claim fit, а не близость формулировок; reference ≠ ground truth (14).
