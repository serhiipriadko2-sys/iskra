# Independent Judge v3.5-rc.1-p1 — deployment guide

## Target

ChatGPT Business Project, owner-declared budget 40 files:

- 30 permanent Knowledge files;
- up to 10 runtime inputs/extensions;
- Project Instructions ≤6000 characters;
- judge Skills installed separately through the ChatGPT Skills interface and **not** uploaded as Project sources.

## Core deployment

1. Create a new Project.
2. For ordinary diagnostic runs, choose the desired memory mode and declare it in each run.
3. For **STRICT_BLIND**, use a fresh single-use Project with no prior candidate/identity/verdict chats. Project-only memory is not memory OFF because it can reference other chats in the same Project.
4. Paste `UPLOAD_TO_PROJECT/PROJECT_INSTRUCTIONS.txt` into Project Instructions.
5. Upload exactly the 30 files from `UPLOAD_TO_PROJECT/knowledge/` in batches of at most 10.
6. Do not upload `OPERATOR_SUPPORT`, `SKILL_SOURCES`, or `JUDGE_SKILLS` into Project sources.
7. Add only the runtime extensions needed for the current mode.
8. Run T01–T40 from `26_ACCEPTANCE_SUITE.md` in a fresh single-use test Project before acceptance.

## Runtime slot examples

- Single response: package/evidence only; no extension required.
- Study over a task bank (e.g. Unified-1000/BNAT-50): EXT31 (+EXT33 for blind); candidate bank file only — never `evaluator_private/` (see `STUDY_PACKAGES/*/RUNTIME_BOUNDARY.md`).
- Pairwise strong claim: EXT32 optionally; pairwise skill installed separately.
- Strict blind: EXT33 plus one fresh Project per run.
- Study: EXT31; optionally EXT32/EXT33.
- Adjudication: EXT34.
- Deployment planning: EXT35.
- Skill governance review: EXT36.

## Skills

Install each `JUDGE_SKILLS/<name>/skill.zip` separately through the Skills UI. Skills may be scanned or require review. The five judge skills are accelerators; Knowledge 00–29 remains authoritative.

## Non-claims

Local packaging PASS does not mean:

- uploaded into a live Project;
- T01–T40 passed by the selected judge model;
- empirical reliability is calibrated;
- publication-grade validity;
- GitHub/Supabase persistence or deployment.
