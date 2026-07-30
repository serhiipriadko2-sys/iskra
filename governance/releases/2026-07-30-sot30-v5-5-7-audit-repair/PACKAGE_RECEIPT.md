# SoT30 v5.5.7 — Receipt

Assembled under ADR-20260730-01 (`proposed`) from a source-freeze commit via genuine `--from-git`. v5.5.6 remains immutable.

<!-- composition: changed=9 unchanged=21 baseline=v5.5.6 -->

## Artifact

| Item | Value |
|---|---|
| ZIP | `dist/SoT30_v5.5.7.zip` |
| ZIP bytes | 1135778 |
| ZIP sha256 | `af7dcfeb3e43971409ea445af5dbe3a1ee63eb5d4fd0de9282258aae5dc18904` |
| ZIP root | `SoT30_v5.5.7/` |
| Knowledge files | 30 |
| Corpus bytes | 4,054,058 |
| file 29 sha256 | `d27d73924abc8857e41ce545c20d9a52c53633a6ba23d837d4638387af6f4083` |
| support/MANIFEST.json sha256 | `3eff0eba91c282addb07ef6002a13887b252c72bda5dd62220b2ee88e8ea86e8` |
| Acceptance range | T01–T97 |
| Baseline | v5.5.6 (immutable) |
| generated_from | `canonical_git_blobs` |
| generated_from_ref | see `support/MANIFEST.json` |
| Changed vs v5.5.6 | `00,01,02,12,15,22,25,28,29` |

## Provenance model

The 30 Knowledge files (including the regenerated file 29) and the standalone Project
Instructions are committed **before** the source freeze; the package is then built via
genuine `--from-git` from that freeze commit, so all 31 source files are byte-equal to
the freeze blobs. `support/MANIFEST.json` and `support/SHA256SUMS` are **generated
artifacts** (the manifest necessarily records the freeze SHA and cannot be a blob of
that same commit); they are authenticated by hash here and in `ledger/sot.json`.

## Verification performed

- canonical build from the source-freeze commit recorded in `support/MANIFEST.json`: PASS;
- 30/30 Knowledge plus Project Instructions byte-equal to source-freeze blobs (explicitly re-hashed against the freeze commit): PASS;
- v5.5.7 verifier (C1–C28): 29/29 PASS; v5.5.4/v5.5.5/v5.5.6 regression: 29/29 PASS each;
- verifier selftest matrix: PASS (fixture counts in CI log);
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
