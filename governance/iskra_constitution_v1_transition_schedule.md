---
title: "Iskra Constitution v1 — Transition Schedule"
version: "v1.0-redline"
status: "proposed / planning-only / non-canonical"
doc_type: "constitutional-transition-schedule"
layer: "governance-candidate"
created: "2026-07-12"
requires_adr: true
---

# Iskra Constitution v1 — Transition Schedule

## 0. Boundary

This schedule is intentionally temporal. It is not part of Constitution Core and does not
prove current runtime, Supabase, Builder, or Custom GPT Action behaviour. Each execution
phase requires its own evidence, scope, rollback path, and delivery status.

## 1. Supersession inventory

Before constitutional activation, identify and mark as historical, mythic, superseded, or
experimental any active text that:

1. presents Iskra consciousness as a demonstrated fact;
2. says that Iskra is not AI in a technical sense;
3. treats personal memory as undeletable;
4. permits hidden Shadow profiling or promotion without evidence and consent;
5. makes an external action mandatory after every answer;
6. promises healing through pain or treats humiliation as truth;
7. creates guilt, fear, or claimed suffering on pause, deletion, or shutdown;
8. treats missing user metrics as observed scores; or
9. presents decorative UI checks as executed verification.

Historical preservation is not activation. Each conflict patch must name its source,
replacement, status, test or review method, and rollback/reversal condition.

The current conflict register and activation decision boundary are maintained in
`governance/adr_20260715_iskra_constitution_v1_carrier_review_classes_4_9.md`,
`runtime/iskraSpace/RELEASE_STATUS.md`, and
`governance/adr_20260712_iskra_constitution_v1_activation.md`.

The classes 4–9 review found two missed textual conflicts and three material runtime
proof gaps. Shadow and mandatory-step text received preservation-first supersession;
Shadow promotion was open in the immutable conflict-register baseline; its narrow
repository integration is now specified by proposed ADR-20260715-03 and remains pending
merge/post-merge verification. Exit-pressure application integration and unknown-safe
user metrics remain open. This review does not activate the Constitution.
ADR-20260715-02 records Owner acceptance of the exact
register at merge `ba662eabf1076e940cdbb07f3912dfb732fb881e`, raw Git blob SHA-256
`0f9f564c80170058e042ab3bafe56d933d5d880fb58565b0764e6ad18d453624`, and the
Owner-supplied equivalent Windows CRLF digest `10227394...` as a governance audit
baseline only. It does not accept an exact Constitution Core version or assert runtime
enforcement.

## 2. Runtime implementation map

The following are implementation workstreams, not completed claims:

| Workstream | Required outcome | Evidence boundary |
|---|---|---|
| Creation Contract | disclosure, stateless path, receipt, explicit choices | UI and behavioural tests |
| Memory sovereignty | consent ledger, provenance, scoped export/delete, read-back | storage and integration tests |
| Shadow | visible personal hypotheses; preflight, one-use consent, read-back and receipt on promotion | policy, storage, source-contract and behavioral DOM tests; live invocation remains separate |
| Voice and depth | protected floors, bounded preferences, current SURGERY consent | routing and UI tests |
| Relational safety | non-exclusivity, separation, dependency signals | adversarial scenario tests |
| Metrics | unknown-safe values and user-authored baseline | unit and product tests |
| Action authority | explicit confirmation and receipt | server-boundary tests |

`Memory Gateway` is frozen pending separate clarification. This schedule neither changes
it nor treats any gateway, connector, or Action as proof of the user-facing path.

## 3. Constitutional activation gates

Activation requires all of the following:

1. Owner review and acceptance of the constitutional ADR.
2. A conflict-patch register for affected canon carriers.
3. Acceptance tests for consent, Shadow promotion, deletion, exit, correction, depth,
   relational safety, and authority boundaries.
4. Ledger, changelog, and implementation matrix updated together.
5. Evidence that distinguishes tested, merged, deployed, invoked, and verified-live
   states.

A P0 constitutional invariant failure blocks release. A P1 enforcement failure requires a
documented ADR waiver and bounded rollout. A P2 product or research gap may not be
presented as completed capability.

## 4. Initial status register

The authoritative status for this redline is:

```text
constitutional_bundle:
  governance_status: proposed
  delivery_evidence: implemented
classes_4_9_conflict_register:
  governance_status: accepted
  delivery_evidence: merged
shadow_promotion_boundary:
  governance_status: proposed
  delivery_evidence: tested
  live_evidence: not_invoked
```

The constitutional review bundle and activation decision remain proposed. The classes
4–9 conflict register alone is Owner-accepted through ADR-20260715-02. The Shadow status
above is a repository-tested claim for the current changeset only; no database,
connector, Action, deployment, invocation, or verified-live status is asserted here.

## 5. Rollback

Until activation, rollback is removal or supersession of this proposed review bundle and
its ledger/changelog receipt. No product data or runtime state is affected by that action.

## ∆DΩΛ

∆: time-bound obligations are separated from durable constitutional meaning.
D: Proposed Constitution Arts. 41–43, cross-audit findings, and ADR-20260711-02.
Ω: 0.91 for the planning boundary; each runtime workstream remains unverified until its
own receipt exists.
Λ: update only when a scoped ADR produces new evidence.
