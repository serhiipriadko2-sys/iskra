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

- corpus bytes: __CORPUS_BYTES__
- ZIP: `dist/SoT30_v5.5.7.zip`, __ZIP_BYTES__ bytes, sha256 `__ZIP_SHA256__`
- file 29: __F29_BYTES__ bytes, sha256 `__F29_SHA256__`
- support/MANIFEST.json sha256 `__MANIFEST_SHA256__`
- generated_from_ref: recorded in `support/MANIFEST.json` (`generated_from_ref`)

## Additional verification

- independent in-session rehash of all 32 SHA256SUMS entries against the release tree: PASS;
- ZIP extracted and diffed byte-for-byte against the release tree: PASS;
- no mojibake artifact in release-root docs (C26): PASS.

## Boundary

Static candidate only. No live Project pass, no runtime change, no Supabase write, no deployment, no artifact promotion, no merge authorization.
