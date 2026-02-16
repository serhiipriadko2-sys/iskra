# Migration Guide: Runtime to Engine

> **Objective:** Move functionality from `runtime/iskraSpace` to `packages/engine` without breaking the "Soul".

---

## 1. Migrating GraphService

### Context
`GraphService` in `runtime` handles GraphRAG (memory retrieval). It uses Supabase RPC calls.

### Steps
1. **Copy Code:** Copy `runtime/iskraSpace/services/graphServiceSupabase.ts` to `packages/engine/src/services/graph.ts`.
2. **Update Types:**
   - Replace local types with `@iskra/core` imports.
   - Ensure `Database` type (generated from Supabase) is available in `packages/engine`.
3. **Refactor Error Handling:** Use `@iskra/core` error types instead of throwing raw errors.
4. **Test:** Write an integration test using `msw` to mock Supabase calls.

---

## 2. Replacing VoiceEngine

### Context
`VoiceEngine` in `runtime` uses heuristics (`if pain > 0.3`). The new system uses `VoiceQuantumField`.

### Steps
1. **Analyze Weights:** Map legacy weights (e.g., KAIN responds to Pain) to Quantum Amplitudes.
   - *Legacy:* `score = pain * 2`
   - *Quantum:* `amplitude = pain; phase = chaos * PI`
2. **Implement Bridge:** Create an adapter in `packages/engine` that accepts legacy metrics and outputs a Quantum State.
3. **Verify Resonance:** Run simulations to ensure KAIN still appears when Pain is high (Soul Integrity).

---

## 3. General Rules
- **No New Heuristics:** Do not add `if/else` logic for behavior. Use math.
- **Strict Typing:** All data flowing in/out must be typed via `@iskra/core`.
- **Tests First:** Do not migrate a service without writing a test for it in `packages/engine`.
