# Sprint 1 Deliverable 4

# Decision Memo: `db-proxy`

Status: proposed

## Decision

- [DECISION] Do not keep `db-proxy` in its current form.
- [DECISION] Short-term path: **constrain**.
- [DECISION] Medium-term path: **replace or remove**.

## Current state

- [FACT] `db-proxy` requires JWT verification and then validates bearer token against `ACTION_ALLOWLIST`.
- [FACT] It uses service-role credentials to perform broad `select`, `insert`, `update`, `delete`, and `rpc` operations by request body.
- [FACT] The live `db-proxy` function is currently not tracked as a source file in the repository at the expected Supabase function paths checked during this pass.
- [INTERP] This makes it both a generic privileged tunnel and a `repo vs live` function-drift problem.

## Why not keep as-is

- broad table-level CRUD through service-role is too powerful
- caller intent is weakly bounded
- auditability is insufficient for a privileged pathway
- it encourages hidden dependencies outside typed repo contracts
- repo does not yet hold the tracked source needed for normal review discipline

## Approved short-term target

`db-proxy` may survive temporarily only if all of the following become true:

1. table CRUD operations are removed
2. only explicit allowlisted RPC names are callable
3. every invocation is audit-logged with caller, action, object, and outcome
4. requests with arbitrary table names are impossible
5. operational owners are explicit
6. repo regains a tracked source-of-truth for the live function implementation

## Approved medium-term target

Replace `db-proxy` with one of:
- narrow purpose-built admin/internal Edge Functions
- server-only RPC adapters with explicit contracts
- CI/admin job runners that do not expose generic DB mutation over HTTP

## Options considered

### Remove now

Pros:
- strongest immediate security posture

Cons:
- may break hidden operational flows before replacements exist

### Constrain, then replace

Pros:
- reduces immediate risk
- preserves continuity while approved replacements are built

Cons:
- requires discipline to avoid “temporary forever”

### Keep as-is

Rejected because:
- [INTERP] it is incompatible with the truth-boundary stabilization goal

## Rollback trigger

Rollback from “remove/replace” to temporary constrained mode only if:
- a critical production or ingestion flow is proven to depend on `db-proxy`
- no narrower approved path exists yet
- the constrained version is auditable and RPC-only

## Exit criteria

One of the following must become true:

1. `db-proxy` is deleted
2. `db-proxy` becomes a narrow internal RPC adapter with full audit trail

Anything broader counts as Sprint 1 failure.

## PASS / FAIL

PASS:
- no arbitrary table CRUD remains
- service-role is not exposed through a generic HTTP mutation tunnel
- dependency graph around `db-proxy` is known
- repo has a tracked representation of the live function or the function is retired

FAIL:
- `db-proxy` remains “temporary but broad”
- hidden callers still depend on undocumented operations
- live function continues to exist outside repo review discipline
