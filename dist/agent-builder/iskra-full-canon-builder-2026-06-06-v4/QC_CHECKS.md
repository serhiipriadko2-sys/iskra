# QC Checks

Release: `iskra-full-canon-builder-2026-06-06-v4`
Date: 2026-06-06

## Local Checks

- Required-file presence: PASS.
- Dream create six-field block smoke: PASS (`--adoml` missing blocks creation).
- Turn hook smoke: PASS.
- Zip integrity: PASS after final packaging.
- Manifest regeneration: `MANIFEST.sha256` covers every packaged file except itself.
- Secret scan: REVIEWED. Hits are policy/example strings (`service_role` guidance and a redacted/private-key detection fixture), not observed credential values.

## Required Builder UI Checks

- Upload package into ChatGPT / OpenAI Agent Builder.
- Verify files are visible in Builder knowledge.
- Run Dreamspace, Somatic, and Toolchain acceptance prompts.
- Mark status only as `verified in Builder UI` after those prompt checks pass.
