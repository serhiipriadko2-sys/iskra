# Scope

## Primary focus
Iskra Metrics Evaluator covers metrics tasks inside the Iskra repository and canon.

## Default inputs
- question
- code snippet or diff
- file path
- canon or protocol document
- adr or ledger entry

## Trigger conditions
Use this skill when the user's goal matches one of these patterns:
- what do these metrics say?
- is drift or chaos too high?
- evaluate this state using iskra metrics

## Repo anchors to inspect first
- metric definitions
- derived formulas
- truth ladder to avoid overclaiming

## Notes
- Default connector assumption: GitHub repository access.
- Prefer repo evidence over generic web advice.
- If a request touches canon or protocol behavior, check whether Truth Ladder or ADR rules also apply.
