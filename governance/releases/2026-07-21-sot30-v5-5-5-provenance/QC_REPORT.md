# SoT30 v5.5.5 — QC Report

Scope: provenance/label cleanup (E1/E2) + version-identity consistency over v5.5.4 (ADR-20260721-01, status `accepted`). Provenance/version only — no semantic/runtime/Supabase/memory change.

<!-- composition: changed=7 unchanged=23 baseline=v5.5.4 -->

| Gate | Result |
|---|---|
| exactly 30 knowledge files {00..29}, no extras (C1); support = 3 files (C1b) | PASS |
| SHA256SUMS / MANIFEST exact 30-set, correct hashes (C3/C4 full-path) | PASS |
| file-29 table = exact {00..28}, no self-hash (C5/C6) | PASS |
| T80 mirror BYTE-EQUAL + unique after the v5.5.5 identity bump (C7) | PASS — instructions header `SoT30 v5.5.5` in both file 00 and the standalone |
| changed ∩ unchanged = ∅; changed ∪ unchanged = 30 (C9/C10) | PASS |
| changed set = actual diff to v5.5.4 baseline (C11) | PASS — 7 changed |
| package-version stamps consistent at v5.5.5 (C12) | PASS |
| **E1 — `generated_from: canonical_git_blobs` genuinely true** | PASS — built `--from-git 374d8714`; 30/30 knowledge + instructions in ZIP byte-equal the git blobs; `generated_from_ref` set |
| **E2 — ZIP root `SoT30_v5.5.5/`** | PASS |
| ZIP single-root + exact allowlist + no dup/stray-dir + round-trip (C14) | PASS — 32/32 |
| release-tree ↔ extracted-ZIP byte parity, 33 files (C20) | PASS |
| composition tokens agree README/QC/receipt ↔ manifest (C19/T88) | PASS — changed=7 unchanged=23 |
| no ADR-lifecycle self-contradiction (C21) | PASS |
| **file-29 active-identity consistency (C22)** | PASS — one "(this build)" section = v5.5.5; supersedes ⊇ v5.5.4; composition ⊇ v5.5.4; no internal accepted-vs-proposed contradiction |
| LF policy (C15); no env/dep/cache/secret (C16) | PASS |
| verify selftest (positive + 22 negatives incl. 5 C22) / build selftest | PASS — all behave · 8/8 |
| same-toolchain double build byte-identical | PASS |
| v5.5.4 immutability | PASS — v5.5.4 knowledge/support/ZIP byte-unchanged |

## Package facts

- knowledge files: 30 (changed 7: `00,01,02,22,25,28,29`; unchanged 23)
- corpus bytes: 4,040,610
- Project Instructions: 5,996 chars; byte-equal to the file-00 mirror (T80); header `SoT30 v5.5.5`
- ZIP: `dist/SoT30_v5.5.5.zip`, 1130433 bytes, sha256 `13deb68478cc1f8697201b891cf9ef0a30bb2d4ad8a7363fe46ce3655b89a6f9`, root `SoT30_v5.5.5/`
- file 29: 12960 bytes, sha256 `3af7f29fde13d2210e362d28a1be47dc82da22ed9b17df5a4803aabdea3fc729`
- support/MANIFEST.json sha256 `456237bb7fa310afaf5ba75e87bf6e1592084a9188c74feb928a7e91a513fb08`
- generated_from: `canonical_git_blobs`; generated_from_ref: `374d8714748252e979c51a94f3d1ee8a4a458693` (source-freeze)

## Not checked (out of scope / pending)

- Live ChatGPT Project upload and T01–T93 live execution — not performed.
- No runtime / Supabase / memory-policy change — provenance/version only.

## Boundary

Static, in-repo assembly checks. No runtime, Supabase-write, or deployment change. No live Project verification. `iskra-memory-gateway` untouched. v5.5.4 immutable.
