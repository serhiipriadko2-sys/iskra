# ADR-20260618-001: db-proxy Edge Function Governance and Retirement Path

Status: accepted
Date: 2026-06-18
Owner / Builder: Semyon / Iskra vOmega.7 Full Canon
Scope: AgiIskra Supabase Edge Functions, release security governance, db-proxy lifecycle

## Context

A live Supabase audit of `AgiIskra / typcvaszcfdpkzbjzuur` shows that `db-proxy` is currently active (version 3) with `verify_jwt=true`.

The `db-proxy` function acts as a tunnel for client-side queries, allowing the front-end components of `runtime/iskraSpace` to execute database transactions. While protected by JWT verification, a proxy that allows database execution represents a significant attack surface and architectural drift away from standard Postgres Row Level Security (RLS) paths.

To achieve a clean release posture for public launch, we must establish explicit ownership, usage constraints, a disable policy, and a timeline for deprecation.

## Decision

1. **Deprecation Status:** Formally deprecate `db-proxy`. The long-term architectural goal is a direct-to-database connection using `supabase-js` and fine-grained RLS policies on tables and views.
2. **Access Control:** Enforce `verify_jwt=true` at all times. Any deployment or manual modification that sets `verify_jwt=false` for `db-proxy` is considered a critical security violation.
3. **Log & Audit:** Any client requesting database operations via `db-proxy` must include user identifying parameters (`auth.uid()`) to allow audit trail logging in Postgres logs.
4. **Disable Policy:** If any security anomaly is detected, or if the client migration to standard RLS is completed, the function must be immediately disabled using:
   ```bash
   npx supabase functions delete db-proxy --project-ref typcvaszcfdpkzbjzuur
   ```
5. **Exit Criteria for Full Removal:** `db-proxy` will be deleted from the live environment as soon as local source scans of `runtime/iskraSpace/` and `apps/` show zero invocations of the `db-proxy` HTTP endpoint.

## Alternatives

1. **Delete `db-proxy` immediately.**
   *Rejected* because the current front-end codebase may still have active dependencies on `db-proxy` for legacy GraphRAG traversal or node metadata syncing. Immediate deletion would break live workflows.
2. **Convert `db-proxy` to an unauthenticated diagnostic endpoint.**
   *Rejected* as it creates an extreme security risk by allowing arbitrary read/write access without JWT validation.
3. **Leave it as is without governance.**
   *Rejected* because a privileged tunnel without ownership and a deprecation path blocks public release sign-off.

## Consequences / Price

### Benefits:
- Establishes a clear security boundary and owner.
- Minimizes the risk of privileged execution by enforcing JWT validation.
- Lays out a roadmap to clean up the architecture.

### Costs:
- Development overhead to migrate remaining `db-proxy` queries to direct RLS-backed Supabase client calls.
- Maintenance of user context inside proxy calls to support audit logging.

## Verification

Live CLI audits must confirm:
1. `db-proxy` is either `ACTIVE` with `verify_jwt=true` or absent (`DELETED`).
2. Local code references to `db-proxy` are tracked and minimized.

## Delta D Omega Lambda

- **Delta:** Formulated the deprecation, ownership, and disable policy for `db-proxy`.
- **Data:** Supabase live function list audits, `db-proxy` source reviews, and repository security protocols.
- **Omega:** 0.90 (high confidence in the security containment strategy, moderate on migration complexity until client dependencies are fully inventoried).
- **Lambda:** Revisit this ADR when client-side queries are migrated to direct RLS, or if the `db-proxy` endpoint is completely removed from the project.
