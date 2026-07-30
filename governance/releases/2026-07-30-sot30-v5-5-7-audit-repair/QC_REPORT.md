# SoT30 v5.5.7 — QC Report

Scope: audit repair over v5.5.6 (ADR-20260730-01, `proposed`).

<!-- composition: changed=9 unchanged=21 baseline=v5.5.6 -->

| Gate | Result |
|---|---|
| exactly 30 Knowledge + 3 support files | PASS |
| T80 mirror byte-equal + unique | PASS |
| changed set exactly 9 / unchanged 21 | PASS |
| C1–C28 verifier | PASS — 29/29 |
| v5.5.4/v5.5.5/v5.5.6 regression under hardened verifier | PASS — 29/29 each |
| verifier selftest matrix (incl. C23–C28 fixtures) | PASS |
| source-freeze byte parity (30 Knowledge + Instructions vs freeze commit) | PASS |
| v5.5.6 immutability | PASS — v5.5.6 release tree and ZIP untouched |

## Package facts

- corpus bytes: 4,054,058
- ZIP: `dist/SoT30_v5.5.7.zip`, 1135778 bytes, sha256 `af7dcfeb3e43971409ea445af5dbe3a1ee63eb5d4fd0de9282258aae5dc18904`
- file 29: 14868 bytes, sha256 `d27d73924abc8857e41ce545c20d9a52c53633a6ba23d837d4638387af6f4083`
- support/MANIFEST.json sha256 `3eff0eba91c282addb07ef6002a13887b252c72bda5dd62220b2ee88e8ea86e8`
- generated_from_ref: recorded in `support/MANIFEST.json` (`generated_from_ref`)

## Additional verification

- independent in-session rehash of all 32 SHA256SUMS entries against the release tree: PASS;
- ZIP extracted and diffed byte-for-byte against the release tree: PASS;
- no mojibake artifact in release-root docs (C26): PASS.

## Boundary

Static candidate only. No live Project pass, no runtime change, no Supabase write, no deployment, no artifact promotion, no merge authorization.
