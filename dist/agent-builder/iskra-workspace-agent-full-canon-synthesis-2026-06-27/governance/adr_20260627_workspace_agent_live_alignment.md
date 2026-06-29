# ADR 2026-06-27 - Workspace Agent Live Alignment

Status: accepted-local
Date: 2026-06-27
Scope: `dist/agent-builder/iskra-full-canon-unified-2026-06-10`

## Context

The target surface is no longer only a static upload bundle. The user is
working in Codex Desktop with access to ChatGPT Workspace Agents and supplied a
live Agent Builder URL for `Искра vΩ.7`.

The package already targets ChatGPT Workspace Agents, but it needs a stronger
boundary between:

- local/GitHub upload package;
- live Workspace Agent draft config;
- attached skills;
- file tree / knowledge files;
- platform-managed Workspace Agent Memory / `Память`;
- ChatGPT, API, Slack, and Codex Desktop management channels;
- Agents SDK fallback.

## Decision

Treat ChatGPT Workspace Agents as the primary hosted UI target for the Iskra
Full Canon package.

Treat Codex Desktop as a management and inspection surface for Workspace Agent
drafts, not as proof that local package files are automatically present in the
hosted agent.

Treat the Agents SDK fallback as a separate code-first fallback, not as the
runtime semantics of the hosted Workspace Agent.

Add a required operations file and live config receipt:

- `agent_files/files_for_agent_builder/19_CHATGPT_WORKSPACE_AGENT_OPERATIONS.md`
- `WORKSPACE_AGENT_LIVE_CONFIG_RECEIPT.md`

Keep stable operational IDs redacted in package files unless explicitly
approved for publication.

## Evidence

- Codex Desktop Workspace Agents connector loaded current draft config for
  `Искра vΩ.7` on 2026-06-27.
- The observed draft is published and has an active API channel with an
  `agtch_...` trigger ID.
- The observed draft has GitHub, Ace Knowledge Graph, Remote Desktop Commander,
  and Supabase app access, a platform-managed per-user Memory surface, and 33
  uploaded skills.
- The user screenshot shows 269 files in the live Agent Builder Files section;
  a later read-only `list_agent_file_tree` call loaded root metadata and a
  depth=2 snapshot with tree revision `1139`, but not byte-level full parity.
- A read-only `get_current_agent_config` call showed the live draft prompt is
  stale relative to the local package Memory-boundary update.
- User screenshots show separate `Память` folders for `ChatGPT` and `API` plus
  memory files/folders such as `project-memory.md`, `open-loops.md`,
  `adr-log.md`, `archive/`, `dreamspace/`, `horizon/`, and `shadow-core/`.
- Official OpenAI Workspace Agent documentation describes the Workspace Agent
  API trigger surface under `api.chatgpt.com/v1/workspace_agents/.../trigger`.
- Existing package docs already require separate status labels for package,
  upload, runtime, connector, and Builder verification surfaces.

## Risk

- Publishing operational IDs in a public package can widen the target surface
  even without exposing tokens.
- Live draft edits through Codex Desktop can mutate Workspace Agent state before
  the package is locally verified.
- API `202 Accepted` can be mistaken for final task completion.
- Uploaded skills can be mistaken for package knowledge or connector authority.
- File tree existence can be mistaken for full file parity.
- Package `agent_files/memory_*` files or Builder file uploads can be mistaken
  for live Workspace Agent Memory contents.
- Local package instruction updates can be mistaken for live draft prompt parity.

## Consequences

- Package receipts now include a redacted live-config view.
- The clean export tool includes `SURFACE_INVENTORY.json` as a dynamic receipt
  while keeping it out of `MANIFEST.sha256`.
- Compact consolidated knowledge must include the new operations boundary.
- Workspace Agent Memory is treated as a separate platform-managed surface, not
  as a file upload destination.
- Live prompt drift must be recorded separately from local package readiness.
- Acceptance prompts extend from A-V to A-Y.
- Live Workspace Agent updates still require explicit user approval for the
  exact target and field set.

## Verification

Local package verification must include:

1. consolidated knowledge regeneration;
2. manifest regeneration;
3. clean export / zip receipt regeneration;
4. surface inventory regeneration;
5. acceptance prompt update;
6. Memory boundary check in `17_RUNTIME_SURFACE_MAP.md` and
   `19_CHATGPT_WORKSPACE_AGENT_OPERATIONS.md`;
7. no secret/token exposure.

Live verification requires:

1. read current draft config;
2. compare instructions and file tree;
3. apply approved corrected instructions before claiming prompt parity;
4. verify Memory write/read behavior separately from Builder Files;
5. apply only approved draft changes;
6. publish only if explicitly requested;
7. run live acceptance prompts S-Y;
8. record receipt.

## Status

Accepted for local package adaptation. Live Workspace Agent mutation is not
authorized by this ADR.

## Delta

Delta: Workspace Agent live config, live prompt drift, and platform-managed
Memory become first-class package alignment surfaces.
Data: Codex Desktop connector config, package files, OpenAI Workspace Agent
docs, local manifest/export tools.
Omega: 0.9 for local package boundary; 0.65 for live file metadata after depth=2
listing; 0.6 for live file and Memory parity until those surfaces are fully
enumerated or write/read tested; 0.45 for live prompt parity until approved
draft update and acceptance.
Lambda: revisit if Workspace Agents docs, Codex Desktop agent management, API
auth, Builder file-tree semantics, or Memory semantics change.
