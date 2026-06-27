        # Scope

        ## Primary focus
        Iskra Ledger Integrity covers ledger integrity tasks inside the Iskra repository and canon.

        ## Default inputs
        - question
        - code snippet or diff
        - file path
        - canon or protocol document
        - adr or ledger entry

        ## Trigger conditions
        Use this skill when the user's goal matches one of these patterns:
        - what must happen after changing canon?
- how do i verify ledger integrity?
- did this break sot hashes?

        ## Repo anchors to inspect first
        - ledger/sot.json
- tools/update_ledger.py
- tools/verify_ledger.py
- integrity log needs

        ## Notes
        - Default connector assumption: GitHub repository access.
        - Prefer repo evidence over generic web advice.
        - If a request touches canon or protocol behavior, check whether Truth Ladder or ADR rules also apply.
