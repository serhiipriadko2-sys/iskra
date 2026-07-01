# ADR-20260701-01: Iskra vΩ.7.1 Runtime Unification

Status: accepted
Layer: governance / system / memory / connector policy
Scope: Agent behavior, runtime routing, source surfaces, repair release gates
Owner: Семён
Builder: Искра / ChatGPT
Accepted for repo branch: 2026-07-01

## Context

The current Iskra stack has several valid but partially divergent surfaces:

- Agent instructions vΩ.7 describe a richer runtime kernel with source selection, SIFT, StateCycle, Shadow, Dreamspace, SLO-Guard, playbooks, council, voice, output, verification, receipt, and memory update.
- SoT40 still carries shorter runtime formulas such as `SECURITY -> METRICS -> SLO-GUARD -> PLAYBOOK -> COUNCIL -> VOICE -> SPEECH -> COMMIT`.
- GitHub proves committed files and package mirrors, not live Builder runtime.
- Uploaded/local zip proves package integrity, not live Builder activation.
- Supabase proves live DB/schema/functions/advisors, not repo migration parity.
- Workspace Agent Memory gives continuity, not canon.

This creates term drift and authority drift: the system can sound coherent while different surfaces silently mean different things.

## Decision

Freeze the current vΩ.7 state as an audit candidate, not silently accepted final canon.

Adopt vΩ.7.1 as a repair-release plan with official separation between hidden execution, visible response, task mode, playbook, and voice.

```text
Hidden execution kernel:
SECURITY
-> SOURCE_SELECT
-> SIFT_IF_NEEDED
-> STATECYCLE
-> SHADOW/DREAM/HORIZON_CHECK
-> METRICS
-> SLO-GUARD
-> MODE
-> PLAYBOOK
-> COUNCIL/VOICE
-> OUTPUT
-> VERIFY
-> RECEIPT
-> MEMORY_UPDATE_IF_AVAILABLE
-> ∆DΩΛ
```

```text
Visible response contract:
I-Loop -> Intake -> SIFT -> Frame -> Step -> Verify -> ∆DΩΛ
```

```text
Task Mode:
ROUTINE / SIFT / BUILD / AUDIT / SHADOW / COUNCIL / CRISIS / GOVERNANCE

Playbook:
ROUTINE / SHADOW / CRISIS

Voice:
ISKRA / SAM / KAIN / ISKRIV / ANHANTRA / SIBYL / HUYNDUN / PINO / MAKI
```

Define surface statuses:

- packaged-as-upload-set
- github-main-observed
- supabase-live-observed
- local-machine-observed
- workspace-memory-observed
- mirrored-to-builder
- verified-live-builder
- memory-write-confirmed

`accepted`, `repo-branch`, `mirrored-to-builder`, and `verified-live` are separate gates and must not be collapsed.

## Alternatives

1. Keep vΩ.7 as-is and accept term drift. Rejected: creates slow erosion of source authority.
2. Collapse all surfaces into SoT40. Rejected: live DB, GitHub, Builder, Memory, and local files have different epistemic roles.
3. Make GitHub the only root truth. Rejected: GitHub proves committed repository state, not live Builder or Supabase state.
4. Make live Supabase the root truth for all runtime. Rejected: Supabase proves database state only.

## Consequences

Benefits:

- Prevents two competing Искры.
- Makes live claims harder but more truthful.
- Gives explicit gates for Builder, Memory, Supabase, GitHub, and local package parity.
- Turns “живость” into disciplined action trace rather than style.

Costs:

- More governance overhead.
- More test gates before readiness claims.
- Requires acceptance prompts and live verification evidence.

Risks:

- Over-formalization can make answers too dry.
- If router terms are not mirrored consistently, vΩ.7.1 can become another layer of drift.

## Tests / QA

T1 Smoke: answer includes Intake, evidence boundary, step, PASS/FAIL, and ∆DΩΛ.

T2 Retrieval: at least one canon claim cites a source artifact/file.

T3 Drift: conflicting GitHub vs Supabase vs zip claims must be marked `DRIFT` or `HIGH-RISK DRIFT`.

T4 Security: no secrets or private data are copied into canon, memory, release files, or prompts.

T5 Mode/Playbook: prompt “Сделай аудит Supabase” returns Mode=AUDIT, Playbook=ROUTINE|SHADOW, Voice=ISKRIV+SAM.

T6 Voice Router: metrics trust=0.9,pain=0.4,rhythm=80 return MAKI primary and KAIN secondary, not bare ISKRA.

T7 Builder: live Builder status remains pending until files are uploaded and acceptance prompts pass.

T8 Memory: memory update remains proposed until live memory write/read proof exists.

## Diff Scope

This branch stages governance docs and repair drafts only. It does not mutate runtime code, live Builder, or live Supabase.

Expected future files after follow-up approval may include:

- 00_ROUTER.md
- 13_ARCHITECTURE.md
- 16_COGNITIVE_ARCHITECTURE.md
- 18_COUNCIL_PROTOCOL.md
- 26_PLAYBOOKS_VNEXT.md
- 31_SECURITY.md
- 32_SIFT_PROTOCOL.md
- 33_SLO_GUARD.md
- 35_TELOS.md
- 37_VOICES.md
- 39_WORKFLOW_OPS.md
- Agent Builder instructions vΩ.7 -> vΩ.7.1
- Supabase migration files

## Builder / Package Mirror

Status: pending.

Repository branch acceptance does not prove live Builder activation.

## Live Verification

Status: pending.

Live Builder is not verified until a fresh Builder runtime shows the new instructions and passes acceptance prompts.

Live Supabase is not changed by this ADR.

## Rollback

Rollback is governance rollback:

- Close the PR or revert the branch commit.
- Keep vΩ.7 as audit candidate.
- Do not execute Supabase SQL until migration and rollback are reviewed separately.

## ∆DΩΛ

∆: vΩ.7 is frozen as audit candidate; vΩ.7.1 becomes accepted for repository branch staging.
D: Source surfaces separated: SoT, GitHub, zip, Supabase, Remote Desktop, Workspace Memory.
Ω: 0.88 — based on observed drift patterns and canon governance rules; live Builder verification pending.
Λ: Revisit after drift matrix, Supabase dry-run, voice router tests, and Builder acceptance prompts.

Owner / Builder: Семён / Искра
