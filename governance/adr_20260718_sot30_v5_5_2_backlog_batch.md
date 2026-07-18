# ADR-20260718-01: SoT30 v5.5.2 — Audit Backlog Batch (Mythic Router / Voices / RESEARCH)

Status: accepted

Date: 2026-07-18

Owner / Builder: Семён / Искра (Claude Code)

## Context

An independently cross-verified audit of SoT30 v5.5.1 (external "Kimi" audit, chapters 1–7, plus my own spot-verification of its highest-stakes claims — 8/8 confirmed exact against the live corpus, down to line numbers) produced a prioritized backlog of knowledge-file fixes covering three areas: the Mythic Cognition Router, the distributed "RESEARCH" function, and Voice-corpus completeness. This ADR closes the SoT30-knowledge-file portion of that backlog (P0-2, P1-1 doc-half, P1-2, P1-3, P1-4, P1-5) in a single reviewable release, per the repo's own convention that any edit to files 12/25/27/28 forces a version bump and integrity-chain regeneration.

`P0-1` (status-field fix in the standalone `dist/ISKRA_MYTHIC_ROUTER_v0_1_1.zip` package) is a separate artifact and is **not** part of this ADR. `P1-4`/`P1-5` were originally deferred pending the Supabase Metrics Compute Plane; since Atom 1 of that plane has since landed on `main`, they are included here per owner decision, drafted as self-reported/receipt-level guidance (Projects has no live telemetry — see file 09 §6.1 below), not as a claim of live measurement.

## Decisions

1. **Voice threshold drift (P0-2).** Added `12_COUNCIL_VOICES.md` §4.2 — the single normative table for numeric activation triggers (KAIN/pain, ISKRIV/drift, HUYNDUN/chaos, SAM/clarity, MAKI/trust+pain), explicitly split by mechanism (M1 selectVoice/candidate, M2 Λ-feedback, M3 Guard/veto/repair) so a legitimate cross-mechanism difference is not mistaken for drift, while a same-mechanism divergence is a definite fail. Added `T86-THRESHOLD-CONSISTENCY` to file 28.
2. **RESEARCH distributed by design (P1-1, doc half).** Added a note in `12_COUNCIL_VOICES.md` §2 declaring the research/hypothesis function (kernel `INVESTIGATE`, SIFT, ISKRIV/SAM, `A3·FOG` in file 27) intentionally distributed rather than a 10th Voice, explicitly cross-referencing the already-existing runtime contract `ADR-20260717-02` / `packages/core/src/research.types.ts` (`RESEARCH` capability, `canSelectVoice`/`canChangeFactStatus`/`canChangePermission`/`canPersist` all `false`) so the doc and runtime layers state the same boundary. No new named role introduced.
3. **FOG strengthened (P1-1, second half).** `27_WHAT_IF_SCENARIO_MATRIX.md` A3·FOG gained a forcing trigger condition, the same four-part authority boundary as the runtime `RESEARCH` contract, and a typed-output requirement (question, ≥1 evidence gap, `[HYP]`/`[INTERP]` label, provenance, verification route). Added `T87-FOG-RESEARCH-CONTRACT` to file 28.
4. **Veto contract fix (P1-2).** `06_SECURITY_INTEGRITY.md`'s claim that all 9 voices hold veto (with a broken `§2.2 файла 5` cross-reference — file 5 has no such section) is corrected to match the canonical typed subset already defined in `12_COUNCIL_VOICES.md` §6: `KAIN`/`ANHANTRA`/`ISKRIV` only, safety always wins over any voice-veto.
5. **SIBYL activated (P1-3).** `04_IDENTITY_NON_MIRROR.md`'s evolution table and statistics line marked SIBYL "(запланирован)"/pending while the historical mirror (`24_INTERFACE_STYLE.md`) already carries a full formula/prompt/test specification for it. Per owner decision: SIBYL is activated as the 9th voice on equal footing with the other 8, effective this ADR. `24_INTERFACE_STYLE.md`'s own internal stubs and the manual-vs-auto activation code discrepancy are **not** edited in this batch — per that file's own precedence header ("atomic files 00–23 and 25–29 override this historical repository mirror on conflicts"), the canonical activation in file 04 already governs; harmonizing the 74k-line mirror is a separate, non-atomic future task.
6. **Mythic Router activation guidance (P1-4).** `07_UNIVERSAL_ROUTER.md` gained a non-binding "SHOULD/MAY" activation guide (tied to Playbook mode and whether TRACE left a function-closeable gap) plus an advisory function→voice hints table for the 8 inquiry functions — explicit that inquiry still does not select a spokesperson (per `12_COUNCIL_VOICES.md` §1.4). Non-sovereign/optional character of the router is unchanged; this closes "no forcing condition, only 'optionally'" without making the stage mandatory.
7. **Mythic usage tracking (P1-5).** `09_METRICS_ENGINE.md` §6.1 adds a self-reported (not measured) `mythic_usage` receipt field — unit, function/register, fallback depth — with a qualitative (not numeric-threshold) repeat-pattern flag routing into the existing ISKRIV/SIFT audit path for scenario B21 ("myth stayed decorative", file 27). Explicitly not a live-telemetry claim: Projects has no execution environment, matching file 09's own "no inputs or method → no number" rule.

## Evidence

- All 7 file edits were verified against the live current-`main` coordinate immediately before editing (not from memory of an earlier audit pass), confirming no drift occurred between the original audit and this build.
- Hashing convention (LF-normalized content) verified against an untouched file's recorded v5.5.1 hash before regenerating the integrity chain.
- 23 of 30 files confirmed byte-identical to v5.5.1 by direct hash comparison.
- Full package: `dist/SoT30_v5.5.2.zip` (1,072,411 bytes, sha256 `2d38d09fb208616e6393f1a49baa48a7fb940bedf6f782157db426be3f3d98bb`), round-trip `sha256sum -c support/SHA256SUMS` = 32/32 OK. Detail: `governance/releases/2026-07-18-sot30-v5-5-2-backlog-batch/QC_REPORT.md`.

## Risk

- SIBYL's activation is a content/scope decision (a 9th voice now fully live), not a pure consistency fix — flagged explicitly here and in the package README rather than folded silently into a "drift correction."
- `T86`/`T87` and the Mythic Router/usage-tracking guidance are statically specified only; `LIVE-PROJECT-PASS` (a fresh Project upload running `T01`–`T87`) remains pending, same as the rest of the corpus.
- File 24's internal SIBYL stubs now visibly disagree with canon (file 04) until that file's own separate harmonization task is done — mitigated by file 24's own precedence rule, not eliminated.

## Rollback

Revert the 7 changed files to their v5.5.1 content (available unmodified at `governance/releases/2026-07-16-sot30-v5-5-1-full-package/`); regenerate file 29 / MANIFEST.json / SHA256SUMS / dist zip from that state; this ADR's status → `superseded`.

## Status

`accepted`. Not deployed to any live Project. No runtime, Supabase, or GitHub-app-behavior change. `iskra-memory-gateway` unchanged.
