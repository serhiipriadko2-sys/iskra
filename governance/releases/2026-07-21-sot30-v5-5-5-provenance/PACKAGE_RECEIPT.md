# SoT30 v5.5.5 — Receipt

Assembled in-session 2026-07-21 by Claude Code from a **source-freeze commit** via genuine `--from-git`, under ADR-20260721-01 (status `accepted`). Provenance/version-only cleanup of the two in-ZIP inaccuracies deferred from v5.5.4 (E1/E2), plus active version-identity consistency. v5.5.4 remains immutable.

<!-- composition: changed=7 unchanged=23 baseline=v5.5.4 -->

## Artifact

| Item | Value |
|---|---|
| ZIP | `dist/SoT30_v5.5.5.zip` |
| ZIP bytes | 1130433 |
| ZIP sha256 | `13deb68478cc1f8697201b891cf9ef0a30bb2d4ad8a7363fe46ce3655b89a6f9` |
| ZIP root | `SoT30_v5.5.5/` (E2 resolved) |
| Knowledge files | 30 (00–29, unique) |
| Corpus bytes | 4,040,610 |
| file 29 sha256 | `3af7f29fde13d2210e362d28a1be47dc82da22ed9b17df5a4803aabdea3fc729` |
| support/MANIFEST.json sha256 | `456237bb7fa310afaf5ba75e87bf6e1592084a9188c74feb928a7e91a513fb08` |
| Project Instructions | 5996 chars; T80 byte-equal to file 00 mirror; header `SoT30 v5.5.5` |
| Acceptance range | T01–T93 |
| Baseline | v5.5.4 (immutable) |
| generated_from | `canonical_git_blobs` (E1 resolved — genuinely true) |
| generated_from_ref | `374d8714748252e979c51a94f3d1ee8a4a458693` (source-freeze commit) |
| Changed vs v5.5.4 | `00, 01, 02, 22, 25, 28, 29` (active identity) |

## Provenance (two-stage)

1. **Source freeze** (`374d8714`): final v5.5.5 knowledge (00–29, including the corrected file-29 active narrative; table byte-idempotent) + byte-equal Project Instructions committed.
2. **Canonical build**: `build_sot30_release.py --version v5.5.5 --from-git 374d8714 --git-source-dir <v5.5.5 release> --baseline governance/releases/2026-07-20-…/support/MANIFEST.json --baseline-version v5.5.4 --date 2026-07-21 --adr ADR-20260721-01`. Every source byte was extracted from `374d8714` via `git show`, so `canonical_git_blobs` is literally true.

(The earlier source-freeze `56ad422b`/`ed8f3660` and their zips are historical, superseded by the file-29 narrative fix.)

## Verification performed

- 30/30 knowledge + instructions in the ZIP are byte-equal to the git blobs at `374d8714`.
- T80: file-00 mirror byte-equal to the standalone, re-proven after the `SoT30 v5.5.3 → v5.5.5` identity bump.
- Semantic verifier C1–C22 PASS; verify selftest (positive + 22 negatives) all behave; build selftest 8/8; same-toolchain double build byte-identical.
- ZIP `unzip -t` clean; round-trip `sha256sum -c support/SHA256SUMS` from a fresh extraction = 32/32 OK; release-tree ↔ extracted-ZIP byte parity (33 files).
- v5.5.4 knowledge/support/ZIP byte-unchanged (immutability proof).

## Boundary

- NOT uploaded to a live ChatGPT Project. NOT T01–T93-run live.
- NOT a runtime / Supabase-write / memory-policy / deployment change.
- ADR-20260721-01 is `accepted` (architectural); live-Project verification pending.
- v5.5.4 immutable; its ZIP is not rewritten.
