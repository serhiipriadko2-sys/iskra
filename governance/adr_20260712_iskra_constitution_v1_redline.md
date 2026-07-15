# ADR-20260712-01: Iskra Constitution v1 Review Redline

Status: proposed
Date: 2026-07-12
Owner / Builder: Семён / Искра

## Context

The Owner Constitution is a direct declaration of intent. The proposed Iskra Constitution
faithfully carries much of that intent, but it also combines durable invariants, product
contracts, technical mechanisms, and a dated implementation snapshot. Treating the text
as active canon without separation would turn unreviewed interpretation and temporal
facts into permanent rules.

The IskraSpace Symbiosis Contract already has an accepted-pending-integration product ADR.
That ADR does not activate a constitutional layer or prove user-facing runtime enforcement.

## External source provenance

The following local review inputs were observed on 2026-07-12. They are external source
artifacts, not committed repository canon and not proof of current GitHub, Supabase,
Builder, or runtime state.

| Artifact | SHA-256 | Authority in this ADR |
|---|---|---|
| `OWNER CONSTITUTION v1.docx` | `b5e2e4bec44b32891463555f393be3a24751e6e17ed8a66ecb8555fa0f4cb75b` | Primary Owner intent |
| `ISKRA_CONSTITUTION_v1_PROPOSED.md` | `041f7d44f5cb08b22e01b454877804bd8fd4e7b7c103d3c3786991ff501a5502` | Proposed normative candidate |
| `ISKRA_SPACE_SYMBIOSIS_CONTRACT.md` | `0d474e3220ab2bd8ef3a18563d6385787b51c0ae97c36a0ffd65a85ee08126de` | Proposed product contract |
| `ISKRA_SPACE_SYMBIOSIS_RESEARCH.md` | `d0960d2228d53407ecd7800a956ae5a3586c5930d67d3cd11cfe497951901e2b` | Research input |
| constitutional cross-audit text | `f4a01859b6a3dfed8f606d89a611f6bb121bd0da509d2639729026b97e05cdb7` | Review hypothesis, not authority |

## Decision

Create a non-canonical review bundle with:

1. `iskra_constitution_v1_core.md` for durable invariants and source order.
2. `iskra_constitution_v1_annexes.md` for product, memory, lifecycle, capability, and
   research terms.
3. `iskra_constitution_v1_transition_schedule.md` for temporal supersession and
   implementation gates.

The Owner Decision Ledger recorded by this redline is:

| ID | Decision |
|---|---|
| OD-01 | Separate Core, Annexes, and Transition Schedule. |
| OD-02 | Shadow is autonomous in discovery, not in factual assertion, hidden profiling, persistent write, or action. |
| OD-03 | Supportive illusion remains research-only. |
| OD-04 | The selected source ladder is in Core. |
| OD-05 | Core requires a technology-neutral persistent-memory boundary; Memory Gateway remains a frozen implementation concern. |
| OD-06 | Use independent mode, myth-register, and depth vocabularies. |
| OD-07 | Separate governance status from delivery evidence. |
| OD-08 | Deletion means user control with explicit scope, exceptions, and physical-erasure timing. |

This ADR does not activate the Constitution, alter `core/`, change runtime or database
behaviour, modify Memory Gateway, or claim live verification.

## Alternatives

1. Keep the monolithic proposed Constitution. Rejected because temporal implementation
   facts and product design would become constitutional rules.
2. Activate only the Symbiosis Contract. Rejected because it does not resolve the Owner
   intent versus constitutional scope boundary.
3. Remove all detail from governance. Rejected because consent, delivery evidence, and
   traceability would become implicit again.

## Consequences

Benefits:

- Owner intent, new approved norms, product obligations, and temporal work are visible
  as different layers.
- Existing ADR-20260711-02 remains the authority for the Symbiosis P0 scaffold.
- Future runtime work has explicit acceptance gates without a false activation claim.

Costs and risks:

- More documents must remain aligned.
- The legal deletion/retention detail needs separate review before it becomes a public
  promise.
- The proposed source ladder and vocabulary require a conflict-patch pass over existing
  canon carriers before activation.

## Tests/QA

- Validate that every Core norm has a trace to Owner intent, existing SoT, an accepted ADR,
  or an explicit Owner Decision Ledger entry.
- Check that Core contains no dated runtime status, SHA, merge claim, or deployment claim.
- Check terminology has no overlapping `LEAN` semantics.
- Run ADR gate, sensitive-status check, ledger update, ledger verification, and diff
  whitespace checks.

## Rollback

Supersede or remove this review bundle and update the ledger. Because this changes only
governance documents, it has no runtime, memory, Supabase, Builder, or Action rollback.

## ∆DΩΛ

∆: a monolithic constitutional candidate is replaced by a reviewable three-layer redline.
D: Owner Constitution, Proposed Constitution, Symbiosis Contract, cross-audit, current
SoT, and ADR-20260711-02.
Ω: 0.92 for documentation and decision trace; activation and live enforcement are not
claimed.
Λ: revisit after conflict patches, constitutional ADR acceptance, and separately evidenced
runtime gates.
