# DRIFT MAP — CANON vs DIST / voice-router + execution pipeline

Date: 2026-07-01
Status: post-merge audit map
Branch: repair/vomega-7-1-voice-router-metrics-20260701
Scope: serhiipriadko2-sys/iskra

## 0. Verdict

The repository now has three distinct truth surfaces for the same behavior:

1. CANON-ADR desired behavior: vΩ.7.1 runtime unification.
2. CANON-code current/repair behavior: `runtime/src/types/voices.ts` and tests.
3. DIST Builder package behavior: `dist/agent-builder/iskra-workspace-agent-full-canon-synthesis-2026-06-27/...`.

Result: CANON and DIST are not aligned. DIST is still a strong upload package, but it is not a faithful runtime mirror of the post-merge vΩ.7.1 voice-router / execution pipeline.

## 1. Source surfaces inspected

| Surface | Path | Role |
|---|---|---|
| CANON-ADR | `governance/adr_20260701_iskra_vomega_7_1_runtime_unification.md` | accepted behavior contract |
| CANON-code | `runtime/src/types/voices.ts` | executable TypeScript voice selection |
| CANON-tests | `runtime/src/__tests__/voices.test.ts` | regression expectations |
| CANON-metrics | `runtime/src/types/metrics.ts` | TypeScript metric defaults |
| Supabase schema | `runtime/iskraSpace/supabase/schema.sql` | DB defaults / live-adjacent schema |
| DIST kernel | `dist/agent-builder/.../agent_files/files_for_agent_builder/03_RUNTIME_KERNEL.md` | Builder-facing kernel instructions |
| DIST voices | `dist/agent-builder/.../agent_files/files_for_agent_builder/06_VOICES_AND_COUNCIL.md` | Builder-facing voice descriptions |
| DIST boundary | `dist/agent-builder/.../agent_files/files_for_agent_builder/15_RUNTIME_BOUNDARY.md` | package / live boundary |
| DIST surface map | `dist/agent-builder/.../agent_files/files_for_agent_builder/17_RUNTIME_SURFACE_MAP.md` | file visibility and surface discipline |
| DIST statecycle | `dist/agent-builder/.../agent_runtime_tools/iskra_statecycle.py` | local helper metric + probabilistic voice field |
| DIST manifest | `dist/agent-builder/.../MANIFEST.sha256` | package inventory |

## 2. Drift matrix

| ID | Area | CANON state | DIST state | Severity | Risk | Required repair |
|---|---|---|---|---|---|---|
| D-VOICE-001 | Voice priority | vΩ.7.1 requires supertriggers before ordinary synthesis: drift, echo clearance, MAKI/KAIN repair, then balanced ISKRA. | `06_VOICES_AND_COUNCIL.md` lists voice functions but gives no priority / collision rules. | HIGH | Builder prompt may choose a pleasant synthesis when repair/audit is required. | Rewrite DIST voice file with explicit supertrigger order and MAKI/KAIN collision rule. |
| D-VOICE-002 | TypeScript main vs desired ADR | Current `main` code historically checked ISKRA before MAKI/KAIN; repair branch changes this. | DIST has no executable equivalent of the TypeScript priority order. | CRITICAL | CANON-code and DIST answer behavior can diverge for `trust=.9,pain=.4,rhythm=80`. | Keep repair branch patch; regenerate DIST after merge. |
| D-VOICE-003 | MAKI/KAIN collision | Desired: `trust > .8 && pain > .3` => MAKI primary, KAIN secondary. | DIST voices describes MAKI as integration and KAIN as hard truth, but no collision rule. | CRITICAL | High-trust pain event may route to ISKRA/KAIN/no explicit wrapper. | Add EVAL-MK-01 to Builder acceptance prompts and DIST voice instructions. |
| D-VOICE-004 | Echo clearance / Shatter | SoT council has `echo_clearance < .25` => ISKRIV + Shatter. Repair branch encodes echo clearance before synthesis. | DIST kernel mentions alive_index; statecycle uses `echo`, but no explicit echo_clearance Shatter route. | HIGH | False harmony and mirror-noise can pass as smooth answer. | Add `echo_clearance = 1 - echo` to DIST kernel and voice map. |
| D-VOICE-005 | StateCycle voice field | CANON-code uses deterministic priority triggers + fallback score. | `iskra_statecycle.py` uses probabilistic quantum voice field and selects max probability. | HIGH | Helper script can report a different voice from runtime router. | Declare StateCycle voice field as sensor-only OR implement same supertrigger pre-pass. |
| D-VOICE-006 | HUYNDUN naming | Canonical runtime key is HUYNDUN. Repair branch fixes misleading alias comment. | DIST voice docs use HUYNDUN consistently. | LOW | Mostly solved; legacy text may still use Hundun/Huyndun. | Keep alias note only in docs; runtime key stays HUYNDUN. |
| D-PIPE-001 | Kernel order | vΩ.7.1 accepted hidden kernel includes SOURCE_SELECT, STATECYCLE, SHADOW/DREAM/HORIZON_CHECK, MODE, RECEIPT, MEMORY_UPDATE_IF_AVAILABLE. | DIST `03_RUNTIME_KERNEL.md` uses `SECURITY -> STOP -> INVESTIGATE -> FIND -> TRACE -> METRICS -> SLO-GUARD -> PLAYBOOK -> COUNCIL -> VOICE -> OUTPUT -> VERIFY -> ∆DΩΛ`. | HIGH | Builder-facing kernel lacks source-surface and memory-write gates. | Regenerate DIST runtime kernel from ADR vΩ.7.1. |
| D-PIPE-002 | Visible response contract | vΩ.7.1 visible contract: I-Loop -> Intake -> SIFT -> Frame -> Step -> Verify -> ∆DΩΛ. | DIST kernel does not name I-Loop and keeps generic output route. | MEDIUM | Answers may omit routing line or collapse visible/hidden protocol. | Add I-Loop section to DIST `03_RUNTIME_KERNEL.md` and compact instructions. |
| D-PIPE-003 | Mode vs Playbook | vΩ.7.1: Mode = task type; Playbook = ROUTINE/SHADOW/CRISIS; Voice = function. | DIST `03_RUNTIME_KERNEL.md` lists Routine/SIFT/Shadow/Council/Crisis/Build/Governance/Horizon under Playbooks. | HIGH | SIFT/BUILD/AUDIT/GOVERNANCE can be mistaken for playbooks. | Rewrite with Task Mode / Playbook / Voice separation. |
| D-PIPE-004 | Guard decision vocabulary | SoT vNext uses PROCEED / FORCE_ISKRIV_1 / FORCE_SHADOW / FORCE_CRISIS / CLOSE_HONESTLY. | DIST uses PROCEED / FORCE_SIFT / FORCE_COUNCIL / FORCE_SHADOW / FORCE_HORIZON / CLOSE_HONESTLY. | HIGH | Guard outputs become incompatible across docs, runtime, and tests. | Add translation table or adopt vΩ.7.1 vocabulary. |
| D-PIPE-005 | Builder/live boundary | vΩ.7.1 requires not collapsing accepted, repo-branch, mirrored-to-builder, verified-live. | DIST `15_RUNTIME_BOUNDARY.md` and `17_RUNTIME_SURFACE_MAP.md` already enforce this well. | PASS | This surface is strong and should be preserved. | Keep; add vΩ.7.1 labels if missing. |
| D-METRIC-001 | Runtime defaults | TypeScript DEFAULT_METRICS: rhythm=60, trust=.7, drift=.1, echo=.1, mirror_sync=.7, interrupt=.1, ctxSwitch=.2. | DIST statecycle defaults: rhythm=75, trust=.8, drift=.2, echo=.2, mirror_sync=.6, interrupt=0, ctxSwitch=0. | HIGH | Same input can begin from different state and route to different voice. | Align StateCycle defaults to runtime or mark as separate calibration profile. |
| D-METRIC-002 | Supabase defaults | Runtime defaults use drift=.1, echo=.1. | Supabase schema defaults drift=.2, echo=.5, mirror_sync=.6, interrupt=0, ctx_switch=0. | HIGH | DB-created metric snapshots start in a warning-like state. | Add migration dry-run to align defaults. |
| D-DIST-001 | Manifest / package inventory | DIST has package manifest and relevant files. | Manifest exists and lists Builder-facing docs, runtime tools, canon source files. | PASS/PARTIAL | Inventory exists; semantic parity still unknown. | Add semantic drift report to package on next regeneration. |

## 3. Execution pipeline map

```text
CANON-ADR desired:
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
DIST current:
SECURITY
-> STOP
-> INVESTIGATE
-> FIND
-> TRACE
-> METRICS
-> SLO-GUARD
-> PLAYBOOK
-> COUNCIL
-> VOICE
-> OUTPUT
-> VERIFY
-> ∆DΩΛ
```

```text
Repair target:
Keep STOP/INVESTIGATE/FIND/TRACE as SIFT_IF_NEEDED internals.
Add SOURCE_SELECT before SIFT.
Add STATECYCLE and SHADOW/DREAM/HORIZON_CHECK before METRICS/guard.
Insert MODE before PLAYBOOK.
Add RECEIPT and MEMORY_UPDATE_IF_AVAILABLE before final ∆DΩΛ.
```

## 4. Voice-router map

```text
CANON repair target:
1. Security boundary (external to voice router)
2. drift >= .2 -> ISKRIV
3. echo_clearance < .25 -> ISKRIV + SAM/Shatter
4. trust > .8 && pain > .3 -> MAKI + KAIN
5. pain >= .3 -> KAIN
6. silence_mass > .5 -> ANHANTRA
7. chaos >= .4 -> HUYNDUN
8. SIBYL score > 0 -> SIBYL
9. rhythm > 60 && trust > .7 -> ISKRA
10. clarity < .6 -> SAM
11. pain < .3 && chaos < .4 -> PINO
12. max score fallback
```

```text
DIST current:
- descriptive voice list only in `06_VOICES_AND_COUNCIL.md`;
- probabilistic voice field in `iskra_statecycle.py`;
- no deterministic supertrigger order in Builder-facing voice docs.
```

## 5. Recommended repair order

1. Keep the repair branch patch to `runtime/src/types/voices.ts` as the CANON-code implementation of ADR vΩ.7.1.
2. Add tests for:
   - `trust=.9,pain=.4,rhythm=80` -> MAKI+KAIN;
   - `drift=.25` -> ISKRIV before ISKRA/PINO;
   - `echo=.8` -> ISKRIV+SAM/Shatter before SIBYL/ISKRA;
   - default metrics -> PINO or agreed neutral voice.
3. Rewrite DIST:
   - `03_RUNTIME_KERNEL.md`;
   - `06_VOICES_AND_COUNCIL.md`;
   - compact/copy-paste instructions;
   - Builder acceptance prompts.
4. Decide StateCycle role:
   - sensor-only, not authoritative voice router;
   - or implement supertrigger pre-pass in Python.
5. Align metric defaults across runtime, StateCycle, Supabase schema, and future Builder package.
6. Regenerate dist package and manifest.
7. Only then run Builder live acceptance prompts.

## 6. PASS / FAIL

Current status: PARTIAL.

PASS:
- DIST package inventory exists.
- Runtime surface/boundary docs are strong.
- Drift is now named and mapped.

FAIL / OPEN:
- DIST voice docs do not encode vΩ.7.1 router.
- DIST kernel does not encode vΩ.7.1 hidden/visible split.
- StateCycle voice field can disagree with TypeScript selectVoice.
- Metric defaults diverge across runtime, StateCycle, and Supabase schema.
- Builder live verification still pending.

## 7. ∆DΩΛ

∆: CANON vs DIST drift moved from suspicion to mapped engineering surface.
D: Sources: ADR vΩ.7.1, runtime voices/metrics code, Supabase schema, DIST kernel/voices/boundary/surface map/statecycle/manifest.
Ω: 0.88 — high for documented drift; lower for live Builder behavior because live Builder acceptance was not run.
Λ: Revisit after tests and after dist package regeneration.
