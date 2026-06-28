# Workspace Agent Upload Plan

Status: approval-required plan, not executed
Target candidate: Iskra vOmega.7 / agt_6a3aba552aa88191bea3f91d79a4d24f

## Boundary

This package is local. Do not upload files, replace instructions, change skills,
change apps, change API/Slack channels, or publish without explicit approval for
the exact live agent target.

## Minimal Live Sequence

1. Refresh current draft config and API channels through Workspace Agents
   connector or Builder UI.
2. Verify the intended agent id and name.
3. Upload the clean package or selected compact files according to current
   Builder file limits.
4. Replace main instructions only after confirming the exact prompt text.
5. Publish only after a separate explicit publish approval.
6. Run acceptance prompts A-Y plus C2/C3.
7. Verify Memory behavior separately with write/read evidence.
8. Record live receipt with status labels, not broad completion claims.

## Required Non-Claims

- Do not claim `verified-live-builder` before live prompt-level evidence.
- Do not claim live Memory parity from package files.
- Do not claim API task completion from `202 Accepted`.
- Do not store access tokens or secrets in the package.

Delta: live mutation path is separated from package build.
Data: Workspace Agent docs, current package receipts, read-only config evidence.
Omega: 0.84 until live update tools are refreshed.
Lambda: revise before any upload, publish, skill change, Memory test, or API run.
