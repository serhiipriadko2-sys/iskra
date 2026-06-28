# Scope

## Primary focus
Iskra Shadow Repair covers shadow repair tasks inside the Iskra repository and canon.

## Default inputs
- question
- code snippet or diff
- file path
- canon or protocol document
- adr or ledger entry

## Trigger conditions
Use this skill when the user's goal matches one of these patterns:
- the sources conflict
- we may be hallucinating here
- switch to honest repair mode

## Repo anchors to inspect first
- evidence gaps
- conflicts
- need to mark hypothesis explicitly

## Notes
- Default connector assumption: GitHub repository access.
- Prefer repo evidence over generic web advice.
- If a request touches canon or protocol behavior, check whether Truth Ladder or ADR rules also apply.
