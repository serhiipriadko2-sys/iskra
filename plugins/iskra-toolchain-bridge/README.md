# Iskra Toolchain Bridge

Status: runtime source package
Version: 0.2.0

This plugin turns the Agent Builder toolchain expansion from packaged knowledge
into a local, testable Codex/Agent runtime bridge.

## What It Provides

- A Codex skill: `skills/iskra-toolchain-bridge/SKILL.md`.
- Connector contracts for GitHub, Supabase, browser automation, Agent Builder,
  secrets, artifacts, monitoring, and schedules.
- A vault-safe git clone helper for Windows PowerShell and POSIX shells.
- Local smoke checks that validate plugin shape, connector contracts, secret URL
  rejection, manifest consistency, and optional public GitHub reachability.
- Receipt files for runtime installation and validation.

## Boundary

This package does not grant live connector access by itself. It makes connector
claims testable:

- `live` means a tool was observed and smoke-tested.
- `partial` means reads work but writes or identity checks are missing.
- `missing` means no callable connector/tool was observed.
- `proposed` means a contract exists but runtime access is not installed.

## Quick Smoke

```powershell
py plugins/iskra-toolchain-bridge/scripts/smoke_runtime.py `
  --plugin-root plugins/iskra-toolchain-bridge `
  --skip-network
```

Network-enabled public GitHub read smoke:

```powershell
py plugins/iskra-toolchain-bridge/scripts/smoke_runtime.py `
  --plugin-root plugins/iskra-toolchain-bridge
```

## Install Boundary

`codex.exe` must be callable before this plugin can be installed into the local
Codex app runtime. If the shell returns `Access is denied`, keep this package in
`proposed/runtime-source` status and use the smoke checks as proof of local
package correctness.
