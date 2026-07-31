# SoT30 v5.5.8 — QC Report

<!-- composition: changed=6 unchanged=24 baseline=v5.5.7 -->

| Gate | Result |
|---|---|
| 30 Knowledge + 3 support files | PASS — exact allowlist |
| changed set exact 6 / unchanged 24 | PASS |
| C1–C28 verifier | PASS — 29/29 |
| v5.5.4/v5.5.5/v5.5.6/v5.5.7 regression | PASS — 29/29 each |
| selftest matrix (incl. new C28 file-28 route-copy + C8 release-ceiling fixtures) | PASS |
| source blobs bound to freeze commit | PASS |
| repository CI | pending GitHub read-back |

- corpus bytes: 4,055,525
- ZIP: `dist/SoT30_v5.5.8.zip`, 1135927 bytes, sha256 `3a203488d497d08b3a9f7a96ea2fee52aab43751bb385656e8ee74f13a97ac6a`
- file 29: 7273 bytes, sha256 `31721e371049c5f12562591876f90c91d46b06452da4caf1df9abb4b66561b2d`
- support/MANIFEST.json sha256 `9db8f8da9fb3ac78a378bdefbba7963612c58be16503e74be892f0081b625966`
- Project Instructions: 5599/6000 platform chars (release budget ≤5600, reserve 401); every normative clause from v5.5.7 preserved, wording only tightened.

Boundary: package candidate only; no promotion, upload, invocation or live verification. Not independently adversarial-reviewed.
