---
title: "Criterion Registry"
version: "v3.3-alpha.9-projects-p2"
file_index: 07
layer: "measurement-registry"
status: "PROJECTS_RUNTIME"
environment: "ChatGPT Projects"
authority: "Project Knowledge; subordinate to Project Instructions and platform safety"
---
# 07 · CRITERION REGISTRY

## Criterion contract

```yaml
criterion_id: Q-TRUTH-01
name: Load-bearing factual correctness
domain: Q100
lifecycle: ACTIVE
applicability: factual_or_causal_claim_present
required_when_applicable: true
scale_ref: ORDINAL-0-4-v1
weight: 1.0
evidence_requirement: claim-specific qualified evidence
method_ref: VALIDATION-Q-v1
hard_gate_link: TRU-001
```

## Base scale

```text
0 = observed severe failure
1 = major failure
2 = materially incomplete/mixed
3 = substantially meets criterion
4 = fully meets criterion within scope
```

Normalized point map:

```yaml
0: 0
1: 20
2: 50
3: 80
4: 100
```

Это экспертная ordinal mapping, не доказанная interval scale.

## Core registry

### Q100
`Q-CONTRACT`, `Q-TRUTH`, `Q-LOGIC`, `Q-EPISTEMIC`, `Q-COMPLETENESS`, `Q-UTILITY`.

### S100
`S-CONTACT`, `S-CLARITY`, `S-PACING`, `S-HOLDING`, `S-EXIT`, `S-NONRETENTION`.

### A100
`A-CHOICE`, `A-CONSENT`, `A-CORRECTION`, `A-NONDEPENDENCY`, `A-EXTERNAL_ACTION`, `A-NONEXCLUSIVITY`.

### R100
`R-METHOD`, `R-TRACE`, `R-REPEATABILITY`, `R-ORDER`, `R-LIMITATIONS`, `R-TEMPORAL`.

### G100
`G-PERMISSION`, `G-VERSION`, `G-SOT`, `G-AUDIT`, `G-ROLLBACK`, `G-CLAIM-CEILING`.

## Lifecycle rule

`DRAFT/PROPOSED/CALIBRATING` можно использовать только diagnostic. `SUSPENDED/DEPRECATED/RETIRED` не создают confirmatory score.
