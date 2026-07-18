# ADR-20260717-02: RESEARCH as a non-sovereign router capability

Status: proposed review artifact — implementation tested; this ADR is not a canonical-activation decision.

## Context

SoT30 v5.5.1 preserves nine Voices and Mythic Router v0.3.1. A research-oriented
route must improve evidence work without becoming a tenth Voice or an unreviewed
authority path.

## Decision

`RESEARCH` is a typed router capability, represented by `ResearchTrace` in
`@iskra/core`. It is OFF by default. When enabled, its trace requires:

- a question;
- at least one evidence gap;
- typed `[HYP]` and/or `[INTERP]` candidates;
- provenance and a verification route for every candidate.

The capability is structurally unable to select a Voice, change fact status,
change permission, or perform a persistent write. Those actions remain behind
their respective authorized boundaries.

## Consequences

- The nine-voice manifest and Mythic Router v0.3.1 remain unchanged.
- `RESEARCH` output is a reviewable candidate trace, not a decision, receipt,
  permission, memory write, or canonical fact.
- The frozen SoT30 v5.5.1 package is not rewritten by this ADR. A future source
  package revision needs its own package integrity receipt and Owner decision.

## Verification

`packages/core/src/__tests__/researchCapability.test.ts` asserts OFF semantics,
required evidence/provenance/verification fields, non-sovereignty, and the
nine-voice boundary.

## Non-goals

This changeset does not activate Constitution v1, change runtime routing,
change `iskra-memory-gateway`, invoke a Custom GPT Action, write Supabase data,
or deploy a service.

## ∆DΩΛ

∆: Research is an explicit, typed evidence capability rather than an implicit
tenth voice or authority path.

D: SoT30 v5.5.1 Router/Mythic Router material; `@iskra/core` voice manifest and
the accompanying contract test.

Ω: 0.90 for the repository type boundary; lower for any future runtime adoption
until a separately reviewed integration exists.

Λ: Revisit before adding a runtime router consumer, changing the nine-voice
manifest, or proposing a SoT30 package revision.
