# ADR-20260715-03: IskraSpace Shadow Promotion Runtime Boundary

Status: proposed pending merge and post-merge verification
Date: 2026-07-15
Owner / Builder: Семён / Искра

```text
governance_status: proposed
delivery_evidence: tested (local changeset; not merged, deployed, invoked, or verified live)
canonical_activation: blocked
runtime_enforcement: repository-integrated for the current ShadowView path / not verified live
Memory Gateway: unchanged
Supabase live state: unchanged
```

## Context

ADR-20260711-02 defined a P0 invariant: Shadow material may be promoted only with
evidence, SIFT PASS, explicit user confirmation, and a verifiable action receipt.
ADR-20260715-01 recorded `CR-P0-04` as an open runtime conflict because
`ShadowView.tsx` called the storage mutation directly while the deterministic policy
gate was only a separate library function.

The Owner accepted the conflict register through ADR-20260715-02 without activating the
proposed Constitution or claiming complete runtime enforcement. This ADR describes one
narrow implementation batch for that accepted finding.

## Decision

The current IskraSpace product path for Shadow to Archive promotion MUST pass through a
single orchestration boundary before the storage mutation:

1. the selected node remains a Shadow candidate;
2. at least one non-empty evidence source or trace exists;
3. SIFT status is `PASS`;
4. the user confirms the individual operation;
5. the current consented profile permits `memory.promote.shadow` as `ASK_EACH`;
6. the scoped consent receipt is current, matches the profile version, and has not been
   consumed by an earlier action receipt;
7. after mutation, Archive and Shadow are read back;
8. a persistent action receipt records permission reference, result, read-back state,
   and evidence references.

`ShadowView` obtains consent only from the explicit confirmation handler and calls
`shadowPromotionService.promote`. It does not call `memoryService.promoteToArchive`
directly. Policy denial remains visible in the confirmation dialog and leaves the
selected Shadow record in place.

Consent receipts are append-only in the local ledger. Issuing a later receipt for the
same scope no longer erases the earlier receipt referenced by an action receipt.

## Scope

Included:

- deterministic preflight policy in `@iskra/runtime`;
- local consent and action-receipt persistence;
- orchestration and read-back verification;
- current `ShadowView` integration and behavioral DOM tests;
- a source contract preventing the current view from regressing to the raw mutation.

Excluded:

- Memory Gateway, Custom GPT Actions, or Supabase functions/data;
- live deployment or staging verification;
- a claim that browser local storage is tamper-proof;
- unknown-safe metrics (`CR-P0-08`), exit-pressure application integration, or
  canonical Constitution activation.

## Evidence

The changeset contains deterministic tests for:

- preflight denial before mutation when consent, evidence, SIFT, confirmation, or
  permission is missing;
- one-use `ASK_EACH` consent;
- verified read-back and persisted action receipt on success;
- retained consent history for audit references;
- user click routing through consent and policy services;
- visible denial with no raw storage mutation;
- source-level exclusion of the raw mutation from `ShadowView`.

These are repository/local test claims until the PR is merged and post-merge CI is
observed. They are not deployment, invocation, or verified-live evidence.

## Risks and residual boundary

- Browser local storage is controlled by the browser user and is not a trusted server
  security boundary. This implementation prevents accidental/product-path bypass; it
  does not make client persistence tamper-proof.
- The low-level storage method remains an implementation primitive used by the
  orchestration service. New product callers require the same source-contract review.
- A storage failure may produce a `FAILED` or read-back `MISMATCH` receipt; release
  observability for such failures remains a separate production hardening item.
- The complete constitutional runtime matrix remains partial, especially metrics and
  relational/exit behavior.

## Rollback

Revert this changeset as one unit: UI integration, orchestration service, receipt ledger,
runtime preflight types/tests, and governance receipt. Rollback reopens `CR-P0-04` and
must not be described as preserving the promotion invariant.

## Activation boundary

This ADR does not activate Constitution v1. After merge and green post-merge gates,
`CR-P0-04` may advance from `open_runtime_conflict` to
`repository_implemented_and_tested / not_verified_live` in the living status. Exact
canonical activation still requires a separate Owner decision naming exact artifacts
and versions.

## ∆DΩΛ

∆: the current Shadow promotion UI path changes from direct mutation to explicit
preflight, one-use consent, read-back, and a persistent action receipt.
D: ADR-20260711-02, accepted conflict register ADR-20260715-01/02, runtime policy and
behavioral tests, and local storage integration.
Ω: 0.94 for repository behavior after green local/CI tests; lower for live browser and
deployment behavior until staging invocation evidence exists.
Λ: merge only with ledger/index integrity and release gates green; then record the exact
merge SHA and post-merge receipts without upgrading canonical activation.
