# Codex Desktop Activation Receipt

Status: `config-exposed-cli-blocked`
Date: 2026-06-06

## Context

The bridge should be visible to Codex Desktop as a local plugin/skill runtime
source, not only as repository files.

## Observed Facts

- `codex` and `codex.exe` resolve to
  `C:\Program Files\WindowsApps\OpenAI.Codex_26.429.3425.0_x64__2p2nqsd0c76g0\app\resources\`.
- File metadata reports `codex-windows-sandbox` version `0.128.0-alpha.1`.
- `codex --version`, direct `codex.exe --version`, direct extensionless
  `codex --version`, and `codex mcp list` fail with `Access is denied`.
- `gh` is installed, but `gh auth status` reports no logged-in GitHub hosts.
- `C:\Users\gabra\.codex\config.toml` now exposes:
  - `[marketplaces.iskra-local] source = 'C:\github\iskra-1\plugins'`
  - `[plugins."iskra-toolchain-bridge@iskra-local"] enabled = true`

## Diagnosis

`codex.exe Access is denied` is not a missing PATH issue. The executable is
present in a packaged WindowsApps Codex Desktop install, but shell execution is
blocked by the packaged-app boundary/ACL from this PowerShell environment.

## Verification

- Local plugin files are present.
- Local Codex config exposure is present.
- Codex CLI runtime load is not verified because CLI execution is blocked.

## Risk

The plugin is exposed to Codex Desktop configuration, but the current running app
may require restart/reload before it discovers `iskra-local`. Since the CLI is
blocked, this receipt cannot prove active app load.

## Next

Restart Codex Desktop or open a fresh Codex session, then verify that
`iskra-toolchain-bridge@iskra-local` appears in available skills/plugins. If
`codex.exe` remains blocked from shell, keep CLI-based checks marked `blocked`
and use app-visible plugin inventory as the runtime proof.
