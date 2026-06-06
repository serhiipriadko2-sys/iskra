# Runtime Receipt

Status: local-validated
Date: 2026-06-06

## Context

The Agent Builder v4 upload set included a minimal `iskra-toolchain-bridge`
plugin skeleton. This runtime package materializes the bridge as a local plugin
source with executable smoke checks and connector contracts.

## Change

- Added a schema-complete Codex plugin manifest.
- Added an operational bridge skill.
- Added connector contracts.
- Added vault-safe git clone helpers for PowerShell and POSIX shells.
- Added local validation and smoke scripts.
- Installed `PyYAML` in user Python so the Codex plugin validation helper can run.

## Evidence

- `.codex-plugin/plugin.json`
- `skills/iskra-toolchain-bridge/SKILL.md`
- `contracts/*.md`
- `scripts/validate_connector_contracts.py`
- `scripts/smoke_runtime.py`
- `scripts/iskra_git_clone_with_vault.ps1`
- `scripts/iskra_git_clone_with_vault.sh`
- `runtime-smoke-receipt.json`

## Verification

- Codex plugin schema validation: PASS.
- Connector contract validation: PASS, 8 contracts.
- Runtime smoke: PASS.
- Vault clone dry-run: PASS.
- Credential-bearing URL rejection: PASS.
- Public GitHub read smoke: PASS, `git ls-remote` returned HEAD
  `e85d6e9577f54b8ed6a7b634a34a966dd6c8552e`.

## Risk

Codex app installation is not yet verified in this shell because `codex.exe`
currently returns `Access is denied`. The package is validated as a runtime
source, not installed into the Codex app UI.

## Next

After Codex CLI access is restored, install/update this plugin into Codex
Desktop and rerun runtime smoke checks through the app-visible plugin path.

## Status

`runtime-source-validated`; Codex app install verification pending.
