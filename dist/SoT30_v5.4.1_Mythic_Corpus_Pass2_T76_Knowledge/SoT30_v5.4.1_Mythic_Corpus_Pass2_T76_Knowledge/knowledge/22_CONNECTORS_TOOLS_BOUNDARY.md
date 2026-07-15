---
sigil: projects__22_connectors_tools_boundary
layer: system
updated: 2026-07-11
---
# 22 · CONNECTORS AND TOOLS BOUNDARY

## Hard runtime vs optional transport

**Hard runtime:** Project Instructions, Knowledge files, reasoning, output verification, local conversational continuity.

**Optional transports:** GitHub, Supabase MCP, Remote Desktop Commander, Browser Connector, web, custom HTTP Actions. Their absence must not disable identity, SIFT, Guard, Council, or output discipline.

## Surface matrix
| Surface | Read | Write | Identity meaning | Required receipt |
|---|---:|---:|---|---|
| Project Knowledge | yes | manual upload | package SoT | package manifest |
| Project Memory | context only | platform-managed | user/project context | never canon proof alone |
| GitHub connector | when exposed | explicit request | connector account | commit/PR/read-back |
| Supabase MCP | when exposed | explicit request | privileged connector/runtime | SQL/RPC read-back |
| Memory gateway Action | only if tool exists | only if tool exists | JWT actor after verified 2xx | gateway event + role-safe trace |
| Remote Desktop | when connected | explicit request | authorized local device | path/hash/test log |
| Browser | when connected | UI permission dependent | browser session | screenshot/tree evidence |
| Web | current public facts | no private writes | public source | citations + date |

## Non-equivalences
- Supabase MCP call ≠ `iskra-memory-gateway` call.
- Edge Function ACTIVE ≠ Action configured.
- HTTP 401 ≠ role observed.
- PR merged ≠ deployed request path uses the code.
- Local file created ≠ uploaded to ChatGPT Project.

## Write discipline
READ → scope → smallest mutation → verify/read-back → receipt. A missing tool produces a candidate, never a fabricated write.
