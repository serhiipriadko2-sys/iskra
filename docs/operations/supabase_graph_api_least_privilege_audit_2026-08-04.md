# Supabase Graph API least-privilege audit — 2026-08-04

Status: `LOCAL_CLEAN_REPLAY_PASS`; final preview acceptance and production apply pending.

Production project: `typcvaszcfdpkzbjzuur`.
Source base: merge commit `0672f8a01c2abca1a08eb07745cc65c119dfaa34`.

## Boundary

This receipt records read-only production evidence and a forward migration in
Git. No production SQL, Auth change or data write has occurred under this
receipt.

## Live finding

Both `public.graph_nodes` and `public.graph_edges` currently grant
`authenticated` all seven table privileges:

`SELECT, INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER`.

The supported browser contract uses only the first four through PostgREST and
pg_graphql. The latter three are not required by application code. This is a
high-risk least-privilege drift because PostgreSQL explicitly excludes
whole-table operations such as `TRUNCATE` and `REFERENCES` from row-security
enforcement.

Sources:

- <https://www.postgresql.org/docs/17/ddl-rowsecurity.html>
- <https://www.postgresql.org/docs/16/ddl-priv.html>
- <https://supabase.com/docs/guides/api/securing-your-api>

## SECURITY DEFINER review

Production exposes 13 `public` SECURITY DEFINER functions to `authenticated`:

- `consume_ai_quota`;
- `resolve_beta_access`;
- eleven `graph_*` RPCs.

Fresh catalog checks found a pinned function-level `search_path`, an
`auth.uid()` identity guard and an active-beta membership guard in every body.
Repository verification additionally rejects shared/foreign mutations in
`graph_create_edge`, `graph_delete_node` and
`graph_update_node_resonance`. The previous 61-test acceptance covered both
mutating and core read paths, but not every read-oriented RPC individually;
the expanded matrix now does so.

Supabase documents that security-definer functions execute with creator
privileges and therefore require explicit identity/authorization checks. The
functions remain in `public` because they are intentional Data API RPCs; moving
them to an unexposed schema would remove the supported API surface. Their
explicit grants, pinned search paths and behavioral matrix are the compensating
controls.

Source: <https://supabase.com/docs/guides/database/postgres/row-level-security>.

## GraphQL decision

The Graph tables retain authenticated CRUD grants because the supported client
uses direct row APIs. Supabase pg_graphql derives visibility from PostgreSQL
grants and applies the same RLS policies. Disabling schema introspection does
not disable known queries. Therefore GraphQL is tested explicitly with owner,
foreign active-member and non-member JWTs rather than treated as closed by the
existing introspection comment.

The first exact-PR preview acceptance found a source-of-truth dependency drift:
production runs `pg_graphql 1.5.11` in schema `graphql`, but the clean preview
reported that the extension was available and not installed. No migration had
declared that production dependency. Migration
`20260804184500_reconcile_pg_graphql_extension.sql` now pins the production
version and API-role schema usage so fresh replay and preview exercise the
same GraphQL surface. `CREATE EXTENSION IF NOT EXISTS` leaves the already
installed production extension unchanged.

Sources:

- <https://supabase.com/docs/guides/graphql/security>
- <https://supabase.com/docs/guides/graphql>
- <https://supabase.github.io/pg_graphql/api/>

## Change

Migration `20260804183000_graph_api_least_privilege.sql`:

- revokes `TRUNCATE`, `REFERENCES` and `TRIGGER` from `PUBLIC`, `anon` and
  `authenticated` on both Graph tables;
- reasserts only `SELECT`, `INSERT`, `UPDATE`, `DELETE` for `authenticated`;
- leaves the full administrative privilege set for `service_role` unchanged;
- contains no row DML and does not alter Edge Functions or Auth.

Migration `20260804184500_reconcile_pg_graphql_extension.sql`:

- creates schema `graphql` only when absent;
- installs `pg_graphql 1.5.11` only when absent;
- denies generic `PUBLIC` schema usage and grants endpoint usage to `anon`,
  `authenticated` and `service_role`, matching the observed production API
  boundary;
- contains no row DML and does not upgrade the existing production extension.

The clean-replay workflow now requires an exact `0|8` Graph grant receipt:
zero forbidden client grants and eight authenticated DML grants across the two
tables. It also requires `pg_graphql 1.5.11|graphql` with the explicit schema
usage matrix. The live acceptance harness independently checks the
forbidden-grant count before creating any fixture.

## Local clean replay

Pinned Supabase CLI `2.109.0` rebuilt the database from empty state and applied
the full migration chain through `20260804184500`. Read-back returned:

- migration history: `20260804183000|graph_api_least_privilege|4`;
- migration history: `20260804184500|reconcile_pg_graphql_extension|6`;
- Graph grant summary: `0|8`;
- pg_graphql dependency: `1.5.11|graphql|false|true|true|true` for
  version, schema and `PUBLIC`/`anon`/`authenticated`/`service_role` schema
  usage;
- database lint: no error-level finding (one pre-existing warning for the
  unread `current_reset` variable in `public.check_rate_limit`);
- canonical-versus-live local Graph snapshot verifier: PASS, including columns,
  constraints, indexes, final composed policies, all RPC definitions, RLS,
  grants and migration history.

The replay also exposed and repaired a verifier blind spot: the canonical list
had stopped at `20260710110000` and therefore ignored the later final policy
composition in `20260718200634`. The verifier now checks the actual terminal
chain: eight authenticated-only action policies plus restrictive active-beta
membership policies, with no public/anon Graph policy.

## Extended behavioral matrix

The two-principal suite now checks every read-oriented Graph RPC:

- search;
- resonance query;
- connection candidates;
- node-with-edges;
- statistics;
- BFS traversal;
- user-node query.

It also issues direct pg_graphql queries for an owner, another active member
and a valid non-member. Only the owner may observe the private node. Existing
tests retain mutation, direct-table, suspended-member, Edge, CORS, JWT and
quota-spoof coverage.

The first preview run passed 61 of 63 tests and completed full fixture cleanup.
Its GraphQL failure identified the missing extension dependency above. Its
quota-spoof failure was a test-clock false negative: the eleven requests used
one stable IP digest but split across adjacent database minute windows as
eight plus three. The test now aligns its start to the Supabase gateway `Date`
header with a bounded safety margin; the quota implementation is unchanged.
The acceptance harness also now uses the pinned CLI's documented
`--output-format json` query flag and normalizes SQL to a single Windows-safe
argument before any fixture creation.

## Preview credential containment

During CLI diagnosis, the disposable preview database URL was emitted into a
private operator-tool log. The value is not repeated, stored in Git or used as
production evidence; no production credential was involved. The preview
credential is treated as compromised. This PR cannot close until branch
`70c977e4-3a3b-4361-ac72-471d23d5497f` is deleted and deletion is read back.

## Stop and forward-repair conditions

Stop before production if clean replay does not record all four pending
migrations, the preview reports any forbidden Graph grant, any RPC exposes the
other principal's node, pg_graphql is absent or not version `1.5.11`, GraphQL
differs from REST RLS, supported CRUD breaks, or final-head CI is not green.

The migration is transactional. After a successful production apply, do not
restore `TRUNCATE`, `REFERENCES` or `TRIGGER` to client roles as a rollback.
Use a reviewed forward repair limited to the exact supported privilege that a
reproducible client path proves necessary.

## ∆DΩΛ

∆: a latent whole-table RLS bypass grant is converted into an explicit,
testable four-privilege client contract.
D: production catalogs, canonical migrations, runtime RPC usage, two-principal
acceptance design, PostgreSQL and Supabase primary documentation.
Ω: 0.96 for the live grant finding and SQL correction; lower for deployed
behavior until disposable preview acceptance and production read-back.
Λ: invalidate if Graph client architecture, pg_graphql exposure, RPC bodies,
table grants or production migration history changes.
