# Supabase production DB preflight — 2026-08-04

Status: `READ_ONLY_PREFLIGHT_PASS`; production DB apply NOT RUN.

Production project: `typcvaszcfdpkzbjzuur`.
Candidate PR: `#329`.

## Boundary

This receipt contains only production catalog reads and a Supabase CLI
`db push --dry-run --linked --include-all`. It did not apply SQL, change Auth,
write application rows, alter grants or record a migration version.

## Exact dry-run scope

Pinned CLI `2.109.0` reported exactly two pending repository migrations:

1. `20260718200634_restore_closed_beta_graph_acl.sql`;
2. `20260728180000_reconcile_gateway_events_live_schema.sql`.

The first attempt stopped before connection on a TLS handshake timeout. The
second attempt completed and printed `DRY RUN: migrations will not be pushed`.
No other SQL migration was selected. Non-migration manifest/provenance files
were skipped by filename validation.

## Existing gateway-events contract

Read-only production catalog comparison against the reconstruction migration
returned PASS for:

- all 13 columns, order, types, nullability and defaults;
- RLS enabled;
- primary key plus the three expected indexes;
- seven constraints;
- exact `gateway_events_deny_clients` policy;
- no table grants for `PUBLIC`, `anon` or `authenticated`;
- all seven table privileges for `service_role`;
- exact table comment.

The table contained seven existing rows. The candidate migration contains no
row DML and must preserve them. The `create table if not exists`, index and
policy-creation paths are no-ops against the observed object. RLS, grants and
the comment are reasserted idempotently; recording migration version
`20260728180000` is an intentional history change, so the whole migration is
not described as byte-for-byte no-op.

Neither `20260718200634` nor `20260728180000` was recorded in production at
preflight time.

## Preview acceptance

The PR preview `opygpmrvjlcfwvydxcic` recorded the complete migration chain and
passed 61/61 live acceptance tests with four disposable principals and verified
cleanup. Clean replay on PR head `9dac828cdd7b849b46f474b76f85b5bce781898f`
also passed in both push and pull-request workflow runs.

## Stop conditions and forward repair

Production apply remains stopped if final-head CI changes, the dry-run selects
anything other than the two files above, the production catalog preconditions
change, or the remaining ADR-20260731-001 grant/RPC review finds an unsupported
client surface.

Both migrations are transactional. A statement failure rolls back that
migration. After a successful security migration, rollback-by-reopening public
Graph policy scope is forbidden; any defect must use a reviewed forward repair.
Post-apply verification must read back migration history, Graph policies,
function ACL, `gateway_events` shape and row count, advisors and scoped logs.

## ∆DΩΛ

∆: production pending scope and reconstruction preconditions are now explicit
without mutating production.
D: production catalogs, repository SQL, Supabase CLI 2.109.0 dry-run, final PR
preview and exact-head CI.
Ω: 0.96 for the two-file dry-run scope and gateway-events preconditions; lower
for production behavior until the separate promotion gate completes.
Λ: invalidate on any production migration/catalog change, final-head CI change
or new grant/RPC finding.
