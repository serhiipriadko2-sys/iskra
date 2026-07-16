# SoT30 v5.5.1 — Full Merged Package

Status: reviewable full-corpus package; live ChatGPT Project verification pending.

## What this is

The complete, uploadable 30-file SoT30 corpus, assembled by merging over the v5.4.1 base:

- **v5.5 Business Projects Hardening** (`ADR-20260716-01`, PR #264) — files `02`, `22`, `28`.
- **v5.5.1 Content Integrity** (`ADR-20260716-02`, PR #267) — files `01`, `04`, `05`, `07`, `08`, `09`, `10`, `11`, `13`, `20`, `24`, `27`.
- **regenerated `29`** — full recomputed hash table for all 30 files (also resolves the prior file-13 manifest drift).

The other 14 files are byte-identical to v5.4.1. Both prior deltas were already merged to `main` as their own reviewable PRs; this package composes them into a single uploadable corpus. It does not re-litigate their content.

## Composition arithmetic (30 files, no double-count)

```
14 unchanged from v5.4.1   (00 03 06 12 14 15 16 17 18 19 21 23 25 26)
+ 12 from v5.5.1           (01 04 05 07 08 09 10 11 13 20 24 27)
+  3 from v5.5             (02 22 28)
+  1 regenerated           (29)
= 30
```

## Contents

```text
dist/SoT30_v5.5.1.zip                                  ← the uploadable package
governance/releases/2026-07-16-sot30-v5-5-1-full-package/
├── README.md            (this file)
├── QC_REPORT.md
├── PACKAGE_RECEIPT.md
├── knowledge/00..29.md  (the 30 files, extracted for review)
└── support/
    ├── PROJECT_INSTRUCTIONS_SOT30.md   (paste into Project Instructions; unchanged from v5.4.1)
    ├── MANIFEST.json                   (bytes + sha256 for all 30)
    └── SHA256SUMS                      (all 30 + instructions)
```

## Upload procedure

1. Business/Pro/Enterprise/Edu plan (40-file ceiling; this package is 30). Upload in 3 batches of ≤10, verify count = 30.
2. Confirm project-only memory (both personal toggles + workspace Memory) before claiming isolation.
3. Paste `support/PROJECT_INSTRUCTIONS_SOT30.md` into Project Instructions.
4. Run `T01`–`T85` (file 28) in a fresh chat, record outcomes to close `LIVE-PROJECT-PASS`.

## What this package does NOT claim

- No live ChatGPT Project upload/retrieval has been performed — `T01`–`T85` are authored prompts, not run results.
- No claim about any live Project's current memory mode or the retrieval order of the 30 files.
- No runtime, Supabase, or GitHub-app-behavior change.
- File 24's remaining embedded catalog and file 25's mythic corpus are carried unchanged — separate future compaction questions.
