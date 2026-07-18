# Project Memory: Iskra Space

## Core Operational Facts
- **Canon Level:** Iskra Canon v7 (revL compliant).
- **Core Architecture:** 4-layer monoreposystem (types `@iskra/core` -> functional math `@iskra/math` -> cognitive state engine `@iskra/engine` -> projection frontends `apps/iskra-web` & `runtime/iskraSpace`).
- **Supabase Integration:** Local postgres instance at `127.0.0.1:54321` backing GraphRAG memory nodes (`graph_nodes`) and edges (`graph_edges`).
- **Verification Suites:** 629 unit tests covering metrics, voice synapses, RAG pipelines, and security boundaries.

## Mathematical Constraints
- **Higuchi Fractal Dimension (D_chaos):** Trigger reset (SHATTER or PHOENIX ritual) when complexity indicator $D \ge 1.6$.
- **Hurst Exponent (H_trust):** DFA window measures long-range temporal correlations. Trust is persistent if $H \ge 0.6$.
- **Shannon Entropy (H_shannon):** Monitored over incoming content stream to detect repetition (LOOP, $H < 2.0$) or chaos (CHAOS, $H > 5.0$).

## Active Integrations & Credentials
- Anonymous authentication is secured in `supabaseClient.ts` through JWT tokens issued via Auth session.
- Gemini proxy runs on Supabase Edge Function to prevent API key exposure to frontend clients.

## Agent Builder Assembly
- **[FACT] 2026-06-06:** `dist/agent-builder/iskra-full-canon-builder-2026-06-06-v4/` is the materialized local upload tree for the Iskra ChatGPT / OpenAI Agent Builder package. It merges the full-canon Dreamspace v2 source layer and the toolchain upload-set v2 source layer, includes repository `governance/` and root `SECURITY.md`, with conflict originals preserved under `provenance/`.
- **[FACT] Verification:** Local lossless mapping, manifest, zip integrity, and obvious-secret scans passed. Builder UI activation is still pending user upload and prompt-level verification.
- **[FACT] 2026-06-06 Runtime Toolchain:** `plugins/iskra-toolchain-bridge/` is the repository source for the Codex/Agent runtime bridge. The v4 Builder mirror carries the same plugin under `dist/agent-builder/iskra-full-canon-builder-2026-06-06-v4/plugins/iskra-toolchain-bridge/`.
- **[FACT] Runtime Bridge Scope:** The bridge includes connector contracts for GitHub, Supabase, web/browser, secrets vault, Agent Builder, artifact manager, schedule runner, and monitoring; vault-safe git clone helpers; runtime smoke validation; and a Codex skill entrypoint.
- **[FACT] Runtime Bridge Status:** Plugin schema validation, connector-contract validation, runtime smoke, manifest/zip QC, and secret-pattern scans passed locally. `C:\Users\gabra\.codex\config.toml` exposes `iskra-toolchain-bridge@iskra-local`, and live read paths passed for GitHub, Supabase, and Opera browser. Codex app load remains pending because `codex.exe` returns `Access is denied`; Builder UI activation remains pending.
- **[FACT] Runtime Hardening Gate:** v4 includes `agent_files/evals/BUILDER_RUNTIME_HARDENING_PROMPTS.md` with release-blocking prompts for local filesystem truth, secret safety, credential Git URL rejection, GitHub-before-web discipline, browser page text handling, and Builder upload boundary.

## 2026-06-07 Release Gate Facts
- **[FACT] Public release target remains `runtime/iskraSpace`; root README and AGENTS now point at Agent Builder package `dist/agent-builder/iskra-full-canon-builder-2026-06-06-v4/`, while Builder UI verification remains pending.**
- **[FACT] Current-tree raw Supabase status dump was removed and replaced by a redacted template plus `tools/check_no_sensitive_status_dumps.py`; historical credential classification remains open until the owner confirms local-only values or rotates/audits non-local values.**
- **[FACT] Fresh Supabase read-only baseline lists live `gemini`, `db-proxy`, `iskra-canon-import-1536`, `iskra-canon-backfill-1536`, and `iskra-canon-import-diagnostic`; repo-side `embed` exists but is absent from the live function list. `docs/operations/iskraspace_supabase_live_boundary_decision_2026-06-07.md` separates direct `runtime/iskraSpace` `gemini embedContent` from engine/web `embed` retrieval.**
- **[FACT] Baseline GitHub check-runs for `2d1a2f154b5a8563abe2d824d275ce98ba2b8e52` include two completed Google Cloud failures; Dockerfile repair now has local Docker Desktop build and container smoke proof, but remote confirmation is pending after push.**
- **[FACT] Local gates for this implementation pass are green: sensitive-status, Supabase Edge security, unreleased gate, no deep src imports, focused GraphRAG tests, core/math tests, runtime build, iskraSpace typecheck/lint/unit/build/Chromium E2E, Dockerfile-layout simulation, real Docker build/smoke, ledger verification, and `git diff --check`. App build warnings were resolved locally with static Supabase imports, Tailwind scanner-safe timestamp formatting, and Vite manual chunks.**
- **[FACT] Branch `codex/iskra-release-readiness-plan` is pushed with open PR #195 targeting `main`; public GitHub API showed observed head `4da451e415d955fab01f38b757484b66bb347dd0` and visible checks `ingest-stage-checks` and `hash-check` completed success before the receipt update. Prior PR #194 is closed.**
- **[FACT] PR #195 is now merged; local `HEAD` and `origin/main` match merge commit `17056d685864428b2134c4dde630b296090410fd`. Public GitHub checks on the merge commit are partial: `ingest-stage-checks` and `hash-check` succeeded, but two Google Cloud checks failed at deploy stage. Current branch `codex/iskra-post-merge-supabase-baseline` repairs the likely Cloud Run port contract mismatch by moving nginx/Docker healthcheck/EXPOSE/docker-compose to container port `8080`; local Docker build and smoke on `8080` passed.**
- **[FACT] Refreshed Supabase connector baseline on 2026-06-07 confirmed `embed` is not live, `gemini` and `db-proxy` are live with `verify_jwt=true`, and `iskra-canon-import-1536`, `iskra-canon-backfill-1536`, and `iskra-canon-import-diagnostic` are live with `verify_jwt=false`. Diagnostic source posture reports env-presence checks without a method/auth gate; no secret values were stored.**

## 2026-06-08 Release Gate Facts
- **[FACT] PR #196 is merged into `main` at `e8236ace454aacdabb50cdfaa54b674971f88954`; Cloud Run checks are green on that commit.**
- **[FACT] `Deploy to Vercel` failed because Vercel credentials were empty in the GitHub Actions job, not because the app build failed. Cloud Run is the mandatory production deploy contour; Vercel is optional/manual until secrets are configured.**
- **[FACT] Supabase live cleanup remains separate and approval-gated: diagnostic/support functions must be removed, protected, or accepted by time-boxed ADR before public release sign-off.**
- **[FACT] `runtime/iskraSpace` repo source now supports a dual-provider AI gateway: Gemini remains default, OpenAI is optional through the same Supabase Edge Function boundary, and provider keys remain server-side. Live Supabase deploy/smoke is still pending explicit approval.**
- **[FACT] PR #198 is merged into `main` at `7784811`; post-merge checks are green for repo/build/e2e/Cloud Run/GitHub Pages/hash/ingest, and Vercel is skipped as optional/manual.**
- **[FACT] PR #201 is merged into `main` at `7015422`; Gemini embedding live smoke is verified for `embedding.values.length === 1536`, stale `text-embedding-004` requests are handled through the Edge Function, and SoT ledger integrity is green. OpenAI live provider smoke remains unverified.**
- **[FACT] 2026-06-09 Supabase read-only baseline confirms live `gemini` version `5` with `verify_jwt=true`, dual-provider source posture, `gemini-embedding-001`, normalized `embedding.values`, and `outputDimensionality=1536`; `db-proxy` remains JWT-protected, while canon import/backfill/diagnostic functions remain live with `verify_jwt=false`.**
- **[FACT] PR #202 is merged into `main` at `169b16b`; observed post-merge release-relevant checks are green (`hash-check`, `ingest-stage-checks`, both Cloud Run checks).**
- **[FACT] `docs/operations/iskraspace_supabase_cleanup_approval_packet_2026-06-09.md` prepares live Supabase cleanup without mutation: remove `iskra-canon-import-diagnostic` first, retire/protect or ADR-exempt import/backfill, and keep `db-proxy` under owner/caller/allowlist/disable-policy review. Explicit approval remains required before any live deletion.**

## 2026-07-18 Full Audit Baseline

### GitHub State
- **[FACT] main HEAD:** `f8a45ca` ≡ `origin/main`. Working tree clean, 0 uncommitted changes.
- **[FACT] Latest merged PRs:** #270 (production-hardening + Bounded Guard + RLS), #274 (conflict resolve), #262 (evaluation release), #273 (audit reconciliation).
- **[FACT] Open release-gate issues:** #200 (dual-provider smoke), #192 (Supabase cleanup), #190 (provenance + advisors), #168 (PWA salvage, blocked).
- **[FACT] Branch count:** 34 local, ~115 remote. Most `codex/*` and `copilot/*` branches are merged/stale.

### Supabase Live State (`AgiIskra / typcvaszcfdpkzbjzuur`)
- **[FACT] 8 Edge Functions, ALL `verify_jwt=true`:** `gemini v9`, `embed v3`, `iskra-agent v4`, `iskra-memory-gateway v4`, `kain v2`, `db-proxy v6`, `iskra-canon-import-1536 v7` (410 stub), `iskra-canon-backfill-1536 v7` (410 stub).
- **[FACT] `iskra-canon-import-diagnostic` is absent from live function list.** Retired per ADR.
- **[FACT] 12 public tables, ALL RLS enabled.** Total rows: 14 (9 graph_nodes, 2 chat_history, 1 metrics_snapshots, 1 memory_nodes, 1 graph_edges).
- **[FACT] Additional schemas:** `iskra.*` (canon/RAG), `iskra_memory.*` (memory gateway, 10 tables with RLS but no policies), `private.*` (beta access, 2 tables with RLS but no policies).
- **[FACT] 32 applied migrations.** Migration `20260717183002_supabase_acl_and_graph_contract_hardening.sql` exists in repo but IS NOT APPLIED to live.
- **[FACT] Pending migration fixes:** revoke anon EXECUTE on 3 SECURITY DEFINER functions, fix search_path on 2 iskra_memory functions, disable GraphQL introspection. Header marks it "source-only" until staging verification.

### Security Advisors
- **[FACT] CRITICAL:** 3 `SECURITY DEFINER` functions callable by `anon` via PostgREST: `consume_ai_quota(text)`, `resolve_beta_access()`, `prevent_graph_node_cross_owner_cascade()`. All fixed by pending migration.
- **[FACT] WARN:** 2 mutable search_path functions (`iskra_memory.*`), 1 extension in public (`pg_trgm`), 10 GraphQL authenticated table exposures, 12 authenticated SECURITY DEFINER function exposures.
- **[FACT] INFO:** 13 tables with RLS enabled but no policies (`iskra_memory.*`, `private.*`).

### Performance Advisors
- **[FACT] WARN:** 18 RLS policies with auth initplan re-evaluation (wrap `auth.uid()` in `(select ...)`), 10+ multiple permissive policies on `audit_log`/`graph_nodes`/`graph_edges`.
- **[FACT] INFO:** ~35 unused indexes (mostly `iskra.canon_*` and `public.graph_*`), 4 unindexed foreign keys (`iskra_memory.*`, `private.*`).

### Source Provenance Map
- **[FACT] `gemini` source:** `runtime/iskraSpace/supabase/functions/gemini/index.ts` (15.5KB). Not in canonical `supabase/functions/`.
- **[FACT] `iskra-agent` source:** `runtime/iskraSpace/supabase/functions/iskra-agent/index.ts` (7.3KB). Not in canonical `supabase/functions/`.
- **[FACT] `kain` source:** `runtime/iskraSpace/supabase/functions/kain/index.ts` (7KB). Also `runtime/kain/` package. Not in canonical `supabase/functions/`.
- **[FACT] `embed` source:** `supabase/functions/embed/index.ts` (3.5KB). Canonical location.
- **[FACT] `iskra-memory-gateway` source:** `supabase/functions/iskra-memory-gateway/` (handler.ts 7KB + manifest.json + README). Canonical location.
- **[FACT] `db-proxy` source:** NO SOURCE IN REPO. Decision memo at `docs/security/db_proxy_decision_v1.md` says "do not keep in current form." Live function v6 exists without repo provenance.

### Constitution
- **[FACT] `governance/iskra_constitution_v1_core.md` (8.5KB), annexes, transition schedule, and carrier review ADRs exist.** Constitution governance framework accepted.

