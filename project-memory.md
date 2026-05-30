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
