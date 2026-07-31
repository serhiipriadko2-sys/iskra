## ADR-20260731-001: Supabase Advisor Remediation and Migration Provenance

Status: accepted for staged remediation planning; implementation pending.

Canonical record: this file. The root `adr-log.md` section is a chronological mirror.

### Context

The IskraSpace P0 Edge release is verified-live-production for `gemini` and
`iskra-agent`. Its function-only scope did not mutate the production database
or Auth configuration. Post-deploy advisors still report database/auth WARN and
INFO findings.

The read-only production snapshot exposes a load-bearing provenance conflict:
repository `main` contains
`20260718200634_restore_closed_beta_graph_acl.sql`, but production history does
not record it. Production instead records
`20260728171718_revoke_direct_execute_on_graph_trigger_function` and
`20260728183421_parallax_memory_gate`, whose migration files are absent from
repository `main`.

Live policy read-back also shows `graph_nodes_read_public` and
`graph_edges_read_public` assigned to role `public`, plus owner and
active-beta policies on the same tables. No direct `anon` table grant was
observed, so this is a latent widening/source-drift risk rather than proof of a
current anonymous read. The `authenticated` role nevertheless holds broad
Graph table privileges including `REFERENCES`, `TRIGGER` and `TRUNCATE`.

The 13 warned SECURITY DEFINER RPCs are callable by `authenticated`; all
currently have explicit function-level `search_path`, but the advisor title
alone does not prove or disprove correct identity and ownership checks.

Evidence annex:
`docs/operations/supabase_advisor_snapshot_2026-07-31.md`.

### Decision

1. Preserve the P0 Edge release verdict. Advisor remediation is a separate
   database/Auth lifecycle and must not rewrite the successful function deploy
   as failed or incomplete.
2. Freeze production database writes until migration provenance is reconciled.
   Recover exact SQL bodies and checksums for the two live-only migrations, or
   produce a schema-diff receipt that fully accounts for their effects.
3. Reconcile by new forward-only migrations. Do not rewrite committed migration
   history and do not mark repository migration `20260718200634` as applied
   without staging and production history evidence.
4. Treat Graph policy repair as the first security migration: replace
   public-role policy scope with authenticated-only closed-beta intent,
   consolidate overlapping permissive policies, retain active-beta and owner
   isolation, and normalize the four remaining `auth_rls_initplan`
   expressions.
5. Audit all 13 authenticated SECURITY DEFINER RPCs by function body and
   two-principal behavior. Retain EXECUTE only for intentional API contracts;
   revoke unused or trigger-only entry points. Explicit `search_path` remains
   mandatory but is not sufficient evidence.
6. Audit Graph table grants independently of RLS. Retain only privileges proven
   necessary by supported API paths; specifically justify or revoke
   `REFERENCES`, `TRIGGER` and `TRUNCATE` for `authenticated`.
7. Review GraphQL object visibility separately from row authorization. Do not
   revoke table grants blindly if that would break the supported PostgREST or
   application contract; prove anonymous, non-member, suspended and cross-user
   denial first.
8. Enable leaked-password protection through a separately receipted Auth change
   when plan support and account-flow tests are confirmed.
9. Performance warnings are evidence candidates, not automatic mutations:
   index foreign keys only after plan/write-cost review; do not drop an index
   solely because the advisor calls it unused; change Auth connection strategy
   only with capacity evidence; relocate `pg_trgm` through its own staged
   extension migration.

### Alternatives

- Ignore all WARN/INFO because the Edge release passed. Rejected: the migration
  conflict and public Graph policies can change the security decision.
- Apply `20260718200634` directly to production. Rejected: live-only
  migrations make the current history non-reproducible from `main`.
- Blanket-revoke authenticated EXECUTE and SELECT. Rejected: it may disable
  intentional RPC and client contracts without proving a safer replacement.
- Drop every unused index. Rejected: advisor counters after a recent release do
  not represent a complete workload history.
- Fold the work into the production receipt. Rejected: deployed functions and
  database governance have different mutation, rollback and verification
  boundaries.

### Consequences / Price

- The successful Edge release remains closed and independently auditable.
- Database hardening is blocked on provenance recovery rather than optimistic
  SQL application.
- The first remediation PR may be documentation/migration-history recovery only
  and may not reduce advisor counts immediately.
- Some warnings may be accepted with rationale after semantic tests; zero WARN
  is not the objective. Reproducible least privilege is the objective.
- Staging branch cost and additional two-principal acceptance are required
  before any production migration.

### Tests / QA

- T1: clean local replay from an empty database with exact repository migration
  order and hashes.
- T2: live-versus-repo migration manifest with no unexplained version or body.
- T3: data-less staging apply, schema diff and advisor before/after receipt.
- T4: anonymous, non-member, suspended, user A and user B matrix across Graph
  tables, table grants, Graph RPCs, GraphQL and REST; include a proof that no
  supported client path can invoke TRUNCATE or other non-contract privileges.
- T5: SECURITY DEFINER body audit for `auth.uid()`, active membership,
  ownership, bounded arguments, fixed `search_path` and least EXECUTE grants.
- T6: rollback rehearsal or forward-repair plan before production apply.
- T7: post-production read-back of migration history, policies, grants,
  functions, advisors and scoped logs.
- Boundary test: no change to the six verified Edge/shared files and no claim
  that advisor reduction alone proves tenant isolation.

### Diff scope

This ADR and its evidence annex are documentation-only. Future implementation
may touch `supabase/migrations/`, database contract tests and an Auth
operations receipt. It must not silently modify the production Edge release.

### Builder / package mirror

Not needed. This decision governs repository and Supabase operations, not
Builder-facing behavior.

### Live verification

Pending. Current live evidence is read-only. No advisor remediation write has
been executed under this ADR.

### Rollback / Stop Conditions

Stop before production if migration history remains unexplained, staging cannot
replay cleanly, any anonymous/cross-user path opens, an intentional RPC breaks,
or rollback/forward-repair evidence is absent. Production changes must be
forward-only and followed by exact read-back.

### ΔDΩΛ

Delta: Supabase WARN/INFO findings become a separate provenance-first hardening
program instead of being mixed into the completed Edge release.
D: live advisors, migration history, `pg_policies`, `pg_proc`, repository
migration files and the production promotion receipt.
Omega: 0.94 for the observed drift and decision boundary; lower for the unknown
SQL bodies of the two live-only migrations.
Lambda: revise after provenance recovery, clean replay and staging acceptance,
or if a new production migration/Auth change occurs.

Owner: project owner. Implementation authority: separate reviewed migration PR
and explicit production promotion gate.
