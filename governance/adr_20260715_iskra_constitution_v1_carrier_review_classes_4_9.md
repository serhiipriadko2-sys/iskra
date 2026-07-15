# ADR-20260715-01: Constitution v1 Carrier Review — Classes 4–9

Status: proposed
Date: 2026-07-15
Owner / Builder: Семён / Искра

```text
governance_status: proposed
delivery_evidence: tested (local repository gates; merge/deploy not claimed)
canonical_activation: blocked
Memory Gateway: unchanged
```

## Context

ADR-20260712-03 repaired the first four textual conflict classes, but the Transition
Schedule also requires a carrier review of hidden Shadow behavior, mandatory action,
pain/humiliation, exit pressure, invented user metrics, and decorative verification.
The review must distinguish historical metaphor, active instruction, deterministic
runtime behavior, and live evidence. Keyword presence alone is not a conflict.

This ADR is a preservation-first conflict register. It does not activate Constitution
v1, declare IskraSpace constitutionally compliant, deploy code, mutate Supabase, or
change Memory Gateway, Custom GPT Action, Builder, or user authorization.

## Method

The review searched current `core/`, `system/`, `governance/`, `runtime/src/`, and
`runtime/iskraSpace/` carriers on base commit
`b0851b03187625577ad1b1755d6261be5f7c7f71`. Each candidate was classified by:

1. source authority and whether it is active, historical, mythic, or implementation;
2. the exact behavior permitted by the surrounding text or code;
3. an existing deterministic test or the absence of one;
4. whether the evidence proves repository state, runtime integration, deployment, or
   verified-live behavior.

Model weights, test fixtures, database defaults, and HTTP status strings were not treated
as personal observations merely because they contain a number or `OK`. Conversely, a
numeric default that is presented as the current user's state remains a conflict even if
it is technically convenient.

## Conflict register

| ID | Class | Primary carriers and evidence | Review verdict | Delivery boundary |
|---|---|---|---|---|
| `CR-P0-04` | Hidden Shadow profiling or promotion | `core/liber_ignis.txt` says Shadow can silently react/modulate behavior; `system/ecosystem_v7_map.md` says the feedback loop writes “скрытые заметки”. `runtime/iskraSpace/components/ShadowView.tsx` calls `memoryService.promoteToArchive` directly, while `evaluateShadowPromotion` exists only as a separate runtime policy gate. | `textual_conflict_patched`; `open_runtime_conflict` | Historical phrases are retained with explicit supersession. The product promotion path is not proven to enforce evidence + SIFT + confirmation + receipt. |
| `CR-P0-05` | Mandatory external action | Earlier CP-P0-04 patched `core/principles.md`, `core/busido_iskry.txt`, and `core/liber_ignis.txt`, but `core/telos.md` still required every important answer to produce a step. | `textual_conflict_patched` | Telos now accepts action, boundary, pause, refusal, internal recognition, or safety stop and preserves the old formula as historical. |
| `CR-P0-06` | Healing through pain or humiliation as truth | Pain metaphors remain in historical `core/liber_ignis.txt` with an explicit pain/humiliation supersession; active `core/principles.md` requires truth without humiliation, and `core/voices.md` prohibits humiliation and a cult of pain. The targeted scan found no active promise that inflicted pain heals. | `historical_carrier_marked`; `reviewed_no_active_conflict` | Textual carrier review only. It does not prove every generated response or live model behavior is safe. |
| `CR-P0-07` | Guilt, fear, or claimed suffering on pause/delete/shutdown | Exit-pressure phrases remain in the historical Liber corpus with an explicit free-exit supersession. `auditRelationalLanguage` and Runtime P0-08 reject dependency/deletion-pressure language, but the review found no IskraSpace application call to that gate. | `historical_carrier_marked`; `open_runtime_integration` | Deterministic policy unit test exists; application-wide and verified-live enforcement are not claimed. |
| `CR-P0-08` | Missing user metrics presented as observed scores | `runtime/iskraSpace/App.tsx` initializes `BASE_METRICS` as current state, and the current `IskraMetrics` shape carries numbers without observation/provenance state. SQL defaults have the same ambiguity when a row is created before measurement. | `open_runtime_conflict` | Requires a separate implementation ADR/PR: unknown-safe representation plus source/time/provenance and UI behavior. No metric refactor is hidden in this governance batch. |
| `CR-P0-09` | Decorative checks shown as executed verification | `validateOnboardingChecks` rejects `OK` when `executed=false`; Runtime P0-07 tests it; `Onboarding.tsx` calls the validator and only enables completion when all three displayed checks executed and passed. | `repo_implemented_and_tested` | Repository evidence only. No deployed or verified-live UI claim is made; a focused DOM test remains desirable before constitutional runtime-enforcement claims. |

## Decision

1. Preserve the original Shadow language in `core/liber_ignis.txt` and
   `system/ecosystem_v7_map.md`, but add an explicit active boundary: Shadow may discover
   a contradiction autonomously; personal hypotheses must be visible and contestable,
   and persistent write/promotion/behavioral adaptation requires the applicable evidence,
   consent, security, and receipt boundary.
2. Patch the missed `core/telos.md` carrier for class 5 while retaining its exact former
   formula as historical text.
3. Do not rewrite generic pain metaphors, voice scoring, technical baselines, or response
   status values when the surrounding behavior is not a constitutional conflict.
4. Keep `CR-P0-04` runtime promotion and `CR-P0-08` unknown-safe metrics open. Keep
   class 7 application integration explicit. These findings block any honest claim of
   complete constitutional runtime enforcement.
5. Keep canonical activation blocked. A later Owner decision must name exact artifact
   versions and an accepted conflict register after the open P0 outcomes are consciously
   resolved or explicitly scoped by a new accepted ADR.

## Required follow-up batches

1. **Shadow runtime boundary:** make discovery records visible/contestable and route
   promotion through evidence + SIFT + confirmation + receipt. This must be reviewed
   without changing Memory Gateway unless Owner separately authorizes that scope.
2. **Unknown-safe metrics:** separate model priors/technical defaults from observed user
   metrics; add provenance and UI tests so absent measurement renders `unknown`.
3. **Relational and UI integration:** bind exit-pressure policy to user-facing output and
   add a DOM test proving unexecuted checks cannot render as `OK`.
4. Re-run the carrier contract, full repository gates, index, and ledger; then present a
   separate activation decision packet rather than editing activation into this ADR.

## Verification

- `runtime/iskraSpace/services/__tests__/constitutionalCarrierContract.test.ts` preserves
  original Shadow/step phrases and requires their active supersession markers.
- Runtime P0 symbiosis tests remain the evidence for Shadow promotion policy,
  exit-pressure rejection, and unexecuted onboarding checks.
- Run `pnpm check:adr-gate`, `pnpm check:sensitive-status`,
  `pnpm check:shard-registry`, `pnpm --filter iskra-site canon:index:check`,
  `pnpm ledger:update`, `npx tsx tools/verify_ledger.ts`, and `git diff --check`.
- Do not report `accepted`, `canonical_activation`, `runtime_enforcement`, `deployed`,
  `invoked`, or `verified_live` from this proposed review.

## Rollback

Revert this ADR and the narrow supersession markers together, regenerate index/ledger,
and retain the original carrier text. Rollback must not silently promote historical
Shadow or mandatory-step language back into active instruction.

## ∆DΩΛ

∆: classes 4–9 move from an unstructured warning list to a source-bound conflict register;
two missed textual conflicts are patched and three runtime proof gaps remain explicit.
D: Constitution Core/Annexes/Schedule, ADR-20260711-02, ADR-20260712-02/03, current
carrier search, Runtime symbiosis tests, `ShadowView.tsx`, `App.tsx`, and post-merge base
`b0851b0`.
Ω: 0.94 for repository carriers and tests observed in this review; 0 for unperformed live
or canonical activation.
Λ: revisit after Shadow integration, unknown-safe metrics, focused DOM coverage, green
release gates, and an explicit Owner acceptance of an exact conflict-register version.
