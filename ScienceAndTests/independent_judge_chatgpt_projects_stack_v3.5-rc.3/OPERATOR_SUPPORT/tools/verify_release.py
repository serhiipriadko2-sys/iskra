#!/usr/bin/env python3
"""Round-trip release verification for Independent Judge rc.3."""
import argparse
import hashlib
import json
import shutil
import stat
import tempfile
import zipfile
from pathlib import Path, PurePosixPath

EXCLUDED_FROM_MANIFEST = {
    "OPERATOR_SUPPORT/MANIFEST.json",
    "OPERATOR_SUPPORT/BUILD_RECEIPT_PREZIP.json",
}


def sha256(path):
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def tree_files(root):
    return {
        path.relative_to(root).as_posix(): path
        for path in root.rglob("*")
        if path.is_file()
    }


def safe_member(info):
    name = PurePosixPath(info.filename)
    if name.is_absolute() or ".." in name.parts or "\\" in info.filename:
        return False
    mode = info.external_attr >> 16
    return not stat.S_ISLNK(mode)


def verify(root, archive, sidecar):
    errors = []
    passed = []
    root = Path(root).resolve()
    archive = Path(archive).resolve()
    sidecar = Path(sidecar).resolve()

    manifest_path = root / "OPERATOR_SUPPORT/MANIFEST.json"
    internal_receipt_path = root / "OPERATOR_SUPPORT/BUILD_RECEIPT_PREZIP.json"
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    internal_receipt = json.loads(internal_receipt_path.read_text(encoding="utf-8"))
    receipt = json.loads(sidecar.read_text(encoding="utf-8"))

    actual = tree_files(root)
    expected_tree = set(actual) - EXCLUDED_FROM_MANIFEST
    entries = manifest.get("entries", [])
    manifest_paths = {entry["path"] for entry in entries}
    if manifest_paths == expected_tree and manifest.get("payload_files") == len(entries):
        passed.append(f"manifest exact two-way coverage={len(entries)}")
    else:
        errors.append({
            "manifest_missing": sorted(expected_tree - manifest_paths),
            "manifest_extra": sorted(manifest_paths - expected_tree),
            "payload_files": manifest.get("payload_files"),
            "entry_count": len(entries),
        })

    mismatches = []
    for entry in entries:
        path = root / entry["path"]
        if not path.is_file() or path.stat().st_size != entry["bytes"] or sha256(path) != entry["sha256"]:
            mismatches.append(entry["path"])
    if mismatches:
        errors.append({"manifest_hash_mismatches": mismatches})
    else:
        passed.append("manifest bytes and hashes match")

    bad_tree = [name for name, path in actual.items() if "__pycache__" in path.parts or path.suffix == ".pyc" or path.is_symlink()]
    if bad_tree:
        errors.append({"tree_cache_or_symlink": bad_tree})
    else:
        passed.append("repository tree has no cache or symlink artifacts")

    forbidden_internal = {"authoritative_zip_sha256", "authoritative_zip_bytes", "final_zip_sha256", "final_zip_bytes"}
    leaked = sorted(forbidden_internal & set(internal_receipt))
    if leaked:
        errors.append({"recursive_zip_attestation_inside_archive": leaked})
    else:
        passed.append("internal receipt contains no final ZIP hash or size")

    if receipt.get("sha256") != sha256(archive) or receipt.get("bytes") != archive.stat().st_size:
        errors.append({"external_sidecar_mismatch": True})
    else:
        passed.append("external sidecar matches ZIP bytes and SHA-256")

    with zipfile.ZipFile(archive) as zf:
        corrupt = zf.testzip()
        infos = zf.infolist()
        unsafe = [info.filename for info in infos if not safe_member(info)]
        cache = [info.filename for info in infos if "__pycache__" in PurePosixPath(info.filename).parts or info.filename.endswith(".pyc")]
        if corrupt:
            errors.append({"corrupt_member": corrupt})
        if unsafe:
            errors.append({"unsafe_members": unsafe})
        if cache:
            errors.append({"archive_cache_artifacts": cache})
        file_infos = [info for info in infos if not info.is_dir()]
        if receipt.get("archive_file_count") != len(file_infos):
            errors.append({"archive_file_count": len(file_infos), "receipt": receipt.get("archive_file_count")})
        else:
            passed.append(f"archive exact file count={len(file_infos)}")

        with tempfile.TemporaryDirectory() as temp_dir:
            zf.extractall(temp_dir)
            top = [path for path in Path(temp_dir).iterdir()]
            if len(top) != 1 or not top[0].is_dir() or top[0].name != root.name:
                errors.append({"archive_root": [path.name for path in top], "expected": root.name})
            else:
                extracted = tree_files(top[0])
                if set(extracted) != set(actual):
                    errors.append({
                        "roundtrip_missing": sorted(set(actual) - set(extracted)),
                        "roundtrip_extra": sorted(set(extracted) - set(actual)),
                    })
                else:
                    changed = [name for name in actual if sha256(actual[name]) != sha256(extracted[name])]
                    if changed:
                        errors.append({"roundtrip_hash_mismatches": changed})
                    else:
                        passed.append(f"round-trip tree identity={len(actual)}/{len(actual)}")

    return {
        "verdict": "PASS" if not errors else "FAIL",
        "errors": errors,
        "pass": passed,
        "root": str(root),
        "archive": str(archive),
        "sidecar": str(sidecar),
    }


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", required=True)
    parser.add_argument("--archive", required=True)
    parser.add_argument("--sidecar", required=True)
    args = parser.parse_args()
    report = verify(args.root, args.archive, args.sidecar)
    print(json.dumps(report, ensure_ascii=False, indent=2))
    raise SystemExit(0 if report["verdict"] == "PASS" else 1)
