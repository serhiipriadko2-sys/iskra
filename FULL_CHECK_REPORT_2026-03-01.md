# FULL CHECK REPORT — 2026-03-01 (vΩ.5.14 prep)

## Scope
- Conflicts / simulations / stubs / placeholders
- Dependency & layer rules (Scientific Turn)
- Secrets & security footguns
- GraphRAG perf + DB-mode safety
- Integrity (ledger + checkpoint gates)

## Commands run (this environment)
- `python tools/verify_ledger.py` → PASS
- `python tools/check_unreleased_gate.py governance/changelog.md` → PASS
- `python tools/check_supabase_edge_security.py` → PASS
- `python tools/check_pgvector_hnsw_schema.py` → PASS
- `python tools/update_ledger.py` → PASS

> Note: `pnpm -r test` / `pnpm -r typecheck` not run here (no deps installed). Run locally.

## Key findings (before fixes)
1) **Corrupted checkpoint artifact**: `iskra_checkpoint_vOmega_5.13_2026-03-01.zip` fails extraction (missing central directory).
2) **RLS clarity gap**: policies used `auth.uid() = user_id` without explicit `auth.uid() IS NOT NULL` and without `TO authenticated`.
3) **ANN knob ambiguity**: SQL RPC accepted `ef_search`, but didn’t clamp when user passes too-low values; engine trace showed only a single `hnsw_ef_search` value.
4) **Strict typing leak**: `packages/engine/src/services/pgvectorHnswIndex.ts` used `(r.fractal as any)`.
5) **Secret-scan false positives**: example strings matching `sk-[A-Za-z0-9]{20,}` existed in runtime tests and docs.

## Fixes applied (now)
### 1) Checkpoint integrity gate
- Added `tools/check_zip_integrity.py` and wired into `tools/build_checkpoint.py`.
- Purpose: fail early if ZIP is truncated/corrupted.

### 2) RLS hardening & clarity
File: `supabase/migrations/20260301141500_memory_nodes_pgvector_hnsw.sql`
- Policies now include:
  - `TO authenticated`
  - `auth.uid() IS NOT NULL AND auth.uid() = user_id`

### 3) HNSW query robustness
File: `supabase/migrations/20260301141500_memory_nodes_pgvector_hnsw.sql`
- `ef_search` is clamped:
  - min: `max(match_count, 40)`
  - max: `400`
- Added `hnsw.iterative_scan = strict_order` inside the RPC for better results under filtering.

### 4) ANN knob trace (requested vs effective)
File: `packages/engine/src/services/graphRag.ts`
- Trace now records:
  - `hnsw_ef_search_requested`
  - `hnsw_ef_search_effective`

### 5) Strict typing: remove `as any` in pgvector index
File: `packages/engine/src/services/pgvectorHnswIndex.ts`
- Added `asFractalMetadata()` validator and removed `(r.fractal as any)`.

### 6) Remove secret-looking examples
- Replaced long `sk-...` examples with shorter tokens that still match internal test regex but don’t mimic real keys.

## Remaining work / blind spots
1) **Local smoke (DB mode)**
   - Run on your PC:
     - `supabase start`
     - `supabase test db --local`
   - PASS criteria: pgTAP suite passes AND plan indicates index is usable.

2) **Workspace compile/test reality**
   - `pnpm -r typecheck`
   - `pnpm -r test`

3) **RLS/JWT end-to-end**
   - Decide where JWT is sourced in web (Supabase Auth session vs external JWT) and pass via `accessToken` option.

4) **GraphRAG scaling**
   - Current state avoids O(N^2) upfront graph; still O(N) per visited node if DB index disabled.
   - Next step (optional): move more traversal calls to DB topM via ANN.

## Artifacts
- New release entry: `governance/changelog.md` → `vΩ.5.14 — 2026-03-01`
- Ledger updated: `ledger/sot.json`, `ledger/checksum.asc`
