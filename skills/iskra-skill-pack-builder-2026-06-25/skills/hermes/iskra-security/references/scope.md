        # Scope

        ## Primary focus
        Iskra Security covers security tasks inside the Iskra repository and canon.

        ## Default inputs
        - question
        - code snippet or diff
        - file path
        - canon or protocol document
        - adr or ledger entry

        ## Trigger conditions
        Use this skill when the user's goal matches one of these patterns:
        - security review this change
- can i store this key here?
- what risks does this deployment have?

        ## Repo anchors to inspect first
        - system/security.md
- system/supabase_security.md
- contributing.md security section

        ## Notes
        - Default connector assumption: GitHub repository access.
        - Prefer repo evidence over generic web advice.
        - If a request touches canon or protocol behavior, check whether Truth Ladder or ADR rules also apply.
