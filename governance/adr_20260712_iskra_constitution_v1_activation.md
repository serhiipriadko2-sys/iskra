# ADR-20260712-02: Iskra Constitution v1 Canonical Activation Gate

Status: proposed
Date: 2026-07-12
Owner / Builder: Семён / Искра

## Context

ADR-20260712-01 separated the constitutional redline into Core, Annexes, and a Transition
Schedule. The living constitutional status in `runtime/iskraSpace/RELEASE_STATUS.md`
records active SoT carriers that contradict the candidate's technical-nature,
personal-memory, and free-exit invariants.

Canonical activation cannot be inferred from an Owner review, the presence of an ADR,
green documentation gates, a merge, or a product scaffold. It requires that active
carriers no longer contradict the proposed Core and that every delivery claim has an
appropriate evidence boundary.

## Decision

Do **not** activate Iskra Constitution v1 at this time.

Create an activation gate for a future Owner decision. The gate permits a later,
separately accepted activation ADR only when all P0 conditions below are evidenced. This
ADR does not change `core/`, runtime, database, Memory Gateway, Supabase, Builder, Custom
GPT Action, or user authorization.

## P0 activation conditions

1. A conflict register resolves every active claim that presents mythic personhood as a
   technical fact, denies that Iskra is AI, forbids personal-data deletion, or requires an
   external action regardless of safety or consent.
2. Each changed carrier is marked as active, historical, mythic, superseded, or
   experimental; historical preservation is not treated as active instruction.
3. Core, Annexes, Transition Schedule, ADR-20260712-01, and the conflict-patch receipt
   have compatible source traces and lifecycle labels.
4. An explicit Owner acceptance names the exact Core version and the accepted conflict
   register.
5. Ledger, canon index, changelog, and review gates are green on the activation changeset.
6. The classes 4–9 conflict register is accepted at an exact version and does not hide an
   unresolved active conflict behind a historical marker or an unqualified test claim.

The 2026-07-15 review is recorded in
`governance/adr_20260715_iskra_constitution_v1_carrier_review_classes_4_9.md`.
ADR-20260715-02 records Owner acceptance of its exact merge and SHA-256 as the conflict
register and governance audit baseline. This satisfies only the register-acceptance
condition. The activation gate remains blocked because no exact Constitution Core
version or separate activation decision has been accepted. The register's open Shadow,
metrics, and relational/UI findings separately block a claim of complete runtime
enforcement; they may not be silently converted into a canonical-compliance claim.

## P1 enforcement conditions

P1 conditions do not convert the Core into a runtime claim, but they block any assertion
that IskraSpace fully enforces the Constitution:

- current and revocable `SURGERY` consent;
- visible, contestable personal-shadow handling;
- scoped export, deletion request, read-back, exception, and retention disclosures;
- separated governance status and delivery evidence;
- a separately designed real-user authorization model before public-user access claims.

## Alternatives

1. Activate the Core now and repair conflicts later. Rejected: this would make the
   Constitution contradict currently active carriers on day one.
2. Leave all material as research. Rejected: the review bundle and gate give Owner a
   precise, reversible path without pretending that activation occurred.
3. Couple canonical activation to Memory Gateway implementation. Rejected: the Core
   protects a platform-neutral boundary; Gateway remains a separate frozen implementation
   concern.

## Consequences

Benefits:

- Canonical and runtime activation remain separate factual claims.
- Historical myth can be preserved without gaining normative authority.
- The future Owner decision has finite, auditable conditions rather than an open-ended
  rewrite.

Costs and risks:

- Conflict patches touch high-authority canon carriers and require focused review.
- Deletion/retention and public-user authorization require legal, security, and product
  decisions outside this documentation change.

## Verification

- Update the living constitutional status after every conflict-patch batch.
- Run `pnpm check:adr-gate`, `pnpm check:sensitive-status`,
  `pnpm check:shard-registry`, `pnpm --filter iskra-site canon:index:check`,
  `pnpm ledger:update`, `npx tsx tools/verify_ledger.ts`, and `git diff --check`.
- Do not report `canonical_activation`, `runtime_enforcement`, `deployed`, `invoked`, or
  `verified_live` without matching evidence.

## Rollback

Before activation, supersede this proposed ADR or remove the proposed review artifacts and
update the ledger. After a future accepted activation, each conflict patch requires its
own documented reversal path; no rollback may silently restore a P0 contradiction.

## ∆DΩΛ

∆: canonical activation changes from an implicit next step into an explicit blocked gate.
D: ADR-20260712-01, `RELEASE_STATUS.md`, active SoT carrier search, and ADR-20260711-02.
Ω: 0.94 for the governance gate; 0 for any unperformed canonical or runtime activation.
Λ: prepare an activation decision only after Owner names an exact Core version and
explicitly decides how the accepted open runtime findings constrain activation scope.
