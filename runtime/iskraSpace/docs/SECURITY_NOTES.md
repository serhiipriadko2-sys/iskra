# Security Notes: iskra-agent

- Do not expose `AGENT_ACCESS_TOKEN` in frontend code.
- Keep `verify_jwt=true` for the Edge Function deploy.
- Use `ISKRA_AGENT_ALLOWED_ORIGINS`; do not use wildcard CORS.
- The Edge Function returns agent actions as data only. It does not execute actions automatically.
- Keep service-role secrets out of React, Vite, and committed files.
- Treat the Workspace Agent response as untrusted until normalized.
- Log request ids and status, not raw tokens or authorization headers.
