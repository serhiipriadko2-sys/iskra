#!/usr/bin/env python3
"""Create or check a clean ChatGPT Agents upload subset.

Default mode is a read-only check against MANIFEST.sha256. Export/zip output is
created only when --out or --zip is provided.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import shutil
import subprocess
import sys
import zipfile
from pathlib import Path
from typing import Iterable, List, Tuple


PACKAGE_ROOT = Path(__file__).resolve().parents[1]
MANIFEST = PACKAGE_ROOT / "MANIFEST.sha256"

FORBIDDEN_DIRS = {
    ".git",
    ".mypy_cache",
    ".pytest_cache",
    ".ruff_cache",
    ".venv",
    "__pycache__",
    "node_modules",
}
FORBIDDEN_NAMES = {".ds_store", "thumbs.db"}
FORBIDDEN_SUFFIXES = {
    ".7z",
    ".bak",
    ".gz",
    ".log",
    ".pyc",
    ".pyo",
    ".rar",
    ".tar",
    ".tmp",
    ".zip",
}
SCREENSHOT_SUFFIXES = {".png", ".jpg", ".jpeg", ".webp"}


def _rel(path: Path) -> str:
    return path.relative_to(PACKAGE_ROOT).as_posix()


def is_forbidden(rel_path: str) -> bool:
    p = Path(rel_path)
    parts = {part.lower() for part in p.parts}
    name = p.name.lower()
    suffix = p.suffix.lower()
    if parts & FORBIDDEN_DIRS:
        return True
    if any(part.endswith(".egg-info") for part in parts):
        return True
    if name in FORBIDDEN_NAMES:
        return True
    if suffix in FORBIDDEN_SUFFIXES:
        return True
    if suffix in SCREENSHOT_SUFFIXES and ("screenshot" in name or "chatgpt_agent_" in name):
        return True
    return False


def manifest_entries() -> List[Tuple[str, str]]:
    if not MANIFEST.exists():
        raise FileNotFoundError(f"manifest not found: {MANIFEST}")

    entries: List[Tuple[str, str]] = []
    for raw in MANIFEST.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if not line or line.startswith("#"):
            continue
        if " *" in line:
            digest, rel_path = line.split(" *", 1)
        else:
            parts = line.split(maxsplit=1)
            if len(parts) != 2:
                continue
            digest, rel_path = parts
        rel_path = rel_path.replace("\\", "/")
        if rel_path and digest:
            entries.append((digest.lower(), rel_path))
    return entries


def files_from_manifest() -> List[str]:
    files = [rel_path for _, rel_path in manifest_entries()]

    if MANIFEST.exists():
        files.append("MANIFEST.sha256")
    if (PACKAGE_ROOT / "SURFACE_INVENTORY.json").is_file():
        files.append("SURFACE_INVENTORY.json")
    return sorted(dict.fromkeys(files))


def files_from_git() -> List[str]:
    repo_root = subprocess.check_output(
        ["git", "rev-parse", "--show-toplevel"],
        cwd=PACKAGE_ROOT,
        text=True,
        stderr=subprocess.DEVNULL,
    ).strip()
    repo_root_path = Path(repo_root)
    package_rel = PACKAGE_ROOT.relative_to(repo_root_path).as_posix()
    out = subprocess.check_output(
        ["git", "ls-files", package_rel],
        cwd=repo_root_path,
        text=True,
    )
    prefix = f"{package_rel}/"
    files = []
    for line in out.splitlines():
        if line.startswith(prefix):
            files.append(line[len(prefix) :])
    return sorted(dict.fromkeys(files))


def select_files(source: str) -> List[str]:
    if source == "manifest":
        return files_from_manifest()
    if source == "tracked":
        return files_from_git()
    raise ValueError(f"unknown source: {source}")


def file_size(rel_path: str) -> int:
    path = PACKAGE_ROOT / rel_path
    return path.stat().st_size if path.exists() and path.is_file() else 0


def hash_file(rel_path: str) -> str:
    h = hashlib.sha256()
    with (PACKAGE_ROOT / rel_path).open("rb") as fh:
        for chunk in iter(lambda: fh.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def verify_manifest_hashes() -> List[str]:
    mismatches: List[str] = []
    for expected, rel_path in manifest_entries():
        path = PACKAGE_ROOT / rel_path
        if not path.is_file():
            continue
        actual = hash_file(rel_path)
        if actual != expected:
            mismatches.append(f"{rel_path}: {actual} != {expected}")
    return mismatches


def copy_files(files: Iterable[str], out_dir: Path, force: bool) -> None:
    if out_dir.exists():
        if not force:
            raise FileExistsError(f"output already exists: {out_dir}")
        shutil.rmtree(out_dir)
    out_dir.mkdir(parents=True)
    for rel_path in files:
        src = PACKAGE_ROOT / rel_path
        dst = out_dir / rel_path
        dst.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(src, dst)


def write_zip(files: Iterable[str], zip_path: Path, force: bool) -> dict:
    if zip_path.exists():
        if not force:
            raise FileExistsError(f"zip already exists: {zip_path}")
        zip_path.unlink()
    zip_path.parent.mkdir(parents=True, exist_ok=True)
    file_list = list(files)
    with zipfile.ZipFile(zip_path, "w", compression=zipfile.ZIP_DEFLATED) as zf:
        for rel_path in file_list:
            zf.write(PACKAGE_ROOT / rel_path, arcname=rel_path)
    h = hashlib.sha256()
    with zip_path.open("rb") as fh:
        for chunk in iter(lambda: fh.read(1024 * 1024), b""):
            h.update(chunk)
    return {
        "path": str(zip_path),
        "sha256": h.hexdigest(),
        "bytes": zip_path.stat().st_size,
        "entries": len(file_list),
    }


def main(argv: list[str]) -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--source", choices=["manifest", "tracked"], default="manifest")
    ap.add_argument("--out", help="optional clean export directory")
    ap.add_argument("--zip", dest="zip_path", help="optional clean zip path")
    ap.add_argument("--force", action="store_true", help="overwrite --out or --zip target")
    args = ap.parse_args(argv)

    files = select_files(args.source)
    forbidden = [f for f in files if is_forbidden(f)]
    missing = [f for f in files if not (PACKAGE_ROOT / f).is_file()]
    allowed = [f for f in files if f not in forbidden and f not in missing]
    hash_mismatches = verify_manifest_hashes() if args.source == "manifest" else []

    result = {
        "package_root": str(PACKAGE_ROOT),
        "source": args.source,
        "manifest_entries": len(manifest_entries()) if args.source == "manifest" else None,
        "file_count": len(allowed),
        "total_bytes": sum(file_size(f) for f in allowed),
        "forbidden_hits": forbidden,
        "missing_files": missing,
        "hash_mismatches": hash_mismatches[:50],
        "hash_mismatch_count": len(hash_mismatches),
        "largest_files": sorted(
            ({"path": f, "bytes": file_size(f), "sha256": hash_file(f)} for f in allowed),
            key=lambda item: item["bytes"],
            reverse=True,
        )[:10],
    }

    if args.out:
        copy_files(allowed, Path(args.out), args.force)
        result["export_dir"] = str(Path(args.out))

    if args.zip_path:
        result["zip"] = write_zip(allowed, Path(args.zip_path), args.force)

    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 1 if forbidden or missing or hash_mismatches else 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
