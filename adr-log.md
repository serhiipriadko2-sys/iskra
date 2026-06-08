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

## ADR-20260606-003: Runtime Bridge Requires Config Exposure, Live Read Receipts, and Hardening Prompts

### Context
The runtime bridge moved from static package files to local plugin source, but the next gate required actual Codex Desktop exposure, live connector read evidence, and Builder acceptance prompts that catch common unsafe overclaims.

### Decision
Expose `plugins/iskra-toolchain-bridge/` through a local Codex marketplace entry `iskra-local`, keep app load status separate from config exposure, record live read receipts for GitHub/Supabase/browser, and add Builder runtime hardening prompts as release blockers.

### Alternatives
- Treat plugin source validation as enough. Rejected because it does not prove connector reality or app discovery.
- Wait for `codex.exe` to become callable before adding receipts. Rejected because GitHub/Supabase/browser live reads are independently observable and useful now.

### Consequences
- `config-exposed-cli-blocked` is a valid intermediate status.
- Runtime bridge claims must distinguish source validation, config exposure, live read connectors, app load, and Builder UI activation.
- Builder upload verification must include local filesystem truth, secret safety, credential URL rejection, GitHub-before-web discipline, browser text trust, and upload boundary prompts.

### Verification
GitHub connector read PASS; Supabase connector read PASS; Opera browser read PASS; local Codex config exposure PASS; Codex CLI/app load BLOCKED by `Access is denied`; official Codex manual helper PARTIAL due `HTTP 403`.

### Rollback / Reversal Trigger
Remove `iskra-local` config exposure and revert hardening prompt additions if Codex Desktop rejects local marketplace loading or Builder prompt tests show the new gates conflict with higher-priority canon/security rules.

## ADR-20260607-004: Cloud Run Ingress Port 8080 For Production Image

### Context
After PR #195 merged, public GitHub checks on merge commit `17056d685864428b2134c4dde630b296090410fd` showed repository checks passing but two Google Cloud deploy checks failing. Their public summaries showed build and push succeeded, while deploy failed. The production image used nginx on port `80`; Cloud Run's default ingress request port is `8080` unless configured otherwise.

### Decision
Make the production Docker/nginx contour listen on container port `8080`: update `nginx.conf`, `Dockerfile` `EXPOSE`, Docker healthcheck, and `docker-compose.yml` mapping/healthcheck together.

### Alternatives
- Configure the Cloud Run service to send traffic to port `80`. Rejected for repo-side release repair because it requires live Google Cloud mutation and does not make the image default-compatible.
- Keep nginx on port `80` and treat deploy failure as external. Rejected because local repo evidence shows an obvious mismatch with the default Cloud Run contract.

### Consequences / Price
- Local docker-compose host port remains `3000`, but maps to container `8080` instead of `80`.
- Existing scripts or docs that assume container port `80` must be updated if they become active again.
- The final proof still requires remote Google Cloud checks after push.

### Verification
Local Docker build passed with `docker build -t iskra-space-cloudrun-port-check:2026-06-07 .`. Container smoke on host `18082` mapped to container `8080` returned `/` HTTP 200, bytes `9762`, root div present, and `/health` body `healthy`.

### Rollback / Reversal Trigger
Revert to port `80` only if the Cloud Run service is explicitly configured to send requests to port `80` and a deploy check proves that configuration is the intended production contract.

### Delta
Delta: production image contract now matches Cloud Run default ingress port.
D: public GitHub check summary, Docker/nginx files, official Cloud Run container contract, local Docker smoke.
Omega: 0.89 locally; 0.74 for remote root cause until Google Cloud checks pass.
Lambda: revise on failed post-push deploy or explicit Cloud Run port override evidence.

## ADR-20260608-001: Vercel Is Optional Manual Deploy Until Credentials Are Configured

### Context
After PR #196 merged, Cloud Run checks passed on `e8236ace454aacdabb50cdfaa54b674971f88954`, but the GitHub Actions `Deploy to Vercel` job failed because `VERCEL_TOKEN`, `VERCEL_ORG_ID`, and `VERCEL_PROJECT_ID` were empty.

### Decision
Treat Cloud Run as the mandatory production deploy contour for `runtime/iskraSpace`. Vercel is optional and manual-only until credentials are configured and a separate decision promotes it back into the mandatory release gate.

### Alternatives
- Keep Vercel mandatory and require immediate secret configuration. Rejected because Cloud Run is already green and the Vercel failure is credential contour drift, not an app failure.
- Remove Vercel deploy permanently. Rejected because Vercel may still be useful as a secondary deployment path after credentials are configured.

### Consequences / Price
- Normal `main` pushes should no longer fail because of missing Vercel credentials.
- Manual Vercel dispatch without credentials fails fast with explicit missing-secret errors.
- Release readiness must still account for Supabase live blockers.

### Verification
Workflow now exposes `workflow_dispatch.deploy_vercel`, gates `deploy-vercel` on manual dispatch, validates all required Vercel secrets before CLI calls, and disables Vercel telemetry for that job.

### Rollback / Reversal Trigger
Promote Vercel back to mandatory only after `VERCEL_TOKEN`, `VERCEL_ORG_ID`, and `VERCEL_PROJECT_ID` are configured, manual production deploy passes, and a release decision records Vercel as required.

### Delta
Delta: release signal is separated from optional Vercel credential drift.
D: GitHub check runs, Vercel job log, production workflow.
Omega: 0.91 for failure classification; 0.75 for future Vercel deploy until secrets are configured and tested.
Lambda: revise when Vercel secrets are added or Cloud Run target changes.
