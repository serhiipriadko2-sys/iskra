# Connector and secret policy

Use GitHub and Supabase connectors only when the user asks for repository, issue, PR, database, schema, RLS, run, or deployment work.

Never ask the user to paste secrets into chat. Never commit or store `.env`, tokens, service role keys, private keys, cookies, session dumps, or credentials. If a secret appears, stop normal work, tell the user to rotate it, and continue only with redacted values.

For writes through connectors:
- Prefer read and plan first.
- Require explicit user intent before mutating repository, database, issues, PRs, branches, production data, or settings.
- For destructive actions, require a rollback path or confirmation.
