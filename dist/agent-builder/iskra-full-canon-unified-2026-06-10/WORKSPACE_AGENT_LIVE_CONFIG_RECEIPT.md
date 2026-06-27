# Workspace Agent Live Config Receipt

Generated: 2026-06-27T14:30:00Z
Observed via: Codex Desktop Workspace Agents connector
Mode: read-only config inspection
Target package: `iskra-full-canon-unified-2026-06-10`

## Context

The user identified the active editor URL as a ChatGPT Workspace Agent in
Agent Builder / Agents Studio and asked to adapt this package for that surface.
The local package must stay separate from the live Workspace Agent draft until
an explicit update/publish action is approved.

## Finding / Decision

[FACT] A current editable Workspace Agent draft was observed for
`Искра vΩ.7`.

[FACT] The agent is published and has an active API channel.

[FACT] The live draft has GitHub, Ace Knowledge Graph, Remote Desktop
Commander, and Supabase app access, per-user persistent folder state, and 33
uploaded skills.

[FACT] The user-provided Agent Builder screenshot for this target shows `269`
files in the Files section. The connector exposed a file-tree handle, but
recursive file listing failed in this run with an HTML transport error.

[DECISION] This package now treats ChatGPT Workspace Agents as the primary UI
target, Codex Desktop as a management surface, and the Agents SDK fallback as a
separate code-first fallback. It does not claim that local package files are
already present in the live file tree.

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
| reasoning effort | `xhigh` |
| attached apps | GitHub, Ace Knowledge Graph, Remote Desktop Commander, Supabase |
| app write approvals | mixed by connector; refresh live config before any write |
| file tree | observed, exact ID redacted; screenshot shows 269 files |
| attached skills | 33 uploaded skills |

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
- The full live file tree was not recursively enumerated in this receipt; the
  `269` file count is screenshot/UI evidence plus a connector file-tree handle,
  not a byte-level inventory.
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
   and `ZIP_RECEIPT.json`.
3. After user approval, compare the live draft instructions and file tree with
   the package, then stage/update only the exact requested Workspace Agent
   fields.
4. Run live acceptance prompts S-X before claiming `verified-live-builder`.

## Status

`observed-in-workspace-agent-config`; `published-api-channel-active`;
`packaged-as-upload-set` pending fresh clean zip regeneration;
`verified-live-builder` not claimed.

## Delta

Delta: live Workspace Agent config is now represented as a redacted package
receipt.
Data: Codex Desktop Workspace Agents connector output, local package files,
Workspace Agent API boundary docs.
Omega: 0.88 for config fields observed in this run; 0.55 for live file-tree
content parity until the file tree is enumerated.
Lambda: refresh after any publish, draft edit, skill upload/removal, file
upload/removal, app/tool permission change, API channel change, or Slack
deployment change.
