# Builder Knowledge / Runtime Surface Receipt - 2026-06-27

Status: partial GitHub governance mirror
Scope: `serhiipriadko2-sys/iskra`
Branch: `codex/p1-surface-diagnostics-20260627`

## Context

A file-count drift was observed between Builder UI Knowledge and the current
ChatGPT Agent runtime mount. The Builder UI screenshot provided by the user
shows `269 files` for `Iskra vOmega.7`; the current runtime mount observed under
`/workspace/agent_files` exposed only a smaller mounted subset. These are
different observation surfaces and must not be collapsed into one claim.

## Observed Surfaces

- Builder UI Knowledge / File Store: user screenshot evidence shows 269 uploaded
  files.
- Runtime `/workspace/agent_files`: mounted subset visible to shell tools in the
  current cloud run; not a complete Builder file-store inventory.
- Runtime `/workspace/user_files`: task attachments, including screenshots and
  the uploaded P1 archive.
- Runtime `/workspace/memory`: continuity layer where the uploaded P1 archive was
  imported as long-term reference evidence.
- GitHub repository tree: repo-tracked state visible through the GitHub
  connector; not proof of active Builder upload state.

## Archive Import Evidence

Uploaded archive:
`01-iskra-full-canon-unified-2026-06-10-p1-repeatable-surface-diagnostics.zip`

Local memory import result:

- Source ZIP SHA-256: `d0838862ed83e41c076efac2a7e44da14fc4ab5f0f985158021ebb2921c385c4`
- Source ZIP bytes: `2838241`
- ZIP entries: `278`
- Uncompressed bytes: `8722750`
- Imported original-file count: `278`
- Generated memory checksum manifest: `MANIFEST_IMPORTED.sha256`
- Imported manifest SHA-256: `d02d55d17603e289b1c43ec20f5c89ea58febacc445cefafd9e7001c210cf12d`
- Package QC status observed in archive: `P1_REPEATABLE_SURFACE_DIAGNOSTICS_REBUILT`
- Builder live status in archive receipt: `NOT_VERIFIED`

## Boundary

This GitHub change records the governance/operations trace. It does not claim:

- the 269 Builder UI Knowledge files are mounted as 269 files in `/workspace`;
- the uploaded archive is active in Builder UI;
- the GitHub mirror equals live Builder state;
- helper hooks are executable unless a runtime smoke receipt says so;
- Builder Knowledge retrieval can provide sha256, bytes, or full file indexes.

## Next Safe Step

Mirror the full P1 package into `dist/agent-builder/iskra-full-canon-unified-2026-06-10/`
only through an atomic package update that includes the large JSON inventories,
manifest, QC receipt, and post-update verification. Until then, this branch is a
governance receipt and drift-prevention patch, not a complete Builder package
replacement.

## Delta

Delta: GitHub now has a repo-level receipt explaining the Builder Knowledge vs
runtime mount drift and preserving the P1 archive import evidence.
Data: user Builder UI screenshot, runtime file inventories, memory import
manifest, GitHub connector reads.
Omega: 0.86 for the surface distinction and archive import evidence; lower for
live Builder state because Builder UI post-upload verification is still pending.
Lambda: revise after a full atomic package mirror update or confirmed Builder UI
file-store listing/export.
