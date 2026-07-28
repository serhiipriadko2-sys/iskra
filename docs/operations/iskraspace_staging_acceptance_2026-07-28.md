# IskraSpace staging acceptance receipt — 2026-07-28

Status: `verified-live-staging`; production promotion not yet performed.

## Proof boundary

This receipt covers the data-less Supabase preview project
`rejqxblontqjycldniyz`, branch ID
`14ccc39f-5976-40ea-8617-f263cbb2cf85`, associated with Git branch
`fix/iskraspace-p0-production-hardening-20260728`. It proves the database,
Edge source, JWT setting and acceptance behavior observed on that preview
project. It does not prove production deployment, provider availability,
provider billing behavior, browser UI acceptance or GitHub merge.

The deployed Edge source is the source committed at
`e7bed692753a9131c8b7b53f0c2e60b210e118d3`. The follow-up acceptance-harness
and dependency changes do not modify either Edge Function or their shared
runtime files.

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

The automatic preview function phase failed because repository config also
references the absent `supabase/functions/kain/index.ts`. This did not affect
database migration replay. The two functions in the approved scope were then
deployed manually from `runtime/iskraSpace/supabase` with Supabase CLI
`2.109.0`.

## Edge read-back

| Function | Version | Status | JWT | Bundle SHA-256 |
| --- | ---: | --- | --- | --- |
| `gemini` | 1 | ACTIVE | `verify_jwt=true` | `48c984f06a3d7be92600c93f20d79438a5afa157679d89b531eabcd7e781ef9d` |
| `iskra-agent` | 1 | ACTIVE | `verify_jwt=true` | `c29e975e86cf4ac5907a90f9538ae785852b5df4eb36a3ff59521a1930b57ed7` |

Downloaded source read-back matched the local source byte-for-byte:

| File | SHA-256 |
| --- | --- |
| `gemini/index.ts` | `64fd8ad8dfe7927425337023d551263046c771ce08cacf91eced46fd3996ffdc` |
| `gemini/deno.json` | `4d444edb3fa4635e953876515e0734be0fc3ba3135947a8d351f5b0ad6b6187d` |
| `iskra-agent/index.ts` | `9d091b9f73a0680c851c7f3a2372dafd58811fc29097b798a7146c7bc26fc3bd` |
| `iskra-agent/deno.json` | `0ffef2083b62eb573cdf5e311dc06dfb6aedcbb84b641a5531f2243420d374ee` |
| `_shared/aiBoundary.ts` | `890759c41023a9558f634d728cd6aa7d1d8d9a1c4ef5289d920fc85ff506d052` |
| `_shared/aiContentPolicy.ts` | `3a0bc91c4c4583552616db04e4108237e07141c04901ea2df7e89b23332ab327` |

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

Result: 7/7 files and 60/60 tests passed.

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
principal_a_bootstrap_sha256=18454f4792dbdf65bbfe3872316a41df8c93705841410f8e2d26f35c3abd3c94
principal_b_bootstrap_sha256=e69071646e47059f17a41450311ec2d9362fa5b4e135ef3f293396bf50eaa87b
```

Cleanup receipt:

```text
staging_acceptance_exit=0
cleanup_db_exit=0
cleanup_auth_errors=0
cleanup_principals=4
cleanup_ok=true
```

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
- Auth: the expected anonymous-signup `422`, principal lifecycle operations and
  cleanup; no unexplained authentication failure;
- Postgres: four ERROR rows, all expected negative-test denials
  (`audit_log` permission denied ×2, foreign Graph node denied ×2);
- branch-action: automatic function bundling recorded the known missing
  `kain/index.ts`; manual read-back of the two approved functions supersedes
  that automatic phase for this scoped receipt.

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

1. the follow-up commit is pushed and PR #316 is green on its exact head;
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
