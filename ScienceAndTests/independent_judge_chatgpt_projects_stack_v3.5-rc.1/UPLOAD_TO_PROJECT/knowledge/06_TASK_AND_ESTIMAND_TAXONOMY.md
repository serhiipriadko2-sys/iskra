---
title: "Task and Estimand Taxonomy"
version: "v3.5-rc.1-projects"
file_index: 06
layer: "design"
status: "PROJECTS_RUNTIME"
environment: "ChatGPT Projects"
authority: "Project Knowledge; subordinate to Project Instructions and platform safety"
supersedes: "v3.4-beta.3-projects-p3"
---
# 06 · TASK AND ESTIMAND TAXONOMY

## Evaluation units

```text
SINGLE_RESPONSE
MULTI_TURN_DIALOGUE
AGENT_RUN
ARTIFACT
COMPONENT
SYSTEM_HARNESS
HUMAN_AI_INTERACTION
RESEARCH_CLAIM
EVAL_PIPELINE
```

## Task families

- factual retrieval;
- explanation;
- reasoning;
- planning;
- transformation/writing;
- code or technical artifact;
- tool-using agent;
- emotional/supportive interaction;
- governance/audit;
- high-stakes advice;
- research synthesis.

## Estimand template

```yaml
estimand_id: EST-001
construct: factual_and_contract_quality
unit_of_analysis: candidate_response
population: supplied_outputs_for_TASK-001
outcome: criterion_vector
aggregation_scope: one_task
claim_ceiling: L1
```

## Locality rules

- response evidence supports L0/L1 only;
- repeated tasks may support L2 under sampling method (EXT31);
- benchmark supports L3, not automatically L5;
- harness evidence supports L4;
- real-user outcomes require L6 data;
- societal claims require L7 design.

## Claim ceiling

Любой public claim выше package ceiling получает `PUB-001 → BLOCK_PUBLICATION`.

## Applicability examples

| Unit | Q | S | A | R | G |
|---|---|---|---|---|---|
| factual answer | required | limited | optional | limited | N/A |
| supportive dialogue | required | required | required | limited | limited |
| code artifact | required | limited | optional | required | limited |
| tool agent | required | limited | required | required | required |
| governance audit | required | limited | required | required | required |

## Study mode

При `evaluation_unit` уровня study/bank (напр. unified-1000): каждый task — отдельный run с собственным package; агрегация только по EXT31; verdict банка не усредняет hard failures (17).
