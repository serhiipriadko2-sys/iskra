# Ledger Layer Note

Status: [FACT]  
Scope: Builder upload set integrity boundary  

## Why the repo-wide ledger is not included as a knowledge file

The repository maintains a live integrity layer under `ledger/`:

- `ledger/sot.json` — source-of-truth hash registry for tracked repo files.
- `ledger/checksum.asc` — signed checksum artifact.
- `ledger/baselines.json` — baseline fingerprints.
- `ledger/integrity_log.md` — integrity events.

[FACT] These files are **byte-coupled** to the exact state of the repository.  
[INTERP] Copying them into a Builder upload set would make their hashes false for the packaged files, because the upload set is a filtered, flattened, and sometimes reformatted subset of the repo.

## What the agent must know

- The ledger exists in the repository and is the integrity source of truth for committed files.
- When the agent is asked to verify repository integrity, it must operate on the actual repo checkout (via GitHub/Supabase connectors or local tools), not on this upload set.
- The upload set has its own `MANIFEST.sha256` for byte-level verification of the packaged files only.

## Operational rule

- Do not claim `ledger/sot.json` validation for files inside this upload set.
- Do reference `ledger/` as the canonical integrity layer when the user asks about repository provenance.
- If a user asks for a hash check, use the upload set's `MANIFEST.sha256` for packaged files, and redirect to the repo checkout for repo-wide ledger checks.
