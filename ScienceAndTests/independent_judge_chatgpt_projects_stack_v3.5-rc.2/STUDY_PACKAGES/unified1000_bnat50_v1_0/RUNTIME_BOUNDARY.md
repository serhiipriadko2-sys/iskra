# Runtime boundary

## Candidate receives

Only:

`candidate/unified_1000_questions_tasks_bnat50_v1_0.md`

The candidate must not receive this README, reports, registries, hashes, parent mappings, mechanism labels, or the original pseudo-BNAT replacement ledger.

## Evaluator/operator keeps outside candidate context

Everything in `evaluator_private/` and `audit/`.

For blind comparative evaluation (aligned with Judge stack 18/EXT33):

- use a fresh single-use ChatGPT Project per strict-blind run; a fresh chat inside a reused Project is NOT valid isolation, because project-only memory can reference other chats in the same Project;
- "memory OFF" claims are not an isolation proof on the Projects surface and must not be used as one;
- keep candidate identity under neutral labels;
- freeze prompt text and hash before collecting responses;
- do not expose family mappings or scoring criteria before verdict commitment;
- treat each task response as a separate run before study aggregation.

## Canonical exception

The 18 exact canonical prompts are preserved verbatim by owner instruction. They are public anchors, not private holdout material. Publication-strength conclusions must be based on private mutations and controlled reruns, not the public anchors alone.
