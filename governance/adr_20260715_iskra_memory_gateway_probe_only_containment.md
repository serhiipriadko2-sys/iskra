# ADR-20260715-01: Memory Gateway Probe-Only Containment

Status: accepted
Date: 2026-07-15
Owner / Builder: Семён / Искра

## Context

`iskra-memory-gateway` v3 verified an HS256 signature but did not restrict the
JWT role before privileged PostgreSQL-backed routes. The deployed source and GitHub
`main` were independently observed as equivalent before this change. Therefore a valid
project JWT could reach the gateway's privileged handlers even though the real credential
class sent by ChatGPT Projects had not been measured.

The probe-only composition was subsequently deployed as Supabase Edge Function v4 on
2026-07-15. A 2026-07-16 management-plane read-back confirmed `ACTIVE`,
`verify_jwt=true`, and the probe-only `index.ts`, `handler.ts`, and `deno.json` source.
No successful real Projects `auth/whoami` invocation has been observed, so the credential
class remains unknown.

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

This ADR accepts the source change and test contract and records the verified-live v4
containment receipt. It does **not** claim merge of this pull request, a successful
Projects invocation, or credential classification. The CORS-origin normalization and
Bearer-token trimming added during review are newer than deployed v4 and require a
separate post-merge deployment/read-back before repository/live source parity can be
claimed again.

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
- v4 containment is live, but the two post-review normalization fixes are not yet deployed;
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
3. `get_edge_function` read-back proving the deployed version and source;
4. one real Projects `auth/whoami` call;
5. 1B design based on the observed normalized credential class.

Recorded delivery receipt:

- deployed function: `iskra-memory-gateway` v4, `ACTIVE`, `verify_jwt=true`;
- deployment update time: `2026-07-15T17:45:47.938Z`;
- management-plane bundle SHA-256: `765837f2f580764a608d9b0dc64f993c51020f5e30d5df5229d82f14bca511c2`;
- source read-back: complete for `index.ts`, `handler.ts`, and `deno.json`;
- live behavior class: probe-only containment verified;
- Projects probe: pending;
- post-review source delta: CORS trailing-slash normalization and Bearer-token trimming,
  pending a separate deployment/read-back.

## Rollback

The safe rollback is to keep a fail-closed hold, disable the Action, or
delete/disable the function while correcting the probe. Do not redeploy privileged v3 as
a routine rollback because that restores the confirmed authorization defect. Any emergency
return to v3 requires a separate explicit risk acceptance and immediate time-bounded repair.

## Status ladder

```text
accepted: yes
implemented on branch: yes
merged: no
deployed: yes, Supabase v4
live source read-back: yes
verified live containment: yes
current branch/live source parity: no, post-review normalization delta pending deploy
invoked from Projects: no
credential class measured: no
```

## ∆DΩΛ

∆: the gateway changed from privileged-by-default v3 to verified-live probe-only v4;
review also closes CORS-origin and Bearer-token normalization gaps.
D: v4 management-plane metadata and source read-back, JWT role-gap audit, production
handler tests, pre-review Deno check/bundle, post-review Deno lint/typecheck, and review
findings.
Ω: 0.98 for live probe-only containment; 0.00 for the still-unobserved Projects credential
class; 0.85 for the post-review delta until it is deployed and read back.
Λ: revisit after merge, deployment/read-back of the review delta, and the first real
Projects probe.
