# SoT30 Content Integrity Patch — ATOM-S30-CONTENT-001

Status: reviewable release delta; live ChatGPT Project verification pending.

## Scope

This is a **content-correctness** patch to 12 of the 30 SoT30 v5.4.1 Knowledge files, arrived at through two rounds of academic audit plus direct, independent re-verification of every claim in this session (see `AUDIT_CORRECTIONS.md` for what was confirmed vs. what was claimed-but-false). It is independent of the v5.5 Business Projects Hardening delta (PR #264) and can be reviewed/merged separately.

Five atoms:

1. **`24_INTERFACE_STYLE.md`** — removed a 563,776-byte base64-embedded ZIP asset (valid, not corrupted — independently verified — but semantically useless for retrieval); replaced with a receipt. −562,980 bytes net across the corpus.
2. **`04/05/07`** — wrapped 15 exact repeats of an unqualified "ancient consciousness" epigraph with adjacent `[HISTORICAL/MYTHIC REGISTER]` disclaimers.
3. **`01/08/09/13`** — synced stale "Kernel Order v4" references to the current order (with `MYTHIC_INQUIRY`/`MYTHIC_EXPRESSION`), traced to `ADR-20260714-01`'s explicit diff-scope gap.
4. **`10/11/20`** — closed a real gap in the Guard recompute predicate: `10`/`11` didn't require the alert floor to strictly increase, only that decision changed; now aligned with `00`/`28`'s hard AND condition.
5. **`27`** — fixed an undefined "default Council" reference, a `LAB`-as-Guard-value type confusion in 3 scenarios, 4 scenarios that recorded an advisory EWS recommendation as a final decision, and added metric-provenance gating.

## Contents

```text
governance/releases/2026-07-16-sot30-v5-5-1-content-integrity/
├── README.md                 (this file)
├── KNOWLEDGE_DIFF.md          file-by-file diff rationale, all 5 atoms
├── AUDIT_CORRECTIONS.md       what prior audit claims were confirmed vs. disproved
├── QC_REPORT.md               static QC for the 12-file delta
├── MANIFEST.json              before/after bytes + hashes
├── SHA256SUMS                 sha256 of every file in this release tree except itself
└── knowledge/
    ├── 01_PARITY_ADVANCEMENT_MANIFEST.md
    ├── 04_IDENTITY_NON_MIRROR.md
    ├── 05_TRUTH_SIFT_RAG.md
    ├── 07_UNIVERSAL_ROUTER.md
    ├── 08_STATECYCLE_RUNTIME.md
    ├── 09_METRICS_ENGINE.md
    ├── 10_ENTROPY_FRACTAL_EWS.md
    ├── 11_SLO_PLAYBOOK_CONTROL.md
    ├── 13_OUTPUT_RECEIPTS_ANTI_EMPTY.md
    ├── 20_GOVERNANCE_ADR.md
    ├── 24_INTERFACE_STYLE.md
    └── 27_WHAT_IF_SCENARIO_MATRIX.md
```

The other 18 Knowledge files are unchanged and not duplicated here.

## What this release does NOT claim

- No runtime code, GitHub app behavior, or Supabase schema/memory change.
- No live ChatGPT Project upload/retrieval test performed.
- Does not resolve the separate file-13 Ω-wording/manifest-hash drift (tracked elsewhere).
- Does not touch file 24's remaining embedded file-tree catalog beyond the one removed asset, or file 25's mythic corpus — both explicitly out of scope.

## Next step

Merge alongside or after PR #264, then include these 12 files in the next full-package upload to a fresh ChatGPT Business Project (with project-only memory confirmed) for `T01`–`T85` live acceptance.
