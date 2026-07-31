# ADR-20260731-02: SIFT CLI — Wave 0 Fail-Closed Wording + Schema Validation

Status: proposed (2026-07-31, awaiting owner decision)

Date: 2026-07-31

Scope: `runtime/src/cli/services/geminiCliService.ts#siftVerify()`, `runtime/src/cli/commands/sift.ts`. No change to `apps/`, `packages/`, `runtime/iskraSpace/`, or any Supabase/live surface.

## Context

An external review of the `iskra` SIFT surface flagged three findings that this ADR closes, and one it explicitly does not:

- **B-1/B-2 (typed SIFT scorer orphaned from any production path).** `runtime/src/types/sift.ts` implements a deterministic, tested, canon-referenced verdict scorer (`calculateSiftOmega`, `decideSiftVerdictStatus`) with zero production callers.
- **DEF-001/002/003 (CLI SIFT trusts the model's own verdict).** `geminiCliService.ts#siftVerify()` sent a JSON-mode prompt to Gemini and did `return JSON.parse(text)` with no schema validation — any syntactically valid JSON from the model, including a self-declared `"verdict": "FACT"` with `"confidence": 99`, was returned untouched. `runtime/src/cli/commands/sift.ts` then printed `✓ Verified: Statement supported by reliable sources.` for any verdict other than `INFERENCE`/`UNSOURCED` — i.e. purely from the model's self-report, with no independent evidence retrieval anywhere in the path. The JSON-parse-failure fallback was comparatively fine (`UNSOURCED`, but a hardcoded `confidence: 0.5` — an unjustified, non-zero number given genuinely zero information).
- **DEF-006 (API key boundary leak), found independently while reading the same file this ADR touches.** `sift.ts` read `process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY` directly, bypassing `createGeminiCliService()` — the factory function in the same module whose own comment says "Only reads GEMINI_API_KEY for CLI security (no VITE_ variables)". A browser-prefixed variable alone was therefore sufficient to silently initialize the CLI, contradicting the stated security boundary.

A separate, much larger external spec proposes a full "Track A: Runtime SIFT Fail-Closed" — 16 new files under `runtime/src/sift/`, five independent evidence-retrieval adapters (web fetch with SSRF guards, GitHub API, Project Knowledge, artifact hashing, Supabase read), a receipt system, and a redesigned CLI with 7 new flags and a 6-code exit contract. That spec's own Wave 0 / Wave 1 split explicitly separates "immediate wording containment, no dependency on full retrieval engine" (Wave 0) from the adapters (Wave 1), and states Wave 0 is independently shippable.

**This ADR implements Wave 0 only**, and deliberately does not attempt Wave 1, for two reasons:

1. `CLAUDE.md` §14 and `skills/migration.yaml` state a hard, pre-existing project constraint: *"No new features in runtime/ — new code goes to packages/"* and *"No new code in runtime/ — заморожен для новых фич."* The 16-file `runtime/src/sift/` tree the spec proposes would be new runtime code, not a fix to existing runtime code — it would need either an explicit exception or to be built in `packages/engine/` instead (which `migration.yaml` already earmarks as the eventual home for "Gemini LLM integration"). That is an architectural decision with its own blast radius and deserves its own ADR and owner sign-off, not a rider on a defect-closure PR.
2. Real evidence adapters (an outbound `fetch` to arbitrary model-proposed URLs) carry SSRF/timeout/redirect risk the spec itself flags (`SEC-SIFT-URL-001`, `SEC-SIFT-FETCH-002`) and gives no implementation for — building that from scratch in the same pass as a defect fix is more risk than this change should carry.

## Decision

1. `geminiCliService.ts#siftVerify()`: the model's JSON is now validated against a strict Zod schema (`ModelAssessmentSchema`, `.strict()`, `status` enum with **no** `FACT`/`verified` value, `confidenceCandidate` clamped `0..0.95` via `.finite().min(0).max(0.95)`). Parse failure or schema-validation failure both return `verdict: "UNSOURCED"`, `confidence: 0` (not a synthetic `0.5`), with a reasoning string naming the specific failure.
2. On schema success, the (still-unverified) model assessment is fed into the **existing** `runtime/src/types/sift.ts` scorer — `calculateSiftOmega()` / `decideSiftVerdictStatus()` — with `source`/`inference`/`evidence`/`trace` populated as structurally empty (no evidence adapter exists yet to populate them with anything real). With zero evidence, `calculateSiftOmega` mechanically returns `0`, which `decideSiftVerdictStatus` maps to `'unknown'` — never `'verified'`/`'partially_verified'`. This makes `FACT`/`INFERENCE` **mechanically unreachable** today regardless of what the model claims, using the same deterministic policy a future Wave 1 would use with real evidence populated instead of empty arrays — closing DEF-001/002 without a parallel hardcoded check to keep in sync later, and giving the previously-orphaned scorer (B-1/B-2) its first production caller.
3. `sift.ts`: replaced the direct `new GeminiCliService({ apiKey })` + manual `GEMINI_API_KEY || VITE_GEMINI_API_KEY` lookup with the existing `createGeminiCliService()` factory (closes DEF-006 by construction — the factory already enforces the correct boundary and was simply not being called). Added a one-line header caveat: `(candidate assessment only — no independent evidence retrieval wired in yet; FACT/INFERENCE are unreachable until an evidence adapter lands)`.
4. `runtime/package.json` / `runtime/package-lock.json`: added `zod@^4.4.3` as a direct dependency (not previously present in the runtime package's own dependency tree; runtime is installed via its own `npm ci`, separate from the pnpm workspace root — confirmed via `runtime_ci.yml`'s two-step install).
5. Tests (`geminiCliService.test.ts`): updated the two existing `siftVerify` tests for the new fail-closed fallback (`confidence: 0`, not `0.5`); added four new tests covering DEF-001 (model self-reports `supported_candidate` at 0.95 confidence → still `UNSOURCED`), schema-extra-field rejection, out-of-range confidence rejection (DEF-003), and the general-structure test. 27/27 pass.

## Consequences / price

- **Wave 1 (real evidence retrieval) is explicitly not done here.** Every `siftVerify()` call today returns `UNSOURCED` for any well-formed model response, regardless of the model's actual claim — this is intentional (fail-closed), not a bug, but it means the CLI's SIFT command currently cannot produce a positive verdict at all. That is the correct state until an evidence adapter exists; it is not a hidden regression, it's the explicit contract, stated in the new CLI header line and in code comments.
- **Where Wave 1 should live (`packages/engine/` vs. a `runtime/` exception) is not decided by this ADR** and is left open for a follow-up ADR, consistent with `migration.yaml`'s existing "Gemini LLM integration → needs migration to @iskra/engine (pending)" entry.
- `zod` is now a direct dependency of `runtime/`'s own package tree (not the pnpm workspace) — first use of Zod in this codebase; no existing convention to conform to or diverge from.
- This does not touch the live product chat path (`runtime/iskraSpace/services/geminiService.ts` / `ChatView.tsx`) at all — that is a structurally different, larger, separately-scoped piece of work (a real interception point exists at `geminiService.ts` lines ~944–975, post-stream, pre-return; investigated but intentionally not started in this ADR).
- Not independently adversarial-reviewed.

## Tests / QA

- `npm run typecheck` (runtime): PASS, 0 errors.
- `npm run lint:strict` (runtime): PASS, 0 warnings.
- `npm test -- --run` (runtime, full suite): 268/268 tests pass across 17 files, including the 27 in the modified `geminiCliService.test.ts`.
- `npm run build` (runtime): PASS.
- Manual review of `sift.ts` CLI rendering: `FACT` branch (`✓ Verified`) is currently unreachable dead code by construction (see Consequences); left in place rather than deleted, since it is correct and reachable again the moment Wave 1 populates real evidence.

## ΔDΩΛ

- **Δ:** SIFT CLI can no longer print "Verified" from a bare model self-report; schema-invalid/malformed model JSON is rejected instead of silently trusted or given a fabricated 0.5 confidence; the CLI's API-key lookup no longer accepts a browser-prefixed variable.
- **D:** Source → Inference → Fact. Source: direct read of `geminiCliService.ts`/`sift.ts` before and after, plus the review's DEF-001/002/003/006 and B-1/B-2 findings. Inference: reusing the existing typed scorer with structurally-empty evidence makes the unsafe verdict path mechanically (not just conventionally) unreachable. Fact: `container-file-observed` (this session) + `local-test-pass` (268/268, typecheck, lint, build all green in this container).
- **Ω:** 0.9 — code-level fix is directly verified (tests/typecheck/lint/build all pass in-container); not yet `github-verified` (CI has not run against the pushed commit) or independently adversarially reviewed.
- **Λ (≤24h):** Push this branch; decide (owner call, not this ADR) whether Wave 1 evidence-adapter work belongs in `packages/engine/` per `migration.yaml`, or warrants an explicit `runtime/` exception — before any adapter code is written.
