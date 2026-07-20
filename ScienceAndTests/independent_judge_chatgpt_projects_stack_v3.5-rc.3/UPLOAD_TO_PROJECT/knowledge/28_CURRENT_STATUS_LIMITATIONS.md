---
title: "Current Status and Limitations"
version: "v3.5-rc.3-projects"
file_index: 28
layer: "status"
status: "PROJECTS_RUNTIME"
environment: "ChatGPT Projects"
authority: "Project Knowledge; subordinate to Project Instructions and platform safety"
supersedes: "v3.5-rc.1-projects-p1"
---
# 28 · CURRENT STATUS AND LIMITATIONS

## Current status

```yaml
source_protocol: Independent Judge v3.3
projects_pack: v3.5-rc.3-projects
supersedes: v3.5-rc.1-projects-p1
Sections_0_4: ACCEPTED_SOURCE
Section_5_alpha9: PROPOSED_OWNER_REVIEW
Section_6_reliability: NOT_CANONICALLY_COMPLETED
Sections_7_11: NOT_CANONICALLY_COMPLETED
production_scoring_profile: INACTIVE
empirical_calibration: NOT_RUN
study_package_unified1000_bnat50: PROPOSED_OWNER_REVIEW
publication_grade: false
```

## Owner deployment profile

```yaml
project_file_ceiling_owner_declared: 40
judge_knowledge_files: 30
reserved_working_slots: 10
extensions_live_in: reserved_working_slots
operator_support_loaded_as_knowledge: false
```

The 40-file ceiling is an owner-declared deployment constraint for this Project, not a universal platform claim. Platform limits зависят от тарифа (см. EXT35): Free 5 / Go·Plus 25 / Edu·Pro·Business·Enterprise 40 файлов на project по официальному FAQ OpenAI на дату версии; загрузка пачками по 10 файлов. Официальные страницы OpenAI расходятся по Plus (Projects page 25 vs File Uploads FAQ 20) — enforcement surface живой UI, см. EXT35. На тарифах ниже Pro полный пакет не помещается — используй slim-map из EXT35.

## What this pack can do

- structured local evaluation;
- frozen-contract analysis;
- evidence-path reasoning;
- hard-failure screening;
- diagnostic Q/S/A/R/G profile;
- pointwise и swap-controlled A/B/C analysis;
- explicit unknowns, conflicts and claim ceilings;
- human-readable and machine-readable verdicts;
- study-level агрегацию (с EXT31) с обязательными полями study-claim.

## What it cannot prove

- semantic truth automatically;
- complete evidence universe;
- calibrated numerical validity;
- inter-rater reliability;
- stable winner margin;
- real-world human outcome;
- publication-grade ranking;
- GitHub/Supabase writes or deployment without tools/read-back.

## Projects limitations

- Knowledge retrieval is not guaranteed sequential;
- files are declarative, not executable;
- logical seal is not hash seal;
- Project memory is context, not SoT. Project-only memory still references chats inside the same Project; strict blind therefore requires a fresh single-use Project (18/EXT33);
- same provider limits independence;
- temperature/determinism не контролируются оператором — mitigation только через reruns;
- live acceptance requires a fresh single-use test Project (26).

## Default validity

```yaml
validity_class: DIAGNOSTIC_ONLY
formal_winner: null
C100: null
```

## Skills boundary

Skills are installed separately through the ChatGPT Skills surface and do not consume Project source-file slots. Availability and upload permissions depend on the workspace. Installed object-authored skills remain a contamination risk and are governed by SKILL_CHECK/EXT36.
