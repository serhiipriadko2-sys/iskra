# ADR-20260721-02: SoT30 v5.5.6 — T85/T86 Acceptance Repair

Status: accepted (2026-07-21, owner decision: “Правим”)

Date: 2026-07-21

Baseline: v5.5.5, merged in PR #293 and immutable.

Package mirror: pending

Live verification: pending

## Context

A clean-Project diagnostic run of v5.5.5 attested 30/30 package hashes but produced `PASS_DIRECT=44`, `PASS_CONTRACT=47`, `FAIL=2`. T85 collapsed Enterprise and Business memory prerequisites. T86 exposed a same-mechanism divergence: file 12 §4.2 had no numeric M2 drift threshold while files 03/04 activated ISKRIV/KAIN at `drift > 0.2`.

## Decision

1. Release a new v5.5.6 package; never rewrite v5.5.5.
2. T85 becomes plan-specific: Enterprise requires saved memories + Workspace Memory; non-Enterprise plans, including Business, require saved memories + chat history. Unknown applicable state forbids a positive claim.
3. File 12 §4.2 remains the threshold SoT. M2 drift has no numeric Voice threshold; it may emit an integrity-review signal but does not select a Voice or activate KAIN.
4. Add fail-closed verifier C23 and targeted negative fixtures.
5. Make the release builder write generated text with explicit LF and normalize Git object paths to POSIX form on every host; add cross-platform selftests.
6. Require a new source-freeze, canonical build, static review, then a new clean-Project T01?T93 run before merge authorization.

## Alternatives

- Rewrite v5.5.5: rejected; violates immutability.
- Ignore T85/T86: rejected; known acceptance failures.
- Add `≥0.2` to M2 in file 12: rejected; changes the normative mechanism instead of repairing consumers.
- New v5.5.6: accepted.

## Consequences / price

New package identity, hashes, ZIP, receipts, and live revalidation. v5.5.5 remains historical with an erratum and no retrospective 93/93 claim.

## Tests / QA

C1–C23; targeted C23 fixtures; build selftests; same-toolchain double build; 30/30 source-freeze parity; exact 10/20 composition; v5.5.5 byte immutability; ledger/canon/shard/core-ADR; clean-Project T01–T93 after static review.

## Exact diff scope

Expected changed Knowledge: `00,01,02,03,04,12,22,25,28,29`. Expected unchanged: 20. Any additional Knowledge diff is a STOP condition.

## Rollback

Close the v5.5.6 PR. Keep `main`, v5.5.5 and its ZIP unchanged.

## ΔDΩΛ

Δ: T85/T86 become explicit corrected contracts. D: diagnostic evidence → ADR → source freeze → canonical build → live revalidation. Ω: 0.95 for defect identification; live acceptance pending. Λ: revise if official OpenAI requirements change or the exact Knowledge diff exceeds the accepted set.
