# iskraSpace Supabase Live Cleanup Plan

Status: SAFE PLAN / NO LIVE MUTATION
Date: 2026-06-08
Scope: Supabase live cleanup before public `runtime/iskraSpace` release
Project: `AgiIskra / typcvaszcfdpkzbjzuur`

## Purpose

This plan defines the next live-facing Supabase cleanup pass without performing
it. The public release should not retain live-only diagnostic or support
functions unless their owner, access boundary, and expiry are explicit.

## Current Read-Only Baseline

The latest connector read confirmed:

- `gemini`: ACTIVE, `verify_jwt=true`, release-required for direct
  `runtime/iskraSpace`.
- `db-proxy`: ACTIVE, `verify_jwt=true`, internal/support.
- `iskra-canon-import-1536`: ACTIVE, `verify_jwt=false`, internal/support.
- `iskra-canon-backfill-1536`: ACTIVE, `verify_jwt=false`,
  internal/support.
- `iskra-canon-import-diagnostic`: ACTIVE, `verify_jwt=false`, retire path.
- `embed`: not live; required only if engine/web retrieval or a documented
  hybrid is promoted.

No secret values are recorded in this document.

## Preferred Cleanup Path

1. Freeze a fresh read-only baseline:
   - function list,
   - migration list,
   - advisors where available,
   - grants/API exposure where available,
   - logs/caller inventory where available.
2. Remove `iskra-canon-import-diagnostic` from live before public release.
3. Attach a post-removal function list receipt.
4. Keep `gemini` as the direct `runtime/iskraSpace` release function.
5. Keep `embed` repo source, but do not deploy it unless engine/web retrieval
   is promoted into the public release path.

## Allowed Diagnostic Exception

Keeping `iskra-canon-import-diagnostic` is allowed only with a time-boxed ADR
that records:

- owner,
- reason,
- expiry date,
- access boundary,
- expected log evidence,
- rollback/removal trigger.

The exception must expire before public release sign-off unless a new explicit
release decision accepts the risk.

## Internal/Support Function Decisions

For `db-proxy`, record before release:

- owner,
- why it exists,
- allowlist review,
- who can call it,
- what logs prove safe use,
- disable policy,
- rollback path.

For `iskra-canon-import-1536` and `iskra-canon-backfill-1536`, record before
release:

- owner,
- whether import/backfill is complete,
- whether the function can be removed,
- if retained, who can call it and why,
- expiry/removal date,
- rollback path,
- post-change function list receipt.

Because the import/backfill functions are live with `verify_jwt=false`, they
must be removed, protected, or covered by an accepted time-boxed ADR before
public release.

## Pre-Mutation Requirements

Do not mutate live Supabase until the execution PR contains:

- exact target function names,
- expected before/after function list,
- rollback or redeploy plan,
- advisor/grant/log baseline or an explicit note that the connector could not
  provide it,
- issue or PR receipt target,
- explicit approval for the live operation.

## Verification

PASS for the future execution pass means:

- diagnostic function removed or covered by accepted time-boxed ADR,
- internal/support functions have owner/access/expiry decisions,
- post-change function list attached,
- no secret values are written to Git,
- `runtime/iskraSpace` still uses direct `gemini` path unless release scope is
  changed.

FAIL if:

- live mutation occurs without approval,
- unauthenticated diagnostic/support functions remain without exception,
- `embed` is treated as direct-runtime required without a public scope change.

## Delta Receipt

Delta: Supabase cleanup is separated from the Vercel/Cloud Run release-gate PR.

D: read-only Supabase connector baseline, release boundary docs, open loops.

Omega: 0.9 for observed functions; 0.65 for full backend release safety until
advisors, grants, logs, and owner decisions are attached.

Lambda: revise after any live function delete/deploy, advisor baseline, or public
target change.

