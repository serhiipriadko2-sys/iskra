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
- **Description:** Fresh live verification on 2026-06-16 shows `gemini`, `db-proxy`, `iskra-canon-import-1536`, and `iskra-canon-backfill-1536` active in `AgiIskra / typcvaszcfdpkzbjzuur`; `iskra-canon-import-diagnostic` is absent. The import/backfill functions were retired as 410 stubs and redeployed as version 4 with `verify_jwt=true` after explicit owner approval.
- **Status:** Resolved for the unreviewed privileged unauthenticated Edge Function boundary; residual `db-proxy` owner/access/disable policy and OpenAI live smoke remain tracked separately.
- **Risk:** Public release no longer retains canon import/backfill service-role-backed handlers without JWT. Reintroducing import/backfill behavior would recreate a privileged live boundary and must not happen without a new ADR, explicit expiry, and an authenticated admin/custom-auth gate.
- **Mitigation:** ADR `governance/adr_20260616_retire_canon_import_backfill_edge_functions.md` records the decision, before/after live metadata, rollback path, and verification. Current PASS criterion: live function list shows zero unreviewed privileged functions with `verify_jwt=false`, and `iskra-canon-import-diagnostic` remains absent.


### OPN-20260607-004: iskraSpace Build Warnings Before Release
- **Description:** `pnpm --dir runtime/iskraSpace run build` passes, but emits warnings for CSS syntax (`-: .;`), mixed dynamic/static imports around Supabase modules, and a main chunk larger than 500 kB.
- **Status:** Resolved locally; final gate passed.
- **Risk:** Remote or future builds can regress if regex-like content is reintroduced into Tailwind-scanned files or large dependencies collapse back into the main chunk.
- **Mitigation:** `runtime/iskraSpace/services/memoryService.ts` now avoids the Tailwind-scanned `/[-:.]/g` regex literal, Supabase modules use static imports where needed, and `runtime/iskraSpace/vite.config.ts` defines manual chunks for React, Supabase, Gemini SDK, and runtime/core/math sources. Final `pnpm --dir runtime/iskraSpace run build` output was warning-free for the prior CSS/mixed-import/chunk warnings.

### OPN-20260608-001: Optional Vercel Credential Contour
- **Description:** `Deploy to Vercel` failed on merge commit `e8236ace454aacdabb50cdfaa54b674971f88954` because Vercel credentials were empty in the GitHub Actions job.
- **Status:** Resolved for automatic main-push release gate; Vercel remains optional/manual and unverified until secrets are configured.
- **Risk:** If Vercel is treated as mandatory without configured secrets, release readiness will be falsely red despite Cloud Run being green.
- **Mitigation:** Run Vercel only by manual workflow dispatch with `deploy_vercel=true`; fail fast when `VERCEL_TOKEN`, `VERCEL_ORG_ID`, or `VERCEL_PROJECT_ID` are missing; keep Cloud Run as mandatory deploy target until Vercel secrets are configured and intentionally promoted.

### OPN-20260608-002: Dual AI Provider Live Smoke
- **Description:** Repo source now supports Gemini default plus optional OpenAI routing in the `gemini` Supabase Edge Function.
- **Status:** Tooling ready, awaiting smoke verification. 
- **Risk:** OpenAI generation, compatible SSE streaming, embeddings, and fallback behavior must be proven against live Supabase secrets/runtime before claiming verified status in public releases.
- **Mitigation:** Created `tools/smoke_openai_provider.py` to securely provision the secret via CLI, execute a POST call to Deno Edge Function using anon key auth, and unset the secret immediately. Run the tool to execute the live smoke test.

### OPN-20260718-001: Unapplied P0 Security Migration
- **Description:** Migration `20260717183002_supabase_acl_and_graph_contract_hardening.sql` exists in repo but is NOT applied to live Supabase. It revokes anon EXECUTE on 3 SECURITY DEFINER functions, fixes 2 mutable search_path functions, and disables GraphQL introspection.
- **Status:** Open — migration header marks it "source-only" until staging magic-link and two-user Graph isolation pass.
- **Risk:** 3 SECURITY DEFINER functions (`consume_ai_quota`, `resolve_beta_access`, `prevent_graph_node_cross_owner_cascade`) remain callable by `anon` via PostgREST until this migration is applied.
- **Mitigation:** Run staging verification for magic-link and Graph isolation, then apply migration. If staging is not available, consider applying the revoke-only subset as an emergency patch.

### OPN-20260718-002: iskra_memory Schema — RLS Enabled but No Policies
- **Description:** 10 tables in `iskra_memory.*` schema have RLS enabled but zero policies: `gateway_events`, `horizon_events`, `memory_archive`, `memory_dream_seeds`, `memory_edges`, `memory_journal`, `memory_open_loops`, `memory_sense_events`, `memory_shadow`, `statecycle_snapshots`. Same for 2 tables in `private.*`: `ai_rate_limit_windows`, `beta_invites`, `beta_members`.
- **Status:** Open.
- **Risk:** RLS-without-policies means all non-service-role access is silently denied. If any client code expects to read/write these tables via anon/authenticated roles, it will fail silently. This is safe-by-default but may mask integration bugs.
- **Mitigation:** Confirm whether iskra-memory-gateway uses service_role to access these tables (expected). If so, the current state is intentionally locked and policies should only be added when client-side access is designed.

### OPN-20260718-003: Edge Function Source Provenance Split
- **Description:** 3 Edge Functions (`gemini`, `iskra-agent`, `kain`) have source in `runtime/iskraSpace/supabase/functions/` but NOT in canonical `supabase/functions/`. 2 functions (`embed`, `iskra-memory-gateway`) are in canonical location. `db-proxy` has NO source at all (decision memo says "do not keep").
- **Status:** Open.
- **Risk:** Two source locations create confusion about which source is canonical for deployment. Supabase CLI defaults to `supabase/functions/` for `supabase functions deploy`.
- **Mitigation:** Consider symlinking or mirroring `runtime/iskraSpace/supabase/functions/*` into `supabase/functions/`, or document the deployment path explicitly.

### OPN-20260718-004: Dead Branch Accumulation
- **Description:** 34 local branches, ~115 remote branches. Most `codex/*`, `copilot/*`, `fix/*`, `docs/*` branches are merged into main.
- **Status:** Open — low priority.
- **Risk:** Visual noise, slow git fetch, potential confusion about active work.
- **Mitigation:** Batch delete merged remote branches: `git branch -r --merged origin/main | grep -v main | xargs git push origin --delete`. Keep release-relevant unmerged branches.

