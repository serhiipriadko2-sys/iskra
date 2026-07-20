# Prune stale/divergent SoT30 dist zips (keep v5.5.3 canonical)

Follow-up after SoT30 v5.5.3 merged (`ADR-20260720-01`). `dist/` held three SoT30
archives; two are removed:

- `dist/SoT30_v5.5.1.zip` — superseded twice.
- `dist/SoT30_v5.5.2.zip` — divergent from canon (its files 06, 09, and 24 don't match the
  committed release-tree blobs; missing the v5.5.2 veto/usage fixes and carrying
  the stale file-24 value). It never matched canon.

`dist/SoT30_v5.5.3.zip` is kept as the single canonical package — the first whose
zip, SHA256SUMS, MANIFEST, and embedded file-29 table all agree with the
committed knowledge. Regenerated canon index (net 3244: two dist-zip nodes removed, two governance nodes added) and ledger (820 files).

No knowledge-file, release-tree, ledger-of-record, runtime, or Supabase change.
Both removed files remain recoverable from git history.
