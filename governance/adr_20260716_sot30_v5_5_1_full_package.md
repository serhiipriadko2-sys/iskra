# ADR-20260716-03: SoT30 v5.5.1 Full Merged Package

Status: proposed
Date: 2026-07-16
Owner / Builder: Владелец / Claude Code

## Context

Two SoT30 Knowledge deltas were merged to `main` on 2026-07-16 as independent reviewable PRs:

- `ADR-20260716-01` (PR #264) — v5.5 Business Projects Hardening, files 02/22/28/29.
- `ADR-20260716-02` (PR #267) — v5.5.1 Content Integrity, files 01/04/05/07/08/09/10/11/13/20/24/27.

Neither PR produced a single uploadable 30-file corpus: each shipped only its own delta subset plus release evidence. To upload SoT30 to a fresh ChatGPT Business Project, the two deltas must be composed with the 14 unchanged v5.4.1 files into one package, and file 29 (the index/hash manifest) must be regenerated so its hash table covers the merged corpus (the v5.5 copy of 29 only reflected the v5.5 changes).

A naïve composition ("18 unchanged + 12 v5.5.1 + 4 v5.5") double-counts, because the 4 v5.5 files are inside the 18 that v5.5.1 left untouched. The correct composition is 14 + 12 + 3 (02/22/28) + 1 regenerated 29 = 30.

## Decision

Assemble and commit the full merged package:

- extracted 30-file corpus under `governance/releases/2026-07-16-sot30-v5-5-1-full-package/knowledge/`;
- `support/PROJECT_INSTRUCTIONS_SOT30.md` (parity-fixed: raw-equal to 00's pasteable mirror, v5.5.1), `support/MANIFEST.json`, `support/SHA256SUMS`;
- regenerated `29_INDEX_UPLOAD_MANIFEST.md` with the full recomputed 29-non-self-hash table, which also records file 13 at its actual merged content (13386 bytes / `e709c9a2…`), closing the prior v5.4.1 file-13 manifest drift;
- an uploadable `dist/SoT30_v5.5.1.zip` (force-added past the `dist/**` gitignore, matching the `dist/SoT30_v5.4.zip` precedent);
- QC report and package receipt.

This ADR is Knowledge/packaging only. No `runtime/` code, Supabase schema, or `iskra_memory.*` write. No live ChatGPT Project upload or `T01`–`T85` execution.

## Evidence

- Composition + hashes: `.../support/MANIFEST.json`, `.../support/SHA256SUMS`, `.../PACKAGE_RECEIPT.md`.
- QC (30-unique, no-duplicate, base64-gone, ontology-wrapped, kernel-synced, guard-floor, T01–T85, ZIP round-trip): `.../QC_REPORT.md`.
- ZIP: `dist/SoT30_v5.5.1.zip`, 1,120,143 bytes, sha256 `a4f69c708b8b1e0839036ad5ba48df91ec99b9533b6019fb29d55d1cf21c619c`.
- Source of overlaid files: merged `main` at `4f3c087` (the two prior PRs' release trees).

## Risk

- `T01`–`T85` have not been run against this assembled corpus in a live Project; `LIVE-PROJECT-PASS` remains pending.
- Instructions parity was a pre-existing v5.4.1 defect (00's mirror carried an `Inquiry functions` line the paste artifact lacked); closed here by compacting+syncing the line 1:1 and bumping both headers to v5.5.1, so file 00 is the one file changed beyond the two merged deltas.
- File 24's remaining embedded catalog and file 25's mythic corpus are carried unchanged — future compaction questions, not resolved here.

## Next

1. Merge this ADR + package as `proposed → accepted` once reviewed.
2. Upload `dist/SoT30_v5.5.1.zip`'s 30 knowledge files to a fresh Business Project (project-only memory confirmed); paste the instructions.
3. Run `T01`–`T85`, record outcomes, close `LIVE-PROJECT-PASS`.

## Status

`proposed` — awaiting Owner acceptance. Not canonically active. Not deployed. Not live-verified.
