# SoT30 v5.5.5 — Provenance / Label Cleanup + Version-Identity Consistency

Status: **accepted** (ADR-20260721-01, owner decision 2026-07-21). Built from a source-freeze commit via genuine `--from-git`; live ChatGPT Project verification pending. `dist/SoT30_v5.5.4.zip` is unchanged and remains the immutable prior release.

<!-- composition: changed=7 unchanged=23 baseline=v5.5.4 -->

## What this is

A **provenance/version-only** cleanup over v5.5.4 (no semantic / runtime / Supabase / memory change — ADR-20260721-01 D3). It closes the two in-ZIP inaccuracies that v5.5.4's erratum deferred:

- **E1 resolved** — `support/MANIFEST.json` `generated_from: canonical_git_blobs` is now *genuinely true*: the package was built with the fixed `--from-git <source-freeze-SHA>`, and all 30 knowledge files + the instructions in the ZIP are byte-equal to the git blobs at that commit (`generated_from_ref` records the SHA).
- **E2 resolved** — ZIP root is now `SoT30_v5.5.5/` (with the `v`).

It also makes the **active package identity** consistent at v5.5.5 (ADR D1/D2): the Project Instructions (both the `00` mirror and the standalone, kept byte-equal — T80 re-proven) and the version-identity stamps in `01/02/22/25/28/29`. Historical `v5.5.3`/`v5.5.4` references in provenance/errata/history are intentionally left intact.

## Two-stage provenance (why the build is honest now)

`--from-git` extracts source bytes from a commit, so the final package is built from a **source-freeze commit** that already contains the final v5.5.5 knowledge + instructions; that commit's SHA is recorded as `generated_from_ref`. This avoids the circular claim (building from a commit that lacks its own source) that made v5.5.4's label untrue.

## Composition (vs v5.5.4 release tree)

Changed (7, active identity): `00, 01, 02, 22, 25, 28, 29`. Unchanged (23): `03–21, 23, 24, 26, 27`. Authoritative in `support/MANIFEST.json`.

## Contents

```text
dist/SoT30_v5.5.5.zip   (root SoT30_v5.5.5/, 1,130,433 bytes)
governance/releases/2026-07-21-sot30-v5-5-5-provenance/
├── README.md · QC_REPORT.md · PACKAGE_RECEIPT.md
├── knowledge/00..29.md
└── support/ (PROJECT_INSTRUCTIONS_SOT30.md · MANIFEST.json · SHA256SUMS)
```

## Upload procedure

1. Business/Pro/Enterprise/Edu plan (40-file ceiling; 30 files). Upload in 3 batches of ≤10, verify count = 30.
2. Confirm project-only memory before claiming isolation.
3. Paste `support/PROJECT_INSTRUCTIONS_SOT30.md` into Project Instructions.
4. Run `T01`–`T93` (file 28) in a fresh chat, record outcomes + the 30 manifest-hash matches to close `LIVE-PROJECT-PASS` (T93).

## What this package does NOT claim

- No live ChatGPT Project upload/retrieval has been performed; T01–T93 are not live-run.
- No runtime, Supabase, or memory-policy change — provenance/version only.
- ADR-20260721-01 is `accepted` (architectural); this is **not** a live-Project verification.
- v5.5.4 remains immutable; its ZIP is not rewritten.
