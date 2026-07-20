#!/usr/bin/env python3
"""Deterministically (re)build a SoT30 release package.

Regenerates, in dependency order:
  1. file 29's embedded hash table (from final content of files 00-28),
  2. support/MANIFEST.json (new v5.5.4 schema: disjoint+total changed/unchanged),
  3. support/SHA256SUMS (30 knowledge + MANIFEST.json + PROJECT_INSTRUCTIONS),
  4. dist/<zip> from a clean staging directory (forward-slash entries),
and fills placeholder tokens (__ZIP_SHA__ etc.) in QC_REPORT.md / PACKAGE_RECEIPT.md.

Hashes are computed on raw file bytes; the corpus is LF-only (verified separately),
so raw == LF-normalized here. Usage:

  python3 tools/build_sot30_release.py <release_dir> <version> <baseline_manifest> <zip_out>
"""
import hashlib
import json
import os
import re
import sys
import tempfile
import shutil
import zipfile


def sha256_bytes(b: bytes) -> str:
    return hashlib.sha256(b).hexdigest()


def read_bytes(p: str) -> bytes:
    with open(p, "rb") as f:
        return f.read()


def main() -> int:
    release_dir, version, baseline_manifest, zip_out = sys.argv[1:5]
    kdir = os.path.join(release_dir, "knowledge")
    sdir = os.path.join(release_dir, "support")

    knames = sorted(n for n in os.listdir(kdir) if re.match(r"\d\d_.*\.md$", n))
    assert len(knames) == 30, f"expected 30 knowledge files, got {len(knames)}"

    # --- 1. regenerate file 29 embedded table from files 00-28 ---
    f29_path = os.path.join(kdir, "29_INDEX_UPLOAD_MANIFEST.md")
    non_self = [n for n in knames if not n.startswith("29_")]
    rows = []
    for n in non_self:
        b = read_bytes(os.path.join(kdir, n))
        rows.append(f"| `{n}` | {len(b)} | `{sha256_bytes(b)}` |")
    table_block = "\n".join(rows)

    f29 = open(f29_path, encoding="utf-8").read()
    # Replace the block of table rows (lines beginning with "| `NN_") in-place,
    # preserving the header/separator above and the prose below.
    pat = re.compile(r"(?ms)^\| `00_.*?\.md` \|.*?(?=\nFile 29 hash is stored)")
    assert pat.search(f29), "file 29 table anchor not found"
    f29_new = pat.sub(table_block, f29)
    if f29_new != f29:
        open(f29_path, "w", encoding="utf-8").write(f29_new)

    # --- 2. compute all 30 hashes (file 29 now final) ---
    entries = []
    for n in knames:
        b = read_bytes(os.path.join(kdir, n))
        entries.append({"path": f"knowledge/{n}", "bytes": len(b), "sha256": sha256_bytes(b)})
    by_name = {os.path.basename(e["path"]): e for e in entries}
    corpus_bytes = sum(e["bytes"] for e in entries)

    # --- 3. changed / unchanged vs baseline (disjoint + total) ---
    base = json.load(open(baseline_manifest, encoding="utf-8"))
    base_hash = {os.path.basename(f["path"]): f["sha256"] for f in base["files"]}
    changed, unchanged = [], []
    for n in knames:
        if by_name[n]["sha256"] == base_hash.get(n):
            unchanged.append(n)
        else:
            changed.append(n)
    assert set(changed).isdisjoint(unchanged), "changed/unchanged not disjoint"
    assert set(changed) | set(unchanged) == set(knames), "changed union unchanged != 30"

    # --- 4. write MANIFEST.json (new schema) ---
    instr_name = "PROJECT_INSTRUCTIONS_SOT30.md"
    instr_bytes = read_bytes(os.path.join(sdir, instr_name))
    manifest = {
        "package": "SoT30 v5.5.4 Semantic & Runtime-Status Consistency",
        "package_version": version,
        "baseline_release": "v5.5.3",
        "date": "2026-07-20",
        "adr": "ADR-20260720-02",
        "generated_from": "canonical_git_blobs",
        "line_ending_policy": "LF",
        "knowledge_file_count": 30,
        "corpus_bytes": corpus_bytes,
        "project_instructions_chars": len(instr_bytes.decode("utf-8")),
        "project_instructions_bytes": len(instr_bytes),
        "acceptance_range": "T01-T93",
        "changed_files": changed,
        "unchanged_files": unchanged,
        "files": entries,
        "live_project_verified": False,
    }
    manifest_str = json.dumps(manifest, indent=2, ensure_ascii=False) + "\n"
    manifest_path = os.path.join(sdir, "MANIFEST.json")
    open(manifest_path, "w", encoding="utf-8").write(manifest_str)

    # --- 5. write SHA256SUMS (two-space separator) ---
    lines = [f"{e['sha256']}  {e['path']}" for e in entries]
    lines.append(f"{sha256_bytes(read_bytes(manifest_path))}  support/MANIFEST.json")
    lines.append(f"{sha256_bytes(instr_bytes)}  support/{instr_name}")
    sums_path = os.path.join(sdir, "SHA256SUMS")
    open(sums_path, "w", encoding="utf-8").write("\n".join(lines) + "\n")

    # --- 6. build zip from clean staging dir ---
    root = f"SoT30_{version.lstrip('v')}" if not version.startswith("SoT30") else version
    root = f"SoT30_{version[1:]}" if version.startswith("v") else f"SoT30_{version}"
    staging = tempfile.mkdtemp(prefix="sot30build_")
    try:
        pkg = os.path.join(staging, root)
        shutil.copytree(kdir, os.path.join(pkg, "knowledge"))
        shutil.copytree(sdir, os.path.join(pkg, "support"))
        os.makedirs(os.path.dirname(zip_out), exist_ok=True)
        if os.path.exists(zip_out):
            os.remove(zip_out)
        fixed_dt = (2026, 7, 20, 0, 0, 0)  # constant -> reproducible zip bytes
        with zipfile.ZipFile(zip_out, "w", zipfile.ZIP_DEFLATED) as z:
            for dirpath, dirs, files in os.walk(pkg):
                dirs.sort()
                for fn in sorted(files):
                    full = os.path.join(dirpath, fn)
                    arc = os.path.relpath(full, staging).replace(os.sep, "/")
                    zi = zipfile.ZipInfo(arc, date_time=fixed_dt)
                    zi.compress_type = zipfile.ZIP_DEFLATED
                    zi.external_attr = 0o644 << 16
                    z.writestr(zi, read_bytes(full))
    finally:
        shutil.rmtree(staging, ignore_errors=True)

    zip_b = read_bytes(zip_out)
    zip_sha = sha256_bytes(zip_b)

    # --- 7. fill QC_REPORT / PACKAGE_RECEIPT zip facts (idempotent: matches
    #        the placeholder token OR a previously-filled value at each label) ---
    f29e = by_name["29_INDEX_UPLOAD_MANIFEST.md"]
    manifest_sha = sha256_bytes(read_bytes(manifest_path))
    corpus_disp = f"{corpus_bytes:,}"
    H = r"(?:[0-9a-f]{64}|__[A-Z0-9_]+__)"          # hex or placeholder
    N = r"(?:[\d,]+|__[A-Z0-9_]+__)"                 # number or placeholder
    subs = [
        (rf"(- corpus bytes: ){N}", rf"\g<1>{corpus_disp}"),
        (rf"(- ZIP: `dist/SoT30_v5\.5\.4\.zip`, ){N}( bytes, sha256 `){H}(`)",
         rf"\g<1>{len(zip_b)}\g<2>{zip_sha}\g<3>"),
        (rf"(- file 29: ){N}( bytes, sha256 `){H}(`)",
         rf"\g<1>{f29e['bytes']}\g<2>{f29e['sha256']}\g<3>"),
        (rf"(- support/MANIFEST\.json sha256 `){H}(`)", rf"\g<1>{manifest_sha}\g<2>"),
        (rf"(\| ZIP bytes \| ){N}( \|)", rf"\g<1>{len(zip_b)}\g<2>"),
        (rf"(\| ZIP sha256 \| `){H}(` \|)", rf"\g<1>{zip_sha}\g<2>"),
        (rf"(\| Corpus bytes \| ){N}( \|)", rf"\g<1>{corpus_disp}\g<2>"),
        (rf"(\| file 29 sha256 \| `){H}(` \|)", rf"\g<1>{f29e['sha256']}\g<2>"),
    ]
    for doc in ("QC_REPORT.md", "PACKAGE_RECEIPT.md"):
        dp = os.path.join(release_dir, doc)
        if os.path.exists(dp):
            t = open(dp, encoding="utf-8").read()
            for pat, rep in subs:
                t = re.sub(pat, rep, t)
            open(dp, "w", encoding="utf-8").write(t)

    print(json.dumps({
        "zip": zip_out, "zip_bytes": len(zip_b), "zip_sha256": zip_sha,
        "corpus_bytes": corpus_bytes, "changed": changed, "unchanged_count": len(unchanged),
        "file29_sha256": f29e["sha256"], "manifest_sha256": manifest_sha,
    }, indent=2, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    sys.exit(main())
