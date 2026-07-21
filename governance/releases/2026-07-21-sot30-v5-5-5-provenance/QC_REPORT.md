# SoT30 v5.5.5 — QC Report

Scope: provenance/label cleanup (E1/E2) + version-identity consistency over v5.5.4 (ADR-20260721-01, status `accepted`). Provenance/version only — no semantic/runtime/Supabase/memory change.

<!-- composition: changed=7 unchanged=23 baseline=v5.5.4 -->

| Gate | Result |
|---|---|
| exactly 30 knowledge files {00..29}, no extras (C1); support = 3 files (C1b) | PASS |
| SHA256SUMS / MANIFEST exact 30-set, correct hashes (C3/C4 full-path) | PASS |
| file-29 table = exact {00..28}, no self-hash (C5/C6) | PASS |
| T80 mirror BYTE-EQUAL + unique after the v5.5.5 identity bump (C7) | PASS — instructions header now `SoT30 v5.5.5` in both file 00 and the standalone |
| changed ∩ unchanged = ∅; changed ∪ unchanged = 30 (C9/C10) | PASS |
| changed set = actual diff to v5.5.4 baseline (C11) | PASS — 7 changed |
| package-version stamps consistent at v5.5.5 (C12) | PASS |
| **E1 — `generated_from: canonical_git_blobs` genuinely true** | PASS — built `--from-git ed8f3660`; 30/30 knowledge + instructions in ZIP byte-equal the git blobs; `generated_from_ref` set |
| **E2 — ZIP root `SoT30_v5.5.5/`** | PASS |
| ZIP single-root + exact allowlist + no dup/stray-dir + round-trip (C14) | PASS — 32/32 |
| release-tree ↔ extracted-ZIP byte parity, 33 files (C20) | PASS |
| composition tokens agree README/QC/receipt ↔ manifest (C19/T88) | PASS — changed=7 unchanged=23 |
| no ADR-lifecycle self-contradiction (C21) | PASS |
| LF policy (C15); no env/dep/cache/secret (C16) | PASS |
| verify selftest / build selftest | PASS — 18/18 · 8/8 |
| same-toolchain double build byte-identical | PASS |
| v5.5.4 immutability | PASS — v5.5.4 knowledge/support/ZIP byte-unchanged |

## Package facts

- knowledge files: 30 (changed 7: `00,01,02,22,25,28,29`; unchanged 23)
- corpus bytes: 4,039,886
- Project Instructions: 5,996 chars; byte-equal to the file-00 mirror (T80); header `SoT30 v5.5.5`
- ZIP: `dist/SoT30_v5.5.5.zip`, 1130206 bytes, sha256 `aae8255e79db539010921dcf9059450563a26fdd8f524be1776c5354f0895ac9`, root `SoT30_v5.5.5/`
- file 29: 12236 bytes, sha256 `678ca93c7977db4649c96c1a87cafd50e3ab345fc0b56551bb2a6df2bc963507`
- support/MANIFEST.json sha256 `b665c8679c4e1a4d21e8b29b996394adf8f82468e6e7325008b42fd2d6d42739`
- generated_from: `canonical_git_blobs`; generated_from_ref: `ed8f3660c1c425d51c02c04c150fefd1b4041154`

## Not checked (out of scope / pending)

- Live ChatGPT Project upload and T01–T93 live execution — not performed.
- No runtime / Supabase / memory-policy change — provenance/version only.

## Boundary

Static, in-repo assembly checks. No runtime, Supabase-write, or deployment change. No live Project verification. `iskra-memory-gateway` untouched. v5.5.4 immutable.
