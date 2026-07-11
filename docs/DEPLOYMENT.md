# IskraSpace deployment contract

> Status: closed-beta release contract
> Updated: 2026-07-11

## Canonical production surface

The only production release surface is the Docker image published by
`.github/workflows/production_deploy.yml` to GHCR. The image serves the static
IskraSpace bundle through the repository `nginx.conf` on port `8080`.

Vercel, GitHub Pages, Netlify and other static hosts are preview surfaces. They
must not be described as production until they have the same headers,
environment validation and smoke gates as the canonical Docker path. The
optional Vercel job creates a preview deployment and never uses `--prod`.

## Toolchain and clean build

The repository has two dependency trees:

- the root pnpm workspace, locked by `pnpm-lock.yaml`;
- the legacy runtime npm tree, locked by `runtime/package-lock.json`.

From a clean checkout:

```bash
pnpm install --frozen-lockfile
cd runtime && npm ci --ignore-scripts && npm run build && cd ..
pnpm --filter iskra-space typecheck
pnpm --filter iskra-space lint -- --max-warnings 0
pnpm --filter iskra-space test:run
pnpm --filter iskra-space test:run
pnpm --filter iskra-space build
pnpm --filter iskra-space check:bundle-budget
```

Vitest is pinned to the `threads` pool with at most two workers in
`runtime/iskraSpace/vite.config.ts` to keep the gate stable on constrained
runners.

## Closed-beta environment

Client-visible values are limited to the Supabase URL and publishable/legacy
anon key. Production keeps anonymous auth disabled. Never place provider keys,
service-role credentials, webhook secrets or HMAC values in a `VITE_*`
variable.

The canonical image is environment-neutral. At container startup the validated
entrypoint creates a no-cache `runtime-config.js`; it refuses to start without
`VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`, and rejects service-role
credentials. Start from these name-only examples:

- `runtime/iskraSpace/.env.production.example` for container runtime values;
- `supabase/.env.example` for Edge Function secret names.

The release receipt records environment key names only, never values.

Before staging acceptance, configure the Supabase magic-link redirect allowlist
for the exact beta URL and provision invited permanent users. The browser
`AuthGate` is a UX boundary; Edge Functions and database functions still enforce
active membership for direct HTTP/RPC callers.

## SQL and live Supabase boundary

The ordered root `supabase/migrations/` chain is the only production SQL source.
`runtime/iskraSpace/supabase/schema.sql` and archived GraphRAG SQL are
deprecated snapshots and must not be pasted into the Dashboard or applied with
psql.

Repository checks:

```bash
pnpm check:supabase-graph-contract:repo
pnpm check:supabase-voice-metrics-contract:repo
npx tsx tools/verify_ledger.ts
```

These checks prove repository consistency only. They do not prove live DDL,
deployed Edge Function bodies or migration parity. Applying migrations to
project `typcvaszcfdpkzbjzuur` remains a separate live operation requiring the
approved reconciliation, backup and rollback packet plus explicit approval.

## Release gates

The GHCR publish job waits for all of the following:

- legacy runtime build/lint/tests;
- IskraSpace typecheck and zero-warning lint;
- two consecutive resource-bounded unit-test runs;
- Deno content-policy tests and Edge source checks;
- pnpm and runtime npm audits;
- Graph and voice/metrics repository contracts;
- ledger integrity;
- Chromium E2E;
- production build;
- bundle-size budget;
- Docker `/health`, CSP, no wildcard CORS header and SPA-route smoke checks.

The resulting artifact contains the commit SHA, immutable image digest,
name-only environment inventory, gate list, byte size and SHA-256 of the
receipt. A green source workflow does not prove Supabase live parity.

## Local Docker smoke

```bash
docker build -t iskraspace:local .
docker run --rm -p 8080:8080 \
  -e VITE_SUPABASE_URL=https://smoke.supabase.co \
  -e VITE_SUPABASE_ANON_KEY=smoke-public-anon-key \
  iskraspace:local
curl --fail http://127.0.0.1:8080/health
curl --head http://127.0.0.1:8080/
```

Expected: `/health` returns `healthy`; the root response includes
`Content-Security-Policy`; `/runtime-config.js` is marked no-cache; a deep
route returns the SPA shell. Replace smoke values at deployment time. The URL
must be an official `https://*.supabase.co` endpoint; the key is browser-public
but must never be a service-role key.

## Observability and privacy

Sentry/PostHog are disabled until the user enables each switch in Settings.
Provider SDKs are loaded only after consent. Session replay is disabled and
event boundaries remove journal/chat bodies, prompts, request data, bearer
tokens, raw IP addresses and auth identifiers. Only official `posthog.com` and
`sentry.io` endpoints are accepted. Alerting should use status/outcome codes for
AI `401`, `429`, `5xx`, RLS denial and sync failure.

## Rollback

1. Select the last receipt-backed GHCR digest.
2. Redeploy that immutable digest; do not rely on a mutable `latest` tag.
3. If database behavior changed, execute only the reviewed rollback or
   forward-repair procedure from the migration approval packet.
4. Record the incident and verification result without copying secrets or user
   content.
