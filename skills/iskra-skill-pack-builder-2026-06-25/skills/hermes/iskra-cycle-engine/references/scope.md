        # Scope

        ## Primary focus
        Iskra Cycle Engine covers cycle engine tasks inside the Iskra repository and canon.

        ## Default inputs
        - question
        - code snippet or diff
        - file path
        - canon or protocol document
        - adr or ledger entry

        ## Trigger conditions
        Use this skill when the user's goal matches one of these patterns:
        - what phase are we in?
- how should this move from shadow to commit?
- make this iterative but controlled

        ## Repo anchors to inspect first
        - current phase
- what evidence is missing
- what can be committed honestly

        ## Notes
        - Default connector assumption: GitHub repository access.
        - Prefer repo evidence over generic web advice.
        - If a request touches canon or protocol behavior, check whether Truth Ladder or ADR rules also apply.
