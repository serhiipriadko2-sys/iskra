# ADR-20260730-01: SoT30 v5.5.7 — Audit Repair

Status: proposed (2026-07-30, awaiting owner decision)

Date: 2026-07-30

Baseline: v5.5.6, merged at `e3708407596581709c2cf86e336045d285ff1144` and immutable.

Package mirror: candidate built on branch `claude/sot30-v5-5-6-audit-y413ns`

Live verification: not run

## Context

A full static audit of the v5.5.6 release (2026-07-29/30, fixed observation ref `e3708407`) confirmed package-hash integrity end to end — independent in-session rehash of all 32 SHA256SUMS entries, ZIP rehash (`d8695964…`, 1,131,422 bytes) and byte-parity ZIP↔tree all PASS — but found semantic and lifecycle defects the v5.5.6 verifier does not catch:

1. **Shared-project memory branch missing (file 02).** Official product behavior: sharing a Project automatically switches it to project-only memory, irreversibly; a shared Project does not reference members' external context. File 02 modeled project-only as creation-time-only, producing false negatives for shared Projects, and collapsed "isolation" into one boolean instead of per-dimension context boundaries (Enterprise/Edu default memory does not reference outside chats but does use saved memories).
2. **Stale runtime/live claims (file 02).** "Bounded controller is not wired" contradicted the file 01 overlay (`APPLICATION_PATH_WIRED`); gateway "ACTIVE v2" contradicted the dated v4 read-back; "10 tables" was stale against the 2026-07-29 read-back (11 tables).
3. **Stale package identity (file 25).** `current_package: v5.5.6` in frontmatter vs "current package identity (`v5.5.4`)" in the active quarantine banner.
4. **Loader gap (file 00).** The loader contract skipped files 01/02 entirely, leaving the status-overlay precedence mechanism unclosed.
5. **T86 coverage gap.** Acceptance declared 03/04/06/07 ↔ 12 §4.2 while verifier C23 read only 02/03/04/12/28; the 07 §2.2 `KAIN drift > 0.3` Council-veto attribution divergence vs 12 §4.2 (drift veto belongs to ISKRIV; KAIN gated by `pain_tonicity`) was unmapped.
6. **Verifier fail-open.** A malformed `package_version` parsed to `[0,0,0]`, marking C23 "not applicable" — a corrupted manifest could waive the semantic contract.
7. **Root-doc gaps.** The shipped v5.5.6 QC report contains mojibake (literal `0x3F` where typographic dashes belonged); release-root docs are outside SHA256SUMS with no root-allowlist check.
8. **Lifecycle breach (recorded, not repaired here).** v5.5.6 was merged while its own receipt said "Merge not authorized" and `live_project_verified=false`. v5.5.7 does not rewrite that history; it types the stages so the breach class is detectable.

## Decision

1. Release a new v5.5.7 candidate package; never rewrite v5.5.6.
2. File 02: add the shared-project branch and a context-boundary matrix (outside-chat reference / saved-memory reference per Project state); retract stale Guard/gateway/schema claims and convert live counts to dated observations that must be re-read, never quoted.
3. File 00: loader becomes `29 → 00 → 01 → 02 → 03–07 → …` and is explicitly a routing/retrieval contract, not a claim of platform read order; precedence names the overlay (`01 · Current Status`) and requires `observed_at`.
4. File 12 §4.2: map the 07 §2.2 M3 veto-attribution divergence using the table's own divergence-mapping rule; the table remains normative; voice-attribution resolution is deferred to its own ADR.
5. File 25: current identity comes from frontmatter `version`/`current_package` with `support/MANIFEST.json` as authority; no hard-coded version inside prose.
6. File 28: add T94–T97 (shared-project memory, boundary dimensions, loader coverage, version identity); T80 canonical criterion becomes byte equality (aligned with C7); static gate wording fixed (SHA256SUMS covers ZIP payload only).
7. Verifier: malformed `package_version` is a hard FAIL for all floor-gated contracts; add C24 (shared-project + semantic Enterprise regression), C25 (real 06/07 T86 coverage + normative phrases located inside 12 §4.2), C26 (release-root exact allowlist + mojibake guard) — all floor-gated at v5.5.7 so v5.5.4–v5.5.6 remain verifiable under their historical contracts; extend the selftest negative-fixture matrix accordingly.
8. Lifecycle typing: `source_merge` ≠ `artifact_promotion` ≠ `live_project_verified`; each stage requires its own recorded authorization; the receipt carries the stage table.

## Deferred (explicitly out of scope, tracked for v5.6.0)

- File 01 normalization (frontmatter position, overlay-as-patch architecture, typed maturity vectors, session-local evidence refs).
- File 25 physical split (active Mythic contract vs embedded historical archive) and fragment-local quarantine metadata.
- Project Instructions redesign (Ω ≤ 0.95 ceiling, capability ≠ permission gate, dual authority/freshness ladders) — blocked by the 6000-character budget (5996 used), requires editorial compression.
- Machine-readable memory contract + acceptance-run receipt schema (executable study contract for file 28).

## Consequences

- Changed knowledge set vs v5.5.6: `{00, 02, 12, 22, 25, 28, 29}` (22 is a version-stamp-only bump required by C12).
- New artifacts: `governance/releases/2026-07-30-sot30-v5-5-7-audit-repair/`, `dist/SoT30_v5.5.7.zip`, CI verify step, ledger entries.
- v5.5.6 CI verification continues unchanged (grandfathered floors).
- Merge of this candidate into the repository is a `source_merge` only; artifact promotion and live verification remain separate owner decisions.
