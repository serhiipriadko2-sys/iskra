# Evidence Index: Iskra Space

## Verification Receipts & SIFT Checks

### EVI-20260530-001: Terminology & Delta Conformity Checks
- **Assertion:** All candidate markdown files contain valid `∆DΩΛ` signatures and terminology compliance.
- **Evidence:** 
  - `py tools/validate_terms.py --dir runtime/iskraSpace` returned `[OK] Terminology verification passed for runtime/iskraSpace (0 violations found)`.
  - `py tools/validate_delta.py --dir runtime/iskraSpace` returned `[OK] delta validator check passed: all 13 candidate files are valid`.
- **SIFT Trace:** 
  - **S (Source):** Run output of python verification tools in local environment.
  - **I (Inference):** 100% compliance established by tool diagnostics.
  - **F (Find):** Output files logged under `.system_generated` tasks.
  - **T (Trace):** Traceable to tools/ scripts in the codebase.
- **Status:** Verified.

### EVI-20260530-002: Monorepo Build Integration
- **Assertion:** Full `@iskra` workspace compiles under Vite and tsc constraints.
- **Evidence:** `pnpm build` finished with successful bundle outputs in `dist/` directories.
- **Status:** Verified.

### EVI-20260604-001: Runtime and iskraSpace CI Repair Gates
- **Assertion:** The CI repair addresses the observed Runtime CI, iskraSpace CI, and Production Deployment failures without live Supabase deployment.
- **Evidence:**
  - `npm run build` in `runtime` passed.
  - `npm run test -- --run` in `runtime` passed: 48 files, 859 tests.
  - `npm run test:coverage -- --run` in `runtime` passed.
  - `npm run lint` in `runtime` passed with existing warnings only.
  - `npm run typecheck`, `npm run test:run`, `npm run lint`, and `npm run build` in `runtime/iskraSpace` passed.
  - `pnpm build` at repository root passed.
  - `npx tsx tools/verify_ledger.ts` returned `Ledger OK (417 files)`.
- **Status:** Local verified; remote GitHub Actions pending.

### EVI-20260604-002: iskraSpace E2E Repair Gates
- **Assertion:** The refreshed Playwright specs now follow the app storage contract and no longer hang on onboarding.
- **Evidence:**
  - `npx playwright install chromium` completed locally.
  - Initial local CI-mode Chromium E2E reproduced the failure/hang path before the fix.
  - After repair, `CI=true npx playwright test --project=chromium --reporter=line` passed: 27/27 tests in 52.1s.
  - `npm run typecheck` in `runtime/iskraSpace` passed.
  - `npm run lint` in `runtime/iskraSpace` passed with existing warnings only.
  - `npx tsx tools/verify_ledger.ts` returned `Ledger OK (417 files)`.
- **Status:** Local verified; remote GitHub Actions pending.

### EVI-20260606-001: Agent Builder v4 Materialized Merge
- **Assertion:** `iskra-full-canon-builder-2026-06-06-v4/` is a single local upload tree that preserves the full-canon Dreamspace source layer and the toolchain source layer without source-file loss.
- **Evidence:**
  - Source inventory: Dreamspace 81 files, toolchain 15 files.
  - Source overlaps: 2 files, both preserved under `provenance/conflict-originals/`.
  - Lossless mapping check: PASS.
  - Required-layer audit: PASS, including repository `governance/` and root `SECURITY.md`.
  - Manifest check: PASS, 127 payload hash lines.
  - Zip integrity check: PASS, 128 entries.
  - Zip receipt: bytes `1881214`, sha256 `7a4dbec0379086c36c566002e818574d52d8130f5e7525b8bc599205059c1513`.
  - Secret scan: PASS for obvious credential patterns.
- **Status:** Local verified; Builder UI upload and runtime prompt verification pending.

### EVI-20260606-002: Runtime Toolchain Bridge Verification
- **Assertion:** The Iskra toolchain bridge is a portable Codex/Agent runtime source with verifiable contracts and smoke tests, not only static Agent Builder knowledge.
- **Evidence:**
  - Repository plugin source exists at `plugins/iskra-toolchain-bridge/`.
  - Builder mirror exists at `dist/agent-builder/iskra-full-canon-builder-2026-06-06-v4/plugins/iskra-toolchain-bridge/`.
  - Codex plugin validator passed for both source and v4 mirror.
  - `validate_connector_contracts.py` passed with 8 contracts: GitHub, Supabase, web/browser, secrets vault, Agent Builder, artifact manager, schedule runner, and monitoring.
  - `smoke_runtime.py` passed for source and v4 mirror, including credential-bearing URL rejection, vault-safe clone dry-run, and public `git ls-remote` verification.
  - v4 manifest check passed with 143 payload hash lines.
  - v4 zip integrity passed with 144 entries, bytes `1902867`, sha256 `0e909c78fc3eb8d74b1a0f30e9d0928a7609eec52e2fc0f2f5b5bc48271dec2a`.
  - Obvious-secret scan passed over the source plugin and v4 mirrored plugin.
- **Status:** Local runtime source verified; Codex app install and Agent Builder UI activation pending.

### EVI-20260606-003: Live Connector Contracts and Builder Hardening
- **Assertion:** The runtime bridge has observed live read paths and release-blocking Builder hardening prompts.
- **Evidence:**
  - GitHub connector `get_repo` passed for `serhiipriadko2-sys/iskra`, repo id `1126614067`, default branch `main`, visibility `public`, permissions include `pull`, `push`, `triage`, `maintain`, and `admin`.
  - Supabase connector read passed for `AgiIskra / typcvaszcfdpkzbjzuur`, status `ACTIVE_HEALTHY`, region `eu-west-1`, Postgres `17.6.1.063`, API URL `https://typcvaszcfdpkzbjzuur.supabase.co`, Edge Functions and generated type summary observed without mutation.
  - Opera browser connector opened the GitHub commit page for `e6ce1fb` and read page identity, file tree, and status via accessibility tree.
  - `C:\Users\gabra\.codex\config.toml` exposes local marketplace `iskra-local` and enables `iskra-toolchain-bridge@iskra-local`.
  - `codex-desktop-diagnostic.json` records plugin files present, config exposure true, and `codex.exe` blocked with `Access is denied`.
  - `agent_files/evals/BUILDER_RUNTIME_HARDENING_PROMPTS.md` adds six release-blocking prompts.
  - v4 zip regenerated with 150 entries, bytes `1914053`, sha256 `6943c012e6522525949a4bb211d1ce1f2d0246da1c78df1c74c81e02b7146e1b`.
- **Status:** Live read contracts verified; Codex app load, Builder UI upload, and CI status checks pending.

### EVI-20260607-001: Sensitive Status Dump Current-Tree Gate
- **Assertion:** Raw local Supabase status dumps are blocked from the current tree and CI gate.
- **Evidence:**
  - `supabase_status.txt` removed from the working tree.
  - `docs/operations/supabase-status-redacted-example.txt` added as the safe template.
  - `tools/check_no_sensitive_status_dumps.py` added and wired into `package.json` `verify` and `.github/workflows/sot_integrity.yml`.
  - `py tools/check_no_sensitive_status_dumps.py` returned `[OK] no sensitive status dumps`.
- **Status:** Local verified; historical exposure classification pending owner review.

### EVI-20260607-002: GraphRAG Batch Expansion Regression
- **Assertion:** GraphRAG expansion now performs batch neighbor lookup when `seed_k=1` and includes a non-seed expanded node.
- **Evidence:**
  - Added regression in `packages/engine/src/__tests__/graphRag.test.ts`.
  - The new test failed before the code fix because the expanded neighbor was missing.
  - `packages/engine/src/services/graphRag.ts` now fills `toFetchIdx`, preserves `simOptions`/`causalOptions` alignment, and filters self hits from batch results.
  - `pnpm --filter @iskra/engine test src/__tests__/graphRag.test.ts src/__tests__/graphRag_hnsw_mode.test.ts` passed: 3 tests.
- **Status:** Verified.

### EVI-20260607-003: Fresh Supabase And GitHub Release Baseline
- **Assertion:** `runtime/iskraSpace` is not release-ready until live Supabase drift and red GitHub checks are resolved or accepted.
- **Evidence:**
  - Supabase read-only connector observed `AgiIskra / typcvaszcfdpkzbjzuur` as `ACTIVE_HEALTHY` in `eu-west-1`, Postgres `17.6.1.063`.
  - Live functions observed: `gemini` (`verify_jwt=true`), `db-proxy` (`verify_jwt=true`), `iskra-canon-import-1536` (`verify_jwt=false`), `iskra-canon-backfill-1536` (`verify_jwt=false`), and `iskra-canon-import-diagnostic` (`verify_jwt=false`).
  - Repo-side `embed` source exists with `[functions.embed] verify_jwt=true`, but `embed` was absent from the live function list.
  - GitHub check-runs for `2d1a2f154b5a8563abe2d824d275ce98ba2b8e52` showed two completed failures: run IDs `79907967157` and `79907967125`.
  - Snapshot artifact: `docs/operations/iskraspace_release_readiness_snapshot_2026-06-07.md`.
- **Status:** Partial; release blockers open.

### EVI-20260607-004: Local iskraSpace Release Gates
- **Assertion:** The local `runtime/iskraSpace` app gates pass for this implementation pass.
- **Evidence:**
  - `pnpm --dir runtime/iskraSpace run typecheck` passed.
  - `pnpm --dir runtime/iskraSpace run lint` passed with 90 warnings and 0 errors.
  - `pnpm --dir runtime/iskraSpace run test:run` passed: 629 tests passed, 3 skipped.
  - `pnpm --dir runtime/iskraSpace run build` passed without the prior CSS syntax, mixed dynamic/static import, or >500 kB chunk warnings.
  - Initial Chromium E2E exposed a race in `e2e/app.spec.ts`: Chat assertions could run while the lazy view still showed the loader. The spec now waits for the chat textbox condition.
  - Targeted `npx playwright test app.spec.ts --project=chromium` passed: 12/12.
  - Full `npx playwright test --project=chromium` from `runtime/iskraSpace` passed: 27/27.
  - `npx tsx tools/verify_ledger.ts` passed after ledger update: 437 files.
- **Status:** Local verified; release gate still partial due remote/live blockers.

### EVI-20260607-005: Google Cloud Docker Check Root Cause And Local Repair
- **Assertion:** The red Google Cloud/GitHub check-runs for baseline `2d1a2f1` have a repo-side Docker build-context root cause and a working-tree repair.
- **Evidence:**
  - GitHub Checks API read for `2d1a2f154b5a8563abe2d824d275ce98ba2b8e52` showed failed Google Cloud Developer Connect runs `79907967157` and `79907967125`.
  - Check output identified `runtime/src/types/guard.ts(15,23): Cannot find module '../../../ledger/baselines.json'`.
  - `Dockerfile` now copies `ledger/baselines.json` into the runtime builder context and copies root/package sources needed by `runtime/iskraSpace` aliases.
  - Dockerfile-layout simulation ran `npm ci && npm run build` for `runtime`, then `npm ci && npm run build` for `runtime/iskraSpace`, using only files copied by the Dockerfile; simulation passed.
  - Real Docker Desktop build passed: `docker build -t iskra-space-release-check:2026-06-07 .`.
  - Container smoke passed: temporary container on `http://localhost:18080/` returned HTTP 200, bytes `9762`, and `ROOT_DIV_OK`.
- **Status:** Local Docker verified; remote Google Cloud confirmation pending after push.

### EVI-20260607-006: Supabase Boundary And Exposure Checklist
- **Assertion:** Release docs now distinguish direct `runtime/iskraSpace` Supabase requirements from engine/web retrieval and leave credential rotation as an owner action.
- **Evidence:**
  - `docs/operations/iskraspace_supabase_live_boundary_decision_2026-06-07.md` records that `runtime/iskraSpace` uses `gemini` `embedContent`, while repo-side `embed` is release-required for engine/web retrieval if promoted.
  - `docs/operations/iskraspace_supabase_cleanup_hardening_runbook_2026-06-07.md` and `docs/operations/iskraspace_release_readiness_snapshot_2026-06-07.md` were updated with that split.
  - `docs/operations/supabase_status_exposure_owner_checklist_2026-06-07.md` defines provider-side classification/rotation/audit steps without quoting removed values.
  - Supabase changelog scan of <https://supabase.com/changelog.md> found release-relevant Edge Function/JWT/Data API/GraphQL notes and reinforces the need for a fresh advisor/API-exposure baseline before live mutation.
- **Status:** Documentation verified; live mutation and credential classification remain pending owner-approved follow-up.

### EVI-20260607-007: PR Push And Visible Remote Checks
- **Assertion:** The release-readiness branch is pushed, open PR #195 exists, and the visible GitHub Actions checks for the PR head are green.
- **Evidence:**
  - Observed PR head before this receipt update: `4da451e415d955fab01f38b757484b66bb347dd0`.
  - Public PR lookup for `serhiipriadko2-sys:codex/iskra-release-readiness-plan` returned open PR #195, `Codex/iskra release readiness plan`, targeting `main`.
  - Public GitHub check-runs on the observed PR head included `ingest-stage-checks` completed success and `hash-check` completed success.
- Public PR lookup also shows previous PR #194 as closed.
- **Status:** PR open; visible checks green. Supabase live and credential owner tasks remain separate.

### EVI-20260607-008: Post-Merge GitHub And Cloud Run Port Repair
- **Assertion:** PR #195 is merged, but the post-merge release gate remains partial because Google Cloud deploy checks fail on the merge commit.
- **Evidence:**
  - Public GitHub PR API returned PR #195 `state=closed`, `merged=true`, merge commit `17056d685864428b2134c4dde630b296090410fd`.
  - Local `HEAD` and `origin/main` both resolved to `17056d685864428b2134c4dde630b296090410fd`.
  - Public check-runs on the merge commit showed `ingest-stage-checks` success, `hash-check` success, and two Google Cloud failures.
  - Google Cloud summaries showed build/push succeeded and deploy failed.
  - `Dockerfile`, `nginx.conf`, and `docker-compose.yml` now use container port `8080`.
  - Local Docker build passed with `docker build -t iskra-space-cloudrun-port-check:2026-06-07 .`.
  - Container smoke passed on host `18082` to container `8080`: `/` HTTP 200, bytes `9762`, root div present; `/health` returned `healthy`.
  - Operation receipt: `docs/operations/iskraspace_post_merge_verification_2026-06-07.md`.
- **Status:** Local verified; remote Google Cloud confirmation pending after push.

### EVI-20260607-009: Supabase Read-Only Function Baseline Refresh
- **Assertion:** Live Supabase function drift is refreshed without mutation, and release blockers remain for internal/support functions.
- **Evidence:**
  - Supabase connector project read confirmed `AgiIskra / typcvaszcfdpkzbjzuur`, `ACTIVE_HEALTHY`, region `eu-west-1`, Postgres `17.6.1.063`.
  - Migration list returned ten live migrations from `20260309091308` through `20260509093312`.
  - Function list returned live `db-proxy`, `iskra-canon-backfill-1536`, `iskra-canon-import-1536`, `iskra-canon-import-diagnostic`, and `gemini`.
  - `embed` lookup returned `Function not found`.
  - Source posture reads confirmed `gemini` supports `embedContent` with `verify_jwt=true`; `db-proxy` is a service-role proxy with allowlist bearer check and `verify_jwt=true`; canon import/backfill/diagnostic functions have `verify_jwt=false`.
  - Diagnostic source posture responds without method/auth gate and reports env-presence checks; no secret values were recorded.
  - Operation receipt: `docs/operations/iskraspace_supabase_readonly_baseline_2026-06-07.md`.
- **Status:** Partial; advisors/grants/logs/app data path and owner decisions remain pending.

### EVI-20260608-001: PR #196 Cloud Run Closure And Vercel Credential Failure
- **Assertion:** Cloud Run release deployment is green after PR #196, and the remaining Vercel failure is a credential/configuration contour rather than an app build failure.
- **Evidence:**
  - Local `main` and `origin/main` resolve to `e8236ace454aacdabb50cdfaa54b674971f88954`.
  - Public GitHub PR lookup showed PR #196 `closed`, `merged=true`, merge commit `e8236ace454aacdabb50cdfaa54b674971f88954`.
  - Current checks on `e8236ac` show `Build and Test`, `Build Docker Image`, both Google Cloud / Cloud Run checks, `ingest-stage-checks`, and `hash-check` success.
  - `Deploy to Vercel` failed with empty Vercel credential environment and `No existing credentials found`.
- **Status:** Cloud Run verified; Vercel optional/manual until credentials are configured.

### EVI-20260608-002: Vercel Optional Workflow Boundary
- **Assertion:** The production workflow no longer treats Vercel as an automatic main-push release gate.
- **Evidence:**
  - `.github/workflows/production_deploy.yml` adds manual `workflow_dispatch` input `deploy_vercel`.
  - `deploy-vercel` runs only when `github.event_name == 'workflow_dispatch'` and `deploy_vercel == true`.
  - The job validates `VERCEL_TOKEN`, `VERCEL_ORG_ID`, and `VERCEL_PROJECT_ID` before calling the Vercel CLI.
  - `VERCEL_TELEMETRY_DISABLED` is set for the Vercel job.
  - Local PyYAML parse passed and confirmed `workflow_dispatch.inputs.deploy_vercel` plus the `deploy-vercel` job condition.
  - Local guards passed: sensitive-status dump check, Supabase Edge security gate, unreleased gate, no-deep-src imports, ledger verification with 440 files, and `git diff --check`.
- **Status:** Local verified; remote confirmation pending after PR.

### EVI-20260608-003: Supabase Live Cleanup Plan
- **Assertion:** Supabase live cleanup is planned as a separate approval-gated pass, not mixed into the Vercel workflow PR.
- **Evidence:**
  - `docs/operations/iskraspace_supabase_live_cleanup_plan_2026-06-08.md` defines diagnostic removal, time-boxed ADR exception criteria, owner/access/expiry decisions for support functions, and pre-mutation evidence.
  - No live Supabase mutation was performed in this pass.
- **Status:** Plan recorded; execution pending explicit approval.

### EVI-20260608-004: IskraSpace Dual AI Provider Gateway
- **Assertion:** `runtime/iskraSpace` now has repo-side support for Gemini default plus optional OpenAI routing without browser-side provider keys.
- **Evidence:**
  - `runtime/iskraSpace/services/geminiService.ts` adds client-safe `VITE_AI_PROVIDER` and `VITE_AI_EDGE_FUNCTION_SLUG` support while preserving the existing app-facing service API.
  - `runtime/iskraSpace/supabase/functions/gemini/index.ts` routes `generateContent`, `streamGenerateContent`, and `embedContent` across Gemini/OpenAI providers.
  - `runtime/iskraSpace/.env.example` documents server-side `GEMINI_API_KEY`, `OPENAI_API_KEY`, `AI_PROVIDER`, `AI_FALLBACK_PROVIDER`, and model envs.
  - `docs/operations/iskraspace_dual_ai_provider_gateway_2026-06-08.md` records rollout, security boundary, and no-live-mutation status.
  - `ADR-20260608-002` records the durable provider-boundary decision.
- **Status:** Repo implementation pending local gates and PR; live Supabase smoke pending explicit approval.

### EVI-20260608-005: PR #198 Main Check Baseline
- **Assertion:** The dual-provider AI gateway repo change is merged and the `main` branch check baseline is green.
- **Evidence:**
  - PR #198 is merged into `main` at merge commit `7784811`.
  - Check-runs on `7784811` show `Deploy to Vercel` skipped as expected.
  - Check-runs on `7784811` show `Build Docker Image`, `e2e`, `Deploy to GitHub Pages`, `Build iskraSpace`, `Build and Test`, `build-and-test`, `hash-check`, `ingest-stage-checks`, and both Google Cloud / Cloud Run checks completed success.
- **Status:** Repo/main verified; staged/live Supabase provider smoke remains pending.

### EVI-20260609-001: PR #201 Gemini Embedding And SoT Ledger Closure
- **Assertion:** The Gemini embedding live path and associated SoT ledger blocker are closed.
- **Evidence:**
  - PR #201 is merged into `main` at merge commit `7015422`.
  - Final PR head was `55ae92ca1e81ad02f577f2b477e73278613e721e`.
  - Final PR receipt comment `4651784519` records external Gemini embed smoke PASS after live Supabase `gemini` version `5`: `provider=gemini`, `embedding.values` exists, length is `1536`, entries are numeric floats, and stale `text-embedding-004` requests are compatible through the Edge Function.
  - Ledger maps `runtime/iskraSpace/supabase/functions/gemini/index.ts` to `6139561764a1e790e1df6a7c76a44ebd1fbab1d79238fab55488e18de7c96a84`.
  - Follow-up SoT repair corrected `tools/projects_stack_templates/RETRIEVAL_EVAL.md` to `27ff1c974bad0ccf4031cf9b94dee4918c4b9971e64efa79aae43e0e19d7a02b`.
  - Green checks: SoT integrity `27155980473`, Runtime CI `27155980435`, iskraSpace CI `27155980437`.
  - Main merge commit `7015422` check-runs show Vercel skipped and Docker, e2e, GitHub Pages, iskraSpace, Build and Test, hash, ingest, and both Cloud Run checks succeeded.
- **Status:** Gemini embedding path verified; OpenAI live provider smoke remains pending.

### EVI-20260609-002: Supabase Read-Only Baseline After PR #201
- **Assertion:** Live Supabase source posture now confirms the Gemini embedding repair and dual-provider gateway source, while support/diagnostic function blockers remain.
- **Evidence:**
  - `docs/operations/iskraspace_supabase_readonly_baseline_2026-06-09.md`.
  - Supabase connector project read confirmed `AgiIskra / typcvaszcfdpkzbjzuur`, `ACTIVE_HEALTHY`, region `eu-west-1`, Postgres `17.6.1.063`.
  - Edge Function list shows `gemini` version `5`, ACTIVE, `verify_jwt=true`; `db-proxy` version `3`, ACTIVE, `verify_jwt=true`; canon import/backfill/diagnostic functions version `3`, ACTIVE, `verify_jwt=false`.
  - Live `gemini` source includes provider routing, `gemini-embedding-001`, `EMBEDDING_DIMENSIONS = 1536`, normalized `embedding.values`, OpenAI Responses/Embeddings routing, and JSON `text.format` mapping.
  - Live migrations remain the ten known migrations through `20260509093312 / iskra_temp_rpc_import_close_again`.
  - Installed extension signals include `vector`, `pg_graphql`, `pg_trgm`, `pg_net`, `supabase_vault`, `pg_stat_statements`, `uuid-ossp`, and `pgcrypto`.
- **Status:** Read-only verified; advisors/grants/logs/app-data and OpenAI live smoke remain pending.

### EVI-20260609-003: PR #202 Post-201 Baseline Receipt Merge
- **Assertion:** The post-PR #201 docs-only baseline receipt is merged, and `main` remains green for the release-relevant checks observed in this pass.
- **Evidence:**
  - PR #202 merged into `main` at `169b16b790e4e2c7130b4bf2ef2176515ee43cbc`.
  - PR #202 head before merge was `1e83bf4c2a6de41e476af45959c28b5c69669cff`.
  - Post-merge checks on `169b16b` show `hash-check`, `ingest-stage-checks`, and both Google Cloud / Cloud Run checks completed success.
- **Status:** Repo/main receipt verified; live Supabase cleanup and OpenAI smoke remain separate blockers.

### EVI-20260609-004: Supabase Cleanup Approval Packet
- **Assertion:** Live Supabase cleanup is now approval-ready but not executed.
- **Evidence:**
  - `docs/operations/iskraspace_supabase_cleanup_approval_packet_2026-06-09.md` records the function baseline, expected before/after, rollback boundary, approval phrase, and verification criteria.
  - Supabase connector refresh confirmed project `AgiIskra / typcvaszcfdpkzbjzuur` as `ACTIVE_HEALTHY`, region `eu-west-1`, Postgres `17.6.1.063`.
  - Edge Function list remains `gemini` version `5` with `verify_jwt=true`, `db-proxy` version `3` with `verify_jwt=true`, and canon import/backfill/diagnostic functions version `3` with `verify_jwt=false`.
  - Security and performance advisors were available and summarized as hardening work separate from first Edge Function cleanup.
  - No live Supabase mutation was performed.
- **Status:** Approval packet prepared; deletion/removal execution pending explicit owner approval.

### EVI-20260719-001: Independent Judge v3.5-rc.1 Release Artifacts
- **Assertion:** The judge stack for ChatGPT Projects is rebuilt, attested and locally verified as `v3.5-rc.1-projects-p1`.
- **Evidence:**
  - Tree: `ScienceAndTests/independent_judge_chatgpt_projects_stack_v3.5-rc.1/` — 30 Knowledge + 6 EXT + 5 skills + operator support + `STUDY_PACKAGES/unified1000_bnat50_v1_0/`.
  - ZIP: `ScienceAndTests/INDEPENDENT_JUDGE_CHATGPT_PROJECTS_STACK_v3.5-rc.1.zip`, 3,742,329 bytes, sha256 `844a80d6f0bfa44555b6ef3b4064d04244272170e7b9995a6273a9d5136cc6e4`.
  - QC: `OPERATOR_SUPPORT/STATIC_QC.json` PASS (30 knowledge, 40 criteria/8 per domain, 56 gates, 11 methods, T01–T40, instructions 5,500 chars); `DYNAMIC_QC.json` 5/5.
  - Governance: `OPERATOR_SUPPORT/ADR-20260719-03_V35_RC1_INTEGRATION_RELEASE.md`.
- **Status:** Local artifact facts verified; live Projects acceptance and empirical calibration NOT_RUN.

### EVI-20260719-002: Judge stack v3.5-rc.2 authoritative artifact
- **Assertion:** rc.2 supersedes rc.1 with a single authoritative release receipt.
- **Evidence:** ZIP `ScienceAndTests/INDEPENDENT_JUDGE_CHATGPT_PROJECTS_STACK_v3.5-rc.2.zip` sha256 `9a5766a2dea8a6a411ba4b23f57f99dc5ac75211f9b30224d683f8af7f67ae4b`; `OPERATOR_SUPPORT/BUILD_RECEIPT_PREZIP.json` records it as authoritative and lists the superseded rc.1 hashes; static QC PASS, dynamic 6/6.
- **Supersede:** the rc.1 hash `844a80d6…` recorded in EVI-20260719-001 is no longer the release artifact; rc.2 is authoritative.
- **Status:** Local attestation verified; live acceptance NOT_RUN.


### EVI-20260719-003: Independent Judge v3.5-rc.3 fail-closed release candidate
- **Assertion:** rc.3 closes the rc.2 fail-open study-record boundary and release-verification gaps without mutating live Supabase or ChatGPT Projects.
- **Evidence:**
  - Tree: `ScienceAndTests/independent_judge_chatgpt_projects_stack_v3.5-rc.3/`.
  - Active pointer: `ScienceAndTests/ACTIVE_JUDGE_STACK` → rc.3.
  - ZIP: `ScienceAndTests/INDEPENDENT_JUDGE_CHATGPT_PROJECTS_STACK_v3.5-rc.3.zip`, 1,176,932 bytes, sha256 `c882136db4882582fe5dfdb709bf8d1bf9d033d9f7bf1933afd79300357ddbc9` (supersedes pre-review build `3ee3bfb5da68aeacec6e5aa37047c0908a2390b80b6154919fd43581a13581c1`).
  - External receipt: `ScienceAndTests/INDEPENDENT_JUDGE_CHATGPT_PROJECTS_STACK_v3.5-rc.3.receipt.json`; final ZIP hash is not stored inside the ZIP.
  - Static QC PASS: 30 Knowledge, instructions 5,500/6,000, 6 EXT, 40 criteria, 56 gates, 11 methods, T01–T40, 5 skills.
  - Dynamic/mutation QC 22/22 PASS, including missing required fields, wrong types, invalid enums, NaN/Infinity, out-of-range scores, hard-failure laundering, blind-file separation, and pack QC.
  - Manifest exact two-way coverage 121/121; archive 123 files; round-trip tree identity 123/123; no cache/symlink artifacts.
- **Limitations:** live T01–T40, empirical calibration, owner acceptance, and 126×3 answer regeneration are NOT_RUN/open.
- **Status:** Local release candidate verified; GitHub PR/CI and live acceptance pending.

### EVI-20260719-004: Independent Judge rc.3 second-review closure
- **Assertion:** six additional P2 contract/aggregation findings are closed on the exact release artifact.
- **Evidence:** ZIP `ScienceAndTests/INDEPENDENT_JUDGE_CHATGPT_PROJECTS_STACK_v3.5-rc.3.zip`, 1,178,388 bytes, sha256 `73d7ee6f7e77926234be7250fd3ab7b1b4957abb0361dbf51e4bbb90ae587e25`; static PASS; dynamic 25/25; manifest 121/121; archive 123 files; round-trip 123/123.
- **Supersedes:** prior rc.3 post-review ZIP hash `c882136db4882582fe5dfdb709bf8d1bf9d033d9f7bf1933afd79300357ddbc9`.
