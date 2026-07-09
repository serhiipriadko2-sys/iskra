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

- `verify_jwt = true`
- no public unauthenticated gateway
- no secrets committed
- DB access comes from `SUPABASE_DB_URL` in Supabase Edge runtime environment
- payloads are still checked by locked RPC validators in `iskra_memory`

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
