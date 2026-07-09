# iskra-memory-gateway package

Project-facing Supabase Edge Function for ChatGPT Projects runtime memory and StateCycle boundary.

## Scope

This package is for the ChatGPT Project runtime surface, not ChatGPT Workspace Agent.

Routes:
- POST `/observe`
- POST `/dry-run`
- POST `/dark-run`
- POST `/commit`
- POST `/horizon/propose`
- POST `/memory/write`
- POST `/memory/search`
- POST `/shadow/promote`
- POST `/dream/crystallize`

## Security posture

- Supabase function must run with `verify_jwt=true`.
- The gateway does not trust `actor` from request JSON.
- Actor is derived from the verified Supabase JWT claims exposed through the Authorization header.
- Unknown routes return `404` with `ok:false`.
- DB access should use `SUPABASE_DB_POOLER_URL`; `SUPABASE_DB_URL` remains a fallback.
- The postgres-js pool is capped by `SUPABASE_DB_POOL_MAX`, default `2`, max `4`.
- No secrets are committed.
- Payloads are still checked by locked RPC validators in `iskra_memory`.

## Reproducible DB boundary

The gateway depends on `iskra_memory` RPCs. The repo includes a compatibility migration:

```text
supabase/migrations/20260709190000_iskra_memory_gateway_rpc_contract.sql
```

It creates missing compatibility functions only when absent, so it does not replace stronger live functions.

## Deploy

```powershell
supabase functions deploy iskra-memory-gateway --project-ref typcvaszcfdpkzbjzuur
```

## Smoke

Call with a valid Supabase JWT because `verify_jwt=true`.

Payload example for dry-run:

```json
{
  "mode": "dry_run",
  "request_id": "manual-smoke",
  "phase": "smoke",
  "voice": "SAM",
  "metrics": { "clarity": 1, "drift": 0 },
  "entropy": 0.1
}
```

## Rollback

```powershell
supabase functions delete iskra-memory-gateway --project-ref typcvaszcfdpkzbjzuur
```

If the CLI lacks delete support, remove the function in the Supabase Dashboard.
