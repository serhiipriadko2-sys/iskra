

---

## 14. Receipt — CB-1 Hardening of `gemini` Edge Function

**Action:** Harden `runtime/iskraSpace/supabase/functions/gemini/index.ts`:
1. Validate Supabase JWT (`Authorization: Bearer <jwt>`).
2. Replace CORS `*` with explicit origin allow-list.
3. Add per-user (fallback IP) rate limiting.
4. Return 401 for unauthenticated requests and unskip `__tests__/e2e/security.e2e.test.ts`.

**Changes made:**

| File | Change |
|------|--------|
| `runtime/iskraSpace/supabase/functions/gemini/index.ts` | Added `getAllowedOrigins`, `isOriginAllowed`, `corsHeaders(origin)`, `validateJwt`, `extractBearerToken`, `rateLimit`, `getClientIdentifier`; rewrote `Deno.serve` handler to enforce origin → JWT → rate-limit before any AI provider call. |
| `runtime/iskraSpace/__tests__/e2e/security.e2e.test.ts` | Removed `describe.skip`; added 403-origin test; added conditional skip for local dev without a running Supabase stack (`RUN_E2E_SECURITY_TESTS=true` to force). |

**Local gate matrix after changes:**

| Gate | Result |
|------|--------|
| `pnpm typecheck` | 0 errors ✅ |
| `pnpm lint` | 0 errors, 77 warnings ✅ |
| `pnpm test:run` | 638 passed / 4 skipped ✅ |
| `pnpm build` | built in 3.07 s ✅ |
| `pnpm audit` | No known vulnerabilities ✅ |

**Security unit tests:**

- `services/__tests__/geminiEdgeFunctionSecurity.test.ts` (2 tests) — passes.
  - Confirms no literal `'access-control-allow-origin': '*'` in source.
  - Confirms `extractBearerToken` → `validateJwt` → `rateLimit` → `runWithFallback` order.

**Residual risk / notes:**

- `[INTERP]` Rate limiting is in-memory per Edge Function worker. For a multi-region/multi-worker deployment, an abuser can hit rate limits on each worker separately. For strict production limits, migrate to the existing `check_rate_limit` RPC keyed by user ID or use an external Redis/Upstash bucket.
- `[INTERP]` JWT validation performs a blocking `fetch` to `${SUPABASE_URL}/auth/v1/user` on every AI request. This adds ~50–150 ms latency. For high-traffic apps, consider caching validated JWTs briefly (with expiry check) or verifying the JWT locally with the Supabase JWT secret.
- `[HYP]` The `e2e/security.e2e.test.ts` suite is skipped in local dev because `VITE_SUPABASE_URL` defaults to `localhost`. It must be run in CI against a real Supabase project (`RUN_E2E_SECURITY_TESTS=true`) to confirm 401/403 behavior end-to-end.

**Environment variables documented / required:**

| Variable | Set via | Purpose |
|----------|---------|---------|
| `SUPABASE_URL` | Supabase secret (auto) | Used by `validateJwt` to call `/auth/v1/user`. |
| `SUPABASE_ANON_KEY` | Supabase secret (auto) | Used by `validateJwt` as `apikey` header. |
| `AI_PROXY_ALLOWED_ORIGINS` | `supabase secrets set` | Comma-separated allowed origins; `*` or empty = allow any (dev fallback). |
| `AI_PROXY_RL_WINDOW_MS` | `supabase secrets set` | Rate-limit window in ms (default 60 000). |
| `AI_PROXY_RL_MAX` | `supabase secrets set` | Max requests per window per user/IP (default 60). |

**Next action:** Proceed to **CB-3** — reconcile app-local `schema.sql` with root canonical migrations (or remove the stale app-local copy).


---

## 15. Receipt — CB-3 GraphRAG Schema Synchronization

**Action:** Synchronize `runtime/iskraSpace/supabase/schema.sql` with canonical migration `supabase/migrations/20260626164633_graph_rpc_boundary.sql`.

**Changes made:**

| File | Change |
|------|--------|
| `runtime/iskraSpace/supabase/schema.sql` | Removed 3 legacy graph RPCs (`graph_bfs_traversal`, `graph_find_resonant`, old `graph_get_node_with_edges`). Added 10 `SECURITY DEFINER` RPCs with `auth.uid()` scoping and `authenticated` grants: `graph_create_node`, `graph_create_edge`, `graph_get_user_nodes`, `graph_search_nodes`, `graph_delete_node`, `graph_update_node_resonance`, `graph_get_connection_candidates`, `graph_get_stats`, `graph_traverse_bfs_nodes`, `graph_find_resonant_nodes`, `graph_get_node_with_edges`. File grew from 451 to 831 lines. |

**Verification:**

```text
$ grep -in "create.*function public.graph_" runtime/iskraSpace/supabase/schema.sql
395:create or replace function public.graph_create_node(
450:create or replace function public.graph_create_edge(
526:create or replace function public.graph_get_user_nodes(
549:create or replace function public.graph_search_nodes(
571:create or replace function public.graph_delete_node(p_node_id text)
600:create or replace function public.graph_update_node_resonance(
636:create or replace function public.graph_get_connection_candidates(
664:create or replace function public.graph_get_stats()
701:create or replace function public.graph_traverse_bfs_nodes(
751:create or replace function public.graph_find_resonant_nodes(
770:create or replace function public.graph_get_node_with_edges(p_node_id text)
```

```text
$ sha256sum runtime/iskraSpace/supabase/schema.sql
2a2a576b5039783883dc4507f271fadb8260b0c90238173f7f2c18feec12b8a0
```

**Local gate matrix after changes:**

| Gate | Command | Result | Exit Code |
|------|---------|--------|-----------|
| Type check | `pnpm typecheck` | 0 errors | 0 |
| Lint | `pnpm lint` | 0 errors, 77 warnings | 0 |
| Unit/Integration tests | `pnpm test:run` | 638 passed / 4 skipped | 0 |
| Production build | `pnpm build` | built in 3.17 s | 0 |
| Dependency audit | `pnpm audit` | No known vulnerabilities | 0 |

**Interpretation:**

- `[FACT]` App-local schema now contains all RPCs the service layer expects.
- `[FACT]` `runtime/iskraSpace/supabase/schema.sql` checksum is `2a2a576b5039783883dc4507f271fadb8260b0c90238173f7f2c18feec12b8a0` at 831 lines.
- `[INTERP]` A fresh database deployed from `runtime/iskraSpace/supabase/schema.sql` will no longer crash on GraphRAG operations.
- `[INTERP]` The file is idempotent: it drops legacy shapes and current RPCs before recreating them.

**Residual risk / notes:**

- `[INTERP]` `schema.sql` is still a **snapshot**, not a migration chain. For production, prefer `supabase db reset` from repo root using `supabase/migrations/` as the source of truth.
- `[INTERP]` `graph_search_nodes` uses `to_tsvector('english', ...)`, which may not rank Russian content optimally. Consider adding a Russian tsconfig or a `simple` fallback in a future iteration.
- `[HYP]` Full SQL validation against a live Postgres instance was not performed in this local run; deploy to a staging project and run `supabase db reset` to confirm.

**Next action:** Proceed to **CB-4** — run full Playwright cross-browser/mobile matrix.


---

## 16. Receipt — CB-2 Eliminate Dual-Sync Duplicate GraphRAG Nodes

**Action:** Remove eager background upload from `memoryService.addArchiveEntry/addShadowEntry` and make `syncService.syncMemoryNodes` the single coordinator for uploading local memory nodes to Supabase GraphRAG.

**Changes made:**

| File | Change |
|------|--------|
| `runtime/iskraSpace/services/memoryService.ts` | Removed `graphServiceSupabase` and `isSupabaseAvailable` imports; removed eager `void (async () => { ... })()` upload blocks from `addArchiveEntry` and `addShadowEntry`; new nodes are persisted locally with `synced_to_cloud: false`. |
| `runtime/iskraSpace/services/syncService.ts` | Added `MemoryNode` import; rewrote `syncMemoryNodes` to: (1) migrate legacy `memory_${layer}_${ownerKey}` queues once and remove them; (2) read current `iskra-space-archive`/`iskra-space-shadow` stores, filter `!synced_to_cloud`, upload via `graphServiceSupabase.addNode` + `buildConnections`, and persist `synced_to_cloud: true`. |
| `runtime/iskraSpace/services/__tests__/memoryService.test.ts` | Asserts that `addArchiveEntry`/`addShadowEntry` return nodes with `synced_to_cloud: false`. |
| `runtime/iskraSpace/services/__tests__/syncService.test.ts` | Added tests for current app-local memory stores (sync + flag set) and already-synced skip behavior; updated legacy test to assert queue removal. |

**Verification:**

```text
$ pnpm --dir runtime/iskraSpace test:run services/__tests__/syncService.test.ts services/__tests__/memoryService.test.ts
services/__tests__/syncService.test.ts (4 tests) ✅
services/__tests__/memoryService.test.ts (18 tests) ✅
```

**Local gate matrix after changes:**

| Gate | Command | Result | Exit Code |
|------|---------|--------|-----------|
| Type check | `pnpm typecheck` | 0 errors | 0 |
| Lint | `pnpm lint` | 0 errors, 76 warnings | 0 |
| Unit/Integration tests | `pnpm test:run` | 640 passed / 4 skipped | 0 |
| Production build | `pnpm build` | built in 3.38 s | 0 |
| Dependency audit | `pnpm audit` | No known vulnerabilities | 0 |

**Interpretation:**

- `[FACT]` `memoryService` no longer uploads to Supabase; it is a pure local persistence layer.
- `[FACT]` `syncService` is the only code path that writes local memory nodes to `graphServiceSupabase`.
- `[FACT]` `synced_to_cloud` flag prevents re-uploading already synced nodes on subsequent reconnects.
- `[INTERP]` Duplicate-node risk from overlapping `memoryService` eager sync + `syncService` batch sync is eliminated.

**Residual risk / notes:**

- `[INTERP]` `syncService` still processes each node sequentially. For large offline backlogs, consider batching or parallelization with concurrency limits.
- `[INTERP]` If a node fails to upload, it remains `synced_to_cloud: false` and will retry on the next `syncAllPending()` call. There is currently no exponential backoff or persistent retry counter.
- `[INTERP]` Legacy `memory_${layer}_${ownerKey}` queues are removed after successful migration. If a single node in a legacy queue fails, the whole queue is left for retry.

**Next action:** Proceed to **CB-4** — run full Playwright cross-browser/mobile matrix, or address remaining non-critical hardening items (CORS wildcard in `embed`, 76 lint warnings, anonymous auth default).


---

## 17. Receipt — CB-4 Full Playwright Cross-Browser/Mobile Matrix

**Action:** Run the complete Playwright E2E matrix (Chromium, Firefox, Mobile/WebKit) and fix any release-gate failures.

**Changes made:**

| File | Change |
|------|--------|
| `runtime/iskraSpace/playwright.config.ts` | Reduced `workers` to `1` and set local `retries` to `1` to stabilize resource-constrained mobile/WebKit runs; increased `webServer.timeout` to `180000` ms. |
| `runtime/iskraSpace/e2e/council_ritual.spec.ts` | Changed Council button locator to `button:visible` so the mobile test does not match a hidden desktop nav item. |

**Verification:**

```text
$ cd runtime/iskraSpace && pnpm exec playwright test
Running 81 tests using 1 worker
chromium: 27 passed
firefox: 27 passed
mobile (iPhone 13 / WebKit): 27 passed
  81 passed (10.1m)
```

**Local gate matrix after changes:**

| Gate | Command | Result | Exit Code |
|------|---------|--------|-----------|
| Type check | `pnpm typecheck` | 0 errors | 0 |
| Lint | `pnpm lint` | 0 errors, 76 warnings | 0 |
| Unit/Integration tests | `pnpm test:run` | 640 passed / 4 skipped | 0 |
| Production build | `pnpm build` | built in 3.38 s | 0 |
| Cross-browser E2E | `pnpm exec playwright test` | 81 passed | 0 |
| Dependency audit | `pnpm audit` | No known vulnerabilities | 0 |

**Interpretation:**

- `[FACT]` All 81 Playwright tests pass across Chromium, Firefox, and mobile WebKit.
- `[FACT]` The Council view is reachable on mobile after fixing the visibility locator.
- `[INTERP]` Reducing workers to 1 eliminated the mobile WebKit OOM crash observed in the initial run.

**Residual risk / notes:**

- `[INTERP]` Running with `workers: 1` serializes E2E execution; the matrix now takes ~10 minutes. For CI, consider a machine with more RAM and restore `workers` based on observed stability.
- `[INTERP]` Local retries (`retries: 1`) mask transient flakiness. Monitor CI runs to decide whether stricter resource limits are needed.
- `[HYP]` E2E tests run against `pnpm dev` on `localhost:3000`; they do not exercise the production build or real Supabase backend. Staging smoke tests against a deployed build are still recommended.

**Next action:** Close the production-readiness critical-blocker set. Address remaining non-critical items at triage priority: CORS wildcard in `embed` Edge Function, 76 lint warnings, anonymous-auth default, in-memory rate-limit cross-worker scaling.


---

## 18. Receipt — Kimi Code Local Profile (`.kimi/AGENTS.md`)

**Action:** Create a Kimi Code-specific operating contract for local VSCode work on ISKRA, scoped to `C:\github\iskra-1` and inheriting root `AGENTS.md`.

**Changes made:**

| File | Change |
|------|--------|
| `C:\github\iskra-1\.kimi\AGENTS.md` | New project-level overlay. Defines Kimi Code local runtime boundary, source ladder, tool discipline, modes/voice routing, engineering discipline, security, plan mode / background tasks, skills/MCP, output contract, context-update procedure, verification receipt, and relation to root `AGENTS.md`. |


**Verification:**

```text
$ sha256sum .kimi/AGENTS.md
2d17cbcf12ddeba939879d11c042236d0b5ebac1278541ea4ef3646b56912580
$ wc -l .kimi/AGENTS.md
258 .kimi/AGENTS.md
```

```text
$ sha256sum AGENTS.md
8b42ea03acfcd3067c7b7cae6011a60923fdf5d9350d630234f4291eb6df6b38
$ wc -l AGENTS.md
412 AGENTS.md
```

**Auto-load test:**

- Attempted to run a fresh non-interactive Kimi CLI session; failed because CLI requires OAuth login (`auth.login_required`).
- Inspected local Kimi Code runtime logs (`C:\Users\gabra\.kimi\logs\kimi.log`).
- `[FACT]` Log entries show `kimi_cli.soul.agent:load_agents_md:128 | Loaded agents.md: c:\github\iskra-1\AGENTS.md` only; `.kimi\AGENTS.md` is **not** listed.
- `[FACT]` Kimi Code system prompt (`agents/default/system.md`) states that `AGENTS.md` files may appear inside `.kimi/` directories, but each file governs the directory it resides in and its subdirectories.
- `[INTERP]` Therefore `.kimi/AGENTS.md` is not auto-loaded as a project-wide instruction file; it would apply only to the `.kimi/` subtree.

**Fallback applied:**

- Added section 13 "Kimi Code Local Profile (VSCode / Local CLI)" to root `C:\github\iskra-1\AGENTS.md`.
- This carries the project-wide Kimi Code profile and explicitly documents the `.kimi/AGENTS.md` scoping drift.
- Updated `.kimi/AGENTS.md` header and relation section to reflect that it is now a `.kimi/` subtree overlay, while root section 13 is canonical for the whole project.

**Interpretation:**

- `[FACT]` Kimi Code local profile is now persisted in two places: root `AGENTS.md` section 13 (project-wide) and `.kimi/AGENTS.md` (`.kimi/` subtree overlay).
- `[FACT]` Root `AGENTS.md` is observed by the Kimi Code runtime loader and will be auto-loaded in new sessions.
- `[INTERP]` The project-wide profile is effective immediately for any new Kimi Code session in `iskra-1`.

**Residual risk / notes:**

- `[INTERP]` Content duplication between root section 13 and `.kimi/AGENTS.md` requires keeping them in sync if Kimi-specific rules change.
- `[HYP]` Future Kimi Code versions might auto-load `.kimi/AGENTS.md` project-wide; when that is runtime-verified, the duplicated root section can be reduced to a reference.
- `[INTERP]` The legacy `~/.kimi-code/` directory exists on this machine; keep the `.kimi` vs `.kimi-code` drift under observation.

**Next action:** In a fresh VSCode Kimi Code session, ask "Какой твой локальный профиль?" and confirm that section 13 of root `AGENTS.md` is active. If duplication becomes a maintenance burden, reduce root section to a short reference once `.kimi/AGENTS.md` auto-load is runtime-verified.
