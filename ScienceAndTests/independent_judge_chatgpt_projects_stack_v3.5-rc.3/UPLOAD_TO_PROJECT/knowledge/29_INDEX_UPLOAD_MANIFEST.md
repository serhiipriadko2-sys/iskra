---
title: "Index and Upload Manifest"
version: "v3.5-rc.3-projects"
file_index: 29
layer: "index"
status: "PROJECTS_RUNTIME"
environment: "ChatGPT Projects"
authority: "Project Knowledge; subordinate to Project Instructions and platform safety"
supersedes: "v3.5-rc.1-projects-p1"
---
# 29 · INDEX AND UPLOAD MANIFEST

## Upload rule

Загрузить ровно 30 файлов из папки `knowledge/` (пачками ≤10 файлов за раз). Текст `PROJECT_INSTRUCTIONS.txt` вставить в поле Project Instructions, а не загружать как Knowledge. Инструкции держать в пределах лимита поля (жёсткий owner budget ≤6000 символов).

## Owner deployment budget

```yaml
project_total_files_owner_declared: 40
permanent_judge_knowledge: 30
reserved_runtime_inputs: 10
```

Десять reserved slots — для evaluation packages, нейтрализованных candidate outputs, evidence bundles, rerun/adjudication material и файлов EXT31–EXT36, когда режим их требует. Sealed blind mapping и answer key НИКОГДА не загружаются в reserved slots — они остаются вне Judge Project до commit verdict. `OPERATOR_SUPPORT` is not permanent Knowledge. Тарифы ниже Pro: см. EXT35 slim-map.

## Extensions (загружаются в reserved slots по требованию)

| File | Когда нужен |
|---|---|
| EXT31_STUDY_AGGREGATION.md | study/банк задач, L2/L3 claims |
| EXT32_BIAS_GUARD.md | bias-аудит судьи, калибровка |
| EXT33_BLIND_WORKFLOW.md | blind/comparative runs, answer key |
| EXT34_ADJUDICATION.md | материальные disagreements |
| EXT35_DEPLOYMENT_MATRIX.md | тарифы <40 файлов, slim-pack |
| EXT36_SKILL_STACK.md | среда с skills: роутер, свой стек, запреты |

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
- 06–13: task, registry, five domains, comparison;
- 14–20: evidence, provenance, conflicts, failures, security, privacy, claims;
- 21–28: run, output, examples, adversarial suite, governance, status.

## Integrity

Машинные хэши всего релиза — в `OPERATOR_SUPPORT/MANIFEST.json` (полный scope, operator-support, не Knowledge). Под-манифест `STUDY_PACKAGES/.../MANIFEST.sha256` покрывает только study-пакет. 30-файловое Judge-ядро проверяется через записи core_upload в `OPERATOR_SUPPORT/MANIFEST.json`. Оператор сверяет хэши после выгрузки из репозитория и после любой правки; ни один манифест не хэширует сам себя.

## Mandatory start-of-run declaration

```yaml
protocol_version: v3.5-rc.3-projects
judge_environment: ChatGPT Projects
independence_level: declared per run
production_scoring_profile: inactive
validity_default: DIAGNOSTIC_ONLY
```

## Skills installation boundary

Skills packages are installed separately through the ChatGPT Skills interface and are not Project Knowledge files. Do not upload `.skill` archives into the 40 Project source slots.
