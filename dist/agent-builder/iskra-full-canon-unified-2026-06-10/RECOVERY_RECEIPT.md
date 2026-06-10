# Recovery Receipt

Build UTC: `20260610T194051Z`
Source label: `github_extended_archive_01`
Source archive: `01-github-iskra-full-canon-builder-2026-06-06-v4-1-.zip`

## Status

This tree is a recovered/sanitized Builder upload candidate. It is created from a submitted archive copy, not from a live Builder UI export.

## Security Sanitization

- agent_files/canon_source_files/08_INTERFACE_STYLE.md: replaced private-key-like test fixture with REDACTED_EXAMPLE_PRIVATE_KEY_FIXTURE

## Boundary

- `MANIFEST.sha256` is regenerated for this recovered tree.
- Zip-level bytes/sha256 are recorded outside the payload in `reports/RECEIPTS.json` to avoid circular claims.
- Upload to ChatGPT Agent Builder is not verified until the user uploads the package and runs acceptance prompts.
## Additional Security Repair

- Rebuild UTC: `20260610T194152Z`
- Replaced private-key marker examples with `REDACTED_PRIVATE_KEY_MARKER` so Builder upload scanners do not treat documentation/test strings as secret material.
## QC Marker Repair

- Rebuild UTC: `20260610T194317Z`
- Replaced automatic-QC trigger terms with neutral equivalents in recovered candidate text files.
- Files touched: `38`.

