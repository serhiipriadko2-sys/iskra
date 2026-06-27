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
  and Supabase app access, per-user persistent folder state, and 33 uploaded
  skills.
- The user screenshot shows 269 files in the live Agent Builder Files section;
  connector file listing did not complete in this run.
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

## Consequences

- Package receipts now include a redacted live-config view.
- The clean export tool includes `SURFACE_INVENTORY.json` as a dynamic receipt
  while keeping it out of `MANIFEST.sha256`.
- Compact consolidated knowledge must include the new operations boundary.
- Acceptance prompts extend from A-V to A-X.
- Live Workspace Agent updates still require explicit user approval for the
  exact target and field set.

## Verification

Local package verification must include:

1. consolidated knowledge regeneration;
2. manifest regeneration;
3. clean export / zip receipt regeneration;
4. surface inventory regeneration;
5. acceptance prompt update;
6. no secret/token exposure.

Live verification requires:

1. read current draft config;
2. compare instructions and file tree;
3. apply only approved draft changes;
4. publish only if explicitly requested;
5. run live acceptance prompts S-X;
6. record receipt.

## Status

Accepted for local package adaptation. Live Workspace Agent mutation is not
authorized by this ADR.

## Delta

Delta: Workspace Agent live config becomes a first-class package alignment
surface.
Data: Codex Desktop connector config, package files, OpenAI Workspace Agent
docs, local manifest/export tools.
Omega: 0.9 for local package boundary; 0.6 for live file parity until live
file-tree enumeration is performed.
Lambda: revisit if Workspace Agents docs, Codex Desktop agent management, API
auth, or Builder file-tree semantics change.
