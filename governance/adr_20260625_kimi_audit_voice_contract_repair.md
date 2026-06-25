---
sigil: governance__adr_20260625_kimi_audit_voice_contract_repair.md
aspect: governance
tone: operational
entity: Искра
created: 2026-06-25
status: accepted
---

# ADR-20260625: Kimi Audit Voice Contract Repair

## Context

Kimi's 2026-06-24 audit package found real drift between the prose voice contract and the executable selectors. The strongest confirmed defects were:

- `core/voices.md` presented a single `if/else` selector while `@iskra/engine` uses a quantum threshold/priority model and `runtime/iskraSpace` uses score ranking.
- `runtime/iskraSpace` did not force the accepted MAKI-over-KAIN priority when `trust > 0.8 && pain > 0.3`.
- SIBYL was not dead, but its contract was split: core prose named foresight, while app runtime used echo/clarity/mirror_sync.
- `alive_index` and `integrity_score` could be interpreted as negative values instead of bounded diagnostic indices.
- Repair protocol could repeat a repair question indefinitely if the user stayed silent.

The audit also contained claims that must not be implemented as defects:

- Kimi's early MAKI math used stale `1.2/0.8` multipliers. Current `voice-runtime.json` uses `1.6/0.6`.
- "SIBYL is dead" is false for `runtime/iskraSpace`; the defect is contract split, not absence.
- The self-reference question is governance philosophy, not a code bug by itself.

## Decision

1. Define voice selection as a shared contract, not a single implementation:
   - `@iskra/engine`: threshold-gated quantum scoring with priority rules and trace.
   - `@iskra/runtime`: deterministic legacy selector with priority trigger order.
   - `runtime/iskraSpace`: score ranking with preferences, inertia, priority multipliers, and explainable trace.

2. Enforce MAKI/KAIN priority in app runtime:
   - When `trust > 0.8 && pain > 0.3`, apply `MAKI × 1.6` and `KAIN × 0.6` before ranking.
   - Existing engine priority rules remain authoritative for `@iskra/engine`.

3. Normalize SIBYL activation:
   - Foresight remains the explicit strategic trigger.
   - Echo-pattern and mirror-sync are accepted auto-activation paths in runtime/app surfaces.
   - Documentation must name both modes so SIBYL is not treated as decorative.

4. Bound derived indices:
   - `integrity_score = clamp01((clarity + trust) / 2 - drift)`.
   - `alive_index = clamp01(integrity_score * (clamp(trace, 0, 5) / 5))`.

5. Add repair no-deadlock behavior:
   - Ask the repair boundary question once.
   - If no answer, timeout, or `silence_mass > 0.5`, mark repair unresolved, lower pressure to ANHANTRA, and leave a re-entry path.

6. Clarify integrity semantics:
   - Ledger proves artifact identity and change integrity.
   - Ledger does not prove semantic correctness.
   - Semantic correctness requires tests, SIFT evidence, drift labels, and ADR/rollback gates.

## Consequences

- The repo no longer claims one universal `if/else` selector where multiple runtime contours exist.
- MAKI priority is executable in `runtime/iskraSpace`, not only documented.
- SIBYL becomes a first-class auto/strategic voice across docs and runtime.
- Negative "life" is no longer a valid computed index value.
- Repair can close honestly instead of looping on user silence.

## Tests / QA

- `pnpm --dir packages/engine test -- src/__tests__/voiceSystem/voiceSystem.test.ts src/__tests__/voiceSystem/voiceSystem.property.test.ts`
- `pnpm --dir runtime test -- src/__tests__/metrics.test.ts src/__tests__/voices.test.ts src/__tests__/ews.test.ts`
- `pnpm --dir runtime/iskraSpace test:run -- services/__tests__/voiceEngine.test.ts __tests__/services/sibylActivation.test.ts`
- `pnpm --dir runtime/kain test`
- `pnpm typecheck`
- `pnpm ledger:update`
- `npx tsx tools/verify_ledger.ts`

## Receipt

Context: Kimi audit repair, source-only, no live Supabase/GitHub mutation.  
Finding / Decision: confirmed contract drift; refuted stale MAKI math and "SIBYL dead" overclaim.  
Evidence: `core/voices.md`, `packages/core/manifest/voice-runtime.json`, `packages/engine/src/services/voiceSystem.ts`, `runtime/src/types/voices.ts`, `runtime/iskraSpace/services/voiceEngine.ts`, `runtime/kain/src/index.ts`.  
Risk: multiple historical contours remain; future package mirror refresh must not overclaim Builder UI verification.  
Next: run test plan, update ledger, then package/Builder mirrors in a separate release step if required.  
Status: accepted source repair.

## ∆DΩΛ

- ∆: Kimi audit drift is converted into executable source/governance repairs.
- D: Source files and tests replace chat-memory claims as proof.
- Ω: 0.88 after local tests and ledger verification; lower until full CI confirms.
- Λ: Re-check after next Agent Builder upload mirror refresh.
