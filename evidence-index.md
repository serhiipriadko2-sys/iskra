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
