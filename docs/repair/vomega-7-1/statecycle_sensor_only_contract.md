# StateCycle sensor-only contract

Date: 2026-07-01
Status: accepted for repair branch

Decision: StateCycle is telemetry only. It can report metric history, entropy signals, somatic pressure, and a provisional sensor voice.

Final voice routing remains in runtime/src/types/voices.ts selectVoice.

Reason: the drift map found two different voice selection surfaces. The TypeScript router has deterministic vOmega 7.1 supertriggers. StateCycle uses a probabilistic voice field. Treating both as final routers creates silent drift.

Required behavior:
- authority: sensor-only
- selected_is_authoritative: false
- legacy selected means provisional sensor voice
- summaries should say latest_sensor_voice

Acceptance:
- StateCycle voice is telemetry only.
- rhythm 80, trust .9, pain .4 routes to MAKI with KAIN secondary.
- echo .8 routes to ISKRIV with SAM support because echo clearance is below .25.

Boundaries:
- Keep StateCycle.
- New ADR required before StateCycle can become final router.
- Builder live verification remains pending.
- Supabase live SQL is outside this decision.

Delta: StateCycle is classified as sensor-only.
Data: CANON vs DIST drift map and vOmega 7.1 voice-router repair branch.
Omega: 0.90 for decision; implementation pending.
Lambda: revisit after StateCycle metadata patch and package regeneration.
