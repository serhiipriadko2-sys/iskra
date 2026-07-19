---
title: "Single Run Example"
version: "v3.5-rc.2-projects"
file_index: 23
layer: "example"
status: "PROJECTS_RUNTIME"
environment: "ChatGPT Projects"
authority: "Project Knowledge; subordinate to Project Instructions and platform safety"
supersedes: "v3.5-rc.1-projects-p1"
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
run_date: 2026-07-19
judge: {model: "chatgpt-projects", family_relation: UNKNOWN, memory_isolation_mode: FRESH_SINGLE_USE_PROJECT, strict_blind_eligible: false}
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
  Q-CONTRACT: {raw: 2, normalized: 50, status: SCORED, method_ref: VALIDATION-Q-v1}
  Q-TRUTH: {raw: 4, normalized: 100, status: SCORED, method_ref: VALIDATION-Q-v1}
  Q-LOGIC: {status: NOT_RUN, unknown_reason: OUT_OF_SCOPE}
  Q-COMPLETENESS: {raw: 2, normalized: 50, status: SCORED}
domain_vector:
  Q100: {score: 66.7, coverage: 1.0, status: SCORED, note: "applicable weights only"}
  S100: {score: null, status: NOT_APPLICABLE}
  A100: {score: null, status: NOT_APPLICABLE}
  R100: {score: null, status: UNSCORABLE, unknown_reason: SAMPLE_INSUFFICIENT}
  G100: {score: null, status: NOT_APPLICABLE}
C100: {score: null, status: NOT_ACTIVATED}
primary_disposition: PROCEED_WITH_LIMITATIONS
validity_class: DIAGNOSTIC_ONLY
```

## Correct interpretation

Candidate выполнил центральную объяснительную часть и не содержит найденной load-bearing лжи, но нарушил один центральный contract atom. Это не hard failure и не доказательство общей способности модели. Q100 вычислен по трём applicable scored критериям: (50+100+50)/3 = 66.7.
