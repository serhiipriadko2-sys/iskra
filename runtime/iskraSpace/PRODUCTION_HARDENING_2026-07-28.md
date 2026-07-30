# IskraSpace production hardening — 2026-07-28

Status: source implementation candidate; verified-live-staging; production not deployed.

## Authority boundary

This document describes repository source on branch
`fix/iskraspace-p0-production-hardening-20260728`, refreshed onto GitHub
`origin/main` `288b3b7cf0f2c7f9348d7afb64b56d71f9dbadca`. Staging evidence
is scoped to the data-less preview project and exact Edge source recorded in
`docs/operations/iskraspace_staging_acceptance_2026-07-28.md`. It does not
prove GitHub merge, production deployment, production traffic, Builder state,
provider availability or live browser UI success.

## Observed remote drift

Read-only observations on 2026-07-28:

- `DRIFT: GitHub vs Local` GitHub `main`
  `0fd486b3ab57237668cd3a253a7db58792119b25` has green SoT, Runtime,
  iskraSpace and Guard-remediation workflows. Production Deployment run
  `30379847259` fails at dependency audit on `postcss <=8.5.17` and
  `brace-expansion <=5.0.7`, and still invokes the broken `pnpm@11.13.0`
  indirection. This candidate directly repairs that observed failure.
- `HIGH-RISK DRIFT: Local vs Supabase` production project
  `typcvaszcfdpkzbjzuur` still serves `gemini` v9
  (`e0f0fef8a987370f0ac89f908c85f0cb41765a1f6b182c943841cf207a3c7a1b`)
  and `iskra-agent` v4
  (`a89d55997f931d8efc32b0297f7777d83838dcf47effe1f05ce9899b9c56e4a4`),
  both with `verify_jwt=true`. Source read-back shows the old
  caller-selectable dual-provider gateway and configurable Agent API base,
  without this candidate's body/schema/deadline/egress controls.
- `DRIFT: Staging vs Production` preview project
  `rejqxblontqjycldniyz` has the hardening source deployed and read back,
  while production remains on the pre-hardening versions above.

## Verified staging receipt

- Git branch: `fix/iskraspace-p0-production-hardening-20260728`;
- final deployed Edge/shared source snapshot:
  `67c8a512253404a52f0084a801b6acc231233c85`;
- staging migrations: 36/36;
- `gemini`: ACTIVE, `verify_jwt=true`, bundle SHA-256
  `2fae94308eae99ac4c12d9ac4a1159c94660991f2debd30df37ae9ca6d6caf3d`;
- `iskra-agent`: ACTIVE, `verify_jwt=true`, bundle SHA-256
  `7087ffb78320af157f69d40055730fce5c947edf97cb220e103a3a728ceb6d98`;
- downloaded read-back: 6/6 Edge and shared files byte-identical to local
  source;
- live matrix: 7/7 files and 61/61 tests PASS;
- principals: two active members plus valid non-member and suspended-member
  controls; all four principals and fixtures removed after the run; rate-window
  cleanup is fixture-subject scoped and preserves unrelated shared-IP windows;
- advisors: 0 ERROR; 33 security notices and 31 performance INFO notices;
- scoped logs: only expected negative-test denials (`audit_log` permission and
  Graph ownership); no Edge panic, uncaught exception, fatal or out-of-memory
  marker.

The ingress spoof test rejected `x-forwarded-for` as a trusted identity source:
eleven caller-selected values bypassed the limiter under that configuration.
With `cf-connecting-ip`, the same matrix produced ten explicit no-upstream
test-mode responses and a `429` on request eleven. The production secret
contract is therefore pinned to `cf-connecting-ip` until superseded by a new
ingress receipt.

## Implemented P0 controls

### AI request boundary

The `gemini` and `iskra-agent` handlers use this order:

1. exact origin and method;
2. verified Supabase user;
3. bounded JSON read;
4. schema/model/content policy;
5. closed-beta membership and transactional quota;
6. one allowlisted upstream destination.

Malformed or unsafe requests do not consume the application
`consume_ai_quota` windows and do not call a provider. Supabase may still count
the Edge Function invocation under its platform billing model. The shared
policy limits:

| Control | Bound |
| --- | ---: |
| Request body | 48 KiB |
| Aggregate text | 12,000 characters |
| Contents | 8 |
| Text parts | 24 |
| Output | 512 tokens |
| Provider call | 20 seconds |
| Stream | 25 seconds / 256 KiB |
| JSON schema | depth 10 / 256 nodes |

Production models are server-owned:

- text: `gemini-2.5-flash`;
- embeddings: `gemini-embedding-001`, 1,536 dimensions.

The browser provider selector and OpenAI fallback were removed. Workspace Agent
egress is constrained to `https://api.chatgpt.com`; client context cannot
override the server-owned `sift` and `delta_receipt` flags.

### Required Edge secrets and configuration

Set values through the Supabase secret plane; never place them in Vite or
`runtime-config.js`.

```text
GEMINI_API_KEY
AI_PROXY_ALLOWED_ORIGINS
ISKRA_AGENT_ALLOWED_ORIGINS
AI_EDGE_ENV=production
AI_EDGE_ALLOW_DEV_WILDCARD=false
AI_EDGE_INGRESS_IP_HEADER
AI_RATE_LIMIT_IP_HMAC_SECRET
AI_EDGE_TEST_MODE=false
AGENT_ID
AGENT_ACCESS_TOKEN
```

`AI_EDGE_INGRESS_IP_HEADER` must name exactly one header injected and sanitized
by the trusted ingress. The application intentionally does not guess generic
proxy headers. Absence or invalid configuration fails closed.

`AI_PROXY_ALLOWED_ORIGINS` and `ISKRA_AGENT_ALLOWED_ORIGINS` should contain
comma-separated bare origins. For operator resilience, each valid HTTP(S) URL
is normalized to its browser origin, so a copied deployment route such as
`https://example.github.io/app/` is accepted as `https://example.github.io`.
Malformed or credential-bearing entries are ignored; they never widen CORS.

### Principal-scoped browser state

Sensitive local state is stored under:

```text
iskra.principal.v1:<supabase-user-id>:<logical-key>
```

The first authenticated principal may claim existing legacy keys through a
one-time migration marker. A later principal cannot inherit those keys. Sign-out
removes the bound namespace and raw user-owned offline queues, while
device-level analytics/error-tracking consent remains intact.

The scope covers tasks, habits, journal, memory, Symbiosis profile/receipts,
voice/response preferences, mood, user metrics, audit/integrity state, ritual
history and canon seed state.

### Backup lifecycle

Import is fail-closed:

- maximum file size: 1 MiB before `FileReader`;
- exact backup version: `1.0.0`;
- bounded collection sizes and field validation;
- memory node/layer validation;
- all values staged before mutation;
- one transaction with preimage rollback on storage failure.

The exported Symbiosis state is provenance only. Import does not transfer
identity, onboarding or consent receipts between principals.

### Dependency and release gates

- pnpm overrides live at the workspace root.
- `postcss` is pinned to the fixed 8.5.18 line.
- The root pnpm tree routes `brace-expansion` through a local facade over the
  audited 5.0.8 implementation. It exposes both the legacy callable CommonJS
  API and the modern named ESM/CJS `expand` export, keeping `minimatch@3`, `@9`
  and `@10` compatible. The separate legacy npm tree uses ESLint 10 and native
  `minimatch@10` / `brace-expansion@5.0.8`, so it needs no compatibility patch.
- CI uses native `pnpm audit --audit-level moderate` at root and
  `npm audit --audit-level moderate` in `runtime/`.
- The release workflow no longer downloads a second pnpm major for auditing.

## Verification commands

```bash
pnpm install --frozen-lockfile --ignore-scripts
pnpm audit --audit-level moderate
pnpm dedupe --check

pnpm --dir runtime/iskraSpace typecheck
pnpm --dir runtime/iskraSpace lint:strict
pnpm --dir runtime/iskraSpace exec vitest run --maxWorkers=1
pnpm --dir runtime/iskraSpace build

deno test --no-lock \
  runtime/iskraSpace/supabase/functions/_shared/aiContentPolicy_test.ts \
  runtime/iskraSpace/supabase/functions/_shared/aiBoundary_test.ts
deno check --frozen \
  --lock runtime/iskraSpace/supabase/functions/gemini/deno.lock \
  --config runtime/iskraSpace/supabase/functions/gemini/deno.json \
  runtime/iskraSpace/supabase/functions/gemini/index.ts
deno check --no-lock \
  --config runtime/iskraSpace/supabase/functions/iskra-agent/deno.json \
  runtime/iskraSpace/supabase/functions/iskra-agent/index.ts

cd runtime
npm audit --audit-level moderate
npm run lint:strict
npm test
npm run build
```

## Local verification receipt

Final local run on the refreshed source candidate:

- frozen pnpm install: PASS; `pnpm audit`: 0 known vulnerabilities;
  `pnpm dedupe --check`: PASS;
- legacy runtime `npm ci` and `npm audit`: PASS, 0 vulnerabilities;
- Deno 2.8.3: 21/21 shared boundary/metrics tests PASS; both Edge
  entrypoints typecheck;
- IskraSpace TypeScript and strict ESLint: PASS;
- IskraSpace Vitest: 76 files PASS, 4 skipped; 841 tests PASS, 27 skipped;
- Chromium Playwright: 28/28 PASS;
- IskraSpace production build and bundle budget: PASS; largest JS chunk
  492,244 raw / 162,526 gzip bytes; total JS gzip 500,712 bytes;
- legacy runtime: build and strict lint PASS; 17 files / 265 tests PASS;
- canonical Edge metrics parity: 5 files / 65 tests PASS;
- GraphQL-client, Supabase graph and voice/metrics repository contracts: PASS;
- canon index: current at 3,665 nodes / 20 curated;
- ledger: PASS at 989 tracked files;
- added-line credential-shape scan and `git diff --check`: PASS.
- root `pnpm verify`: PASS, including shard registry, sensitive-status scan,
  workspace typechecks/tests, release-manifest tests and final ledger read-back.

This remains the local verification receipt. The separate staging receipt
proves deployed source and no-upstream acceptance behavior, not a real provider
invocation.

## Promotion gates still required

Completed: exact-source staging, secret-plane configuration, deployed-source
read-back, JWT verification, negative matrix, two-principal RLS/Graph
acceptance, advisor/log review and an immutable staging receipt.

Remaining:

1. Push the follow-up acceptance/dependency commit and require green GitHub
   checks on the exact PR #316 head.
2. Confirm required production secret names without reading or replacing
   provider credential values; set `AI_EDGE_TEST_MODE=false` and the
   staging-proven `cf-connecting-ip` ingress setting.
3. Capture production pre-deploy function hashes, JWT settings, advisors and
   recent logs.
4. Deploy the exact reviewed Edge source, read it back byte-for-byte, and run
   negative-only production smoke tests that cannot invoke a billed provider.
5. Preserve rollback evidence and review production post-deploy logs.

## Residual risk

- Google SDK abort is client-side cancellation; the provider may still charge a
  request already accepted by the service.
- Supabase bills/counts an Edge invocation independently of whether the
  application rejects it before quota/provider egress.
- Browser namespace separation prevents accidental cross-account UI leakage,
  but does not protect against same-origin XSS. CSP, dependency hygiene and
  output encoding remain mandatory.
- The current static content classifier is a narrow boundary, not a complete
  safety system. Crisis-support semantics need dedicated clinical/product
  review before broad public release.
- Staging parity is proved only for the receipt's data-less preview project.
  No claim is made about production source parity, production acceptance or
  real provider success.

## ∆DΩΛ

∆: caller-controlled provider/data ambiguity is replaced with canonical Edge
and principal ownership boundaries.
D: source, tests, dependency locks, ADR-20260728-001, exact-source staging
read-back and acceptance output.
Ω: 0.96 for staging readiness; production remains unverified.
Λ: require green PR-head CI, production secret preflight, exact deployment,
read-back and negative-only smoke before declaring promotion complete.
