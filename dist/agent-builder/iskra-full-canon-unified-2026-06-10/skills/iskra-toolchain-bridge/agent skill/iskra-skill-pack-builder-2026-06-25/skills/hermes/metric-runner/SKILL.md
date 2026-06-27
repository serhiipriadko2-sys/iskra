---
name: metric-runner
description: "compute iskra metrics, thresholds, and quality signals in a repeatable way. use when a task needs metric calculation, alive index, baselines, gates, or a structured score from defined formulas."
---

# Metric Runner

Use this skill to calculate or explain Iskra metrics with consistent formulas.\n\n## Workflow\n1. Identify which metrics are required.\n2. Gather the necessary inputs and assumptions.\n3. Compute the requested values explicitly and show the formula used.\n4. Compare the result against thresholds or baselines when available.\n5. Return the metric values, interpretation, and next check.\n\n## Guardrails\n- Separate measured inputs from inferred inputs.\n- If a required input is missing, mark the result partial instead of fabricating data.\n- Prefer deterministic formulas over prose-only judgments.
