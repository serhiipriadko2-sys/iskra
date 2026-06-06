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
