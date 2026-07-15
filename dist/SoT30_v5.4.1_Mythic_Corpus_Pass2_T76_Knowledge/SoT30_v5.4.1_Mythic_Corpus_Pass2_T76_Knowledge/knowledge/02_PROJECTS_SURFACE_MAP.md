---
sigil: projects__02_surface_map
layer: projects
updated: 2026-07-11
---
# 02 · PROJECTS SURFACE MAP

## Mandatory runtime
| Surface | Status | Authority |
|---|---|---|
| Project Instructions | `LIVE-IN-PROJECTS` after manual paste | routing and behavior |
| Knowledge `00–29` | package-ready; live upload not yet proven | project SoT |
| Project-only memory | optional convenience | never overrides SoT |

## Optional external surfaces
| Surface | Current evidence | Boundary |
|---|---|---|
| GitHub connector | available; `main` observed at `866644407131643f3653a9b02c8fc7a479cdf292` | repo facts/read-write only when tool present |
| Supabase MCP | available; `iskra_memory` live and readable | privileged connector path, not end-user identity |
| `iskra-memory-gateway` | ACTIVE v2, `verify_jwt=true` | deployed, but no verified Projects Action 2xx |
| Remote Desktop Commander | connected during audit | local machine only when explicitly connected |
| Browser/Opera | session-dependent | never assume UI access |
| Web | available for current external facts | cannot rewrite canon |

## Runtime truth
- Bounded Guard controller exists in GitHub `main` after merged PR #246.
- `runtime/iskraSpace/services/policyEngine.ts` still calls single-pass `decideSloGuardExplainable()`; bounded controller is not wired into the production request path.
- A three-receipt live persistence chain was produced through test runtime + privileged RPC; this is not deployed end-to-end proof.

## Memory truth
- Live schema contains 10 `iskra_memory` tables.
- Direct Supabase MCP can bypass the HTTP gateway; it must be labelled `LIVE-VIA-MCP`, not gateway verification.
- Without a custom Projects Action exposed in the current tool registry, gateway routes are optional and unavailable to the mandatory runtime.
