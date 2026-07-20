# ADR-20260719-02 — Independent Judge v3.4-beta.3 Projects contract closure

Status: `PROPOSED_OWNER_REVIEW`

## Context

The Kimi v3.4 update added valuable criterion/gate registries, bias controls, blind workflow, study aggregation and five judge skills. Independent review found packaging and executable drift:

- active files were beta.2 while README/ADR/receipt claimed beta.1;
- stale ZIP/hash/instruction counts in the receipt;
- six extensions existed but documentation claimed five;
- strict blind relied on “memory OFF + fresh chat,” which is not a valid Projects isolation model;
- `A-EXTERNAL_ACTION` escaped the registry validator;
- stable ties were incorrectly counted as position inconsistency;
- study aggregation could include hard-failed runs in means and infer pairwise outcomes from Q100;
- skill packages lacked UI metadata and contained no explicit clean-build gate.

## Decision

Release `v3.4-beta.3-projects-p3` as a new candidate:

1. Keep 30 permanent Knowledge files and ≤6000-character instructions.
2. Keep six mode-specific runtime extensions EXT31–EXT36.
3. Install five Skills separately from Project sources.
4. Define strict blind as one run in one fresh single-use Project.
5. Standardize `A-EXTERNAL-ACTION`; enforce 40 criteria, 8/domain, 56 gates, 11 methods.
6. Treat `TIE_STABLE` as order-robust but winnerless.
7. Exclude hard-failed/invalid runs from study score means; report failure rates separately.
8. Produce complete manifests and external ZIP receipts from final artifacts.

## Alternatives

- Accept Kimi package unchanged: rejected because receipts and blind semantics are false/overstated.
- Revert to p2: rejected because it loses legitimate bias, blind, study and skill improvements.
- Make all extensions permanent: rejected because it reduces runtime headroom.

## Consequences

Benefits: consistent versions, installable skills, valid blind boundary, stronger deterministic scripts, complete receipts.

Price: strict blind is operationally expensive because each run needs a new Project; live T01–T38 and empirical calibration remain pending.

## Tests / QA

- 30 core files; instructions ≤6000 chars;
- version consistency;
- 40 criteria / 8 per domain;
- 56 gate codes; 11 methods;
- T01–T38 continuous;
- five Skills validate and package cleanly;
- stable tie, flip, hard-failure aggregation and blind file separation tests;
- clean ZIP extraction and manifest verification.

## Rollback

Return to immutable p2 or the original Kimi archive. Historical verdicts remain append-only.

## Diff scope

Knowledge 00, 07, 10, 18, 22, 23, 25, 26, 28, 29; EXT31–33, EXT36; Project Instructions; five skill bundles; packaging/governance files.

## ∆DΩΛ

∆: Kimi improvements retained without inheriting false receipts or blind assumptions.
D: independent archive audit → repairs → tests → new candidate.
Ω: structural confidence high; live and empirical validity pending.
Λ: Owner review of exact p3 ZIP and live T01–T38.
