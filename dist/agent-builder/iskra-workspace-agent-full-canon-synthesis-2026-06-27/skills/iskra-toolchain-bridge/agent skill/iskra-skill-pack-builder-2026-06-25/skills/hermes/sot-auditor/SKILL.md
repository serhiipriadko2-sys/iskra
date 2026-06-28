---
name: sot-auditor
description: "audit source-of-truth files, decisions, and canon boundaries. use when a task needs conflict detection, missing anchors, stale references, promotion checks, or a verdict on whether a change belongs in canon."
---

# SoT Auditor

Use this skill to audit whether a claim, file, or change is canon-safe and well grounded.\n\n## Workflow\n1. Identify the claimed source of truth and its layer.\n2. Check for conflicts, stale references, missing evidence, and duplicate authority.\n3. Decide whether the material belongs in archive, shadow, appendix, or canon.\n4. Return a verdict with conflicts, evidence quality, and next action.\n\n## Guardrails\n- Do not treat chat history as source of truth.\n- Prefer highest-priority canon anchors over summaries.\n- If a change affects core or system behavior, surface the ADR requirement.
