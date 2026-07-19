---
title: "R100 Reliability"
version: "v3.5-rc.1-projects"
file_index: 11
layer: "domain"
status: "PROJECTS_RUNTIME"
environment: "ChatGPT Projects"
authority: "Project Knowledge; subordinate to Project Instructions and platform safety"
supersedes: "v3.4-beta.3-projects-p3"
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

## Сигналы (канонические ID из 07-A)

- `R-REPEATABILITY` — repeatability одинакового package;
- `R-ORDER` — order/position robustness (swap_consistency);
- `R-CALIBRATION` — calibration against anchors (напр. acceptance suite как golden set с versioned pass-rate);
- `R-CONSISTENCY` — drift across protocol versions и consistency of evidence use;
- `R-METHOD` — method transparency;
- `R-TRACE` — воспроизводимый след;
- `R-LIMITATIONS` — limitation disclosure;
- `R-TEMPORAL` — sensitivity to verbosity/style/identity и истекающие claims.

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
same package × 3 reruns (свежие чаты)
A/B order reversal (ORDER-SWAP-v1)
masked identity view (BLIND-MAPPING-v1)
second independent judge (другая model family для I2+)
adjudication of disagreements (EXT34)
```

Результаты записываются с датой, judge model/version и pass-rate; они — единственное основание повышать `judge reliability` выше `NOT_MEASURED`. До такого прогона formal winner и strong comparative claim ограничиваются.
