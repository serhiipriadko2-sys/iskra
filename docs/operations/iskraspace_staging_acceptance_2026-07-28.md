# IskraSpace staging acceptance receipt — 2026-07-28

Status: `verified-live-staging`; production promotion not yet performed.

Follow-up: production promotion was completed and independently verified on 2026-07-31. See `docs/operations/iskraspace_production_promotion_2026-07-31.md`. This staging receipt remains immutable evidence for its own preview run.

## Proof boundary

This receipt covers the data-less Supabase preview project
`rejqxblontqjycldniyz`, branch ID
`14ccc39f-5976-40ea-8617-f263cbb2cf85`, associated with Git branch
`fix/iskraspace-p0-production-hardening-20260728`. It proves the database,
Edge source, JWT setting and acceptance behavior observed on that preview
project. It does not prove production deployment, provider availability,
provider billing behavior, browser UI acceptance or GitHub merge.

The final deployed Edge/shared source snapshot is commit
`67c8a512253404a52f0084a801b6acc231233c85`. A later receipt-only commit may
move the PR head without changing any of the six deployed files; in that case
the file hashes below, not the documentation commit, remain the exact
deployment identity.

## Environment and deployment

- parent production project: `typcvaszcfdpkzbjzuur`;
- preview project: `rejqxblontqjycldniyz`;
- preview data clone: disabled;
- database status: `ACTIVE_HEALTHY`;
- migrations: 36/36 present through
  `20260718200634_restore_closed_beta_graph_acl`;
- secrets: configured through the staging secret plane; values are not
  recorded;
- `AI_EDGE_ENV=production`;
- `AI_EDGE_ALLOW_DEV_WILDCARD=false`;
- `AI_EDGE_TEST_MODE=true`, so successful boundary traversal terminates before
  any Gemini or Workspace Agent upstream request;
- accepted browser origin: `http://127.0.0.1:4173`;
- canonical ingress identity header: `cf-connecting-ip`.

The automatic preview function phase initially failed because repository-root
config used default `supabase/functions/*` locations for runtime functions.
This did not affect database migration replay. The follow-up maps `gemini`,
`iskra-agent` and `kain` to explicit paths relative to `supabase/config.toml`.
The two functions in the approved scope were deployed both through the original
manual runtime path and the corrected repository-root config with Supabase CLI
`2.109.0`.

## Edge read-back

| Function | Version | Status | JWT | Bundle SHA-256 |
| --- | ---: | --- | --- | --- |
| `gemini` | 7 | ACTIVE | `verify_jwt=true` | `2fae94308eae99ac4c12d9ac4a1159c94660991f2debd30df37ae9ca6d6caf3d` |
| `iskra-agent` | 5 | ACTIVE | `verify_jwt=true` | `7087ffb78320af157f69d40055730fce5c947edf97cb220e103a3a728ceb6d98` |

Downloaded source read-back matched the local source byte-for-byte:

| File | SHA-256 |
| --- | --- |
| `gemini/index.ts` | `9e5e125697b02b62ae6cf22644e9c6291ee3040f9bd6576060a529943ded472c` |
| `gemini/deno.json` | `4d444edb3fa4635e953876515e0734be0fc3ba3135947a8d351f5b0ad6b6187d` |
| `iskra-agent/index.ts` | `fa7c13a26213b020ded806a0589ec1b3541e0e68551d861dab6909555c8e6c4d` |
| `iskra-agent/deno.json` | `0ffef2083b62eb573cdf5e311dc06dfb6aedcbb84b641a5531f2243420d374ee` |
| `_shared/aiBoundary.ts` | `890759c41023a9558f634d728cd6aa7d1d8d9a1c4ef5289d920fc85ff506d052` |
| `_shared/aiContentPolicy.ts` | `d77100776f975bfd1668718ee67a5a43be7cb504f2df77c6f87c9a91d99a90dc` |

The final versions of both functions were deployed through the repository-root
`supabase/config.toml` after adding explicit entrypoint/import-map paths. This
proved that the branch automation and the manual operator path resolve the same
runtime source. The automatic preview also deployed the unchanged
`iskra-memory-gateway` source; that function is outside this acceptance matrix
and remains protected by the source contract.

## Negative matrix and two-principal acceptance

The durable operator harness
`tools/run_iskraspace_staging_acceptance.ps1` created four short-lived,
distinct authenticated principals:

- two active closed-beta members;
- one valid non-member;
- one suspended member.

It also created a correctly signed but expired JWT. Platform anonymous signup
is disabled and returned `422`; the receipt records that platform denial
instead of weakening Auth configuration for a test.

Result: 7/7 files and 61/61 tests passed.

The matrix proved:

- missing, malformed and expired JWTs return `401` for both functions;
- valid non-member and suspended sessions return `403` before provider routing;
- missing and disallowed origins return `403` without CORS reflection;
- both active principals resolve as active beta members;
- profile, audit-log and Graph rows remain owner-isolated for read, update and
  delete paths;
- direct Graph table access and Graph RPCs enforce ownership;
- `audit_log` remains append-only;
- ten valid Gemini requests reach the explicit no-upstream test response and
  the eleventh returns `429`, even when the caller changes
  `x-forwarded-for` on every request.

The last check is an empirical ingress result. A prior diagnostic run with
`AI_EDGE_INGRESS_IP_HEADER=x-forwarded-for` allowed eleven caller-selected
values to evade the limiter. With `cf-connecting-ip`, the same spoof matrix
produced ten `502` test-mode responses followed by `429`. Production must use
the staging-proven `cf-connecting-ip` setting unless a new ingress receipt
proves a different sanitized header.

Safe receipt hashes from the final run:

```text
anonymous_signup_deny_sha256=ed2bb4d6d643bb4ca71888a42975a23b2e06905ecaa7368d087111595438f77f
principal_a_bootstrap_sha256=66c4ff4fc33497a5ea95555dffae4f9d99738c924034c19910b42bf7619362c3
principal_b_bootstrap_sha256=46e46a2f73fc40317aebeeae79b36601c00789b0c8de2fe069ee34732983d891
```

Cleanup receipt:

```text
staging_acceptance_exit=0
cleanup_db_exit=0
cleanup_auth_errors=0
cleanup_principals=4
cleanup_ok=true
```

Cleanup deletes only rate windows attributable to the four fixture subjects;
it intentionally does not delete shared-IP windows belonging to other traffic.
The harness snapshots all 17 acceptance environment variables and restores
them in an outer `finally`, including when setup or cleanup fails.

## Advisors and logs

Post-acceptance advisors:

- security: 33 total, 0 ERROR — 12
  `rls_enabled_no_policy` INFO, 7 `function_search_path_mutable` WARN,
  1 `extension_in_public` WARN and 13
  `authenticated_security_definer_function_executable` WARN;
- performance: 31 INFO, 0 WARN/ERROR — 3 `unindexed_foreign_keys`,
  27 `unused_index` and 1 `auth_db_connections_absolute`.

Post-acceptance log review:

- Edge: 11 scoped requests, statuses `401×3`, `403×3`, `502×5`; no panic,
  uncaught exception, fatal or out-of-memory marker;
- Auth: the 24-hour capped snapshot contains expected anonymous-signup `422`
  events, principal lifecycle operations and cleanup; no unexplained
  authentication failure was identified;
- Postgres: eight ERROR rows, all expected negative-test denials
  (`audit_log` permission denied ×4, Graph-node ownership denied ×4);
- branch-action: no rows in the post-run 24-hour snapshot. Corrected explicit
  paths were proven by repository-root deployments; the GitHub preview check
  remains the independent automation receipt.

Advisor remediation references:

- <https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy>
- <https://supabase.com/docs/guides/database/database-linter?lint=0011_function_search_path_mutable>
- <https://supabase.com/docs/guides/database/database-linter?lint=0014_extension_in_public>
- <https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable>
- <https://supabase.com/docs/guides/database/database-linter?lint=0001_unindexed_foreign_keys>
- <https://supabase.com/docs/guides/database/database-linter?lint=0005_unused_index>

## Credential-containment receipt

An earlier disposable preview branch emitted its branch-only credentials into
local command output during management-plane read-back. No value is preserved
in this repository. That preview branch was deleted immediately, invalidating
its database and API credentials. The entire deployment, read-back,
acceptance, advisor and log sequence above was repeated on the clean
replacement branch named in this receipt.

## Production gate

Production promotion remains blocked until all of the following are true:

1. the receipt refresh is pushed and PR #316 is green on its exact head;
2. required production secret names are present, with
   `AI_EDGE_TEST_MODE=false` and `AI_EDGE_INGRESS_IP_HEADER=cf-connecting-ip`;
3. production pre-deploy function versions, bundle hashes, advisors and recent
   logs are captured without exposing secret values;
4. the exact reviewed Edge source is deployed with `verify_jwt=true`;
5. production read-back matches this file set exactly;
6. safe production smoke tests remain negative-only and do not invoke a billed
   provider;
7. rollback evidence retains the pre-deploy production versions and hashes.

## ∆DΩΛ

∆: staging now supplies exact-source, JWT, ingress, negative-matrix,
two-principal and cleanup evidence.
D: branch metadata, migration list, function list/download, Vitest acceptance,
advisors and scoped service logs.
Ω: 0.96 for this preview environment; lower for production until promotion and
read-back complete.
Λ: invalidate this receipt if the Edge/shared source, migration set, trusted
ingress behavior or production secret contract changes.
