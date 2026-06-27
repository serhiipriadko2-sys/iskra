        # Scope

        ## Primary focus
        Iskra Code Review covers code review tasks inside the Iskra repository and canon.

        ## Default inputs
        - question
        - code snippet or diff
        - file path
        - canon or protocol document
        - adr or ledger entry

        ## Trigger conditions
        Use this skill when the user's goal matches one of these patterns:
        - review this diff
- what blocks merge?
- give me a merge checklist

        ## Repo anchors to inspect first
        - changed files
- tests status
- layer rules
- security implications

        ## Notes
        - Default connector assumption: GitHub repository access.
        - Prefer repo evidence over generic web advice.
        - If a request touches canon or protocol behavior, check whether Truth Ladder or ADR rules also apply.
