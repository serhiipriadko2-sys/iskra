# Fractal authority review repair — 2026-08-04

## Scope

This receipt tracks review repair for PR #326 under ADR-20260729-02 and authorization issue #324. It is an implementation receipt, not a merge or activation receipt.

## Integrated baseline

- reviewed parent head: `4d0a863644565113b25f91da9396f90793705856`;
- integrated `main`: `0672f8a01c2abca1a08eb07745cc65c119dfaa34`;
- merge conflicts: only derived `ledger/sot.json` and `ledger/checksum.asc`;
- ledger resolution rule: regenerate after final source bytes; never choose either conflict side manually.

## Review blockers and repairs

1. Signal validation now precedes option validation.
2. Edge input hashing accepts invalid containers without throwing before typed validation.
3. The committed corpus is the actual T7/T8 input and carries fixed expected outcomes.
4. Generator hashing and comparison normalize LF; CRLF worktrees are simulated in tests.
5. Generated artifact provenance binds source, contracts and wrapper, not source alone.
6. Unrelated runtime exports are preserved.
7. CI is read-only and checks the event SHA instead of a hard-coded feature branch.
8. Evidence records identify the integrated main and remain pre-activation.

## Dependency boundary

Open PR #330 overlaps through runtime/ledger and PR #332 through Supabase/ledger. Neither PR is merged or copied into #326. A future base update must rerun public API, Edge, migration and ledger checks.

## Supabase boundary

PR #326 has an isolated healthy preview project, but its migration history and function inventory are not a byte-equivalent production mirror. Preview evidence is useful for focused Edge behavior only. No production database or Edge function mutation belongs to this repair.

## Verification contract

Required before review-ready:

- generator and boundary checks;
- registered corpus and exact Node/Edge parity;
- runtime typecheck and public API regression;
- Deno Edge tests including invalid containers;
- full ledger regeneration and verification;
- repository CI on the new exact head;
- repeat independent review.

## Lifecycle

`implementation repaired != review-approved != merged != scoped activation != deployed != invoked != verified-live`.
