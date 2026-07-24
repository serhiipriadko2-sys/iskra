# Release contract

## Status ladder

Never collapse these states:

`created != packaged != committed != merged != deployed != invoked != verified-live`

A higher state requires direct evidence for that state. A ZIP hash proves packaging, not installation. A green commit proves repository checks, not live routing.

## Mode gates

### checkpoint

- Bounded source and exclusions are explicit.
- Expected files are present.
- Generated noise and secrets are absent.
- Manifest verification passes after the checkpoint is copied or archived.

### package

- The source package validates on its own terms.
- The final ZIP passes CRC, safe-member, count, size, and exact-manifest checks.
- A source-directory manifest may verify a final ZIP only through the explicit `directory:zip` transport transition; the receipt must record both types, the manifest sha256, the ZIP sha256, and whether content identity passed. For `package_skill.py`, the manifest source is the staging root containing `<skill-name>/...`, because the archive preserves that top-level directory; path equality remains literal.
- The package is read back from the final path before PASS.

### verify

- The manifest schema is accepted.
- Actual and expected path sets match exactly.
- Every size and sha256 matches.
- Policy limits still pass at verification time.

### ledger-integrity

- Read repository-owned ledger commands before running anything.
- Regenerate hashes only after a governed source change.
- Verify from the repository root after regeneration.
- Do not hand-edit generated hash ledgers when an updater exists.

For the Iskra repository, prefer the repository aliases and entrypoints when present:

- `pnpm ledger:update` -> `tools/update_ledger.ts`
- `npx tsx tools/verify_ledger.ts`
- `node tools/run_python.mjs <python-script> ...`

## Receipt minimum

Record:

- artifact path or link;
- byte size and sha256;
- exact file count;
- manifest path and sha256;
- commands with exit status;
- known exclusions and unresolved risks;
- next validation or rollback action.
