# 2026-06-26 - Repeatable Surface Diagnostics

Added P1 repeatable diagnostics:

- `tools/workspace_surface_audit.py`
- `SURFACE_INVENTORY.json`
- `GITHUB_TREE_INDEX.json`
- `BUILDER_UPLOAD_EVIDENCE.md`
- `HOOK_SMOKE_RECEIPT.json`
- `SUPABASE_ADVISOR_RECEIPT.json`
- `agent_files/files_for_agent_builder/18_RETRIEVAL_INDEX_DISCIPLINE.md`

The package now separates retrieval/citation evidence from byte-level file
evidence and records counts/hashes/status per surface instead of producing a
single ambiguous file count.

Live Builder verification remains pending until post-upload prompt checks pass.
