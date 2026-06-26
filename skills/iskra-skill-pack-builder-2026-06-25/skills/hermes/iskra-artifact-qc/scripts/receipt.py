#!/usr/bin/env python3
import argparse, hashlib, json, re, zipfile
from pathlib import Path

PLACEHOLDER_RE = re.compile(rb'\b(TODO|TBD|PLACEHOLDER|lorem ipsum|\.\.\.)\b', re.I)

def sha256_file(path: Path) -> str:
    h = hashlib.sha256()
    with path.open('rb') as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b''):
            h.update(chunk)
    return h.hexdigest()

def inspect(path: Path):
    result = {"path": str(path), "exists": path.exists(), "bytes": 0, "sha256": None, "kind": None, "items": None, "content_ok": False, "errors": []}
    if not path.exists():
        result["errors"].append("missing")
        return result
    if path.is_dir():
        files = [p for p in path.rglob('*') if p.is_file()]
        result["kind"] = "directory"
        result["items"] = len(files)
        result["bytes"] = sum(p.stat().st_size for p in files)
        result["content_ok"] = bool(files) and result["bytes"] > 0
        return result
    result["bytes"] = path.stat().st_size
    result["sha256"] = sha256_file(path)
    result["kind"] = "file"
    if result["bytes"] <= 0:
        result["errors"].append("empty")
    try:
        sample = path.read_bytes()[:2_000_000]
        if PLACEHOLDER_RE.search(sample):
            result["errors"].append("placeholder_pattern")
    except Exception as exc:
        result["errors"].append(f"read_error:{exc}")
    if zipfile.is_zipfile(path):
        result["kind"] = "zip"
        with zipfile.ZipFile(path) as zf:
            members = [m for m in zf.infolist() if not m.is_dir()]
            result["items"] = len(members)
            if not members:
                result["errors"].append("zip_has_no_files")
    result["content_ok"] = result["bytes"] > 0 and not result["errors"]
    return result

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('path')
    args = parser.parse_args()
    print(json.dumps(inspect(Path(args.path)), ensure_ascii=False, indent=2))
