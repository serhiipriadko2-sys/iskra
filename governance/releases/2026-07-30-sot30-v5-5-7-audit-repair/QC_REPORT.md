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

- corpus bytes: 4,055,060
- ZIP: `dist/SoT30_v5.5.7.zip`, 1136122 bytes, sha256 `d44767b0110595213fd407a6a8e2f6a19b07800722d420f5789c79ee28bb8f03`
- file 29: 14868 bytes, sha256 `7f1593849c30fefc27d3955521323113d8c43aa812e121c067e4349a3722c025`
- support/MANIFEST.json sha256 `bacb4f5f39c941f0f7f1a77ad200f908a8717df6b3ad8e20537326319c7e86f1`
- generated_from_ref: recorded in `support/MANIFEST.json` (`generated_from_ref`)

## Additional verification

- independent in-session rehash of all 32 SHA256SUMS entries against the release tree: PASS;
- ZIP extracted and diffed byte-for-byte against the release tree: PASS;
- no mojibake artifact in release-root docs (C26): PASS.

## Boundary

Static candidate only. No live Project pass, no runtime change, no Supabase write, no deployment, no artifact promotion, no merge authorization.
