# iskraSpace Supabase Read-Only Baseline - 2026-06-09

Status: BASELINE + 2026-06-16 APPROVED LIVE CLEANUP RECEIPT
Project: `AgiIskra / typcvaszcfdpkzbjzuur`
Region: `eu-west-1`
Database: Postgres `17.6.1.063`

## Summary

This baseline refresh was captured after PR #201 merged. It confirms that the
live `gemini` Edge Function now matches the dual-provider gateway contour and
the Gemini embedding repair, while the internal/support Supabase functions still
require release decisions before public sign-off.

The original 2026-06-09 baseline was read-only and performed no Supabase
deploy, delete, SQL, secret, config, or branch mutation.

On 2026-06-16, after explicit owner approval, the two canon import/backfill
support functions were retired as 410 stubs with `verify_jwt=true`. No SQL,
DDL, database branch, storage, or secret mutation was performed.

## Edge Functions

| Function | Version | Status | verify_jwt | Release status |
| --- | ---: | --- | --- | --- |
| `gemini` | 5 | ACTIVE | true | release-required; Gemini embed verified, OpenAI smoke pending |
| `db-proxy` | 3 | ACTIVE | true | internal/support; owner/access/disable policy still required |
| `iskra-canon-import-1536` | 4 | ACTIVE | true | retired 410 stub; no import work |
| `iskra-canon-backfill-1536` | 4 | ACTIVE | true | retired 410 stub; no backfill work |
| `iskra-canon-import-diagnostic` | n/a | not found | n/a | absent live |
| `embed` | n/a | not found | n/a | absent live; direct `runtime/iskraSpace` uses `gemini` `embedContent` |

## Gemini Function Source Posture

Live read-back of `gemini` version `5` shows:

- provider routing types for `gemini`, `openai`, and `auto`;
- default Gemini text model: `gemini-2.5-flash`;
- default Gemini embedding model: `gemini-embedding-001`;
- default OpenAI embedding model: `text-embedding-3-small`;
- `EMBEDDING_DIMENSIONS = 1536`;
- Gemini embedding requests ignore stale requested model names and use
  `outputDimensionality: 1536`;
- embedding responses are normalized to `{ embedding: { values } }`;
- OpenAI generation uses `POST /v1/responses`;
- OpenAI embeddings use `POST /v1/embeddings`;
- OpenAI JSON response shaping uses `text.format`;
- `verify_jwt=true` remains set on the live function.

This confirms the PR #201 Gemini embedding repair is live. It does not confirm
the OpenAI provider path until an OpenAI-specific live smoke is run.

## Migrations

Live migrations remain:

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

## Extensions With Release Relevance

Installed extension signals observed:

- `vector` in `extensions`, version `0.8.0`;
- `pg_graphql` in `graphql`, version `1.5.11`;
- `pg_trgm` in `public`, version `1.6`;
- `pg_net` in `extensions`, version `0.19.5`;
- `supabase_vault` in `vault`, version `0.3.1`;
- `pg_stat_statements` in `extensions`, version `1.11`;
- `uuid-ossp` in `extensions`, version `1.1`;
- `pgcrypto` in `extensions`, version `1.3`.

## Unknown / Not Covered By Current Tooling

The currently available Supabase connector tools did not expose:

- advisors;
- grants/RLS policy inventory;
- recent Edge Function logs;
- secret presence for OpenAI/Gemini without invoking runtime;
- app data path counts.

These remain required evidence items before any destructive cleanup or public
release sign-off.

## 2026-06-09 Cleanup Approval Refresh

A later read-only connector pass for the cleanup approval packet exposed
security and performance advisors. The function list did not materially change:
`gemini` remained version `5` with `verify_jwt=true`, `db-proxy` remained
version `3` with `verify_jwt=true`, and canon import/backfill/diagnostic
functions remained version `3` with `verify_jwt=false`.

Advisor themes observed in that later pass include mutable function
`search_path` warnings, `pg_trgm` installed in `public`, GraphQL exposure
warnings, unindexed foreign keys, RLS init-plan warnings, unused-index
candidates, and Auth connection allocation advice.

Receipt: `docs/operations/iskraspace_supabase_cleanup_approval_packet_2026-06-09.md`.

## 2026-06-16 Approved Live Cleanup Receipt

After explicit owner approval, Change-Set A was executed against
`AgiIskra / typcvaszcfdpkzbjzuur`:

| Function | Before | After | Source posture |
| --- | --- | --- | --- |
| `iskra-canon-import-1536` | version 3, `verify_jwt=false`, service-role import handler | version 4, `verify_jwt=true` | 410 JSON stub: `canon_import_retired` |
| `iskra-canon-backfill-1536` | version 3, `verify_jwt=false`, service-role/OpenAI backfill handler | version 4, `verify_jwt=true` | 410 JSON stub: `canon_backfill_retired` |
| `iskra-canon-import-diagnostic` | previously tracked as live | absent from 2026-06-16 live function list | no live function observed |

Live read-back after deploy confirmed:

- `gemini`: version 5, ACTIVE, `verify_jwt=true`;
- `db-proxy`: version 3, ACTIVE, `verify_jwt=true`;
- `iskra-canon-import-1536`: version 4, ACTIVE, `verify_jwt=true`, retired stub;
- `iskra-canon-backfill-1536`: version 4, ACTIVE, `verify_jwt=true`, retired stub;
- no `iskra-canon-import-diagnostic` entry in the function list.

No secret values were read or printed. No SQL, DDL, branch, storage, or data
mutation was performed. Rollback requires redeploying previous source only with
`verify_jwt=true` plus an admin/custom-auth gate, or a new explicit ADR
exception with expiry.

## Release Interpretation

Verified:

- `gemini` is live, active, JWT-protected, and deployed as version `5`.
- Gemini embedding now uses the 1536-dimensional contract.
- Main branch checks are green after PR #201.

Partial:

- Dual-provider repo/live source exists, but OpenAI behavior is not live-smoked.

Open:

- `db-proxy` remains live and needs owner/access/disable policy.
- OpenAI provider behavior is still not live-smoked.
- Security/performance advisors still require hardening triage before public sign-off.
- App-data path counts and recent logs remain separate evidence items.

## Next Safe Step

Choose one focused path:

1. OpenAI smoke path: configure/confirm server-side OpenAI env, then run an
   approval-gated live smoke for generation, streaming, embeddings, and fallback.
2. Supabase cleanup path: keep import/backfill retired, keep diagnostic absent,
   and define owner/access/disable policy for `db-proxy`.

## Delta

Delta: live Supabase now confirms the Gemini embedding repair, dual-provider
gateway source posture, and 2026-06-16 retirement of canon import/backfill
privileged handlers.
D: Supabase connector project/functions/migrations/extensions/source reads,
GitHub PR #201 checks and comments, 2026-06-16 live function deploy/read-back.
Omega: 0.92 for observed live metadata and retired stub source posture; 0.55 for
OpenAI runtime behavior until smoke.
Lambda: revise after OpenAI smoke, `db-proxy` owner/access decision, or advisor/logs/app-data access.
