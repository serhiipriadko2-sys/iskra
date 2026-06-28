# Scripts

## Files

- `validate_connector_contracts.py` validates connector contract structure and
  obvious secret patterns.
- `smoke_runtime.py` validates the runtime package, vault clone dry-run,
  credential-bearing URL rejection, and optional public GitHub read reachability.
- `diagnose_codex_desktop.ps1` records Codex Desktop CLI/config/plugin exposure
  status without printing secrets.
- `iskra_git_clone_with_vault.ps1` is the Windows vault-safe git clone helper.
- `iskra_git_clone_with_vault.sh` is the POSIX vault-safe git clone helper.

## Boundary

These scripts validate the local runtime source package. They do not prove the
plugin is installed in the Codex app until the app/CLI reports it.
