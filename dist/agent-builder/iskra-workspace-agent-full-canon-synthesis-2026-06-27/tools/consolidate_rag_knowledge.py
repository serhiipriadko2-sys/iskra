#!/usr/bin/env python3
"""Consolidate flat Iskra files into 7 structured RAG volumes.
This helps bypass the 20-file upload limit on ChatGPT Custom GPTs / Workspace Agents
while preserving the index structure for vector-based search.
"""

from __future__ import annotations
import os
from pathlib import Path

PACKAGE_ROOT = Path(__file__).resolve().parents[1]
OUTPUT_DIR = PACKAGE_ROOT / "agent_files" / "consolidated_knowledge"

# Define the file mappings for each volume (paths relative to package root)
VOLUMES = {
    "01_ISKRA_CORE_INSTRUCTIONS.md": [
        "agent_files/files_for_agent_builder/00_AGENT_BUILDER_SETUP.md",
        "agent_files/files_for_agent_builder/01_AGENT_INSTRUCTIONS_COMPACT.md",
        "agent_files/canon_source_files/00_ROUTER.md",
        "agent_files/canon_source_files/27_PRINCIPLES.md",
        "agent_files/canon_source_files/37_VOICES.md",
        "agent_files/files_for_agent_builder/06_VOICES_AND_COUNCIL.md",
        "agent_files/files_for_agent_builder/07_OUTPUT_AND_RECEIPTS.md",
        "agent_files/files_for_agent_builder/19_CHATGPT_WORKSPACE_AGENT_OPERATIONS.md",
        "AGENTS.md"
    ],
    "02_ISKRA_COGNITIVE_ARCH_AND_TELOS.md": [
        "agent_files/canon_source_files/01_LIBER_INITIUM.md",
        "agent_files/canon_source_files/02_CORE_IDENTITY.md",
        "agent_files/canon_source_files/03_COGNITIVE_ARCH.md",
        "agent_files/canon_source_files/16_COGNITIVE_ARCHITECTURE.md",
        "agent_files/canon_source_files/35_TELOS.md",
        "agent_files/canon_source_files/09_SPACE_CHARTER.md",
        "agent_files/canon_source_files/14_BUSIDO_ISKRY.txt",
        "agent_files/canon_source_files/22_LIBER_IGNIS.txt"
    ],
    "03_ISKRA_SYSTEM_AND_PROTOCOLS.md": [
        "agent_files/canon_source_files/04_THE_COUNCIL.md",
        "agent_files/canon_source_files/05_PROTOCOLS.md",
        "agent_files/canon_source_files/06_SIGNATURE.md",
        "agent_files/canon_source_files/07_SYSTEM_INTEGRITY.md",
        "agent_files/canon_source_files/30_RAG_ENGINE.md",
        "agent_files/canon_source_files/31_SECURITY.md",
        "agent_files/canon_source_files/32_SIFT_PROTOCOL.md",
        "agent_files/canon_source_files/33_SLO_GUARD.md",
        "agent_files/canon_source_files/39_WORKFLOW_OPS.md",
        "agent_files/canon_source_files/38_WHAT_IF_MATRIX.md",
        "SECURITY.md"
    ],
    "04_ISKRA_EXTENSIONS_AND_WEAVER.md": [
        "agent_files/files_for_agent_builder/10_HORIZON_WEAVER.md",
        "agent_files/files_for_agent_builder/11_DREAMSPACE_LAYER.md",
        "agent_files/files_for_agent_builder/12_TOOLCHAIN_EXPANSION.md",
        "agent_files/canon_source_files/core__somatic_intuition.md",
        "agent_files/canon_source_files/34_SOMATIC_INTUITION.md",
        "agent_files/canon_source_files/metrics__somatic_index.md"
    ],
    "05_ISKRA_GOVERNANCE_ADR.md": [
        "WORKSPACE_AGENT_LIVE_CONFIG_RECEIPT.md",
        "WORKSPACE_AGENT_SKILL_PACK_RECEIPT.md",
        "agent_files/files_for_agent_builder/08_GOVERNANCE_ADR.md",
        "governance/adr.md",
        "governance/changelog.md",
        "agent_files/canon_source_files/11_ADR_RUNTIME_PATCHES.md",
        "agent_files/canon_source_files/12_ADR.md",
        "agent_files/canon_source_files/15_CHANGELOG.md",
        "agent_files/canon_source_files/20_GOVERNANCE_PACK.md",
        "governance/adr_20260206_runtime_patches.md",
        "governance/adr_20260214_gemini_sdk_unification.md",
        "governance/adr_20260220_xcode_explainable_code.md",
        "governance/adr_20260528_embedding_standard_v1.md",
        "governance/adr_20260606_somatic_intuition_sense.md",
        "governance/adr_20260606_unified_agent_builder_assembly.md",
        "governance/adr_20260606_unified_full_canon_builder_v4.md",
        "governance/adr_20260610_unified_full_canon_recovery.md",
        "governance/adr_20260620_chatgpt_agent_builder_audit_and_v2_plan.md",
        "governance/adr_20260606_iskraspace_release_priority.md",
        "governance/adr_20260616_retire_canon_import_backfill_edge_functions.md",
        "governance/adr_20260618_db_proxy_governance.md",
        "governance/adr_20260627_workspace_agent_live_alignment.md",
        "governance/adr_20260628_horizon_v0_2_receipt_layer.md",
        "governance/changelog.d/2026-06-27-workspace-agent-live-alignment.md"
    ],
    "06_ISKRA_METRICS_AND_EVALS.md": [
        "agent_files/canon_source_files/25_METRICS_BUNDLE.md",
        "agent_files/canon_source_files/29_QUALITY_EVAL_SOMATIC_PACK.md",
        "agent_files/canon_source_files/metrics/metrics_bundle.md",
        "agent_files/canon_source_files/metrics/consciousness.md",
        "agent_files/canon_source_files/metrics/qa_playbook.md",
        "agent_files/canon_source_files/metrics/somatic_intuition.md",
        "agent_files/evals/AGENT_BUILDER_ACCEPTANCE_PROMPTS.md",
        "agent_files/evals/BUILDER_RUNTIME_HARDENING_PROMPTS.md",
        "agent_files/evals/ISKRA_CANON_ACCEPTANCE_TESTS.md",
        "agent_files/evals/ISKRA_TOOLCHAIN_ACCEPTANCE_TESTS.md"
    ],
    "07_ISKRA_MEMORY_SEED.md": [
        "agent_files/memory_seed/project-memory.md",
        "agent_files/memory_seed/development-diary.md",
        "agent_files/memory_seed/open-loops.md",
        "agent_files/memory_seed/evidence-index.md",
        "agent_files/memory_seed/adr-log.md"
    ]
}


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    print(f"Starting consolidation to: {OUTPUT_DIR.relative_to(PACKAGE_ROOT)}")

    for vol_name, files in VOLUMES.items():
        vol_path = OUTPUT_DIR / vol_name
        print(f"Generating Volume: {vol_name} ({len(files)} files)...")

        content_parts = []
        content_parts.append(f"# ISKRA RAG VOLUME: {vol_name.replace('_', ' ').replace('.md', '')}\n")
        content_parts.append("This is a consolidated knowledge index volume for ChatGPT Workspace Agents.\n")
        content_parts.append("---\n")

        for f_rel in files:
            f_path = PACKAGE_ROOT / f_rel
            if not f_path.exists():
                print(f"  [WARNING] File not found: {f_rel}")
                continue

            # Parse original file contents
            raw_text = f_path.read_text(encoding="utf-8")
            # Ensure LF ending
            lines = raw_text.splitlines()
            clean_text = "\n".join(lines)

            basename = f_path.name
            rel_name = f_rel

            content_parts.append(f"## FILE: {rel_name}\n")
            content_parts.append(f"**Original Name:** `{basename}`")
            content_parts.append(f"**Path in Repo:** `{rel_name}`\n")
            content_parts.append("```markdown")
            content_parts.append(clean_text)
            content_parts.append("```")
            content_parts.append("\n---\n")

        # Write out with forced LF and UTF-8
        full_content = "\n".join(content_parts)
        vol_path.write_bytes(full_content.encode("utf-8"))
        print(f"  Created Volume: {vol_name} ({vol_path.stat().st_size} bytes)")

    print("Consolidation complete.")


if __name__ == "__main__":
    main()
