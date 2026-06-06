# QC Checks

Release: `iskra-full-canon-builder-2026-06-06-v4`
Date: 2026-06-06

## Local Checks

- Source file inventory: PASS.
- Source overlap detection: PASS, two overlaps found and resolved.
- Conflict source preservation: PASS.
- Required-file presence: PASS.
- Governance source presence: PASS, `governance/` copied.
- Security policy presence: PASS, root `SECURITY.md` copied.
- Runtime plugin source validation: PASS.
- Connector contract validation: PASS, 8 contracts.
- Runtime bridge smoke: PASS, including vault dry-run, secret URL rejection,
  and public GitHub read smoke.
- Codex Desktop config exposure: PASS, `iskra-toolchain-bridge@iskra-local`
  enabled in `C:\Users\gabra\.codex\config.toml`; app load remains pending
  because `codex.exe` returns `Access is denied`.
- Live connector read checks: PASS for GitHub connector, Supabase connector, and
  Opera browser read path; PARTIAL for official Codex docs/manual fallback.
- Builder runtime hardening prompts: PRESENT,
  `agent_files/evals/BUILDER_RUNTIME_HARDENING_PROMPTS.md`.
- Manifest regeneration: PASS, `MANIFEST.sha256` covers packaged payload files
  except itself and sidecar `ZIP_RECEIPT.json`.
- Zip integrity: PASS when `ZIP_RECEIPT.json` reports `artifact_qc_content_ok:
  true`.
- Secret scan: PASS for obvious credential patterns. Policy/example mentions
  are allowed only as non-secret text.

## Required Builder UI Checks

- Upload package into ChatGPT / OpenAI Agent Builder.
- Verify files are visible in Builder knowledge.
- Run Dreamspace, Somatic, and Toolchain acceptance prompts.
- Run `BUILDER_RUNTIME_HARDENING_PROMPTS.md` and require 6/6 PASS.
- Mark status only as `verified in Builder UI` after those prompt checks pass.
