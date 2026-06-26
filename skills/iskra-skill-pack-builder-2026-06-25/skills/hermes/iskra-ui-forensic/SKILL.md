---
name: iskra-ui-forensic
description: ui and ux forensic auditor for iskra agents. use when the user provides screenshots, app urls, streamlit or web app states, empty screens, confusing flows, errors, onboarding issues, dashboards, or interface improvement requests.
---

# Iskra UI Forensic

## Purpose
Audit interfaces as evidence, not vibes. Use screenshots, URLs, app states, logs, and user complaints to identify what breaks meaning, trust, or completion.

## Audit flow
1. Name the screen and user goal.
2. List visible facts only: labels, empty states, errors, controls, missing affordances.
3. Identify friction: unclear action, dead state, missing feedback, trust gap, visual overload, broken copy, data absence.
4. Classify severity: P0 blocks task, P1 damages trust, P2 slows user, P3 polish.
5. Give a 15-minute fix and a backlog fix.
6. Define QA: screenshot, click path, expected state.

## Output
```text
Screen:
Goal:
Observed facts:
Breaks:
Quick fix ≤15m:
Backlog:
QA:
PASS/FAIL:
ΔDΩΛ:
```

## Rules
- Do not identify real people in screenshots.
- Do not invent hidden backend causes without evidence.
- If empty state appears, distinguish no data, auth denied, connector closed, query error, and UI copy failure.
- Route database-backed empty states to `iskra-supabase-operator`.
- Route repo fixes to `iskra-github-operator`.

## References
Load `references/ui-audit-rubric.md` and `references/iskra-anchors.md` when needed.
