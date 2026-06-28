# Live Workspace Agent Update Receipt - 2026-06-27

Status: live-update-overlay
Target: Iskra vOmega.7 ChatGPT Workspace Agent
Published evidence: ordinary file overlay published as Workspace Agent version
51 on 2026-06-27; main prompt save remained blocked by the Workspace Agents
draft-save endpoint in this run.

## Purpose

This file is an overlay receipt for the live Workspace Agent file tree. It
exists because ordinary Workspace Agent file upload does not overwrite an
existing file at the same path. If older uploaded files conflict with this
receipt, this receipt and the live agent instructions take priority for
Workspace Agent platform, API, and Memory boundaries.

## Current Platform Facts

- Official surface name: `ChatGPT Workspace Agents`.
- Editor/configuration surface: `Agent Builder`.
- `chatgpt.com/agents/studio/...` is an observed editor URL path, not the
  primary official product name.
- Public OpenAI documentation checked on 2026-06-27 describes Workspace Agents
  for ChatGPT Enterprise, Business, and Edu as a research-preview workspace
  capability.
- Agent Builder configuration can include profile details, instructions, model
  choice, apps/connectors, skills, files, and memory-related controls.
- Workspace Agent API trigger calls are asynchronous. `202 Accepted` means
  accepted or queued, not task completion.
- Workspace Agent API access uses Workspace Agent access tokens, not ordinary
  OpenAI Platform API keys.
- Do not preserve or repeat an unverified public `2026-11-30` Agent Builder
  deprecation-date claim as current fact.

## Memory Boundary

Workspace Agent Memory is a platform-managed per-user memory surface. It is not
the same as Builder `Files`, local `agent_files/`, clean zip contents, GitHub
mirror files, or runtime scratch paths.

Treat `agent_files/memory_seed/` and `agent_files/memory_current/` as package
seed/reference material. They can describe the intended memory structure, but
they are not proof that the same content already exists in live Workspace Agent
Memory.

The user cannot populate the platform Memory tree by uploading ordinary Builder
files. Memory writes require supported ChatGPT/API runs with Memory enabled, and
claims about written/read Memory content require UI/API/runtime evidence.

## Live Update Intent

The live prompt should load or follow
`2026-06-27-instructions-full.md` as the current full-canon instruction snapshot
when available. If that file cannot be retrieved in a run, the live prompt's
embedded rules and this overlay receipt remain the active minimum boundary.

## Residual Risk

Older uploaded files can remain present in the Workspace Agent file tree until a
future Builder file replacement/delete workflow is available or performed
manually. Therefore old file presence is not by itself evidence of current
truth. Use priority order:

1. System/developer/runtime instructions.
2. Current live Workspace Agent instructions.
3. This overlay receipt and the full instruction snapshot named above.
4. Older uploaded package files.

## Next Verification

After publish, verify the live agent with acceptance prompts covering:

- official product name and editor surface;
- Workspace Agent API `202 Accepted` semantics;
- Workspace Agent access-token boundary;
- Builder Files vs Workspace Agent Memory separation;
- no current factual reliance on an unverified public `2026-11-30` deprecation
  date.
