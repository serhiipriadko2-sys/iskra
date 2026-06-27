# Workspace Agent Live Config Receipt

Generated: 2026-06-27T16:08:44Z
Observed via: Codex Desktop Workspace Agents connector
Mode: config inspection plus approved live file-overlay publish
Target package: `iskra-full-canon-unified-2026-06-10`

## Context

The user identified the active editor URL as a ChatGPT Workspace Agent in
Agent Builder and asked to adapt this package for that surface.
The local package must stay separate from the live Workspace Agent draft until
an explicit update/publish action is approved. The user later explicitly
approved updating the live Workspace Agent.

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

[FACT] On 2026-06-27, two new ordinary files were uploaded into the Workspace
Agent file tree and then published as version 51:
`2026-06-27-instructions-full.md` and
`2026-06-27-official-platform-and-memory-boundary.md`. Both files were
readable through the Workspace Agents connector before publish. The published
file-tree revision observed after the upload was `1147`.

[FACT] A post-publish immutable `version_id` file-tree query returned
`tree_revision=1147` but did not enumerate child nodes. Therefore published
file overlay status is based on draft file read evidence plus the version 51
publish output using that file-tree revision, not on direct byte-level published
node enumeration.

[FACT] Attempts to update the main agent instructions, profile details, and
API-channel instructions through the Workspace Agents connector failed with
`Workspace Agents draft save request failed`. Therefore live published version
51 has the updated file overlay, but the main prompt remains stale.

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
| latest published version | `agtv_6a3ff537...5d7e` |
| published version number | `51` |
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
| file tree | observed, exact ID redacted; screenshot shows 269 files before overlay; draft depth=1 metadata after overlay showed tree revision `1147`; immutable version query returned revision only |
| attached skills | 33 uploaded skills |
| prompt alignment | live prompt remains stale; file overlay was published, but prompt save failed |
| published overlay files | `2026-06-27-instructions-full.md`; `2026-06-27-official-platform-and-memory-boundary.md` |

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
- Direct immutable published-version node enumeration did not return child
  nodes in this run; do not claim byte-level published file parity.
- The live Workspace Agent Memory tree was not recursively enumerated or
  write-tested. Package `agent_files/memory_*` files and Builder file uploads
  are not proof of live Memory contents.
- The live prompt is not yet aligned with the updated local package
  instructions. Approval exists, but connector draft-save calls for prompt,
  profile, and API-channel updates failed in this run. Use Builder UI or a
  repaired Workspace Agents save path to apply the prompt bootstrap later.
- `Files` count and `Память` contents are separate surfaces and must be
  verified separately.
- A published API channel proves trigger availability, not task completion.
- Operational IDs are stable handles and are redacted here. Tokens and secrets
  were not requested, stored, or printed.
- Draft edits, file uploads, skill changes, app changes, API channel changes,
  Slack deployment changes, and publish actions are live Workspace Agent
  mutations and require explicit approval.

## Next

1. Treat published version 51 as a partial live update: file overlay is live;
   prompt parity is still blocked.
2. Use Builder UI, a repaired `update_agent_instructions` path, or another
   verified Workspace Agents save path to apply the prompt bootstrap.
3. Regenerate consolidated knowledge, manifest, surface inventory, clean zip,
   and `ZIP_RECEIPT.json` after this corrective receipt update.
4. Run live acceptance prompts S-Y and a separate Memory write/read check before
   claiming `verified-live-builder` or live Memory parity.

## Status

`observed-in-workspace-agent-config`; `published-api-channel-active`;
`published-file-overlay-version-51`; `live-prompt-save-blocked`;
`live-draft-prompt-stale-vs-local-package`;
`packaged-as-upload-set` pending fresh clean zip regeneration;
`verified-live-builder` not claimed.

## Delta

Delta: live Workspace Agent config is now represented as a redacted package
receipt, with live Memory separated from Builder Files, a published file
overlay recorded, and live prompt drift explicitly preserved.
Data: Codex Desktop Workspace Agents connector output, local package files,
Workspace Agent API boundary docs, upload/read/publish evidence for version 51.
Omega: 0.9 for config fields observed in this run; 0.72 for published overlay
file presence after draft connector read plus version 51 publish output, with
immutable node listing incomplete; 0.55 for Memory content parity until
separately enumerated or tested; 0.35 for live prompt parity because prompt
save failed.
Lambda: refresh after any publish, draft edit, skill upload/removal, file
upload/removal, Memory write/read claim, app/tool permission change, API channel
change, or Slack deployment change.
