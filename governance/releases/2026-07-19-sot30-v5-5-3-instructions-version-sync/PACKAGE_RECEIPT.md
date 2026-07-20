# SoT30 v5.5.3 — Receipt

Assembled and verified in-session 2026-07-19 by Claude Code, from the v5.5.2 backlog batch (`governance/releases/2026-07-18-sot30-v5-5-2-backlog-batch/`, commit `31340c5`) after discovering its shipped hash chain had been corrupted by a later, external commit.

## Artifact

| Item | Value |
|---|---|
| ZIP | `dist/SoT30_v5.5.3.zip` |
| ZIP bytes | 1125899 |
| ZIP sha256 | `a3c3bfb87e0c1340cfb4067d9f81e50351fdc8fdffccd7a4d4d832a78134c884` |
| Knowledge files | 30 (00–29, unique) |
| Corpus bytes | 4028009 |
| file 29 sha256 | `a0ddf4deb0551392558715a3a4a9dd94250c18e3c404b5734a5bed8743d20eab` |
| Project Instructions | 5996 chars; version header now v5.5.3 |
| Acceptance range | T01–T87 (unchanged from v5.5.2) |
| Content-changed files | 1 (`00` — version label only, 2 characters) |
| Hash-chain re-derived (content unchanged) | 28 files, from canonical git blob of commit `31340c5` |

## Verification performed

- Confirmed via `git log`/`git diff` that commit `82191ce` ("sync live migration timestamps and finalize SoT30 package hashes") modified `support/SHA256SUMS`/`MANIFEST.json` inside the v5.5.2 directory *after* my original commit `31340c5`, and that my original commit's recorded values were correct while the later commit's were not.
- Re-derived every one-of-30 file's hash from `git show 31340c5:<path>` (the canonical, pre-corruption blob) rather than the working tree.
- Cross-checked 21 of those files against the independent v5.5.1 baseline — byte-for-byte identical.
- Identified and documented (not silently propagated) a separate, pre-existing hash mismatch for `24_INTERFACE_STYLE.md` dating to v5.5.1, proven via raw `git cat-file` extraction to be unrelated to CRLF/autocrlf.
- T80 parity (Instructions ↔ 00 mirror) re-verified raw-equal after the version-label edit.
- ZIP `unzip -t` clean; built with Python zipfile (forward-slash entry paths). Round-trip `sha256sum -c support/SHA256SUMS` from a **fresh extraction** in a clean temp directory = 32/32 OK.

## Boundary

- NOT uploaded to a live ChatGPT Project for this exact build. NOT `T01`–`T87`-run.
- NOT a runtime / Supabase / deployment change. `iskra-memory-gateway` untouched.
- Does not resolve the `24_INTERFACE_STYLE.md` legacy mismatch's root cause, nor investigate why `82191ce` used an incorrect hashing method.
