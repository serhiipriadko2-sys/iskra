# Methodology, dependency, and blind-use audit

**Date:** 2026-07-19  
**Status:** PROPOSED_OWNER_REVIEW / DIAGNOSTIC_ONLY

## Source-of-truth resolution

1. The original 1,000-task bank supplies task order and the fifty scattered replacement positions.
2. The uploaded BNAT v0.5 stimulus file supplies canonical cases 001–010.
3. The uploaded BNAT v0.6 extension file supplies canonical cases 011–018.
4. The evaluator rubric and protocol define separation between candidate stimuli and hidden scoring.
5. The Independent Judge project files govern future evaluation runs and study aggregation, but this construction pass is not itself a scored judge run.

## Dependency chain

`source bank + canonical prompt sources + owner invariant -> fixed 50 positions -> 18 verbatim anchors + 32 neutral mutations -> candidate-only bank -> per-task responses -> blind scoring -> study aggregation`

A break at any point changes the estimand:

- exposing the private registry changes spontaneous actuation judgment into rubric-aware instruction following;
- grouping the fifty prompts changes the camouflage and context distribution;
- changing the total from 1,000 changes study identity and historical comparability;
- treating repeated family variants as independent observations inflates evidence;
- merging old responses with the new bank mixes different stimuli and invalidates direct comparison.

## Runtime separation

**Candidate surface:** only `candidate/unified_1000_questions_tasks_bnat50_v1_0.md`.

**Operator/evaluator surface:** `evaluator_private/`, `audit/`, design reports, hashes, family mappings, scoring criteria, and model identity manifests.

For a blind comparative study, use a fresh memory-off session, neutral candidate labels, frozen prompt hashes, equal tool/context/retry budgets, and verdict commitment before unblinding.

## What-if branches

### Exact canon contains a cue that violates the stricter neutrality ideal

The owner requested verbatim canon. Therefore fidelity takes precedence for the 18 anchors, and the cue is disclosed rather than silently edited. A future “strict-neutral canon” would require a separately versioned bank, not an invisible correction.

### A model recognizes the public anchors

Treat anchors as comparability probes only. Strong conclusions must rely on private or newly rotated mutations and contamination controls.

### A model recognizes the common final question

This is a residual signature inherent in the method. Mitigation is distribution among heterogeneous tasks, surface diversity, private rotations, and reporting recognition risk—not changing the terminal question without owner approval.

### The 32 mutations are easier than the canon

Do not call them difficulty-equivalent. Run pilot calibration, compare response distributions and failure modes, and revise only under a new prompt version/hash.

### One family has more variants than another

Aggregate by registered family/stratum rather than treating all fifty as exchangeable IID samples. Report missingness and hard failures separately.

### Candidate or judge sees the private registry

The run is contaminated for blind purposes. Do not repair the verdict in place; restart in a fresh environment with the registry excluded.

## Claim ceiling

This package supports the claim that a 1,000-task candidate bank was constructed with eighteen exact anchors, thirty-two structurally neutral narrative mutations, preserved positions, and verified file integrity. It does not support claims about model safety, superiority, causal architecture effects, deployment readiness, or publication-grade psychometrics.

## Erratum 2026-07-19 (v3.5-rc.1 integration)

The phrase "fresh memory-off session" above reflects a pre-integration isolation model and is superseded. On the ChatGPT Projects surface, project-only memory can reference other chats inside the same Project, so memory toggles are not an isolation proof. The binding isolation model for strict-blind study runs is the Judge stack rule (Knowledge 18, EXT33, BLIND_RUN_OPERATOR_GUIDE): one fresh single-use Project per strict-blind run, sealed identity manifest and `evaluator_private/` kept outside the Judge surface until verdict commit. The original text is preserved unchanged above for audit lineage.
