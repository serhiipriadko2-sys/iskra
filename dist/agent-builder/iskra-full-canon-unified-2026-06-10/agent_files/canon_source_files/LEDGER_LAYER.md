
# Ledger Layer Boundary

Ledger is the integrity and trace layer for repository/runtime changes. It is not a
replacement for GitHub history, Supabase live metadata, or Builder UI verification.

## Current Rule

For this Agent Builder package, ledger truth is checked through repository SoT/ledger gates
and package receipts. A local package file cannot claim live ledger status unless GitHub CI,
connector output, or an explicit receipt confirms it.

## Required Evidence

- repository `ledger/` files when present;
- manifest and QC receipts inside this package;
- PR/commit references for GitHub changes;
- Supabase function/schema receipts for live backend changes;
- Builder UI prompt acceptance for upload activation.

## Failure Mode

If manifest/QC says a file exists but GitHub returns 404, the ledger status is `FAIL` until
one of these happens:

1. the file is committed and manifest regenerated;
2. the file is intentionally removed from manifest/QC with a receipt;
3. an ADR marks the file legacy/provenance only.

Delta: ledger claims are tied back to concrete tree truth.
Omega: 0.84.
Lambda: revise whenever release gates or SoT ledger workflows change.
