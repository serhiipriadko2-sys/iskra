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
- **Description:** `plugins/iskra-toolchain-bridge/` is verified as source and mirrored into the v4 Builder package, but the local Codex app activation cannot be checked in this environment.
- **Status:** Blocked by local tool execution.
- **Risk:** The plugin schema and smoke contour are valid, but actual Codex Desktop installation and Agent Builder UI behavior may still drift from the local source package.
- **Mitigation:** On a machine where `codex.exe` runs, install or expose the plugin in Codex Desktop, run the bridge smoke command from the plugin root, upload the v4 package to Agent Builder, and execute acceptance prompts before marking `verified in Builder UI`.
