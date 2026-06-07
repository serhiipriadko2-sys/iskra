# iskraSpace Supabase Live Boundary Decision

Status: SAFE DECISION / NO LIVE MUTATION
Date: 2026-06-07
Scope: public release gate for `runtime/iskraSpace`
Project: `AgiIskra / typcvaszcfdpkzbjzuur`

## Decision

`runtime/iskraSpace` remains the public release target.

For this target, the observed production AI path is the `gemini` Edge Function.
`runtime/iskraSpace/services/geminiService.ts` sends generation, streaming, and
`embedContent` requests to `${SUPABASE_URL}/functions/v1/gemini`.

Repo-side `embed` remains release-required for the engine/web retrieval contour
(`packages/engine` and `apps/iskra-web`) if that contour is promoted to the
public release path. It is not a direct `runtime/iskraSpace` blocker unless the
public app starts calling the engine/web `embed` path or the release explicitly
requires that hybrid.

No live Supabase mutation is authorized by this decision.

## Evidence

- Fresh read-only function baseline on 2026-06-07 observed live `gemini`,
  `db-proxy`, `iskra-canon-import-1536`, `iskra-canon-backfill-1536`, and
  `iskra-canon-import-diagnostic`.
- Live `gemini` was observed with `verify_jwt=true`.
- Live `embed` was not present in the function list.
- Repo-side `supabase/functions/embed/index.ts` exists and
  `supabase/config.toml` pins `[functions.embed] verify_jwt = true`.
- `runtime/iskraSpace/services/geminiService.ts` uses the `gemini` function for
  `embedContent`.
- `apps/iskra-web/src/engineInstance.ts` and
  `packages/engine/src/services/edgeEmbeddings.ts` carry the repo-side `embed`
  retrieval path.

## Supabase Changelog Scan

Official source scanned: <https://supabase.com/changelog.md>

Release-relevant entries found in the 2026/2025 window:

- `pg_graphql` introspection default behavior changes. This reinforces the need
  for a fresh advisor/API-exposure baseline before any GraphQL release claim.
- Tables are no longer automatically exposed to Data and GraphQL APIs for new
  projects. Existing grants/exposure still need project-specific verification.
- Edge Functions recursive/nested call rate limits are now documented. Import,
  backfill, and proxy functions must keep owner/runbook/access/expiry records
  before public release.
- Custom JWT/signing-key change handling remains an auth-boundary item. Keep
  `verify_jwt`, environment separation, and token flow checks in the release
  gate.

## Release Boundary

Release-required for `runtime/iskraSpace`:

- `gemini` deployed, source-matched, `verify_jwt=true`, CORS/auth posture
  verified, `GEMINI_API_KEY` kept server-side.
- Supabase Auth session path verified for configured and no-env/offline modes.
- App data tables, RLS, and API exposure verified against the actual app imports.

Conditional / release-required only if promoted:

- `embed` live deployment/source match, `verify_jwt=true`, bearer auth defense
  in depth, CORS/rate-limit/env separation, and model/dimension contract.
- `apps/iskra-web` or `packages/engine` public retrieval path.

Release blockers independent of `embed`:

- `iskra-canon-import-diagnostic` must be removed from live or covered by a
  time-boxed ADR exception before public release.
- `iskra-canon-import-1536` and `iskra-canon-backfill-1536` need owner,
  runbook, caller/access boundary, logs, and expiry/removal decisions because
  the observed live `verify_jwt` value is false.
- `db-proxy` needs owner, runbook, access boundary, logs, and expiry/disable
  policy.
- Fresh advisors, migration inventory, grants/API exposure, and app data path
  must be attached before any live mutation or green release sign-off.

## Verification

PASS for this document means:

- `runtime/iskraSpace` dependency map distinguishes `gemini` embedContent from
  repo-side `embed`.
- The runbook and release snapshot no longer treat live `embed` absence as a
  direct blocker for a `gemini`-only `runtime/iskraSpace` release.
- Live-only or unauthenticated internal functions remain release blockers until
  removed, protected, or accepted by ADR.

FAIL if:

- `runtime/iskraSpace` starts importing the repo-side `embed` retrieval path
  without updating this decision.
- Public release scope changes from `runtime/iskraSpace` to `apps/iskra-web` or
  engine-backed retrieval without deploying/verifying `embed`.
- Live Supabase is mutated from this PR.

## Delta Receipt

Delta: `embed` is separated into direct-runtime vs engine/web retrieval scope.  
D: local repo import map, read-only Supabase function baseline, official Supabase changelog scan.  
Omega: 0.86 for repo import map and live function list; 0.72 for advisors/grants until a fresh advisor baseline is attached.  
Lambda: revise if public target changes, `runtime/iskraSpace` imports engine/web retrieval, or live function/advisor state changes.
