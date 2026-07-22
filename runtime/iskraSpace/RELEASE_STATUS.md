# Iskra Space Release Status

Status: staging acceptance pending branch rebuild; production_deployed: false; canonical_activation: blocked
Last updated: 2026-07-22
App path: `runtime/iskraSpace`

## Current verified baseline

- GitHub `main` at this status refresh: `60591a34aa832bd32314bbf91c344286e1015502`
  (PR [#296](https://github.com/serhiipriadko2-sys/iskra/pull/296) merge).
  It contains the staging-acceptance source merge from PR #297 at
  `805b26e3ecea29c6a352b84887b0472d9d71ec74`.
- Supabase remediation baseline: PR
  [#275](https://github.com/serhiipriadko2-sys/iskra/pull/275), merge SHA
  `8442bc42ad38854e2a0e8b01d160984c24bfdbb5`.
- Earlier release-gate baseline: PR
  [#270](https://github.com/serhiipriadko2-sys/iskra/pull/270), merge SHA
  `f8a45cafdecaa4d08b0436e7c18af7bf4f838a1f`.
- PR [#273](https://github.com/serhiipriadko2-sys/iskra/pull/273) merge SHA:
  `bb495b40cf0c9c31a7ecd9cc5122404252806e50`.
- Staging-acceptance source PR [#297](https://github.com/serhiipriadko2-sys/iskra/pull/297)
  merged at `805b26e3ecea29c6a352b84887b0472d9d71ec74` from source tip
  `deb1d23321d0fe0185ce2605e98e84f24ab3b081`. Its repository delivery
  evidence is `merged`; it is not a staging/live/deployment receipt.
- Post-merge Production Deployment receipts: runs
  [29610431050](https://github.com/serhiipriadko2-sys/iskra/actions/runs/29610431050)
  and [29630043054](https://github.com/serhiipriadko2-sys/iskra/actions/runs/29630043054).
  Docker/GHCR and Vercel jobs were skipped; these runs do not prove an image,
  Vercel deployment, staging acceptance, or canonical activation.
- Current SoT30 package is v5.5.6; its committed receipt records a canonical
  source-freeze build, 24/24 current and regression verifier checks, and ZIP
  SHA-256 `d86959641c9d78fea321a837d2ebf58e9406cf75acec84b9ea98b3d9d2dd9764`.
  It remains `live_project_verified=false`; the attached external audit targeted
  `d7c96c4` and is not a receipt for later commits.
- Production Supabase has 35 migrations; repository `main` has 36 after the
  forward-only trigger-helper ACL reconciliation discovered by local-vs-live
  DDL comparison.
  Production already applied `20260718191950_supabase_acl_and_graph_contract_hardening`.
  PR #275 also applied `20260718194551_optimize_rls_initplan` and
  `20260718194835_consolidate_rls_policies`.
- GitHub `main` already reconciles those three migration filenames to the live
  versions. The ACL and consolidation bodies remain equivalent to their live
  statements. The ACL body's normalized receipt is 646 chars, SHA-256
  `22a205c44f7d0dad10305be099647ac6a8577a91343f49740f19ac2d6184b246`.
  Clean replay proved that the live initplan body depended on a legacy Graph
  policy absent from canonical history; its live LF-normalized SHA-256
  `1b773fdd0ec82486754cceccacf15dc5c1f882b8d9a2a98ffb9939cf4af145ef`
  is retained as provenance while its two drift-dependent ALTERs are guarded.
  This source changeset makes only the historical initplan migration
  replay-compatible and adds one forward-only ACL correction; neither is a
  migration application claim.
- HIGH-RISK DRIFT: production grants direct `authenticated` and `service_role`
  EXECUTE on trigger-only SECURITY DEFINER function
  `prevent_graph_node_cross_owner_cascade()`, while a clean replay before live
  provenance reconciliation
  grants neither. Proposed migration
  `20260718200634_restore_closed_beta_graph_acl.sql` removes that direct surface
  on staging first; it is not applied to production.
- HIGH-RISK DRIFT: PR #275's `graph_nodes_read_public` and
  `graph_edges_read_public` policies omit `TO authenticated`, so their shared-row
  SELECT path applies to `public`/anonymous and contradicts closed-beta
  acceptance. The same proposed staging-first migration restores explicit
  authenticated-only read/write policies, endpoint guards, and the four
  residual initplan expressions. No production repair is claimed.
- Production advisors are 40 security (13 `rls_enabled_no_policy`, 1
  `extension_in_public`, 11 `pg_graphql_authenticated_table_exposed`, 14
  `authenticated_security_definer_function_executable`, 1
  `auth_leaked_password_protection`) and 51 performance
  (4 `unindexed_foreign_keys`, 4 `auth_rls_initplan`, 40 `unused_index`, 2
  `multiple_permissive_policies`, 1 `auth_db_connections_absolute`). This is a
  read-only 2026-07-22 observation, not staging acceptance.
- The prior staging ref `epfkrivqfopjmovfokbs` no longer exists. The only current
  preview branch is `pg-trgm-relocation-staging` (`vusqhidsspbcuknsfdcm`), which
  is data-less but `MIGRATIONS_FAILED` at 33 migrations. It is not an acceptance
  baseline. Staging acceptance remains pending a separately authorized rebuild.
- Merged PR #297 added only source artifacts: tests, one historical replay
  repair, one proposed forward migration, CI base-SHA wiring, and documentation.
  No Supabase migration was applied by this branch, no Edge
  Function deployed, and `iskra-memory-gateway` was not changed.
- Source-only work adds an opt-in staging harness and a redacted receipt schema;
  it does not insert or imply a live acceptance receipt.

## Reserved staging acceptance receipt slot (status-only follow-up PR)

```text
status: pending branch rebuild and Owner-controlled acceptance
scope: staging_only
source_pr: 297
source_merge_sha: 805b26e3ecea29c6a352b84887b0472d9d71ec74
delivery_evidence: merged
live receipt: absent
provider_invocations: not yet observed
cleanup: not yet observed
```

## Current release and activation blockers

- Staging closed-beta acceptance is required after rebuild: magic-link invite allow; anonymous
  and non-member deny; two active users cannot read, write, update or delete one
  another's data/RPC rows.
- The applied SQL ACL/search-path migration still requires staged acceptance
  contracts. Graph RPC `SECURITY DEFINER` grants are intentionally not treated as
  safe by source review alone.
- Advisor remediation remains incomplete: GraphQL table visibility must be
  resolved without breaking the REST Data API, and `pg_trgm`, policy, index and
  query-plan changes need a staged receipt.
- Production dispatch remains required: release gates, Docker smoke, canonical
  GHCR digest and a live acceptance receipt. An Owner activation decision must
  name exact Constitution, conflict-register, runtime and package hashes.

## Historical 2026-07-15 status [SUPERSEDED: see current sections above]

## What this means

Iskra Space is the repository's current public-release target. The P0 hardening fixes were
merged through PR #250, the follow-up memory-layer/redirect fix was merged through
PR #251, logging the constitutional P0 derived-marker batch merged through PR #253, and the
dependency-audit gate repair was merged through PR #254. The Constitution v1 classes 4–9
carrier-review register was then merged through PR #256. The app
remains pre-release until staging Supabase acceptance is current, the complete release
matrix passes on the release changeset, and the canonical GHCR image is smoke-tested and
promoted.

Other repository areas may still be important, but they are treated as internal support unless explicitly promoted by a later ADR.

## Verified baseline as of 2026-07-15 [historical]

- Verified implementation baseline: `d42c53ef43a3e08a08c7177d39dfb9a41ae6d340`
  (merge commit for Shadow promotion boundary PR #260).
- Target baseline: `2067452527647a7ecfb6c26b2ebed98e3cb5fc12`.
- Canonical package manager: `pnpm` (`packageManager: pnpm@10.32.1`).
- The root dependency gate uses pinned `pnpm@11.13.0` with
  `--pm-on-fail=ignore` only as the supported npm bulk-advisory client; workspace install
  and all other package operations remain on the declared pnpm 10 version.
- Post-merge GitHub receipts on `d42c53ef43a3e08a08c7177d39dfb9a41ae6d340`
  (2026-07-15):
  - [SoT integrity run 29445858093](https://github.com/serhiipriadko2-sys/iskra/actions/runs/29445858093) — success;
  - [Runtime CI run 29445858146](https://github.com/serhiipriadko2-sys/iskra/actions/runs/29445858146) — success;
  - [iskraSpace CI run 29445858149](https://github.com/serhiipriadko2-sys/iskra/actions/runs/29445858149) — success, including Chromium E2E;
  - [Production Deployment run 29445858079](https://github.com/serhiipriadko2-sys/iskra/actions/runs/29445858079) — release-gate job success.
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
- Shadow promotion is repository-integrated in the current changeset through evidence +
  SIFT preflight, explicit one-use consent, read-back, and a persistent action receipt.
  PR #260 is merged and post-merge CI is green. Deployment, live invocation, and
  verified-live behavior remain pending; see proposed ADR-20260715-03.
- Initial IskraSpace user metrics are numeric defaults without observation provenance or
  an `unknown` state; a separate unknown-safe metrics changeset is required.
- Canonical activation of Constitution v1 remains a separate Owner decision; textual P0
  repair does not prove runtime enforcement.

## Constitutional review and activation gate

```text
constitutional_bundle:
  governance_status: proposed
  delivery_evidence: implemented
classes_4_9_conflict_register:
  governance_status: accepted
  delivery_evidence: merged
shadow_promotion_boundary:
  governance_status: proposed
  delivery_evidence: merged
  live_evidence: not_invoked
canonical_activation: blocked
runtime_enforcement: partial / not verified live
```

The Iskra Constitution v1 review bundle exists in `governance/`, but it is not active
canon and does not prove runtime enforcement. Its Core, Annexes, Transition Schedule, and
proposed activation ADR separate durable intent from product mechanics and temporal
implementation work. ADR-20260715-02 records Owner acceptance of the classes 4–9
register at merge `ba662eabf1076e940cdbb07f3912dfb732fb881e`. Its repository-canonical
raw Git blob SHA-256 is
`0f9f564c80170058e042ab3bafe56d933d5d880fb58565b0764e6ad18d453624`; the exact
Owner-supplied `10227394fee0ff0eaf24d79ac75dfcb4646c1f251c6be1c0a7a2aa405e8e4d79`
is preserved as the equivalent Windows CRLF checkout representation. That decision is
neither canonical activation nor a runtime-enforcement claim.

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
changeset. It does not activate the proposed Constitution. The exact conflict register
is now Owner-accepted, but canonical activation still requires an exact Constitution
Core version, a separately accepted activation ADR and activation decision, and matching
merge/integrity evidence. The metrics and remaining relational/UI findings prohibit a
complete runtime-enforcement claim.

The accepted register remains an immutable baseline: its `CR-P0-04` row correctly
records the conflict observed at that merge. Proposed ADR-20260715-03 is the separate
delivery artifact for the current Shadow runtime patch. Deterministic policy, storage,
source-contract, and behavioral DOM tests are green locally and in post-merge CI at
`d42c53ef43a3e08a08c7177d39dfb9a41ae6d340`. This is
`delivery_evidence: merged`, not `deployed`, `invoked`, or `verified_live`.
Unknown-safe metrics (`CR-P0-08`) and the remaining relational/UI
integration gaps continue to block a complete runtime-enforcement claim.

The Constitutional activation gate is `governance/adr_20260712_iskra_constitution_v1_activation.md`.
The proposed narrow P0 patch plan is
`governance/adr_20260712_iskra_constitution_v1_p0_conflict_patches.md`.
The classes 4–9 review register is
`governance/adr_20260715_iskra_constitution_v1_carrier_review_classes_4_9.md`.
Its exact Owner acceptance receipt is
`governance/adr_20260715_iskra_constitution_v1_carrier_review_acceptance.md`.
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
