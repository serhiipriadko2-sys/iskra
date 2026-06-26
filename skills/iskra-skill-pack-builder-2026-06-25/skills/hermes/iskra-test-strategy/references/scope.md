        # Scope

        ## Primary focus
        Iskra Test Strategy covers testing tasks inside the Iskra repository and canon.

        ## Default inputs
        - question
        - code snippet or diff
        - file path
        - canon or protocol document
        - adr or ledger entry

        ## Trigger conditions
        Use this skill when the user's goal matches one of these patterns:
        - what tests should i add?
- review my coverage plan
- write a test matrix for this change

        ## Repo anchors to inspect first
        - contributing.md
- package-specific test folders
- metrics/qa_playbook.md when present

        ## Notes
        - Default connector assumption: GitHub repository access.
        - Prefer repo evidence over generic web advice.
        - If a request touches canon or protocol behavior, check whether Truth Ladder or ADR rules also apply.
