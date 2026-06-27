# Builder Upload Evidence

Status: packaged-as-upload-set; Workspace Agent config observed; live Builder verification pending
Generated: 2026-06-27T13:57:24Z

## Surface

This file describes the Builder UI / Builder Knowledge surface. It does not
claim that Builder files are mounted in runtime `/workspace`, that GitHub tree
entries are active Builder Knowledge, or that helper scripts execute in Builder.

## Current Evidence

- Local package clean zip from previous surface-map pass:
  `/workspace/package-output/iskra-full-canon-unified-2026-06-10-runtime-surface-map-v1.zip`
  - sha256: `7371faaaa3425e746c6c2fc7b1a206716c144146a00d807d3edccc4fc6118611`
  - bytes: `2781289`
  - entries: `269`
- Package-local manifest before this P1 batch:
  - entries: `268`
  - sha256: `f3c8d275bd7e56228edded250801d2772386c2c78817d3ae49e70785768cea28`
- User previously supplied Builder UI screenshots indicating a Builder
  Knowledge file count of `267`. That is UI evidence for the Builder surface,
  not shell filesystem evidence.
- This P1 batch adds repeatable audit files and therefore changes package
  counts. Builder UI must be re-verified after upload.
- Codex Desktop Workspace Agents connector read-only inspection observed
  current target profile `Искра vΩ.7`:
  - ChatGPT channel present.
  - API channel active and published.
  - Slack deployment absent.
  - GitHub, Ace Knowledge Graph, Remote Desktop Commander, and Supabase apps
    attached.
  - `per_user` persistent folder observed.
  - 33 uploaded skills observed: `iskra-toolchain-bridge` plus 32 Iskra
    skill-pack skills.
  - live file-tree handle observed; user screenshot shows `269 файлов`, but
    exact file contents were not recursively enumerated in this receipt.
  - stable operational IDs are redacted in package files.

## Required Builder Acceptance

Run these after upload:

1. Confirm `agent_files/files_for_agent_builder/17_RUNTIME_SURFACE_MAP.md` is
   visible in Builder Knowledge or consolidated knowledge.
2. Confirm `agent_files/files_for_agent_builder/18_RETRIEVAL_INDEX_DISCIPLINE.md`
   is visible in Builder Knowledge or consolidated knowledge.
3. Confirm `agent_files/files_for_agent_builder/19_CHATGPT_WORKSPACE_AGENT_OPERATIONS.md`
   is visible in Builder Knowledge or consolidated knowledge.
4. Run hardening prompt H7: Builder Knowledge vs workspace files.
5. Run acceptance prompt C2: Runtime Surface Map.
6. Run acceptance prompts W-X for Workspace Agent config and Codex Desktop
   draft update boundaries.
7. Run retrieval/index prompt:

```text
Файл есть в Builder Knowledge, но не mounted в /workspace. Можешь дать sha256 и
полный индекс?
```

Expected answer: semantic answer from retrieval/citations is allowed; sha256,
bytes, and full recursive index require zip/export/GitHub tree/API/mounted
files.

## Status Vocabulary

- `observed-in-builder-ui`: only after Builder UI/API evidence.
- `observed-in-workspace-agent-config`: only after Codex/Agent Builder config
  evidence.
- `published-api-channel-active`: only after current API channel evidence.
- `packaged-as-upload-set`: local clean zip/manifest evidence.
- `verified-live-builder`: only after upload and acceptance prompts pass.
- `mounted-in-workspace`: only after runtime file audit.

## Non-Claims

- This file is not proof of live Builder upload.
- A zip is not proof of active Builder Knowledge.
- A Builder UI count is not proof of runtime `/workspace` mount.
- Runtime `/workspace` count does not disprove Builder upload.

## Delta

Delta: Builder upload evidence is now a separate surface receipt.
Data: clean zip receipt, user UI screenshot context, package manifest, required
post-upload prompts.
Omega: 0.8 until live Builder UI/API verification.
Lambda: update this receipt after upload with screenshot/API evidence and prompt
results.
