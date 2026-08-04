# Supabase data-less staging and advisor receipt — 2026-07-31

Status: `MANUAL_DATALESS_REPAIR_PASS`; clean replay PASS; final preview acceptance PASS; production DB promotion remains blocked.

Production project: `typcvaszcfdpkzbjzuur`.
Staging branch ID: `34468814-3afa-4704-b28f-2d0216bf99c3`.
Staging project ref: `iaplmwwpzizmdrrwpkvw`.
Staging name: `advisor-provenance-staging-20260731`.
Branch configuration: `with_data=false`, `persistent=false`.

## Boundary

This receipt is separate from the successful IskraSpace Edge production deploy. No production database migration, Auth change, grant change, index operation, extension move or production data write occurred.

The preview database was created without copied production data. Repository migrations seed eight shared Graph nodes and one system `public.users` row; these are migration-created rows, not copied production records.

## Automatic replay result

The hosted branch replay failed after recording:

`20260718191950_supabase_acl_and_graph_contract_hardening`

Branch metadata remains `MIGRATIONS_FAILED`, while the preview Postgres service is `ACTIVE_HEALTHY`. The failure reproduces the known drift-dependent boundary before `20260718194551_optimize_rls_initplan`.

This automatic failure is not relabeled as a clean replay PASS.

## Missing prerequisite discovered

Preflight found that `20260728183421_parallax_memory_gate` references `iskra_memory.gateway_events`, but no tracked migration created that table. Production catalog evidence showed an existing untracked object with:

- 13 columns;
- 7 constraints;
- 4 indexes including the primary key;
- RLS enabled;
- `gateway_events_deny_clients` for `anon, authenticated`;
- no client grants and full `service_role` table grants;
- comment `Audit receipts for iskra-memory-gateway Project-facing boundary calls.`

No original creation migration was found in the `iskra` or `parallax` repository searches. Therefore the repository adds:

`supabase/migrations/20260728180000_reconcile_gateway_events_live_schema.sql`

Classification: `forward-only schema-snapshot reconstruction`, not a recovered original body.

GitHub blob SHA-1: `786f54c46ed83e81f889ebd0a49e3115fbc745a8`.
Bytes: `5396`.
SHA-256: `21e066e4449ef2547ea88d1e8a4d88c9486ca7f863c67a0a40a3ffd01fbe1491`.

Staging read-back matched production on columns, defaults, constraints, indexes, RLS, deny policy, grants, owner and table comment.

## Manual data-less repair chain

The following bodies were applied sequentially to the disposable staging database. Each tool call returned success and each migration was recorded as one statement:

1. `reconcile_gateway_events_live_schema_staging`;
2. `replay_20260718194551_optimize_rls_initplan`;
3. `replay_20260718194835_consolidate_rls_policies`;
4. `replay_20260718200634_restore_closed_beta_graph_acl`;
5. `replay_20260728171718_revoke_direct_execute_on_graph_trigger_function`;
6. `replay_20260728183421_parallax_memory_gate`.

This proves the forward repair chain on a data-less database. A later independent
GitHub Actions clean replay also passed from an empty local Supabase stack on PR
head `86051688e31fd01279d36a31921fe959ffd41766` (run `30663869451`). The hosted
preview's automatic replay failure remains a separate platform result and is not
rewritten as PASS.

## Postconditions

- Six manual migration receipts recorded.
- Graph policies assigned to `public` or `anon`: `0`.
- Exact memory deny policies: `11/11`.
- Direct EXECUTE on `prevent_graph_node_cross_owner_cascade()`:
  - `authenticated=false`;
  - `anon=false`;
  - `public=false`;
  - ACL read-back: `postgres=X/postgres`.
- `iskra_memory.gateway_events` rows: `0`.
- `iskra_memory.memory_consent_registry` rows: `0`.
- `anon` has no SELECT grant on Graph tables.
- `anon` and `authenticated` have no SELECT grant on `gateway_events`.
- `service_role` retains intended memory-table access.

A full temporary two-principal behavioral fixture was attempted. The first two attempts correctly rolled back on fixture-contract errors and left zero fixture rows. The final corrected attempt was blocked by the tool safety layer before execution. Therefore two-principal runtime acceptance is `NOT_RUN`, not PASS.

## Final preview follow-up — 2026-08-04

The final PR preview `opygpmrvjlcfwvydxcic` (branch
`bc9ef83b-7bbb-4fe6-a714-e98bbd0d9662`) automatically recorded all tracked
migrations through `20260728183421`. Read-back returned zero public/anonymous
Graph policies, ten authenticated Graph policies, eleven exact memory deny
policies, and no direct trigger-helper EXECUTE for `authenticated`, `anon` or
`public`.

The first harness attempt did not start Vitest because the new worktree had no
installed dependencies. Cleanup still removed all four principals and all
fixtures. After `pnpm install --frozen-lockfile`, the next run exposed two
preview-environment issues rather than a migration regression:

- the PR preview had not inherited the seven test-boundary Edge secret names,
  so both functions rejected the acceptance origin;
- freshly issued Auth tokens could briefly reach PostgREST before its clock
  accepted their `iat`, returning `PGRST303` (`JWT issued at future`).

The preview-only secret plane was configured with the approved local acceptance
origin, fail-closed production environment mode, development wildcard disabled,
`cf-connecting-ip`, a fresh non-recorded HMAC secret and test mode enabled. The
harness now polls a harmless authenticated zero-row REST query for at most 30
seconds and retries only `PGRST303`; every other status fails immediately. No
credential value is recorded. Local Windows-checkout harness receipt: 13,455
bytes, SHA-256
`8185917be368d95764e900235a84380e69e03a6dcad414f11f1a46e74ae16a58`.

Final result: seven files and 61/61 tests passed. Four distinct principals were
created, two were active members, and anonymous, non-member, suspended-member,
two-principal RLS/Graph/RPC, CORS/JWT and quota-spoof controls passed. Cleanup
returned `DB_EXIT=0`, `AUTH_ERRORS=0`, `PRINCIPALS=4`, `CLEANUP_OK=true`.
Post-cleanup catalog read-back found zero acceptance Auth users, beta members or
public user profiles.

## Advisor before/after

### Security

| Category | Before | After | Delta |
| --- | ---: | ---: | ---: |
| Total | 34 | 24 | -10 |
| `rls_enabled_no_policy` | 12 | 3 | -9 |
| `function_search_path_mutable` | 7 | 7 | 0 |
| `extension_in_public` | 1 | 1 | 0 |
| `authenticated_security_definer_function_executable` | 14 | 13 | -1 |

The nine removed RLS/no-policy notices were the memory tables now covered by deny policies. The removed SECURITY DEFINER notice was the trigger-only helper. The remaining 13 authenticated RPC notices require body and contract review rather than blanket revocation.

### Performance

| Category | Before | After | Delta |
| --- | ---: | ---: | ---: |
| Total | 46 | 46 | 0 |
| `unindexed_foreign_keys` | 3 | 4 | +1 |
| `auth_rls_initplan` | 2 | 0 | -2 |
| `unused_index` | 38 | 41 | +3 |
| `multiple_permissive_policies` | 2 | 0 | -2 |
| `auth_db_connections_absolute` | 1 | 1 | 0 |

The added FK and unused-index INFO notices come from exact live-parity reconstruction of `gateway_events`. They are not automatically remediated because advisor counts alone do not prove an index should be added or removed.

## Production gate

Production DB promotion remains blocked until all of the following are complete:

1. Clean replay and integrity CI pass again on the final receipt-bearing PR head.
2. Review the remaining Graph table grants and authenticated SECURITY DEFINER contracts required by ADR-20260731-001; the 61-test matrix does not prove every warned RPC or GraphQL/grant surface.
3. Approve exact migration scope, forward-repair plan and post-apply read-back in a separate production promotion step.

## ∆DΩΛ

∆: live-only migration provenance and the hidden `gateway_events` prerequisite are now explicit; the repair chain is proven on a disposable data-less database.
D: production migration statements and catalogs → GitHub exact/reconstructed files → data-less branch → advisor before → six staged migrations → policy/grant/history read-back → advisor after.
Ω: 0.96 for exact recovered bodies, clean replay, final preview acceptance and staging metadata postconditions; 0.86 for production readiness because final-head CI and the remaining grant/RPC governance scope are still open.
Λ: revise after PR CI clean replay, successful two-principal acceptance, or any change to production migration history or `gateway_events` schema.
