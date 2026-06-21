
#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
from pathlib import Path


def main() -> int:
    parser = argparse.ArgumentParser(description="Basic Iskra ledger/receipt smoke check.")
    parser.add_argument("repo_root", nargs="?", default=".")
    args = parser.parse_args()
    qc = Path(args.repo_root) / "UNIFIED_QC_RECEIPT.json"
    if not qc.exists():
        print("UNIFIED_QC_RECEIPT.json missing")
        return 1
    data = json.loads(qc.read_text(encoding="utf-8"))
    if data.get("verdict") not in {"PASS", "PARTIAL"}:
        print("unexpected verdict")
        return 1
    if data.get("manifest", {}).get("missing") not in ([], None):
        print("manifest missing entries recorded")
        return 1
    print("ledger smoke PASS")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
