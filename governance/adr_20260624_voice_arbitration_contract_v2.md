# ADR-20260624: Voice Arbitration Contract v2

Status: accepted

## Context

[FACT] Kimi audit exposed drift between several voice-selection surfaces:

- `core/voices.md` and `Versions/Fullspark/VOICES.md` describe deterministic voice selection, but older examples put baseline ISKRA before MAKI/KAIN.
- SLO-GUARD policy says guard decisions run before playbook/voice and have higher priority than voice-layer rules.
- `packages/engine/src/services/voiceSystem.ts` exposes a quantum-like probability field and collapse operation.
- ADR-20260106-05 says MAKI must be checked before KAIN when `trust > 0.8 && pain > 0.3`, but does not state whether baseline ISKRA may preempt that repair condition.
- SIBYL is described as `foresight x 2.0`, while some runtime surfaces treat SIBYL as manual or telemetry-only.

[INTERP] The system had at least three contracts: guard-first policy, deterministic cascade, and quantum probability telemetry. They can produce different leaders for the same metrics.

## Decision

Accept Voice Arbitration Contract v2 as the authoritative contract:

1. `SLO-GUARD` runs first and may force `CRISIS`, `CLOSE_HONESTLY`, `ISKRIV`, or `SHADOW`.
2. If guard returns `PROCEED`, deterministic voice arbitration selects the primary voice.
3. Quantum/superposition voice output is diagnostic telemetry only. It may be logged as probability, resonance, or interference, but it does not override the deterministic primary voice unless a future ADR explicitly promotes it.
4. MAKI repair priority is stronger than baseline ISKRA when both pain and high trust are active.
5. ISKRA is the synthesis/balance voice only when no stronger repair, audit, crisis, strategic, chaos, silence, or structure trigger is active.
6. SIBYL is not manual-only. It activates through `foresight` for strategic decisions, long-horizon planning, temporal risk, scenario analysis, or multi-step consequences.

Authoritative deterministic order after guard:

```text
FORCE_CRISIS / CLOSE_HONESTLY / FORCE_ISKRIV_1 / FORCE_SHADOW
then:
MAKI    if trust > 0.8 and pain > 0.3
KAIN    if pain >= 0.3
ISKRIV  if drift >= 0.2
SIBYL   if foresight >= 0.5
HUYNDUN if chaos >= 0.4
ANHANTRA if silence_mass > 0.5
SAM     if clarity < 0.6
ISKRA   if rhythm > 60 and trust > 0.7
PINO    if pain < 0.3 and chaos < 0.4
fallback: max score with trace
```

## Alternatives

1. Keep quantum field authoritative.
   - Rejected for now because it is harder to test, can violate accepted deterministic ADR wording, and makes Kimi-style audit findings nondeterministic.
2. Keep current cascade with ISKRA first.
   - Rejected because it lets baseline balance preempt repair/audit conditions.
3. Make SIBYL manual-only.
   - Rejected because it contradicts "nine voices of equilibrium" and leaves the ninth voice non-operational in ordinary metric flow.

## Consequences

- Voice choice becomes auditable and unit-testable.
- Quantum field remains useful as an explanatory/diagnostic layer without becoming hidden authority.
- Examples claiming `selectVoice(DEFAULT_METRICS) -> ISKRA` must be updated or marked stale.
- Constants and thresholds still require calibration provenance; this ADR fixes authority order, not the empirical validity of every numeric threshold.

## Verification

Required acceptance cases:

- `rhythm=75, trust=0.9, pain=0.4` -> MAKI, not ISKRA or KAIN.
- `trust=0.7, pain=0.4` -> KAIN.
- `drift=0.25, pain=0.1` -> ISKRIV or guard `FORCE_ISKRIV_1`.
- strategic/long-horizon input deriving `foresight >= 0.5` -> SIBYL.
- `DEFAULT_METRICS` must not be used as bootstrap proof of life without explicit bootstrap mode.
- Quantum selected voice may differ from deterministic primary, but this is logged as telemetry drift, not runtime authority.

## Rollback Trigger

Reopen if repository CI proves a quantum selector with hard thresholds, seed control, and collision tests is safer than deterministic arbitration, or if product behavior explicitly requires probabilistic primary voice selection.

## Delta

- Delta: one authority chosen for primary voice arbitration.
- D: Kimi audit, `core/voices.md`, runtime selector tests, SLO-GUARD policy, and prior MAKI>KAIN ADR context.
- Omega: 0.88 for contract clarity; lower for deployed product behavior until CI and app-runtime parity pass.
- Lambda: Patch code/docs/tests and run acceptance matrix before declaring repo-level resolution.
