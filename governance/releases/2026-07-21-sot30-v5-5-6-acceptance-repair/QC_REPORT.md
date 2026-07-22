# SoT30 v5.5.6 — QC Report

Scope: T85/T86 semantic acceptance repair over v5.5.5 (ADR-20260721-02, `accepted`).

<!-- composition: changed=10 unchanged=20 baseline=v5.5.5 -->

| Gate | Result |
|---|---|
| exactly 30 Knowledge + 3 support files | PASS |
| T80 mirror byte-equal + unique | PASS |
| changed set exactly 10 / unchanged 20 | PASS |
| C1?C23 verifier | PASS ? 24/24 |
| C23 targeted negative fixtures | PASS ? 8/8; full verifier matrix 32/32 |
| canonical `--from-git` provenance | PASS ? 30/30 + instructions at source freeze |
| v5.5.5 immutability | PASS ? git diff vs origin/main empty |

## Package facts

- corpus bytes: 4,042,527
- ZIP: `dist/SoT30_v5.5.6.zip`, 1131422 bytes, sha256 `d86959641c9d78fea321a837d2ebf58e9406cf75acec84b9ea98b3d9d2dd9764`
- file 29: 12621 bytes, sha256 `d49823713ced1605bf399d922edb067514493b416e388422aca5780b940f01c0`
- support/MANIFEST.json sha256 `ddd70068b53382fe103c683e3af51644506900f99eeb8c49b0e32fa35f1ef804`
- generated_from_ref: `b31e861c4752aa26c003a2c0135e1c7ef2827dd9`

## Additional verification

- v5.5.5 regression verifier: 24/24 PASS.
- verifier selftests: 32/32 PASS.
- build selftests: 9/9 PASS.
- same-toolchain canonical double build: byte-identical (`d8695964?`).
- SoT40 receipt, shard registry, phase1 ingestion and core-ADR gate: PASS.
- GitHub CI: pending push/read-back.

## Boundary

Static candidate only. No live Project pass, runtime change, Supabase write, deployment, or merge.
