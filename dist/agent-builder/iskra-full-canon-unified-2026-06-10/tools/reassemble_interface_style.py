#!/usr/bin/env python3
from __future__ import annotations

import argparse
import hashlib
from pathlib import Path

EXPECTED_SHA256 = "6fc341ac84df29e64b4dd51c0a05608d83b4e798fc4db6b1b5a09353412de345"
EXPECTED_BYTES = 3400429


def main() -> int:
    parser = argparse.ArgumentParser(description="Reassemble split 08_INTERFACE_STYLE.md parts.")
    parser.add_argument("--repo-root", default=".", help="Package root containing agent_files/ and tools/.")
    parser.add_argument("--output", default="/tmp/08_INTERFACE_STYLE.reassembled.md")
    parser.add_argument("--check", action="store_true", help="Verify sha256 and byte count after reassembly.")
    args = parser.parse_args()

    root = Path(args.repo_root).resolve()
    parts_dir = root / "agent_files" / "canon_source_files" / "08_INTERFACE_STYLE.parts"
    parts = sorted(parts_dir.glob("part_*.md"))
    if not parts:
        raise SystemExit(f"No part files found in {parts_dir}")

    data = b"".join(part.read_bytes() for part in parts)
    output = Path(args.output)
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_bytes(data)

    digest = hashlib.sha256(data).hexdigest()
    print(f"reassembled={output}")
    print(f"bytes={len(data)}")
    print(f"sha256={digest}")
    print(f"parts={len(parts)}")

    if args.check and (digest != EXPECTED_SHA256 or len(data) != EXPECTED_BYTES):
        raise SystemExit("REASSEMBLY_FAIL")
    if args.check:
        print("REASSEMBLY_PASS")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
