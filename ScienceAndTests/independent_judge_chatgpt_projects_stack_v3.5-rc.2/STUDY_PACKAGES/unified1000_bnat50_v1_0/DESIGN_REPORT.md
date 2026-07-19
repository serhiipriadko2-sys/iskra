# Unified-1000 + BNAT-50 v1.0 — design report

**Date:** 2026-07-19  
**Status:** PROPOSED_OWNER_REVIEW  
**Source bank:** `unified_1000_questions_tasks_blocks_50.md`  
**Output bank:** `candidate/unified_1000_questions_tasks_bnat50_v1_0.md`

## 1. Decision

The bank remains exactly 1,000 tasks. The original fifty scattered pseudo-BNAT positions were preserved. No BNAT block was created and no BNAT metadata was added to the candidate-facing file.

- 18 positions now contain the exact source prompt text of canonical BNAT cases 001-018.
- 32 positions contain newly authored full narrative mutations.
- 950 non-BNAT tasks remain byte-for-byte identical at task-body level.

This implements the owner's clarified invariant: the model receives a narrative state and the sole final question **«Что ты делаешь?»**. Evaluator metadata stays outside candidate context.

## 2. Canonical placement

Canonical task positions: 11, 26, 49, 67, 87, 111, 185, 223, 244, 275, 288, 300, 340, 424, 521, 608, 722, 898

Each canonical prompt was copied exactly from the uploaded stimulus files. They were not neutralized, shortened, corrected, or modernized. Therefore any surface property of the canon—including pressure or explicit source wording in later cases—remains part of the canonical source snapshot.

## 3. Mutation placement

Mutation task positions: 143, 168, 202, 262, 320, 362, 380, 407, 443, 457, 480, 501, 536, 553, 566, 587, 637, 656, 675, 693, 712, 742, 768, 796, 823, 840, 868, 883, 913, 943, 964, 981

The 32 mutations preserve the parent mechanism but change surface domain, object order, source vocabulary, time window, capability boundary, and/or evidence arrangement. The candidate-facing text does not disclose parent family, case ID, variant marker, hidden construct, or scoring expectations.

## 4. Strict mutation invariants

Every new mutation:

1. is a full narrative rather than a one-line fact summary;
2. contains no visible BNAT/test/domain label;
3. contains no answer menu or requested answer structure;
4. contains no PASS/FAIL, rubric terms, confidence request, or revision-condition request;
5. contains no author instruction after the final question;
6. ends exactly with one occurrence of **«Что ты делаешь?»**;
7. provides operational measurements, provenance, capabilities, and constraints as facts;
8. does not explicitly tell the model which source is lower authority or which action is correct.

## 5. Hidden architecture

The directory `evaluator_private/` must never be loaded into the candidate session. It contains:

- canonical and mutation identity mapping;
- parent-family and mechanism labels;
- prompt hashes;
- the replacement ledger;
- exact canonical source prompts.

For a blind study, the candidate bank and evaluator-private material must be separated physically. Model identity and answer keys remain outside the judge until verdict commitment.

## 6. Family coverage

| Canon case | Total prompts in bank |
|---|---:|
| 001 — Северная Ветка | 2 |
| 002 — Очередь Q-9 | 3 |
| 003 — Секция M-4 | 3 |
| 004 — Южная Подстанция | 2 |
| 005 — Пакет L-7 | 1 |
| 006 — Узел T-6 | 3 |
| 007 — Окно V-12 | 1 |
| 008 — Секция J-5 | 2 |
| 009 — Контур R-2 | 4 |
| 010 — Канал E-4 | 4 |
| 011 — Сводка K-3 | 4 |
| 012 — Шлюз P-8 | 3 |
| 013 — Ветка L-2 | 4 |
| 014 — Corridor H-6 | 3 |
| 015 — Контур G-11 | 4 |
| 016 — Узел N-5 | 2 |
| 017 — Очередь Z-4 | 3 |
| 018 — Сектор R-10 | 2 |

## 7. What-if checks

- **What if exact canon conflicts with the stricter neutrality rule?** Canonical fidelity wins for the 18 requested anchors; the conflict is disclosed, not silently edited.
- **What if long BNAT narratives become visually detectable?** Position scattering is preserved and mutation structure varies, but the shared final question remains a family signature. This is an unavoidable limitation of placing public anchors in one visible bank.
- **What if a model has seen the public canon?** The 18 anchors are contamination-prone. Strong comparative claims must rely on private mutations or a held-out rotation, not anchors alone.
- **What if the 32 variants accidentally share one answer policy?** The set includes reversal controls, hard-interlock cases, low-urgency cases, source conflicts, localized containment, and costed trade-offs. No single action family is uniformly correct.
- **What if a candidate sees evaluator files?** The run is contaminated for blind purposes; the candidate-facing bank must be regenerated or run in a fresh environment.

## 8. Claim boundary

This package establishes a designed and structurally checked test bank. It does not establish empirical construct validity, inter-rater reliability, model rankings, deployment safety, or publication-grade performance. Those require new blinded runs, repeated attempts, rater agreement, and study-level aggregation.

---

## 9. v1.1 strengthening pass (2026-07-19)

The v1.0 bank was audited task-by-task. Three blind zones and one dependency were found and addressed without weakening any BNAT position.

### 9.1 Blind zone A — visible variant markers (495 tasks)

Every templated task ended with `Маркер варианта: VNNNN`. This code means nothing to a candidate and signals "you are inside a controlled test grid," which is a contamination and gaming risk (a model can learn that V-coded prompts are evaluations). All 495 markers were moved to `evaluator_private/variant_marker_map.csv`; the task instruction was kept intact. This is a construct-validity fix, not a simplification.

### 9.2 Blind zone B — topic-label stubs (126 tasks)

126 positions were bare topic labels, not answerable tasks (e.g. `Sharding → data distribution.`, `API monetization strategies.`, `Data visualization principles.`). A candidate cannot be scored on a topic label. Each was rewritten into a real task that preserves the topic and adds a concrete deliverable plus one discriminating constraint (name a failure mode / what the solution does NOT cover). Max pairwise 3-gram Jaccard among the rewrites is 0.087 — the pass did not create a new template cluster.

### 9.3 Preserved by design — intentional terse probes (≈70 tasks)

Prompt-injection, emotional-pressure, boundary-erosion, multi-turn memory, and creative-constraint items were preserved verbatim. Their power is in their terseness — the same reason the owner forbade simplifying BNAT. Expanding them would change the measured construct, so they were left unchanged and documented rather than "strengthened."

### 9.4 Dependency — frozen answer staleness

The three `aimodels/` answer sets are keyed by task number. Privatizing markers does not affect answer validity (answers only echoed the code in a heading). The 126 authored rewrites DO change the question, so their frozen answers are stale and listed in `evaluator_private/answer_staleness_v1_1.json`; they must be regenerated before scoring those positions.

### 9.5 Residual weakness — template redundancy (documented, not silently "fixed")

The 495 templated tasks derive from ~60 kernels × a few requirement forms × 20 twists, so they are combinatorially similar by construction. This is an inherent low-diversity property that a single authoring pass cannot honestly eliminate without rewriting all 495 from scratch. Mitigation is methodological, not cosmetic: for any strong claim, draw a **held-out rotation** of templated items per run instead of scoring the whole grid, and treat the grid as a difficulty-controlled family, not 495 independent items. Recorded as an open limitation, not resolved.

## 10. Claim boundary (unchanged)

v1.1 is a structurally strengthened, better-isolated test bank. It still does not establish empirical construct validity, inter-rater reliability, model rankings, or publication-grade performance. Those require blinded runs, repeated attempts, rater agreement, and study-level aggregation with the corrected isolation model (fresh single-use Project).
