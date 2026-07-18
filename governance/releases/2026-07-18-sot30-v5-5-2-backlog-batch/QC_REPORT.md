# SoT30 v5.5.2 Backlog Batch — QC Report

Scope: full 30-file assembled corpus (v5.5.1 base + 7-file backlog batch + regenerated 29).

| Gate | Result |
|---|---|
| exactly 30 knowledge files, numbers 00–29 unique | PASS |
| all 7 changed files carry their ADR-20260718-01 rationale (traceable in `governance/adr_20260718_sot30_v5_5_2_backlog_batch.md`) | PASS |
| `T01`–`T87` contiguous in file 28 | PASS — 87 IDs, none missing (T86, T87 added) |
| Project Instructions ≤ 6000 chars | PASS — 5996 (unchanged from v5.5.1, no file 00 edits this batch) |
| version identity (29/manifest) | PASS — both now `v5.5.2-backlog-batch` |
| veto contract: 06 matches typed KAIN/ANHANTRA/ISKRIV subset (12 §6) | PASS — corrected, broken `§2.2 файла 5` cross-reference removed |
| SIBYL status: 04 marks active, consistent with full spec already in 24 | PASS |
| threshold table (12 §4.2) present with mechanism-split (M1/M2/M3) | PASS |
| Mythic Router activation guidance (07) present, non-sovereign/optional preserved | PASS |
| mythic usage tracking (09 §6.1) self-reported, not claimed as measured | PASS — `status: 'observed'`, `method: 'self_report'` typed explicitly |
| FOG (27 A3) strengthened: trigger + authority bounds + typed output | PASS — mirrors `ADR-20260717-02` `RESEARCH` boundary (`canSelectVoice`/`canChangeFactStatus`/`canChangePermission`/`canPersist` = false) |
| file 29 hash table = 29 non-self rows, recomputed for this build | PASS |
| every unchanged file's hash matches its v5.5.1 source | PASS — 23/23 verified byte-identical |
| ZIP integrity (`unzip -t`) | PASS |
| ZIP round-trip: extract → **single command** `sha256sum -c support/SHA256SUMS` from package root | PASS — 32/32 OK, 0 failures (30 knowledge + instructions + MANIFEST.json) |
| SHA256SUMS covers every package file except itself (self-gate) | PASS — 32 entries incl. `support/MANIFEST.json` |
| zip entry paths use forward slashes (package-root convention) | PASS — built with 7-Zip after a PowerShell Compress-Archive attempt produced backslash-separated entries |
| secret scan across changed files | PASS — 0 |

## Package facts

- knowledge files: 30
- corpus bytes: 4,024,145
- Project Instructions: 5,996 chars; unchanged from v5.5.1; version header still `SoT30 v5.5.1` (no file 00 edit this batch — instructions parity is inherited, not re-verified here)
- ZIP: `dist/SoT30_v5.5.2.zip`, 1,072,411 bytes, sha256 `2d38d09fb208616e6393f1a49baa48a7fb940bedf6f782157db426be3f3d98bb`
- file 29: 7,495 bytes, sha256 `9bd00ca63b8df5d55772a209ebff232e1bf102430e1c43742c404baa1edb2cf2`

## Hashing convention (load-bearing, verified before regeneration)

All bytes/sha256 in this build are computed on **LF-normalized** UTF-8 content (`\r\n` → `\n`), matching the v5.5.1 package's own convention — verified before regenerating anything by re-hashing an untouched file (`00_PROJECT_ROUTER.md`) both raw and LF-normalized against its recorded v5.5.1 hash; only the normalized form matched. The zip's file contents are staged as LF-normalized copies for exactly this reason — a raw Windows-checkout (CRLF) zip would fail its own `SHA256SUMS` self-check.

## Not checked (explicitly out of scope / pending)

- Live ChatGPT Project upload and `T01`–`T87` live execution — NOT performed. `LIVE-PROJECT-PASS` remains pending.
- Retrieval-order behavior inside a live Project — undocumented by OpenAI, not asserted.
- File 24's remaining internal stubs/duplicate style layers referencing SIBYL's old "в разработке" status — flagged in `README.md` and the ADR as a separate, non-atomic future task; not touched in this batch (file 24 is a lower-precedence historical mirror per its own header, so the canonical activation in file 04 already governs on conflict).
- Mythic Router / usage-tracking guidance (07, 09) is newly authored prose, not yet exercised by a live retrieval; `T86`/`T87` are statically specified only.

## Boundary

Static, in-repo assembly checks executed this session. No runtime, Supabase, or GitHub-app-behavior claim. No live Project verification. `iskra-memory-gateway` untouched.
