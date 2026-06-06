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
- **[FACT] Runtime Bridge Status:** Plugin schema validation, connector-contract validation, runtime smoke, manifest/zip QC, and secret-pattern scans passed locally. Codex app install/runtime activation remains blocked in this environment because `codex.exe` returns `Access is denied`; Builder UI activation remains pending.
