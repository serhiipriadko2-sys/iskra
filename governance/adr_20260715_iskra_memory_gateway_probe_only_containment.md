# ADR-20260715-01: Memory Gateway Probe-Only Containment

Status: accepted
Date: 2026-07-15
Owner / Builder: Семён / Искра

## Context

`iskra-memory-gateway` v3 verifies an HS256 signature but does not restrict the
JWT role before privileged PostgreSQL-backed routes. The deployed source and GitHub
`main` were independently observed as equivalent before this change. Therefore a valid
project JWT could reach the gateway's privileged handlers even though the real credential
class sent by ChatGPT Projects had not been measured.

A direct `service_role` allowlist is not an adequate first repair. If the Projects Action
already carries a broad legacy `service_role` credential, that allowlist would preserve
and normalize the widest credential instead of designing a least-privilege identity.

## Decision

Introduce a temporary, fail-closed **probe-only containment** as release 1A.1.

1. `index.ts` becomes a thin Deno composition adapter.
2. The real request handler and JWT verifier move to an importable production module.
3. The production composition sets `mode: probe_only` and injects no privileged
   capability or PostgreSQL client.
4. Only the exact canonical `auth/whoami` route is available behind known Supabase
   function prefixes.
5. Every former privileged route returns `503 gateway_security_hold` after successful
   authentication.
6. The probe response contains only `ok`, `service`, `mode`, and normalized
   `credential_class`; token, subject, ref, issuer, audience, and JWT identifiers are not
   returned.
7. Issuer and audience checks are enforced only when their expected values are explicitly
   configured. The response never claims those checks were performed.
8. Release 1B is designed only after a real Projects probe. It must use a dedicated,
   least-privilege credential profile rather than treating legacy `service_role` as the
   final authorization model.

This ADR accepts the source change and test contract. It does **not** claim merge,
deployment, invocation, credential classification, or verified-live containment.

## Exact route contract

Accepted request pathnames:

```text
/functions/v1/iskra-memory-gateway/auth/whoami
/iskra-memory-gateway/auth/whoami
```

Bare `/auth/whoami`, suffix matches such as `/x/whoami`, and extra path segments are
rejected. Route matching is exact, not based on the final segment.

## Alternatives

1. Add only `role === service_role`. Rejected: the actual Projects credential is unknown,
   and a broad legacy credential is not the desired final identity.
2. Keep SQL handlers and place a boolean hold in front. Rejected: a routing regression
   could still expose a live privileged sink.
3. Test a duplicated handler implementation. Rejected: tests could pass while deployed
   production code drifted.
4. Use Deno-only tests. Rejected as the sole gate: Deno check/bundle is required, but the
   repository's canonical CI and security tests run through pnpm/Vitest.

## Consequences and price

Benefits:

- privileged SQL invocation becomes structurally unavailable in the deployed composition;
- production and test code share the same handler and verifier;
- credential discovery does not expose raw claims or identifiers;
- exact routes remove suffix-routing ambiguity.

Costs:

- all memory, StateCycle, Shadow, Dream, and Horizon routes are unavailable during 1A;
- a deployment is required before containment becomes live;
- the Projects Action must be probed and then reconfigured for 1B.

## Diff scope

```text
supabase/functions/iskra-memory-gateway/{index.ts,handler.ts,deno.json,deno.lock,README.md,manifest.json}
runtime/iskraSpace/services/__tests__/iskraMemoryGateway{ProbeOnly,Security}.test.ts
package.json
runtime/iskraSpace/package.json
pnpm-lock.yaml
package-lock.json
AGENTS.md
governance/adr_20260715_iskra_memory_gateway_probe_only_containment.md
governance/changelog.d/2026-07-15-memory-gateway-probe-only-containment.md
ledger/* generated integrity files
```

Migration parity, Archive/Shadow proof enforcement, and T76.1 are explicitly out of scope.

## Verification

Required source gates:

- `pnpm install --frozen-lockfile`;
- focused Vitest security suite with no skipped tests;
- strict `runtime/iskraSpace` TypeScript typecheck;
- `deno check` and `deno bundle` against the function-local config and lock;
- `git diff --check`, secret scan, ADR gate, and ledger verification.

Required delivery gates:

1. isolated branch and draft pull request;
2. independent review of the production-bound tests and fail-closed composition;
3. separate explicit approval for Supabase production deployment;
4. `get_edge_function` read-back proving the new version and source;
5. one real Projects `auth/whoami` call;
6. 1B design based on the observed normalized credential class.

## Rollback

Before deployment, revert the branch or close the pull request.

After deployment, the safe rollback is to keep a fail-closed hold, disable the Action, or
delete/disable the function while correcting the probe. Do not redeploy privileged v3 as
a routine rollback because that restores the confirmed authorization defect. Any emergency
return to v3 requires a separate explicit risk acceptance and immediate time-bounded repair.

## Status ladder

```text
accepted: yes
implemented locally: pending verification receipt
merged: no
deployed: no
invoked from Projects: no
credential class measured: no
verified live: no
```

## ∆DΩΛ

∆: the gateway changes from privileged-by-default source to a temporary probe-only,
production-bound, structurally sink-free composition.
D: deployed/GitHub v3 source comparison, JWT role-gap audit, production handler tests,
Deno check/bundle, and Owner instruction to proceed.
Ω: 0.95 for the accepted source architecture; 0.00 for deployment effect until live
read-back.
Λ: revisit after draft-PR review, approved deployment, and the first Projects probe.
