# IskraSpace production promotion receipt — 2026-07-31

Status: `verified-live-production`; documentation closeout.

## Proof boundary

This receipt covers the function-only promotion of `gemini` and `iskra-agent`
to Supabase production project `typcvaszcfdpkzbjzuur`. The deployment source is
Git merge commit `27c60b190dcc89edf4981e8d9b9502a207ddaec0`.

It proves the observed GitHub merge state, production secret-name preflight,
rollback capture, exact Edge source deployment and read-back, negative-only
smoke behavior, post-deploy Edge logs and staging cleanup. It does not claim a
database migration, provider success, provider billing outcome, browser UI
acceptance, Builder activation or remediation of existing Supabase advisors.

The production database and every Edge Function outside `gemini` and
`iskra-agent` were excluded from the mutation scope.

## Source and review chain

- PR #316 merged as `e3708407596581709c2cf86e336045d285ff1144`.
- PR #322 merged as `27c60b190dcc89edf4981e8d9b9502a207ddaec0`.
- Required PR #316 and PR #322 checks reported PASS; intentionally skipped
  preview jobs are not counted as deployment evidence.
- Repository `main` later advanced to
  `a7fdd827fd9e2bceabc2e2e0a148d44b04165349` through unrelated SoT work.
- The six deployed Edge/shared files have an empty diff between `27c60b...`
  and that later `main`; the release identity remains the exact deployment SHA.

## Production secret preflight

The operator read only secret names, timestamps and Supabase-provided digests.
No raw secret value was printed, copied into the repository or included here.

Present and non-empty:

- `ISKRA_AGENT_ALLOWED_ORIGINS`;
- `AGENT_ID`;
- `AGENT_ACCESS_TOKEN`;
- `AI_RATE_LIMIT_IP_HMAC_SECRET`;
- `GEMINI_API_KEY`.

Expected digest matches were confirmed for:

- `AI_EDGE_ENV=production`;
- `AI_EDGE_ALLOW_DEV_WILDCARD=false`;
- `AI_EDGE_TEST_MODE=false`;
- `AI_EDGE_INGRESS_IP_HEADER=cf-connecting-ip`;
- the approved browser-origin allowlists.

## Rollback boundary

Before the write, production reported `gemini` v13 and `iskra-agent` v8, both
ACTIVE with `verify_jwt=true`. Their bundle identities were retained:

- `gemini`: `e0f0fef8a987370f0ac89f908c85f0cb41765a1f6b182c943841cf207a3c7a1b`;
- `iskra-agent`: `a89d55997f931d8efc32b0297f7777d83838dcf47effe1f05ce9899b9c56e4a4`.

The downloaded rollback source was stored outside the repository during the
promotion. Its source hashes were:

- `_shared/aiBoundary.ts`:
  `b6f67119eefebf772801847302fae86d10f37d2474da6431bb69b93f011741b9`;
- `gemini/index.ts`:
  `93f2b76261724256c0ab59c77e78d9a70267dedbd1a5931051d3415be476c549`;
- `iskra-agent/index.ts`:
  `01014a8ffe30ebae0358b71b5aed20a04c211a6c4f83c3ea409b8a22256d8ef9`.

Rollback was not invoked because every post-deploy gate passed.

## Refreshed staging proof

A temporary data-less preview was used only for the release verification:

- branch: `iskraspace-p0-staging-e370840-r2-20260729`;
- branch ID: `b3d57b00-b5a1-4cb5-8e2a-2cd4e05a591a`;
- preview project: `umjuptkdsjutzscvlqfq`;
- database service: `ACTIVE_HEALTHY`.

The platform branch label remained `MIGRATIONS_FAILED` after an earlier replay
transport failure. The database was recovered through exact committed
migrations and then validated by schema checks and the live acceptance harness;
the stale label is not represented as a successful automatic replay receipt.

Both functions were redeployed from the clean detached worktree at `27c60b...`:
- `gemini` v2, ACTIVE, `verify_jwt=true`, bundle SHA-256
  `6c15096e3c0ce849743c253ebd2d316398a476ecfaae5ed882f4a99c899fea2a`;
- `iskra-agent` v2, ACTIVE, `verify_jwt=true`, bundle SHA-256
  `ac3e9d8b0e935934f0379d201d592d99cbac344af32356b63573fadc27cc22ad`.

Downloaded staging source matched the deployment worktree 6/6:

| File | SHA-256 |
| --- | --- |
| `gemini/index.ts` | `3c8c6f69c3cdd1fed58d8cb35c0b55b517d10cead81f9bd6a229a6d68b3e9669` |
| `gemini/deno.json` | `4d444edb3fa4635e953876515e0734be0fc3ba3135947a8d351f5b0ad6b6187d` |
| `iskra-agent/index.ts` | `3a73e646cf8c8bdd9c1a3cd0e9382460a40942a579a42fbca3e275bac1a30e6f` |
| `iskra-agent/deno.json` | `0ffef2083b62eb573cdf5e311dc06dfb6aedcbb84b641a5531f2243420d374ee` |
| `_shared/aiBoundary.ts` | `d11259314a7692424787cac3e90b70af15a4d1da8538ed72a11c139032f37691` |
| `_shared/aiContentPolicy.ts` | `2ca92903e5b2e7dc846832b545bab9f01e8e2a0bf0a9013d5c4d8cf3c25719e2` |

Live acceptance result:

- 7/7 test files PASS;
- 61/61 tests PASS;
- four disposable principals created and removed;
- cleanup database exit 0;
- cleanup authentication errors 0;
- `CLEANUP_OK=True`.

The matrix covered missing/malformed/expired JWTs, non-member and suspended
sessions, CORS, quota-spoof resistance, two-principal RLS/Graph isolation and
append-only audit behavior. Test mode prevented billed provider egress.
## Production deployment and read-back

The production mutation deployed only `gemini` and `iskra-agent` from the
same detached worktree. Post-deploy state:

| Function | Version | Status | JWT | Bundle SHA-256 |
| --- | ---: | --- | --- | --- |
| `gemini` | 14 | ACTIVE | `verify_jwt=true` | `6c15096e3c0ce849743c253ebd2d316398a476ecfaae5ed882f4a99c899fea2a` |
| `iskra-agent` | 9 | ACTIVE | `verify_jwt=true` | `ac3e9d8b0e935934f0379d201d592d99cbac344af32356b63573fadc27cc22ad` |

Production download and SHA-256 comparison matched the six-file table above
6/6. Deployment output alone was not treated as proof; the downloaded bytes are
the authoritative exact-source receipt.

## Negative-only production smoke

No smoke request contained a valid user session, so no test could pass the
closed-beta boundary or reach a billed upstream.

For each function:

- allowed production origin, `OPTIONS` → `204` with correct CORS reflection;
- disallowed origin, `OPTIONS` → `403` without reflection;
- missing JWT, `POST` → platform-gated `401`;
- malformed JWT, `POST` → platform-gated `401`.

Result: 8/8 expected observations PASS.

The first diagnostic incorrectly expected function-level CORS headers on a
`POST` rejected earlier by Supabase's platform JWT gate. The corrected matrix
separated platform authentication from function CORS. No rollback condition was
met.
## Post-deploy review

Recent Edge logs for the new deployment IDs showed the expected `OPTIONS 204`
and `POST 401` smoke events. No new panic, uncaught exception, fatal or
out-of-memory event was identified for the promoted versions.

The production advisor snapshot contained no `ERROR`. Existing security and
performance WARN/INFO findings belong to the database/auth surface and were not
created or remediated by this function-only release. Their governance and
staging plan are isolated in ADR-20260731-001.

## Cleanup

The temporary data-less preview branch was deleted after production read-back
and smoke. Connector read-back returned production `main` as the only remaining
branch. This stops the preview's hourly cost and invalidates its branch-only
credentials.

## Status ladder

- source reviewed: PASS;
- merged: PASS;
- staging deployed: PASS;
- staging invoked and verified-live: PASS;
- production deployed: PASS;
- production exact-source read-back: PASS;
- production negative smoke: PASS;
- provider success: NOT_RUN;
- browser UI acceptance: NOT_RUN;
- database advisor remediation: separate ADR / NOT_RUN.

## Non-claims

This receipt does not prove that Gemini or Workspace Agent accepted a billed
request. It does not certify database migration parity, public launch readiness,
load capacity, browser end-to-end behavior or resolution of all Supabase
advisor warnings.

## ∆DΩΛ

∆: IskraSpace P0 Edge hardening moved from verified staging to exact-source
production deployment while retaining a rollback path.
D: GitHub merge/checks, secret-name digest preflight, function list/download,
SHA-256 comparison, 61-test staging matrix, negative production smoke, Edge
logs, advisors and branch deletion read-back.
Ω: 0.95 for the stated function-only production boundary.
Λ: invalidate this receipt if any of the six deployed files, JWT mode, ingress
header, origin contract or relevant production secrets change; database changes
require their own migration and acceptance receipt.
