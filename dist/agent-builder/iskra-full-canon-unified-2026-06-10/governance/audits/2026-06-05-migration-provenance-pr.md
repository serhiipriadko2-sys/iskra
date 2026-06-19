# Migration Provenance PR Receipt — 2026-06-05

Status: proposed for merge
Mode: AUDIT / GOVERNANCE
Repository: `serhiipriadko2-sys/iskra`
Supabase project: `AgiIskra` / `typcvaszcfdpkzbjzuur`
Live mutation: none

## Context

After the 2026-06-05 Agent Builder and governance sync, the highest remaining operational risk is Supabase live-state versus Git migration provenance. Previous audit confirmed `HIGH-RISK DRIFT`. This PR does not remediate live state; it creates the missing provenance map needed before safe SQL changes.

## Change Set

Added:

```text
supabase/migrations/PROVENANCE_2026-06-05.md
governance/audits/2026-06-05-migration-provenance-pr.md
```

No SQL migration was applied. No live database object was changed.

## Evidence

### GitHub evidence

Fetched and reviewed:

- `supabase/README.md`
- `supabase/migrations/20260101000000_schema.sql`
- `supabase/migrations/20260301141500_memory_nodes_pgvector_hnsw.sql`
- `supabase/migrations/20260305000000_graph_nodes.sql`
- `supabase/migrations/20260307_fix_rls_policies.sql`
- `supabase/migrations/README_LEGACY_DATA_MIGRATION.sql`
- `supabase/migrations/20260528182000_truth_boundary_p0_security_hardening.sql`
- `governance/adr_20260528_embedding_standard_v1.md`
- `docs/operations/sprint2_implementation_backlog.md`

### Supabase evidence

Read-only connector checks:

- project list / project metadata for `AgiIskra` / `typcvaszcfdpkzbjzuur`
- migration inventory
- verbose `public` table schema summary
- security advisors
- read-only SQL for public functions, policies, and table grants

## Findings

1. Live migration inventory includes March legacy/rate-limit migrations and May 2026 `iskra_canon_*` / temp import-RPC migrations that are not fully mapped to verified Git migration files.
2. Git contains both legacy public GraphRAG material and newer truth-boundary docs pointing toward `iskra.*` / 1536-dimension canon ingestion.
3. Live `public.memory_nodes` does not match the older `vector(384)` repo migration shape.
4. Live `graph_nodes` / `graph_edges` exist and appear related to the repo graph migration, but live grants/policies/advisors show hardening is incomplete.
5. Repo has `20260528182000_truth_boundary_p0_security_hardening.sql`, but current live grants/advisors suggest its intended effects are not fully present live or not applied to all relevant graph objects.

## Risk

- Applying another remediation migration without provenance may hide or worsen drift.
- Graph and memory domains may be semantically mixed: app user-memory, legacy GraphRAG, and canon-ingestion memory need separate ownership models.
- Security advisor warnings are real enough to plan remediation, but remediation should be sequenced after caller/owner classification.

## Safe Next Sequence

1. Merge this provenance PR.
2. Create PR A: complete migration inventory closure with every repo migration and every live migration classified.
3. Create PR B: graph hardening migration review, focused on `search_path`, `anon` grants, graph policies, and GraphQL exposure.
4. Create PR C: decide `public.memory_nodes` fate: user-memory, legacy, or deprecated.
5. Create PR D: apply advisor remediation with before/after Supabase advisor evidence.

## PASS / FAIL

PASS:

- Drift has a reviewable provenance map.
- Follow-up SQL can be scoped without guessing live object ownership.
- No live mutation occurred during this pass.

FAIL:

- If this document is treated as remediation rather than audit.
- If follow-up live SQL is applied without mapping live-only migrations and caller models.

## ΔDΩΛ

Δ: The next strong step is converted from a vague drift warning into a PR-ready provenance map.
D: Git migration files, truth-boundary docs, Supabase live migration/table/function/policy/grant/advisor reads.
Ω: 0.86 for observed facts; 0.74 for complete migration inventory until tree listing closes all repo files.
Λ: Revise after full repo migration inventory and before any live SQL remediation.
