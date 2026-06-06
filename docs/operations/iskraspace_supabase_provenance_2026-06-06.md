# iskraSpace Supabase Provenance Snapshot

Status: PROVENANCE SNAPSHOT / NO LIVE MUTATION
Date: 2026-06-06
Scope: public release boundary for `runtime/iskraSpace`
Related release gate: https://github.com/serhiipriadko2-sys/iskra/issues/190

## Decision Summary

`runtime/iskraSpace` is the public-release application. Supabase objects that directly support that application must have a repository-side source, owner, and verification path before release.

Everything else is treated as internal/support unless it is explicitly promoted into the public app path. Internal/support means: useful for operators, import, diagnostics, or maintenance, but not part of the public product contract.

This PR does not change live Supabase state. It only records the provenance decision so future work can be reviewed and tested safely.

## Edge Functions

| Live function | Classification | Repo-side trace | Plain-language reason | Required next action |
| --- | --- | --- | --- | --- |
| `gemini` | `release-required` | `runtime/iskraSpace/supabase/functions/gemini/index.ts`; called by `runtime/iskraSpace/services/geminiService.ts` | This is the AI bridge used by the public app. The app sends a signed user request to this function, and the function talks to Gemini using the server-side key. | Keep as release dependency. Verify deployed code matches repo source, verify auth flow, and confirm `GEMINI_API_KEY` is configured outside Git. |
| `db-proxy` | `internal/support` | Live-only at snapshot time | This is an operator-style database proxy. It uses a service-role path plus an action allowlist, so it is too powerful to be treated as a public app feature unless a separate security design says so. | Keep out of public release path. Add an owner/runbook or replace with narrowly scoped APIs. |
| `iskra-canon-import-1536` | `internal/support` | Live-only at snapshot time | This imports canon data into the `iskra` schema. It is a setup/provisioning tool, not something public users should call. | Add a repo-side runbook/source if retained. Disable or protect after import windows. |
| `iskra-canon-backfill-1536` | `internal/support` | Live-only at snapshot time | This backfills embeddings for canon chunks. It is a batch maintenance job, not a public app endpoint. | Add a repo-side runbook/source if retained. Require owner, logs, and an expiry/disable policy. |
| `iskra-canon-import-diagnostic` | `retire` | Live-only at snapshot time | This is a diagnostic probe for import/environment state. It is useful while debugging, but it creates extra exposed surface after the debug window is over. | Remove before public release, or document a short expiry with an explicit owner. |

### Simple Example

Think of `gemini` as the public front desk: the app needs it to answer users.

Think of `db-proxy` and the `iskra-canon-*` functions as backstage tools: they may be useful to prepare or repair the system, but they should not be visible doors into the public product.

## Migration Provenance

| Live migration | Classification | Plain-language reason | Required next action |
| --- | --- | --- | --- |
| `20260308000000_legacy_data_migration` | `release-required if public legacy tables remain product state; otherwise internal/legacy` | This belongs to older public-table data shape. If the public app still depends on those tables, it matters for release. If not, it is historical baggage. | Confirm current `iskraSpace` data model. Keep only if needed by the public app or active migration history. |
| `20260308000001_rate_limiting` | `release-required if public app uses DB-backed rate limiting; otherwise internal/support` | Rate limiting can be a public safety requirement, but only if the current app path uses it. | Trace app/API usage and add repo-side migration source if still active. |
| `iskra_canon_schema_1536_v2` | `internal/support unless canon/RAG is promoted into public iskraSpace` | Creates canon storage for documents, chunks, and memory nodes. Useful for knowledge/RAG, but not yet proven as a public app dependency in this snapshot. | Decide whether canon/RAG is part of launch. If yes, promote to release-required and add tested migrations. |
| `iskra_temp_import_window_open` | `internal/support` | Temporary import window migration. Temporary doors should not become permanent release contract. | Keep only as audited history; do not repeat without a reviewed migration. |
| `iskra_canon_import_helpers` | `internal/support` | Helper functions for canon import. Operational tooling, not public app UI behavior. | Add repo-side source/runbook if retained. |
| `iskra_temp_import_window_close` | `internal/support` | Closes a temporary import window. | Keep as historical trace; verify no open import permissions remain. |
| `iskra_backfill_status_helpers` | `internal/support` | Helps observe backfill status. Operator support, not public app behavior. | Add owner/runbook if retained. |
| `iskra_temp_rpc_import_open` | `internal/support` | Temporarily opens an RPC import path. | Verify it is closed in live grants before release. |
| `enable_pg_net_for_iskra_import` | `internal/support / security-reviewed only` | Enables network capability used by import/backfill flows. This has security implications and should not be casual launch baggage. | Keep only with explicit security review and owner. |
| `iskra_temp_rpc_import_close_again` | `internal/support` | Closes temporary RPC import access again. | Verify final live privileges match the closed state. |

## Security And Drift Notes

The live Supabase project had security/performance advisor findings at snapshot time. These are not fixed by this PR.

Release-blocking unless fixed or explicitly accepted by ADR:

- Mutable `search_path` on public graph functions.
- GraphQL exposure for public graph tables to `anon`.
- GraphQL exposure for app-state tables to `authenticated` where not intentionally part of the product contract.
- Any live-only function that remains callable without a repo-side owner, source, and expiry decision.

Needs queued hardening before scale:

- Foreign-key indexes missing on canon and graph relationship tables.
- RLS policy init-plan warnings across user-owned public tables.
- Unused indexes review.
- `pg_trgm` extension installed in `public`; move or formally accept.

## Release PASS Criteria

The Supabase side is release-ready for public `iskraSpace` only when all of these are true:

1. Every `release-required` function has repo-side source, deployment path, and a verification receipt.
2. Every `internal/support` function has owner, runbook, access boundary, and expiry/disable decision.
3. Every `retire` function is removed from live or has a time-boxed exception recorded in ADR.
4. Security advisors are either fixed or accepted with a written ADR and rollback trigger.
5. The public app can be explained from repo files without depending on undocumented live-only behavior.

## Evidence

- Supabase project snapshot via connected Supabase metadata on 2026-06-06.
- Repository source for public app path: `runtime/iskraSpace`.
- Repository source for release-required `gemini` function: `runtime/iskraSpace/supabase/functions/gemini/index.ts`.
- Public app caller: `runtime/iskraSpace/services/geminiService.ts`.
- Release gate issue: https://github.com/serhiipriadko2-sys/iskra/issues/190.
- Baseline main integrity repair commit: https://github.com/serhiipriadko2-sys/iskra/commit/e85d6e9577f54b8ed6a7b634a34a966dd6c8552e.

## Safety Boundary

No secrets are recorded here. No service-role values are copied. No live Supabase SQL, function deploy, branch creation, or project mutation is performed by this PR.
