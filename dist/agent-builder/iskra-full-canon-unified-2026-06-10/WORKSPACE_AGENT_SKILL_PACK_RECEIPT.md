# Workspace Agent Skill Pack Receipt

Generated: 2026-06-27T14:05:00Z
Mode: local package inspection plus read-only Workspace Agent config comparison
Target package: `iskra-full-canon-unified-2026-06-10`

## Context

The user added the Iskra skill pack under:

```text
skills/iskra-toolchain-bridge/agent skill/iskra-skill-pack-builder-2026-06-25/
```

This tree is intentional package content for ChatGPT Workspace Agent uploaded
skills. It is not a cache, not `.venv`, and not transient test output.

## Finding / Decision

[FACT] The package skill pack contains 32 skill directories under
`skills/hermes/`.

[FACT] The read-only Workspace Agent draft config for `Искра vΩ.7` reported 33
uploaded skills total.

[FACT] The package skill directory names match the 32 observed live Iskra
skill-pack names. The remaining live skill, `iskra-toolchain-bridge`, is a
separate user-uploaded bridge skill.

[DECISION] Include this skill pack in `MANIFEST.sha256` and the clean export
zip as an intentional Workspace Agent skill source layer.

[DECISION] Keep skill source packaging separate from live Agent Builder skill
activation. A skill directory in this package does not prove that the live
Workspace Agent has that exact bytes/version unless Agent Builder/Codex config
or skill-file inspection verifies it.

## Package Skill Names

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

## Evidence

Local inspection:

- package skill directories: 32
- files in skill pack: 155
- extension profile: `.md`, `.yaml`, `.svg`, `.py`, `.txt`, `.sha256`
- root manifest: `skills/iskra-toolchain-bridge/agent skill/iskra-skill-pack-builder-2026-06-25/MANIFEST.sha256`

Live config comparison:

- observed live uploaded skill count: 33 total
- observed live Iskra skill-pack count: 32
- missing from package vs live names: 0
- extra package names vs live names: 0

## Risk

- Skill names matching does not prove byte-identical live skill contents.
- Skill upload, replacement, removal, or publish is a live Workspace Agent
  mutation and requires explicit approval.
- Public package files should not include access tokens, OAuth credentials,
  cookies, connector secrets, or Workspace Agent access tokens.

## Next

1. Include this skill pack in the package manifest and clean zip.
2. Run a secret scan over the skill pack.
3. If live parity is required, list/read each attached skill through the
   Workspace Agents connector and compare content hashes or file inventories.
4. Only after explicit approval, upload/replace skills in the live Agent
   Builder draft and publish if requested.

## Status

`packaged-skill-source`; `observed-in-workspace-agent-config`;
`verified-live-builder` not claimed.

## Delta

Delta: user-added Iskra skills are promoted to an intentional package layer.
Data: local skill-pack inventory, Workspace Agents config skill names.
Omega: 0.92 for name/count alignment; 0.55 for live byte parity until
skill-file inspection is performed.
Lambda: refresh after any skill upload/removal, skill-pack rebuild, or live
Workspace Agent publish.
