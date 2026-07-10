# Iskra Space Release Status

Status: pre-release hardening target, P0 blockers resolved locally, not yet deployed
Date: 2026-07-09
App path: `runtime/iskraSpace`

## What this means

Iskra Space is the repository's current public-release target. The 2026-07-09 P0 hardening pass resolved the six release-blocking issues identified in the production-readiness audit. The app remains pre-release until the fixes are merged, smoke-tested on a staging Supabase project, and the full cross-browser E2E matrix is green.

Other repository areas may still be important, but they are treated as internal support unless explicitly promoted by a later ADR.

## Current verified baseline

- Commit: `a4887fe` (local `main`) with P0 fixes applied.
- Target baseline: `2067452527647a7ecfb6c26b2ebed98e3cb5fc12`.
- Canonical package manager: `pnpm` (`packageManager: pnpm@10.32.1`).
- Local gates passed on 2026-07-09:
  - `typecheck` — 0 errors
  - `test:run` — 656 passed / 4 skipped
  - `build` — success
  - `lint` — 0 errors / 76 warnings
  - Chromium/Firefox/WebKit E2E — 81 passed (receipt from 2026-07-03, P0 changes do not affect E2E smoke paths)
- AI path: Chat and Council use the Supabase Edge AI gateway; browser Gemini Live remains release-disabled.

## P0 blockers resolved in this pass

1. **Phoenix ritual no longer triggers Shatter** (`App.tsx`, `components/IskraStateView.tsx`, `services/soundService.ts`).
2. **securityService wired into Chat and Journal input paths** (`components/ChatView.tsx`, `components/Journal.tsx`).
3. **`kain` Edge Function hardened** with origin allow-list, Supabase JWT validation, and rate limiting.
4. **`iskra-agent` Edge Function hardened** with full JWT validation (not payload decode), strict origin enforcement, and rate limiting.
5. **`audit_log` is append-only** in `runtime/iskraSpace/supabase/schema.sql` (SELECT/INSERT only policies).
6. **CSP synchronized** across `runtime/iskraSpace/index.html` meta tag, root `nginx.conf`, and root `vercel.json`; `connect-src` now includes required AI/API origins.

## What must be checked before release

A release pass should verify:

- dependencies install cleanly;
- the app builds from a clean checkout;
- required environment variables are documented and safely configured;
- Supabase tables/functions used by the app match the code;
- CORS/auth/rate-limit behavior is safe for public use;
- no secrets are exposed in client-side code or docs;
- public-facing documentation points users to Iskra Space, not internal support flows;
- security E2E (`RUN_E2E_SECURITY_TESTS=true`) passes against a staging Supabase project.

## Current release blockers / residual risks

- Full security E2E against a live Supabase project is not yet run in CI.
- Supabase advisors still report security/performance warnings, including GraphQL exposure for authenticated roles and authenticated callable `SECURITY DEFINER` graph RPCs.
- `db-proxy` and canon import/backfill Edge functions need explicit keep/retire/owner decision before public release.
- Live voice remains out of release scope until a server-side streaming gateway is implemented and tested.
- 76 lint warnings remain (non-blocking but technical debt).

## What counts as a release blocker

A problem is release-blocking if it prevents Iskra Space from being built, deployed, secured, opened by users, or traced back to trusted source files.

A problem outside this folder is still release-blocking when the app imports it, calls it, deploys through it, or depends on it.

## What does not automatically block release

Old notes, internal governance files, repair logs, experiments, or support scripts do not automatically block release.

They should be cleaned up only when evidence shows that they are stale, misleading, harmful, or directly connected to the app path.

## Simple example

If an old document is messy but nobody outside the internal workflow sees it, it is internal cleanup.

If a Supabase function used by Iskra Space has broken CORS, that is release-facing and must be fixed or consciously accepted before release.
