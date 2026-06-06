# iskraSpace Supabase Cleanup And Hardening Runbook

Status: SAFE PLAN / NO LIVE MUTATION
Date: 2026-06-07
Scope: public release gate for `runtime/iskraSpace`
Parent issue: https://github.com/serhiipriadko2-sys/iskra/issues/190
Follow-up issue: https://github.com/serhiipriadko2-sys/iskra/issues/192
Provenance baseline: https://github.com/serhiipriadko2-sys/iskra/pull/191

## Purpose

This runbook turns the Supabase provenance snapshot into an execution order.

The goal is simple: the public `iskraSpace` release should depend only on Supabase behavior that is documented in Git, reviewed, and intentionally kept. Debug doors, temporary import doors, and broad data access should not become part of the public product by accident.

This document does not change production. It defines the safe order for the next PRs and live checks.

## Current Release Boundary

`runtime/iskraSpace` is the public-release application.

- Public release path: behavior directly needed by `runtime/iskraSpace` users.
- Internal/support path: operator, import, backfill, maintenance, diagnostics, or one-time setup behavior.
- Retire path: behavior that should be removed before public release unless a time-boxed ADR exception is accepted.

## Function Decisions

| Function | Current decision | Release impact | Required action before public release |
| --- | --- | --- | --- |
| `gemini` | `release-required` | Public app AI bridge. | Keep. Verify deployed code matches repo source and auth path. |
| `db-proxy` | `internal/support` | Powerful operator database proxy. Not a public feature. | Add owner, allowlist review, runbook, and expiry/disable policy. Do not expose as public app contract. |
| `iskra-canon-import-1536` | `internal/support` | Canon import/provisioning endpoint. | Add owner/runbook or remove after import windows close. Because `verify_jwt=false`, require explicit protection or removal. |
| `iskra-canon-backfill-1536` | `internal/support` | Embedding backfill/maintenance endpoint. | Add owner/runbook or remove after backfill. Because `verify_jwt=false`, require explicit protection or removal. |
| `iskra-canon-import-diagnostic` | `retire` | Debug/diagnostic endpoint. | Remove from live before public release, or record a short ADR exception with owner and expiry. |

## Execution Order

### Phase 0: Freeze The Baseline

Do this before any live mutation.

- Confirm the latest live function list.
- Confirm the latest migration list.
- Confirm advisor output.
- Confirm whether `runtime/iskraSpace` launch uses only `gemini`, or also uses `iskra.*` canon/RAG paths.
- Record the exact commit used for the cleanup PR.

PASS means the cleanup PR is based on a current snapshot, not on old memory.

### Phase 1: Retire Diagnostic Surface

Target: `iskra-canon-import-diagnostic`.

Preferred action:

- Remove the live function before public release.
- Add a receipt comment to issue #192 with the removal time and post-removal function list.

Allowed exception:

- Keep it only with an accepted ADR that states owner, reason, expiry date, access boundary, and rollback trigger.

Plain-language reason: diagnostic endpoints are useful while fixing the machine, but they should not stay as doors after the house opens.

### Phase 2: Put Internal/Support Functions Under Control

Targets:

- `db-proxy`
- `iskra-canon-import-1536`
- `iskra-canon-backfill-1536`

For each function, record:

- Owner.
- Why it exists.
- Who is allowed to call it.
- Whether it can be disabled after setup/backfill.
- What logs prove safe use.
- What rollback looks like.

Minimum release rule:

- No `internal/support` function may remain undocumented live-only behavior.
- If it is powerful or unauthenticated, it must either be removed, protected, or accepted by ADR with an expiry.

### Phase 3: Fix Or Accept Security Advisors

Release-blocking unless fixed or accepted by ADR:

- Mutable `search_path` on public graph functions.
- GraphQL exposure for `public.graph_nodes` and `public.graph_edges` to `anon`.
- GraphQL exposure for authenticated app-state tables where not intentionally part of the product API.

Needs explicit decision:

- `pg_trgm` installed in `public`.

Expected PR content for this phase:

- SQL migration or ADR.
- Expected advisor delta.
- Rollback SQL or reversal instructions.
- Post-change advisor evidence.

Do not apply production SQL until the migration has been reviewed.

### Phase 4: Queue Performance Hardening

These are important before scale, but they should follow the security boundary work unless the advisor marks them urgent.

- Add missing foreign-key indexes for retained canon and graph relationship tables, or explicitly reject them with reason.
- Rewrite RLS policies that trigger init-plan warnings.
- Review unused indexes after the final public data path is decided.

## Migration Safety Rules

Every live Supabase change must have:

- Git-side migration or documented function deploy/delete plan.
- Expected before/after state.
- Rollback path.
- Post-change verification.
- No secrets in Git.

If a change touches service-role behavior, unauthenticated Edge Functions, grants, RLS, or GraphQL exposure, treat it as release-gate level.

## PASS Criteria For Closing Issue #192

- `iskra-canon-import-diagnostic` is removed or covered by accepted ADR exception.
- `db-proxy`, `iskra-canon-import-1536`, and `iskra-canon-backfill-1536` have owner/runbook/access/expiry decisions.
- Release-critical security advisors are fixed or accepted by ADR.
- Post-change Supabase advisor output is attached to #190 or #192.
- `runtime/iskraSpace` production Supabase path is clear: `gemini` only, `iskra.*` canon/RAG, legacy `public.*`, or a documented hybrid.

## Rollback

Because this runbook is documentation only, rollback is ordinary Git revert.

For future live changes, rollback must be defined in the specific SQL/function PR before production execution.

## Evidence

- Supabase provenance PR #191.
- Release gate issue #190.
- Cleanup issue #192.
- Live Supabase snapshot from 2026-06-06 recorded in `docs/operations/iskraspace_supabase_provenance_2026-06-06.md`.
