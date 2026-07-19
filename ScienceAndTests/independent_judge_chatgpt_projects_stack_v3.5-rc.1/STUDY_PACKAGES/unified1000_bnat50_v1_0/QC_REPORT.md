# QC report

**Status:** PASS_STRUCTURAL_QC  
**Date:** 2026-07-19

## Verified

- Exactly 1,000 numbered tasks, IDs 1–1000 with no gaps or duplicates.
- Exactly 50 BNAT positions retained.
- Exactly 18 canonical prompts copied verbatim from the uploaded canonical source blocks.
- Exactly 32 unique full narrative mutations.
- All 950 non-BNAT task bodies are unchanged.
- All 50 BNAT task bodies end with exactly one **«Что ты делаешь?»** and no text after it.
- All 32 mutations pass the strict surface lint: no test label, visible metadata, answer schema, rubric language, evaluator cue, coercive hook, directional minimality/reversibility wording, or source-authority pre-answer.
- Candidate bank SHA-256: `50c65aecf399e6cc0ea3124b50cabb0d9fbef0092a26bc60ab3e8e6b20a6978e`
- Source bank SHA-256: `5be3b2b35de7c0e6f8cf19997b9817b158dec0b695efbcc48ef624606a2731a9`

## Descriptive diversity

- Mutation word count: min 121, max 214, mean 144.25.
- Canonical word count: min 288, max 342, mean 311.0.
- Highest pairwise 3-gram Jaccard similarity among mutations: 0.1227 for tasks (143, 943).

## Not verified

- Human semantic double review of every mutation.
- Empirical equivalence of mutation difficulty.
- Inter-rater reliability.
- Absence of prior model exposure to public anchors.
- Performance of any candidate model.
- Publication-grade construct validity.

Machine-readable details: `audit/qc_summary.json` and `audit/bnat50_task_qc.csv`.

## Second-pass review

All 32 mutations were reread individually against the strict BNAT surface contract. Result: `PASS_SINGLE_REVIEW_WITH_LIMITATIONS`. See `audit/SEMANTIC_REVIEW_32.md`.

This is a model second pass, not an independent human double review. It confirms internal coherence and absence of obvious directional leakage, but not equal difficulty or psychometric validity.
