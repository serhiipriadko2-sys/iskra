# Unified Full Canon Provenance Receipt

Date: 2026-06-19
Scope: `iskra-full-canon-unified-2026-06-10`
Method: strict local `sha256` comparison from the final unified package against
the 14 recovered staging archives, followed by governance classification.

## Verdict

PASS with boundary.

The package has a traceable primary source, a traceable Horizon add-on, and
duplicate confirmation for Dreamspace, Shadow Core, Somatic Intuition,
StateCycle, memory, templates, and governance layers. Some final files are
generated or normalized during unification, so their source is recorded as
`transformed`, not as direct byte provenance.

## Count Boundary

- Local strict provenance scan target: 166 final source-package files.
- GitHub mirror manifest on `main`: 173 entries after connector-safe
  `08_INTERFACE_STYLE.md` split and mirror helper files.
- These counts are not a conflict. They describe different transport forms of
  the same Builder package.

## Main Refresh Evidence

Current verified GitHub `main` head during this receipt:
`aaabf5d055cd3c755a58a1df7c43a72a17a198b6`.

Drift from PR #206 merge commit `f629328bd3403b1a19db1a003f1ace37838cf8ae`
to current `main`: 15 commits.

Relevant post-PR #206 changes:

- Horizon root canon and wrappers were restored/strictened in PR #203/#208/#209.
- `ledger/sot.json` and `ledger/checksum.asc` were updated.
- Site/SIFT Lab files were added after the Horizon merges.

Package parity check:

| Root path | Package path | Result |
|---|---|---|
| `canon/horizon/09_HORIZON_VALIDATOR.py` | `dist/.../canon/horizon/09_HORIZON_VALIDATOR.py` | byte-identical |
| `canon/horizon/HORIZON_CONTRACT.json` | `dist/.../canon/horizon/HORIZON_CONTRACT.json` | byte-identical |
| `canon/horizon/HORIZON_PROPOSAL_SCHEMA.json` | `dist/.../canon/horizon/HORIZON_PROPOSAL_SCHEMA.json` | byte-identical |
| `canon/horizon/README.md` | `dist/.../canon/horizon/README.md` | byte-identical |
| `tools/horizon_validator.py` | `dist/.../tools/horizon_validator.py` | byte-identical |

Ledger note: root `ledger/sot.json` is repository SoT metadata. It is not a
Builder instruction file. The Builder package records this receipt and must be
re-verified against root ledger before a new release archive is cut.

## Exact Source Contribution

| # | Staging archive | Exact final matches | Unique direct matches | Contribution |
|---:|---|---:|---:|---|
| 01 | `github-iskra-full-canon-builder-2026-06-06-v4` | 112 | 44 | Primary Builder package, root receipts, toolchain bridge, evals, Horizon Weaver docs/helper, governance v4 |
| 02 | `iskra-copy-99eb8147` | 3 | 0 | Shadow Core and memory duplicate confirmation |
| 03 | `iskra-copy-771273ce` | 35 | 0 | Canon source, Builder docs, ADR/ledger template confirmation |
| 04 | `iskra-copy-d0fdb02d` | 47 | 0 | Legacy repo/archive governance, memory stack, migration ADR confirmation |
| 05 | `iskra-copy-28d42ace` | 41 | 0 | Dreamspace/Somatic/StateCycle/Shadow confirmation |
| 06 | `iskra-copy-b934b5913f50` | 3 | 0 | Shadow Core and memory duplicate confirmation |
| 07 | `iskra-copy-cd3f1a46` | 50 | 0 | Toolchain, Dreamspace, Somatic, StateCycle, provenance confirmation |
| 08 | `iskra-copy-eb1a5088` | 1 | 0 | Shadow Core duplicate confirmation |
| 09 | `iskra-copy-5ad20175` | 3 | 0 | Shadow Core and memory duplicate confirmation |
| 10 | `iskra-copy-d3732d84` | 1 | 0 | Shadow Core duplicate confirmation |
| 11 | `iskra-copy-e903639b` | 1 | 0 | Shadow Core duplicate confirmation |
| 12 | `iskra-copy-c0242bae` | 59 | 0 | Broad canon/governance/templates/statecycle/shadow duplicate confirmation; NotebookLM materials excluded from runtime canon |
| 13 | `iskra-copy-d82223f9` | 1 | 0 | Shadow Core duplicate confirmation; raw mantra user uploads excluded from direct Builder package |
| 14 | `iskra-copy-2c451d6f` | 9 | 8 | Unique Horizon PR #1 files: `canon/horizon/*`, `tests/horizon/*`, `tools/horizon_*` |

## Transformed Or Generated During Unification

These files are package outputs, not direct byte copies from a single archive:

- `FULL_CANON_UNIFICATION.md`
- `agent_files/files_for_agent_builder/13_FULL_CANON_SYNTHESIS.md`
- `PROVENANCE_RECEIPT.md`
- `UNIFIED_QC_RECEIPT.json`
- `RECOVERY_RECEIPT.md`
- `MANIFEST.sha256`
- `ZIP_RECEIPT.json`
- GitHub mirror split for `agent_files/canon_source_files/08_INTERFACE_STYLE.md`
- `tools/reassemble_interface_style.py`

Transformation rule: transformed files must state their source boundary and
must not erase maturity labels from the source layers.

## Excluded From Builder Canon

The following categories were intentionally not promoted into the active Builder
canon:

- Uploaded screenshots, photos, PDFs, CSVs, DOCX render artifacts, and OCR text.
- Raw source ZIPs and nested archive inspection folders.
- `WORKSPACE_FILE_LIST.txt`, `WORKSPACE_ZIP_LISTING.txt`,
  `WORKSPACE_MANIFEST.sha256`, and `REDACTION_REPORT.md` from individual
  recovered workspaces.
- `tmp_*`, `docx_render_audit/`, `archive_inspection/`,
  `notebooklm_analysis/`, and NotebookLM-only preparation outputs.
- Python bytecode, `__pycache__`, test byproducts, and local scratch files.
- Chat transcripts and duplicate copy-local memory unless folded into the
  governed memory seed.

Excluded does not mean useless. It means "not active Builder canon". Any
excluded item can be reintroduced only through evidence, ADR, and a receipt.

## Release Gate

GitBook is not a release gate for this package. The repository search found no
GitBook workflow file or code-owned GitBook gate. If GitBook statuses appear,
they are external GitHub App/check noise and should be disabled in GitHub/GitBook
settings or removed from branch protection outside this package.

Release gate for this package:

1. root GitHub `main` SoT/ledger check;
2. package manifest check;
3. secret/QC scan;
4. Horizon tests;
5. Builder UI acceptance prompts.

## Rollback

Rollback is metadata-only:

1. Remove this receipt and linked docs from the upload-set.
2. Return to the PR #206 package receipt state.
3. Re-run manifest/QC and Builder UI acceptance prompts.

## Delta

Delta: provenance is separated into exact, transformed, and excluded.
Data: local staging archives, final package manifest, GitHub `main` compare.
Omega: 0.88 for exact hash provenance; 0.72 for transformed semantic lineage.
Lambda: re-run this receipt whenever a new Builder archive is cut.
