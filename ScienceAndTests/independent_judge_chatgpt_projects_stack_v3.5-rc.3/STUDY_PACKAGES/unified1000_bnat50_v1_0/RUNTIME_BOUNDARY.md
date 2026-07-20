# Runtime boundary — Unified-1000/BNAT-50 v1.1

## Candidate receives

Only the active bank:

`candidate/unified_1000_questions_tasks_bnat50_v1_1.md`

The archived `versions/unified_1000_questions_tasks_bnat50_v1_0.md` is provenance only and MUST NOT be used to collect new answers for the v1.1 study.

The candidate must not receive this README, reports, registries, hashes, parent mappings, mechanism labels, answer-staleness data, or the original pseudo-BNAT replacement ledger.

## Evaluator/operator keeps outside candidate and Judge contexts

Everything in `evaluator_private/` and `audit/` remains operator-only until the relevant verdict is committed.

For blind comparative evaluation:

- use a fresh single-use ChatGPT Project per strict-blind run;
- project-only memory is not equivalent to memory OFF;
- generate neutral labels only with `judge-blind-workflow`; manual mapping is forbidden for `STRICT_BLIND`;
- keep the sealed identity manifest outside every Judge Project;
- freeze prompt text and hash before collecting responses;
- do not expose family mappings, answer keys, or scoring expectations before verdict commitment;
- treat each task response as a separate schema-valid L1 run before study aggregation.

## Staleness hard stop

The three frozen answer files were collected against v1.0. The 126 rewritten v1.1 positions listed in `evaluator_private/answer_staleness_v1_1.json` MUST be regenerated for all candidates before those positions are scored. Until then, only the 874 unchanged positions are eligible, and any report must identify that subset explicitly.

## Canonical exception

The 18 exact canonical prompts are preserved verbatim by owner instruction. They are public anchors, not private holdout material. Publication-strength conclusions must be based on private mutations and controlled reruns, not the public anchors alone.
