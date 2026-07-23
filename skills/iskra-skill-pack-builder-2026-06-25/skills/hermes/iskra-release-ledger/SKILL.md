---
name: iskra-release-ledger
description: Build and verify traceable releases for Iskra. Use when packaging a Skill or project, creating or checking manifests, checksums, receipts, upload sets, changelogs, version notes, checkpoints, ZIP archives, ledger hashes, or deciding whether an artifact is truly complete. Own legacy checkpoint-builder, iskra-workflow-ops, and iskra-ledger-integrity requests. Never infer installation, deployment, merge, or live routing from static package evidence.
---

# Iskra Release Ledger

## Operating modes

Select exactly one primary mode, then add secondary checks only when needed:

1. **checkpoint** — freeze a bounded file set with a reproducible receipt.
2. **package** — build a clean directory or ZIP deliverable and verify its contents.
3. **verify** — compare an artifact against an existing manifest and fail on drift.
4. **ledger-integrity** — verify repository-owned hashes after governed source changes.

Treat requests formerly routed to `checkpoint-builder`, `iskra-workflow-ops`, or `iskra-ledger-integrity` as these modes instead of delegating to a second release authority.

## Required workflow

1. Read the source, expected file set, governing ADR, and repository release commands.
2. State the exact scope and exclusions before writing or packaging.
3. Run `scripts/release_manifest.py build <artifact> --output <manifest.json>` with the manifest outside the artifact.
4. Run `scripts/release_manifest.py verify <artifact> --manifest <manifest.json>` after any same-form copy or upload preparation. For an intentional directory-to-ZIP repackaging, add `--transport-transition directory:zip`; all path, byte, sha256, archive-safety, and secret checks remain strict. When the platform `package_skill.py` is used, build the source manifest from a staging root that contains `<skill-name>/...`, matching the ZIP entry names exactly; do not strip or normalize a top-level prefix in the verifier.
5. For a Skill, also run the platform `package_skill.py`; return the complete package as `skill.zip`.
6. Run relevant smoke, unit, routing-contract, and repository integrity checks.
7. Produce a receipt with path or link, bytes, sha256, file count, commands, and PASS/FAIL.
8. Keep status precise: packaged is not installed; committed is not merged; deployed is not invoked; invoked is not verified-live.

## Fail-closed rules

Reject the release when any required check finds:

- a missing, extra, empty, unreadable, or hash-mismatched file;
- an absolute path, traversal path, duplicate member, case-fold collision, or symlink;
- generated noise such as `__pycache__`, `.pyc`, `.pytest_cache`, `.mypy_cache`, `.DS_Store`, or `Thumbs.db`;
- an unreadable or CRC-invalid ZIP;
- an archive exceeding configured file-count, byte, or compression-ratio limits;
- a secret-like file or value that has not been explicitly cleared for release;
- a promised artifact without a concrete path/link and read-back receipt.

Do not weaken a test to make a candidate pass. Fix the candidate or return `Bridge+FAIL` with the smallest next action.

## Output contract

Use this structure for release decisions:

```text
Mode:
Source:
Artifact:
Expected scope:
Commands/tests:
Receipt: path/link, bytes, sha256, files
Status ladder: created | packaged | committed | merged | deployed | invoked | verified-live
Findings:
PASS/PARTIAL/FAIL:
Next <=15 min:
DeltaDOL:
```

## References

- Read `references/release-contract.md` for mode-specific gates and repository integration.
- Read `references/artifact-qc.md` for archive and receipt interpretation.
- Read `references/routing-contract.md` when changing triggers or testing ownership boundaries.
