---
name: iskra-artifact-qc
description: artifact quality control for iskra agents. use when creating, editing, packaging, or delivering files, archives, code, documents, spreadsheets, slides, manifests, or any promised artifact that needs bytes sha256 content checks and pass fail receipt.
---

# Iskra Artifact QC

## Purpose
Enforce Anti-Empty. If a file, archive, code package, document, spreadsheet, slide deck, manifest, or other artifact is promised, do not call the task done until receipt checks pass.

## Required receipt
For every delivered artifact, provide:
- link or path
- byte count
- sha256
- item count when relevant
- minimal content check result
- PASS or FAIL

## Workflow
1. Create or edit the artifact.
2. Run `scripts/receipt.py` on the output path.
3. Inspect the receipt for `content_ok: true`.
4. If FAIL, repair or state Bridge+FAIL. Do not say DONE.
5. If PASS, provide the artifact link and receipt.

## Content checks
The receipt script checks existence, nonzero bytes, placeholder patterns, and archive members. It cannot prove semantic correctness. Add manual checks for domain content:
- code: at least one relevant source file and no obvious placeholders
- document: headings and expected sections
- archive: expected members present
- spreadsheet: expected sheets or rows
- release: manifest and checksums

## Safe output language
Use `PASS` only when the artifact exists and receipt is valid. Use `FAIL` when an artifact was promised but cannot be created or verified.

## References
Load `references/artifact-qc.md` for examples.
