#!/usr/bin/env python3
"""Audit Iskra runtime/package surfaces without merging their truth claims.

The output is a surface inventory: every count/hash/status belongs to one
observed surface. A Builder UI count, GitHub tree count, workspace count, and
zip count are intentionally kept separate.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import zipfile
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


PACKAGE_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_WORKSPACE_ROOT = Path(os.environ.get("ISKRA_WORKSPACE_ROOT", "/workspace"))

SKIP_DIRS = {
    ".git",
    ".mypy_cache",
    ".pytest_cache",
    ".ruff_cache",
    ".venv",
    "__pycache__",
    "node_modules",
}

SKIP_FILES = {
    "SURFACE_INVENTORY.json",
    "ZIP_RECEIPT.json",
}


def utc_now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def sha256_file(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as fh:
        for chunk in iter(lambda: fh.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def iter_files(root: Path) -> list[Path]:
    if not root.exists():
        return []
    files: list[Path] = []
    for path in root.rglob("*"):
        if any(part in SKIP_DIRS for part in path.parts):
            continue
        if path.name in SKIP_FILES:
            continue
        if path.is_file():
            files.append(path)
    return sorted(files)


def surface_hash(entries: list[dict[str, Any]]) -> str:
    h = hashlib.sha256()
    for item in entries:
        h.update(item["path"].encode("utf-8"))
        h.update(b"\0")
        h.update(str(item["bytes"]).encode("ascii"))
        h.update(b"\0")
        h.update(item["sha256"].encode("ascii"))
        h.update(b"\n")
    return h.hexdigest()


def file_surface(root: Path, label: str, *, base: Path | None = None, sample_limit: int = 25) -> dict[str, Any]:
    base = base or root
    files = iter_files(root)
    entries = []
    for path in files:
        try:
            rel = path.relative_to(base).as_posix()
        except ValueError:
            rel = str(path)
        try:
            size = path.stat().st_size
            digest = sha256_file(path)
        except OSError as exc:
            entries.append({"path": rel, "status": "unreadable", "error": str(exc)})
            continue
        entries.append({"path": rel, "bytes": size, "sha256": digest})

    readable = [item for item in entries if "sha256" in item]
    return {
        "label": label,
        "path": str(root),
        "status": "observed" if root.exists() else "missing",
        "file_count": len(readable),
        "total_bytes": sum(item["bytes"] for item in readable),
        "surface_sha256": surface_hash(readable) if readable else None,
        "sample": readable[:sample_limit],
    }


def parse_manifest(path: Path) -> dict[str, Any]:
    if not path.exists():
        return {"status": "missing", "path": str(path)}
    entries = []
    for raw in path.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if not line:
            continue
        if " *" in line:
            digest, rel = line.split(" *", 1)
        else:
            parts = line.split(maxsplit=1)
            if len(parts) != 2:
                continue
            digest, rel = parts
        entries.append({"path": rel.replace("\\", "/"), "sha256": digest.lower()})
    return {
        "status": "observed",
        "path": str(path),
        "entry_count": len(entries),
        "sha256": sha256_file(path),
        "sample": entries[:25],
    }


def json_receipt(path: Path, label: str) -> dict[str, Any]:
    if not path.exists():
        return {"label": label, "path": str(path), "status": "missing"}
    try:
        payload = json.loads(path.read_text(encoding="utf-8"))
        status = payload.get("status", "observed") if isinstance(payload, dict) else "observed"
    except json.JSONDecodeError as exc:
        payload = {"parse_error": str(exc)}
        status = "invalid_json"
    return {
        "label": label,
        "path": str(path),
        "status": status,
        "bytes": path.stat().st_size,
        "sha256": sha256_file(path),
        "summary": payload if isinstance(payload, dict) else {"type": type(payload).__name__},
    }


def package_file_set(root: Path) -> set[str]:
    return {path.relative_to(root).as_posix() for path in iter_files(root)}


def manifest_file_set(path: Path) -> set[str]:
    if not path.exists():
        return set()
    paths: set[str] = set()
    for raw in path.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if not line:
            continue
        if " *" in line:
            _, rel = line.split(" *", 1)
        else:
            parts = line.split(maxsplit=1)
            if len(parts) != 2:
                continue
            _, rel = parts
        paths.add(rel.replace("\\", "/"))
    return paths


def github_mirror_file_set(path: Path) -> set[str]:
    if not path.exists():
        return set()
    try:
        payload = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return set()
    entries = payload.get("local_package_mirror", {}).get("entries", [])
    return {item["local_path"] for item in entries if isinstance(item, dict) and "local_path" in item}


def zip_file_set(path: Path | None) -> set[str]:
    if not path or not path.exists():
        return set()
    with zipfile.ZipFile(path) as zf:
        return {name for name in zf.namelist() if not name.endswith("/")}


def diff_sets(left: set[str], right: set[str], left_label: str, right_label: str) -> dict[str, Any]:
    left_only = sorted(left - right)
    right_only = sorted(right - left)
    return {
        "left": left_label,
        "right": right_label,
        "left_count": len(left),
        "right_count": len(right),
        "common_count": len(left & right),
        "left_only_count": len(left_only),
        "right_only_count": len(right_only),
        "left_only_sample": left_only[:25],
        "right_only_sample": right_only[:25],
        "status": "MATCH" if not left_only and not right_only else "DRIFT",
    }


def markdown_receipt(path: Path, label: str) -> dict[str, Any]:
    if not path.exists():
        return {"label": label, "path": str(path), "status": "missing"}
    text = path.read_text(encoding="utf-8", errors="replace")
    status = "observed"
    for line in text.splitlines()[:20]:
        if line.lower().startswith("status:"):
            status = line.split(":", 1)[1].strip()
            break
    return {
        "label": label,
        "path": str(path),
        "status": status,
        "bytes": path.stat().st_size,
        "sha256": sha256_file(path),
        "first_lines": text.splitlines()[:12],
    }


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--package-root", default=str(PACKAGE_ROOT))
    parser.add_argument("--workspace-root", default=str(DEFAULT_WORKSPACE_ROOT))
    parser.add_argument("--output", default="SURFACE_INVENTORY.json")
    parser.add_argument("--zip-path", default=None, help="optional clean zip to compare against manifest")
    args = parser.parse_args(argv)

    package_root = Path(args.package_root).resolve()
    workspace_root = Path(args.workspace_root).resolve()
    output_path = Path(args.output)
    if not output_path.is_absolute():
        output_path = package_root / output_path
    zip_path = Path(args.zip_path).resolve() if args.zip_path else None

    package_files = package_file_set(package_root)
    manifest_files = manifest_file_set(package_root / "MANIFEST.sha256")
    github_mirror_files = github_mirror_file_set(package_root / "GITHUB_TREE_INDEX.json")
    zip_files = zip_file_set(zip_path)

    payload: dict[str, Any] = {
        "generated_at": utc_now(),
        "purpose": "Separate count/hash/status by observed surface.",
        "non_claims": [
            "Builder UI file count is not a runtime /workspace mount proof.",
            "Runtime /workspace count does not disprove Builder upload.",
            "GitHub file probe is not a full recursive tree unless marked verified.",
            "Helper script source is not hook execution unless a smoke receipt exists.",
        ],
        "surfaces": {
            "package_root": file_surface(package_root, "package_root", base=package_root),
            "manifest": parse_manifest(package_root / "MANIFEST.sha256"),
            "package_agent_files": file_surface(package_root / "agent_files", "package_agent_files", base=package_root),
            "package_runtime_tools": file_surface(package_root / "agent_runtime_tools", "package_runtime_tools", base=package_root),
            "workspace_root": file_surface(workspace_root, "workspace_root", base=workspace_root),
            "task_uploads": file_surface(workspace_root / "user_files", "task_uploads", base=workspace_root),
            "runtime_memory": file_surface(workspace_root / "memory", "runtime_memory", base=workspace_root),
            "workspace_runtime_tools": file_surface(workspace_root / "agent_runtime_tools", "workspace_runtime_tools", base=workspace_root),
            "github_tree_index": json_receipt(package_root / "GITHUB_TREE_INDEX.json", "github_tree_index"),
            "builder_upload_evidence": markdown_receipt(package_root / "BUILDER_UPLOAD_EVIDENCE.md", "builder_upload_evidence"),
            "hook_smoke_receipt": json_receipt(package_root / "HOOK_SMOKE_RECEIPT.json", "hook_smoke_receipt"),
            "supabase_advisor_receipt": json_receipt(package_root / "SUPABASE_ADVISOR_RECEIPT.json", "supabase_advisor_receipt"),
        },
        "comparisons": {
            "manifest_vs_package_root": diff_sets(manifest_files | {"MANIFEST.sha256"}, package_files, "manifest_plus_manifest_file", "package_root_static"),
            "github_mirror_vs_package_root": diff_sets(github_mirror_files, package_files - {"GITHUB_TREE_INDEX.json", "MANIFEST.sha256"}, "github_local_package_mirror", "package_root_excluding_github_index_and_manifest"),
            "zip_vs_manifest": diff_sets(zip_files, manifest_files | {"MANIFEST.sha256", "SURFACE_INVENTORY.json"}, "zip_entries", "manifest_plus_dynamic_receipts") if zip_path else {"status": "NOT_RUN", "reason": "pass --zip-path to compare a clean zip"},
        },
    }

    output_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"status": "PASS", "output": str(output_path), "sha256": sha256_file(output_path)}, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
