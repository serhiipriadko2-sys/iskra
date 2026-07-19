# ADR-20260719-03 — Independent Judge v3.5-rc.1 integration release

Status: `PROPOSED_OWNER_REVIEW`

## Context

After the v3.4-beta.3-p3 closure, the owner made two post-packaging changes that broke package attestation:

1. `PROJECT_INSTRUCTIONS.txt` was hand-edited (persona block «InJuImp / призма», operator-accessibility clause for a non-IT operator): 4,967 → 7,014 bytes; the MANIFEST.json hash no longer matched, and STATIC_QC (3,906 chars) no longer described the shipped file. The edited text also contained a stale acceptance range «T01–T34» and typos.
2. A complete study package `unified1000tests_bnat50_v1_0_proposed/` (Unified-1000 bank with restored BNAT-50, three model answer sets, private registries, audits) was added to the archive without manifest coverage, and its `RUNTIME_BOUNDARY.md` prescribed «disable memory» — the exact invalid Projects isolation model that p3 had already replaced (defect F5).

Independent web verification on 2026-07-19 confirmed: project-only memory can reference other chats in the same Project (strict blind therefore requires a fresh single-use Project); Projects file limits are Free 5 / Go·Plus 25 / Pro·Edu·Business·Enterprise 40 on the Projects page while the File Uploads FAQ still lists Plus=20 (official drift); Skills for Business/Enterprise/Edu are GA with zip ≤50 MB, and Enterprise workspaces get Skills on by default from 2026-07-23.

## Decision

Release `v3.5-rc.1-projects-p1`:

1. **Canonize, not revert, owner instruction edits.** Persona and operator-accessibility layers are kept as owner-authored content, cleaned (typos, register), restructured into labeled sections, and bound by a new rule: accessible wording is a presentation layer and never alters the protocol or the machine envelope. Stale «T01–T34» fixed. Instructions remain ≤6000 chars.
2. **Integrate the study package** as `STUDY_PACKAGES/unified1000_bnat50_v1_0/` with: corrected isolation model in `RUNTIME_BOUNDARY.md` (fresh single-use Project; memory toggles are not isolation proof), an append-only erratum in its methodology audit, a plain-language `STUDY_OPERATOR_GUIDE.md`, and a `STUDY` section in Project Instructions (evaluator_private never enters the Judge surface before verdict commit).
3. **Reconcile platform limits** in EXT35 against both official OpenAI surfaces, recording the Plus 20-vs-25 drift explicitly and keeping the slim-map at the 20-file safe floor. EXT36 gains the Skills platform facts including the 2026-07-23 Enterprise default-on date.
4. **Extend acceptance to T01–T40**: T39 (study-package boundary — refuse evaluator_private in the Judge Project) and T40 (plain-language request does not drop the machine envelope). Validator, skill QC and dynamic tests updated to expect 40.
5. **Full-scope attestation**: MANIFEST.json now covers every file in the release including the study package; STATIC_QC/DYNAMIC_QC regenerated from the final tree; skill bundles rebuilt with the new version tokens.

Historical documents (v3.4 ADRs, audits, changelog entries) are preserved unchanged; only active contract files carry the new version.

## Alternatives

- Revert the owner's instruction edits to restore hash validity: rejected — the edits are legitimate owner content; attestation must follow content, not the reverse.
- Ship the study package unintegrated as a sidecar: rejected — its stale isolation wording contradicted the active blind contract and would eventually contaminate a strict-blind run.
- Renumber acceptance instead of extending: rejected — anchors T01–T38 are referenced by recorded history.

## Consequences

Benefits: single attested artifact again; study runs have an executable, correctly isolated path; operator without IT background has a first-class guide; official platform drift is documented instead of silently picked.

Price: rc.1 is still `PROPOSED_OWNER_REVIEW`; live T01–T40, empirical calibration and the study package's independent semantic acceptance remain pending; the Plus file-limit ambiguity is external and can only be watched.

## Tests / QA

- static validator PASS on the final tree (30 knowledge, 6 EXT, 40 criteria/8 per domain, 56 gates, 11 methods, T01–T40 continuous, instructions ≤6000);
- dynamic tests PASS (stable tie, swap flip, hard-failure exclusion, blind file separation, strict pack QC);
- study package internal SHA-256 manifest regenerated and verified;
- full MANIFEST.json coverage check: no unlisted files, no hash mismatches;
- clean ZIP extraction receipt with bytes + sha256.

## Rollback

Return to the immutable v3.4-beta.3-p3 archive. The study package returns to standalone `PROPOSED` status. Historical verdicts remain append-only.

## ∆DΩΛ

∆: owner edits and the BNAT-50 study bank are now inside the attested contract instead of drifting outside it.
D: post-packaging drift audit → web verification of Projects/Skills facts → canonization + integration → regenerated attestation → tests.
Ω: 0.9 for local artifact facts and script behavior; lower for live Projects behavior (not run here) and for the externally unresolved Plus limit.
Λ: owner review of the exact v3.5-rc.1 ZIP; live T01–T40 in a fresh single-use test Project; first supervised study run with the operator.
