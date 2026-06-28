#!/usr/bin/env python3
import argparse, hashlib, json
from datetime import datetime, timezone
from pathlib import Path

def sha256_file(path: Path) -> str:
    h = hashlib.sha256()
    with path.open('rb') as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b''):
            h.update(chunk)
    return h.hexdigest()

def build(root: Path):
    items = []
    for p in sorted(root.rglob('*')):
        if p.is_file():
            items.append({"path": str(p.relative_to(root)), "bytes": p.stat().st_size, "sha256": sha256_file(p)})
    return {
        "release": root.name,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "root": str(root),
        "items": items,
        "counts": {"files": len(items), "bytes": sum(i['bytes'] for i in items)},
        "checks": {"content_ok": bool(items) and all(i['bytes'] > 0 for i in items)}
    }

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('path')
    args = parser.parse_args()
    print(json.dumps(build(Path(args.path)), ensure_ascii=False, indent=2))
