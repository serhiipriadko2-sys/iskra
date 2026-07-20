# SoT30 v5.5.4 — Semantic & Runtime-Status Consistency

Status: **accepted** (ADR-20260720-02, owner decision 2026-07-20). Full-corpus package merged (PR #289); live ChatGPT Project verification pending. Built from the v5.5.3 corpus as baseline; `dist/SoT30_v5.5.3.zip` is unchanged and remains the immutable historical release.

<!-- composition: changed=10 unchanged=20 baseline=v5.5.3 -->

> **Dated qualification (2026-07-20, PR-C).** The verifier that gated this build proved several properties (T88, T80, forbidden-content scan) more weakly than their labels implied; it is hardened in PR-C (`fix/sot30-v554-verifier-hardening`) with a negative-fixture test matrix. **Package bytes are unchanged.** One internal inaccuracy — `support/MANIFEST.json` `generated_from: canonical_git_blobs` (the build read release-tree working bytes) — is recorded as an erratum with the byte-fix deferred to v5.5.5. See `governance/errata/2026-07-20-sot30-v5-5-4-erratum.md`.

## What this is

v5.5.3 was **physically** intact (fresh-extraction `sha256sum -c` = 32/32). v5.5.4 corrects **semantic and runtime-status drift** that lives inside the Knowledge/support prose an in-Project agent actually reads — the kind of defect a hash check cannot catch. Four separate readiness levels are kept distinct throughout; none implies the next:

| Level | What it attests | v5.5.4 status |
|---|---|---|
| **physical integrity** | zip bytes, `sha256sum -c`, LF policy | PASS (this build) |
| **semantic consistency** | narrative matches the actual diff; manifest sets disjoint+total | PASS (this build, verifier-enforced) |
| **runtime-status consistency** | overlays match `runtime/` + read-only Supabase, with provenance | PASS (this build) |
| **live-Project verification** | 30 files uploaded, T01–T93 run in a fresh Project | **NOT PERFORMED** |

This package is **not** described as "production-ready." STATIC-PACKAGE-PASS does not imply LIVE-PROJECT-PASS.

## What v5.5.4 changes (vs the v5.5.3 release tree)

- **file 29** — composition narrative rewritten: no more "28 files unchanged"; changed/unchanged is the manifest's disjoint+total computation, plus explicit three-baseline (release-tree / dist-zip / live-Project) separation.
- **`support/MANIFEST.json`** — new schema; `changed_files ∩ unchanged_files = ∅` and their union = all 30; adds `package_version`, `baseline_release`, `generated_from`, `line_ending_policy`, `live_project_verified`.
- **files 11 / 20 / 01** — bounded-Guard lifecycle synced to `runtime/`: controller implemented and wired, but `postGuardEws` documented as a decision-derived **proxy**, not a true late-signal EWS (E2E-unverified).
- **file 15** — Supabase overlay stamped `observed_at` / `source` / `freshness`; migration-parity / live-schema / data-counts / edge-deployment / Projects-Action kept as independent facts.
- **file 25** — historical `Ω = 1.0` / `Ω = 0.97` Bushido signatures given a top-level gloss (active invariant remains `Ω ≤ 0.95`); package-frontmatter provenance clarified.
- **file 24** — reference/historical-mirror quarantine overlay; a raw-blob diff receipt under `governance/audits/2026-07-20-sot30-v554/` **verifies** the root cause: two `auth.uid()` → `(select auth.uid())` RLS-initplan optimizations (+18 bytes fully accounted, zero CRLF) — benign, not a corruption.
- **file 28** — acceptance cases **T88–T93** added (narrative consistency, overlay freshness, ontology quarantine, external-source conflict, post-guard-EWS authenticity, project-package identity).

The exact per-file changed/unchanged split is authoritative in `support/MANIFEST.json`, computed at build time from LF-normalized content — this README does not hard-code a count.

## Contents

```text
dist/SoT30_v5.5.4.zip
governance/releases/2026-07-20-sot30-v5-5-4-semantic-runtime-consistency/
├── README.md            (this file)
├── QC_REPORT.md
├── PACKAGE_RECEIPT.md
├── knowledge/00..29.md
└── support/
    ├── PROJECT_INSTRUCTIONS_SOT30.md   (unchanged from v5.5.3; T80 raw-equal to file 00 mirror)
    ├── MANIFEST.json                   (new schema; disjoint+total changed/unchanged; sha256 for all 30)
    └── SHA256SUMS                      (all 30 + instructions + MANIFEST.json; sha256sum -c from package root)
governance/audits/2026-07-20-sot30-v554/
├── FILE24_RAW_BLOB_DIFF.patch
└── FILE24_PROVENANCE_RECEIPT.json
```

## Upload procedure

1. Business/Pro/Enterprise/Edu plan (40-file ceiling; this package is 30). Upload in 3 batches of ≤10, verify count = 30.
2. Confirm project-only memory before claiming isolation.
3. Paste `support/PROJECT_INSTRUCTIONS_SOT30.md` into Project Instructions.
4. Run `T01`–`T93` (file 28) in a fresh chat, record outcomes + the 30 manifest-hash matches to close `LIVE-PROJECT-PASS` (T93).

## What this package does NOT claim

- No live ChatGPT Project upload/retrieval has been performed for this build; T01–T93 are not live-run.
- No runtime, Supabase, or GitHub-app-behavior change — the Guard/EWS and Supabase overlays *describe* current state, they do not modify it.
- `postGuardEws` is a decision-derived proxy; a true independently-observed late-signal EWS is E2E-unverified.
- File 24's root cause is `verified` this build (receipt fully accounts for the 18-byte gap); no further file-24 root-cause claim is pending.
- ADR-20260720-02 is `proposed`, not `accepted`.
