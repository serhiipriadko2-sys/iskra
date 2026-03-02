#!/usr/bin/env python3
"""tools/build_projects_stack.py

Build ChatGPT Projects "STACK_39" artifact from the main ISKRA repository.

What it does
- Creates the 7 top-level folders used by the 39-file Projects stack:
  CANON_FULL / CORE / SYSTEM / METRICS / GOVERNANCE / MIND / PROJECTS
- Copies canonical sources from the repo (core/, system/, metrics/, canon/stack_10/, etc.)
- Generates merged artifacts:
  - SYSTEM/SIFT_PROTOCOL.md = system/sift_protocol.md + system/sift_extended.md
  - METRICS/METRICS_BUNDLE.md = metrics/indices.md + metrics/evals.md + metrics/qa_playbook.md
- Copies templates for PROJECTS/* and METRICS/RETRIEVAL_EVAL.md from tools/projects_stack_templates/
- Produces a ready-to-zip directory (default: dist/ISKRA_PROJECTS_STACK_39)

Optionally
- Creates a ZIP from the output dir ("--zip"), then enforces a denylist gate.
  Build MUST fail if the ZIP contains forbidden paths (e.g., node_modules/).

Usage
  python tools/build_projects_stack.py
  python tools/build_projects_stack.py --out dist/ISKRA_PROJECTS_STACK_39
  python tools/build_projects_stack.py --zip
  python tools/build_projects_stack.py --zip dist/ISKRA_PROJECTS_STACK_39.zip

NOTE
This stack is a build artifact. Canonical sources live in core/, system/, metrics/, governance/, canon/.
"""

from __future__ import annotations

import argparse
import hashlib
import sys
import zipfile
from pathlib import Path
from typing import Iterable

ROOT = Path(__file__).resolve().parents[1]
TEMPLATES = ROOT / "tools" / "projects_stack_templates"

STACK_DIRS = ["CANON_FULL", "CORE", "SYSTEM", "METRICS", "GOVERNANCE", "MIND", "PROJECTS"]

# Denylist gate: if any of these path segments appear inside a ZIP, the build MUST fail.
# (We keep it conservative; expand as needed.)
DENYLIST_SEGMENTS = {
    "node_modules",
    "dist",
    ".next",
    ".turbo",
    "__pycache__",
    ".cache",
    ".pnpm-store",
}

CANON_FULL_FILES = [
    "1_LIBER_INITIUM.md",
    "2_CORE_IDENTITY.md",
    "3_COGNITIVE_ARCH.md",
    "4_THE_COUNCIL.md",
    "5_PROTOCOLS.md",
    "6_SIGNATURE.md",
    "7_SYSTEM_INTEGRITY.md",
    "8_INTERFACE_STYLE.md",
    "9_SPACE_CHARTER.md",
    "BUSIDO_ISKRY.txt",
    "Liber_Ignis.txt",
]

CORE_MAP = {
    "core/mantra.md": "CORE/MANTRA.md",
    "core/principles.md": "CORE/PRINCIPLES.md",
    "core/telos.md": "CORE/TELOS.md",
    "core/voices.md": "CORE/VOICES.md",
}

SYSTEM_MAP = {
    "system/adaptive_council.md": "SYSTEM/ADAPTIVE_COUNCIL.md",
    "system/architecture.md": "SYSTEM/ARCHITECTURE.md",
    "system/cognitive_architecture.md": "SYSTEM/COGNITIVE_ARCHITECTURE.md",
    "system/council_protocol.md": "SYSTEM/COUNCIL_PROTOCOL.md",
    "system/early_warning.md": "SYSTEM/EARLY_WARNING.md",
    "system/playbooks.md": "SYSTEM/PLAYBOOKS.md",
    "system/rag_engine.md": "SYSTEM/RAG_ENGINE.md",
    "system/security.md": "SYSTEM/SECURITY.md",
    "system/workflow_ops.md": "SYSTEM/WORKFLOW_OPS.md",
}

GOVERNANCE_MAP = {
    "governance/adr.md": "GOVERNANCE/ADR.md",
    "governance/audit.md": "GOVERNANCE/AUDIT.md",
    "governance/changelog.md": "GOVERNANCE/CHANGELOG.md",
    "governance/policy.md": "GOVERNANCE/POLICY.md",
    "governance/update_protocol.md": "GOVERNANCE/UPDATE_PROTOCOL.md",
}

MIND_MAP = {
    "mind/what_if_matrix.md": "MIND/WHAT_IF_MATRIX.md",
}


def resolve_canon_full_dir() -> Path:
    """Locate the directory containing the CANON_FULL source files.

    Preferred: canon/stack_10 (new layout).
    Fallbacks: Versions/Fullspark, Versions/Semantic, Update (legacy layouts).
    """
    candidates = [
        ROOT / "canon" / "stack_10",
        ROOT / "Versions" / "Fullspark",
        ROOT / "Versions" / "Semantic",
        ROOT / "Update",
    ]
    for c in candidates:
        if c.exists() and all((c / name).exists() for name in CANON_FULL_FILES):
            return c

    missing_report = []
    for name in CANON_FULL_FILES:
        found_in = [str(c) for c in candidates if (c / name).exists()]
        if not found_in:
            missing_report.append(f"- {name}: not found in any candidate")
        else:
            missing_report.append(f"- {name}: found in {', '.join(found_in)}")

    raise FileNotFoundError(
        "Cannot locate CANON_FULL source directory.\n"
        "Tried: " + ", ".join(str(c) for c in candidates) + "\n"
        "Per-file report:\n" + "\n".join(missing_report)
    )


def read_text(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def write_text(path: Path, text: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text, encoding="utf-8")


def copy_file(src: Path, dst: Path) -> None:
    dst.parent.mkdir(parents=True, exist_ok=True)
    dst.write_bytes(src.read_bytes())


def _safe_clean_dir(out_dir: Path) -> None:
    """Remove contents of out_dir without deleting out_dir itself."""
    if not out_dir.exists():
        return
    for child in out_dir.iterdir():
        if child.is_dir():
            for sub in child.rglob("*"):
                if sub.is_file() or sub.is_symlink():
                    sub.unlink()
            for sub in sorted([p for p in child.rglob("*") if p.is_dir()], reverse=True):
                sub.rmdir()
            child.rmdir()
        else:
            child.unlink()


def build(out_dir: Path) -> None:
    # Fresh output
    _safe_clean_dir(out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    # Create top-level dirs
    for d in STACK_DIRS:
        (out_dir / d).mkdir(exist_ok=True)

    # CANON_FULL from canon/stack_10
    canon_src_dir = resolve_canon_full_dir()
    for name in CANON_FULL_FILES:
        src = canon_src_dir / name
        if not src.exists():
            raise FileNotFoundError(f"Missing canonical file: {src}")
        copy_file(src, out_dir / "CANON_FULL" / name)

    # CORE
    for src_rel, dst_rel in CORE_MAP.items():
        src = ROOT / src_rel
        if not src.exists():
            raise FileNotFoundError(f"Missing core source: {src_rel}")
        copy_file(src, out_dir / dst_rel)

    # SYSTEM (simple copies)
    for src_rel, dst_rel in SYSTEM_MAP.items():
        src = ROOT / src_rel
        if not src.exists():
            raise FileNotFoundError(f"Missing system source: {src_rel}")
        copy_file(src, out_dir / dst_rel)

    # SYSTEM merged SIFT_PROTOCOL
    sift = read_text(ROOT / "system" / "sift_protocol.md")
    sift_e = read_text(ROOT / "system" / "sift_extended.md")
    merged = sift.rstrip() + "\n\n---\n\n" + sift_e.lstrip()
    write_text(out_dir / "SYSTEM" / "SIFT_PROTOCOL.md", merged)

    # METRICS bundle
    indices = read_text(ROOT / "metrics" / "indices.md")
    evals = read_text(ROOT / "metrics" / "evals.md")
    qa = read_text(ROOT / "metrics" / "qa_playbook.md")
    metrics_bundle = indices.rstrip() + "\n\n---\n\n" + evals.strip() + "\n\n---\n\n" + qa.lstrip()
    write_text(out_dir / "METRICS" / "METRICS_BUNDLE.md", metrics_bundle)

    # METRICS retrieval eval template
    tpl = TEMPLATES / "RETRIEVAL_EVAL.md"
    if not tpl.exists():
        raise FileNotFoundError(f"Missing template: {tpl}")
    copy_file(tpl, out_dir / "METRICS" / "RETRIEVAL_EVAL.md")

    # GOVERNANCE
    for src_rel, dst_rel in GOVERNANCE_MAP.items():
        src = ROOT / src_rel
        if not src.exists():
            raise FileNotFoundError(f"Missing governance source: {src_rel}")
        copy_file(src, out_dir / dst_rel)

    # MIND
    for src_rel, dst_rel in MIND_MAP.items():
        src = ROOT / src_rel
        if not src.exists():
            raise FileNotFoundError(f"Missing mind source: {src_rel}")
        copy_file(src, out_dir / dst_rel)

    # PROJECTS templates (with router already fixed in templates)
    for name in ["INDEX.md", "PROJECT_INSTRUCTIONS.md", "QUERY_RECIPES.md", "ROUTER.md", "STARTER_PROMPT.md", "UPLOAD_SETS.md"]:
        src = TEMPLATES / name
        if not src.exists():
            raise FileNotFoundError(f"Missing template: {src}")
        copy_file(src, out_dir / "PROJECTS" / name)


def _iter_zip_members(zip_path: Path) -> Iterable[str]:
    with zipfile.ZipFile(zip_path, "r") as zf:
        for info in zf.infolist():
            # Normalise to forward slashes (Zip standard)
            yield info.filename


def _violations_in_path(path_in_zip: str) -> list[str]:
    # Split into segments; ignore empty segments.
    segments = [seg for seg in path_in_zip.split("/") if seg]
    return [seg for seg in segments if seg in DENYLIST_SEGMENTS]


def assert_zip_denylist(zip_path: Path) -> None:
    """Fail hard if ZIP contains denylisted path segments."""
    offenders: list[str] = []
    for member in _iter_zip_members(zip_path):
        bad = _violations_in_path(member)
        if bad:
            offenders.append(f"{member}  (matched: {','.join(sorted(set(bad)))})")

    if offenders:
        msg = "\n".join(offenders[:50])
        raise RuntimeError(
            "DENYLIST VIOLATION: ZIP contains forbidden paths (e.g., node_modules).\n"
            f"zip={zip_path}\n"
            f"offenders (first 50):\n{msg}\n"
            "Fix: exclude regen/build dirs from the archive, or adjust the build inputs."
        )


def zip_dir(src_dir: Path, zip_path: Path) -> None:
    """Create a ZIP of src_dir contents (relative paths)."""
    zip_path.parent.mkdir(parents=True, exist_ok=True)
    if zip_path.exists():
        zip_path.unlink()

    with zipfile.ZipFile(zip_path, "w", compression=zipfile.ZIP_DEFLATED) as zf:
        for p in sorted(src_dir.rglob("*")):
            if p.is_dir():
                continue
            rel = p.relative_to(src_dir).as_posix()
            zf.write(p, rel)


def sha256_file(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument(
        "--out",
        default=str(ROOT / "dist" / "ISKRA_PROJECTS_STACK_39"),
        help="Output directory for the Projects stack",
    )
    ap.add_argument(
        "--zip",
        nargs="?",
        const="__AUTO__",
        default=None,
        help="Also create a ZIP and enforce denylist gate. If no value is given, auto-name it next to --out.",
    )

    args = ap.parse_args()
    out_dir = Path(args.out).resolve()

    build(out_dir)
    print(f"Built Projects stack at: {out_dir}")

    if args.zip is not None:
        if args.zip == "__AUTO__":
            zip_path = out_dir.parent / f"{out_dir.name}.zip"
        else:
            zip_path = Path(args.zip).resolve()

        zip_dir(out_dir, zip_path)
        # Gate: the build MUST fail if forbidden paths appear in the archive.
        assert_zip_denylist(zip_path)

        size = zip_path.stat().st_size
        digest = sha256_file(zip_path)
        print(f"ZIP OK: {zip_path} ({size} bytes)")
        print(f"sha256: {digest}")


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(str(e), file=sys.stderr)
        sys.exit(2)
