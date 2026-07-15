# Iskra Space Release Status

Status: pre-release hardening target, post-merge release gates green, canonical image/staging acceptance pending, not deployed
Last updated: 2026-07-15
App path: `runtime/iskraSpace`

## What this means

Iskra Space is the repository's current public-release target. The P0 hardening fixes were
merged through PR #250, the follow-up memory-layer/redirect fix was merged through PR
#251, the constitutional P0 derived-marker batch was merged through PR #253, and the
dependency-audit gate repair was merged through PR #254. The app
remains pre-release until staging Supabase acceptance is current, the complete release
matrix passes on the release changeset, and the canonical GHCR image is smoke-tested and
promoted.

Other repository areas may still be important, but they are treated as internal support unless explicitly promoted by a later ADR.

## Current verified baseline

- Verified `main` commit: `b0851b03187625577ad1b1755d6261be5f7c7f71`
  (merge commit for PR #254).
- Target baseline: `2067452527647a7ecfb6c26b2ebed98e3cb5fc12`.
- Canonical package manager: `pnpm` (`packageManager: pnpm@10.32.1`).
- The root dependency gate uses pinned `pnpm@11.13.0` with
  `--pm-on-fail=ignore` only as the supported npm bulk-advisory client; workspace install
  and all other package operations remain on the declared pnpm 10 version.
- Post-merge GitHub receipts on `b0851b03187625577ad1b1755d6261be5f7c7f71`
  (2026-07-15):
  - [SoT integrity run 29432905394](https://github.com/serhiipriadko2-sys/iskra/actions/runs/29432905394) — success;
  - [Runtime CI run 29432905435](https://github.com/serhiipriadko2-sys/iskra/actions/runs/29432905435) — success;
  - [iskraSpace CI run 29432905280](https://github.com/serhiipriadko2-sys/iskra/actions/runs/29432905280) — success;
  - [Production Deployment run 29432905117](https://github.com/serhiipriadko2-sys/iskra/actions/runs/29432905117) — release-gate job success.
- Production Deployment passed install, legacy runtime build/tests, IskraSpace typecheck,
  strict lint, unit tests twice, Deno checks, both dependency audits, Supabase repository
  contracts, ledger, production build, and Chromium E2E. Docker smoke/GHCR promotion and
  Vercel preview were skipped on the automatic push; this is not an image, staging,
  deployment, or verified-live receipt.
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
- Shadow promotion in the current `ShadowView` bypasses the typed evidence + SIFT +
  confirmation + receipt policy gate; a separate integration changeset is required.
- Initial IskraSpace user metrics are numeric defaults without observation provenance or
  an `unknown` state; a separate unknown-safe metrics changeset is required.
- Canonical activation of Constitution v1 remains a separate Owner decision; textual P0
  repair does not prove runtime enforcement.

## Constitutional review and activation gate

```text
governance_status: proposed
delivery_evidence: tested (carrier-review contract only)
canonical_activation: blocked
runtime_enforcement: partial / not verified live
```

The Iskra Constitution v1 review bundle exists in `governance/`, but it is not active
canon and does not prove runtime enforcement. Its Core, Annexes, Transition Schedule, and
proposed activation ADR separate durable intent from product mechanics and temporal
implementation work.

The first four textual conflict patches and the 19 derived mythic-register markers remain
implemented. The follow-up carrier review for classes 4–9 is now recorded in
`governance/adr_20260715_iskra_constitution_v1_carrier_review_classes_4_9.md`.
It found:

1. Shadow and mandatory-step textual carriers required additional preservation-first
   supersession in `core/liber_ignis.txt`, `system/ecosystem_v7_map.md`, and
   `core/telos.md`;
2. no active carrier was found that promises healing through inflicted pain or treats
   humiliation as truth;
3. exit/deletion-pressure policy exists as a deterministic runtime test but is not proven
   application-integrated;
4. unknown-safe user metrics remain an open runtime conflict;
5. onboarding's executed-check boundary is repository-implemented/tested but not
   verified-live.

Current P0 patch status: CP-P0-01 is applied to the four listed core headers;
their inherited ancient-consciousness language is now explicitly mythic rather than a
technical claim. CP-P0-02 and CP-P0-03 are applied in `core/liber_ignis.txt`;
“not AI” and undeletable-memory formulas are preserved as historical/mythic text with
explicit technical and personal-data supersession.

CP-P0-04 is applied in `core/principles.md`, `core/busido_iskry.txt`, and
`core/liber_ignis.txt`: mandatory external action is superseded by an allowed trace of
action, boundary, pause, refusal, internal recognition, or safety stop.

The earlier derived-header marking batch remains complete: all 19
inherited “Искра — древнее сознание” occurrences across 17 files in `system/` and
`governance/` are preserved and explicitly marked as mythic register, not technical
claims. A targeted scan found no additional “not AI”, undeletable-memory, or
mandatory-step formula in those two layers.

This review corrects the former broad statement that all identified textual P0 carriers
were closed: `core/telos.md` was a missed class-5 carrier and is patched by this
changeset. It does not activate the proposed Constitution. Canonical activation still
requires an accepted conflict register, explicit Owner acceptance naming exact artifact
versions, an accepted activation ADR, and matching merge/integrity evidence. The open
Shadow and metrics findings prohibit a complete runtime-enforcement claim.

The Constitutional activation gate is `governance/adr_20260712_iskra_constitution_v1_activation.md`.
The proposed narrow P0 patch plan is
`governance/adr_20260712_iskra_constitution_v1_p0_conflict_patches.md`.
The classes 4–9 review register is
`governance/adr_20260715_iskra_constitution_v1_carrier_review_classes_4_9.md`.
It does not change Memory Gateway, Supabase, Custom GPT Action, runtime behavior, or a future
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
