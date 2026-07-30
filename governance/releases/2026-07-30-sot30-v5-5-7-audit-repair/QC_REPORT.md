# SoT30 v5.5.7 — QC Report

Scope: audit repair over v5.5.6 (ADR-20260730-01, `proposed`).

<!-- composition: changed=7 unchanged=23 baseline=v5.5.6 -->

| Gate | Result |
|---|---|
| exactly 30 Knowledge + 3 support files | PASS |
| T80 mirror byte-equal + unique | PASS |
| changed set exactly 7 / unchanged 23 | PASS |
| C1–C26 verifier | PASS — 27/27 |
| v5.5.4/v5.5.5/v5.5.6 regression under hardened verifier | PASS — 27/27 each |
| verifier selftest matrix (incl. new C23–C26 fixtures) | PASS |
| v5.5.6 immutability | PASS — v5.5.6 release tree and ZIP untouched |

## Package facts

- corpus bytes: 4,049,501
- ZIP: `dist/SoT30_v5.5.7.zip`, 1134112 bytes, sha256 `efdbed0335ca70cf2b25dbc82c43ca078dd70e456cf3d30168d9fd37a23582cd`
- file 29: 14169 bytes, sha256 `a2f70d7183eeb560974e8be16fcf3e920a2518898c5aa37b023c250445d0253c`
- support/MANIFEST.json sha256 `01296550e4bd688523a9e4f022efc75263aefe5b9eb68d9bab81030a2a4a9df1`
- generated_from_ref: recorded in `support/MANIFEST.json` (`generated_from_ref`)

## Additional verification

- independent in-session rehash of all 32 SHA256SUMS entries against the release tree: PASS;
- ZIP extracted and diffed byte-for-byte against the release tree: PASS;
- no mojibake artifact in release-root docs (C26): PASS.

## Boundary

Static candidate only. No live Project pass, no runtime change, no Supabase write, no deployment, no artifact promotion, no merge authorization.
