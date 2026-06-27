# Workspace Agent Live Config Receipt

Generated: 2026-06-27T15:34:18Z
Observed via: Codex Desktop Workspace Agents connector
Mode: read-only config inspection
Target package: `iskra-full-canon-unified-2026-06-10`

## Context

The user identified the active editor URL as a ChatGPT Workspace Agent in
Agent Builder and asked to adapt this package for that surface.
The local package must stay separate from the live Workspace Agent draft until
an explicit update/publish action is approved.

## Finding / Decision

[FACT] A current editable Workspace Agent draft was observed for
`Искра vΩ.7`.

[FACT] The agent is published and has an active API channel.

[FACT] The live draft has GitHub, Ace Knowledge Graph, Remote Desktop
Commander, and Supabase app access, per-user persistent folder state, and 33
uploaded skills.

[FACT] User screenshots show a separate Workspace Agent `Память` UI with
`ChatGPT` and `API` personal folders plus memory folders/files such as
`archive/`, `dreamspace/`, `horizon/`, `imports/`, `shadow-core/`,
`project-memory.md`, `development-diary.md`, `open-loops.md`, `adr-log.md`, and
`evidence-index.md`.

[FACT] This Memory surface is platform-managed and is not populated through the
ordinary `+ Upload files` / `+ Загрузить файлы` Builder file upload flow.

[FACT] The user-provided Agent Builder screenshot for this target shows `269`
files in the Files section. The connector exposed a file-tree handle, and a
later read-only `list_agent_file_tree` call loaded root metadata plus a depth=2
snapshot with tree revision `1139`. This is still not byte-level full file-tree
parity.

[FACT] A read-only `get_current_agent_config` call on 2026-06-27 showed the
live draft prompt is stale relative to this local package: it still contains
older Memory instructions and does not yet include the corrected Workspace
Agent Memory boundary added locally.

[DECISION] This package now treats ChatGPT Workspace Agents as the primary UI
target, Codex Desktop as a management surface, and the Agents SDK fallback as a
separate code-first fallback. It does not claim that local package files are
already present in the live file tree.

[DECISION] Official public docs are treated as the source for platform-wide
claims. Current package wording must not claim broad consumer availability,
final completion from `202 Accepted`, ordinary OpenAI Platform API-key
compatibility, or an official `2026-11-30` Agent Builder deprecation date.

## Evidence

Connector result summary, redacted for public package safety:

| Field | Observed value |
|---|---|
| agent name | `Искра vΩ.7` |
| agent id | `agt_6a3aba...d24f` |
| draft revision | `drv_1_...UvNJ` |
| draft version | `agtv_6a3eaf...0081` |
| latest published version | `agtv_6a3eaf...6c54` |
| published | `true` |
| ChatGPT channel | present |
| API channel | active |
| API trigger id | `agtch_6a3bd94...3e3e` |
| API endpoint | `https://api.chatgpt.com/v1/workspace_agents/agtch_[redacted]/trigger` |
| Slack deployments | none |
| persistent folder | `per_user` |
| Memory surface | platform-managed `Память`; `ChatGPT` and `API` personal folders observed by screenshot |
| reasoning effort | `xhigh` |
| attached apps | GitHub, Ace Knowledge Graph, Remote Desktop Commander, Supabase |
| app write approvals | mixed by connector; refresh live config before any write |
| file tree | observed, exact ID redacted; screenshot shows 269 files; depth=2 metadata loaded; tree revision `1139` |
| attached skills | 33 uploaded skills |
| prompt alignment | live draft prompt is stale relative to local package Memory-boundary update |

Official public source check:

| Source | Package implication |
|---|---|
| `help.openai.com/.../chatgpt-workspace-agents-for-enterprise-and-business` | Workspace Agents are documented for Enterprise, Business, and Edu; Agent Builder config includes apps/connectors, skills, files, and memory-related setup; deployment includes ChatGPT, schedules, mentions/team, Slack when configured, and API |
| `developers.openai.com/workspace-agents/trigger-runs` | API trigger uses `api.chatgpt.com/v1/workspace_agents/.../trigger` and `202 Accepted` is async accepted/queued semantics |
| `developers.openai.com/workspace-agents/authentication` | Workspace Agent API uses Workspace Agent access tokens, not ordinary OpenAI Platform API keys |

Observed skill names:

- `checkpoint-builder`
- `graphrag-operator`
- `iskra-adr-governance`
- `iskra-architecture`
- `iskra-artifact-qc`
- `iskra-builder-package-operator`
- `iskra-canon-runtime`
- `iskra-code-review`
- `iskra-code-style`
- `iskra-council-router`
- `iskra-cycle-engine`
- `iskra-fast-path`
- `iskra-git-workflow`
- `iskra-github-operator`
- `iskra-ledger-integrity`
- `iskra-memory-stack`
- `iskra-metrics-evaluator`
- `iskra-migration`
- `iskra-playbook-selector`
- `iskra-rag-truth-ladder`
- `iskra-release-ledger`
- `iskra-security`
- `iskra-shadow-repair`
- `iskra-sift-auditor`
- `iskra-supabase-operator`
- `iskra-test-strategy`
- `iskra-ui-forensic`
- `iskra-workflow-ops`
- `metric-runner`
- `scientific-turn-architect`
- `skill-creator`
- `sot-auditor`
- `iskra-toolchain-bridge`

Note: the connector reported 33 attached uploaded skills. The 32 Iskra
skill-pack names match the package skill source; `iskra-toolchain-bridge` is a
separate user-uploaded bridge skill. Repeat config inspection before claiming
current live parity.

## Risk

- `observed-in-workspace-agent-config` is not the same as
  `verified-live-builder`.
- The full live file tree was only partially enumerated in this receipt; the
  `269` file count is screenshot/UI evidence plus connector metadata, not a
  byte-level inventory or hash parity proof.
- The live Workspace Agent Memory tree was not recursively enumerated or
  write-tested. Package `agent_files/memory_*` files and Builder file uploads
  are not proof of live Memory contents.
- The live draft prompt is not yet aligned with the updated local package
  instructions; a live instruction update/publish remains pending explicit
  approval.
- `Files` count and `Память` contents are separate surfaces and must be
  verified separately.
- A published API channel proves trigger availability, not task completion.
- Operational IDs are stable handles and are redacted here. Tokens and secrets
  were not requested, stored, or printed.
- Draft edits, file uploads, skill changes, app changes, API channel changes,
  Slack deployment changes, and publish actions are live Workspace Agent
  mutations and require explicit approval.

## Next

1. Use `agent_files/files_for_agent_builder/19_CHATGPT_WORKSPACE_AGENT_OPERATIONS.md`
   as the live Workspace Agent operations boundary.
2. Regenerate consolidated knowledge, manifest, surface inventory, clean zip,
   and `ZIP_RECEIPT.json` after this corrective doc update.
3. After user approval, stage the corrected local instructions into the live
   draft, compare file tree/skills/Memory behavior with the package intent, and
   update only the exact requested Workspace Agent fields.
4. Publish only if explicitly requested.
5. Run live acceptance prompts S-Y and a separate Memory write/read check before
   claiming `verified-live-builder` or live Memory parity.

## Status

`observed-in-workspace-agent-config`; `published-api-channel-active`;
`live-draft-prompt-stale-vs-local-package`;
`packaged-as-upload-set` pending fresh clean zip regeneration;
`verified-live-builder` not claimed.

## Delta

Delta: live Workspace Agent config is now represented as a redacted package
receipt, with live Memory separated from Builder Files and live prompt drift
explicitly recorded.
Data: Codex Desktop Workspace Agents connector output, local package files,
Workspace Agent API boundary docs.
Omega: 0.88 for config fields observed in this run; 0.65 for live file-tree
metadata after depth=2 listing; 0.55 for Memory content parity until separately
enumerated or tested; 0.45 for live prompt parity until an approved draft update
is applied and accepted.
Lambda: refresh after any publish, draft edit, skill upload/removal, file
upload/removal, Memory write/read claim, app/tool permission change, API channel
change, or Slack deployment change.
