# iskra-memory-gateway package

Project-facing Supabase Edge Function for ChatGPT Projects.

## Current source status: 1A.1 probe-only containment

The repository source is intentionally fail-closed while the credential class sent by the
real ChatGPT Projects Action is measured.

```text
source implementation: probe_only
GitHub merge: not implied by this file
Supabase deployment: requires separate approval and read-back
Projects probe: not implied by deployment
```

The source status is not evidence that production is contained. Read the live Edge
Function before making a deployed claim.

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

## Deploy gate

Do not deploy directly from an unreviewed working tree. Required order:

1. focused branch and draft pull request;
2. green repository and Deno gates;
3. independent review;
4. explicit production deploy approval;
5. deploy with `verify_jwt=true`;
6. live source read-back;
7. one real Projects probe.

## 1B boundary

Design 1B only after the probe records the normalized credential class. Do not treat a
legacy shared `service_role` key as the final authorization profile. The target is a
dedicated, least-privilege credential and an explicit route allowlist.

## Rollback

Before deployment, revert the branch or close the pull request.

After deployment, prefer disabling the Action or retaining a fail-closed function while
repairing the probe. Routine rollback to privileged v3 is forbidden because it restores
the known authorization defect.

See:

```text
governance/adr_20260715_iskra_memory_gateway_probe_only_containment.md
```
