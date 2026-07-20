# ADR-20260720-01: Prune stale/divergent SoT30 dist zips (keep v5.5.3 canonical)

Status: proposed — awaiting owner acceptance.

Date: 2026-07-20

Owner / Builder: Семён / Искра (Claude Code)

## Context

After SoT30 v5.5.3 merged (`ADR-20260719-01`, PR #285), `dist/` carried three
SoT30 archives:

- `dist/SoT30_v5.5.1.zip` — superseded twice (by v5.5.2 backlog batch, then v5.5.3).
- `dist/SoT30_v5.5.2.zip` — **divergent from canon.** Verified by git: its
  `06_SECURITY_INTEGRITY.md`/`09_METRICS_ENGINE.md`/`24_INTERFACE_STYLE.md`
  (`1035b689…`/`0f6b0ee5…`/`325355071ad4…`) do **not** match the committed
  v5.5.2 release-tree blobs (`1271e23c…`/`0a5d3951…`/`364380ff…`). The zip was
  built from content that diverged from the committed source of truth — it lacks
  the v5.5.2 veto fix in 06, the usage field in 09, and carries the stale file-24
  value. It never matched canon and should not be uploaded.
- `dist/SoT30_v5.5.3.zip` — the canonical package: the first whose zip,
  `support/SHA256SUMS`, `support/MANIFEST.json`, and embedded file-29 table all
  agree with the committed knowledge (round-trip 32/32 OK).

A future uploader taking "the SoT30 package" from `dist/` could grab a stale or
divergent one. Same risk pattern and remedy as the earlier `SoT30_v5.4.zip`
removal (`ADR-20260716-03` follow-up).

## Decision

Remove `dist/SoT30_v5.5.1.zip` and `dist/SoT30_v5.5.2.zip` so `dist/SoT30_v5.5.3.zip`
is the single canonical SoT30 package. Regenerate `apps/iskra-site` canon index (the two dist-zip nodes are
removed; this ADR and its changelog add two governance nodes, so the index nets
to 3244) and the ledger.

Historical governance records and the extracted release trees
(`governance/releases/2026-07-16-...v5-5-1-...`, `2026-07-18-...v5-5-2-...`,
`2026-07-19-...v5-5-3-...`) are left unchanged — they accurately record what
happened and remain the authoritative rollback sources (rollback targets the
committed release-tree blobs, never the zips). Both removed files remain
recoverable from git history if ever needed.

## Evidence

- Divergence proof: `git show origin/main:dist/SoT30_v5.5.2.zip` extracted and
  hashed vs the committed release-tree blobs — mismatch in files 06, 09, and 24 (documented in
  `ADR-20260719-01` Decision 7 and the v5.5.3 PACKAGE_RECEIPT provenance note).
- Post-prune gates: `canon:index:check` up to date (3244 nodes; two dist-zip nodes removed,
  two governance nodes added); `verify_ledger` OK (820 files).

## Risk

- None to canon content: no knowledge file, release tree, ledger-of-record, or
  runtime/Supabase change. Only two convenience artifacts under `dist/` (removed)
  and the regenerated canon-index/ledger.

## Rollback

`git checkout HEAD~1 -- dist/SoT30_v5.5.1.zip dist/SoT30_v5.5.2.zip` and
regenerate the index/ledger; this ADR → `superseded`.

## Status

`proposed`. No runtime, Supabase, or GitHub-app-behavior change.
