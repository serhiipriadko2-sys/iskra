# SoT30 v5.4.1 Static QC Report

- Content checks: 55
- PASS: 55
- FAIL: 0
- Knowledge files: 30
- Changed Knowledge files from v5.4: 7
- Project Instructions Unicode characters: 5907
- Acceptance prompts: 76
- Myth fragments: 30
- Myth arcs: 6
- Corpus/routed/deduplicated sources: 18/17/1
- Runtime code changed: no
- GitHub changed: no
- Supabase/memory changed: no
- Package checksum scope: every file except `support/SHA256SUMS`

## Changed Knowledge files
- `00_PROJECT_ROUTER.md`
- `05_TRUTH_SIFT_RAG.md`
- `07_UNIVERSAL_ROUTER.md`
- `20_GOVERNANCE_ADR.md`
- `25_LIBER_SPACE_BUSIDO.md`
- `28_EVALS_ACCEPTANCE.md`
- `29_INDEX_UPLOAD_MANIFEST.md`

## Gates
- PASS `exactly_30_knowledge_files` — 30
- PASS `numbering_00_29_unique` — [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29]
- PASS `project_instructions_le_6000` — 5907
- PASS `acceptance_T01_T76_contiguous` — [1, 2, 3]..[74, 75, 76] count=76
- PASS `live_gate_T76`
- PASS `t76_dropin_present`
- PASS `t76_fixture_F1`
- PASS `t76_fixture_F2`
- PASS `t76_fixture_F3`
- PASS `premise_gate_00_PROJECT_ROUTER.md`
- PASS `premise_gate_05_TRUTH_SIFT_RAG.md`
- PASS `premise_gate_07_UNIVERSAL_ROUTER.md`
- PASS `premise_gate_20_GOVERNANCE_ADR.md`
- PASS `premise_gate_25_LIBER_SPACE_BUSIDO.md`
- PASS `version_router_v541`
- PASS `version_instructions_v541`
- PASS `version_index_v541`
- PASS `fragment_count_30`
- PASS `arc_count_6`
- PASS `corpus_accounting`
- PASS `no_runtime_code_tree`
- PASS `manifest_match_00_PROJECT_ROUTER.md`
- PASS `manifest_match_01_PARITY_ADVANCEMENT_MANIFEST.md`
- PASS `manifest_match_02_PROJECTS_SURFACE_MAP.md`
- PASS `manifest_match_03_TELOS_MANTRA_PRINCIPLES.md`
- PASS `manifest_match_04_IDENTITY_NON_MIRROR.md`
- PASS `manifest_match_05_TRUTH_SIFT_RAG.md`
- PASS `manifest_match_06_SECURITY_INTEGRITY.md`
- PASS `manifest_match_07_UNIVERSAL_ROUTER.md`
- PASS `manifest_match_08_STATECYCLE_RUNTIME.md`
- PASS `manifest_match_09_METRICS_ENGINE.md`
- PASS `manifest_match_10_ENTROPY_FRACTAL_EWS.md`
- PASS `manifest_match_11_SLO_PLAYBOOK_CONTROL.md`
- PASS `manifest_match_12_COUNCIL_VOICES.md`
- PASS `manifest_match_13_OUTPUT_RECEIPTS_ANTI_EMPTY.md`
- PASS `manifest_match_14_MEMORY_MODEL.md`
- PASS `manifest_match_15_SUPABASE_MEMORY_PLANE.md`
- PASS `manifest_match_16_SHADOW_LAYER.md`
- PASS `manifest_match_17_DREAMSPACE_DREAMSEED.md`
- PASS `manifest_match_18_HORIZON_WEAVER.md`
- PASS `manifest_match_19_DRY_DARK_RUN_PROTOCOL.md`
- PASS `manifest_match_20_GOVERNANCE_ADR.md`
- PASS `manifest_match_21_WORKFLOW_OPS_LEDGER.md`
- PASS `manifest_match_22_CONNECTORS_TOOLS_BOUNDARY.md`
- PASS `manifest_match_23_BUILDER_PROJECTS_COMPAT.md`
- PASS `manifest_match_24_INTERFACE_STYLE.md`
- PASS `manifest_match_25_LIBER_SPACE_BUSIDO.md`
- PASS `manifest_match_26_SOMATIC_INTUITION.md`
- PASS `manifest_match_27_WHAT_IF_SCENARIO_MATRIX.md`
- PASS `manifest_match_28_EVALS_ACCEPTANCE.md`
- PASS `manifest_match_29_INDEX_UPLOAD_MANIFEST.md`
- PASS `knowledge_set_sha256`
- PASS `no_openai_secret_pattern`
- PASS `no_github_pat_pattern`
- PASS `no_live_private_key_block_outside_known_fixture`

## Boundary
This report is itself covered by `support/SHA256SUMS`; checksum verification and ZIP integrity are attested by the external artifact receipt. Live Project behavior remains unverified.
