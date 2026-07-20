# SoT30 v5.5.3 — QC Report

Scope: version-label sync + hash-chain repair over v5.5.2, amended 2026-07-20 to also repair the embedded manifest table, version frontmatter, and file-26 kernel anchor (ADR-20260719-01 Decisions 4–6).

| Gate | Result |
|---|---|
| exactly 30 knowledge files, numbers 00–29 unique | PASS |
| **file 29 embedded hash table matches `support/SHA256SUMS`/`MANIFEST.json`** (bot P1 fix) | PASS — regenerated from final content of 00–28; 00/04/06/07/09/12/24/27/28 now agree |
| version frontmatter consistency (02/22/28/29 → `v5.5.3`; 29 `updated: 2026-07-20`) | PASS — no file advertises a stale package version |
| file 26 pipeline anchor carries `[SUPERSEDED LABEL]` (parity with 08/09/13) | PASS — points to canonical Kernel Order in 00/ADR-20260714-01 |
| version label synced: `00` mirror + `support/PROJECT_INSTRUCTIONS_SOT30.md` both read "SoT30 v5.5.3" | PASS |
| T80 parity (mirror ↔ standalone instructions, raw-equal) | PASS — 5,996 chars both sides, before and after the edit |
| Project Instructions ≤ 6000 chars | PASS — 5,996 (unchanged length: "v5.5.1"→"v5.5.3" is the same character count) |
| version identity (29/MANIFEST) | PASS — both `v5.5.3-instructions-version-sync` |
| **Hash-chain corruption identified and repaired** | External commit `82191ce` overwrote v5.5.2's SHA256SUMS/MANIFEST.json with wrong values; every hash in this build re-derived from git's canonical blob content (`git show <commit>:<path>`), not the possibly-corrupted working tree |
| 28 unchanged-content files verified against canonical git blob, not working tree | PASS — 21 confirmed byte-for-byte identical to the v5.5.1 baseline; the remaining 7 (the v5.5.2 backlog-batch files) unchanged since that build |
| `24_INTERFACE_STYLE.md` legacy hash mismatch | **Recorded, not fixed** — true current hash (`364380ff0f3e…`, 2,830,603 bytes) differs from the value on record since v5.5.1 (`325355071ad4…`, 2,830,585 bytes); verified via raw `git cat-file` (zero CRLF in the blob, so not a normalization artifact); root cause predates this session, out of scope |
| ZIP integrity (`unzip -t`) | PASS |
| ZIP round-trip: `sha256sum -c support/SHA256SUMS` from a **fresh extraction** in a clean temp directory | PASS — 32/32 OK, 0 failures |
| zip entry paths use forward slashes | PASS — built with Python `zipfile` |
| secret scan | not re-run this patch — no new prose content introduced beyond the file-26 superseded label |

## Package facts

- knowledge files: 30
- corpus bytes: 4,028,009 (reflects the 02/22/26/28/29 content edits this amendment)
- Project Instructions: 5,996 chars; version header `SoT30 v5.5.3`; raw-equal to file 00 mirror (T80, unchanged this amendment)
- ZIP: `dist/SoT30_v5.5.3.zip`, 1,125,899 bytes, sha256 `a3c3bfb87e0c1340cfb4067d9f81e50351fdc8fdffccd7a4d4d832a78134c884`
- file 29: 8,954 bytes, sha256 `a0ddf4deb0551392558715a3a4a9dd94250c18e3c404b5734a5bed8743d20eab`
- support/MANIFEST.json sha256 `4f65ed5c64a2118037a684123a6c71ddde2f35cbb3851fd468d184fe21c9b1d8`

## Hashing convention (re-verified this patch)

Every file except `00_PROJECT_ROUTER.md` was re-derived from `git show 31340c5:<path>` — the canonical blob of my own original, verified-correct v5.5.2 commit — rather than trusted from the working tree, because the working tree had been silently modified by an external commit after that point. `00` was read from the working tree (this session's intentional edit) and independently normalized to LF before hashing. `core.autocrlf=true` on this machine was confirmed as a contributing factor to the working-tree ambiguity, though the `24_INTERFACE_STYLE.md` legacy mismatch was proven to be unrelated to autocrlf (its raw git blob already has zero CRLF sequences).

## Not checked (explicitly out of scope / pending)

- Live ChatGPT Project upload and `T01`–`T87` live execution — not performed for this build.
- Root cause of `24_INTERFACE_STYLE.md`'s pre-existing 18-byte/hash discrepancy (predates this session).
- Why external commit `82191ce` used an incorrect hashing method — not investigated; flagged so it isn't repeated.

## Boundary

Static, in-repo assembly checks executed this session. No runtime, Supabase, or GitHub-app-behavior claim. No live Project verification. `iskra-memory-gateway` untouched.
