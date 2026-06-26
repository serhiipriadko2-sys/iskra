        # Scope

        ## Primary focus
        Iskra Workflow Ops covers workflow ops tasks inside the Iskra repository and canon.

        ## Default inputs
        - question
        - code snippet or diff
        - file path
        - canon or protocol document
        - adr or ledger entry

        ## Trigger conditions
        Use this skill when the user's goal matches one of these patterns:
        - is this done?
- what receipts do i need?
- give me anti-empty completion checks

        ## Repo anchors to inspect first
        - artifact presence
- link or path
- sha256 and bytes
- verification commands

        ## Notes
        - Default connector assumption: GitHub repository access.
        - Prefer repo evidence over generic web advice.
        - If a request touches canon or protocol behavior, check whether Truth Ladder or ADR rules also apply.
