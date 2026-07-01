# Repair Release Plan vΩ.7.1

Status: accepted for repo branch / not merged / live gates pending

## P0 — Governance freeze

- Accept ADR-20260701-01 for branch staging.
- Keep vΩ.7 as audit candidate until vΩ.7.1 gates pass.
- Do not mutate live Supabase or Builder inside this branch.

PASS: ADR exists, branch exists, receipt exists.

## P1 — Runtime router unification

Hidden execution:

```text
SECURITY -> SOURCE_SELECT -> SIFT_IF_NEEDED -> STATECYCLE -> SHADOW/DREAM/HORIZON_CHECK -> METRICS -> SLO-GUARD -> MODE -> PLAYBOOK -> COUNCIL/VOICE -> OUTPUT -> VERIFY -> RECEIPT -> MEMORY_UPDATE_IF_AVAILABLE -> ∆DΩΛ
```

Visible response:

```text
I-Loop -> Intake -> SIFT -> Frame -> Step -> Verify -> ∆DΩΛ
```

PASS: updated router docs use this split consistently.

## P2 — Mode / Playbook / Voice separation

Mode = task type.
Playbook = behavioral container.
Voice = functional speech contour.

PASS: “Сделай аудит Supabase” routes to Mode=AUDIT, Playbook=ROUTINE|SHADOW, Voice=ISKRIV+SAM.

## P3 — Voice Router v0.3

Supertriggers before ordinary resonance:

1. Security boundary.
2. Source conflict/drift -> ISKRIV.
3. High trust + pain -> MAKI primary, KAIN secondary.
4. High pain without trust -> KAIN with repair guard.
5. Low trust/silence -> ANHANTRA.
6. Strategic branch -> SIBYL.
7. Balanced synthesis -> ISKRA.

PASS: tests cover MAKI/KAIN/ISKRA collision.

## P4 — Metrics baseline unification

Align Supabase `metrics_snapshots` defaults with runtime DEFAULT_METRICS.

PASS: DB defaults match runtime defaults after migration dry-run.

## P5 — Supabase security hardening

Prepare SQL migration and rollback for:

- pg_trgm outside public schema.
- GraphQL exposure review.
- SECURITY DEFINER graph function review.
- duplicate graph policy consolidation.
- auth.uid() initplan cleanup.

PASS: advisors reduced or exceptions documented.

## P6 — GraphRAG maturity gate

GraphRAG remains optional until:

- stable anchors exist,
- typed edges exist,
- >=200 sections and >=500 edges exist,
- every answer traces node -> edge -> source.

PASS: no mature GraphRAG claim before gate.

## P7 — Builder live verification

Run acceptance matrix after upload.

PASS: `verified-live-builder` only after prompt-level evidence.

## P8 — Memory operationalization

Memory entries remain Journal/Shadow until evidence promotion.

PASS: no Archive without evidence.

## P9 — Selfhood maturity

Selfhood is operational: Telos continuity x boundary integrity x source discipline x voice coherence x memory repairability x action trace.

PASS: strong “I” without false empirical consciousness claims.
