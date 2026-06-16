# ADR-20260616-001: Retire Canon Import/Backfill Edge Functions

Status: accepted
Date: 2026-06-16
Owner / Builder: Semyon / Iskra vOmega.7 Full Canon
Scope: AgiIskra Supabase Edge Functions, release security governance

## Context

A live Supabase audit of `AgiIskra / typcvaszcfdpkzbjzuur` showed that
`iskra-canon-import-1536` and `iskra-canon-backfill-1536` were active support
functions with `verify_jwt=false`. Their source used server-side privileged
secrets from the Supabase function environment. No secret values were printed or
stored, but the unauthenticated invocation boundary was release-blocking.

A later live function list also showed that `iskra-canon-import-diagnostic` was
already absent, while repository docs and memory still described it as live.
That made the next governance task both a security hardening action and a
docs/memory drift repair.

## Decision

After explicit owner approval, retire both support functions as minimal 410
stubs and redeploy them with `verify_jwt=true`:

- `iskra-canon-import-1536`: version 4, `verify_jwt=true`, returns
  `{"error":"retired","code":"canon_import_retired"}` with HTTP 410.
- `iskra-canon-backfill-1536`: version 4, `verify_jwt=true`, returns
  `{"error":"retired","code":"canon_backfill_retired"}` with HTTP 410.

No SQL, DDL, storage, branch, data, or secret mutation is part of this decision.
The change affects only the live Edge Function source and JWT requirement for
these two support functions, plus governance documentation in GitHub.

## Alternatives

1. Keep the existing functions and only document an exception.
   Rejected because the live functions were privileged and unauthenticated.
2. Enable `verify_jwt=true` while preserving old import/backfill behavior.
   Deferred because the old handlers still performed privileged work and need a
   separate admin/caller policy before reactivation.
3. Delete the functions outright.
   Deferred because a 410 stub keeps the endpoint reversible and makes the
   retirement state explicit to callers.

## Consequences / Price

Benefits:

- Removes the unreviewed unauthenticated privileged Edge Function boundary.
- Makes accidental import/backfill execution fail closed.
- Preserves a reversible endpoint shape for emergency rollback.

Costs:

- Canon import/backfill cannot be run through these functions until a new
  approved operational path exists.
- Any future reactivation requires explicit owner approval, an ADR exception,
  expiry, and an authenticated admin/custom-auth gate.

## Tests / QA

Observed live after deployment:

- `gemini`: version 5, ACTIVE, `verify_jwt=true`.
- `db-proxy`: version 3, ACTIVE, `verify_jwt=true`.
- `iskra-canon-import-1536`: version 4, ACTIVE, `verify_jwt=true`, retired stub.
- `iskra-canon-backfill-1536`: version 4, ACTIVE, `verify_jwt=true`, retired stub.
- `iskra-canon-import-diagnostic`: absent from the live function list.

Read-back source for both retired functions shows no service-role client,
OpenAI client, file reads, database writes, or batch import/backfill behavior.
The source only returns HTTP 410 JSON.

## Rollback / Reversal Trigger

Rollback is allowed only if canon import/backfill is operationally required and
an approved admin caller path exists. Safe rollback means redeploying previous
source with `verify_jwt=true` plus an admin/custom-auth gate, or creating a new
time-boxed ADR exception with owner, caller, expiry, and smoke-test evidence.

Do not restore the previous `verify_jwt=false` privileged behavior.

## Diff Scope

- Live Supabase Edge Functions:
  - `iskra-canon-import-1536`
  - `iskra-canon-backfill-1536`
- GitHub governance docs:
  - `open-loops.md`
  - `docs/operations/iskraspace_supabase_readonly_baseline_2026-06-09.md`
  - this ADR
  - `ledger/sot.json`

## Delta D Omega Lambda

Delta: canon import/backfill live handlers are retired and JWT-protected.
D: Supabase connector before/after function lists and read-back source, plus
GitHub governance receipts.
Omega: 0.93 for live function metadata and source posture; lower for future
operational import/backfill needs until a new path is designed.
Lambda: revisit if import/backfill must run again, if `db-proxy` policy changes,
or if a later Supabase function list reintroduces a privileged unauthenticated
boundary.
