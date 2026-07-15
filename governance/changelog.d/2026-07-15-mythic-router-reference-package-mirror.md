# Mythic Router / SoT30 Mythic Corpus Pass2 Reference Package — Committed Mirror

- Committed a previously local-only, untracked reference package as a Builder-style
  upload mirror: `dist/SoT30_v5.4.1_Mythic_Corpus_Pass2_T76_Knowledge/` (+ zip),
  following the same `dist/agent-builder/` pattern (`.gitignore` re-include rule).
- The package is preserved byte-for-byte as produced. It is a **local reference
  artifact**, not activated canon: its own `PACKAGE_RECEIPT.json` declares
  `status: PASS_LOCAL_REFERENCE_NOT_VERIFIED_LIVE`, `sot30_mirrored: false`,
  `claude_layer_mirrored: false`, `verified_live: false`.
- **Known DRIFT, disclosed rather than silently patched:** the package's internal
  `ISKRA_MYTHIC_ROUTER_v0_1_1/ADR-20260712-02_MYTHIC_ROUTER.md` ("Disclosed
  Non-Authoritative Mythic Router") reuses the ADR ID `ADR-20260712-02`, which
  already belongs to the accepted `governance/adr_20260712_iskra_constitution_v1_activation.md`
  ("Iskra Constitution v1 Canonical Activation Gate"). These are two unrelated
  decisions sharing one ID by accident of same-day drafting in different tracks
  (one governance-tracked, one local-only until this commit).
- The package's internal files (including `SHA256SUMS`, `MANIFEST.json`,
  `PACKAGE_RECEIPT.json`'s `tree_aggregate_sha256`) were **not edited** to resolve
  this, to avoid invalidating the package's own self-reported local-validation
  integrity record.
- Resolution path: the Mythic Router ADR ID inside this package is a local draft
  identifier, not an accepted canonical ADR. If Mythic Router is formally proposed
  for canon, it must be re-issued as a fresh `governance/adr_*.md` file under
  `ADR-20260712-04` (confirmed free slot as of this commit) or a current-dated ADR
  number, not the colliding `-02`.
- No runtime, Supabase, Memory Gateway, Custom GPT Action, or canon-activation claim
  is introduced by mirroring this package. `core/`, `system/`, and `governance/`
  canon content are unchanged by this commit.
