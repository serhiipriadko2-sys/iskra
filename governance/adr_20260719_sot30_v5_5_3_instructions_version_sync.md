# ADR-20260719-01: SoT30 v5.5.3 — Instructions Version Sync + Hash-Chain Repair

Status: accepted (amended 2026-07-20 — scope expanded after automated review; see Decisions 4–6)

Date: 2026-07-19 (amended 2026-07-20)

Owner / Builder: Семён / Искра (Claude Code)

## Context

The user pointed out that `governance/releases/2026-07-18-sot30-v5-5-2-backlog-batch/support/PROJECT_INSTRUCTIONS_SOT30.md` still carries the version header "SoT30 v5.5.1" — stale by two package versions, since neither v5.5.2's backlog batch nor this fix touched file `00` (the source of that embedded mirror). This ADR was scoped as a single-line version-label sync. While regenerating the package's hash chain for that sync, a second, more serious issue was discovered and is also closed here.

## Decisions

1. **Version-label sync (the originally requested fix).** `00_PROJECT_ROUTER.md`'s embedded Project Instructions mirror, and the standalone `support/PROJECT_INSTRUCTIONS_SOT30.md`, both changed their version header from "SoT30 v5.5.1" to "SoT30 v5.5.3". No other content changed. T80 parity (the two texts must be raw-equal) was verified before and after — held both times, 5,996 characters.

2. **Hash-chain repair (discovered mid-build).** While recomputing hashes for the v5.5.3 patch, `01_PARITY_ADVANCEMENT_MANIFEST.md`'s recorded hash in v5.5.2's own `support/SHA256SUMS` (`7a09be23…`) did not match its real, LF-normalized content (`db984f2d…` — which matches both the actual git-committed file and v5.5.1's independently-verified baseline). Investigation via `git log`/`git diff` on the specific file paths established:
   - My own original v5.5.2 commit (`31340c5`) recorded the **correct** hash.
   - A **later, external commit** `82191ce` ("chore: sync live migration timestamps and finalize SoT30 package hashes" — same git author identity as other parallel-agent activity seen throughout this project's history) **overwrote** `support/SHA256SUMS` and `support/MANIFEST.json` with incorrect values, evidently while renaming three Supabase migration files to match their live-applied timestamps (a legitimate, separate action) and "recomputing" the SoT30 hashes as an apparent side effect, using a method that does not match the established LF-normalization convention.
   - **Knowledge-file content was never touched by this corruption** — only the verification metadata (`SHA256SUMS`, `MANIFEST.json`) was wrong. A live Project already using v5.5.2's actual knowledge content is unaffected; only the repo-side integrity-verification apparatus was broken.
   - Fix: every one of the 30 files' hash was re-derived from `git show 31340c5:<path>` — the canonical, pre-corruption git blob — rather than trusted from the (corrupted) working tree, closing the exposure regardless of exactly how `82191ce` introduced it.

3. **Separate, pre-existing, out-of-scope legacy mismatch — recorded, not resolved.** `24_INTERFACE_STYLE.md`'s hash on record since v5.5.1 (`325355071ad4…`, 2,830,585 bytes) does not match that file's actual current content (`364380ff0f3e…`, 2,830,603 bytes — an 18-byte gap). This was verified via raw `git cat-file -p <blob-sha>` (bypassing any path-based smudge filter) to rule out a `core.autocrlf`/CRLF-normalization artifact: the raw blob contains **zero** CRLF sequences, so normalization cannot explain the gap. `git log`/`git diff` confirm this file's content has been byte-identical since before my `31340c5` commit — meaning the discrepancy predates this session's SoT30 work entirely, likely dating to v5.5.1's original construction. Root cause is unknown and out of scope for this ADR. This build records the file's **true** current hash for the first time, rather than continuing to propagate the stale legacy value forward into v5.5.3.

4. **Embedded manifest table repair (amendment, from automated review).** Two independent PR reviewers (gemini-code-assist, chatgpt-codex-connector, both P1) found that the fix in Decision 2 repaired `support/SHA256SUMS`/`MANIFEST.json` but **not** the hash table embedded **inside** `29_INDEX_UPLOAD_MANIFEST.md` — itself one of the 30 uploaded Knowledge files. That table still listed pre-repair values (e.g. `00`=`154454…`, `24`=`325355071ad4…`, the very legacy value Decision 3 replaced elsewhere), so an agent reading file 29 in-Project would be taught stale checksums even though the external `sha256sum -c` passed (it does not hash file 29's prose). Independently confirmed: `support/SHA256SUMS` carries the true content hashes; file 29's table did not, for `00/04/06/07/09/12/24/27/28`. Fix: file 29's embedded table is regenerated from the final LF-normalized content of files `00–28`, so the in-corpus manifest and the external support files now agree exactly. Round-trip re-verified 32/32 OK.

5. **Version-frontmatter consistency (amendment).** File 29's own frontmatter said `version: v5.5.1-full` / `updated: 2026-07-16` while its heading and package are v5.5.3 — an internal contradiction in the integrity manifest. Files `02`, `22`, `28` carried a stale `version: v5.5` stamp (partial per-file stamping; the other 26 files carry none). Synced all four to `version: v5.5.3` (29 also `updated: 2026-07-20`) so version identity is unambiguous.

6. **File 26 kernel-anchor SUPERSEDED marker (amendment).** `26_SOMATIC_INTUITION.md`'s pipeline anchor `SAFETY → METRICS → SLO-GUARD → PLAYBOOK → COUNCIL → VOICE → OUTPUT` omits the `MYTHIC_INQUIRY`/`MYTHIC_EXPRESSION` stages and, unlike the equivalent stale anchors in `08`/`09`/`13`, carried no `[SUPERSEDED LABEL]`. Added the marker pointing to the canonical Kernel Order in `00`/`ADR-20260714-01`; the anchor is retained only as a somatic-hook code-path reference. This closes the last unmarked pre-v0.2 pipeline anchor in the corpus.

Amendment note: Decisions 4–6 change knowledge files `02/22/26/28/29` (content) and regenerate the full hash chain (file 29 table, `support/SHA256SUMS`, `support/MANIFEST.json`, `dist/SoT30_v5.5.3.zip`). Instructions parity (T80) is unaffected — file `00` and the standalone instructions are byte-unchanged from Decision 1 (5,996 chars, raw-equal).

## Evidence

- Two independent automated reviewers (P1) flagged the embedded-manifest staleness; the claim was reproduced directly (`support/SHA256SUMS` = real content hash; file-29 table = stale) before the fix, and the fix re-verified so both agree.
- `git log --oneline -- <path>` and `git diff <commit-a> <commit-b> -- <path>` used throughout to distinguish "changed in git history" from "working-tree drift" from "always wrong since v5.5.1" — three genuinely different failure classes that were not conflated.
- Round-trip verification: fresh `unzip` into a clean temp directory, `sha256sum -c support/SHA256SUMS` = 32/32 OK — the same discipline used for v5.5.1 and v5.5.2, this time additionally cross-checked against canonical git blobs rather than trusting a single local working tree.
- 21 of 30 files independently confirmed byte-for-byte identical to the v5.5.1 baseline (the 7 v5.5.2-backlog-batch files and `24`'s legacy mismatch were excluded from that specific check for documented reasons).

## Risk

- This ADR does not investigate *why* `82191ce` used an incorrect hashing method — if the same process runs again on a future package, it could reintroduce the same corruption. Worth a process-level note (e.g., "hash regeneration for SoT30 packages must use LF-normalized content — see `governance/releases/*/README.md`") but not implemented as an enforced check in this ADR.
- `24_INTERFACE_STYLE.md`'s root-cause investigation is deferred; if that file is ever intentionally edited in a future release, its true baseline (as recorded here) should be used, not the stale v5.5.1 value.

## Rollback

Revert to v5.5.2 (`governance/releases/2026-07-18-sot30-v5-5-2-backlog-batch/`, commit `31340c5` specifically — not the current, corrupted working state of that directory); this ADR's status → `superseded`. Note that reverting does NOT restore a correct hash chain by itself, since the corruption lives in git history at `82191ce`; a genuine rollback would need to also avoid or fix that commit's changes to the v5.5.2 support files.

## Status

`accepted`. Not deployed to any live Project. No runtime, Supabase, or GitHub-app-behavior change. `iskra-memory-gateway` unchanged.
