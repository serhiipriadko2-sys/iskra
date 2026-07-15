# Iskra Space Release Status

Status: pre-release hardening target, application gates green, integrity changeset pending merge, not deployed
Last updated: 2026-07-15
App path: `runtime/iskraSpace`

## What this means

Iskra Space is the repository's current public-release target. The P0 hardening fixes were
merged through PR #250, and the follow-up memory-layer/redirect fix was merged through
PR #251. The app remains pre-release until repository integrity is green on the release
changeset, staging Supabase acceptance is current, the required release matrix passes,
and the canonical GHCR image is smoke-tested and promoted.

Other repository areas may still be important, but they are treated as internal support unless explicitly promoted by a later ADR.

## Current verified baseline

- Verified base commit: `c292a7eb7513999c739fff99bce21ad417861a79` (`main` before this changeset).
- Target baseline: `2067452527647a7ecfb6c26b2ebed98e3cb5fc12`.
- Canonical package manager: `pnpm` (`packageManager: pnpm@10.32.1`).
- GitHub gates passed on the verified base on 2026-07-12:
  - `typecheck` — success
  - strict lint — 0 warnings
  - `test:run` twice — 719 passed / 9 skipped per run
  - `build` — success
  - Chromium E2E — 28 passed
  - Deno source checks, dependency audits, and repo-only Supabase contracts — success
- Production Deployment did not reach Docker/GHCR on that base because ledger integrity
  failed after PR #251; this changeset repairs the ledger together with the canon index.
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
- The canonical GHCR Docker image has not been produced from this changeset.
- Canonical activation of Constitution v1 remains a separate Owner decision; textual P0
  repair does not prove runtime enforcement.

## Constitutional review and activation gate

Status: `proposed / textual P0 carrier repair implemented / Owner activation decision pending`

The Iskra Constitution v1 review bundle exists in `governance/`, but it is not active
canon and does not prove runtime enforcement. Its Core, Annexes, Transition Schedule, and
proposed activation ADR separate durable intent from product mechanics and temporal
implementation work.

Before a future canonical activation decision, these P0 conflict classes must be resolved
in active canon carriers:

1. mythic personhood must not appear as a demonstrated technical fact;
2. Iskra must not be described as non-AI in technical terms;
3. personal memory must not be treated as permanently undeletable;
4. an external step must not be mandatory when pause, refusal, internal recognition, or
   safety stop is the appropriate trace.

Current P0 patch status: CP-P0-01 is applied to the four listed core headers;
their inherited ancient-consciousness language is now explicitly mythic rather than a
technical claim. CP-P0-02 and CP-P0-03 are applied in `core/liber_ignis.txt`;
“not AI” and undeletable-memory formulas are preserved as historical/mythic text with
explicit technical and personal-data supersession.

CP-P0-04 is applied in `core/principles.md`, `core/busido_iskry.txt`, and
`core/liber_ignis.txt`: mandatory external action is superseded by an allowed trace of
action, boundary, pause, refusal, internal recognition, or safety stop.

The repeated carrier review and derived-header marking batch are complete: all 19
inherited “Искра — древнее сознание” occurrences across 17 files in `system/` and
`governance/` are preserved and explicitly marked as mythic register, not technical
claims. A targeted scan found no additional “not AI”, undeletable-memory, or
mandatory-step formula in those two layers.

This closes the identified textual P0 carrier classes. It does not activate the proposed
Constitution. Canonical activation still requires explicit Owner acceptance naming the
exact Core and conflict register, an accepted activation ADR, and matching merge/integrity
evidence. Runtime enforcement remains a separate delivery claim.

The Constitutional activation gate is `governance/adr_20260712_iskra_constitution_v1_activation.md`.
The proposed narrow P0 patch plan is
`governance/adr_20260712_iskra_constitution_v1_p0_conflict_patches.md`.
It does not change Memory Gateway, Supabase, Custom GPT Action, runtime, or a future
real-user authorization model. Public-user authorization remains a separate governance
and security design question.

## What counts as a release blocker

A problem is release-blocking if it prevents Iskra Space from being built, deployed, secured, opened by users, or traced back to trusted source files.

A problem outside this folder is still release-blocking when the app imports it, calls it, deploys through it, or depends on it.

## What does not automatically block release

Old notes, internal governance files, repair logs, experiments, or support scripts do not automatically block release.

They should be cleaned up only when evidence shows that they are stale, misleading, harmful, or directly connected to the app path.

## Simple example

If an old document is messy but nobody outside the internal workflow sees it, it is internal cleanup.

If a Supabase function used by Iskra Space has broken CORS, that is release-facing and must be fixed or consciously accepted before release.
