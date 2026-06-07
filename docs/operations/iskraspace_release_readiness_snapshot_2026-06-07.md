# iskraSpace Release Readiness Snapshot

Status: PARTIAL / NO LIVE MUTATION
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

## Runtime Dependency Map

Observed from `runtime/iskraSpace/package.json`, `vite.config.ts`, and imports:

- App package: `iskra-space` v0.3.3.
- Local workspace links: `@iskra/runtime` via `file:..`, `iskra-monorepo` via `file:../..`.
- Runtime aliases: `@iskra/runtime`, `@iskra/math`, and `@iskra/core` resolve to local source paths in Vite.
- External runtime services: `@supabase/supabase-js`, `@google/genai`, React 19.
- Supabase session path: `services/supabaseClient.ts` reads `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`, exposes `isSupabaseConfigured`, persists Auth sessions, and can create anonymous Auth sessions unless `VITE_ENABLE_ANONYMOUS_AUTH=false`.
- Gemini path: `services/geminiService.ts` calls `${SUPABASE_URL}/functions/v1/gemini` and uses the Supabase access token path.
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

- `runtime/iskraSpace/supabase/functions/gemini/index.ts` has CORS handling, requires POST, reads `GEMINI_API_KEY` from Edge Function environment, and supports `generateContent`, `streamGenerateContent`, and `embedContent`.
- Live `gemini` function is ACTIVE with `verify_jwt=true`. Connector-read source materially matches the repo-side Gemini proxy shape.
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

Current HEAD `2d1a2f154b5a8563abe2d824d275ce98ba2b8e52` has completed failing check-runs:

- `rmgpgab-iskra-europe-west1-serhiipriadko2-sys-iskra--maraw (artful-striker-476211-h4)` -> failure, <https://github.com/serhiipriadko2-sys/iskra/runs/79907967157>
- `cloudrun-iskra-git-europe-west8-serhiipriadko2-sys-iskra-mcnh (artful-striker-476211-h4)` -> failure, <https://github.com/serhiipriadko2-sys/iskra/runs/79907967125>

Do not mark release gate green until current relevant checks are either passing
or classified as unrelated with a signed release decision.

Working-tree repair note:

- The failing Google Cloud check logs point to Docker build context missing
  `ledger/baselines.json` for `runtime/src/types/guard.ts`.
- The `Dockerfile` now copies `ledger/baselines.json` into the runtime builder
  context and copies root/package source needed by `runtime/iskraSpace` Vite
  aliases.
- Docker verification now has two receipts: the earlier Dockerfile-layout
  simulation, and a real Docker Desktop build on 2026-06-07 with
  `docker build -t iskra-space-release-check:2026-06-07 .`.
- Container smoke also passed: temporary nginx container returned HTTP 200 for
  `/`, response bytes `9762`, and contained the app root div.

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
- Container smoke passed on `http://localhost:18080/`: HTTP 200, bytes `9762`,
  root div present.
- Ledger verification passed: 437 files.

## Release Blockers

- Current GitHub check-runs are red for the baseline commit; the working tree has a Dockerfile repair and local Docker build/smoke proof, but remote confirmation is pending after push.
- Open PR #195 targets `main` from `codex/iskra-release-readiness-plan`. Its observed head before this receipt update, `4da451e415d955fab01f38b757484b66bb347dd0`, had visible checks green (`ingest-stage-checks`, `hash-check`).
- Live `embed` is absent; this remains a blocker only if `apps/iskra-web`/engine retrieval is promoted or if the public release requires the `gemini` + `embed` hybrid.
- Live `iskra-canon-import-diagnostic` remains ACTIVE with `verify_jwt=false`.
- Live `iskra-canon-import-1536` and `iskra-canon-backfill-1536` remain ACTIVE with `verify_jwt=false`.
- Owner/runbook/access/expiry decisions for `db-proxy` and canon import/backfill functions are still required.
- Advisor baseline is only partially refreshed in this pass because available read-only connector tools exposed functions/projects/extensions, not full advisors or migration metadata.
- Credential classification for the removed tracked Supabase status dump remains owner-action-required until every removed value is confirmed local-dev-only or rotated/audited.

## Next Safe Step

Open a focused PR with the local GraphRAG/type/security/docs changes. Do not
apply live Supabase mutation from this PR. The next live-facing PR should carry a
fresh advisor/migration baseline, expected delta, rollback, and explicit approval.
