# ADR-20260721-01: SoT30 v5.5.5 — Provenance/Label Cleanup (E1/E2) + Version-Identity Consistency

Status: accepted (2026-07-21, owner decision)

Date: 2026-07-21

Owner: project owner (Семён)

Builder: Claude Code

Baseline: v5.5.4 (immutable — `governance/releases/2026-07-20-sot30-v5-5-4-semantic-runtime-consistency/`, `dist/SoT30_v5.5.4.zip`)

Package mirror: pending (this build)

Live verification: pending

## Context

v5.5.4 is immutable and green on `main` (`1121745f`). Its erratum recorded two in-ZIP inaccuracies deferred to v5.5.5:

- **E1** — `support/MANIFEST.json` `generated_from: canonical_git_blobs` while the v5.5.4 build actually read release-tree working bytes (untrue *method* label).
- **E2** — ZIP root `SoT30_5.5.4/` (missing `v`), inconsistent with `SoT30_v5.5.3/`.

The PR-D build tool (`tools/build_sot30_release.py`) now supports a genuine `--from-git <SHA>` (extracts every source file from a commit and builds the whole package from it) and a fixed `SoT30_v<version>/` root, so v5.5.5 can be built truthfully. Separately, package-version-identity stamps in a few files, and the version label inside the Project Instructions, still read the old version.

## Decision

1. **Two-stage provenance build (mandatory).** `--from-git` extracts source bytes from a commit, so the final package must be built from a **source-freeze commit** that already contains the final v5.5.5 knowledge + instructions; that commit's SHA becomes `generated_from_ref`. Building from a commit that lacks its own source bytes is circular and forbidden.
2. **E1 resolved.** v5.5.5 is built via `--from-git <source-freeze-SHA>`, so `generated_from: canonical_git_blobs` is *genuinely true* (proven by 30/30 knowledge zip↔git-blob parity).
3. **E2 resolved.** Root is `SoT30_v5.5.5/`.
4. **Scope = provenance/version only (D3).** No semantic, runtime, Supabase, or memory-policy changes. Active identity only (D2): bump `00`, `01` (overlay label), `02`, `22`, `25` (`current_package`), `28`, `29` and **both** copies of the Project Instructions to `SoT30 v5.5.5`; regenerate `support/MANIFEST.json`, `SHA256SUMS`, file-29 table, ZIP. Historical `v5.5.3`/`v5.5.4` references in provenance/errata/history are **not** mass-rewritten.
5. **D1 = update instructions identity to v5.5.5.** The Project Instructions internally read `SoT30 v5.5.3`; leaving that inside a v5.5.5 package would create a new identity drift (an uploaded agent reporting an older package identity). Both `00_PROJECT_ROUTER.md`'s mirror and `support/PROJECT_INSTRUCTIONS_SOT30.md` are updated identically; **T80 byte-equality is re-proven**. Instruction *semantics* are unchanged.
6. **v5.5.4 remains immutable** — its ZIP/knowledge/support bytes are not rewritten.
7. **Order (B):** build v5.5.5 → review → merge → one live-Project upload → T01–T93. v5.5.4 is not live-tested first.

## Alternatives

- **A. Live-test v5.5.4 now, redo for v5.5.5.** Rejected — package identity changes → duplicate upload + T01–T93.
- **B. Clean v5.5.5, then a single live acceptance (chosen).**
- **C. Erratum-only, keep v5.5.4 forever.** Rejected — ships a known-untrue provenance label as final.

## Consequences

- New per-file hashes for the changed identity set; regenerated file-29 table, MANIFEST (`generated_from_ref` = source-freeze SHA), SHA256SUMS, ZIP (`SoT30_v5.5.5/`).
- Ledger + canon-index regeneration; new release-root README/QC/PACKAGE_RECEIPT; erratum E1/E2 → resolved-in-v5.5.5.
- A fresh live-Project upload of v5.5.5 is required before any `live_project_verified: true`.

## Tests (gate before PR)

- verifier C1–C21 PASS; `generated_from` = `canonical_git_blobs` with `generated_from_ref` set; 30/30 knowledge zip↔git-blob parity; root `SoT30_v5.5.5/`.
- T80 mirror byte-equal (re-proven after the identity bump); verify selftest 18/18; build selftest 8/8; same-toolchain double build byte-identical.
- ledger + canon + shard/core-adr green; v5.5.4 bytes unchanged (immutability proof).

## Exact diff scope

Changed knowledge vs v5.5.4 (active identity): `00, 01, 02, 22, 25, 28, 29`. Changed support: `PROJECT_INSTRUCTIONS_SOT30.md`, `MANIFEST.json`, `SHA256SUMS`. New: `dist/SoT30_v5.5.5.zip`. Byte-unchanged knowledge: `03–21, 23, 24, 26, 27`. (Re-confirmed by the source-freeze content before the canonical build; not guessed.)

## Rollback

Close the v5.5.5 PR; do not delete/rewrite v5.5.4; package pointer stays at v5.5.4; this ADR → superseded.

## Status

`accepted`. Not deployed. No runtime, Supabase, or GitHub-app-behavior change. `iskra-memory-gateway` untouched. Live-Project verification pending.
