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
| Content-changed vs v5.5.2 **release tree** | `00` (version label), `02`/`22`/`28`/`29` (version frontmatter), `26` (SUPERSEDED marker), `29` (embedded table regenerated) |
| Additionally differ vs the v5.5.2 **dist ZIP** artifact | `06`, `09`, `24` — see provenance note below |
| Hash-chain re-derived from | canonical committed `knowledge/` blob content (the source of truth), not the divergent v5.5.2 zip |

## Provenance note (baseline clarification)

The authoritative v5.5.2 baseline is the **committed release-tree `knowledge/` blob content**, not `dist/SoT30_v5.5.2.zip` and not v5.5.2's `support/SHA256SUMS`. Verified by git:
- `06_SECURITY_INTEGRITY.md`, `09_METRICS_ENGINE.md`, `24_INTERFACE_STYLE.md` in `dist/SoT30_v5.5.2.zip` (`1035b689…`/`0f6b0ee5…`/`325355071ad4…`) do **not** match the committed release-tree blobs (`1271e23c…`/`0a5d3951…`/`364380ff…`) — the v5.5.2 zip was built from content that diverged from the committed source of truth for these three files (06 carries the v5.5.2 veto fix, 09 the usage-tracking field, 24 the true current content; the zip lacked all three).
- Even at commit `31340c5`, `support/SHA256SUMS` recorded the zip's divergent values for 06/09/24 (e.g. 06 = `1035b689…`) while the committed blob was `1271e23c…`. So `31340c5`'s recorded hash was correct for `01` (the file whose later corruption motivated this ADR) but was itself already wrong for 06/09/24.
- v5.5.3 is built from the authoritative release-tree blobs, so v5.5.3 is the first package whose zip, `SHA256SUMS`, `MANIFEST.json`, and embedded file-29 table all agree with the committed knowledge content. `dist/SoT30_v5.5.2.zip` should be treated as superseded — it never matched canon for 06/09/24.

## Verification performed

- Confirmed via `git log`/`git diff` that commit `82191ce` ("sync live migration timestamps and finalize SoT30 package hashes") modified `support/SHA256SUMS`/`MANIFEST.json` inside the v5.5.2 directory *after* my original commit `31340c5`, corrupting `01`'s recorded hash (`db984f2d…` → `7a09be23…`). Correction (this amendment): `31340c5`'s recorded values were correct for `01` but were themselves already wrong for `06`/`09`/`24` (they matched the divergent v5.5.2 zip, not the committed blobs). This build therefore re-derives every hash from the committed release-tree blob content directly, which is authoritative over both the zip and the older `SHA256SUMS`.
- Re-derived every one-of-30 file's hash from `git show 31340c5:<path>` (the canonical, pre-corruption blob) rather than the working tree.
- Cross-checked 21 of those files against the independent v5.5.1 baseline — byte-for-byte identical.
- Identified and documented (not silently propagated) a separate, pre-existing hash mismatch for `24_INTERFACE_STYLE.md` dating to v5.5.1, proven via raw `git cat-file` extraction to be unrelated to CRLF/autocrlf.
- T80 parity (Instructions ↔ 00 mirror) re-verified raw-equal after the version-label edit.
- ZIP `unzip -t` clean; built with Python zipfile (forward-slash entry paths). Round-trip `sha256sum -c support/SHA256SUMS` from a **fresh extraction** in a clean temp directory = 32/32 OK.

## Boundary

- NOT uploaded to a live ChatGPT Project for this exact build. NOT `T01`–`T87`-run.
- NOT a runtime / Supabase / deployment change. `iskra-memory-gateway` untouched.
- Does not resolve the `24_INTERFACE_STYLE.md` legacy mismatch's root cause, nor investigate why `82191ce` used an incorrect hashing method.
