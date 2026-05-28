# Sprint 1 Deliverable 2

# Architecture Truth Doc v1

Status: draft  
Scope: Iskra repo `serhiipriadko2-sys/iskra` and live Supabase project `AgiIskra`

## 1. Purpose

This document defines the current target truth boundary for Iskra so that repo, live database, Edge Functions, and AI contracts can converge on one operational model.

## 2. Source Hierarchy

- [FACT] Canon and attached project files constrain interpretation.
- [FACT] Repo defines intended code structure and migration history.
- [FACT] Live Supabase defines actual production exposure and data reality.
- [RULE] If repo and live disagree, live wins for operational risk and repo must be marked stale until reconciled.

## 3. Bounded Contexts

### 3.1 `public` schema

- [FACT] `public` currently contains companion-product state: users, journal, tasks, habits, metrics, voice preferences, chat history, audit log, rate limits, and one legacy-style `memory_nodes` table.
- [TARGET] `public` is the **user-memory and app-state domain**.
- [TARGET] Access model is auth-scoped and user-owned by default.
- [TARGET] No canon ingestion, no corpus import, no broad admin helpers exposed to clients.

### 3.2 `iskra` schema

- [FACT] `iskra` currently contains `canon_documents`, `canon_chunks`, and `canon_memory_nodes`.
- [TARGET] `iskra` is the **canon-memory and retrieval domain**.
- [TARGET] It stores corpus documents, chunks, embeddings, and canon retrieval artifacts.
- [TARGET] Writes happen only through approved server-side ingestion/backfill paths.

## 4. Domain Separation Rule

- [RULE] `public.memory_nodes` and `iskra.canon_memory_nodes` must not be treated as interchangeable.
- [TARGET] `public.memory_nodes` belongs to user-memory or is retired.
- [TARGET] `iskra.canon_memory_nodes` belongs to canon-memory only.
- [RISK] Leaving them semantically blended will keep retrieval, security, and ownership ambiguous.

## 5. Function Inventory

### 5.1 Production surface

- `db-proxy` — currently active, but not approved in its broad present form.
- Companion app Supabase access from web/engine paths.
- Canon import/backfill functions only if explicitly approved as internal operations.

### 5.2 Legacy or transitional surface

- `claim_legacy_data(...)`
- `check_rate_limit(...)` in public RPC form
- Any public function used only for bootstrap, migration, or diagnostic work
- Any repo path that assumes a different embedding contract or a missing `embed` function

## 6. Approved Data Flows

### Flow A: Companion app state

`client → auth-scoped Supabase access → public.*`

Rules:
- authenticated access only
- owner-scoped RLS
- no cross-user reads

### Flow B: Canon ingestion

`trusted admin/import job → Edge/admin path → iskra.canon_documents / canon_chunks / canon_memory_nodes`

Rules:
- no public invocation
- service-role only in trusted environment
- audit trace required

### Flow C: Retrieval/query

`engine/query layer → approved retrieval path → canon embeddings/index`

Rules:
- one embedding standard
- one approved retrieval contract
- no hidden alternate corpus

### Flow D: Operational control

`internal operator / CI → drift checks / advisors / inventory`

Rules:
- repo and live must be compared continuously
- schema/function drift becomes a visible failure, not a hidden condition

## 7. Production vs Legacy Decision Rules

- [TARGET] A function or table is production only if:
  - it has an explicit owner
  - it has an explicit caller model
  - it has an explicit security model
  - it appears in the truth boundary docs

- [TARGET] Anything else is `legacy`, `transitional`, or `diagnostic`.

## 8. Drift Rules

- `DRIFT: repo vs live` if live schema/functions differ from tracked migrations or docs.
- `DRIFT: app vs retrieval` if runtime assumes a different embedding or memory contract than live corpus.
- `DRIFT: security intent vs exposure` if docs say auth-scoped but grants/policies expose data broadly.

## 9. Required Immediate Decisions

1. Keep or retire `public.memory_nodes`.
2. Freeze one embedding standard for canon retrieval.
3. Decide `db-proxy` fate.
4. Reclassify import/backfill/diagnostic functions as internal-only or remove them.

## 10. PASS / FAIL

PASS:
- every live table/function is assigned to `public`, `iskra`, `production`, or `legacy`
- `public` and `iskra` have different ownership semantics
- approved flows are explicit

FAIL:
- app-state and canon-state remain mixed
- broad internal tools still masquerade as production surface
