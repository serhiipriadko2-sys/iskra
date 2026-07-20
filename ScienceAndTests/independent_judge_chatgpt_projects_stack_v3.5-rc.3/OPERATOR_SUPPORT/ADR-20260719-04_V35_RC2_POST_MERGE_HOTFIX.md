# ADR-20260719-04 — Independent Judge v3.5-rc.2 post-merge audit hotfix

Status: `PROPOSED_OWNER_REVIEW`

## Context

PR #280 merged v3.5-rc.1 as a research checkpoint. An independent post-merge audit (ISKRIV) found load-bearing findings that block valid study/comparative use while leaving diagnostic use of the 30-file core allowed. This ADR records the rc.2 hotfix and, honestly, which findings were confirmed vs partially accurate.

## Findings adjudicated against source

- **F1 (CONFIRMED, HIGH):** `study_stats.eligible()` let `aggregate_eligible: true` override the hard-failure/run-status veto, so a hard-failed run could enter the mean. Fixed: vetoes are now unconditional; `aggregate_eligible` can only further exclude. Added adversarial test `aggregate_eligible=true + hard_failure` → excluded (dynamic suite now 6/6).
- **F2 (CONFIRMED, HIGH):** `STUDY_OPERATOR_GUIDE.md` referenced the archived `v1_0` path and called the frozen answers ready for all 1000 tasks. Fixed: active path is `v1_1`; answers marked v1.0-derived; 126 stale positions carry a hard stop; only 874 positions are scorable without regeneration.
- **F3 (CONFIRMED, HIGH):** guide allowed manual blind labelling and file 29 listed blind mappings in reserved slots. Fixed: manual mapping forbidden for STRICT_BLIND; sealed mapping/answer key never enter a Judge Project; slots take only neutralized candidate files.
- **F4 (PARTIAL):** `pack_qc.py` printed `FAIL` but exited 0 — fixed with a terminal `sys.exit`. The audit also flagged `validate_pack.py`; on inspection it ALREADY exited non-zero on FAIL, so no change there. Reported honestly.
- **F5 (CONFIRMED, GOVERNANCE):** three different ZIP SHA-256 values existed across diary/evidence/PR because the ZIP was rebuilt three times. Fixed: rc.2 is built once; a single authoritative receipt lives in `BUILD_RECEIPT_PREZIP.json`; prior hashes are superseded in memory files with explicit notes (history not rewritten).
- **F6 (CONFIRMED, MEDIUM):** the `.pyc` was already absent from disk and `MANIFEST.json`, but `FILE_INVENTORY.csv` still listed it (stale inventory). Fixed: inventory regenerated clean; CI now fails on any cache artifact.
- **F7 (CONFIRMED, MEDIUM-HIGH):** `KIMI_SOURCE_README.md` still told operators to turn Project memory off and use T01–T34. Fixed: strong `SUPERSEDED / DO NOT FOLLOW` banner pointing to `README_UPLOAD.md`.
- **F8 (CONFIRMED, MEDIUM):** file 29 pointed at a `MANIFEST.sha256` beside `knowledge/` that does not exist for the core. Fixed: it now points at `OPERATOR_SUPPORT/MANIFEST.json` (full scope) and clarifies the study sub-manifest.
- **F9 (CONFIRMED, MEDIUM):** no CI ran judge QC. Added `.github/workflows/judge_stack_qc.yml` running validate_pack, test_dynamic, pack_qc and manifest/cache checks on the active stack.

## Decision

Release `v3.5-rc.2-projects-p1` on the same designated branch, restarted from merged `main`. Bump active version tokens rc.1→rc.2; supersedes v3.5-rc.1-projects-p1. Keep all rc.1 governance history append-only.

## Consequences

Study aggregation is now safe against hard-failure laundering; QC scripts fail loudly; operator docs no longer carry the invalid isolation model; release identity is single-sourced; CI enforces the QC that was previously only a PR-body claim. Study of the 126 authored positions still requires answer regeneration; live T01–T40 and empirical calibration remain NOT_RUN.

## Verification

- static validator PASS (exit 0); dynamic 6/6; pack_qc exits 0 on PASS / 1 on FAIL; MANIFEST v2 full-scope consistent; no cache artifacts; single ZIP SHA-256 recorded once.

## Rollback

Return to the merged rc.1 tree (git history) and this ADR. Study remains BLOCKED until regeneration regardless.

## ∆DΩΛ

∆: nine post-merge findings adjudicated against source and fixed (or shown already-correct), study aggregation made safe, release identity single-sourced.
D: PR #280 head read-back → per-finding source verification → targeted fixes → 6/6 dynamic + exit-coded QC → single-build attestation.
Ω: 0.9 for local code/doc facts and reproduced test behavior; lower for live Projects behavior and empirical validity (NOT_RUN).
Λ: owner review of rc.2; regenerate 126×3 answers; live T01–T40 in a fresh single-use Project; first supervised study run.
