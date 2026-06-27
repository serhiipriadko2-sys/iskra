        # Scope

        ## Primary focus
        Iskra Migration covers migration tasks inside the Iskra repository and canon.

        ## Default inputs
        - question
        - code snippet or diff
        - file path
        - canon or protocol document
        - adr or ledger entry

        ## Trigger conditions
        Use this skill when the user's goal matches one of these patterns:
        - how do i migrate this module?
- what is the safest extraction order?
- does this belong in runtime or engine?

        ## Repo anchors to inspect first
        - runtime/
- packages/
- agreed layer rules
- current active phase

        ## Notes
        - Default connector assumption: GitHub repository access.
        - Prefer repo evidence over generic web advice.
        - If a request touches canon or protocol behavior, check whether Truth Ladder or ADR rules also apply.
