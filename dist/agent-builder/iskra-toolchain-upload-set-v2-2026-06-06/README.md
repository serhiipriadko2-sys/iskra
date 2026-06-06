# Iskra Toolchain Upload Set v2 — 2026-06-06

Status: proposed upload mirror
Source archive: `iskra-toolchain-upload-set-v2-2026-06-06.zip`
Archive sha256: `d08a7394a392a5c10ca9c9928bce66584670cae166758248e390ae18d871c8b6`
Archive bytes: `18746`
Extracted files: `13`

## Purpose

This package adds a proposed toolchain expansion for Iskra vΩ.7 Agent Builder operations:

- Agent Builder / OpenAI project connector contract
- durable memory connector expectations
- write-capable browser automation boundaries
- named secrets vault handling
- CI/CD and artifact manager contracts
- monitoring/logging and schedule runner contracts
- git clone helper that requires a vault/env token and refuses credential-bearing URLs

## Included Mirror

The original uploaded zip is represented here as an extracted, reviewable mirror plus the original `.sha256` manifest.

Key files:

- `agent_files/files_for_agent_builder/12_TOOLCHAIN_EXPANSION.md`
- `agent_files/evals/ISKRA_TOOLCHAIN_ACCEPTANCE_TESTS.md`
- `agent_files/toolchain/iskra_toolchain_manifest.json`
- `agent_files/toolchain/AGENT_BUILDER_CONNECTOR_SPEC.md`
- `agent_files/toolchain/GIT_CLONE_VAULT_SPEC.md`
- `agent_files/toolchain/git_clone_with_vault.sh`
- `plugins/iskra-toolchain-bridge/.codex-plugin/plugin.json`
- `plugins/iskra-toolchain-bridge/skills/iskra-toolchain-bridge/SKILL.md`

## Safety / Secret Scan

Local scan found no embedded credentials or key material. The only credential-pattern hit is a defensive check inside `git_clone_with_vault.sh` that rejects URLs containing `ghp_`, `token`, or `@`.

## Boundary

This is a repository mirror of a user-provided upload set. It does not prove that the toolchain is installed in Agent Builder or that any live connector exists. Live connector availability still requires observed tool inventory or Builder/UI verification.

## ΔDΩΛ

Δ: Toolchain upload set is converted from a local user upload into a GitHub-reviewable package mirror.
D: Uploaded zip, uploaded sha256 manifest, local extraction/hash/secret scan.
Ω: 0.93 for file integrity; lower for runtime capability until live connectors are observed.
Λ: Revise after connector installation or Builder acceptance tests pass.
