# iskra-memory-gateway package

Project-facing Supabase Edge Function for ChatGPT Projects.

## Current status: 1A.1 probe-only containment

The repository source is intentionally fail-closed while the credential class sent by the
real ChatGPT Projects Action is measured.

```text
repository source: probe_only, including post-review CORS/token normalization
GitHub merge: pending for this pull request
Supabase deployment: v4 ACTIVE, verify_jwt=true
live source read-back: completed 2026-07-16
repository/live source parity: pending deployment of the post-review normalization delta
Projects probe: pending
```

The management-plane read-back confirmed that deployed v4 contains the probe-only
composition. It matched the branch before the two review fixes; therefore deployed
containment is verified, while exact current-branch source parity is not yet claimed.

### Live v4 receipt

- updated: `2026-07-15T17:45:47.938Z`;
- bundle SHA-256: `765837f2f580764a608d9b0dc64f993c51020f5e30d5df5229d82f14bca511c2`;
- read back: `index.ts`, `handler.ts`, and `deno.json`;
- Projects `auth/whoami`: not yet observed successfully;
- credential class: unknown.

## Available route

The only successful application route is:

```text
POST /functions/v1/iskra-memory-gateway/auth/whoami
```

The Edge runtime may expose the corresponding internal pathname:

```text
POST /iskra-memory-gateway/auth/whoami
```

Matching is exact. Bare `/auth/whoami`, `/whoami`, `/x/whoami`, suffix matches, and extra
segments return `404` after authentication.

## Security posture

- Supabase must keep `verify_jwt=true`.
- The function also verifies the JWT in-process with `jose` and permits only HS256.
- Captured Bearer tokens are trimmed before verification.
- Configured CORS origins are trimmed and normalized without trailing slashes.
- Expected issuer and audience are enforced only when
  `ISKRA_GATEWAY_EXPECTED_ISSUER` and `ISKRA_GATEWAY_EXPECTED_AUDIENCE` are set.
- The response never reports issuer/audience validation fields and never returns token,
  subject, ref, issuer, audience, or JWT identifiers.
- The production `index.ts` injects no PostgreSQL or privileged capability.
- Former routes such as `memory/write`, `memory/search`, `shadow/promote`,
  `dream/crystallize`, `observe`, `commit`, and `horizon/propose` return
  `503 gateway_security_hold`.
- Client JSON cannot provide or override actor identity.
- No secrets are committed.

Normalized response shape:

```json
{
  "ok": true,
  "service": "iskra-memory-gateway",
  "mode": "probe_only",
  "credential_class": "service_role | anon | authenticated | other"
}
```

## Local verification

From the repository root:

```powershell
pnpm install --frozen-lockfile
pnpm --filter iskra-space exec vitest run services/__tests__/iskraMemoryGatewayProbeOnly.test.ts services/__tests__/iskraMemoryGatewaySecurity.test.ts
pnpm --filter iskra-space typecheck
```

From this function directory:

```powershell
pnpm dlx deno check --config deno.json --lock deno.lock index.ts
pnpm dlx deno bundle --config deno.json --lock deno.lock index.ts --output gateway.bundle.js
```

Delete the temporary bundle after recording its byte count.

## Next deploy gate

Deployed v4 already provides fail-closed containment. The next deployment is only for the
post-review CORS/token normalization delta. Do not deploy directly from an unreviewed
working tree. Required order:

1. focused branch and draft pull request;
2. green repository and Deno gates;
3. independent review;
4. explicit production deploy approval;
5. deploy with `verify_jwt=true`;
6. live source read-back proving current-branch parity;
7. one real Projects probe.

## 1B boundary

Design 1B only after the probe records the normalized credential class. Do not treat a
legacy shared `service_role` key as the final authorization profile. The target is a
dedicated, least-privilege credential and an explicit route allowlist.

## Rollback

Prefer disabling the Action or retaining a fail-closed function while
repairing the probe. Routine rollback to privileged v3 is forbidden because it restores
the known authorization defect.

See:

```text
governance/adr_20260715_iskra_memory_gateway_probe_only_containment.md
```
