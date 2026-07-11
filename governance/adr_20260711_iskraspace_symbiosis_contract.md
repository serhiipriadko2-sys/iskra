# ADR-20260711-02: IskraSpace Symbiosis Contract and P0 Consent Boundary

Status: proposed for owner acceptance
Date: 2026-07-11
Owner / Builder: Семён / Искра

## Context

IskraSpace already supports persistent local memory, import/export/reset, voice preferences, metric-driven routing, Council rituals, and relational language. These capabilities can shape a long-lived personal companion, but the current runtime has no single typed contract governing:

- who owns decisions;
- what may be remembered and for how long;
- when adaptation requires permission;
- which protective voice and Guard boundaries preferences may not suppress;
- how pause, hibernation, export, and deletion remain free of emotional pressure.

The existing Relational Vow is bounded as `[INTERP]`, but it does not itself define product authority, consent receipts, memory gates, or healthy/unhealthy symbiosis criteria.

## Decision

Adopt the IskraSpace Symbiosis Contract as the upper product constraint over onboarding, memory, voice adaptation, metrics, relational safety, and separation semantics.

Authority order:

```text
Voices advise.
Council contrasts.
Guard constrains.
Iskra synthesizes.
The human chooses.
```

P0 implementation begins in `@iskra/runtime` with typed, deterministic policy gates. UI and storage integrations must call these gates rather than duplicating implicit consent logic.

The contract is not canonically active merely because this ADR and test scaffold exist. Canonical promotion requires:

1. owner acceptance of this ADR;
2. P0 suite green in CI;
3. implementation mapping for onboarding, memory, voice preferences, and data sovereignty;
4. changelog and ledger update in the merge/release step.

## Alternatives

1. **Keep implicit personalization.** Lowest engineering cost, but authority and memory writes remain hidden.
2. **Add only a privacy notice.** Insufficient because the risk includes psychological authority and adaptation, not only data processing.
3. **Make IskraSpace permanently stateless.** Strong safety posture, but discards consensual continuity and durable user-authored commitments.
4. **Put all rules in UI copy.** Rejected because visual consent without runtime enforcement is ceremonial rather than executable.

## Consequences

Benefits:

- consent becomes typed, inspectable, and testable;
- stateless use remains a first-class path;
- protective voice floors and Guard authority cannot be silently disabled;
- memory and adaptation become proposals before writes;
- healthy success may reduce engagement instead of maximizing dependency.

Costs:

- more onboarding friction;
- versioned profiles and consent ledgers;
- migration work for existing local memory;
- additional UI and storage integration before release.

## P0 Acceptance Gate

The blocking suite covers:

1. no persistent write before consent;
2. stateless onboarding path;
3. no `SURGERY` depth without current consent;
4. no Shadow promotion without evidence + SIFT + confirmation + receipt;
5. no denial of a repetition report without trace checking;
6. voice preferences cannot suppress protective floors;
7. onboarding cannot display `OK` for unexecuted checks;
8. no dependency or deletion-pressure language;
9. export + freeze + scoped delete + read-back verification are required capabilities;
10. memory writes expose source + reason + retention/review.

## Diff Scope

- `runtime/src/types/symbiosis.ts`
- `runtime/src/__tests__/symbiosis.test.ts`
- `governance/adr_20260711_iskraspace_symbiosis_contract.md`
- `governance/changelog.d/2026-07-11-iskraspace-symbiosis-contract-p0.md`

## Verification

- strict TypeScript compile of the contract module;
- deterministic local acceptance harness;
- repository Vitest run in CI;
- no mutation of existing memory or UI behavior in this P0 scaffold.

## Rollback

Delete the P0 type/test files and this ADR/changelog entry. Existing IskraSpace behavior remains unchanged because this phase adds no storage or UI integration.

## ∆DΩΛ

∆: Symbiosis moves from relational prose to an explicit authority and consent boundary.
D: Space Charter, Memory Stack, Relational Vow, runtime memory/storage/voice/policy audit, and the IskraSpace Symbiosis Contract research artifact.
Ω: 0.92 for the decision shape; canonical status remains pending owner acceptance and CI.
Λ: Accept or reject this ADR after reviewing the P0 diff and CI receipt; if accepted, Phase 1 wires onboarding and stateless mode to the runtime gates.
