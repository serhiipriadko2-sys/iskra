# iskraSpace Post-Merge Verification

Status: PARTIAL / REMOTE DEPLOY FAILURES OPEN / NO LIVE MUTATION
Captured: 2026-06-07T16:52:26+03:00
Scope: post-merge release gate for `runtime/iskraSpace`
Branch: `codex/iskra-post-merge-supabase-baseline`
Observed main HEAD: `17056d685864428b2134c4dde630b296090410fd`

## Summary

PR #195 is merged and local `HEAD` matches `origin/main`, but the release gate is
not green. Public GitHub checks on merge commit `17056d6` show two successes and
two Google Cloud failures. The Google Cloud summaries show build and push
succeeded, while deploy failed.

This document records the current post-merge status and the repo-side repair for
the Cloud Run ingress port contract. It does not mutate live Google Cloud or
Supabase state.

## GitHub Status

Public GitHub API read for PR #195:

- PR number: `195`.
- State: `closed`.
- Merged: `true`.
- Merge commit: `17056d685864428b2134c4dde630b296090410fd`.

Check-runs observed on `17056d685864428b2134c4dde630b296090410fd`:

| Check | Status | Conclusion |
| --- | --- | --- |
| `ingest-stage-checks` | completed | success |
| `hash-check` | completed | success |
| `rmgpgab-iskra-europe-west1-serhiipriadko2-sys-iskra--maraw (artful-striker-476211-h4)` | completed | failure |
| `cloudrun-iskra-git-europe-west8-serhiipriadko2-sys-iskra-mcnh (artful-striker-476211-h4)` | completed | failure |

Google Cloud check summaries:

- `rmgpgab...`: `Build` success, `Push` success, `Deploy` failure.
- `cloudrun...`: `Pull` success, `Build` success, `Push` success, `Deploy` failure.

## Cloud Run Port Contract Repair

Evidence:

- Current `Dockerfile` previously exposed `80` and healthchecked
  `http://localhost:80/`.
- Current `nginx.conf` previously listened on `80`.
- Google Cloud Run container contract states the ingress container must listen
  on the configured request port, defaulting to `8080`, and Cloud Run injects
  `PORT`.
- The observed remote failure is deploy-stage, not build-stage.

Repo-side repair:

- `nginx.conf` now listens on `0.0.0.0:8080`.
- `Dockerfile` now exposes `8080`.
- `Dockerfile` healthcheck now probes `http://localhost:8080/health`.
- `docker-compose.yml` now maps `3000:8080` and healthchecks `8080`.

## Verification

Local verification after the port repair:

- `docker build -t iskra-space-cloudrun-port-check:2026-06-07 .` passed.
- Temporary container on host port `18082` mapped to container port `8080`
  returned:
  - `/`: HTTP `200`, bytes `9762`, app root div present.
  - `/health`: HTTP `200`, body `healthy`.

## Residual Risk

- The exact Google Cloud deploy stderr is not available through the public
  GitHub check summary. The port-contract diagnosis is an evidence-backed
  inference from the deploy-stage failure plus the previous image port.
- Remote Google Cloud checks must pass after this branch is pushed before the
  release gate can be marked green.
- This repair does not close Supabase live-function drift or credential owner
  classification.

## Delta Receipt

Delta: post-merge status moved from PR-head green to merge-commit partial because
Google Cloud deploy checks are red.

D: public GitHub PR/check APIs, Docker/nginx files, official Cloud Run container
contract, local Docker build and container smoke.

Omega: 0.89 for local port repair and smoke; 0.74 for remote deploy root cause
until Google Cloud deploy logs or a passing rerun confirm it.

Lambda: revise if Google Cloud deploy fails again after the `8080` repair or if
the Cloud Run service is explicitly configured to send traffic to another port.

