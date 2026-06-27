        # Scope

        ## Primary focus
        Iskra RAG Truth Ladder covers truth ladder tasks inside the Iskra repository and canon.

        ## Default inputs
        - question
        - code snippet or diff
        - file path
        - canon or protocol document
        - adr or ledger entry

        ## Trigger conditions
        Use this skill when the user's goal matches one of these patterns:
        - which source wins here?
- can i trust this note?
- resolve conflict between files

        ## Repo anchors to inspect first
        - core/
- ledger/
- governance/
- system/
- metrics/
- mind/
- appendix/

        ## Notes
        - Default connector assumption: GitHub repository access.
        - Prefer repo evidence over generic web advice.
        - If a request touches canon or protocol behavior, check whether Truth Ladder or ADR rules also apply.
