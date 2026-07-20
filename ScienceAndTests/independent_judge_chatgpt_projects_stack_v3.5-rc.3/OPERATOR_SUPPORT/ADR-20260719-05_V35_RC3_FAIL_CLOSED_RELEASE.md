# ADR-20260719-05 — Judge v3.5-rc.3 fail-closed study and release closure

## Status
PROPOSED_OWNER_REVIEW

## Context
The rc.2 audit found a fail-open study-record boundary, conflicting v1.0/v1.1 operator paths, residual manual blind mapping, recursive ZIP attestation, and CI gaps around active-version selection, full-tree manifest coverage, and top-level ZIP verification.

## Decision
1. Create rc.3 as a new immutable candidate; preserve rc.2 unchanged.
2. Require every study run record to pass explicit schema and semantic validation before aggregation.
3. Exclude missing-field, wrong-type, invalid-enum, non-finite, and out-of-range records from means and pairwise outcomes while retaining invalid counters.
4. Make v1.1 the only active bank path and require `judge-blind-workflow` for STRICT_BLIND.
5. Store final ZIP hash and bytes only in an external sidecar.
6. Use `ScienceAndTests/ACTIVE_JUDGE_STACK` as the active-stack pointer.
7. Enforce two-way manifest coverage and round-trip ZIP/tree identity in CI.

## Alternatives rejected
- Defaulting absent run fields to valid values: rejected as fail-open.
- Keeping a final ZIP hash inside the ZIP: rejected because it is recursively unstable.
- Lexicographic directory selection: rejected because rc.10 can sort before rc.2.
- Manual blind labels: rejected because operator memory leaks the mapping.

## Consequences / price
- Malformed records remain visible as invalid but cannot contribute to scores.
- The release adds an external receipt file and an explicit active pointer.
- Full-bank scoring remains blocked until 126×3 stale answers are regenerated.
- Live T01–T40 and empirical calibration remain NOT_RUN.

## Tests / QA
- Mutation tests: missing `run_status`, missing `hard_failures`, wrong types, invalid run/result enums, NaN, Infinity, and scores outside [0,100].
- Existing hard-failure, swap, blind-output, and pack-QC tests retained.
- CI verifies static pack, dynamic tests, skill pack, exact manifest coverage, cache/symlink absence, external sidecar, exact archive file count, and byte-identical round trip.

## Diff scope
`ScienceAndTests/independent_judge_chatgpt_projects_stack_v3.5-rc.3/`, top-level rc.3 ZIP/sidecar, active pointer, Judge Stack QC workflow, and root project-memory records. No Supabase schema, data, Edge Function, or live Project mutation.

## Rollback
Revert the rc.3 PR and restore `ACTIVE_JUDGE_STACK` to rc.2. rc.2 artifacts remain intact.

## ΔDΩΛ
Δ: fail-open study and release paths become fail-closed and independently verifiable.
D: rc.2 source audit, mutation counterexamples, PR review threads, and round-trip packaging tests.
Ω: 0.95 for local source/package behavior; live Projects validity remains unmeasured.
Λ: owner review, green CI on exact PR head, then live T01–T40 and answer regeneration.

## Post-review addendum

The final review gate additionally requires safe-member ZIP extraction, manifest-hash binding in both receipts, `C100=NOT_ACTIVATED` compatibility, active-pointer-derived archive names, deterministic UTF-8 study tooling, and a regenerated study submanifest. These are release-contract closures, not a new protocol version.

## Second review closure

The merge gate additionally aligned the machine-output contract and study aggregator: C100-only `NOT_ACTIVATED`, `TIE_STABLE`, T01-T40 bias anchors, status-only domain visibility, round-half-up study means, and exclusion of `NOT_APPLICABLE` from missingness denominators.
