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
- **Description:** GitHub check-runs for baseline commit `2d1a2f154b5a8563abe2d824d275ce98ba2b8e52` show two completed failures: `rmgpgab-iskra-europe-west1-serhiipriadko2-sys-iskra--maraw` and `cloudrun-iskra-git-europe-west8-serhiipriadko2-sys-iskra-mcnh`.
- **Status:** Local repair prepared; remote confirmation pending.
- **Risk:** Local checks can pass while release/deploy checks remain failed.
- **Mitigation:** The Checks API/root-cause pass found Google Cloud Docker builds failing because `runtime/src/types/guard.ts` could not resolve `../../../ledger/baselines.json`. The working-tree `Dockerfile` now copies that ledger file and the root/package sources required by `runtime/iskraSpace` aliases. Local Docker Desktop build and container smoke passed; keep this loop open until a pushed PR shows the Google Cloud checks green or classified.

### OPN-20260607-003: Supabase Live Function Drift Before Public Release
- **Description:** Fresh read-only Supabase baseline lists live `gemini`, `db-proxy`, `iskra-canon-import-1536`, `iskra-canon-backfill-1536`, and `iskra-canon-import-diagnostic`; repo-side `embed` exists but is absent from the live function list.
- **Status:** Open.
- **Risk:** Public release could depend on an undocumented hybrid path or retain unauthenticated internal/diagnostic functions.
- **Mitigation:** `docs/operations/iskraspace_supabase_live_boundary_decision_2026-06-07.md` separates direct `runtime/iskraSpace` `gemini embedContent` from engine/web `embed`. Before live mutation, refresh functions/migrations/advisors/app data path; remove `iskra-canon-import-diagnostic` or accept a time-boxed ADR exception; add owner/access/expiry decisions for `db-proxy` and canon import/backfill functions.

### OPN-20260607-004: iskraSpace Build Warnings Before Release
- **Description:** `pnpm --dir runtime/iskraSpace run build` passes, but emits warnings for CSS syntax (`-: .;`), mixed dynamic/static imports around Supabase modules, and a main chunk larger than 500 kB.
- **Status:** Resolved locally; final gate passed.
- **Risk:** Remote or future builds can regress if regex-like content is reintroduced into Tailwind-scanned files or large dependencies collapse back into the main chunk.
- **Mitigation:** `runtime/iskraSpace/services/memoryService.ts` now avoids the Tailwind-scanned `/[-:.]/g` regex literal, Supabase modules use static imports where needed, and `runtime/iskraSpace/vite.config.ts` defines manual chunks for React, Supabase, Gemini SDK, and runtime/core/math sources. Final `pnpm --dir runtime/iskraSpace run build` output was warning-free for the prior CSS/mixed-import/chunk warnings.
