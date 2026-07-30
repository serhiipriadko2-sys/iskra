# SoT30 v5.5.7 — Receipt

Assembled under ADR-20260730-01 (`proposed`) from a source-freeze commit via genuine `--from-git`. v5.5.6 remains immutable.

<!-- composition: changed=7 unchanged=23 baseline=v5.5.6 -->

## Artifact

| Item | Value |
|---|---|
| ZIP | `dist/SoT30_v5.5.7.zip` |
| ZIP bytes | 1134112 |
| ZIP sha256 | `efdbed0335ca70cf2b25dbc82c43ca078dd70e456cf3d30168d9fd37a23582cd` |
| ZIP root | `SoT30_v5.5.7/` |
| Knowledge files | 30 |
| Corpus bytes | 4,049,501 |
| file 29 sha256 | `a2f70d7183eeb560974e8be16fcf3e920a2518898c5aa37b023c250445d0253c` |
| support/MANIFEST.json sha256 | `01296550e4bd688523a9e4f022efc75263aefe5b9eb68d9bab81030a2a4a9df1` |
| Acceptance range | T01–T97 |
| Baseline | v5.5.6 (immutable) |
| generated_from | `canonical_git_blobs` |
| generated_from_ref | see `support/MANIFEST.json` |
| Changed vs v5.5.6 | `00,02,12,22,25,28,29` |

## Verification performed

- canonical build from the source-freeze commit recorded in `support/MANIFEST.json`: PASS;
- v5.5.7 verifier (C1–C26): 27/27 PASS; v5.5.4/v5.5.5/v5.5.6 regression: 27/27 PASS each;
- verifier selftest matrix: PASS (fixture counts in CI log);
- 30/30 Knowledge plus Project Instructions byte-equal to source-freeze blobs;
- v5.5.6 byte immutability: PASS;
- GitHub CI: pending push/read-back.

## Boundary

`live_project_verified=false`. Lifecycle stages, each requiring its own recorded authorization, none granted at build time:

| Stage | State |
|---|---|
| static package build + verifier | done (this receipt) |
| source_merge (candidate stored in repo) | pending owner/PR decision |
| artifact_promotion (declared active package) | **not authorized** |
| live_project_verified (clean-Project T01–T97 with receipts) | **not run** |

A future promotion receipt must bind: exact ZIP sha256, the 30 manifest hashes, the live Project identity, the T01–T97 outcomes, and the owner authorization — see `28_EVALS_ACCEPTANCE.md` (T93).
