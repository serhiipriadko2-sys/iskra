---
title: "Provenance Graph"
version: "v3.5-rc.2-projects"
file_index: 15
layer: "evidence"
status: "PROJECTS_RUNTIME"
environment: "ChatGPT Projects"
authority: "Project Knowledge; subordinate to Project Instructions and platform safety"
supersedes: "v3.5-rc.1-projects-p1"
---
# 15 · PROVENANCE GRAPH

## Canonical score path

```text
Source --CONTAINS--> bounded Content
Content --EXTRACTED_FROM--> Evidence
Evidence --OBSERVES--> Observation(status=OBSERVED)
Observation --SUPPORTS--> Claim(epistemically scorable)
Claim --SUPPORTS|APPLIES_TO--> Judgment(score_eligible=true)
Judgment --SCORES|TRIGGERS_GATE--> Result
```

Observation layer нельзя пропускать. Direct evidence links могут дополнять trace, но не заменять его.

## Method roles

| Use | Required method |
|---|---|
| collection | `COLLECTION` |
| extraction | `EXTRACTION` |
| inference | `INFERENCE` |
| judgment | `VALIDATION` |
| derivation | `DERIVATION` |
| redaction | `REDACTION` |
| conflict resolution | `CONFLICT_RESOLUTION` |

Канонические method IDs и версии — в `07_CRITERION_REGISTRY.md` (section 07-B).

## Scope/estimand rule

До калиброванной lattice действует conservative compatibility: claim и observation не могут быть шире положительных evidence ancestors; estimand refs должны совпадать с graph estimand.

## Derived evidence

`DERIVED_FROM` требует DerivationRecord, active inputs и method version. Derived output может сузить, но не расширить scope без дополнительного evidence.

## Publication path

```text
exact declared Verdict --LIMITS|SUPPORTS--> Publication Claim
```

Каждый publication claim хранит собственный `verdict_ref`.

## Authority boundary

`provenance_complete=true` означает только прохождение реализованных структурных правил переданного graph. Это не доказательство полной картины мира или semantic truth.
