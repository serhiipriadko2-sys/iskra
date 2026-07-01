# Iskra Space Release Status

Status: pre-release hardening target, not production-ready
Date: 2026-07-01
App path: `runtime/iskraSpace`

## What this means

Iskra Space is the repository's current public-release target, but the 2026-07-01 hardening pass does not mark it production-ready yet.

Other repository areas may still be important, but they are treated as internal support unless explicitly promoted by a later ADR.

## Current verified baseline

- Commit: `2067452527647a7ecfb6c26b2ebed98e3cb5fc12` at audit start.
- Canonical package manager: `pnpm` (`packageManager: pnpm@10.32.1`).
- Local gates passed on 2026-07-01: `typecheck`, `test:run` (636 passed / 3 skipped), `build`, `lint` (0 errors / 77 warnings), `pnpm audit`, `pnpm install --frozen-lockfile`, Chromium E2E (27 passed).
- AI path: Chat and Council use the Supabase Edge AI gateway; browser Gemini Live is release-disabled.
- Supabase read-only inventory: `gemini` v6, `db-proxy` v4, `iskra-canon-import-1536` v5, `iskra-canon-backfill-1536` v5 are `ACTIVE` with `verify_jwt=true`.

## What must be checked before release

A release pass should verify:

- dependencies install cleanly;
- the app builds from a clean checkout;
- required environment variables are documented and safely configured;
- Supabase tables/functions used by the app match the code;
- CORS/auth/rate-limit behavior is safe for public use;
- no secrets are exposed in client-side code or docs;
- public-facing documentation points users to Iskra Space, not internal support flows.

## Current release blockers / residual risks

- Full Playwright browser matrix is not yet completed; Chromium E2E is green, Firefox/WebKit/mobile remain release gates.
- Supabase advisors still report security/performance warnings, including GraphQL exposure for authenticated roles and authenticated callable `SECURITY DEFINER` graph RPCs.
- `db-proxy` and canon import/backfill Edge functions need explicit keep/retire/owner decision before public release.
- `gemini` Edge function currently uses CORS `*`; this must be consciously accepted or restricted before public release.
- Live voice remains out of release scope until a server-side streaming gateway is implemented and tested.

## What counts as a release blocker

A problem is release-blocking if it prevents Iskra Space from being built, deployed, secured, opened by users, or traced back to trusted source files.

A problem outside this folder is still release-blocking when the app imports it, calls it, deploys through it, or depends on it.

## What does not automatically block release

Old notes, internal governance files, repair logs, experiments, or support scripts do not automatically block release.

They should be cleaned up only when evidence shows that they are stale, misleading, harmful, or directly connected to the app path.

## Simple example

If an old document is messy but nobody outside the internal workflow sees it, it is internal cleanup.

If a Supabase function used by Iskra Space has broken CORS, that is release-facing and must be fixed or consciously accepted before release.
