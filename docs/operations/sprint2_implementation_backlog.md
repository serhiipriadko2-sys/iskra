# Sprint 2

# Implementation Backlog

Status: draft  
Ordering principle: highest risk first  
Input: Sprint 1 remediation matrix, architecture truth doc, embedding ADR, `db-proxy` decision memo

## Priority Legend

- P0 = immediate blocker / security boundary
- P1 = required to stabilize target architecture
- P2 = required to make drift visible and prevent relapse

## Work Order

### P0-1. Kill permissive RLS on user-content tables

**Scope**
- `public.metrics_snapshots`
- `public.memory_nodes`
- `public.journal_entries`
- `public.tasks`
- `public.habits`
- `public.voice_preferences`
- `public.chat_history`
- `public.audit_log`

**Why first**
- [FACT] Advisors already flag always-true or effectively broad access on these tables.
- [INTERP] This is the most direct user-data exposure risk in the system.

**Work**
- enumerate current policies per table
- drop permissive policies
- add explicit owner-scoped policies
- special-case `audit_log` to internal/server-only instead of owner CRUD

**Dependencies**
- none; can start immediately

**PASS**
- advisors stop flagging permissive RLS on these tables
- self-access passes
- cross-user access fails
- `anon` access fails where not explicitly intended

---

### P0-2. Remove GraphQL/Data API discoverability from sensitive `public.*`

**Scope**
- same tables as P0-1
- `public.rate_limits`

**Why second**
- [FACT] Current advisors show `anon` and `authenticated` GraphQL exposure across the app schema.
- [INTERP] Even with better RLS, broad discoverability is still unnecessary attack surface.

**Work**
- review grants for `anon` and `authenticated`
- revoke unnecessary `SELECT`
- confirm whether Data API exposure settings require extra grants review
- ensure internal tables like `rate_limits` are not discoverable

**Dependencies**
- can run in parallel with P0-1, but verify together

**PASS**
- GraphQL exposure warnings materially reduced or eliminated
- sensitive tables no longer appear to `anon`
- signed-in users only see what target model explicitly allows

---

### P0-3. Lock down privileged RPC functions

**Scope**
- `public.check_rate_limit(...)`
- `public.claim_legacy_data(...)`

**Why third**
- [FACT] Both are `SECURITY DEFINER` and executable by public roles.
- [INTERP] This is a privileged escalation surface and should not stay internet-callable.

**Work**
- revoke `EXECUTE` from `anon`
- revoke `EXECUTE` from `authenticated` unless explicitly needed
- decide keep / move to private schema / rewrite as `SECURITY INVOKER`
- add migration comments explaining caller model

**Dependencies**
- architecture truth doc classification

**PASS**
- advisor findings for public executable security definer functions are cleared
- required legacy flow still works only through approved path

---

### P0-4. Constrain `db-proxy` immediately

**Scope**
- live Edge Function `db-proxy`

**Why fourth**
- [FACT] It is the broadest live privileged tunnel because it supports arbitrary CRUD plus RPC using service-role credentials.

**Work**
- remove generic `select/insert/update/delete`
- allow only explicit RPC allowlist
- add structured audit logging for every invocation
- reject arbitrary table input
- document any remaining approved operations

**Dependencies**
- must know whether any hidden operational flow still depends on current broad behavior

**PASS**
- no arbitrary table CRUD path remains
- only approved RPC calls succeed
- audit trail exists for every invocation

---

### P0-5. Close public invocation on import/backfill/diagnostic functions

**Scope**
- `iskra-canon-import-1536`
- `iskra-canon-backfill-1536`
- `iskra-canon-import-diagnostic`

**Why fifth**
- [FACT] These functions are live with `verify_jwt=false`.
- [INTERP] They expose corpus mutation, external API spend, or diagnostics through an overly open surface.

**Work**
- make invocation internal-only
- enable auth or internal secret gate
- disable diagnostic function if unused
- define when import/backfill functions are active vs dormant

**Dependencies**
- none for lock-down; some for long-term replacement

**PASS**
- unauthenticated invocation fails
- approved admin path still works
- diagnostic surface is removed or tightly constrained

---

### P1-1. Decide the fate of `public.memory_nodes`

**Scope**
- `public.memory_nodes`
- code paths referencing app-memory vs canon-memory

**Why here**
- [INTERP] Security fixes can land before the semantic decision, but long-term architecture cannot.

**Work**
- decide keep as user-memory or deprecate
- if keep: define owner-only app contract
- if deprecate: freeze writes and create migration path away from it
- align code references accordingly

**Dependencies**
- architecture truth doc

**PASS**
- `public.memory_nodes` has one clear purpose
- no document or code path treats it as canon-memory

---

### P1-2. Freeze the embedding contract in code and data paths

**Scope**
- app/engine code that assumes embeddings
- canon ingestion/backfill path
- retrieval/query path

**Why here**
- [FACT] Sprint 1 ADR chose `text-embedding-3-small` / `1536`.
- [INTERP] Until code aligns, repo/live drift remains active.

**Work**
- inventory code paths assuming other dimensions or a missing `embed` function
- mark legacy paths stale or remove them
- ensure canon retrieval uses one model/dimension contract
- persist model/dimension metadata consistently

**Dependencies**
- embedding ADR

**PASS**
- one canon embedding contract is used everywhere that touches canon retrieval
- no silent mixed-dimension path remains

---

### P1-3. Classify functions and tables as production vs legacy in repo

**Scope**
- docs
- migrations notes
- function inventory

**Why here**
- [INTERP] This prevents Sprint 2 fixes from being “just code changes” with no durable ownership model.

**Work**
- annotate production vs legacy surface
- link each live object to an owner and caller model
- mark deprecated paths explicitly

**Dependencies**
- architecture truth doc

**PASS**
- every live object has a status: production / legacy / remove / replace

---

### P2-1. Add repo↔live drift check pipeline

**Scope**
- schema snapshot
- function inventory
- migration parity
- advisor status baseline

**Why later**
- [INTERP] It should land right after security posture and architecture are stable enough to enforce.

**Work**
- define expected live inventory
- compare repo migrations/docs against live state
- fail CI on material drift

**Dependencies**
- P0 and P1 decisions mostly landed

**PASS**
- material repo/live drift becomes visible automatically

---

### P2-2. Generate typed DB contract from live Supabase

**Scope**
- engine
- app
- retrieval-related DB paths

**Why later**
- typed contracts are only valuable once target schema boundaries are stable

**Work**
- generate types from live schema
- adopt them in engine/app integration points
- make schema mismatch break build earlier

**Dependencies**
- stable target schema after P0/P1

**PASS**
- app and engine compile against live-backed DB contract
- incompatible schema drift surfaces in build/test

---

### P2-3. Open removal or replacement backlog for `db-proxy`

**Scope**
- narrow admin/replacement functions
- server-side internal pathways

**Why later**
- short-term constraint comes first; full replacement can then be done deliberately

**Work**
- identify remaining required operations
- build narrow replacements
- delete `db-proxy` or leave tiny internal adapter

**Dependencies**
- P0-4 complete

**PASS**
- `db-proxy` is gone or reduced to a tiny audited internal adapter

---

## Suggested Sprint 2 Sequence

### Days 1-2
- P0-1
- P0-2

### Days 3-4
- P0-3
- P0-4

### Days 5-6
- P0-5
- P1-1

### Days 7-8
- P1-2
- P1-3

### Days 9-10
- P2-1 design
- P2-2 design
- backlog split for next sprint

## Risks

- [HYP] Hidden dependency on current `db-proxy` behavior may slow P0-4.
- [INTERP] `claim_legacy_data(...)` may have edge-case users depending on it, so removal should follow verification, not assumption.
- [INTERP] `public.memory_nodes` may be more coupled to app logic than current visible evidence shows.

## Sprint 2 Exit Criteria

- live public data boundary is materially safer
- privileged public RPC surface is closed or constrained
- internal import/backfill functions are not publicly callable
- one embedding standard is operationally real, not only documented
- next sprint can shift from “stop bleeding” to “enforce and automate”
