---
created: 2026-02-09
status: action_required
---

# Ledger Regeneration Required

## Context

The SoT40 integration (vΩ.3.10-sot40-integration) has been completed, integrating 40+ files from the `Update/` directory into the canonical layer directories:

- **CORE**: Added 2 .txt files, updated 4 .md files
- **SYSTEM**: Added 3 new files, replaced 8 files
- **METRICS**: Replaced 2 files, added 1 file
- **GOVERNANCE**: Added 2 files, replaced 3 files
- **MIND**: Replaced 1 file
- **PROJECTS**: Created directory with 5 new files

## Action Required

The `ledger/sot.json` file contains SHA-256 hashes of all Source of Truth files. After this integration, these hashes are no longer valid and must be regenerated.

### Steps to Regenerate

```bash
# From repository root
python tools/update_ledger.py

# Verify integrity after update
python tools/verify_ledger.py
```

### Expected Changes

The following files should have new or updated hash entries in `ledger/sot.json`:

**New files:**
- core/busido_iskry.txt
- core/liber_ignis.txt
- governance/adr_20260206_runtime_patches.md
- governance/governance_pack.md
- metrics/somatic_intuition.md
- projects/ (all 5 files)
- system/cognitive_architecture_sot40.md
- system/playbooks_vnext.md
- system/slo_guard.md

**Updated files:**
- core/mantra.md, principles.md, voices.md
- governance/adr.md, adr_memory_stack.md, changelog.md
- metrics/metrics_bundle.md, quality_eval_somatic.md
- mind/what_if_matrix.md
- system/ (8 files: architecture.md, council_graph_pack.md, council_protocol.md, early_warning.md, rag_engine.md, security.md, sift_protocol.md, workflow_ops.md)

## Post-Regeneration

After regeneration, the following should be validated:
1. All SoT files have valid SHA-256 hashes
2. No files are missing from the ledger
3. The `ledger/checksum.asc` signature should be updated if applicable
4. The `ledger/integrity_log.md` should be updated with this regeneration event

## Reference

- ADR: See governance/adr.md for the policy on SoT changes
- SoT40 Structure: See projects/index.md for the canonical 40-file structure
- Changelog: See governance/changelog.md entry vΩ.3.10-sot40-integration
