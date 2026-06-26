        # Scope

        ## Primary focus
        Iskra Code Style covers code style tasks inside the Iskra repository and canon.

        ## Default inputs
        - question
        - code snippet or diff
        - file path
        - canon or protocol document
        - adr or ledger entry

        ## Trigger conditions
        Use this skill when the user's goal matches one of these patterns:
        - rewrite this file to match iskra style
- check import order and naming
- make this strict typescript

        ## Repo anchors to inspect first
        - skills/code_style.yaml
- contributing.md
- existing nearby files

        ## Notes
        - Default connector assumption: GitHub repository access.
        - Prefer repo evidence over generic web advice.
        - If a request touches canon or protocol behavior, check whether Truth Ladder or ADR rules also apply.
