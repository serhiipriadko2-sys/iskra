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
