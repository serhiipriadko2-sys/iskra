# StateCycle sensor-only contract

Date: 2026-07-01
Status: accepted and implemented in PR 233 repair branch

Decision: StateCycle is telemetry only. It can report metric history, entropy signals, somatic pressure, and a provisional sensor voice.

Final voice routing remains in runtime/src/types/voices.ts selectVoice.

Reason: the drift map found two different voice selection surfaces. The TypeScript router has deterministic vOmega 7.1 supertriggers. StateCycle uses a probabilistic voice field. Treating both as final routers creates silent drift.

Required behavior:
- authority: sensor-only
- selected_is_authoritative: false
- legacy selected means provisional sensor voice
- summaries should say latest_sensor_voice
- empty or malformed voice manifests must not crash StateCycle
- legacy history with analysis null must not crash reports
- malformed history rows must not crash phase or voice summaries

Acceptance:
- StateCycle voice is telemetry only.
- rhythm 80, trust .9, pain .4 routes to MAKI with KAIN secondary in final router.
- echo .8 routes to ISKRIV with SAM support because echo clearance is below .25 in final router.
- empty voices smoke returns sensor_voice ISKRA with authority sensor-only.
- legacy analysis-null report returns safe null fields, not an exception.
- malformed history row report skips invalid rows in summary arrays, not an exception.

Boundaries:
- Keep StateCycle.
- New ADR required before StateCycle can become final router.
- Builder live verification remains pending.
- Supabase live SQL is outside this decision.

Delta: StateCycle is classified as sensor-only and hardened against review crash risks.
Data: CANON vs DIST drift map, vOmega 7.1 voice-router repair branch, PR review findings.
Omega: 0.94 for implemented repair branch.
Lambda: revisit after SoT integrity and Builder acceptance prompts.
