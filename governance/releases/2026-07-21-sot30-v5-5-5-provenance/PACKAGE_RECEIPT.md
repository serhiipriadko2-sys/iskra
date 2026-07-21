# SoT30 v5.5.5 — Receipt

Assembled in-session 2026-07-21 by Claude Code from a **source-freeze commit** via genuine `--from-git`, under ADR-20260721-01 (status `accepted`). Provenance/version-only cleanup of the two in-ZIP inaccuracies deferred from v5.5.4 (E1/E2), plus active version-identity consistency. v5.5.4 remains immutable.

<!-- composition: changed=7 unchanged=23 baseline=v5.5.4 -->

## Artifact

| Item | Value |
|---|---|
| ZIP | `dist/SoT30_v5.5.5.zip` |
| ZIP bytes | 1130206 |
| ZIP sha256 | `aae8255e79db539010921dcf9059450563a26fdd8f524be1776c5354f0895ac9` |
| ZIP root | `SoT30_v5.5.5/` (E2 resolved) |
| Knowledge files | 30 (00–29, unique) |
| Corpus bytes | 4,039,886 |
| file 29 sha256 | `678ca93c7977db4649c96c1a87cafd50e3ab345fc0b56551bb2a6df2bc963507` |
| support/MANIFEST.json sha256 | `3d3cae4c62d5352f712d59e569df37b3d80c49f0c53437da267a0e85261da553` |
| Project Instructions | 5996 chars; T80 byte-equal to file 00 mirror; header `SoT30 v5.5.5` |
| Acceptance range | T01–T93 |
| Baseline | v5.5.4 (immutable) |
| generated_from | `canonical_git_blobs` (E1 resolved — genuinely true) |
| generated_from_ref | `ed8f3660c1c425d51c02c04c150fefd1b4041154` (source-freeze commit) |
| Changed vs v5.5.4 | `00, 01, 02, 22, 25, 28, 29` (active identity) |

## Provenance (two-stage)

1. **Source freeze** (`ed8f3660`): final v5.5.5 knowledge (00–29 with the regenerated file-29 table) + byte-equal Project Instructions committed.
2. **Canonical build**: `build_sot30_release.py --version v5.5.5 --from-git ed8f3660 --git-source-dir <v5.5.5 release> --baseline governance/releases/2026-07-20-…/support/MANIFEST.json --baseline-version v5.5.4 --date 2026-07-21 --adr ADR-20260721-01`. Every source byte was extracted from `ed8f3660` via `git show`, so `canonical_git_blobs` is literally true.

## Verification performed

- 30/30 knowledge + instructions in the ZIP are byte-equal to the git blobs at `ed8f3660`.
- T80: file-00 mirror byte-equal to the standalone, re-proven after the `SoT30 v5.5.3 → v5.5.5` identity bump.
- Semantic verifier C1–C21 PASS; verify selftest 18/18; build selftest 8/8; same-toolchain double build byte-identical.
- ZIP `unzip -t` clean; round-trip `sha256sum -c support/SHA256SUMS` from a fresh extraction = 32/32 OK; release-tree ↔ extracted-ZIP byte parity (33 files).
- v5.5.4 knowledge/support/ZIP byte-unchanged (immutability proof).

## Boundary

- NOT uploaded to a live ChatGPT Project. NOT T01–T93-run live.
- NOT a runtime / Supabase-write / memory-policy / deployment change.
- ADR-20260721-01 is `accepted` (architectural); live-Project verification pending.
- v5.5.4 immutable; its ZIP is not rewritten.
