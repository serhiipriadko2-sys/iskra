# iskraSpace Supabase Cleanup Approval Packet

Status: APPROVAL REQUIRED / NO LIVE MUTATION
Date: 2026-06-09
Project: `AgiIskra / typcvaszcfdpkzbjzuur`
Scope: live Edge Function cleanup before public `runtime/iskraSpace` release

## Purpose

This packet converts the earlier cleanup plan into an approval-ready live
operation boundary. It does not delete, deploy, alter SQL, rotate secrets, or
change Supabase configuration.

The goal is to remove or explicitly contain live-only internal functions before
the public release signal is allowed to say "release-ready".

## Fresh Read-Only Baseline

Connector reads on 2026-06-09 observed:

- Project status: `ACTIVE_HEALTHY`.
- Region: `eu-west-1`.
- Database: Postgres `17.6.1.063`.
- Live `gemini`: version `5`, ACTIVE, `verify_jwt=true`.
- Live `db-proxy`: version `3`, ACTIVE, `verify_jwt=true`.
- Live `iskra-canon-import-1536`: version `3`, ACTIVE,
  `verify_jwt=false`.
- Live `iskra-canon-backfill-1536`: version `3`, ACTIVE,
  `verify_jwt=false`.
- Live `iskra-canon-import-diagnostic`: version `3`, ACTIVE,
  `verify_jwt=false`.
- Live `embed`: not present in the function list; direct `runtime/iskraSpace`
  uses `gemini` `embedContent`.

No secret values were read or written.

## Advisor Baseline

Supabase advisors were available during this approval refresh.

Security advisor themes observed:

- mutable function `search_path` warnings in `public`;
- `pg_trgm` installed in `public`;
- GraphQL exposure warnings for `public.graph_nodes` and
  `public.graph_edges` to `anon`;
- GraphQL exposure warnings for several `public` tables to
  `authenticated`, including user/workflow data tables.

Performance advisor themes observed:

- unindexed foreign keys in `iskra` and `public` tables;
- RLS init-plan warnings where auth/current-setting calls are re-evaluated per
  row;
- unused-index candidates across `public` and `iskra`;
- Auth connection allocation advice.

Interpretation: these advisors are real release hardening work, but they do not
replace the Edge Function cleanup blocker. Function cleanup can proceed first
because it reduces live HTTP attack surface and does not require SQL mutation.

## Recommended Live Action

### 1. Remove diagnostic

Preferred action: remove `iskra-canon-import-diagnostic` from live before
public release.

Reason:

- It is not tracked as a normal repo function source.
- It is live with `verify_jwt=false`.
- The read-back posture shows a diagnostic endpoint, not an app feature.
- The public `runtime/iskraSpace` path does not require it.

Release sign-off must remain blocked while this function is live unless an
accepted time-boxed ADR explicitly keeps it.

### 2. Retire or protect import/backfill

Preferred action: remove `iskra-canon-import-1536` and
`iskra-canon-backfill-1536` after confirming no final import/backfill window is
needed.

Allowed alternative: keep them only under a time-boxed ADR with owner, reason,
expiry, caller boundary, and post-window removal date.

Reason:

- Both are live with `verify_jwt=false`.
- Both are internal/support import functions, not direct public app features.
- Both use privileged server-side capabilities and should not remain as
  public unauthenticated HTTP surfaces.

### 3. Constrain or replace db-proxy

Preferred action: do not remove `db-proxy` in the same first live cleanup unless
caller inventory proves it is unused. Instead, mark it as temporary and require
the existing `docs/security/db_proxy_decision_v1.md` exit criteria.

Required before release sign-off:

- owner;
- caller inventory;
- allowlist review;
- log/audit expectations;
- disable policy;
- repo source-of-truth or replacement/removal path.

Reason:

- It has `verify_jwt=true`, so it is not the same immediate class as the
  unauthenticated support functions.
- It still represents a broad privileged tunnel and cannot be called
  release-clean without ownership and an exit path.

## Expected Before / After

Before:

| Function | Expected state before cleanup |
| --- | --- |
| `gemini` | ACTIVE, `verify_jwt=true`, version `5` |
| `db-proxy` | ACTIVE, `verify_jwt=true`, version `3` |
| `iskra-canon-import-1536` | ACTIVE, `verify_jwt=false`, version `3` |
| `iskra-canon-backfill-1536` | ACTIVE, `verify_jwt=false`, version `3` |
| `iskra-canon-import-diagnostic` | ACTIVE, `verify_jwt=false`, version `3` |

Minimal approved after-state:

| Function | Expected state after minimal cleanup |
| --- | --- |
| `gemini` | unchanged, ACTIVE, `verify_jwt=true` |
| `db-proxy` | unchanged but owner/disable policy recorded |
| `iskra-canon-import-1536` | removed, protected, or ADR-exempted |
| `iskra-canon-backfill-1536` | removed, protected, or ADR-exempted |
| `iskra-canon-import-diagnostic` | removed |

Stronger release after-state:

- `gemini` remains live and JWT-protected.
- `iskra-canon-import-diagnostic` is absent.
- `iskra-canon-import-1536` is absent.
- `iskra-canon-backfill-1536` is absent.
- `db-proxy` is removed or narrowed to an owned audited internal adapter.

## Rollback / Redeploy Boundary

Rollback should not restore a public unauthenticated diagnostic endpoint.

If diagnostic capability is unexpectedly needed:

1. redeploy a narrow diagnostic replacement only after explicit approval;
2. require JWT or an equivalent documented internal auth boundary;
3. avoid returning environment-presence probes unless a security owner approves;
4. attach a post-redeploy function list;
5. set an expiry date before public release sign-off.

For import/backfill rollback, prefer a short-lived redeploy window with
`verify_jwt=true` or a custom authenticated caller boundary. A restored
unauthenticated importer/backfiller remains a release blocker.

## Execution Limitation

The current connector exposed project details, Edge Function list/read-back, and
advisors. It did not expose a safe delete-function operation, recent Edge
Function logs, app data counts, or a full grants/RLS inventory in this pass.

Therefore the first live operation likely needs Supabase Dashboard or Supabase
CLI execution by an operator, followed by connector read-back verification.

## Approval Required

No live mutation is authorized by this document.

To authorize the first live operation, the owner must explicitly say:

`APPROVE live Supabase removal of iskra-canon-import-diagnostic on project typcvaszcfdpkzbjzuur`

For import/backfill removal, use a separate explicit approval phrase naming
both target functions:

`APPROVE live Supabase removal of iskra-canon-import-1536 and iskra-canon-backfill-1536 on project typcvaszcfdpkzbjzuur`

For any `db-proxy` delete, constrain, or redeploy operation, require a separate
approval because its hidden dependency risk is higher.

## Verification

PASS for the future live cleanup means:

- function list before/after is attached;
- `gemini` remains ACTIVE with `verify_jwt=true`;
- `iskra-canon-import-diagnostic` is absent or covered by accepted ADR;
- import/backfill functions are absent, protected, or covered by accepted ADR;
- `db-proxy` has owner, caller, allowlist, logs, and disable policy;
- no secrets are printed or committed;
- release docs still mark OpenAI live behavior as unverified until provider
  smoke passes.

FAIL if:

- any live mutation occurs without explicit approval;
- diagnostic remains public unauthenticated without ADR;
- import/backfill remain public unauthenticated without ADR;
- OpenAI support is marketed as verified before live OpenAI smoke.

## Delta Receipt

Delta: cleanup moved from general plan to explicit approval packet.

D: Supabase project/function/advisor read-only connector results, PR #202
post-merge baseline, `db-proxy` decision memo, release readiness snapshot.

Omega: 0.92 for observed project/function/advisor posture; 0.68 for hidden
caller risk around `db-proxy` until logs/caller inventory are available.

Lambda: revise after explicit live approval, function deletion/redeploy, OpenAI
provider smoke, or any public release target change.
