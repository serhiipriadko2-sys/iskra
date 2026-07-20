# ADR-20260720-02: SoT30 v5.5.4 — Semantic & Runtime-Status Consistency

Status: accepted (2026-07-20, owner decision)

Date: 2026-07-20

Owner: project owner (Семён)

Builder: Claude Code

Package mirror: done

Implementation: merged (PR #289, merge `1ac741f`)

Conformance hardening: pending PR-C (`fix/sot30-v554-verifier-hardening`)

Live verification: pending

> **Lifecycle note (2026-07-20).** These are distinct stages and are not
> collapsed. `accepted` records the owner accepting the **architectural
> decision** below (v5.5.3 immutable; corrections ship as versioned packages;
> physical / semantic / runtime-status / live-Project readiness stay separate;
> STATIC-PACKAGE-PASS ≠ LIVE-PROJECT-PASS). It does **not** assert that the
> shipped `tools/verify_sot30_release.ts` already fully meets its advertised
> fail-closed contract — an independent review found several checks weaker than
> their labels; those are being hardened in PR-C. Nor does it assert any
> live-Project verification (still pending).

## Context

SoT30 v5.5.3 is **physically** intact: `dist/SoT30_v5.5.3.zip` (`a3c3bfb8…`, 1,125,899 bytes) passes a fresh-extraction `sha256sum -c` at 32/32, the file-29 embedded table agrees with `support/SHA256SUMS`/`MANIFEST.json`, T80 instruction parity holds, and T01–T87 are statically continuous. PR #288 (merge `d490f7d`) synced the *external* v5.5.3 receipts (README/QC/changelog/ledger/canon-index) to the amended artifact without touching the package.

Physical integrity is not the same as semantic, runtime-status, or live correctness. A line-by-line audit of the uploadable corpus surfaced defects that live **inside** the Knowledge/support content, which the PR-A receipt fix was explicitly forbidden to change (editing Knowledge changes the hash chain and the ZIP). They are separated here:

- **Semantic narrative drift.** `knowledge/29_INDEX_UPLOAD_MANIFEST.md` still tells an in-Project agent that "the other 28 files are byte-identical to v5.5.2." After the v5.5.3 Decisions 4–6 amendment (files 02/22/26/28/29 changed), the true count is 24 unchanged. `support/MANIFEST.json` also classifies files ambiguously (a file can appear as both changed and in the "unchanged_content_from_v5_5_2" set).
- **Runtime-status drift.** `knowledge/11_SLO_PLAYBOOK_CONTROL.md`, `20_GOVERNANCE_ADR.md`, and `01_PARITY_ADVANCEMENT_MANIFEST.md` describe the bounded-Guard lifecycle in terms that no longer match `runtime/`. As of `main`, `runtime/src/types/guardController.ts` implements a bounded controller and `runtime/iskraSpace/services/policyEngine.ts` wires its decision into playbook selection. But the wired `postGuardEws` (policyEngine.ts:487–496) is a **proxy**: it maps `candidate.decision → synthetic alert level` and derives `materialSignal` from that mapping — it is not an independently observed post-guard material event. Docs must not imply a true late-signal EWS that is not there.
- **Live Supabase overlay drift.** `knowledge/15_SUPABASE_MEMORY_PLANE.md` carries stale live counts and a "gateway v2" claim without a freshness stamp. Migration parity, live schema, live data counts, edge-function deployment, and Projects-Action invocation are distinct facts and must not be inferred from one another.
- **Incomplete file-24 provenance.** The v5.5.3 receipts assert `24_INTERFACE_STYLE.md`'s 18-byte/hash discrepancy is "not a CRLF artifact," but no reproducible raw-blob diff receipt was ever produced. Root cause must not be labeled FACT without one.
- **No fresh live-Project acceptance and no CI semantic gate.** Nothing prevents the same narrative/hash drift from recurring, and STATIC-PACKAGE-PASS has been allowed to read like LIVE-PROJECT-PASS.

Truth-ladder note: audit reports are hypothesis sources, not final SoT. Every material claim below is graded FACT / INTERP / HYP and does not become FACT by repetition.

## Decision

1. **v5.5.3 remains an immutable historical release.** Its ZIP, `knowledge/`, and `support/` bytes are not edited. `dist/SoT30_v5.5.2.zip` stays pruned (ADR-20260720-01).
2. **All corrections that touch Knowledge/support ship as a new package, v5.5.4**, under `governance/releases/2026-07-20-sot30-v5-5-4-semantic-runtime-consistency/`, built from the v5.5.3 corpus as baseline.
3. **Status overlays carry provenance.** Any live/runtime status assertion gets `observed_at`, `source`, `freshness`, and `maturity`, and separates MIGRATION_PARITY / LIVE_SCHEMA / LIVE_DATA_COUNTS / EDGE_FUNCTION_DEPLOYMENT / PROJECTS_ACTION_INVOCATION as independent facts.
4. **The proxy EWS is named as such.** `postGuardEws` is documented as a decision-derived proxy, not a true independently-observed late-signal EWS; the true-late-signal path is marked E2E-unverified. No runtime code is changed in this PR to "match" the docs.
5. **changed/unchanged classifications are disjoint and total.** `MANIFEST.json` and file 29 must satisfy `changed ∩ unchanged = ∅` and `changed ∪ unchanged = all 30 knowledge files`, enforced by a verifier.
6. **Historical/mythic signatures do not set the runtime confidence contract.** Legacy `Ω = 1.0` / `Ω = 0.97` values inside the preserved Bushido scrolls (file 25) get a top-level historical gloss; the active invariant remains `Ω ≤ 0.95`. File 24 gets a reference/historical-mirror quarantine overlay.
7. **File-24 root cause is promoted to FACT only after a raw-blob diff receipt.** A direct `git show <commit>:<path>` extraction of both blobs, with byte/CRLF/sha256 accounting and a full patch, is produced under `governance/audits/2026-07-20-sot30-v554/`. Until then the discrepancy is recorded as partial/unknown.
8. **STATIC-PACKAGE-PASS does not imply LIVE-PROJECT-PASS.** Both file 29 and the release README state this explicitly, and a live-Project claim requires an exact 30-file manifest-hash match recorded in a separate receipt.

## Alternatives

- **Leave v5.5.3 as-is.** Rejected: an uploaded agent would be taught a false composition and a non-existent late-signal EWS.
- **Edit v5.5.3 files in place.** Rejected: mutates a shipped immutable release and its hash chain; destroys the audit trail.
- **Documentation-only erratum (no package).** Rejected: the defects are *inside* the uploadable Knowledge, so a repo-only note never reaches an in-Project reader.
- **Full versioned v5.5.4 package (chosen).** Only option that (a) keeps v5.5.3 immutable and (b) delivers corrected content to the surface an agent actually reads.

## Consequences

- New per-file hashes, a regenerated file-29 table, a new `SHA256SUMS`/`MANIFEST.json`, and a new `dist/SoT30_v5.5.4.zip`.
- Ledger and canon-index regeneration.
- A fresh live-Project upload is required before any LIVE-PROJECT-PASS claim; this PR does not perform it.
- New acceptance cases T88–T93 and a CI-enforced semantic verifier (`tools/verify_sot30_release.ts`, fail-closed).

## Rollback

- Close PR-B; do not delete v5.5.3; do not rewrite the old ZIP.
- Return the package pointer to v5.5.3.
- Preserve all audit evidence under `governance/audits/2026-07-20-sot30-v554/`.

## Status

`proposed`. Not `accepted` absent an explicit owner decision. Not deployed. No runtime, Supabase, or GitHub-app-behavior change. `iskra-memory-gateway` untouched. Live-Project verification pending.
