        # Scope

        ## Primary focus
        Iskra Git Workflow covers git workflow tasks inside the Iskra repository and canon.

        ## Default inputs
        - question
        - code snippet or diff
        - file path
        - canon or protocol document
        - adr or ledger entry

        ## Trigger conditions
        Use this skill when the user's goal matches one of these patterns:
        - name this branch
- write a conventional commit
- what should go in the pr summary?

        ## Repo anchors to inspect first
        - contributing.md
- skills/git_workflow.yaml
- governance/changelog.md when versioning matters

        ## Notes
        - Default connector assumption: GitHub repository access.
        - Prefer repo evidence over generic web advice.
        - If a request touches canon or protocol behavior, check whether Truth Ladder or ADR rules also apply.
