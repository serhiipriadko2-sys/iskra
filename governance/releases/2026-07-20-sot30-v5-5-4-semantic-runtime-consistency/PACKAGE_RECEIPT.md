# SoT30 v5.5.4 — Receipt

Assembled in-session 2026-07-20 by Claude Code from the v5.5.3 corpus (`governance/releases/2026-07-19-sot30-v5-5-3-instructions-version-sync/`) as baseline, under ADR-20260720-02 (status `proposed`). v5.5.3 was physically intact; v5.5.4 repairs semantic and runtime-status drift inside the uploadable corpus and adds a fail-closed semantic verifier.

## Artifact

| Item | Value |
|---|---|
| ZIP | `dist/SoT30_v5.5.4.zip` |
| ZIP bytes | __ZIP_BYTES__ |
| ZIP sha256 | `__ZIP_SHA__` |
| Knowledge files | 30 (00–29, unique) |
| Corpus bytes | __CORPUS_BYTES__ |
| file 29 sha256 | `__F29_SHA__` |
| Project Instructions | 5996 chars; T80 raw-equal to file 00 mirror (byte-unchanged from v5.5.3) |
| Acceptance range | T01–T93 (T88–T93 added this build) |
| Baseline | v5.5.3 release-tree `knowledge/` blob content |
| Hash-chain derived from | final LF-normalized `knowledge/` content (build script) |
| Changed vs v5.5.3 (authoritative) | `support/MANIFEST.json` `changed_files` (disjoint from `unchanged_files`, union = 30) |

## What changed vs v5.5.3

Content edits (in-zip, affect hashes): file 29 (narrative), 11/20/01 (Guard lifecycle overlay), 15 (Supabase overlay), 25 (historical-Ω gloss + provenance), 24 (reference-quarantine overlay), 28 (T88–T93). `support/MANIFEST.json` / `SHA256SUMS` / file-29 embedded table / zip regenerated. Repo-side (not in zip): README, QC_REPORT, this receipt, ADR, `governance/audits/2026-07-20-sot30-v554/`, `tools/verify_sot30_release.ts`, CI wiring, ledger, canon-index.

`support/PROJECT_INSTRUCTIONS_SOT30.md` and file 00's embedded mirror are **byte-unchanged** from v5.5.3 (T80 parity held, 5,996 chars).

## Verification performed

- Semantic verifier `tools/verify_sot30_release.ts` (fail-closed): 30 files, 00–29 unique, SHA256SUMS correct, MANIFEST matches actual bytes/hashes, file-29 table matches 00–28, no self-hash in 29, T80 raw-equal, character count recorded not hard-coded, changed∩unchanged=∅, changed∪unchanged=30, composition matches actual diff, versions consistent, `live_project_verified=false`, ZIP round-trip, LF policy, no absolute paths/secrets/node_modules, receipt carries real zip hash+bytes, no stale "28 unchanged".
- Bounded-Guard overlay cross-checked against `runtime/src/types/guardController.ts` and `runtime/iskraSpace/services/policyEngine.ts` (proxy `postGuardEws` confirmed at policyEngine.ts:487–496).
- Supabase overlay from read-only MCP observation, stamped `observed_at`.
- File 24 raw-blob diff receipt under `governance/audits/2026-07-20-sot30-v554/`.
- ZIP `unzip -t` clean; round-trip `sha256sum -c support/SHA256SUMS` from a fresh extraction = 32/32 OK.

## Boundary

- NOT uploaded to a live ChatGPT Project. NOT T01–T93-run live.
- NOT a runtime / Supabase-write / deployment change. `iskra-memory-gateway` untouched.
- ADR-20260720-02 is `proposed`, not `accepted`.
