# iskraSpace Supabase Read-Only Baseline

Status: PARTIAL / NO LIVE MUTATION
Captured: 2026-06-07T16:52:26+03:00
Scope: Supabase release boundary for `runtime/iskraSpace`
Project: `AgiIskra / typcvaszcfdpkzbjzuur`

## Summary

This baseline refreshes read-only Supabase project, migration, Edge Function
list, and selected Edge Function source posture. It does not apply migrations,
delete functions, deploy functions, rotate keys, or mutate data.

`runtime/iskraSpace` remains blocked from a public release sign-off until live
internal/support functions are removed, protected, or covered by owner-approved
time-boxed exceptions.

## Project

| Field | Observed value |
| --- | --- |
| Name | `AgiIskra` |
| Ref | `typcvaszcfdpkzbjzuur` |
| Region | `eu-west-1` |
| Status | `ACTIVE_HEALTHY` |
| Database | Postgres `17.6.1.063` |

Other visible projects in the same connector read were `kate` and `membot`; they
are outside this baseline scope.

## Migrations

Live migration inventory:

- `20260309091308` / `20260308000000_legacy_data_migration`
- `20260309091342` / `20260308000001_rate_limiting`
- `20260509073756` / `iskra_canon_schema_1536_v2`
- `20260509073916` / `iskra_temp_import_window_open`
- `20260509074021` / `iskra_canon_import_helpers`
- `20260509074235` / `iskra_temp_import_window_close`
- `20260509074300` / `iskra_backfill_status_helpers`
- `20260509092738` / `iskra_temp_rpc_import_open`
- `20260509092953` / `enable_pg_net_for_iskra_import`
- `20260509093312` / `iskra_temp_rpc_import_close_again`

## Edge Functions

| Function | Status | `verify_jwt` | Source posture | Release decision |
| --- | --- | --- | --- | --- |
| `gemini` | ACTIVE | true | Uses `@google/genai@1.34.0`, requires POST, supports `generateContent`, `streamGenerateContent`, and `embedContent`; reads `GEMINI_API_KEY` from Edge env. | Keep as release-required for direct `runtime/iskraSpace` path. |
| `db-proxy` | ACTIVE | true | Uses service-role REST calls behind `/db` and an `ACTION_ALLOWLIST` bearer check. | Internal/support; needs owner, access review, runbook, logs, and expiry/disable policy. |
| `iskra-canon-import-1536` | ACTIVE | false | POST import endpoint using Supabase service role and bundled canon JSONL data. | Internal/support; release blocker until protected, removed, or accepted by ADR. |
| `iskra-canon-backfill-1536` | ACTIVE | false | POST embedding backfill using OpenAI embeddings, Supabase service role, model `text-embedding-3-small`, dimensions `1536`. | Internal/support; release blocker until protected, removed, or accepted by ADR. |
| `iskra-canon-import-diagnostic` | ACTIVE | false | Diagnostic endpoint responds without method/auth gate and reports env-presence checks plus bundled test-file content. | Retire before public release or cover by time-boxed ADR exception. |
| `embed` | not found | n/a | Connector lookup returned `Function not found`; repo source exists separately. | Required only if engine/web retrieval or a documented hybrid is promoted. |

No secret values were recorded in this baseline.

## Release Boundary

Direct `runtime/iskraSpace` release path:

- `gemini` is live, ACTIVE, and `verify_jwt=true`.
- Direct app embedding uses `gemini` `embedContent`.
- No live `embed` deployment is needed unless the public path promotes
  engine/web retrieval.

Release blockers independent of direct `embed` usage:

- `iskra-canon-import-diagnostic` is live with `verify_jwt=false` and should not
  remain as a public-release surface.
- `iskra-canon-import-1536` and `iskra-canon-backfill-1536` are live with
  `verify_jwt=false` and service-role behavior.
- `db-proxy` is powerful internal/support behavior and must not remain
  undocumented live-only surface.

## Not Refreshed In This Connector Pass

- Advisors.
- Grants/API exposure.
- App data-path table contents.
- Logs and caller inventory.
- Provider-side credential rotation/audit status for the removed status dump.

These remain required before any live mutation or final release sign-off.

## Delta Receipt

Delta: live function drift is now refreshed from the connector in the current
post-merge branch, including source posture for the previously partial import and
diagnostic functions.

D: Supabase connector read-only project list, migration list, function list, and
function source reads.

Omega: 0.9 for project/migrations/functions observed through the connector; 0.65
for full release safety because advisors, grants, logs, and caller inventory are
not refreshed.

Lambda: revise after advisor/grant/log baseline, after any live function delete
or deploy, or if public release scope changes from direct `runtime/iskraSpace`.

