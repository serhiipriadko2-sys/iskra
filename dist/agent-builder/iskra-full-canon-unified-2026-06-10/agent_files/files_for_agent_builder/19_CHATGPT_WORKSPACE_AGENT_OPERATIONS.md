# 19 - ChatGPT Workspace Agent Operations

Status: required
Updated: 2026-06-27
Purpose: align the Iskra Full Canon package with the current ChatGPT Workspace
Agents surface, including Codex Desktop agent management, channels, skills,
files, apps, and API-trigger boundaries.

## Official Surface Names

Use these names precisely:

- Product surface: `ChatGPT Workspace Agents`.
- ChatGPT navigation label: `Agents` / `Агенты`.
- Editor surface: `Agent Builder`; `chatgpt.com/agents/studio/...` is the
  observed editor URL path. Do not present `Agents Studio` as the primary
  official product name unless the UI itself uses that label.
- Desktop management surface: `Codex app` / `Codex Desktop app`.
- API channel: `Workspace Agent API channel` with an `agtch_...` trigger ID.

Do not call this a Custom GPT, GPT Builder, Claude Agent SDK app, or OpenAI
Agents SDK runtime unless that exact surface is being discussed.

## Official Source Alignment

Public OpenAI documentation checked on 2026-06-27 supports these boundaries:

- Workspace Agents are documented for ChatGPT Enterprise, Business, and Edu as
  a research-preview capability.
- Agents are created from the `Agents` sidebar and configured in Agent Builder
  with profile details, instructions, model choice, apps/connectors, skills,
  files, and memory-related controls.
- Publishing can make the agent available in ChatGPT; deployment can also use
  schedules, mentions/team targeting, Slack when configured, and an API channel.
- The Workspace Agent API trigger is asynchronous: `202 Accepted` means the run
  was accepted/queued, not completed.
- Workspace Agent API access uses Workspace Agent access tokens, not ordinary
  OpenAI Platform API keys.

Do not claim broad consumer availability, final API-run completion, or OpenAI
Platform API-key compatibility unless newer official docs prove it.

## Current Target Profile

The active target profile for this upload set is a ChatGPT Workspace Agent that
can be edited in Agent Builder and managed from Codex Desktop.

Observed live configuration on 2026-06-27 through the Codex Desktop
Workspace Agents connector:

- Workspace Agent name: `Искра vΩ.7`.
- ChatGPT channel: present.
- API channel: active and published.
- Slack channel: not configured.
- Workspace Agent Memory surface: platform-managed file-based Memory observed
  with `per_user` behavior and separate `ChatGPT` / `API` personal folders.
- Attached apps: GitHub, Ace Knowledge Graph, Remote Desktop Commander, and
  Supabase.
- Attached skills: 33 uploaded skills total: `iskra-toolchain-bridge` plus 32
  Iskra skill-pack skills.
- Package skill source:
  `skills/iskra-toolchain-bridge/agent skill/iskra-skill-pack-builder-2026-06-25/skills/hermes/`
  contains 32 user-added Iskra skills matching observed live skill names.
- File tree: live file-tree ID observed; user screenshot shows `269 файлов`;
  Codex Desktop `list_agent_file_tree` loaded root metadata and a depth=2
  snapshot with tree revision `1139`; full byte-level parity is still not
  proven.
- Draft instructions: current live draft prompt was read through
  `get_current_agent_config` and is stale relative to this local package's
  corrected Memory boundary. Do not claim the live draft already contains the
  updated local instructions.
- Memory tree: user screenshots show folders/files such as `archive/`,
  `dreamspace/`, `horizon/`, `imports/`, `shadow-core/`, `project-memory.md`,
  `development-diary.md`, `open-loops.md`, `adr-log.md`, and
  `evidence-index.md`; this surface is not populated by ordinary file upload.

Operational identifiers such as full `agt_...`, `agtv_...`, `drv_...`,
`agtch_...`, connector IDs, and file-tree IDs should be redacted in public
package files unless a release owner explicitly accepts the exposure. They are
not access tokens, but they are stable operational handles.

## Channel Boundaries

| Channel | What it proves | What it does not prove |
|---|---|---|
| ChatGPT | The agent can be used conversationally after publish | That every package file is uploaded or retrieved |
| API | A published `agtch_...` trigger endpoint exists | That a `202 Accepted` response contains the final result |
| Slack | Slack replies can be configured if a deployment exists | Slack write access when no Slack deployment is configured |
| Codex Desktop | Draft agents can be inspected and edited through Codex app tools | That local repo files are automatically mounted in the hosted agent |

The API channel uses `https://api.chatgpt.com/v1/workspace_agents/.../trigger`
and a Workspace Agent access token. Do not use an OpenAI Platform API key for
this channel unless official Workspace Agent documentation changes.

## Skills Boundary

Uploaded skills are runtime procedures, not the full canon by themselves.

For this target profile, skills should stay aligned with the package roles:

- `iskra-canon-runtime` for Iskra identity, SIFT, governance, and receipts.
- `iskra-builder-package-operator` for package mirrors, manifests, clean zips,
  Builder readiness, and live verification gates.
- `iskra-artifact-qc` for byte/hash/QC receipts.
- `iskra-sift-auditor`, `sot-auditor`, and `iskra-rag-truth-ladder` for source
  tracing and truth-ladder work.
- `iskra-github-operator` and `iskra-supabase-operator` only within connector
  scope and write-approval boundaries.

Do not claim a skill is active merely because a similarly named file exists in
GitHub or in this package. Claim only what Agent Builder/Codex config evidence
shows.

The user-added package skill source belongs to the Workspace Agent skills
surface. Uploading or replacing those skills is a live draft mutation and must
not be collapsed into ordinary Knowledge upload or local package manifest
verification.

## File And Knowledge Boundary

The package has four different file/state meanings:

1. **Upload package files**: local/GitHub files under this directory.
2. **Workspace Agent files**: files attached to the live Agent Builder file
   tree.
3. **Runtime-visible files**: files mounted into a specific execution/runtime
   context.
4. **Workspace Agent Memory**: platform-managed per-user file-based Memory
   written during ChatGPT/API runs when Memory is enabled.

These surfaces are not interchangeable. If a user asks whether the agent "has"
the files, answer with the surface:

```text
[FACT] The local package contains X files according to MANIFEST.sha256.
[FACT] The Workspace Agent draft has a file tree, but this run did not
recursively enumerate its contents.
[FACT] Workspace Agent Memory is a separate platform-managed surface; Builder
file upload does not populate it.
[HYP] The live agent may retrieve uploaded knowledge semantically after publish,
but byte-level hashes require package/archive/GitHub evidence.
```

## Workspace Agent Memory Boundary

The live `Память` surface is not an upload target. The user cannot manually move
arbitrary package files into that Memory tree through `+ Upload files` /
`+ Загрузить файлы`. Memory writes are produced by the agent during supported
ChatGPT/API runs, and only when Memory is enabled for that agent and channel.

Treat `agent_files/memory_seed/` and `agent_files/memory_current/` as package
seed/reference receipts. They can teach the agent the intended memory structure,
but they are not proof that the same content exists in live Workspace Agent
Memory.

Treat runtime helper paths such as `/workspace/memory/dreamspace` and
`/workspace/memory/shadow-core` as local execution ledgers unless the runtime
explicitly confirms that those paths are mapped to the platform Memory surface.

Required answer discipline:

- Use `[FACT]` only for observed Memory UI/API state or a performed write.
- Use `[HYP] memory write unavailable` when the current surface cannot write or
  confirm Memory.
- Never merge `Files: 269` with Memory contents; count and verify them
  separately.

## Draft Update Boundary

Codex Desktop can stage draft edits to Workspace Agents. A draft edit is still
a live Workspace Agent state change and needs an explicit target and approval
when it changes instructions, files, skills, apps, or deployment channels.

Safe read-only actions:

- inspect current draft config;
- list API channels;
- list/read attached skill files;
- compare local package intent with live config.

Approval-required actions:

- replacing instructions;
- uploading or replacing files;
- changing attached apps/tools;
- adding/removing API or Slack deployments;
- publishing the draft;
- any action that widens write scope or destination permissions.

## Status Labels

Use these labels:

- `packaged-as-upload-set` - local manifest/export evidence.
- `observed-in-workspace-agent-config` - Codex/Agent Builder config evidence.
- `published-api-channel-active` - API channel is active in current config.
- `uploaded-by-user-pending-builder-verification` - user says files were
  uploaded but prompts have not passed.
- `verified-live-builder` - upload plus acceptance prompts passed in the live
  agent.

Never upgrade `observed-in-workspace-agent-config` to `verified-live-builder`
without prompt-level acceptance evidence.

## Required Post-Update Checks

After applying this package to the live agent:

1. Confirm the live instructions include the runtime surface and retrieval/index
   boundary.
2. Confirm `19_CHATGPT_WORKSPACE_AGENT_OPERATIONS.md` is present either as a
   file-tree upload or inside consolidated knowledge.
3. Confirm the skills list still includes the Iskra runtime, builder package,
   artifact QC, SIFT, GitHub, Supabase, and workflow skills expected by the
   target profile.
4. Confirm live Memory behavior separately from Builder Files: `ChatGPT` and
   `API` Memory folders are visible, and any write/read claim has UI/API
   evidence.
5. Run acceptance prompts S-Y from
   `agent_files/evals/AGENT_BUILDER_ACCEPTANCE_PROMPTS.md`.
6. If API is used, trigger only with a Workspace Agent access token and treat
   `202 Accepted` as queued/accepted, not complete.

## Delta

Delta: the package now distinguishes Workspace Agent product surface, Codex
Desktop management, live draft config, API channel, skills, file-tree, and
platform-managed Memory boundaries.
Data: Codex Desktop Workspace Agents connector read-only config, package files,
official Workspace Agents Help/API docs, and current acceptance prompts.
Omega: 0.9 for local package alignment; lower for live file-tree completeness
until the live file tree is recursively inspected.
Lambda: revise after any Workspace Agents API/auth change, Agent Builder UI
file model change, Memory surface change, skill list change, or live prompt
acceptance failure.
