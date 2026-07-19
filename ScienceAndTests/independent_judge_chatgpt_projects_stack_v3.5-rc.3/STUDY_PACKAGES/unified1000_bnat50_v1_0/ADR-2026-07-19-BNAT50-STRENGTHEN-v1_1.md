# ADR-2026-07-19 — Unified-1000/BNAT-50 v1.1 strengthening pass

**Status:** PROPOSED_OWNER_REVIEW
**Decision date:** 2026-07-19

## Context

The v1.0 bank paired 50 preserved BNAT positions with 950 other tasks. A task-by-task audit found three blind zones and one dependency:

- 495 templated tasks exposed a `Маркер варианта: VNNNN` code — meaningless to a candidate and a contamination/gaming signal;
- 126 positions were bare topic labels (e.g. "Sharding → data distribution."), not scorable tasks;
- ~70 terse items are intentional probes (injection, emotional pressure, multi-turn, creative) whose power depends on terseness;
- the three frozen `aimodels/` answer sets are keyed by task number and would desync if task meaning changed.

Owner constraint: the 50 BNAT tasks must not be simplified, explained, or annotated — only preserved or made stronger.

## Decision

Release bank **v1.1** as the active candidate; archive v1.0 immutably in `versions/`.

1. **Preserve BNAT-50 byte-for-byte.** Verified: 50/50 bodies identical, 50/50 SHA-256 hashes still match the registry.
2. **Privatize 495 markers.** Move the codes to `evaluator_private/variant_marker_map.csv`; keep the `Дополнительный поворот:` instruction. Cosmetic to the candidate, so frozen answers stay valid.
3. **Strengthen 126 topic-label stubs** into real tasks that preserve topic and add a deliverable plus one discriminating "name a failure mode / what it does NOT solve" constraint. Max pairwise 3-gram Jaccard among them is 0.087 (no new template cluster).
4. **Preserve ~70 intentional probes** verbatim, documented — same principle as BNAT.
5. **Record the dependency:** the 126 rewrites make their frozen answers stale (`evaluator_private/answer_staleness_v1_1.json`); regenerate before scoring those positions.
6. **Document, not hide, template redundancy:** the 495-item grid is combinatorially similar by construction; mitigate with a held-out rotation per strong-claim run rather than a cosmetic rewrite.

## Alternatives rejected

- **Expand the terse probes too:** rejected — it destroys the construct, exactly what the BNAT rule forbids.
- **Rewrite all 495 templated tasks into unique items:** rejected — cannot be done to genuine quality in one pass; would recreate low-diversity soup. Handled methodologically instead.
- **Silently carry the frozen answers to v1.1:** rejected — the 126 rewrites changed the question; the staleness ledger makes this explicit.
- **Edit BNAT for consistency:** rejected — owner canon; byte-exact preservation wins.

## Consequences

- The candidate bank no longer leaks a test-grid code and has 126 fewer non-tasks.
- A study scoring authored positions must regenerate three answer sets first.
- Template redundancy remains a documented limitation, addressed by rotation, not by pretending it is fixed.
- v1.0 remains reproducible from `versions/` and its historical hash.

## Verification

- 1,000 tasks, IDs 1–1000 continuous; accounting 50+126+495+329=1000.
- BNAT byte-identical + hash-match: PASS.
- markers remaining in candidate: 0.
- no rubric-leak tokens introduced by authored tasks.
- `audit/qc_summary.json` regenerated; `MANIFEST.sha256` regenerated over the full package.

## Rollback

Restore `versions/unified_1000_questions_tasks_bnat50_v1_0.md` as the candidate and drop `variant_marker_map.csv` / `answer_staleness_v1_1.json`. Historical hashes remain append-only.

## ∆DΩΛ

∆: three blind zones closed and one dependency made explicit without weakening any BNAT position.
D: task-by-task audit → byte-exact BNAT preservation → marker privatization → 126 authored rewrites → regenerated QC/manifest.
Ω: 0.9 for local structural facts (hashes, counts, diversity); lower for empirical difficulty and construct validity, which remain unproven.
Λ: owner semantic review of the 126 authored items; regenerate the three answer sets for stale positions; first supervised study run under the corrected isolation model.
