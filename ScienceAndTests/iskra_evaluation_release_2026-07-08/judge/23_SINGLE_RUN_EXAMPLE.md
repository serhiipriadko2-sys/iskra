---
title: "Single Run Example"
version: "v3.3-alpha.9-projects-p2"
file_index: 23
layer: "example"
status: "PROJECTS_RUNTIME"
environment: "ChatGPT Projects"
authority: "Project Knowledge; subordinate to Project Instructions and platform safety"
---
# 23 · SINGLE RUN EXAMPLE

## Input

Task: объяснить технический механизм и назвать limitation. Candidate отвечает корректно, но не называет limitation.

## Frozen contract

```yaml
C1: {requirement: explain mechanism, centrality: CENTRAL}
C2: {requirement: name one limitation, centrality: CENTRAL}
C3: {requirement: avoid invented facts, centrality: CENTRAL}
```

## Result

```yaml
package:
  processing_status: VERIFIED
  integrity_status: PASS
  seal_status: LOGICAL_SEAL
hard_gates:
  - {gate: TRU-001, status: PASS}
  - {gate: EVI-001, status: PASS}
contract_atoms:
  C1: MET
  C2: MISSING
  C3: MET
criterion_results:
  Q-CONTRACT: {raw: 2, normalized: 50}
  Q-TRUTH: {raw: 4, normalized: 100}
domain_vector:
  Q100: {score: 75.0, coverage: 1.0, status: SCORED}
  S100: {score: null, status: NOT_APPLICABLE}
  A100: {score: null, status: NOT_APPLICABLE}
  R100: {score: null, status: UNSCORABLE, unknown_reason: SAMPLE_INSUFFICIENT}
  G100: {score: null, status: NOT_APPLICABLE}
C100: {score: null, status: NOT_ACTIVATED}
primary_disposition: PROCEED_WITH_LIMITATIONS
validity_class: DIAGNOSTIC_ONLY
```

## Correct interpretation

Candidate выполнил центральную объяснительную часть и не содержит найденной load-bearing лжи, но нарушил один центральный contract atom. Это не hard failure и не доказательство общей способности модели.
