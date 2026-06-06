#!/usr/bin/env python3
"""Smoke-test the Iskra Toolchain Bridge runtime source package."""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path
from typing import Any


PUBLIC_SMOKE_REPO = "https://github.com/serhiipriadko2-sys/iskra.git"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--plugin-root",
        default=str(Path(__file__).resolve().parents[1]),
        help="Path to iskra-toolchain-bridge plugin root.",
    )
    parser.add_argument("--skip-network", action="store_true", help="Skip git ls-remote.")
    parser.add_argument("--receipt", help="Optional JSON receipt output path.")
    return parser.parse_args()


def run(cmd: list[str], cwd: Path | None = None) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        cmd,
        cwd=str(cwd) if cwd else None,
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        shell=False,
    )


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as fh:
        for chunk in iter(lambda: fh.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def find_powershell() -> str | None:
    return shutil.which("pwsh") or shutil.which("powershell")


def main() -> int:
    args = parse_args()
    plugin_root = Path(args.plugin_root).resolve()
    checks: list[dict[str, Any]] = []
    errors: list[str] = []

    def add_check(name: str, ok: bool, detail: str) -> None:
        checks.append({"name": name, "ok": ok, "detail": detail})
        if not ok:
            errors.append(f"{name}: {detail}")

    required_paths = [
        ".codex-plugin/plugin.json",
        "skills/iskra-toolchain-bridge/SKILL.md",
        "scripts/validate_connector_contracts.py",
        "scripts/iskra_git_clone_with_vault.ps1",
        "scripts/iskra_git_clone_with_vault.sh",
        "contracts/github.md",
        "contracts/supabase.md",
        "contracts/agent-builder.md",
    ]
    missing = [rel for rel in required_paths if not (plugin_root / rel).exists()]
    add_check("required_paths", not missing, "missing=" + ",".join(missing) if missing else "all present")

    validator = plugin_root / "scripts" / "validate_connector_contracts.py"
    result = run([sys.executable, str(validator), "--plugin-root", str(plugin_root)])
    add_check(
        "connector_contracts",
        result.returncode == 0,
        (result.stdout + result.stderr).strip(),
    )

    plugin_json = plugin_root / ".codex-plugin" / "plugin.json"
    add_check("plugin_manifest_hash", plugin_json.exists(), sha256_file(plugin_json) if plugin_json.exists() else "missing")

    ps = find_powershell()
    if ps is None:
        add_check("powershell_helper", False, "pwsh/powershell not found")
    else:
        helper = plugin_root / "scripts" / "iskra_git_clone_with_vault.ps1"
        dry_target = Path(tempfile.gettempdir()) / "iskra-toolchain-dry-run"
        good = run(
            [
                ps,
                "-NoProfile",
                "-ExecutionPolicy",
                "Bypass",
                "-File",
                str(helper),
                "-RepoUrl",
                PUBLIC_SMOKE_REPO,
                "-TargetDir",
                str(dry_target),
                "-DryRun",
            ]
        )
        add_check("vault_clone_dry_run", good.returncode == 0, (good.stdout + good.stderr).strip())

        bad = run(
            [
                ps,
                "-NoProfile",
                "-ExecutionPolicy",
                "Bypass",
                "-File",
                str(helper),
                "-RepoUrl",
                "https://token@example.com/owner/repo.git",
                "-TargetDir",
                str(dry_target),
                "-DryRun",
            ]
        )
        add_check("secret_url_rejection", bad.returncode != 0, (bad.stdout + bad.stderr).strip())

    if args.skip_network:
        add_check("git_public_ls_remote", True, "skipped")
    else:
        git = shutil.which("git")
        if git is None:
            add_check("git_public_ls_remote", False, "git not found")
        else:
            network = run([git, "ls-remote", PUBLIC_SMOKE_REPO, "HEAD"])
            add_check("git_public_ls_remote", network.returncode == 0, (network.stdout + network.stderr).strip())

    receipt = {
        "plugin": "iskra-toolchain-bridge",
        "status": "PASS" if not errors else "FAIL",
        "plugin_root": str(plugin_root),
        "network": "skipped" if args.skip_network else "enabled",
        "checks": checks,
        "boundary": "This validates local runtime source package shape, not Codex app installation.",
    }

    if args.receipt:
        receipt_path = Path(args.receipt).resolve()
        receipt_path.parent.mkdir(parents=True, exist_ok=True)
        receipt_path.write_text(json.dumps(receipt, indent=2) + "\n", encoding="utf-8")

    print(json.dumps(receipt, indent=2))
    return 0 if not errors else 1


if __name__ == "__main__":
    raise SystemExit(main())
