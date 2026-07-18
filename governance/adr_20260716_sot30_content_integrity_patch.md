# ADR-20260716-02: SoT30 Content Integrity Patch (ATOM-S30-CONTENT-001)

Status: proposed
Date: 2026-07-16
Owner / Builder: Владелец / Claude Code

## Context

Two rounds of academic audit of the SoT30 v5.4.1 Knowledge corpus (00–29, uploaded as `SoT30_v5.4.zip`) surfaced a set of claimed cross-file inconsistencies (Kernel Order drift, Guard recompute mismatch, Council-default conflict, a `LAB` type confusion, an advisory-vs-authoritative Guard/Playbook mixup, metric-provenance looseness) plus a large embedded binary asset and a repeated unqualified consciousness claim in active files. Every one of these claims was independently re-verified by direct file reading in this session — exact grep with line numbers, byte-exact base64 decode + ZIP validity testing, and precise occurrence counting — rather than accepted from either audit at face value. Several specific sub-claims (that the embedded ZIP was corrupted; that a particular PR added a file to `main`; that the Council-default issue was a code-level type-error identical in kind to the `LAB` issue) were checked and found false or overstated; see `governance/releases/2026-07-16-sot30-v5-5-1-content-integrity/AUDIT_CORRECTIONS.md` for the full trail.

## Decision

Patch 12 of the 30 Knowledge files in five bounded atoms:

1. **`24_INTERFACE_STYLE.md`** — remove a 563,776-byte base64-embedded ZIP (independently confirmed valid, not corrupted, before removal) that contributed no retrieval value; replace with a receipt pointing to the real provenance (the live `runtime/iskraSpace/` tree in this repository).
2. **`04_IDENTITY_NON_MIRROR.md`, `05_TRUTH_SIFT_RAG.md`, `07_UNIVERSAL_ROUTER.md`** — wrap all 15 exact occurrences of an unqualified "ancient consciousness" epigraph with an adjacent `[HISTORICAL/MYTHIC REGISTER]` disclaimer, without altering the literary text itself.
3. **`01_PARITY_ADVANCEMENT_MANIFEST.md`, `08_STATECYCLE_RUNTIME.md`, `09_METRICS_ENGINE.md`, `13_OUTPUT_RECEIPTS_ANTI_EMPTY.md`** — sync the stale pre-mythic-router "Kernel Order v4" to the current canonical order (adding `MYTHIC_INQUIRY`/`MYTHIC_EXPRESSION`), traced to `ADR-20260714-01`'s diff-scope explicitly excluding these 4 files; file 01's historical achievement row is annotated `SUPERSEDED`, not rewritten, preserving its own function as a parity-tracking record.
4. **`10_ENTROPY_FRACTAL_EWS.md`, `11_SLO_PLAYBOOK_CONTROL.md`, `20_GOVERNANCE_ADR.md`** — close a confirmed gap where the Guard recompute predicate in 10/11 did not require the alert floor to strictly increase (only that the decision changed), unlike the hard AND in `00`/`28`; unify all three around one formula.
5. **`27_WHAT_IF_SCENARIO_MATRIX.md`** — make the default Council reference an explicit `CouncilMode: NONE` (the prior "режим COUNCIL" was never defined as an alias for the typed enum); separate `LAB` (a profile label) from the Guard-decision field in 3 scenarios; relabel 4 scenarios that recorded an advisory EWS recommendation as if it were a final Guard→Playbook mapping; add a metric-provenance gating note.

This ADR does not activate, deploy, or live-verify anything. It is Knowledge-only:

- no `runtime/` code changed;
- no Supabase schema or `iskra_memory.*` write;
- no ChatGPT Project has been created or tested against these changes.

## Evidence

- Full rationale, before/after quotes: `governance/releases/2026-07-16-sot30-v5-5-1-content-integrity/KNOWLEDGE_DIFF.md`.
- Audit-claim verification trail (confirmed vs. disproved): `.../AUDIT_CORRECTIONS.md`.
- Byte counts, hashes: `.../MANIFEST.json`, `.../SHA256SUMS`.
- Static QC: `.../QC_REPORT.md`.

## Risk

- This patch does not resolve the separate file-13 Ω-wording drift against `support/MANIFEST.json`/`29_INDEX_UPLOAD_MANIFEST.md` (tracked, not in scope here) — this atom's file-13 edit is layered on the `SoT30_v5.4.zip` variant of that file, not a reversion.
- File 24's much larger embedded "### FILE ·" catalog (beyond the one asset removed) and file 25's mythic corpus remain unexamined at this depth; a future atom should characterize them before any further compaction.
- `T01`–`T85` have not been run against this patched content in a live Project.

## Next

1. Merge this ADR + its release delta as `proposed → accepted` once reviewed.
2. Combine with the PR #264 v5.5 delta for the next full 30-file package upload.
3. Run `T01`–`T85` in a fresh Business Project with project-only memory confirmed; record outcomes.
4. Open a follow-up atom for file 24's remaining embedded catalog once its actual scope (file count, total bytes, provenance) is characterized.

## Status

`proposed` — awaiting Owner acceptance. Not canonically active. Not deployed. Not live-verified.
