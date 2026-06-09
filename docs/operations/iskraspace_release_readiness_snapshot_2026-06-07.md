# iskraSpace Release Readiness Snapshot

Status: PARTIAL / CLOUD RUN GREEN / VERCEL OPTIONAL / NO LIVE MUTATION
Captured: 2026-06-07T11:06:25+03:00
Scope: public release gate for `runtime/iskraSpace`
Branch: `codex/iskra-release-readiness-plan`
Baseline commit: `2d1a2f154b5a8563abe2d824d275ce98ba2b8e52`

## Summary

`runtime/iskraSpace` remains the public release target. Local repository work can
move forward, but the release gate is not green until GitHub checks and live
Supabase drift are closed or explicitly accepted. This snapshot separates the
direct `runtime/iskraSpace` `gemini` path from the repo-side `embed` retrieval
path used by engine/web surfaces.

2026-06-08 repo-source update: the `gemini` Edge Function source now acts as a
dual-provider AI gateway with Gemini as default and OpenAI as an optional
provider. The live Supabase baseline in this snapshot has not been mutated or
re-smoked for OpenAI yet.

## Runtime Dependency Map

Observed from `runtime/iskraSpace/package.json`, `vite.config.ts`, and imports:

- App package: `iskra-space` v0.3.3.
- Local workspace links: `@iskra/runtime` via `file:..`, `iskra-monorepo` via `file:../..`.
- Runtime aliases: `@iskra/runtime`, `@iskra/math`, and `@iskra/core` resolve to local source paths in Vite.
- External runtime services: `@supabase/supabase-js`, `@google/genai`, React 19.
- Supabase session path: `services/supabaseClient.ts` reads `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`, exposes `isSupabaseConfigured`, persists Auth sessions, and can create anonymous Auth sessions unless `VITE_ENABLE_ANONYMOUS_AUTH=false`.
- AI gateway path: `services/geminiService.ts` calls `${SUPABASE_URL}/functions/v1/gemini` by default, uses the Supabase access token path, and can select `gemini`, `openai`, or `auto` through client-safe provider routing.
- Embedding path in `runtime/iskraSpace`: `geminiService.ts` sends `embedContent` through the `gemini` function.
- Repo-side `embed` path outside `runtime/iskraSpace`: `packages/engine/src/services/edgeEmbeddings.ts` and `apps/iskra-web/src/engineInstance.ts` use the Supabase `embed` function.
- PWA path: `index.html` registers `public/service-worker.js`; the service worker excludes Gemini/Supabase/network API paths from cache.

## Fresh Supabase Read-Only Baseline

Project:

- `AgiIskra / typcvaszcfdpkzbjzuur`
- Region: `eu-west-1`
- Status: `ACTIVE_HEALTHY`
- Database: Postgres `17.6.1.063`

Live Edge Functions observed on 2026-06-07:

| Function | Live status | Live `verify_jwt` | Release classification |
| --- | --- | --- | --- |
| `gemini` | ACTIVE | true | release-required |
| `db-proxy` | ACTIVE | true | internal/support |
| `iskra-canon-import-1536` | ACTIVE | false | internal/support; release blocker until owner/access/expiry or removal |
| `iskra-canon-backfill-1536` | ACTIVE | false | internal/support; release blocker until owner/access/expiry or removal |
| `iskra-canon-import-diagnostic` | ACTIVE | false | retire before public release or ADR exception |
| `embed` | not present in live function list | n/a | repo-required for engine/web retrieval paths; not a direct `runtime/iskraSpace` blocker when the public app uses only `gemini` `embedContent` |

Repo-side function posture:

- `runtime/iskraSpace/supabase/functions/gemini/index.ts` has CORS handling, requires POST, keeps provider keys server-side, routes Gemini/OpenAI providers, and supports `generateContent`, `streamGenerateContent`, and `embedContent`.
- Live `gemini` function is ACTIVE with `verify_jwt=true`. The 2026-06-07 connector-read source materially matched the older Gemini-only proxy shape; the 2026-06-08 dual-provider repo source still requires live/staging deploy proof before it can be treated as live behavior.
- `supabase/functions/embed/index.ts` requires an Authorization bearer header, has CORS handling, has optional per-worker rate limiting via `EMBED_RL_WINDOW_MS` and `EMBED_RL_MAX`, and `supabase/config.toml` pins `[functions.embed] verify_jwt = true`.
- `embed` is not deployed in the fresh live function list; the companion boundary decision documents that this is a blocker only if engine/web retrieval is promoted into the public path.
- Repo-side `runtime/iskraSpace/supabase/functions/kain/index.ts` exists, but no app caller or live deployment was observed in this snapshot.

Installed extensions with release relevance:

- `vector` installed in `extensions`.
- `pg_graphql` installed in `graphql`.
- `pg_trgm` installed in `public`; this remains a hardening decision item from the Supabase runbook.
- `pg_net` installed in `extensions`; keep tied to reviewed import/backfill usage.
- `supabase_vault` installed in `vault`.

## Current GitHub Check Status

2026-06-08 update:

- PR #196 is merged into `main` at
  `e8236ace454aacdabb50cdfaa54b674971f88954`.
- Current checks on `e8236ac` show `Build and Test`, `Build Docker Image`, both
  Google Cloud / Cloud Run checks, `ingest-stage-checks`, and `hash-check`
  completed successfully.
- `Deploy to Vercel` failed because the job received empty Vercel credentials:
  no `VERCEL_TOKEN`, no `VERCEL_ORG_ID`, and no `VERCEL_PROJECT_ID`.
- Cloud Run is now the mandatory production deploy contour for release gate
  purposes.
- Vercel is optional/manual until credentials are configured and explicitly
  reintroduced as mandatory.

2026-06-08 PR #198 update:

- PR #198 is merged into `main` at `7784811`.
- Post-merge checks on `7784811` show `Build Docker Image`, `e2e`, `Deploy to
  GitHub Pages`, `Build iskraSpace`, `Build and Test`, `build-and-test`,
  `hash-check`, `ingest-stage-checks`, and both Google Cloud / Cloud Run checks
  completed successfully.
- `Deploy to Vercel` completed `skipped`, matching the optional/manual deploy
  boundary.
- The dual-provider AI gateway is now repo/main verified, but the OpenAI path
  is not live Supabase behavior until Edge Function secrets are configured,
  deployment is explicitly approved, and generation/stream/embed smoke passes.

2026-06-09 PR #201 update:

- PR #201 is merged into `main` at `7015422`.
- The Gemini embedding path is verified after live Supabase `gemini` Edge
  Function version `5`: the response uses `provider=gemini`, returns
  `embedding.values`, has exactly `1536` numeric dimensions, and tolerates stale
  frontend-style `model: text-embedding-004` requests through the function.
- SoT integrity is green after ledger updates for
  `runtime/iskraSpace/supabase/functions/gemini/index.ts` and
  `tools/projects_stack_templates/RETRIEVAL_EVAL.md`.
- Post-merge checks on `7015422` show Vercel skipped and Docker, e2e, GitHub
  Pages, iskraSpace, Build and Test, hash, ingest, and both Cloud Run checks
  succeeded.
- OpenAI live behavior remains unverified and must not be claimed as release
  ready until separate provider smoke passes.
- Fresh read-only Supabase baseline:
  `docs/operations/iskraspace_supabase_readonly_baseline_2026-06-09.md`.

2026-06-09 PR #202 and cleanup approval update:

- PR #202 is merged into `main` at `169b16b790e4e2c7130b4bf2ef2176515ee43cbc`.
- Observed post-merge checks on `169b16b` show `hash-check`,
  `ingest-stage-checks`, and both Google Cloud / Cloud Run checks succeeded.
- The cleanup execution boundary is now explicit in
  `docs/operations/iskraspace_supabase_cleanup_approval_packet_2026-06-09.md`.
- No live Supabase mutation has occurred in this packet.
- Supabase advisors are now available through the connector and are summarized
  as hardening work separate from first Edge Function cleanup.

Post-merge update on 2026-06-07:

- PR #195 is merged.
- Local `HEAD` and `origin/main` both point at merge commit
  `17056d685864428b2134c4dde630b296090410fd`.
- Public GitHub checks on that merge commit show `ingest-stage-checks` and
  `hash-check` succeeded.
- The two Google Cloud checks still failed on deploy:
  - `rmgpgab-iskra-europe-west1-serhiipriadko2-sys-iskra--maraw (artful-striker-476211-h4)`.
  - `cloudrun-iskra-git-europe-west8-serhiipriadko2-sys-iskra-mcnh (artful-striker-476211-h4)`.
- Their public summaries show build/push succeeded and deploy failed.

Do not mark release gate green until current relevant checks are either passing
or classified as unrelated with a signed release decision.

Working-tree repair note:

- The older Google Cloud build-context failure was repaired by copying
  `ledger/baselines.json` and root/package sources into the Docker build stages.
- The post-merge Google Cloud failure moved to deploy-stage, not build-stage.
- The current branch repairs the likely Cloud Run port contract mismatch by
  moving nginx, Docker healthcheck, and `EXPOSE` from port `80` to port `8080`.
- Official Cloud Run docs state the ingress container must listen on the request
  port, defaulting to `8080`.
- Local Docker verification passed with
  `docker build -t iskra-space-cloudrun-port-check:2026-06-07 .`.
- Container smoke passed on host port `18082` mapped to container port `8080`:
  `/` returned HTTP 200, bytes `9762`, root div present; `/health` returned
  `healthy`.

## Local Gates In This PR

Required before handoff:

- `py tools/check_no_sensitive_status_dumps.py`
- `py tools/check_supabase_edge_security.py`
- `py tools/check_unreleased_gate.py governance/changelog.md`
- `pnpm --filter @iskra/engine test src/__tests__/graphRag.test.ts src/__tests__/graphRag_hnsw_mode.test.ts`
- `pnpm --filter @iskra/core test`
- `pnpm --filter @iskra/math test`
- `pnpm --dir runtime/iskraSpace run typecheck`
- `pnpm --dir runtime/iskraSpace run lint`
- `pnpm --dir runtime/iskraSpace run test:run`
- `pnpm --dir runtime/iskraSpace run build` with no release-signoff warnings
- `npx playwright test --project=chromium` from `runtime/iskraSpace`
- `npx tsx tools/verify_ledger.ts`
- `py tools/check_no_src_imports.py`
- Docker build and container smoke

Final local result in this implementation pass:

- Sensitive-status, Supabase Edge security, unreleased gate, and no-deep-src
  import checks passed.
- Focused GraphRAG regression tests passed: 3/3.
- `@iskra/core` tests passed: 2/2.
- `@iskra/math` tests passed: 53/53.
- `runtime` build passed.
- `runtime/iskraSpace` typecheck passed.
- `runtime/iskraSpace` lint passed with existing 90 warnings and 0 errors.
- `runtime/iskraSpace` unit tests passed: 629 passed, 3 skipped.
- `runtime/iskraSpace` build passed without the previous CSS syntax,
  mixed-import, or >500 kB chunk warnings.
- Chromium Playwright E2E passed: 27/27.
- Docker build passed with tag `iskra-space-release-check:2026-06-07`.
- Post-merge Cloud Run port repair Docker build passed with tag
  `iskra-space-cloudrun-port-check:2026-06-07`.
- Container smoke passed on `http://localhost:18082/`: HTTP 200, bytes `9762`,
  root div present, `/health` returned `healthy`, container port `8080`.
- Ledger verification passed: 437 files.

## Release Blockers

- Cloud Run deploy checks are green on merge commit `e8236ace454aacdabb50cdfaa54b674971f88954`.
- Vercel is no longer a mandatory release gate; it remains optional/manual until `VERCEL_TOKEN`, `VERCEL_ORG_ID`, and `VERCEL_PROJECT_ID` are configured.
- Live `embed` is absent; this remains a blocker only if `apps/iskra-web`/engine retrieval is promoted or if the public release requires the `gemini` + `embed` hybrid.
- Live `iskra-canon-import-diagnostic` remains ACTIVE with `verify_jwt=false`.
- Live `iskra-canon-import-1536` and `iskra-canon-backfill-1536` remain ACTIVE with `verify_jwt=false`.
- Owner/runbook/access/expiry decisions for `db-proxy` and canon import/backfill functions are still required.
- Supabase advisors are available as of the 2026-06-09 cleanup approval packet; they add database hardening work but do not replace the first Edge Function cleanup.
- Credential classification for the removed tracked Supabase status dump remains owner-action-required until every removed value is confirmed local-dev-only or rotated/audited.

## Next Safe Step

Request explicit owner approval for removing
`iskra-canon-import-diagnostic` from live Supabase, execute with Dashboard/CLI or
a delete-capable connector, then attach the before/after function list. Do not
claim OpenAI support as live-verified until the separate provider smoke passes.
