# SoT30 v5.5.1 Package — SHA256SUMS self-executability + coverage fix

Follow-up to `ADR-20260716-03` (PR #268). Fixes two packaging-ledger defects in the v5.5.1 full package that did not affect corpus content but broke the package's own static-gate claim:

- **Path inconsistency:** `support/SHA256SUMS` mixed bare knowledge filenames (`00_...md`) with a `support/`-prefixed instructions path, so `sha256sum -c support/SHA256SUMS` could not pass from any single cwd. Regenerated with package-root-relative paths (`knowledge/…`, `support/…`) so the check passes in one command from package root.
- **Incomplete coverage:** `support/MANIFEST.json` was not listed, violating the "SHA256SUMS covers every package file except itself" contract. Now included — 32 entries (30 knowledge + instructions + MANIFEST.json).

Rebuilt `dist/SoT30_v5.5.1.zip` (now sha256 `28748d1323270fda4d28cde0f075e7a327f41957825d0f8874eedddce33ef144`, 1,120,234 bytes); round-trip re-verified via the single command from the extracted package root (32/32 OK). Updated QC report, package receipt, README. No knowledge-file content changed.
