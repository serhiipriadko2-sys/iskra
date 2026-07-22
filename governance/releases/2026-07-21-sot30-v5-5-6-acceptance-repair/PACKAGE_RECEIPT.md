# SoT30 v5.5.6 — Receipt

Assembled under ADR-20260721-02 from a source-freeze commit via genuine `--from-git`. v5.5.5 remains immutable.

<!-- composition: changed=10 unchanged=20 baseline=v5.5.5 -->

## Artifact

| Item | Value |
|---|---|
| ZIP | `dist/SoT30_v5.5.6.zip` |
| ZIP bytes | 1131422 |
| ZIP sha256 | `d86959641c9d78fea321a837d2ebf58e9406cf75acec84b9ea98b3d9d2dd9764` |
| ZIP root | `SoT30_v5.5.6/` |
| Knowledge files | 30 |
| Corpus bytes | 4,042,527 |
| file 29 sha256 | `d49823713ced1605bf399d922edb067514493b416e388422aca5780b940f01c0` |
| support/MANIFEST.json sha256 | `ddd70068b53382fe103c683e3af51644506900f99eeb8c49b0e32fa35f1ef804` |
| Acceptance range | T01–T93 |
| Baseline | v5.5.5 (immutable) |
| generated_from | `canonical_git_blobs` |
| generated_from_ref | `b31e861c4752aa26c003a2c0135e1c7ef2827dd9` |
| Changed vs v5.5.5 | `00,01,02,03,04,12,22,25,28,29` |

## Verification performed

- canonical build from `b31e861c4752aa26c003a2c0135e1c7ef2827dd9`: PASS;
- v5.5.6 verifier: 24/24 PASS; v5.5.5 regression: 24/24 PASS;
- verifier selftests: 32/32; build selftests: 9/9;
- 30/30 Knowledge plus Project Instructions byte-equal to source-freeze blobs;
- same-toolchain double build byte-identical;
- v5.5.5 byte immutability: PASS;
- GitHub CI: pending push/read-back.

## Boundary

`live_project_verified=false`. T01–T93 clean-Project rerun pending. Merge not authorized.
