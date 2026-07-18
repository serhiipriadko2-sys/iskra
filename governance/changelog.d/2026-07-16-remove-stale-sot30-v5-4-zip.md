# Remove stale/defective dist/SoT30_v5.4.zip

Deep-audit follow-up after the SoT30 v5.5.1 package landed (`ADR-20260716-03`, PR #268/#269).

`dist/` carried two SoT30 archives with no canonicity marker:
- `dist/SoT30_v5.4.zip` — the original owner-uploaded package (commit `686489b`, GitHub web upload), which still carried internally the defects this session's audit fixed: the file-13 manifest mismatch (its manifest declared 12,869 bytes / `f57dcbe2…` while the actual file 13 was 12,958 / `8888d38a…`), the 563 KB embedded base64 asset in file 24, unwrapped ontology epigraphs, and the pre-mythic Kernel Order.
- `dist/SoT30_v5.5.1.zip` — the clean, audited, self-gate-passing package.

A future uploader taking "the SoT30 package" from `dist/` could have grabbed the defective v5.4 one. Removed `dist/SoT30_v5.4.zip` (owner-authorized) so `dist/SoT30_v5.5.1.zip` is the single canonical package. Regenerated `apps/iskra-site` canon index to drop the stale node (2922 → 2921).

Historical governance records (ADRs, KNOWLEDGE_DIFF, AUDIT_CORRECTIONS) that name `SoT30_v5.4.zip` as the audit's source artifact are left unchanged — they accurately describe what happened and are not live dependencies. The file remains recoverable from git history if ever needed. No knowledge-file content, ledger, runtime, or Supabase change.
