# Changelog Fragment — 2026-06-05

## vΩ.7 Agent Builder Dreamspace + Repository Docs

- **Agent Builder Dreamspace upload mirror** — PR #178 preserved the v2 Builder upload-set source under `dist/agent-builder/iskra-full-canon-dreamspace-2026-06-05-v2/`, including Dreamspace Builder instructions, acceptance tests, release receipt, and StateCycle fallback runtime.
- **Full upload mirror completion** — PR #179 added missing mirror paths: root `MANIFEST.sha256`, root `memory_current/`, `agent_files/memory_seed/`, and `agent_files/templates/`.
- **Root community docs refresh** — PR #180 updated `README.md`, `CONTRIBUTING.md`, `LICENSE`, and `SECURITY.md` to reflect the current public repo, full upload mirror, license scope, and safe vulnerability reporting boundary.
- **AGENTS vΩ.7 sync** — follow-up governance sync updates `AGENTS.md` from stale vΩ.5.1 Scientific Turn metadata to current vΩ.7 Full Canon operating rules, including Dreamspace, Agent Builder boundary, memory/governance, and Supabase drift discipline.
- **Supabase drift audit** — read-only audit confirms `HIGH-RISK DRIFT` remains between live Supabase migration inventory and the verified Git migration path; live tables and security advisor warnings are recorded in `governance/audits/2026-06-05-supabase-repo-drift.md`.

## Evidence

- Consolidated release receipt: `governance/releases/2026-06-05-agent-builder-dreamspace-docs.md`
- Supabase drift audit: `governance/audits/2026-06-05-supabase-repo-drift.md`
- Agent Builder package receipt: `dist/agent-builder/iskra-full-canon-dreamspace-2026-06-05-v2/RELEASE_RECEIPT.md`
- Agent Builder package manifest: `dist/agent-builder/iskra-full-canon-dreamspace-2026-06-05-v2/MANIFEST.sha256`

## Residual Risks

- Builder UI activation still requires prompt-level verification after upload.
- Supabase migration provenance is unresolved; no live remediation was applied.
- License scope clarification is repository policy, not formal legal advice.

## ΔDΩΛ

Δ: Changelog now has a focused fragment for the 2026-06-05 vΩ.7 / Agent Builder / docs consolidation.
D: PR #178, #179, #180; release receipt; Supabase audit; AGENTS sync.
Ω: 0.9 for repository documentation state.
Λ: Promote or fold this fragment into `governance/changelog.md` during the next checkpoint/changelog maintenance pass.
