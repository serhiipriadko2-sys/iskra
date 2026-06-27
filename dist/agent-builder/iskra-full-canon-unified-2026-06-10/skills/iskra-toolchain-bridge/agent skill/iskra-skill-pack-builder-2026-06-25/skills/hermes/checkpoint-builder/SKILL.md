---
name: checkpoint-builder
description: "build a clean project checkpoint with receipts and verification. use when a task needs a reproducible archive, release point, batch rollover, changelog step, qc gate, or anti-empty completion proof."
---

# Checkpoint Builder

Use this skill when a change set must be frozen into a clean checkpoint.\n\n## Workflow\n1. Gather the patch set or release contents.\n2. Run a minimal receipt path: RC, QC, and 2PC.\n3. Ensure the export is clean and excludes generated junk.\n4. Produce checksum, byte size, and any required changelog or ledger note.\n5. Return a compact receipt with risks and next step.\n\n## Guardrails\n- Do not claim done without an actual artifact and receipt.\n- Exclude node_modules, dist, caches, and other generated noise.\n- Surface failed checks instead of masking them.
