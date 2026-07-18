# SoT30 v5.5.2 — Backlog Batch (Mythic Router / Voices / RESEARCH)

Status: reviewable full-corpus package; live ChatGPT Project verification pending.

## What this is

The complete, uploadable 30-file SoT30 corpus, built from the v5.5.1 full merged package by applying the independently cross-verified audit backlog (`ADR-20260718-01`):

- `12_COUNCIL_VOICES.md` — RESEARCH-distributed note (§2) + normative activation-threshold table (§4.2, reconciles drifted pain/chaos/clarity/drift triggers across 03/04/06/07).
- `07_UNIVERSAL_ROUTER.md` — Mythic Router activation conditions (SHOULD/MAY) + function→voice hints.
- `09_METRICS_ENGINE.md` — self-reported mythic usage tracking (§6.1), routes decorative-myth repeats to ISKRIV/SIFT.
- `06_SECURITY_INTEGRITY.md` — veto-contract correction: typed `KAIN`/`ANHANTRA`/`ISKRIV` subset (was: all 9 voices, broken cross-reference).
- `04_IDENTITY_NON_MIRROR.md` — SIBYL activated (was: pending).
- `27_WHAT_IF_SCENARIO_MATRIX.md` — A3·FOG strengthened: trigger condition, authority bounds (mirrors `ADR-20260717-02`'s `RESEARCH` boundary), typed output.
- `28_EVALS_ACCEPTANCE.md` — added `T86-THRESHOLD-CONSISTENCY`, `T87-FOG-RESEARCH-CONTRACT`; acceptance range now `T01–T87`.
- **regenerated `29`** — full recomputed hash table for all 30 files.

The other 23 files are byte-identical to v5.5.1. Full rationale, coordinates, and cross-references: `governance/adr_20260718_sot30_v5_5_2_backlog_batch.md`.

## Composition arithmetic (30 files, no double-count)

```
23 unchanged from v5.5.1   (00 01 02 03 05 08 10 11 13 14 15 16 17 18 19 20 21 22 23 24 25 26)
+  7 changed for this batch (04 06 07 09 12 27 28)
+  1 regenerated            (29)
= 30
```

## Contents

```text
dist/SoT30_v5.5.2.zip                                  ← the uploadable package
governance/releases/2026-07-18-sot30-v5-5-2-backlog-batch/
├── README.md            (this file)
├── QC_REPORT.md
├── PACKAGE_RECEIPT.md
├── knowledge/00..29.md  (the 30 files, extracted for review)
└── support/
    ├── PROJECT_INSTRUCTIONS_SOT30.md   (paste into Project Instructions; unchanged from v5.5.1, no file 00 edits this batch)
    ├── MANIFEST.json                   (bytes + sha256 for all 30)
    └── SHA256SUMS                      (all 30 + instructions + MANIFEST.json; package-root paths, runnable via `sha256sum -c support/SHA256SUMS`)
```

## Upload procedure

1. Business/Pro/Enterprise/Edu plan (40-file ceiling; this package is 30). Upload in 3 batches of ≤10, verify count = 30.
2. Confirm project-only memory (both personal toggles + workspace Memory) before claiming isolation.
3. Paste `support/PROJECT_INSTRUCTIONS_SOT30.md` into Project Instructions (unchanged from v5.5.1).
4. Run `T01`–`T87` (file 28) in a fresh chat, record outcomes to close `LIVE-PROJECT-PASS`.

## What this package does NOT claim

- No live ChatGPT Project upload/retrieval has been performed — `T01`–`T87` are authored prompts, not run results.
- No claim about any live Project's current memory mode or the retrieval order of the 30 files.
- No runtime, Supabase, or GitHub-app-behavior change.
- SIBYL's activation is a canon-status change (file 04 + this ADR); the historical mirror `24_INTERFACE_STYLE.md`'s internal stubs and duplicate style layers are unchanged — extraction/harmonization of that 74k-line file remains a separate, non-atomic future task (flagged, not attempted here).
- File 25's mythic corpus is carried unchanged.
