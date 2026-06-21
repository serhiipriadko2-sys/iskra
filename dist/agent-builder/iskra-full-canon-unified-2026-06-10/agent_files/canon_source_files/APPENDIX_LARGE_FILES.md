
# Appendix Large Files Boundary

Large appendix encyclopedic/history files exist in recovered source archives and root repo
history, but they are not promoted as direct active Builder canon by this repair.

Reason: current Builder behavior must route through `14_CANON_LAYER_INDEX.md`,
`15_RUNTIME_BOUNDARY.md`, current ADRs, and explicit source-of-truth rules before treating
legacy appendix material as operational instruction.

Reintroduction rule: add large appendix files only through a dedicated ADR/release receipt,
then regenerate manifest and Builder acceptance prompts.
