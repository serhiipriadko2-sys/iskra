# QC Checks

Release: `iskra-full-canon-unified-2026-06-10`
Date: 2026-06-10
Updated: 2026-06-20

## Local Checks

- Source file inventory: PASS for the pre-Horizon v4 package.
- Source overlap detection: PASS, two overlaps found and resolved.
- Conflict source preservation: PASS.
- Required-file presence: PASS for the pre-Horizon v4 package.
- Governance source presence: PASS, `governance/` copied.
- Security policy presence: PASS, root `SECURITY.md` copied.
- Horizon Builder layer presence: PASS,
  `agent_files/files_for_agent_builder/10_HORIZON_WEAVER.md`.
- Horizon helper source presence: PASS,
  `agent_runtime_tools/iskra_horizon_weaver.py`.
- Horizon helper smoke expectations: `py_compile`, dry-run proposal, validation
  PASS/BLOCKED behavior, and commit-without-permission BLOCKED.
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
- Manifest regeneration: PENDING for the Horizon branch. `MANIFEST.sha256` still
  reflects the pre-Horizon v4 payload until the package tree is checked out and
  the manifest is regenerated.
- Zip integrity: PENDING for the Horizon branch. The existing `ZIP_RECEIPT.json`
  remains the pre-Horizon sidecar receipt until a new archive is built.
- Secret scan: PENDING for the Horizon branch after checkout. Policy/example
  mentions are allowed only as non-secret text.

## Horizon Smoke Commands

When file-backed execution is available, run from the package root:

```bash
python agent_runtime_tools/iskra_horizon_weaver.py status --ledger-root /tmp/iskra-horizon-smoke
python agent_runtime_tools/iskra_horizon_weaver.py propose \
  --ledger-root /tmp/iskra-horizon-smoke \
  --trigger false-green-loop \
  --blocked-by "wrapper exits zero while canonical target is absent" \
  --proposed-shift "make strict failure visible and keep optional explicit" \
  --rollback-hint "revert the proposal entry" \
  --evidence "PR/log/file pointer" \
  --output /tmp/iskra-horizon-proposal.json
python agent_runtime_tools/iskra_horizon_weaver.py validate \
  --ledger-root /tmp/iskra-horizon-smoke \
  --proposal /tmp/iskra-horizon-proposal.json
python agent_runtime_tools/iskra_horizon_weaver.py commit \
  --ledger-root /tmp/iskra-horizon-smoke \
  --proposal /tmp/iskra-horizon-proposal.json \
  --permission NOPE \
  --actor smoke \
  --reason "permission boundary smoke"
```

Expected: status returns local boundary; propose emits `PROPOSED`; validate returns `PASS`; commit with wrong permission returns `BLOCKED` / `PERMISSION_REQUIRED`.

## Required Before Release / Upload Archive Refresh

- Checkout the Horizon branch.
- Run Horizon smoke commands above.
- Regenerate `MANIFEST.sha256` for the package payload.
- Rebuild the zip archive and refresh `ZIP_RECEIPT.json`, if a downloadable upload set is required.
- Run a secret scan over the refreshed tree.

## Required Builder UI Checks

- Upload package into ChatGPT / OpenAI Agent Builder.
- Verify files are visible in Builder knowledge.
- Run Dreamspace, Horizon, Somatic, and Toolchain acceptance prompts.
- Run `BUILDER_RUNTIME_HARDENING_PROMPTS.md` and require 6/6 PASS.
- Mark status only as `verified in Builder UI` after those prompt checks pass.
