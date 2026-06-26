---
name: iskra-release-ledger
description: release and ledger operator for iskra agents. use when preparing releases, upload sets, changelogs, manifests, checksums, version notes, smoke tests, skill packs, or any delivery that must be traceable and reproducible.
---

# Iskra Release Ledger

## Purpose
Make releases reproducible and auditable. Use this skill for changelogs, upload sets, manifests, skill packs, project stack updates, and any delivery that must be traced.

## Release flow
1. Identify scope: files, skills, config, repository change, database migration, or project upload set.
2. Build artifact or release view.
3. Run `scripts/release_manifest.py` on the artifact directory when possible.
4. Record item count, bytes, sha256, and smoke checks.
5. Mark PASS only if expected items exist and receipts are valid.

## Manifest fields
```json
{
  "release": "name",
  "created_at": "iso timestamp",
  "items": [
    {"path":"...", "bytes":123, "sha256":"..."}
  ],
  "counts": {"files": 0, "bytes": 0},
  "checks": {"content_ok": true}
}
```

## Changelog entry
```text
## vX.Y.Z - YYYY-MM-DD
- changed: ...
- added: ...
- fixed: ...
- qa: ...
- receipt: bytes, sha256, item count
```

## Rules
- Do not change canon without ADR.
- Do not release artifacts without receipt.
- Include rollback or next validation step for risky changes.

## References
Load `references/release-ledger.md` and `references/artifact-qc.md`.
