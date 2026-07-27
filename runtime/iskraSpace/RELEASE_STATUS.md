# Iskra Space Release Status

Status: Git-linked staging replayed 36 migrations but function deploy failed; current main release gate is blocked by dependency audit; production_deployed: false; canonical_activation: blocked
Last updated: 2026-07-27
App path: `runtime/iskraSpace`

## Current verified baseline

- GitHub `main` at this status refresh:
  `001cdef6c8777aaded526858921df626635abb88` (PR
  [#306](https://github.com/serhiipriadko2-sys/iskra/pull/306) merge on 2026-07-25).
  PR #306 changes metrics-governance artifacts; it does not alter the staging
  function topology. Its parent `f25d43e91c29040e251400fb85c57b87ee7a691f`
  (PR #305) records the now-superseded GitHub integration drift. Its parent
  `d2ce040643a120916fc62f7fe09e10f49463dfb2` is PR
  [#303](https://github.com/serhiipriadko2-sys/iskra/pull/303), the exact Git
  source used by the live staging attempt below.
  PR #303 records and contract-tests the exact migration-34 source cause. It
  descends from the status merge PR #302 at
  `bcb37d0e2821098eca91a3014aee58569d278aae`, the canonical failed-staging
  receipt merge PR #301 at `978c7b4a22e7f50d27e0203f9cfa8052747dd395`
  and the staging source PR #299 at
  `4dd29c64e24a3f0333ca4d350154380dc1dd8ae0`.
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
- Historical Production Deployment receipts for earlier baselines PR #273
  (`bb495b40cf0c9c31a7ecd9cc5122404252806e50`) and PR #270
  (`f8a45cafdecaa4d08b0436e7c18af7bf4f838a1f`): runs
  [29610431050](https://github.com/serhiipriadko2-sys/iskra/actions/runs/29610431050)
  and [29630043054](https://github.com/serhiipriadko2-sys/iskra/actions/runs/29630043054).
  Docker/GHCR and Vercel jobs were skipped; these historical runs do not prove
  a PR #297 image or deployment, staging acceptance, or canonical activation.
- Post-merge Production Deployment run
  [29949746917](https://github.com/serhiipriadko2-sys/iskra/actions/runs/29949746917)
  passed the IskraSpace release-gate job for PR #299 merge
  `4dd29c64e24a3f0333ca4d350154380dc1dd8ae0`. Docker/GHCR and Vercel jobs
  were skipped, so this is not an image or deployment receipt.
- Post-merge receipts for PR #301 merge
  `978c7b4a22e7f50d27e0203f9cfa8052747dd395`:
  [SoT integrity 30024769920](https://github.com/serhiipriadko2-sys/iskra/actions/runs/30024769920),
  [Runtime CI 30024770433](https://github.com/serhiipriadko2-sys/iskra/actions/runs/30024770433),
  [iskraSpace CI 30024769716](https://github.com/serhiipriadko2-sys/iskra/actions/runs/30024769716)
  and [Production Deployment 30024769670](https://github.com/serhiipriadko2-sys/iskra/actions/runs/30024769670)
  all completed successfully. The Production Deployment release-gate job
  passed; Docker/GHCR and Vercel jobs were skipped, so no image or deployment
  receipt exists.
- Post-merge receipts for PR #303 merge
  `d2ce040643a120916fc62f7fe09e10f49463dfb2`:
  [SoT integrity 30029422051](https://github.com/serhiipriadko2-sys/iskra/actions/runs/30029422051),
  [Runtime CI 30029420072](https://github.com/serhiipriadko2-sys/iskra/actions/runs/30029420072),
  [iskraSpace CI 30029420026](https://github.com/serhiipriadko2-sys/iskra/actions/runs/30029420026)
  and [Production Deployment 30029420038](https://github.com/serhiipriadko2-sys/iskra/actions/runs/30029420038)
  all completed successfully. The Production Deployment release-gate job
  passed; Docker/GHCR and Vercel jobs were skipped, so no image or deployment
  receipt exists.
- Post-merge receipts for PR #305 merge
  `f25d43e91c29040e251400fb85c57b87ee7a691f`:
  [SoT integrity 30030363752](https://github.com/serhiipriadko2-sys/iskra/actions/runs/30030363752),
  [Runtime CI 30030363648](https://github.com/serhiipriadko2-sys/iskra/actions/runs/30030363648),
  [iskraSpace CI 30030363745](https://github.com/serhiipriadko2-sys/iskra/actions/runs/30030363745)
  and [Production Deployment 30030363722](https://github.com/serhiipriadko2-sys/iskra/actions/runs/30030363722)
  all completed successfully. The release-gate job passed; Docker/GHCR and
  Vercel jobs were skipped, so no image or deployment receipt exists.
- Current-main Production Deployment run
  [30158322726](https://github.com/serhiipriadko2-sys/iskra/actions/runs/30158322726)
  for `001cdef6c8777aaded526858921df626635abb88` failed in the root dependency
  audit before deploy: `postcss <=8.5.17` and `brace-expansion <=5.0.7` are
  reported as high vulnerabilities by the supported audit client. This is a
  separate source remediation blocker; it did not deploy production, create a
  staging branch, or alter the Function-deploy failure receipt.
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
  read-only 2026-07-23 observation, not staging acceptance.
- The old failed preview `pg-trgm-relocation-staging`
  (`vusqhidsspbcuknsfdcm`) was deleted. Its data-less replacement,
  `staging-closed-beta-acceptance-20260718`
  (`xabbdxdnhkcrepbffxfg`, branch ID
  `a3e73206-b8f2-4735-9f76-6c7ded2e044c`), also reached
  `MIGRATIONS_FAILED`: 33 migrations were recorded versus 35 in production and
  36 in the repository. S0/S1, Auth fixtures and Edge deploys were not started.
  The replacement was made non-persistent and deleted on 2026-07-23; a
  post-delete branch list contained production only.
- During read-only diagnosis, Supabase CLI `branches get --output json` emitted
  branch-only credentials in command output. Their values are deliberately not
  recorded here. Deleting the data-less branch invalidated them and stopped its
  billing; no production credential was emitted.
- The branch failure now has a source-reproducible cause. Production stores
  migration `20260718194551_optimize_rls_initplan` as the pre-guard body from
  commit `82191ce0899bedb04bcd4345e0c7ee28adb65258`: 1,674 bytes without the
  final LF, SHA-256
  `c8251c707d7bee66ece9c874c27c1ebe5833024a0573169df00f53a330a2be93`.
  The same body with its final LF is the already-recorded provenance SHA-256
  `1b773fdd0ec82486754cceccacf15dc5c1f882b8d9a2a98ffb9939cf4af145ef`.
- A clean local replay with pinned Supabase CLI `2.109.0` reset exactly through
  migration `20260718191950` (the branch's 33 recorded migrations). Applying
  the production-stored migration 34 with `ON_ERROR_STOP=1` then failed at its
  first unconditional Graph-policy ALTER: policy
  `Users can manage own graph nodes (secure)` does not exist. The transaction
  rolled back and migration 34 was not recorded. Applying the current guarded
  repository migrations `20260718194551`, `20260718194835` and
  `20260718200634` to the same state passed and recorded all three versions.
  This reproduces the exact 33-of-36 stop without a new cloud branch.
- `[FACT]` The Owner-approved live integration change is complete. Connection
  `446222` now points to `serhiipriadko2-sys/iskra` with `workdir="."`,
  `new_branch_per_pr=true`, `supabase_changes_only=true` and branch limit 3.
  `workdir="."` is the supported representation for the requested root
  `supabase/` directory: Supabase defines this field as the parent directory
  containing `supabase/`.
- `[FACT]` Deploy to production is disabled: the default Supabase branch remains
  named `main`, but its Git sync field is empty (`git_branch=""`). Production
  remained at 35 migrations before and after the integration change and staging
  attempt.
- `[FACT]` Git-linked data-less micro branch
  `staging-closed-beta-acceptance-20260723-git`
  (`jvcxaccvntyjvtfmykum`, branch ID
  `c5096221-2750-4817-b1f1-54e4ba17bb8d`) used exact Git source
  `staging/iskraspace-acceptance-d2ce040` at
  `d2ce040643a120916fc62f7fe09e10f49463dfb2`. Action
  `2a5b741b8c9940d8ab4f33816615c671` independently records
  `git_config.repo=iskra`, the same Git ref and `workdir="."`.
- `[FACT]` The Git-linked replay applied all 36 repository migrations; production
  stayed at 35. Function deployment then failed before S0 with
  `entrypoint path does not exist (supabase/functions/kain/index.ts)`.
  The redacted platform log is 13,366 bytes, SHA-256
  `a50db03940f9e9a4e0b39ddf963a9a32876dac0eeb526b0166f0c8287b6e47ac`;
  the bounded secret-pattern scan found no JWT, Postgres URL or `sb_*` key in
  that platform log.
- During verification, Supabase CLI `branches get --output json` emitted
  branch-only credentials to command output. Their values are deliberately not
  retained here. The data-less branch was made non-persistent and deleted,
  invalidating those credentials and stopping billing. No fixtures, Auth users,
  provider calls or S0/S1 tests were started. A post-cleanup list contained only
  production.
- Merged PR #297 added source artifacts: tests, one historical replay repair,
  one proposed forward migration, CI base-SHA wiring, documentation, and Edge
  Function source changes that move `enforceAiRequestBoundary` before payload
  or provider handling in `gemini` and `iskra-agent`. No Supabase migration was
  applied by this branch, no Edge Function deployed, and
  `iskra-memory-gateway` was not changed.
- Source-only work adds an opt-in staging harness and a redacted receipt schema;
  it does not insert or imply a live acceptance receipt.

## Canonical failed-staging receipt

This receipt proves a fail-closed pre-S0 stop and cleanup only. It does not
claim `delivery_evidence: verified_live_staging`.

<!-- STAGING_ACCEPTANCE_RECEIPT_START -->
```json
{"schema_version":1,"scope":"staging_only","source_pr":303,"source_merge_sha":"d2ce040643a120916fc62f7fe09e10f49463dfb2","production_ref":"typcvaszcfdpkzbjzuur","production_migration_count":35,"staging_ref_and_branch_id":{"ref":"jvcxaccvntyjvtfmykum","id":"c5096221-2750-4817-b1f1-54e4ba17bb8d"},"staging_migrations_before_and_after":{"before":35,"after":36},"function_source_hashes":{},"auth_config_before_and_after":{"before":"not_observed","after":"not_observed"},"test_matrix":{"github_integration":"passed_repo_iskra_workdir_dot_supabase_changes_only","production_sync":"disabled_git_branch_empty","branch_creation":"created_data_less_persistent_micro","branch_replay":"passed_36_of_36","function_deploy":"failed_missing_supabase_functions_kain_entrypoint","S0":"not_started","S1":"not_started","edge_boundary":"not_started"},"advisor_counts_by_class_before_and_after":{"before":{"security":{},"performance":{}},"after":{"security":{},"performance":{}}},"provider_invocations":0,"memory_gateway_changed":false,"cleanup":{"completed":true,"branch_deleted":true,"fixtures_created":false,"branch_credentials_rotated":true,"provider_keys_set":false},"started_at":"2026-07-23T18:11:24.806923Z","completed_at":"2026-07-23T18:22:53.883Z","sha256":"fc1499c56286f75a08825cbe0101f89f22c88c63e70a43e753938412f80962ab"}
```
<!-- STAGING_ACCEPTANCE_RECEIPT_END -->

## Current release and activation blockers

- The migration-history blocker is closed for Git-linked replay: exact source
  `d2ce040...` reached 36/36 while production remained at 35. Do not recreate
  the same Git-linked branch until the function topology is corrected.
- Root `supabase/config.toml` declares `gemini`, `iskra-agent` and `kain` at
  default root paths, while those entrypoints exist only under
  `runtime/iskraSpace/supabase/functions/`. The accepted staging boundary also
  excludes `kain` and requires only `gemini` and `iskra-agent`. A narrow source
  decision must reconcile these paths and deploy scope without changing or
  deploying `iskra-memory-gateway`.
- Staging closed-beta acceptance is still required: magic-link invite allow;
  anonymous and non-member deny; two active users cannot read, write, update or
  delete one another's data/RPC rows.
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
