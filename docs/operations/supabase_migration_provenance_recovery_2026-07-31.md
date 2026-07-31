# Supabase migration provenance recovery — 2026-07-31

Status: `LIVE_BODIES_RECOVERED`; clean replay and staging pending.

Production project: `typcvaszcfdpkzbjzuur`.
Repository branch: `fix/supabase-migration-provenance-20260731`.
Base: `aeb3b9087190b55b13f8e176b11c459483aa3fcd` (stacked on PR #328).

## Boundary

This receipt is read-only with respect to production Supabase. It recovers exact migration bytes into Git and records their provenance. It does not apply SQL, create a staging branch, change Auth, change grants or alter production traffic.

## Recovered applied bodies

Production `supabase_migrations.schema_migrations` contains one statement for each live-only migration. The exact UTF-8 `statements[1]` values were recovered under their live version and name:

| Live version | Live name | Repo path | Bytes | SHA-256 | Exact live match |
| --- | --- | --- | ---: | --- | --- |
| `20260728171718` | `revoke_direct_execute_on_graph_trigger_function` | `supabase/migrations/20260728171718_revoke_direct_execute_on_graph_trigger_function.sql` | 283 | `b2b63f7a3adbd20cb0e3641571b27863bf5fbae9cc3d82471bc42468347dd337` | PASS |
| `20260728183421` | `parallax_memory_gate` | `supabase/migrations/20260728183421_parallax_memory_gate.sql` | 2523 | `8fb653f1926f3ea0217a3c6c78d2a7ad6cde6b7afdb8b5ecce4db61f8f9ea718` | PASS |

GitHub read-back blob SHA-1 values:

- graph-trigger revoke: `179f97e306096701ad2145c1e2b30b84263c9a99`;
- PARALLAX memory gate: `70ac2651de227e3177b37adce9a6651767605be5`.

## Source provenance

Related source files were found in `serhiipriadko2-sys/parallax` at commit `0489a6bc1b33fc39740338c6f2962cb6449dd7cd`:

- `20260728190000_revoke_graph_trigger_execute.sql` — 289 bytes, SHA-256 `c384163af19942b03b02b87b93e763339a61067c7acbeb5c4a9932fdddfb496a`;
- `20260728193000_parallax_memory_gate.sql` — 2534 bytes, SHA-256 `708501f97a4f93d3c28d6ae19de84d69c73cc025323244856c6fc80b726c304a`.

These files are not byte-identical to the production statements because their whitespace formatting differs. Removing all whitespace produces identical SQL token streams for both pairs. The recovered `iskra` files therefore use the production statement bytes, while the `parallax` files remain provenance sources rather than applied-byte receipts.

## Remaining migration conflict

Repository migration `20260718200634_restore_closed_beta_graph_acl.sql` is not recorded in production migration history. This remains a repo-only pending security migration. Recovering the two live-only bodies closes the missing-source side of the drift; it does not authorize applying `20260718200634` to production.

## Machine manifest

`supabase/migrations/MANIFEST_2026-07-31_LIVE_RECOVERY.json`

## Next gates

1. Clean replay from an empty database using the stacked branch migration order.
2. Confirm the data-less branch cost and create a staging branch.
3. Capture security/performance advisors before remediation.
4. Apply only the reviewed forward migration set on staging.
5. Run anonymous, non-member, suspended and two-principal Graph/RPC/REST tests.
6. Capture advisors, policies, grants, functions and migration history after remediation.
7. Delete staging after evidence is complete.
8. Prepare a separate production DB promotion proposal; do not merge it into the completed Edge release.

Current Supabase branch price observed for the `kate` organization: `$0.01344/hour`. No branch has been created by this receipt.

## ∆DΩΛ

∆: two live-only production migration receipts now have exact repository bodies and cryptographic provenance.
D: production `schema_migrations.statements[1]` → SHA-256/bytes → GitHub write → GitHub read-back → exact equality test.
Ω: 0.95 for the recovered applied bytes; clean replay and staging remain unverified.
Λ: revise if GitHub read-back changes, production migration history changes, or clean replay exposes an ordering/dependency conflict.
