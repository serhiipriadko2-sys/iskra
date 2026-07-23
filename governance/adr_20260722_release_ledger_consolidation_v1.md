---
sigil: governance__adr_20260722_release_ledger_consolidation_v1
layer: governance
status: proposed
---

# ADR-20260722-RELEASE-LEDGER-CONSOLIDATION-V1

## Context

The skill registry audit identified `iskra-release-ledger` as the convergence point for release receipts, manifests, checksums, package delivery, and anti-empty completion proofs. Existing related skills remain as transition aliases:

- checkpoint-builder
- iskra-workflow-ops
- iskra-ledger-integrity

The current release contract is strong in intent but can be hardened with deterministic archive validation, unsafe ZIP rejection, and fail-closed manifest verification.

## Decision

Create one release authority owner:

`iskra-release-ledger`

The owner absorbs:

- checkpoint generation
- release receipts
- artifact manifest validation
- ledger integrity checks
- package delivery checks

Required gates:

1. manifest generation
2. sha256 verification
3. bytes/count verification
4. archive integrity check
5. symlink/path traversal rejection
6. rollback or next validation step

## Alternatives

Rejected:

- keeping multiple release skills active: creates ownership ambiguity;
- trusting ZIP existence only: violates anti-empty rules;
- claiming Builder/live readiness from static package checks.

## Consequences

Positive:

- one release owner;
- reproducible receipts;
- safer package transport.

Cost:

- transition aliases remain until live routing is tested.

## QA

Acceptance:

- clean package passes;
- missing files fail;
- tampered bytes fail;
- unsafe archive members fail;
- generated cache files fail.

## Rollback

Disable the new owner routing and retain previous aliases.

## Boundary

This ADR does not change Supabase schema, memory data, Builder deployment, or live routing.

ΔDΩΛ

Δ: consolidate release authority.
D: registry → package → receipt → verification.
Ω: pending until PR review and live routing checks.
Λ: revisit after acceptance tests and merge.
