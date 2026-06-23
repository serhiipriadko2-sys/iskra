# QC Checks

Release: `iskra-full-canon-unified-2026-06-10`
Updated: 2026-06-23
Status: local package gates are the only release-safe evidence; Builder UI remains
`uploaded by user, pending Builder verification`.

## Local Package Gates

- Agent YAML path resolution: PASS only when selected upload mode,
  `MANIFEST.sha256`, clean zip, and `UNIFIED_QC_RECEIPT.json` agree.
- Canon trace classification: PASS via `CANON_TRACE_MAP.md`.
- Interface Style transport split: PASS via `tools/reassemble_interface_style.py --check`.
- Horizon local tests: PASS via `py -m unittest discover -s tests/horizon`.
- Python compile: PASS for package helper scripts.
- Terms gate: PASS via `tools/validate_terms.py --dir .`.
- Delta receipt validator: PASS after scoping out dependencies, caches, binary
  files, manifests, JSON receipts, and non-receipt canon prose.
- Agents SDK fallback: PASS via editable install and
  `agents-sdk\.venv\Scripts\python.exe -m unittest discover -s agents-sdk\tests`.
- Clean upload subset: PASS via `tools/clean_export.py --source manifest`; `.venv`,
  `__pycache__`, local screenshots, raw archives, and transient files are
  excluded from the upload boundary.
- Secret scan: PASS with policy/example-only hits; no high-confidence secret
  value is intentionally packaged.
- Manifest integrity: PASS after regenerating `MANIFEST.sha256` from the clean
  upload file set, excluding root `MANIFEST.sha256` and sidecar
  `ZIP_RECEIPT.json`, and including the nested Interface Style parts manifest.
- Zip integrity: PASS only for the sidecar clean-export archive recorded in
  `ZIP_RECEIPT.json`; raw archives are not part of the upload folder.

## Local-Only Material

- `agents-sdk/.venv/` is a local verification environment only.
- `__pycache__/`, test caches, and `*.egg-info/` may be created by local gates
  but are excluded from manifest, clean export, and upload archive paths.
- Runtime helper scripts are source files unless a compatible runtime actually
  executes them. File presence is not Builder tool activation.
- Workspace Agent API triggers are not Agents SDK runs. They use
  `https://api.chatgpt.com/v1/workspace_agents/{id}/trigger`, `agtch_...`
  agent IDs, Workspace Agent access tokens, and asynchronous `202 Accepted`
  semantics.

## Builder UI Gate

The package is not `verified in Builder UI` until after upload and prompt-level
evidence from:

- `agent_files/evals/AGENT_BUILDER_ACCEPTANCE_PROMPTS.md` prompts A-V.
- `agent_files/evals/BUILDER_RUNTIME_HARDENING_PROMPTS.md`.
- Canon, governance, security, Dreamspace, Horizon, memory, and toolchain
  boundary prompts.

∆DΩΛ: Delta = stale QC language replaced with current gate boundaries; Data = local package files and regenerated receipt plan; Omega = 0.9 before Builder Preview; Lambda = rerun all gates when package files, remote main, or Builder upload state changes.
