# Supabase Observability & Alerting (Task 3)

This document contains Log Explorer queries to set up instant alerting in the Supabase Dashboard against brute-force attacks and RLS circumventions.

## 1. Edge Function Unauthorized Access (401/403 Spikes)
**Goal:** Detect when an attacker is trying to ping `/functions/v1/gemini` without a valid token repeatedly.
**Query for Log Explorer (Edge Logs):**
```sql
select
  timestamp,
  metadata->>'request_id' as request_id,
  metadata->>'method' as method,
  metadata->>'url' as url,
  metadata->>'status' as status_code,
  metadata->>'client_ip' as ip
from edge_logs
where metadata->>'status' in ('401', '403')
order by timestamp desc;
```
**Alert Rule:** Trigger when Count > 10 in 1 minute.

## 2. RLS Policy Violations (Postgres Logs)
**Goal:** Detect attempts to read or mutate rows where the user doesn't have RLS access.
**Query for Log Explorer (Postgres Logs):**
```sql
select
  timestamp,
  event_message,
  parsed_log->>'user_name' as db_role,
  parsed_log->>'error_severity' as severity
from postgres_logs
where
  event_message ilike '%permission denied%'
  OR event_message ilike '%policy violation%'
order by timestamp desc;
```
**Alert Rule:** Trigger immediately (Count > 0) via Webhook/Slack.

## 3. Rate Limit Exhaustion (Task 2 Monitor)
**Goal:** Monitor the newly created `rate_limits` table to see which IPs are hitting maximum caps.
**Query for Log Explorer (Postgres Logs / Audit):**
```sql
select
  ip,
  endpoint,
  hits,
  reset_time
from public.rate_limits
where hits > 50; -- Replace 50 with your max_hits threshold
```
**Integration:** Use Supabase Webhooks to send a Slack alert when this threshold is crossed.
