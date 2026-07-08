# Iskra Agent Edge Function Runbook

## Purpose

`iskra-agent` is a Supabase Edge Function proxy between iskraSpace and the Workspace Agent API.

```text
iskraSpace frontend
-> supabase.functions.invoke('iskra-agent')
-> Supabase Edge Function with JWT boundary
-> Workspace Agent API trigger
-> structured JSON response
```

## Required Supabase secrets

Set these in Supabase secrets only. Do not commit them.

```bash
supabase secrets set AGENT_ID=agtch_6a457394e3e88191bc11dd3a15413f19
supabase secrets set AGENT_ACCESS_TOKEN=<redacted>
supabase secrets set ISKRA_AGENT_ALLOWED_ORIGINS=https://your-app.example,https://your-preview.example
```
## Deploy

```bash
supabase functions deploy iskra-agent --verify-jwt true
```

## Frontend call

```ts
import { invokeIskraAgent } from './services/iskraAgentService';

const result = await invokeIskraAgent({
  message: 'Привет, Искра',
  route: 'chat',
  phase: 'runtime',
});
```

## Smoke check

Call the function from an authenticated iskraSpace session. Expected fields:

```text
reply, status, actions, trace, delta, artifact_receipt, request_id
```
