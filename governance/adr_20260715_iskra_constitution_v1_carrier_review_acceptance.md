# ADR-20260715-02: Owner Acceptance of Constitution v1 Carrier Review Classes 4–9

Status: accepted
Date: 2026-07-15
Owner / Builder: Семён / Искра

```text
governance_status: accepted
delivery_evidence: implemented (governance receipt in this changeset)
accepted_register_delivery: merged
canonical_activation: blocked
runtime_enforcement: partial / not verified live
Memory Gateway: unchanged
```

## Context

ADR-20260715-01 was authored as a proposed preservation-first conflict register and
merged through PR #256. Canonical activation requires an explicit Owner decision that
names the exact accepted artifact rather than inferring acceptance from a merge, green
tests, or discussion context.

The accepted content-addressed register is:

```text
artifact: governance/adr_20260715_iskra_constitution_v1_carrier_review_classes_4_9.md
merge: ba662eabf1076e940cdbb07f3912dfb732fb881e
sha256: 10227394fee0ff0eaf24d79ac75dfcb4646c1f251c6be1c0a7a2aa405e8e4d79
```

The embedded `Status: proposed` in that immutable artifact describes its authored state
at the accepted merge. This acceptance receipt advances the governance status of that
exact version without rewriting it and invalidating its content hash.

## Owner decision

The Owner stated:

> Принимаю ADR-20260715-01 / merge
> `ba662eabf1076e940cdbb07f3912dfb732fb881e` / SHA-256
> `10227394fee0ff0eaf24d79ac75dfcb4646c1f251c6be1c0a7a2aa405e8e4d79` как conflict
> register и governance audit baseline. Это не canonical activation и не
> runtime-enforcement claim.

## Decision

1. Accept the exact ADR-20260715-01 artifact above as the Constitution v1 classes 4–9
   conflict register and governance audit baseline.
2. Do not activate Constitution v1. This decision does not accept an exact Constitution
   Core version and is not the separate activation decision required by ADR-20260712-02.
3. Do not claim complete runtime enforcement. The accepted register's open Shadow
   promotion, unknown-safe metrics, and relational/UI integration findings remain open.
4. Do not change Memory Gateway, Supabase, Custom GPT Action, Builder, authentication,
   deployed state, or user data as a consequence of this decision.
5. Treat future changes to a finding, scope, or verdict as a new reviewed register
   version with its own hash and Owner decision; do not silently mutate this acceptance.

## Activation boundary after acceptance

This decision satisfies only the exact conflict-register acceptance condition in
ADR-20260712-02. Canonical activation remains blocked pending, at minimum:

- an exact Constitution Core version named by Owner;
- a separately accepted activation ADR and explicit activation wording;
- green ledger, canon-index, changelog, and review gates on that activation changeset;
- an explicit decision on how the accepted open runtime findings constrain activation
  scope. They always prohibit a claim of complete runtime enforcement until repaired and
  verified.

## Verification

- Recompute SHA-256 for ADR-20260715-01 from merge `ba662eab...` and require the accepted
  digest above.
- Verify PR #256 and post-merge repository gates for the accepted merge.
- Run `pnpm check:adr-gate`, `pnpm check:sensitive-status`,
  `pnpm check:shard-registry`, `pnpm --filter iskra-site canon:index:check`,
  `pnpm ledger:update`, `npx tsx tools/verify_ledger.ts`, and `git diff --check`.
- Do not derive `canonical_activation`, `runtime_enforcement`, `deployed`, `invoked`, or
  `verified_live` from this receipt.

## Rollback / supersession

Owner acceptance is historical governance evidence and is not erased. A later Owner
decision may supersede this baseline by naming the replacement artifact, merge, digest,
reason, and consequences. Supersession does not activate the Constitution or close
runtime findings unless it says so explicitly with matching evidence.

## ∆DΩΛ

∆: the exact classes 4–9 conflict register moves from proposed review to an
Owner-accepted governance audit baseline without becoming active Constitution or runtime
proof.
D: Owner decision, ADR-20260715-01 at merge `ba662eab...`, its SHA-256, PR #256, and
ADR-20260712-02.
Ω: 0.95 for the recorded repository-governance boundary; 0 for unperformed canonical
activation or verified-live enforcement.
Λ: prepare a separate activation decision packet only after an exact Core version and
the treatment of open runtime findings are explicitly selected.
