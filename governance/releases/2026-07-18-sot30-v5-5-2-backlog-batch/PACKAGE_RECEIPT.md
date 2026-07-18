# SoT30 v5.5.2 Backlog Batch — Receipt

Assembled and verified in-session 2026-07-18 by Claude Code, from the v5.5.1 full merged package (`governance/releases/2026-07-16-sot30-v5-5-1-full-package/`) plus the independently cross-verified SoT30 audit backlog (`governance/adr_20260718_sot30_v5_5_2_backlog_batch.md`).

## Artifact

| Item | Value |
|---|---|
| ZIP | `dist/SoT30_v5.5.2.zip` |
| ZIP bytes | 1072411 |
| ZIP sha256 | `2d38d09fb208616e6393f1a49baa48a7fb940bedf6f782157db426be3f3d98bb` |
| Knowledge files | 30 (00–29, unique) |
| Corpus bytes | 4024145 |
| file 29 sha256 | `9bd00ca63b8df5d55772a209ebff232e1bf102430e1c43742c404baa1edb2cf2` |
| Project Instructions | 5996 chars; unchanged from v5.5.1 (no file 00 edit this batch) |
| Acceptance range | T01–T87 (contiguous; T86/T87 new) |
| Changed files (7) | 04, 06, 07, 09, 12, 27, 28 |
| Unchanged files (23) | 00 01 02 03 05 08 10 11 13 14 15 16 17 18 19 20 21 22 23 24 25 26 |

## Verification performed

- 30 unique numbered files; 23 confirmed byte-identical to v5.5.1 by direct hash comparison (not assumed).
- Hashing convention verified before regeneration: LF-normalized content matches the v5.5.1 recorded hash for an untouched file; raw (CRLF) hash does not — the zip is staged from LF-normalized copies for this reason.
- ZIP `unzip -t` clean; built with 7-Zip (forward-slash entry paths) after a first attempt via PowerShell `Compress-Archive` produced backslash-separated entries.
- Round-trip check: extracted to a clean temp directory, `sha256sum -c support/SHA256SUMS` from package root = 32/32 OK, 0 failures.
- SHA256SUMS covers every package file except itself (32 entries incl. `support/MANIFEST.json`).
- Each of the 7 changed files verified against its live current-`main` coordinate before editing (files 04:572/583, 06:2860, 07 kernel section, 09 §6, 12 §2/§4.1, 27 A3, 28 T85-tail) — not edited from memory of an earlier session.

## Boundary

- NOT uploaded to a live ChatGPT Project. NOT `T01`–`T87`-run. `LIVE-PROJECT-PASS` pending.
- NOT a runtime / Supabase / deployment change. `iskra-memory-gateway` untouched.
- File 24 (historical mirror, 74k lines) intentionally not edited this batch — its own precedence header already subordinates it to canonical files 00–23/25–29; full harmonization remains a separate, non-atomic task.
- Composes the v5.5.1 package and a scoped backlog batch; does not re-open v5.5.1's own content decisions.
