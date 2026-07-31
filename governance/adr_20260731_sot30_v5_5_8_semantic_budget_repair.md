# ADR-20260731-01: SoT30 v5.5.8 — Semantic Self-Contradiction + Instructions Budget Repair

Status: proposed (2026-07-31, awaiting owner decision)

Date: 2026-07-31

Baseline: v5.5.7, source-merged at `cc2064fb3da33d94415906daf171b93362dfea6a` (PR #321, 2026-07-30T18:28Z) and subsequently amended by the accepted behavior amendment `ADR-20260730-02` (`PINO_FIRST_STRIKE_V1`, PR #327, merge `a7fdd827fd9e2bceabc2e2e0a148d44b04165349`). Both are immutable as of this build. ADR-20260730-01 (v5.5.7 package identity) remains separately `proposed`; this ADR does not grant it acceptance. `ADR-20260730-02` remains separately `accepted` and is carried forward unchanged (`behavior_adrs` in the manifest); this build does not touch files 12, 20, or the T98–T103 rows in file 28.

Package mirror: candidate built on branch `claude/sot30-v5-5-6-audit-y413ns`

Live verification: not run

Review posture: **not** independently adversarial-reviewed (unlike v5.5.4–v5.5.7, which each closed multiple external Codex review rounds — v5.5.7 alone had ten). Scoped and authorized directly by the owner as a minimal atom of a larger audit backlog.

## Context

This session ran an atomic post-merge audit of merged v5.5.7 (`cc2064fb…`) and proposed a 19-item backlog. The owner reviewed it directly (SIFT/DECISION pass) and accepted a minimal next atom (U1 + U7 + U2). During implementation, PR #327 (`PINO_FIRST_STRIKE_V1`) merged into `main`, amending the v5.5.7 release directory itself (files 12, 20, 28, 29, and all root receipts). The candidate below is rebuilt against that actual current baseline, not the earlier pre-PINO state.

1. **A self-contradiction that survived its own repair.** v5.5.7's round-6 fix reclassified file 01 from "status overlay" to a historical snapshot (`current_status_authority: false`) and corrected the wording in file 00 — but file 28's `T96-LOADER-COVERAGE` row still called file 01 "status overlay". (A second echo, in file 29's `## Reading order` prose, was independently removed by PINO's simplification of that section — not fixed as such, just deleted along with the surrounding text — so only the file 28 instance required a fix here.)
2. **An unguarded third copy of the loader route.** `C28` validated the loader route token-exact in files 00 and 29 but never checked file 28's independent T96 route copy.
3. **A near-zero Instructions capacity reserve.** Project Instructions shipped v5.5.7 (and its PINO amendment, which does not touch Instructions) at 5996/6000 platform characters — a 4-character reserve.
4. **A version-stamp propagation cost, discovered during implementation.** `C12` (pre-existing, unconditional) requires every Knowledge file carrying an explicit semver `version:` frontmatter key to match the current package version on every release. Files 02 and 22 carry that key but had no body change this round — bumping their stamp to stay C12-compliant added them to the changed set (6 changed / 24 unchanged).
5. **A manifest-schema gap, discovered during implementation.** PINO's build tooling (`tools/pino_release/*`) introduced `behavior_adrs` and `supplemental_acceptance_range` manifest fields to track its accepted behavior amendment separately from the package ADR. The main `tools/build_sot30_release.py` did not know about these fields and would have silently dropped them on rebuild. Extended with `--behavior-adr` (repeatable) and `--supplemental-acceptance-range` CLI flags so this and future rebuilds carry PINO's amendment tracking forward instead of losing it.
6. **A verifier false-positive class found and fixed during implementation.** The route-span detector added for finding #2 above (and its file-29 counterpart) originally matched "any backticked span containing an arrow, with ≥3 two-digit tokens somewhere inside" — but ordinary prose (`` `C28` now validates file 28's ... files 00/29 ... 5996 → 5599 characters ... `release_ceiling` ``) can incidentally contain exactly that many two-digit numbers between two unrelated inline-code terms, producing a false extra "route span" and failing the check on the candidate's own honest content. Replaced with a strict grammar (`` `token(→token)+` ``, matched end-to-end) so only text that IS a route can match, closing both the false-positive risk and the original false-negative gap it was meant to fix.

## Decision

1. Release a new v5.5.8 candidate package; never rewrite v5.5.7.
2. File 28's `T96-LOADER-COVERAGE` row: "01 (status overlay)" → "01 (historical snapshot)". No change to the route span itself (already token-correct).
3. `C28` (verifier): additionally validate file 28's independent T96 route copy — exactly one pure-route backticked span in the whole file, token-exact against the canonical sequence, using the strict `token(→token)+` grammar (item 6 above) rather than a loose arrow+digit-count heuristic. The same strict grammar replaces file 29's pre-existing route-span detector for consistency and to close the same false-positive class there.
4. Project Instructions: compressed 5996 → 5599 characters. Wording only — every normative clause preserved; nothing dropped. T80 byte-mirror in file 00 re-synced.
5. `C8` (verifier): add `INSTRUCTIONS_RELEASE_CEILING = 5600`, floor-gated `appliesFrom('v5.5.8')` so v5.5.4–v5.5.7 remain verifiable unchanged.
6. Files 02 and 22: `version:`/`updated:` frontmatter stamp only, to stay C12-compliant; no body change.
7. `tools/build_sot30_release.py`: add `--behavior-adr` (repeatable) and `--supplemental-acceptance-range`, writing `behavior_adrs`/`supplemental_acceptance_range` into the manifest when supplied, so PINO's amendment tracking survives this and future rebuilds. Not required by the verifier (out of scope for this ADR to gate); a residual finding, not a new hard requirement.
8. Selftest: +4 fixtures (90 → 94) — file-28 route token drift, file-28 duplicate route span, Instructions-over-release-ceiling, plus a new v5.5.8 positive-PASS case.
9. No runtime, Supabase schema, gateway, or memory-database change.

## Consequences / price

- Composition churn from `C12`'s unconditional version-stamp rule means "narrow" releases still touch more files than their functional diff.
- This candidate has **not** been through external adversarial review. The scope is deliberately small and mechanically verifiable, but that is a claim this ADR makes, not a substitute for independent review.
- `release_ceiling=5600` is a packaging convention, not a platform-documented limit.
- The route-span grammar tightening (item 6) is a verifier-only change with no content-side effect on any of v5.5.4–v5.5.8; regression-tested to confirm.

## Tests / QA

- `tools/verify_sot30_release.ts`: 29/29 on v5.5.8 and 29/29 regression on v5.5.4/v5.5.5/v5.5.6/v5.5.7.
- `tools/verify_sot30_release.selftest.ts`: 94/94.
- `tools/build_sot30_release.selftest.ts`: 9/9.
- Source-freeze `74a54bf…` (full 40-hex in `support/MANIFEST.json` → `generated_from_ref`); 31/31 source files (30 Knowledge + standalone Instructions) byte-equal to that commit, verified both explicitly and by `C27`'s git-blob-binding gate.
- `tools/verify_ledger.ts`: to be run before commit.

## Diff scope

Knowledge-only: `00, 02, 22, 25, 28, 29`; support Instructions, PACKAGE_RECEIPT, QC_REPORT, README, this ADR, changelog entry, ledger, `tools/verify_sot30_release.ts`, `tools/verify_sot30_release.selftest.ts`, `tools/build_sot30_release.py`, `.github/workflows/sot_integrity.yml`. No runtime code, Supabase schema, or memory writes. Files 12, 20, and the T98–T103 rows in file 28 (PINO's scope) are untouched.

## Rollback

Delete `governance/releases/2026-07-31-sot30-v5-5-8-semantic-budget-repair/`, `dist/SoT30_v5.5.8.zip`, this file, and the v5.5.8 verify step in `sot_integrity.yml`; revert the verifier/selftest/builder diffs (all additive and floor-gated or backward-compatible via optional flags — reverting them only removes v5.5.8-era coverage). Regenerate `ledger/sot.json`. v5.5.7 and PINO's amendment are untouched throughout.

`∆DΩΛ`: ∆ — one self-contradiction echo and one unguarded verifier gap closed; Instructions budget gate added; a manifest-schema gap and a verifier false-positive class found and fixed mid-implementation, both while rebuilding against a baseline that moved (PINO merged) partway through this atom. D — owner SIFT decision → staged edit → branch-base correction (PINO landed after the original branch head; rebuilt against the real current baseline rather than the stale one) → freeze → `--from-git` rebuild → 31/31 parity → 29/29 ×5 releases → 94/94 selftest → 9/9 build. Ω ≤ 0.9 (static package, self-verified only — no external adversarial round yet). Λ — owner decision on this ADR; if accepted, `source_merge` only; artifact_promotion and live verification remain separate, unauthorized stages.
