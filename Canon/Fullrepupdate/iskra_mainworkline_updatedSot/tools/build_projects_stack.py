#!/usr/bin/env python3
"""
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

Usage
  python tools/build_projects_stack.py
  python tools/build_projects_stack.py --out dist/ISKRA_PROJECTS_STACK_39

NOTE
This stack is a build artifact. Canonical sources live in core/, system/, metrics/, governance/, canon/.
"""
from __future__ import annotations
import argparse
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TEMPLATES = ROOT / "tools" / "projects_stack_templates"

STACK_DIRS = ["CANON_FULL","CORE","SYSTEM","METRICS","GOVERNANCE","MIND","PROJECTS"]

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

def read_text(path: Path) -> str:
    return path.read_text(encoding="utf-8")

def write_text(path: Path, text: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text, encoding="utf-8")

def copy_file(src: Path, dst: Path) -> None:
    dst.parent.mkdir(parents=True, exist_ok=True)
    dst.write_bytes(src.read_bytes())

def build(out_dir: Path) -> None:
    # Fresh output
    if out_dir.exists():
        # avoid deleting something unsafe:
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

    # Create top-level dirs
    for d in STACK_DIRS:
        (out_dir / d).mkdir(exist_ok=True)

    # CANON_FULL from canon/stack_10
    canon_src_dir = ROOT / "canon" / "stack_10"
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
    for name in ["INDEX.md","PROJECT_INSTRUCTIONS.md","QUERY_RECIPES.md","ROUTER.md","STARTER_PROMPT.md","UPLOAD_SETS.md"]:
        src = TEMPLATES / name
        if not src.exists():
            raise FileNotFoundError(f"Missing template: {src}")
        copy_file(src, out_dir / "PROJECTS" / name)

def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", default=str(ROOT / "dist" / "ISKRA_PROJECTS_STACK_39"),
                    help="Output directory for the Projects stack")
    args = ap.parse_args()
    out_dir = Path(args.out).resolve()
    build(out_dir)
    print(f"Built Projects stack at: {out_dir}")

if __name__ == "__main__":
    main()
