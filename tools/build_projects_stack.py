#!/usr/bin/env python3
"""Build ChatGPT Projects stack artifact from declarative SoT40 manifest."""

from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Iterable

ROOT = Path(__file__).resolve().parents[1]
TEMPLATES = ROOT / "tools" / "projects_stack_templates"
SCOPE_MANIFEST_PATH = ROOT / "tools" / "sot40_scope_manifest.json"


def load_scope_manifest() -> dict:
    return json.loads(SCOPE_MANIFEST_PATH.read_text(encoding="utf-8"))



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


def clear_output_dir(out_dir: Path) -> None:
    if out_dir.exists():
        for child in out_dir.iterdir():
            if child.is_dir():
                for sub in child.rglob("*"):
                    if sub.is_file():
                        sub.unlink()
                for sub in sorted([p for p in child.rglob("*") if p.is_dir()], reverse=True):
                    sub.rmdir()
                child.rmdir()
            else:
                child.unlink()
    out_dir.mkdir(parents=True, exist_ok=True)


def copy_mapped_files(mapping: dict[str, str], missing_error: str, out_dir: Path) -> None:
    for src_rel, dst_rel in mapping.items():
        src = ROOT / src_rel
        if not src.exists():
            raise FileNotFoundError(missing_error.format(src_rel=src_rel))
        copy_file(src, out_dir / dst_rel)


def build(out_dir: Path) -> None:
    manifest = load_scope_manifest()
    clear_output_dir(out_dir)

    for directory in manifest["stackDirs"]:
        (out_dir / directory).mkdir(exist_ok=True)

    canon_src_dir = ROOT / manifest["canonFullSourceDir"]
    for name in manifest["canonFullFiles"]:
        src = canon_src_dir / name
        if not src.exists():
            raise FileNotFoundError(f"Missing canonical file: {src}")
        copy_file(src, out_dir / "CANON_FULL" / name)

    copy_mapped_files(manifest["coreMap"], "Missing core source: {src_rel}", out_dir)
    copy_mapped_files(manifest["systemMap"], "Missing system source: {src_rel}", out_dir)
    copy_mapped_files(manifest["governanceMap"], "Missing governance source: {src_rel}", out_dir)
    copy_mapped_files(manifest["mindMap"], "Missing mind source: {src_rel}", out_dir)

    sift = read_text(ROOT / "system" / "sift_protocol.md")
    sift_extended = read_text(ROOT / "system" / "sift_extended.md")
    write_text(out_dir / "SYSTEM" / "SIFT_PROTOCOL.md", sift.rstrip() + "\n\n---\n\n" + sift_extended.lstrip())

    indices = read_text(ROOT / "metrics" / "indices.md")
    evals = read_text(ROOT / "metrics" / "evals.md")
    qa_playbook = read_text(ROOT / "metrics" / "qa_playbook.md")
    write_text(
        out_dir / "METRICS" / "METRICS_BUNDLE.md",
        indices.rstrip() + "\n\n---\n\n" + evals.strip() + "\n\n---\n\n" + qa_playbook.lstrip(),
    )

    retrieval_eval = TEMPLATES / "RETRIEVAL_EVAL.md"
    if not retrieval_eval.exists():
        raise FileNotFoundError(f"Missing template: {retrieval_eval}")
    copy_file(retrieval_eval, out_dir / "METRICS" / "RETRIEVAL_EVAL.md")

    for template_name in manifest["projectTemplates"]:
        template_path = TEMPLATES / template_name
        if not template_path.exists():
            raise FileNotFoundError(f"Missing template: {template_path}")
        copy_file(template_path, out_dir / "PROJECTS" / template_name)



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
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--out",
        default=str(ROOT / "dist" / "ISKRA_PROJECTS_STACK_39"),
        help="Output directory for the Projects stack",
    )
    args = parser.parse_args()
    out_dir = Path(args.out).resolve()

    build(out_dir)
    print(f"Built Projects stack at: {out_dir}")


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(str(e), file=sys.stderr)
        sys.exit(2)
