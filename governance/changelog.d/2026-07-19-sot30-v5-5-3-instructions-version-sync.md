# SoT30 v5.5.3 — instructions version sync + hash-chain repair

Syncs the stale "SoT30 v5.5.1" version header in `00_PROJECT_ROUTER.md`'s embedded Project Instructions mirror and the standalone `support/PROJECT_INSTRUCTIONS_SOT30.md` to "SoT30 v5.5.3" (T80 raw-equal parity held before/after, 5,996 chars).

While rebuilding the hash chain for that sync, discovered and repaired a real corruption: external commit `82191ce` had overwritten v5.5.2's `support/SHA256SUMS`/`MANIFEST.json` with values that don't match the real file content — my original v5.5.2 commit (`31340c5`) was correct; the later commit broke it. Knowledge-file content was never affected, only the verification metadata. Every hash in v5.5.3 was re-derived from git's canonical blob content, not the (corrupted) working tree. Round-trip `sha256sum -c` from a fresh extraction = 32/32 OK.

Also documented (not fixed — pre-existing, predates this session, out of scope): `24_INTERFACE_STYLE.md` has carried a wrong hash since v5.5.1 (18-byte gap, proven unrelated to CRLF via raw `git cat-file`). This build records its true current hash for the first time.

New package: `dist/SoT30_v5.5.3.zip` (1,074,384 bytes, sha256 `3d5471dafd2c5aae39a131ff4e55fba942b6057c2f0f16fbcbeb8c7730fba8c1`). v5.5.2 package untouched and still available. No runtime/Supabase/live-Project change.
