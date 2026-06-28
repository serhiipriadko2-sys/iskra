# Iskra Workspace Agent Full Canon Synthesis

Status: packaged-as-upload-set
Generated: 2026-06-27T19:27:47Z
Target package: `iskra-workspace-agent-full-canon-synthesis-2026-06-27`

This package is the local, reproducible synthesis of `canon.zip` and
`agent_files.zip` for ChatGPT Workspace Agents. It is not a live Workspace
Agent mutation and it is not `verified-live-builder`.

## Contents

- `agent_files/canon_source_files/` is the immutable canon source mount from
  `canon.zip` (86 files).
- `agent_files/` also contains Workspace Agent instructions, consolidated
  knowledge, evals, memory seed/current reference files, templates, toolchain
  docs, and live-update receipts from `agent_files.zip`.
- Root runtime surfaces include `agent_runtime_tools/`, `plugins/`, `skills/`,
  `tests/`, `tools/`, derived `canon/horizon/`, and supplemental `agents-sdk/`.
- Research, gap analysis, what-if matrix, upload plan, manifest, surface
  inventory, and zip receipts are included as separate proof layers.

## Proof Boundary

Local package parity and clean zip readiness do not prove the same files are
uploaded, indexed, or behaviorally active in ChatGPT Workspace Agent. Live
mutation requires explicit approval and a separate Builder/Workspace Agent
receipt.

Delta: package-first synthesis created with separated canon, operational, and
supplemental surfaces.
Data: canon.zip, agent_files.zip, current committed package, official OpenAI
Workspace Agent docs.
Omega: 0.88 for local assembly before live Builder acceptance.
Lambda: revise after any package source change, Workspace Agent publish, file
tree enumeration, Memory write/read claim, or API/auth documentation change.
