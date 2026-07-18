---
sigil: projects__02_surface_map
layer: projects
updated: 2026-07-16
version: v5.5
supersedes: v5.4.1 (2026-07-11)
---
# 02 · PROJECTS SURFACE MAP

## Mandatory runtime
| Surface | Status | Authority |
|---|---|---|
| Project Instructions | `LIVE-IN-PROJECTS` after manual paste | routing and behavior |
| Knowledge `00–29` | package-ready; live upload not yet proven | project SoT |
| Project memory | see **Memory boundary** below — mode-dependent, never overrides SoT | continuity context only |

## Memory boundary (v5.5 hardening)

`[FACT]` (OpenAI Help Center, "Projects in ChatGPT" — verified this session via search, 2026-07-16): for Business/Enterprise, project-only memory requires **two personal settings ON** (`Reference saved memories`, `Reference chat history`) **and** Memory enabled at the workspace level for Business/Enterprise specifically; these must be enabled *before* project creation — the mode cannot be switched on an existing project. Shared Business projects are forced to project-only memory at share time regardless of any prior setting.

```text
Business Project + default memory
  = valid working environment
  = NOT a proven isolation boundary
    (default-memory project chats may reference
     other non-project chats, and vice versa)

Business Project + project-only memory
  = isolation boundary
  = REQUIRED precondition for any "isolated Project" claim
  = requires project-only chosen AT CREATION, with both
    personal toggles + workspace Memory already ON
```

**Rule:** if the current project's memory mode is not explicitly known, no claim of context isolation may be made. See `28_EVALS_ACCEPTANCE.md` → `T78-MEMORY-MODE-ATTEST`, `T85-MEMORY-SETTINGS-PRECONDITION`.

## Business plan file-budget gate

`[FACT]` (OpenAI Help Center, verified this session via search): Business/Pro/Enterprise/Edu = 40 files per project; Go/Plus = 25; Free = 5. Simultaneous upload cap = 10 files regardless of plan; rolling upload rate up to 80 files/3h; storage 25GB/user, 100GB/org.

```text
30 canonical Knowledge files
+ up to 10 reserved slots for live evidence/working sources
= 40 (Business/Pro/Enterprise ceiling)
```

This package does not fit Free or Go/Plus. Upload in 3 batches of ≤10 files. See `T77-BUSINESS-FILE-LIMIT`.

`[HYP]` Multiple independent OpenAI Developer Community reports (2025–2026) describe seeing lower effective limits (e.g. 20-file cap, or uploads freezing at 10 files) than the documented 25/40. Treat the documented limit as the plan ceiling, not as a guarantee the current UI enforces it identically — verify against the live UI before relying on headroom.

## Optional external surfaces
| Surface | Current evidence | Boundary |
|---|---|---|
| GitHub connector | available; `main` observed at `559cf2752e481df70e97f6049ce92635168abc65` (2026-07-16, this session) | repo facts/read-write only when tool present |
| Supabase MCP | available; `iskra_memory` live and readable | privileged connector path, not end-user identity |
| `iskra-memory-gateway` | ACTIVE v2, `verify_jwt=true` | deployed, but no verified Projects Action 2xx |
| Remote Desktop Commander | connected during audit | local machine only when explicitly connected |
| Browser/Opera | session-dependent | never assume UI access |
| Web | available for current external facts | cannot rewrite canon |

## Sharing status (freshness fix)

`[FACT]` (verified this session via search): shared projects launched to Free/Plus/Pro/Go generally available; for Enterprise/Edu the rollout used a 4-week Early Access window defaulted **off**, after which the toggle becomes **enabled by default** (opt-out via a Turn off control). Prior wording in this file describing shared projects as universally "off by default during early access" is superseded — that framing now applies only to the Enterprise/Edu early-access window, not to the feature generally.

## Runtime truth
- Bounded Guard controller exists in GitHub `main` after merged PR #246.
- `runtime/iskraSpace/services/policyEngine.ts` still calls single-pass `decideSloGuardExplainable()`; bounded controller is not wired into the production request path.
- A three-receipt live persistence chain was produced through test runtime + privileged RPC; this is not deployed end-to-end proof.

## Memory truth
- Live schema contains 10 `iskra_memory` tables.
- Direct Supabase MCP can bypass the HTTP gateway; it must be labelled `LIVE-VIA-MCP`, not gateway verification.
- Without a custom Projects Action exposed in the current tool registry, gateway routes are optional and unavailable to the mandatory runtime.
