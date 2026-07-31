#!/usr/bin/env python3
"""Deterministically (re)build a SoT30 release package.

Regenerates, in dependency order:
  1. file 29's embedded hash table (from final content of files 00-28),
  2. support/MANIFEST.json (disjoint+total changed/unchanged),
  3. support/SHA256SUMS (30 knowledge + MANIFEST.json + PROJECT_INSTRUCTIONS),
  4. dist/<zip> from a clean staging directory built from an explicit allowlist,
and fills the zip-fact tokens in QC_REPORT.md / PACKAGE_RECEIPT.md.

Provenance: by default bytes are read from the release-tree working files, so
`generated_from` is labelled `release_tree_working_bytes`. Pass `--from-git <SHA>`
to instead extract each knowledge file from a specific commit via `git show`, in
which case the label becomes `canonical_git_blobs` (honest either way).

Reproducibility: zip entry timestamps are pinned, so re-running in the SAME
toolchain yields byte-identical output (same-environment reproducibility). This
does NOT guarantee cross-toolchain reproducibility (a different zlib/Python may
deflate differently); verify by hash, not by assumption.

Usage:
  python3 tools/build_sot30_release.py <release_dir> --version v5.5.5 \
      --baseline <baseline_manifest.json> --zip-out dist/SoT30_v5.5.5.zip \
      [--date 2026-08-01] [--adr ADR-YYYYMMDD-NN] [--package-name "..."] \
      [--from-git <commit_sha>]

IMPORTANT: this writes into <release_dir>. Never run it against an immutable,
already-shipped release directory — build a fresh release dir for a new version.
"""
import argparse
import atexit
import hashlib
import json
import os
import re
import shutil
import subprocess
import tempfile
import zipfile

SUPPORT_INSTRUCTIONS = "PROJECT_INSTRUCTIONS_SOT30.md"
KNOWLEDGE_RE = re.compile(r"^\d\d_.*\.md$")
EXPECTED_INDICES = [f"{i:02d}" for i in range(30)]


class BuildError(RuntimeError):
    """Explicit build failure (never an `assert`, which `python -O` strips)."""


def sha256_bytes(b: bytes) -> str:
    return hashlib.sha256(b).hexdigest()


def read_bytes(p: str) -> bytes:
    with open(p, "rb") as f:
        return f.read()


def write_text_lf(p: str, text: str) -> None:
    """Write UTF-8 text with LF on every host (including Windows)."""
    with open(p, "w", encoding="utf-8", newline="\n") as f:
        f.write(text)


def require(cond: bool, msg: str) -> None:
    if not cond:
        raise BuildError(msg)


def git_show(ref: str, path: str) -> bytes:
    # Git object paths are POSIX-style even when the host is Windows.
    git_path = path.replace("\\", "/")
    try:
        return subprocess.check_output(["git", "show", f"{ref}:{git_path}"])
    except subprocess.CalledProcessError as e:  # pragma: no cover - passthrough
        raise BuildError(f"git show failed for {git_path}@{ref}: {e}") from e

def materialize_git_source(kdir: str, sdir: str, knames: list[str],
                           from_git: str) -> str:
    """Extract every SOURCE file (30 knowledge + PROJECT_INSTRUCTIONS) from a commit
    into a temp working tree, so the ENTIRE package (file-29 table, all-30 hashes,
    manifest, zip, instructions) is genuinely built from git blobs. Returns the temp
    release-dir root. (SHA256SUMS/MANIFEST are generated, not sourced.)"""
    work = tempfile.mkdtemp(prefix="sot30gitsrc_")
    try:
        os.makedirs(os.path.join(work, "knowledge"))
        os.makedirs(os.path.join(work, "support"))
        for n in knames:
            with open(os.path.join(work, "knowledge", n), "wb") as f:
                f.write(git_show(from_git, os.path.join(kdir, n)))
        with open(os.path.join(work, "support", SUPPORT_INSTRUCTIONS), "wb") as f:
            f.write(git_show(from_git, os.path.join(sdir, SUPPORT_INSTRUCTIONS)))
        return work
    except Exception:
        shutil.rmtree(work, ignore_errors=True)
        raise


def normalize_root(version: str) -> str:
    v = version if version.startswith("v") else f"v{version}"
    return f"SoT30_{v}"


def main() -> int:
    ap = argparse.ArgumentParser(description="Build a SoT30 release package.")
    ap.add_argument("release_dir")
    ap.add_argument("--version", required=True, help="e.g. v5.5.5")
    ap.add_argument("--baseline", required=True, help="baseline MANIFEST.json for changed/unchanged")
    ap.add_argument("--zip-out", required=True)
    ap.add_argument("--date", default="2026-07-20")
    ap.add_argument("--adr", default="ADR-20260720-02")
    ap.add_argument("--baseline-version", default="v5.5.3")
    ap.add_argument("--package-name", default=None)
    ap.add_argument("--acceptance-range", default="T01-T93")
    ap.add_argument("--supplemental-acceptance-range", default=None,
                    help="e.g. T98-T103 for an accepted behavior amendment on top of --acceptance-range")
    ap.add_argument("--behavior-adr", action="append", default=[],
                    help="ADR governing an accepted behavior amendment carried into this build "
                         "(repeatable); recorded separately from --adr, which remains the package ADR")
    ap.add_argument("--from-git", default=None, help="commit SHA to extract knowledge blobs from")
    ap.add_argument("--git-source-dir", default=None,
                    help="repo-relative release dir whose paths --from-git resolves against "
                         "(default: release_dir). Lets you build into a fresh output dir from a git source.")
    args = ap.parse_args()

    release_dir, version = args.release_dir, args.version
    rel_kdir = os.path.join(release_dir, "knowledge")
    git_source_dir = args.git_source_dir or release_dir

    # --- validate knowledge dir is exactly the 30 files {00..29} (allowlist) ---
    kfiles = sorted(n for n in os.listdir(rel_kdir) if n.endswith(".md"))
    knames = [n for n in kfiles if KNOWLEDGE_RE.match(n)]
    require(len(kfiles) == 30 and len(knames) == 30,
            f"knowledge dir must be exactly 30 .md files, got {len(kfiles)} (.md) / {len(knames)} (numbered)")
    indices = sorted(n[:2] for n in knames)
    require(indices == EXPECTED_INDICES, f"knowledge indices must be 00..29 unique, got {indices}")

    from_git = args.from_git
    generated_from = "canonical_git_blobs" if from_git else "release_tree_working_bytes"

    # With --from-git, materialize EVERY source file (30 knowledge + instructions)
    # from the commit into a temp tree and build the whole package from it, so
    # `canonical_git_blobs` is literally true. Generated artifacts (file 29 table,
    # MANIFEST, SHA256SUMS) are copied back to release_dir afterwards.
    git_work = materialize_git_source(os.path.join(git_source_dir, "knowledge"),
                                      os.path.join(git_source_dir, "support"),
                                      knames, from_git) if from_git else None
    if git_work:
        # Fallback cleanup for any exception after materialization. The explicit
        # successful-path cleanup below remains; rmtree(ignore_errors=True) is idempotent.
        atexit.register(shutil.rmtree, git_work, ignore_errors=True)
    build_dir = git_work or release_dir
    kdir = os.path.join(build_dir, "knowledge")
    sdir = os.path.join(build_dir, "support")

    # --- 1. regenerate file 29 embedded table from files 00-28 ---
    f29_name = "29_INDEX_UPLOAD_MANIFEST.md"
    f29_path = os.path.join(kdir, f29_name)
    non_self = [n for n in knames if not n.startswith("29_")]
    rows = []
    for n in non_self:
        b = read_bytes(os.path.join(kdir, n))  # build_dir = git tree (if --from-git) else release
        rows.append(f"| `{n}` | {len(b)} | `{sha256_bytes(b)}` |")
    table_block = "\n".join(rows)

    f29 = open(f29_path, encoding="utf-8").read()
    pat = re.compile(r"(?ms)^\| `00_.*?\.md` \|.*?(?=\nFile 29 hash is stored)")
    require(pat.search(f29) is not None, "file 29 table anchor not found")
    f29_new = pat.sub(table_block, f29)
    if f29_new != f29:
        write_text_lf(f29_path, f29_new)

    # --- 2. compute all 30 hashes (file 29 now final) ---
    entries = []
    for n in knames:
        b = read_bytes(os.path.join(kdir, n))  # final on-disk bytes (29 just rewritten)
        entries.append({"path": f"knowledge/{n}", "bytes": len(b), "sha256": sha256_bytes(b)})
    by_name = {os.path.basename(e["path"]): e for e in entries}
    corpus_bytes = sum(e["bytes"] for e in entries)

    # --- 3. changed / unchanged vs baseline (disjoint + total) ---
    base = json.load(open(args.baseline, encoding="utf-8"))
    base_hash = {os.path.basename(f["path"]): f["sha256"] for f in base["files"]}
    changed, unchanged = [], []
    for n in knames:
        (unchanged if by_name[n]["sha256"] == base_hash.get(n) else changed).append(n)
    require(set(changed).isdisjoint(unchanged), "changed/unchanged not disjoint")
    require(set(changed) | set(unchanged) == set(knames), "changed ∪ unchanged != knowledge set")

    # --- 4. write MANIFEST.json ---
    instr_bytes = read_bytes(os.path.join(sdir, SUPPORT_INSTRUCTIONS))
    manifest = {
        "package": args.package_name or f"SoT30 {version} release",
        "package_version": version,
        "baseline_release": args.baseline_version,
        "date": args.date,
        "adr": args.adr,
        "generated_from": generated_from,
        "generated_from_ref": from_git,
        # repo-relative release dir the --from-git blobs were resolved against;
        # lets a verifier byte-bind the 31 source files to <ref>:<path>. Null in
        # working-bytes mode where no git binding exists to claim.
        "source_tree_path": (git_source_dir.replace(os.sep, "/").rstrip("/")
                             if from_git else None),
        "line_ending_policy": "LF",
        "reproducibility": "same-toolchain byte-reproducible (pinned zip mtime); cross-toolchain not guaranteed",
        "knowledge_file_count": 30,
        "corpus_bytes": corpus_bytes,
        "project_instructions_chars": len(instr_bytes.decode("utf-8")),
        "project_instructions_bytes": len(instr_bytes),
        "acceptance_range": args.acceptance_range,
        **({"supplemental_acceptance_range": args.supplemental_acceptance_range}
           if args.supplemental_acceptance_range else {}),
        **({"behavior_adrs": args.behavior_adr} if args.behavior_adr else {}),
        "changed_files": changed,
        "unchanged_files": unchanged,
        "files": entries,
        "live_project_verified": False,
    }
    manifest_path = os.path.join(sdir, "MANIFEST.json")
    write_text_lf(manifest_path, json.dumps(manifest, indent=2, ensure_ascii=False) + "\n")

    # --- 5. write SHA256SUMS (two-space separator) ---
    manifest_sha = sha256_bytes(read_bytes(manifest_path))  # capture before any temp cleanup
    lines = [f"{e['sha256']}  {e['path']}" for e in entries]
    lines.append(f"{manifest_sha}  support/MANIFEST.json")
    lines.append(f"{sha256_bytes(instr_bytes)}  support/{SUPPORT_INSTRUCTIONS}")
    write_text_lf(os.path.join(sdir, "SHA256SUMS"), "\n".join(lines) + "\n")

    # --- 6. build zip from a clean staging dir via EXPLICIT allowlist ---
    root = normalize_root(version)
    allowlist = (
        [("knowledge", n) for n in knames]
        + [("support", s) for s in (SUPPORT_INSTRUCTIONS, "MANIFEST.json", "SHA256SUMS")]
    )
    staging = tempfile.mkdtemp(prefix="sot30build_")
    try:
        for sub, name in allowlist:
            src = os.path.join(build_dir, sub, name)
            require(os.path.isfile(src), f"allowlisted file missing: {sub}/{name}")
            dst = os.path.join(staging, root, sub, name)
            os.makedirs(os.path.dirname(dst), exist_ok=True)
            shutil.copyfile(src, dst)
        os.makedirs(os.path.dirname(args.zip_out) or ".", exist_ok=True)
        if os.path.exists(args.zip_out):
            os.remove(args.zip_out)
        fixed_dt = (2026, 7, 20, 0, 0, 0)  # pinned -> same-toolchain reproducible
        with zipfile.ZipFile(args.zip_out, "w", zipfile.ZIP_DEFLATED) as z:
            for sub, name in allowlist:  # deterministic order = allowlist order
                arc = f"{root}/{sub}/{name}"
                zi = zipfile.ZipInfo(arc, date_time=fixed_dt)
                zi.compress_type = zipfile.ZIP_DEFLATED
                zi.external_attr = 0o644 << 16
                z.writestr(zi, read_bytes(os.path.join(staging, root, sub, name)))
    finally:
        shutil.rmtree(staging, ignore_errors=True)

    # --from-git: reflect the git-built artifacts back into the release dir so the
    # on-disk release tree matches the git-derived package (parity with the ZIP).
    if git_work:
        for rel in (os.path.join("knowledge", f29_name),
                    os.path.join("support", "MANIFEST.json"),
                    os.path.join("support", "SHA256SUMS"),
                    os.path.join("support", SUPPORT_INSTRUCTIONS)):
            shutil.copyfile(os.path.join(build_dir, rel), os.path.join(release_dir, rel))
        for n in knames:
            shutil.copyfile(os.path.join(build_dir, "knowledge", n),
                            os.path.join(release_dir, "knowledge", n))
        shutil.rmtree(git_work, ignore_errors=True)

    zip_b = read_bytes(args.zip_out)
    zip_sha = sha256_bytes(zip_b)

    # --- 7. fill QC_REPORT / PACKAGE_RECEIPT zip-fact tokens (idempotent) ---
    f29e = by_name[f29_name]
    corpus_disp = f"{corpus_bytes:,}"
    zip_base = re.escape(os.path.basename(args.zip_out))
    H = r"(?:[0-9a-f]{64}|__[A-Z0-9_]+__)"
    N = r"(?:[\d,]+|__[A-Z0-9_]+__)"
    subs = [
        (rf"(- corpus bytes: ){N}", rf"\g<1>{corpus_disp}"),
        (rf"(- ZIP: `dist/{zip_base}`, ){N}( bytes, sha256 `){H}(`)",
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
            for p, rep in subs:
                t = re.sub(p, rep, t)
            write_text_lf(dp, t)

    print(json.dumps({
        "zip": args.zip_out, "zip_bytes": len(zip_b), "zip_sha256": zip_sha,
        "root": root, "generated_from": generated_from,
        "corpus_bytes": corpus_bytes, "changed": changed, "unchanged_count": len(unchanged),
        "file29_sha256": f29e["sha256"], "manifest_sha256": manifest_sha,
    }, indent=2, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
