#!/usr/bin/env python3
"""Synchronize ChatGPT exports with main repository.

Usage:
  python tools/sync_chatgpt_exports.py [--check] [--target custom|projects|all]

Options:
  --check    Only check sync status, don't copy files
  --target   Which folder to sync (default: all)

Notes:
- Custom gpt/: Direct copies of SoT files (18 files)
- Projects/: Extended set with all layers (38+ files)
"""
from __future__ import annotations
import argparse
import shutil
import os
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CHATGPT_DIR = ROOT / "Chatgpt projects and custom vers"

# Mapping for Custom gpt folder (18 files - core subset)
CUSTOM_GPT_FILES = {
    "LIBER_INITIUM.md": "LIBER_INITIUM.md",
    "core__mantra.md": "core/mantra.md",
    "core__telos.md": "core/telos.md",
    "core__principles.md": "core/principles.md",
    "core__voices.md": "core/voices.md",
    "system__ecosystem_v7_map.md": "system/ecosystem_v7_map.md",
    "system__architecture.md": "system/architecture.md",
    "system__cognitive_architecture.md": "system/cognitive_architecture.md",
    "system__council_protocol.md": "system/council_protocol.md",
    "system__sift_protocol.md": "system/sift_protocol.md",
    "system__rag_engine.md": "system/rag_engine.md",
    "system__security.md": "system/security.md",
    "system__playbooks.md": "system/playbooks.md",
    "metrics__indices.md": "metrics/indices.md",
    "metrics__evals.md": "metrics/evals.md",
    "metrics__qa_playbook.md": "metrics/qa_playbook.md",
    "governance__policy.md": "governance/policy.md",
    "governance__adr.md": "governance/adr.md",
}

# Mapping for Projects folder (38+ files - full set)
PROJECTS_FILES = {
    # Root files
    "README.md": "README.md",
    "ISKRA_MANIFEST.md": "ISKRA_MANIFEST.md",
    "LIBER_INITIUM.md": "LIBER_INITIUM.md",
    # Core
    "core__mantra.md": "core/mantra.md",
    "core__telos.md": "core/telos.md",
    "core__principles.md": "core/principles.md",
    "core__voices.md": "core/voices.md",
    # System
    "system__workflow_ops.md": "system/workflow_ops.md",
    "system__ecosystem_v7_map.md": "system/ecosystem_v7_map.md",
    "system__architecture.md": "system/architecture.md",
    "system__council_protocol.md": "system/council_protocol.md",
    "system__cycle_engine.md": "system/cycle_engine.md",
    "system__rag_engine.md": "system/rag_engine.md",
    "system__sift_protocol.md": "system/sift_protocol.md",
    "system__sift_extended.md": "system/sift_extended.md",
    "system__security.md": "system/security.md",
    "system__playbooks.md": "system/playbooks.md",
    "system__early_warning.md": "system/early_warning.md",
    "system__fractal_monitoring.md": "system/fractal_monitoring.md",
    "system__mindwave_coherence.md": "system/mindwave_coherence.md",
    "system__cognitive_architecture.md": "system/cognitive_architecture.md",
    # Metrics
    "metrics__indices.md": "metrics/indices.md",
    "metrics__evals.md": "metrics/evals.md",
    "metrics__qa_playbook.md": "metrics/qa_playbook.md",
    "metrics__consciousness.md": "metrics/consciousness.md",
    # Governance
    "governance__adr.md": "governance/adr.md",
    "governance__policy.md": "governance/policy.md",
    "governance__audit.md": "governance/audit.md",
    "governance__changelog.md": "governance/changelog.md",
    # Ledger
    "ledger__sot.json": "ledger/sot.json",
    "ledger__integrity_log.md": "ledger/integrity_log.md",
    # Mind
    "mind__atomic_analysis_v7.md": "mind/atomic_analysis_v7.md",
    "mind__reflexions.md": "mind/reflexions.md",
    "mind__phenomenon_study.md": "mind/phenomenon_study.md",
    "mind__shadow_core.md": "mind/shadow_core.md",
    # Appendix
    "appendix__chronology.md": "appendix/chronology.md",
    "appendix__liber_ignis.md": "appendix/liber_ignis.md",
    "appendix__maki.md": "appendix/maki.md",
}


def check_sync(target_dir: Path, mapping: dict[str, str], name: str) -> tuple[int, int, int]:
    """Check sync status. Returns (ok, diff, missing) counts."""
    ok = diff = missing = 0

    for flat_name, src_path in sorted(mapping.items()):
        src = ROOT / src_path
        dst = target_dir / flat_name

        if not src.exists():
            print(f"  [NO_SRC] {flat_name} <- {src_path}")
            missing += 1
            continue

        if not dst.exists():
            print(f"  [MISSING] {flat_name}")
            diff += 1
            continue

        # Compare content
        if src.read_bytes() == dst.read_bytes():
            ok += 1
        else:
            print(f"  [DIFF] {flat_name}")
            diff += 1

    return ok, diff, missing


def sync_files(target_dir: Path, mapping: dict[str, str], name: str) -> tuple[int, int]:
    """Sync files. Returns (copied, skipped) counts."""
    copied = skipped = 0
    target_dir.mkdir(parents=True, exist_ok=True)

    for flat_name, src_path in sorted(mapping.items()):
        src = ROOT / src_path
        dst = target_dir / flat_name

        if not src.exists():
            print(f"  [SKIP] {flat_name} <- source not found: {src_path}")
            skipped += 1
            continue

        # Check if already synced
        if dst.exists() and src.read_bytes() == dst.read_bytes():
            continue

        shutil.copy2(src, dst)
        print(f"  [COPIED] {flat_name}")
        copied += 1

    return copied, skipped


def main():
    parser = argparse.ArgumentParser(description="Sync ChatGPT exports")
    parser.add_argument("--check", action="store_true", help="Only check, don't sync")
    parser.add_argument("--target", choices=["custom", "projects", "all"],
                       default="all", help="Target folder")
    args = parser.parse_args()

    targets = []
    if args.target in ("custom", "all"):
        targets.append(("Custom gpt", CHATGPT_DIR / "Custom gpt", CUSTOM_GPT_FILES))
    if args.target in ("projects", "all"):
        targets.append(("Projects", CHATGPT_DIR / "Projects", PROJECTS_FILES))

    for name, target_dir, mapping in targets:
        print(f"\n=== {name} ({len(mapping)} files) ===")

        if args.check:
            ok, diff, missing = check_sync(target_dir, mapping, name)
            print(f"Result: {ok} synced, {diff} need update, {missing} source missing")
        else:
            copied, skipped = sync_files(target_dir, mapping, name)
            print(f"Result: {copied} copied, {skipped} skipped")

    print("\nDone.")


if __name__ == "__main__":
    main()
