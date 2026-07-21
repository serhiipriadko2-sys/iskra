# SoT30 v5.5.5 — provenance/label cleanup + version-identity consistency

New immutable package `dist/SoT30_v5.5.5.zip` (root `SoT30_v5.5.5/`, 1,130,036 bytes, sha256 `58ea31c020359c83d161c94710fc50b432b81efb4a4c1f6f6c024e6230246db6`) built over v5.5.4 under ADR-20260721-01 (`accepted`). **Provenance/version only** — no semantic/runtime/Supabase/memory change. v5.5.4 stays immutable.

## Resolves the v5.5.4 erratum
- **E1** — `support/MANIFEST.json` `generated_from: canonical_git_blobs` is now *genuinely true*. Built via a **two-stage provenance** flow: a source-freeze commit (`56ad422b`) holds the final v5.5.5 knowledge + instructions, then the canonical build ran `--from-git 56ad422b`; all 30 knowledge files + the instructions in the ZIP are byte-equal to the git blobs at that commit, and `generated_from_ref` records the SHA.
- **E2** — ZIP root is `SoT30_v5.5.5/` (with the `v`).

## Version-identity consistency (D1/D2)
Active identity bumped to `SoT30 v5.5.5`: both Project Instructions copies (file 00 mirror + standalone, kept byte-equal — **T80 re-proven** after the `v5.5.3 → v5.5.5` header change), and stamps in `01` (overlay), `02`, `22`, `25` (`current_package`), `28`, `29`. Historical `v5.5.3`/`v5.5.4` references in provenance/errata/history left intact (D2). Changed vs v5.5.4: `00,01,02,22,25,28,29` (7); unchanged 23.

## Verification
Semantic verifier C1–C21 PASS; T80 byte-equal; 30/30 knowledge zip↔git-blob parity; verify selftest 18/18; build selftest 8/8; same-toolchain double build byte-identical; release-tree↔ZIP parity (33 files); ledger + canon regenerated; v5.5.4 knowledge/support/ZIP byte-unchanged (immutability proof). CI `sot_integrity` runs the verifier + both selftests against this release.

## Boundary
No live-Project upload; T01–T93 not live-run; no Supabase/runtime change. ADR `accepted` is architectural, not a live-Project verification.
