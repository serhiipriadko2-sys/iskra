# Iskra repository deep audit — 2026-08-04

**Scope:** repository architecture, typed HFD/DFA authority, documentation truth boundaries, GitHub workflows, Supabase preview/production drift, dependencies, security and release gates.

**Lifecycle:** audit and repair candidate. This document does not authorize merge, formula activation, deployment or production mutation.

## 1. Executive verdict

The repository is structurally viable, but readiness is distributed across independent gates. The HFD/DFA implementation can become review-ready after exact-head CI and repeated review. It must not absorb the dependency incident, Supabase least-privilege work or unrelated SIFT changes.

The governing distinction remains:

`accepted != implemented != merged != scoped activation != deployed != invoked != verified-live`.

## 2. Evidence baseline

- Current integration base inspected: `main@0672f8a01c2abca1a08eb07745cc65c119dfaa34`.
- HFD/DFA implementation: draft PR #326, authorization receipt issue #324.
- Independent review receipt: PR #326 comment `5147116459` (`CHANGES REQUESTED`).
- Adjacent open changes: PR #330 (SIFT fail-closed) and PR #332 (Graph API least privilege).
- Supabase production: `typcvaszcfdpkzbjzuur`.
- Supabase PR #326 preview: `zvsjmxiigyguxgcddueb`, healthy and data-less.
- Mintlify deployment: `iskraspace`, deploy branch `main`; no documentation publication is claimed.

## 3. Dependency and authority graph

```text
ADR-20260729-02 + issue #324
  -> packages/math canonical source/contracts/wrapper
  -> generated runtime mirror
  -> generated Supabase Edge mirror
  -> registered corpus + exact expected outcomes
  -> engine/runtime/Edge consumers
  -> read-only CI and documentation fence
  -> ledger receipts
  -> review
  -> merge decision
  -> separate scoped activation receipt
```

Cross-cutting dependencies:

```text
main + PR #330 + PR #332
  -> shared ledger files
  -> branch refresh before final review

Supabase production + PR previews
  -> migration/function drift must be observed separately
  -> preview success does not prove production deployment

repository docs + Mintlify
  -> repository correction does not equal published documentation
```

## 4. PR #326 repair status

The review-repair branch addresses signal-first validation, total invalid-container hashing, executable corpus binding, LF-normalized generation, public runtime API preservation, read-only CI, current evidence receipts and deterministic ledger regeneration.

Local integrated verification observed:

- generator and generated-mirror clean check: PASS;
- authority/import/export/documentation fence: PASS;
- focused Node/Vitest: 14/14 PASS;
- runtime package typecheck and focused tests: PASS;
- Deno Edge tests: 8/8 PASS;
- workspace typecheck: PASS after migrating the missed IskraSpace compatibility facade;
- IskraSpace: 77 test files and 860 tests PASS, 27 staging-only tests skipped;
- packages/math: 64 tests PASS;
- packages/engine: 54 tests PASS;
- release-manifest suite: 8 tests PASS;
- ledger: must be regenerated after every final file edit and verified again.

## 5. Prioritized findings

### P0 — dependency audit gate

Issue #310 remains open. Runtime resolves `eslint -> minimatch -> brace-expansion@5.0.8`; the repository vendor facade also wraps `5.0.8`. Advisory GHSA-rgw5-rvv9-x895, published 2026-07-30 and updated 2026-08-03, marks `>=4.0.0,<5.0.9` affected. Remediation belongs in a small dependency-only PR: upgrade vendor and runtime lock to `5.0.9`, update lockfiles, rerun both audit commands and production release gates. Do not weaken audit thresholds or fold this into PR #326.

Root audit also reports a moderate PostCSS advisory. Confirm the patched release and update the owning Vite/PostCSS chain in the same dependency-only PR only if the diff remains isolated and tests stay frozen-install clean.

### P1 — HFD/DFA review completion

Refresh from the latest main after adjacent PR merges, regenerate ledger, run exact-head CI and repeat independent review. Keep PR #326 draft until all required checks target the final head. Do not create an activation receipt in the implementation PR.

### P1 — Supabase security and provenance

Keep PR #332 and the Supabase provenance work separate from formula authority. Production and preview advisors report SECURITY DEFINER/search-path, direct execute, GraphQL exposure and RLS/no-policy concerns. Required sequence: merge least-privilege changes independently, replay migrations on a fresh branch, compare advisors, then obtain production-specific authorization. A healthy preview is not a production receipt.

### P1 — documentation truth boundary

Active developer/system documents must reference typed APIs and lifecycle gates. Historical audit and migration plans must remain preserved but visibly non-authoritative. Add machine checks for active contract pages; do not rewrite appendices or historical snapshots as if they were current canon.

### P2 — generated-code governance

Generated runtime/Edge mirrors intentionally duplicate canonical code. Declare them as generated surfaces in static-analysis configuration, bind the entire generated bundle, and prohibit manual edits. Duplication findings on these paths are expected; duplication outside them remains actionable.

### P2 — package hygiene

- investigate `jose` being reported as a development dependency used by production paths;
- remove tracked `*.tsbuildinfo` or ensure builds do not dirty it;
- eliminate npm configuration warnings caused by pnpm-only environment keys crossing into npm;
- add dependency-audit receipts to release-gate evidence;
- treat audit database updates as time-dependent evidence, not historical closure.

### P2 — documentation delivery

After repository docs merge, create a separate Mintlify documentation PR/session, diff the published navigation/content, and record the deployment receipt. Repository merge and Mintlify publication are distinct states.

## 6. Counterfactual branches

### Branch A — merge #326 before adjacent work

Prediction: the formula implementation may pass isolated CI but become stale or conflict in ledger after #330/#332. Decision effect: do not merge from an old base; refresh and reverify the exact final head.

### Branch B — merge security/dependency work first

Prediction: #326 requires a small base refresh and ledger regeneration, but formula semantics remain stable. Decision effect: preferred when P0 audit gates or production security changes block repository-wide green status.

### Branch C — combine all repairs in one PR

Prediction: review attribution becomes impossible, rollback is coarse, and an advisory or Supabase failure can obscure formula correctness. Decision effect: reject; preserve atomic PRs connected by explicit dependency receipts.

### Failure/adversarial branch

If generated mirrors are manually edited, corpus files stop being executed, CI gains write permissions, or an invalid input throws before the typed boundary, the authority claim is withdrawn. The stop condition is any mismatch among canonical hash, generated bundle hash, corpus hash, exact outcomes or consumer statuses.

## 7. Execution roadmap

1. Finish PR #326 review repair on current main.
2. Regenerate and verify ledger after the final staged file set.
3. Run full repository verification and exact-head GitHub CI.
4. Repeat independent code/security review; keep draft on any finding.
5. Resolve issue #310 in a dependency-only PR using `brace-expansion>=5.0.9`.
6. Complete PR #332 and re-run Supabase advisors on preview and production-equivalent replay.
7. Rebase remaining open PRs in dependency order and regenerate shared receipts.
8. Make a separate merge decision for #326.
9. After merge, create a separate scoped activation proposal; do not auto-activate.
10. Publish repository documentation to Mintlify only through a separate reviewed delivery receipt.

## 8. Definition of done

PR #326 is review-ready only when:

- the branch is based on the current main and has no unresolved conflicts;
- generator, corpus, mirrors and provenance are deterministic on Linux and CRLF-simulated worktrees;
- signal-first validation and invalid-container handling have explicit tests;
- package/runtime/Edge outputs match the registered corpus;
- public runtime exports have a non-regression test;
- compatibility consumers are allowlisted and sunset-gated;
- workflow permissions are read-only and the workflow never mutates its own branch;
- workspace typecheck, complete unit suites, Deno tests, release checks and ledger pass on one exact head;
- the evidence matrix records the exact head and does not claim activation;
- repeated independent review produces no unresolved P0/P1 finding.

Repository release readiness additionally requires both dependency audits to exit zero and relevant production gates to run. Supabase production readiness additionally requires production-specific advisor and migration receipts.

## 9. Non-claims

This audit does not claim that PR #326 is merged, that HFD/DFA is active, that package-wide formula authority exists, that production Supabase was mutated, that Mintlify was published, or that any implementation is verified-live.

## 10. Review triggers

Re-open this audit when the PR head, main head, advisory database, Supabase migration set, Edge runtime version, public package exports, corpus hash, generated bundle hash or workflow permissions change.
