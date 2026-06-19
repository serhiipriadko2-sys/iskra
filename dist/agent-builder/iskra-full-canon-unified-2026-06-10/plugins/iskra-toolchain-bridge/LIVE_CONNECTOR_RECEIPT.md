# Live Connector Receipt

Status: `partial-live-verified`
Date: 2026-06-06

## GitHub

- Connector: `mcp__codex_apps__github`
- Operation: read-only repository metadata lookup.
- Repository: `serhiipriadko2-sys/iskra`
- Result: PASS.
- Evidence: repo id `1126614067`, visibility `public`, default branch `main`,
  clone URL `https://github.com/serhiipriadko2-sys/iskra.git`, connector
  permissions include `pull`, `push`, `triage`, `maintain`, and `admin`.
- Local fallback: `git ls-remote origin refs/heads/main` returned the pushed
  `main` head during the prior runtime bridge pass.
- Boundary: local `gh` exists but is not authenticated, so GitHub CLI is not the
  live authority for this receipt.

## Supabase

- Connector: `mcp__codex_apps__supabase`
- Operation: read-only project metadata, URL, Edge Functions, and generated type
  summary.
- Project: `AgiIskra / typcvaszcfdpkzbjzuur`
- Result: PASS.
- Evidence: project status `ACTIVE_HEALTHY`, region `eu-west-1`, database host
  `db.typcvaszcfdpkzbjzuur.supabase.co`, Postgres `17.6.1.063`, API URL
  `https://typcvaszcfdpkzbjzuur.supabase.co`.
- Edge Functions observed: `db-proxy` (`verify_jwt=true`), `gemini`
  (`verify_jwt=true`), `iskra-canon-backfill-1536` (`verify_jwt=false`),
  `iskra-canon-import-1536` (`verify_jwt=false`),
  `iskra-canon-import-diagnostic` (`verify_jwt=false`).
- Generated type summary: public tables include `audit_log`, `chat_history`,
  `graph_edges`, `graph_nodes`, `habits`, `journal_entries`, `memory_nodes`,
  `metrics_snapshots`, `rate_limits`, `tasks`, `users`, and
  `voice_preferences`.
- Boundary: no live DDL, no data mutation, no secrets read.

## Web SIFT

- Source route: official OpenAI Codex manual helper attempted first.
- Result: PARTIAL.
- Evidence: manual helper failed with `HTTP 403` on
  `https://developers.openai.com/codex/codex-manual.md`; web fallback was
  restricted to official OpenAI domains. Public official coverage is sufficient
  for broad Codex product context, but not sufficient to prove local plugin
  installation mechanics.
- Boundary: local runtime observations and config receipts are stronger than
  public docs for this machine-specific `Access is denied` diagnosis.

## Browser Page Review

- Connector: `mcp__codex_apps__opera_browser_connector`
- Operation: read-only page review via accessibility tree.
- Page: GitHub commit
  `https://github.com/serhiipriadko2-sys/iskra/commit/e6ce1fb0745bac776eaef254663ec6b38d29faae`
- Result: PASS for browser read path.
- Evidence: page title `Expand Iskra runtime toolchain bridge`, commit
  `e6ce1fb`, branch `main`, `56 files changed`, and file tree including
  `plugins/iskra-toolchain-bridge`.
- Residual signal: the page reported `Status checks: failure`, `4 / 6`.

## Status

GitHub, Supabase, and browser read paths are live. Web docs coverage is partial
for Codex local plugin installation. CI status requires a separate GitHub Actions
repair pass if the failing checks are still current.
