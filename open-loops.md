# Open Loops: Iskra Space

## Risk Registry & Pending Verifications

### OPN-20260530-001: Strangler Fig Package Migration
- **Description:** Deprecated runtime/ code is being strangler-migrated into standard `@iskra/` workspace packages (`@iskra/core`, `@iskra/math`, `@iskra/engine`).
- **Status:** Open.
- **Risk:** High structural drift between legacy components in `runtime/` and standard modular packages.
- **Mitigation:** Ensure standard packages are rigorously tested and that the final production release maps `apps/iskra-web` entirely to the standard stack, leaving `runtime/` completely deprecated.

### OPN-20260530-002: Live Staging Deploy & RLS Tests
- **Description:** Verifying RLS user isolation policies under high concurrent load on the live Supabase staging server.
- **Status:** Pending manual deployment.
- **Risk:** Potential jwt token verification failure under edge proxy limits.
- **Mitigation:** Run the Playwright test suite `test:e2e` post-deploy to confirm RLS policies enforce multi-user isolation on auth schema.

### OPN-20260606-001: Runtime Bridge App Activation
- **Description:** `plugins/iskra-toolchain-bridge/` is verified as source, mirrored into v4, and exposed in `C:\Users\gabra\.codex\config.toml` as `iskra-toolchain-bridge@iskra-local`, but active Codex Desktop plugin load is not proven.
- **Status:** Config exposed; app load blocked by local CLI execution.
- **Risk:** The plugin schema, smoke contour, and config entry are valid, but actual Codex Desktop runtime discovery may still require app restart or UI inventory proof.
- **Mitigation:** Restart Codex Desktop or open a fresh session, verify plugin visibility in app inventory, and rerun runtime smoke from the app-visible plugin path before marking `live`.

### OPN-20260606-002: Runtime Bridge CI Status Checks
- **Description:** Opera browser review of GitHub commit `e6ce1fb` observed `Status checks: failure`, `4 / 6`.
- **Status:** Open.
- **Risk:** Runtime bridge package may be locally verified while repository CI remains red for unrelated or related checks.
- **Mitigation:** Inspect current GitHub Actions checks/logs after the next push and repair or explicitly classify baseline failures before production release claims.

### OPN-20260607-001: Supabase Status Dump Exposure Classification
- **Description:** A tracked raw `supabase_status.txt` file was removed from the current tree and replaced with a redacted template plus a sensitive-status checker.
- **Status:** Current-tree leak closed locally; credential classification still open.
- **Risk:** The removed dump contained credential-like local Supabase/S3 status material. If any value was not local-dev-only, provider-side rotation and usage audit are required.
- **Mitigation:** Do not quote the values. Follow `docs/operations/supabase_status_exposure_owner_checklist_2026-06-07.md`; rotate/audit any non-local or unknown value. Do not rewrite Git history without separate explicit approval.

### OPN-20260607-002: Current Baseline GitHub Checks Are Red
- **Description:** GitHub check-runs for merge commit `17056d685864428b2134c4dde630b296090410fd` show two completed Google Cloud failures: `rmgpgab-iskra-europe-west1-serhiipriadko2-sys-iskra--maraw` and `cloudrun-iskra-git-europe-west8-serhiipriadko2-sys-iskra-mcnh`.
- **Status:** Resolved for Cloud Run after PR #196 merge.
- **Risk:** Future Google Cloud regressions remain possible, but current Cloud Run checks are green on `e8236ace454aacdabb50cdfaa54b674971f88954`.
- **Mitigation:** Keep Cloud Run as the mandatory deploy contour and inspect Google Cloud summaries first if this loop reopens.

### OPN-20260607-003: Supabase Live Function Drift Before Public Release
- **Description:** Fresh read-only Supabase baseline lists live `gemini`, `db-proxy`, `iskra-canon-import-1536`, `iskra-canon-backfill-1536`, and `iskra-canon-import-diagnostic`; repo-side `embed` exists but is absent from the live function list.
- **Status:** Open.
- **Risk:** Public release could still retain unauthenticated internal/diagnostic functions. The diagnostic function is especially sensitive because the refreshed source posture shows it responds without method/auth gate and reports env-presence checks.
- **Mitigation:** `docs/operations/iskraspace_supabase_live_boundary_decision_2026-06-07.md` separates direct `runtime/iskraSpace` `gemini embedContent` from engine/web `embed`. `docs/operations/iskraspace_supabase_readonly_baseline_2026-06-09.md` records the post-PR #201 project/migration/function/source baseline. Before live cleanup mutation, refresh advisors/grants/logs/app data path if available; remove `iskra-canon-import-diagnostic` or accept a time-boxed ADR exception; add owner/access/expiry decisions for `db-proxy` and canon import/backfill functions.

### OPN-20260607-004: iskraSpace Build Warnings Before Release
- **Description:** `pnpm --dir runtime/iskraSpace run build` passes, but emits warnings for CSS syntax (`-: .;`), mixed dynamic/static imports around Supabase modules, and a main chunk larger than 500 kB.
- **Status:** Resolved locally; final gate passed.
- **Risk:** Remote or future builds can regress if regex-like content is reintroduced into Tailwind-scanned files or large dependencies collapse back into the main chunk.
- **Mitigation:** `runtime/iskraSpace/services/memoryService.ts` now avoids the Tailwind-scanned `/[-:.]/g` regex literal, Supabase modules use static imports where needed, and `runtime/iskraSpace/vite.config.ts` defines manual chunks for React, Supabase, Gemini SDK, and runtime/core/math sources. Final `pnpm --dir runtime/iskraSpace run build` output was warning-free for the prior CSS/mixed-import/chunk warnings.

### OPN-20260608-001: Optional Vercel Credential Contour
- **Description:** `Deploy to Vercel` failed on merge commit `e8236ace454aacdabb50cdfaa54b674971f88954` because Vercel credentials were empty in the GitHub Actions job.
- **Status:** Optional/manual contour planned; automatic main-push release gate removal pending PR.
- **Risk:** If Vercel is treated as mandatory without configured secrets, release readiness will be falsely red despite Cloud Run being green.
- **Mitigation:** Run Vercel only by manual workflow dispatch with `deploy_vercel=true`; fail fast when `VERCEL_TOKEN`, `VERCEL_ORG_ID`, or `VERCEL_PROJECT_ID` are missing; keep Cloud Run as mandatory deploy target until Vercel secrets are configured and intentionally promoted.

### OPN-20260608-002: Dual AI Provider Live Smoke
- **Description:** Repo source now supports Gemini default plus optional OpenAI routing in the `gemini` Supabase Edge Function.
- **Status:** Partially closed. Gemini embedding live smoke is verified via PR #201; OpenAI provider live smoke remains open.
- **Risk:** OpenAI generation, compatible SSE streaming, embeddings, and fallback behavior are not proven against live Supabase secrets/runtime yet, so public release claims must not advertise OpenAI behavior as verified.
- **Mitigation:** Before claiming OpenAI support, refresh the Supabase read-only baseline, configure server-side `OPENAI_API_KEY`/model env only in Supabase, deploy only after explicit approval, and smoke generation, streaming, embeddings, and fallback without printing secret values.
