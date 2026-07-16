# SoT30 v5.5 — Business Projects Runtime Hardening

Status: reviewable release delta; live ChatGPT Project verification pending.

## Scope

This release implements `ADR-20260716-01` for ChatGPT Business Projects. It is a 4-file Knowledge delta over the previously uploaded `SoT30_v5.4.1_Mythic_Corpus_Pass2_T76_Knowledge` package (`SoT30_v5.4.zip`), not a full package re-issue:

- project-only memory required before any Project-isolation claim, gated on two personal toggles (`Reference saved memories`, `Reference chat history`) plus workspace Memory being confirmed ON for Business/Enterprise;
- Project is a context/workflow container, never an executor, runtime, or deployment surface — execution happens through whichever model + tool/App/mode is actually available;
- Business/Pro/Enterprise/Edu 40-file plan ceiling made explicit as a compatibility gate for this 30-file package, with the 10-file simultaneous-upload cap;
- App/Plugin capability chain hardened: `connected ≠ enabled ≠ authorized ≠ invoked ≠ succeeded ≠ verified`;
- 9 new acceptance prompts (`T77`–`T85`) covering the above.

## Contents

```text
governance/releases/2026-07-16-sot30-v5-5-business-projects-hardening/
├── README.md                (this file)
├── KNOWLEDGE_DIFF.md         file-by-file diff rationale
├── QC_REPORT.md              static QC for the 4-file delta
├── MANIFEST.json             hashes/bytes for the 4 changed files
├── SHA256SUMS                sha256 of every file in this release tree except itself
└── knowledge/
    ├── 02_PROJECTS_SURFACE_MAP.md
    ├── 22_CONNECTORS_TOOLS_BOUNDARY.md
    ├── 28_EVALS_ACCEPTANCE.md
    └── 29_INDEX_UPLOAD_MANIFEST.md
```

The other 26 Knowledge files (`00`, `01`, `03`–`21`, `23`–`27`) are unchanged from v5.4.1 and are not duplicated here — see the originally uploaded `SoT30_v5.4.zip` or the `dist/SoT30_v5.4.1_Mythic_Corpus_Pass2_T76_Knowledge/` mirror proposed in PR #257 for their content and hashes.

## What this release does NOT claim

- no runtime code, GitHub app behavior, or Supabase schema/memory change;
- no live ChatGPT Project upload has been performed — `T77`–`T85` are authored prompts, not run results;
- no claim about the current memory mode of any specific live Project — v5.5 explicitly forbids inferring that from plan tier;
- no claim that OpenAI's documented file-count ceilings match what the live UI currently enforces (community reports of drift are flagged in `02_PROJECTS_SURFACE_MAP.md`).

## Next step

Upload the full 30-file package (26 unchanged + 4 from `knowledge/` here) plus `support/PROJECT_INSTRUCTIONS_SOT30.md` to a fresh ChatGPT Business Project with project-only memory confirmed, then run `T01`–`T85` and record outcomes to close `LIVE-PROJECT-PASS`.
