# 2026-06-27 - Workspace Agent Live Alignment

## Added

- Added `19_CHATGPT_WORKSPACE_AGENT_OPERATIONS.md` with ChatGPT Workspace
  Agents, Codex Desktop, skills, files, and API channel boundaries.
- Added a redacted `WORKSPACE_AGENT_LIVE_CONFIG_RECEIPT.md` from read-only
  Codex Desktop Workspace Agents config inspection.
- Added ADR `adr_20260627_workspace_agent_live_alignment.md`.

## Changed

- Clean export tooling now treats `SURFACE_INVENTORY.json` as a dynamic ZIP
  receipt while keeping it out of `MANIFEST.sha256`.
- Consolidated knowledge mapping now includes the Workspace Agent operations
  boundary and this ADR.
- Acceptance scope extends to Workspace Agent config and Codex Desktop draft
  update boundaries.

## Boundary

This update does not mutate or publish the live Workspace Agent. It prepares
the local package and receipts for an approved Workspace Agent update.
