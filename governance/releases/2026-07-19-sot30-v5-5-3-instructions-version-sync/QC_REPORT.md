# SoT30 v5.5.3 — QC Report

Scope: version-label sync + hash-chain repair over v5.5.2.

| Gate | Result |
|---|---|
| exactly 30 knowledge files, numbers 00–29 unique | PASS |
| version label synced: `00` mirror + `support/PROJECT_INSTRUCTIONS_SOT30.md` both read "SoT30 v5.5.3" | PASS |
| T80 parity (mirror ↔ standalone instructions, raw-equal) | PASS — 5,996 chars both sides, before and after the edit |
| Project Instructions ≤ 6000 chars | PASS — 5,996 (unchanged length: "v5.5.1"→"v5.5.3" is the same character count) |
| version identity (29/MANIFEST) | PASS — both `v5.5.3-instructions-version-sync` |
| **Hash-chain corruption identified and repaired** | External commit `82191ce` overwrote v5.5.2's SHA256SUMS/MANIFEST.json with wrong values; every hash in this build re-derived from git's canonical blob content (`git show <commit>:<path>`), not the possibly-corrupted working tree |
| 28 unchanged-content files verified against canonical git blob, not working tree | PASS — 21 confirmed byte-for-byte identical to the v5.5.1 baseline; the remaining 7 (the v5.5.2 backlog-batch files) unchanged since that build |
| `24_INTERFACE_STYLE.md` legacy hash mismatch | **Recorded, not fixed** — true current hash (`364380ff0f3e…`, 2,830,603 bytes) differs from the value on record since v5.5.1 (`325355071ad4…`, 2,830,585 bytes); verified via raw `git cat-file` (zero CRLF in the blob, so not a normalization artifact); root cause predates this session, out of scope |
| ZIP integrity (`unzip -t`) | PASS |
| ZIP round-trip: `sha256sum -c support/SHA256SUMS` from a **fresh extraction** in a clean temp directory | PASS — 32/32 OK, 0 failures |
| zip entry paths use forward slashes | PASS — built with 7-Zip |
| secret scan | not re-run this patch — no new prose content introduced |

## Package facts

- knowledge files: 30
- corpus bytes: 4,027,706 (includes the corrected `24_INTERFACE_STYLE.md` byte count)
- Project Instructions: 5,996 chars; version header now `SoT30 v5.5.3`
- ZIP: `dist/SoT30_v5.5.3.zip`, 1,074,384 bytes, sha256 `3d5471dafd2c5aae39a131ff4e55fba942b6057c2f0f16fbcbeb8c7730fba8c1`
- file 29: 8,959 bytes, sha256 `8da1b559229e288490372034ec2a4e35cc6672f8b921b7ca3ae401a6d924e0fe`

## Hashing convention (re-verified this patch)

Every file except `00_PROJECT_ROUTER.md` was re-derived from `git show 31340c5:<path>` — the canonical blob of my own original, verified-correct v5.5.2 commit — rather than trusted from the working tree, because the working tree had been silently modified by an external commit after that point. `00` was read from the working tree (this session's intentional edit) and independently normalized to LF before hashing. `core.autocrlf=true` on this machine was confirmed as a contributing factor to the working-tree ambiguity, though the `24_INTERFACE_STYLE.md` legacy mismatch was proven to be unrelated to autocrlf (its raw git blob already has zero CRLF sequences).

## Not checked (explicitly out of scope / pending)

- Live ChatGPT Project upload and `T01`–`T87` live execution — not performed for this build.
- Root cause of `24_INTERFACE_STYLE.md`'s pre-existing 18-byte/hash discrepancy (predates this session).
- Why external commit `82191ce` used an incorrect hashing method — not investigated; flagged so it isn't repeated.

## Boundary

Static, in-repo assembly checks executed this session. No runtime, Supabase, or GitHub-app-behavior claim. No live Project verification. `iskra-memory-gateway` untouched.
