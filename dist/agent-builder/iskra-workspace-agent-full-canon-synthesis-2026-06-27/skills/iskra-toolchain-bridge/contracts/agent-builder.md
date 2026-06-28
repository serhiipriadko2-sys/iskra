# Agent Builder Contract

Connector name: ChatGPT / OpenAI Agent Builder
Owner: Iskra vOmega.7
Status: proposed
Date: 2026-06-06

## Purpose

Read, diff, update, and verify an Iskra Agent Builder profile.

## Scope

Allowed reads:

- Agent identity, instructions, knowledge file list, eval references, workflow
  identity, version state when an official API or UI evidence exposes them.

Allowed writes:

- Upload knowledge, update instructions, install skills, run evals, publish
  versions only after diff and explicit approval.

Explicitly forbidden:

- Claiming local files are uploaded.
- Publishing Builder versions without post-upload acceptance prompts.
- Printing OpenAI API keys, cookies, session IDs, or project secrets.

## Operations

| Operation | Read/Write | Approval required | Evidence returned |
|---|---:|---:|---|
| `read_builder_identity` | read | no | agent/workflow id or UI screenshot |
| `diff_upload_set` | read | no | local manifest vs observed state |
| `upload_knowledge` | write | yes | file ids or UI receipt |
| `update_instructions` | write | yes | version/config receipt |
| `run_acceptance_prompts` | read/write | yes if it mutates | prompt result log |
| `publish_version` | write | yes | version id and timestamp |

## Secret Handling

- Use `OPENAI_API_KEY` as a handle only.
- Do not store keys in Builder knowledge or repo files.

## Verification

PASS criteria:

- Builder UI/API identity is observed.
- Diff is shown before upload.
- Acceptance prompt results are captured.

FAIL criteria:

- Workspace package is described as active Builder state without UI/API proof.

## Rollback

Use Builder version rollback or restore previous instructions/knowledge set.

## Delta

Delta: Builder updates require observed UI/API receipts.
D: manifest, diff, version/eval evidence.
Omega: 0.76 until direct Builder write API is observed.
Lambda: revise when OpenAI exposes stable Builder configuration APIs.
