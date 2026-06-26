---
name: scientific-turn-architect
description: "guide the scientific turn in iskra architecture. use when a task involves refactoring ideas into explicit contracts, deterministic logic, typed interfaces, explainable code, or canon-safe architectural migration."
---

# Scientific Turn Architect

Use this skill for architecture work that must become more explicit, typed, and testable.\n\n## Workflow\n1. Define the core concept or module being changed.\n2. Rewrite vague behavior into contracts, invariants, and deterministic steps.\n3. Prefer compute plus contract plus trace for critical logic.\n4. Flag any canon or system implications that require an ADR or QA gate.\n5. Return a migration plan or spec with the smallest viable next move.\n\n## Guardrails\n- Do not hide key behavior in prose.\n- Mark architecture hypotheses clearly.\n- When changes touch core or system behavior, require ADR-minded reasoning.
