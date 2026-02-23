#!/usr/bin/env python3
"""Build ChatGPT Projects stack artifact from declarative SoT40 manifest."""

from __future__ import annotations

import argparse
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TEMPLATES = ROOT / "tools" / "projects_stack_templates"
SCOPE_MANIFEST_PATH = ROOT / "tools" / "sot40_scope_manifest.json"


def load_scope_manifest() -> dict:
    return json.loads(SCOPE_MANIFEST_PATH.read_text(encoding="utf-8"))


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
    main()
