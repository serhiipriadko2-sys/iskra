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

- corpus bytes: 4,055,351
- ZIP: `dist/SoT30_v5.5.7.zip`, 1136223 bytes, sha256 `31a14147f42eb4c9f880812a3a444a145c35e98b98ab0775ea5e94eefb8280e9`
- file 29: 14868 bytes, sha256 `70e939cf400710177bd7fe594541d7b4237d67cbd7e536911bc010627a56ab0f`
- support/MANIFEST.json sha256 `72ea88ac0bf7110664cdabebf55d2b8ed5f2b42d89ca252b44c335ff1cc3097c`
- generated_from_ref: recorded in `support/MANIFEST.json` (`generated_from_ref`)

## Additional verification

- independent in-session rehash of all 32 SHA256SUMS entries against the release tree: PASS;
- ZIP extracted and diffed byte-for-byte against the release tree: PASS;
- no mojibake artifact in release-root docs (C26): PASS.

## Boundary

Static candidate only. No live Project pass, no runtime change, no Supabase write, no deployment, no artifact promotion, no merge authorization.
