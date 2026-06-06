# ADR Log: Iskra Space

## ADR-20260530-001: Strict TypeScript Compilation Standards for Release

### Context
Strict TypeScript unused parameter rules (`noUnusedParameters: true` in `tsconfig.json`) cause package builds to fail when interface implementations define unused arguments for generic compatibility. In this case, `runtime/kain` defined `response: string` in its main analysis hook, which was never read, causing full monorepo build failures.

### Decision
Prefix all unused, interface-required function arguments in `@iskra/` and `runtime/` packages with an underscore `_` (e.g. `_response: string`). This signals to TypeScript that the argument is intentionally unused for interface compatibility, resolving compilation blockages without sacrificing strict safety settings.

### Alternatives
- **Disable strict unused checks:** Highly discouraged as it reduces overall code quality and security boundaries.
- **Remove unused parameter entirely:** Impossible for generic callback hooks where third-party libraries require a fixed function signature.

### Consequences
- **Pros:** Successful recursive package builds, clean compilation output, and robust monorepo releases.
- **Cons:** Minor code syntax adjustments required during API design.

### Verification
- Ran `pnpm build` in workspace root. Verification passed successfully (built in 4.04s).

## ADR-20260606-002: Runtime Toolchain Bridge as Source-Controlled Plugin

### Context
The Iskra Agent Builder package included toolchain knowledge, but the runtime bridge needed a source-controlled Codex/Agent contour with explicit connector contracts, secret-safe git behavior, and local smoke verification.

### Decision
Keep `plugins/iskra-toolchain-bridge/` as the canonical repository source for the runtime bridge and mirror it into the current v4 Builder upload tree. The bridge must include a valid Codex plugin manifest, a skill entrypoint, connector contracts, vault-safe clone helpers, contract validation, runtime smoke validation, and release receipts.

### Alternatives
- Keep the toolchain bridge only as Agent Builder knowledge files. Rejected because it cannot prove runtime behavior.
- Embed bridge logic only inside the v4 upload mirror. Rejected because it would hide the reusable source from normal repo review and plugin validation.

### Consequences
- Runtime behavior is now reviewable, testable, and reproducible from Git.
- Any future bridge contract change must update source plugin files, v4 mirror files, receipts, manifests, and ledger together.
- Actual Codex Desktop installation and Builder UI prompt behavior still require environment-specific verification.

### Verification
Plugin schema validation, connector-contract validation, runtime smoke, manifest check, zip integrity, and obvious-secret scan passed locally. Codex app activation remains blocked by `codex.exe` returning `Access is denied`.

### Rollback / Reversal Trigger
Rollback if Codex Desktop rejects the plugin manifest, connector contracts fail real runtime tests, or Agent Builder upload behavior proves the mirrored bridge causes prompt/tool discipline drift.
