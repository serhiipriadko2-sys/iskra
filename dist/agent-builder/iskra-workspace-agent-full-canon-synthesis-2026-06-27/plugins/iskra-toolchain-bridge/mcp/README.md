# MCP Boundary

This plugin currently ships no MCP server.

The bridge defines connector contracts and local smoke scripts. Runtime MCP
servers should be added only after there is a concrete provider, auth model,
approval boundary, and receipt format.

Current related MCP expectations:

- GitHub MCP: prefer observed `codex mcp list` / `codex mcp get` evidence.
- Supabase MCP: prefer observed project identity and live read evidence.
- Agent Builder MCP: proposed only until an API/UI-backed connector exists.
