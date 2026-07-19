# CHANGELOG

## v3.5-rc.1-projects-p1 — 2026-07-19

Status: `PROPOSED_OWNER_REVIEW` (ADR-20260719-03)

### Added

- STUDY_PACKAGES/unified1000_bnat50_v1_0 integrated (Unified-1000 bank + BNAT-50 + three model answer sets) with corrected isolation model and plain-language STUDY_OPERATOR_GUIDE;
- acceptance T39 (study-package boundary) and T40 (plain language keeps machine envelope);
- ОПЕРАТОР and STUDY sections in Project Instructions;
- EXT36 platform facts (Skills GA surfaces; Enterprise default-on 2026-07-23).

### Fixed

- owner post-packaging edits of PROJECT_INSTRUCTIONS.txt canonized (persona + accessibility), typos and stale «T01–T34» removed; manifest hash restored by re-attestation;
- study-package RUNTIME_BOUNDARY «disable memory» replaced with fresh single-use Project isolation (aligns with 18/EXT33);
- EXT35 Plus limit reconciled with official sources; Plus 20-vs-25 official drift documented; slim-map kept at 20-file safe floor;
- MANIFEST.json extended to full release scope (previously 38 files were unlisted).

### Preserved

- 30 permanent Knowledge files; 40-file owner budget; Q/S/A/R/G primary vector; hard gates before scoring; C100 inactive; DIAGNOSTIC_ONLY default; no formal winner without method and reliability evidence; historical v3.4 documents unchanged.

## v3.4-beta.3-projects-p3 — 2026-07-19

Status: `PROPOSED_OWNER_REVIEW`

### Fixed

- synchronized active version to beta.3;
- corrected extension count to EXT31–EXT36;
- replaced false `memory OFF + fresh chat` strict-blind assumption with fresh single-use Project isolation;
- standardized `A-EXTERNAL-ACTION` and strict registry validation;
- corrected stable-tie swap math;
- excluded hard-failed/invalid runs from study means;
- stopped inferring pairwise study winners from Q100 alone;
- separated blind batch and sealed manifest outputs;
- added `agents/openai.yaml` to all five skills;
- removed cache artifacts from packaged skills;
- replaced stale manifests and receipts.

### Added

- acceptance T35–T38;
- operator deployment, blind and Skills guides;
- strict package validator and dynamic script tests;
- full and upload-only artifact receipts.

### Preserved

- 30 permanent Knowledge files;
- 40-file Project budget (30 permanent + 10 runtime);
- Q/S/A/R/G primary vector;
- hard gates before scoring;
- C100 inactive by default;
- DIAGNOSTIC_ONLY default validity;
- no formal winner without method and reliability evidence.
