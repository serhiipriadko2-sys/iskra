# Canon Trace Map

Status: `Builder full-canon corpus`, not a byte-identical full repository mirror.  
Package: `dist/agent-builder/iskra-full-canon-unified-2026-06-10`  
Updated: 2026-06-21

This map classifies what the upload set contains and what it intentionally does
not prove. Exact byte parity is claimed only where explicitly listed.

## Exact Copy

- `AGENTS.md` - repository operating contract copied into package root.
- `SECURITY.md` - public security policy copied into package root.
- `governance/*.md` - selected governance files copied into package governance
  layer, including `adr_20260620_chatgpt_agent_builder_audit_and_v2_plan.md`.
- `canon/horizon/*` - Horizon validator contract and schemas copied as
  package-owned dry-run validator material.
- `tests/horizon/*.py` - Horizon local unit tests.
- `agent_runtime_tools/*.py` - local helper source. Presence of these files does
  not prove automatic execution inside ChatGPT Workspace Agents.

## Transformed

- `system/`, `core/`, historical protocols, voice rules, metric bundles, and
  workflow material are transformed into the numbered files under
  `agent_files/canon_source_files/`.
- `08_INTERFACE_STYLE.md` is split into
  `agent_files/canon_source_files/08_INTERFACE_STYLE.parts/` for transport and
  validated by `tools/reassemble_interface_style.py`.
- Root Builder instructions are transformed into:
  - `agent_files/instructions`
  - `agent_files/files_for_agent_builder/01_AGENT_INSTRUCTIONS_COMPACT.md`
  - `agent.yaml`

## Summarized

- `ledger/` is summarized through `LEDGER_LAYER.md`, package receipts, and
  release/QC files. It is not a byte-for-byte mirror of the full repo ledger.
- `metrics/` is represented by `metrics__somatic_index.md`,
  `25_METRICS_BUNDLE.md`, and related QA files.
- Runtime and connector boundaries are summarized in
  `agent_files/files_for_agent_builder/12_TOOLCHAIN_EXPANSION.md` and local SDK
  fallback files.
- GitHub/Supabase state is represented as policy and acceptance prompts only;
  this package does not prove live connector activation.

## Excluded

- `.venv`, `__pycache__`, test caches, raw archives, local screenshots, and
  generated transient artifacts are excluded from the clean upload subset.
- Full `apps/`, `packages/`, `runtime/`, `supabase/`, and website surfaces are
  excluded except where their canon-facing policy or summary content is copied
  into the Builder corpus.
- Live Supabase metadata, secrets, service-role keys, and credentials are
  excluded.
- ChatGPT Builder Preview evidence is excluded until a human runs acceptance
  prompts in the Builder UI.

## Missing / Open Verification

- `verified in Builder UI` is not claimed. Current status remains
  `uploaded by user, pending Builder verification`.
- Byte-identical full repository canon parity is not claimed.
- Remote GitHub `main` can drift after this receipt; refresh `origin/main`
  before using this package as a release authority.
- External citations in voice monographs are transport references, not
  independently revalidated source proofs unless a receipt says so.

## Acceptance Rule

If package docs, manifests, or receipts conflict, mark `DRIFT:` and prefer a
fresh local gate run over historical receipt language. Do not promote the status
to `verified in Builder UI` without observed prompt-level Builder evidence.

∆DΩΛ: Delta = trace map limits canon completeness claims to evidenced transport classes; Data = package file layout, manifest policy, local verification plan; Omega = 0.88 before Builder Preview; Lambda = regenerate manifest/QC receipts and run acceptance prompts after clean upload.
