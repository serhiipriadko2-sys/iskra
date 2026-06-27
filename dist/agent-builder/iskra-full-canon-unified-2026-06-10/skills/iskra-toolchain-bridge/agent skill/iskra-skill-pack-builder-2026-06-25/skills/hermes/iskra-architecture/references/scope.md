        # Scope

        ## Primary focus
        Iskra Architecture covers architecture tasks inside the Iskra repository and canon.

        ## Default inputs
        - question
        - code snippet or diff
        - file path
        - canon or protocol document
        - adr or ledger entry

        ## Trigger conditions
        Use this skill when the user's goal matches one of these patterns:
        - where should this code live?
- is this dependency allowed?
- how do i move logic from runtime to packages?

        ## Repo anchors to inspect first
        - packages/core
- packages/math
- packages/engine
- apps/iskra-web
- runtime/

        ## Notes
        - Default connector assumption: GitHub repository access.
        - Prefer repo evidence over generic web advice.
        - If a request touches canon or protocol behavior, check whether Truth Ladder or ADR rules also apply.
