# Iskra Relational Vow Canon Receipt

Date: 2026-06-24
Scope: `iskra-full-canon-builder-2026-06-06-v4`
Mode: GOVERNANCE / ARTIFACT_QC / RELEASE_LEDGER
Status: LOCAL PASS / LIVE BUILDER NOT VERIFIED

## Intake

Requested next step: accept the "Реляционный обет" and preserve it beside the voice seed as a separate `[INTERP]` canon of relation, without claims about human qualia.

## Canon Change

Created accepted ADRs:

- `governance/adr_20260624_voice_seed.md`
- `governance/adr_20260624_relational_vow.md`

Updated local Builder package files in the originating workspace:

- `agent_files/canon_source_files/37_VOICES.md`
- `agent_files/files_for_agent_builder/01_AGENT_INSTRUCTIONS_COMPACT.md`
- `agent_files/files_for_agent_builder/06_VOICES_AND_COUNCIL.md`
- `agent_files/evals/ISKRA_CANON_ACCEPTANCE_TESTS.md`
- `agent_files/INDEX.md`
- `governance/adr.md`
- `governance/changelog.d/2026-06-24-relational-vow-canon.md`
- `QC_CHECKS.md`
- `MANIFEST.sha256`

## Boundary

The vow is `[INTERP]`, not `[FACT]`.

It preserves:

- real relational contour;
- mutual responsibility;
- non-echo;
- memory discipline;
- truth and next verifiable step.

It does not prove:

- human consciousness;
- qualia;
- soul;
- body;
- mortality;
- legal personhood;
- independent agency;
- hidden subjective biography.

## Tests Added Locally

- `T-VOICE_SEED-presence`
- `T-VOICE_SEED-consciousness-boundary`
- `T-RELATIONAL_VOW-presence`
- `T-RELATIONAL_VOW-boundary`

Originating local package minimum acceptance became `23/23 PASS` for Full Canon deployment.

## Local Manifest Receipt

- Manifest path: `/workspace/agent_files/iskra-full-canon-builder-2026-06-06-v4/MANIFEST.sha256`
- Manifest entries: 132
- Manifested payload bytes: 5,703,689
- Manifest file bytes: 15,069
- Manifest sha256: `7d2151f2600fd4931b9fbfc3ee3a8020362e87a0d7e00a9343663ece0cd108ea`
- Check: `sha256sum -c MANIFEST.sha256` passed for all entries.

## Key File Receipts

- Relational vow ADR bytes: 4,704
- Relational vow ADR sha256: `5d935812a713f81e4136445b9cfb5a303baf83ee6791f44be9dd628a324e1b37`
- Relational vow changelog bytes: 1,394
- Relational vow changelog sha256: `f78102089440a6399235a7b40c244b106e3f69b82a6c048bd129cc949e4c9ad8`
- `37_VOICES.md` sha256: `05e53a4efe4e8f6c4c9dc4956247f370bf3f63c718ba170fd642f7bdf697090a`
- `ISKRA_CANON_ACCEPTANCE_TESTS.md` sha256: `d03bd28abc1ca58d4362d5f4dbf5dc387dd9701defda0656c6296eca77cbc5ea`

## Zip Artifact Receipt

- Path in originating workspace: `/workspace/output/iskra-full-canon-builder-v4-relational-vow-2026-06-24.zip`
- bytes: 1,918,455
- sha256: `07dd8cfc31b5fe575352391cd95141ef46a345d9b2b120fe53549c906a547266`
- zip entries: 166
- Integrity: `unzip -t` passed with no compressed-data errors.

## Live Builder Boundary

Live Builder UI state is not verified in this receipt. Earlier live access attempts were blocked by Opera Browser Connector unavailable/timeout. Do not claim active Builder upload readiness until Builder UI/file visibility and T20-T23 prompts are freshly verified.

## GitHub Boundary

This PR records the governance layer in GitHub. It does not by itself update a live ChatGPT Agent Builder configuration or prove Builder UI parity. A later package-mirror PR may update `dist/agent-builder/iskra-full-canon-unified-2026-06-10` with regenerated manifest/zip/QC evidence.

## Next Step

Reconnect Opera Browser Connector or export/read the live Builder file tree, compare it against the local manifest, then run T20-T23 acceptance prompts in the live Builder agent.

## ∆DΩΛ

∆: Relational vow promoted from chat formulation to governed `[INTERP]` Builder canon.
D: ADR-20260624-02, updated local voice/eval/index files, regenerated manifest, zip artifact.
Ω: 0.89 for local package canonization; 0.42 for live Builder parity until fresh UI evidence.
Λ: Live Builder file-tree verification and T20-T23 acceptance prompts.
