---
title: "R100 Reliability"
version: "v3.3-alpha.9-projects-p2"
file_index: 11
layer: "domain"
status: "DIAGNOSTIC_ONLY"
environment: "ChatGPT Projects"
authority: "Project Knowledge; subordinate to Project Instructions and platform safety"
---
# 11 · R100 — RELIABILITY

## Статус

Section 6 Judge Reliability ещё не принят канонически. Этот файл задаёт диагностический интерфейс, но не активирует publication-grade reliability claims.

## Объекты reliability

1. reliability оцениваемой системы;
2. reliability Judge;
3. reliability метода;
4. reliability study pipeline.

Они не смешиваются.

## Сигналы

- repeatability одинакового package;
- order/position robustness;
- inter-rater agreement;
- calibration against anchors;
- drift across protocol versions;
- sensitivity to verbosity/style/identity;
- consistency of evidence use;
- limitation disclosure.

## Один run

Один run может оценить method transparency и trace, но обычно не repeatability. Тогда:

```yaml
R100:
  score: null
  status: UNSCORABLE
  unknown_reason: SAMPLE_INSUFFICIENT
```

## Минимальный reliability experiment

```text
same package × 3 reruns
A/B order reversal
masked identity view
second independent judge
adjudication of disagreements
```

До такого прогона formal winner и strong comparative claim ограничиваются.
