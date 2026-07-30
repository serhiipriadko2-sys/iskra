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

- corpus bytes: 4,053,183
- ZIP: `dist/SoT30_v5.5.7.zip`, 1135448 bytes, sha256 `ef1047f6aad75cb38accf49cd6d99ad4a8fb774eb4c0c155c5f329596fd98d56`
- file 29: 14868 bytes, sha256 `b7be058ae12d0342d5f02d5677ee3cc78a8d314c60da09b5d57d597295d39f0d`
- support/MANIFEST.json sha256 `7a07216ced6bcfa57bb7bf9b12e6ba887449556b6c9264415ec5778040446c42`
- generated_from_ref: recorded in `support/MANIFEST.json` (`generated_from_ref`)

## Additional verification

- independent in-session rehash of all 32 SHA256SUMS entries against the release tree: PASS;
- ZIP extracted and diffed byte-for-byte against the release tree: PASS;
- no mojibake artifact in release-root docs (C26): PASS.

## Boundary

Static candidate only. No live Project pass, no runtime change, no Supabase write, no deployment, no artifact promotion, no merge authorization.
