# SoT30 v5.5.4 — lifecycle + provenance + verifier P1/P2 (PR-D)

Second post-merge corrective pass after an independent read-back (ISKRIV) found, against source on `da276e0`, two P0s and several P1/P2s left by PR-C. **No v5.5.4 package byte change** — `dist/SoT30_v5.5.4.zip` and every `knowledge/`+`support/` file remain byte-identical; all fixes are tooling / governance / release-root receipts.

## P0 fixed
- **ADR/receipt lifecycle self-contradiction.** The ADR said `accepted` (top) but `proposed`/`not accepted` (trailing `## Status`); README + PACKAGE_RECEIPT still said "ADR is `proposed`, not `accepted`." Corrected: ADR trailing status now `accepted` with distinct stages (accepted / mirror done / merged / conformance-hardening **done PR #291 da276e0** / live pending); README + PACKAGE_RECEIPT lines fixed.
- **`--from-git` false provenance.** Previously git was used only for the file-29 table while hashes/zip/instructions came from the working tree, so `generated_from: canonical_git_blobs` was untrue. Now `--from-git <SHA>` extracts **every** source file (30 knowledge + instructions) into a temp tree and builds the whole package from it; verified 30/30 zip knowledge entries byte-equal the git blobs. Added `--git-source-dir` to build a fresh output dir from a git source without touching a shipped release.

## Verifier P1/P2 (exact, not proxy)
- **C1** now rejects any non-md / extra file in `knowledge/` (exact 30-entry dir); **C1b** requires `support/` = exactly the 3 files.
- **C4** requires exact full paths `knowledge/NN_…` (rejects `wrong-prefix/…` with a right basename).
- **C7** adds mirror **uniqueness** (a duplicate-copy injection now fails).
- **C14** rejects duplicate zip entries and stray directory entries (not just `sha256sum -c`).
- **C20 (new)** — release-tree ↔ extracted-ZIP **byte parity** for all 33 files, closing the split-brain class that bit v5.5.2.
- **C16** now walks `knowledge/`+`support/` recursively and includes the selftest in the secret scan; label made accurate.
- **C21 (new)** — fails on any ADR-lifecycle self-contradiction (`accepted` vs `proposed`/`not accepted`) in ADR/README/QC/receipt.

## Fail-closed proof
- `verify_sot30_release.selftest.ts`: real v5.5.4 PASSes (22/22); **17** tampered fixtures each FAIL on the targeted check (added: extra non-md, wrong manifest prefix, mirror duplicate-copy, lifecycle contradiction, split-brain tree≠zip, duplicate zip entry, extra zip dir).
- `build_sot30_release.selftest.ts` (new, wired into CI): default build, genuine `--from-git` (30/30 git-parity), reproducibility, and isolation — 8/8. This closes the build-path CI gap that let the `--from-git` defect ship green.

Erratum updated (E6–E9). Shipped v5.5.4 package still carries the E1 `generated_from` string + E2 root name (in-ZIP, immutable) → byte-fix deferred to v5.5.5, now buildable truthfully via the fixed `--from-git`. Ledger + canon-index regenerated. No runtime/Supabase/live-Project change.
