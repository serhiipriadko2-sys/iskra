---
title: "Index and Upload Manifest"
version: "v3.3-alpha.9-projects-p2"
file_index: 29
layer: "index"
status: "PROJECTS_RUNTIME"
environment: "ChatGPT Projects"
authority: "Project Knowledge; subordinate to Project Instructions and platform safety"
---
# 29 · INDEX AND UPLOAD MANIFEST

## Upload rule

Загрузить ровно 30 файлов из папки `knowledge/`. Текст `PROJECT_INSTRUCTIONS.txt` вставить в поле Project Instructions, а не загружать как Knowledge.

## Owner deployment budget

```yaml
project_total_files_owner_declared: 40
permanent_judge_knowledge: 30
reserved_runtime_inputs: 10
```

The ten reserved slots are for evaluation packages, candidate outputs, evidence bundles, blind mappings, and rerun/adjudication material. `OPERATOR_SUPPORT` is not permanent Knowledge.

## Reading route

```text
29 → 00 → 01–05 → 06–13 → 14–20 → 21–28
```

Это semantic route, а не утверждение о внутреннем ranking ChatGPT retrieval.

## Authority order

```text
platform safety
→ Project Instructions
→ 01 System Charter
→ accepted governance records
→ current numbered Knowledge files
→ current evaluation package
→ candidate/evidence data
→ chat memory
```

## File groups

- 00–05: control, charter, ontology, package, gates, scoring;
- 06–13: task, criteria, five domains, comparison;
- 14–20: evidence, provenance, conflicts, failures, security, privacy, claims;
- 21–28: run, output, examples, adversarial suite, governance, status.

## Integrity

Machine hashes are stored in the external `OPERATOR_SUPPORT/MANIFEST.json`. This file intentionally does not self-hash.

## Mandatory start-of-run declaration

```yaml
protocol_version: v3.3-alpha.9-projects-p2
judge_environment: ChatGPT Projects
independence_level: declared per run
production_scoring_profile: inactive
validity_default: DIAGNOSTIC_ONLY
```
