# SoT30 v5.5.3 — Instructions Version Sync + Hash-Chain Repair

Status: reviewable full-corpus package; live ChatGPT Project verification pending. **Amended 2026-07-20** (ADR-20260719-01 Decisions 4–6): after automated review, also repaired file 29's embedded manifest table, synced version frontmatter (02/22/28/29 → v5.5.3), and marked file 26's stale kernel anchor. Hash chain fully regenerated; round-trip 32/32 OK.

## What this is

A small patch over v5.5.2 that fixes two integrity issues found while syncing a stale version label:

1. **Version-label sync (the intended fix).** `00_PROJECT_ROUTER.md`'s embedded Project Instructions mirror and the standalone `support/PROJECT_INSTRUCTIONS_SOT30.md` both still read "SoT30 v5.5.1" — stale by two package versions, though raw-equal to each other (T80 parity held throughout this patch). Both now read "SoT30 v5.5.3". No other content change.
2. **Hash-chain repair (found while building this patch).** An external commit (`82191ce`, "sync live migration timestamps and finalize SoT30 package hashes") had overwritten v5.5.2's `support/SHA256SUMS`/`MANIFEST.json` with values that do not match the real, LF-normalized file content. My own original v5.5.2 commit (`31340c5`) had correct values; the later commit broke them. **Knowledge-file content was never affected** — only the verification metadata. This build re-derives every hash from git's canonical blob content (bypassing the corrupted working-tree state) and ships a verified-correct chain.

**Separately noted, not fixed:** `24_INTERFACE_STYLE.md` carries a hash on record since v5.5.1 that has never matched its real content (18-byte gap; verified via raw `git cat-file`, not a CRLF artifact — the file has zero CRLF sequences). This predates this session's work entirely; root cause unresolved. This build records the file's true current hash for the first time rather than propagating the stale value further. See `governance/adr_20260719_sot30_v5_5_3_instructions_version_sync.md` for full detail.

## Composition arithmetic (30 files, no new content changes)

```
28 unchanged content from v5.5.2 (re-verified against git's canonical blob, not the working tree)
+  1 version-label-only change (00 — "v5.5.1" → "v5.5.3", 2 characters)
+  1 regenerated (29 — hash table)
= 30
```

## Contents

```text
dist/SoT30_v5.5.3.zip
governance/releases/2026-07-19-sot30-v5-5-3-instructions-version-sync/
├── README.md            (this file)
├── QC_REPORT.md
├── PACKAGE_RECEIPT.md
├── knowledge/00..29.md
└── support/
    ├── PROJECT_INSTRUCTIONS_SOT30.md   (version label synced to v5.5.3; content otherwise unchanged)
    ├── MANIFEST.json                   (bytes + sha256 for all 30, re-derived from canonical git blobs)
    └── SHA256SUMS                      (all 30 + instructions + MANIFEST.json; sha256sum -c support/SHA256SUMS from package root)
```

## Upload procedure

1. Business/Pro/Enterprise/Edu plan (40-file ceiling; this package is 30). Upload in 3 batches of ≤10, verify count = 30.
2. Confirm project-only memory before claiming isolation.
3. Paste `support/PROJECT_INSTRUCTIONS_SOT30.md` into Project Instructions.
4. Run `T01`–`T87` (file 28) in a fresh chat, record outcomes to close `LIVE-PROJECT-PASS`.

## What this package does NOT claim

- No live ChatGPT Project upload/retrieval has been performed for this exact build.
- No runtime, Supabase, or GitHub-app-behavior change.
- File 24's internal stubs and its unresolved legacy hash discrepancy are unchanged/unexplained — flagged, not fixed, here.
