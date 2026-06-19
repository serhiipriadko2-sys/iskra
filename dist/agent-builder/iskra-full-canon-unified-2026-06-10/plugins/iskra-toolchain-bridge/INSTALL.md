# Install And Runtime Verification

Status: install guide

## Preconditions

- `git` is available on PATH.
- `py` or Python 3.11+ is available for validation scripts.
- Optional: `codex` CLI is available and callable.
- Optional for private clone smoke: a named environment secret such as
  `GITHUB_TOKEN`, never a token in a URL or command argument.

## Local Validation

```powershell
py C:\Users\gabra\.codex\skills\.system\plugin-creator\scripts\validate_plugin.py `
  plugins/iskra-toolchain-bridge

py plugins/iskra-toolchain-bridge/scripts/validate_connector_contracts.py `
  --plugin-root plugins/iskra-toolchain-bridge

py plugins/iskra-toolchain-bridge/scripts/smoke_runtime.py `
  --plugin-root plugins/iskra-toolchain-bridge `
  --skip-network
```

## Codex Runtime Install

This repository now exposes the plugin through a local Codex marketplace entry:

```toml
[marketplaces.iskra-local]
source_type = "local"
source = 'C:\github\iskra-1\plugins'

[plugins."iskra-toolchain-bridge@iskra-local"]
enabled = true
```

That connects the plugin source to Codex Desktop configuration. Do not claim
fully installed status until the plugin is visible in the Codex app or `codex`
reports it.

Current known blocker on this machine:

```text
codex.exe: Access is denied
```

When that is fixed, rerun:

```powershell
codex --version
codex mcp list
```

Then reinstall/update the plugin through the current Codex plugin workflow and
rerun `smoke_runtime.py`.

Diagnostic receipt:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File `
  plugins/iskra-toolchain-bridge/scripts/diagnose_codex_desktop.ps1 `
  -ReceiptPath plugins/iskra-toolchain-bridge/codex-desktop-diagnostic.json
```

## Vault-Safe Clone Smoke

Public repo, no token:

```powershell
pwsh -File plugins/iskra-toolchain-bridge/scripts/iskra_git_clone_with_vault.ps1 `
  -RepoUrl https://github.com/serhiipriadko2-sys/iskra.git `
  -TargetDir $env:TEMP\iskra-toolchain-public-smoke `
  -DryRun
```

Private repo, token by handle only:

```powershell
$env:GITHUB_TOKEN = "<set outside repo; do not print>"
pwsh -File plugins/iskra-toolchain-bridge/scripts/iskra_git_clone_with_vault.ps1 `
  -RepoUrl https://github.com/owner/private-repo.git `
  -TargetDir $env:TEMP\private-repo-smoke `
  -TokenEnvVar GITHUB_TOKEN
```

The helper rejects credential-bearing URLs such as:

```text
https://token@github.com/owner/repo.git
```

## PASS Criteria

- Plugin schema validation passes.
- Connector contract validation passes.
- Secret-bearing git URLs are rejected.
- Optional public `git ls-remote` smoke passes when network is enabled.
- Receipt names only secret handles, never secret values.
