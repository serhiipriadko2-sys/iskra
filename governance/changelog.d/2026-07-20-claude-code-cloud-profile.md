# CLAUDE.md — Claude Code Cloud Profile (§16)

Adds section 16 to `CLAUDE.md`: an operating profile for **Claude Code on the web / remote-execution environment**, adapted from the local profile in `AGENTS.md §14` (VS Code extension / CLI).

The local profile assumes the user's machine (Windows, Bash **and** PowerShell, `~/.claude` memory, `claude mcp list`, `gh`/git available). The cloud surface differs materially, and §16 records those differences honestly rather than copying the local text:

- **Ephemeral cloud container, not the user's machine** — repo is cloned fresh each session and the container is reclaimed on idle, so `committed-and-pushed` is the only durable state (new surface label).
- **Single Bash shell on Linux** — no PowerShell; the local §14 shell-duality note does not apply.
- **No `gh`/`hub` CLI and no direct GitHub API** — all GitHub operations go through `mcp__github__*`; source ladder and tool discipline rewritten accordingly.
- **Outbound HTTPS via the pre-configured agent proxy** (CA bundle) under the environment's network policy; TLS must never be disabled.
- **Pre-installed Chromium/Playwright**, fixed per-session disk allowance, scratchpad dir for temp files.
- **Cloud-only surfaces** folded in: `Artifact` publishes (third-party claude.ai URLs, not repo writes), `Agent` subagents (background, unverified until checked), `ScheduleWakeup`/`send_later`/`create_trigger` Routines, and `subscribe_pr_activity` PR monitoring with untrusted `<github-webhook-activity>` input.
- **MCP inventory observed this session** (github connected; Supabase needs-auth; Claude_Code_Remote; Box; Hugging_Face; Mem0) with the non-interactive OAuth boundary spelled out.

Surface-label discipline (`container-file-observed`, `github-verified`, `supabase-verified`, `mcp-configured/-authenticated/-connected`, `subagent-reported`, `artifact-published`), the source ladder, security, output contract, and context-update procedure mirror `AGENTS.md §14` re-pointed at cloud tools. Where §16 and `AGENTS.md §14` conflict, §16 wins for the cloud surface and §14 for the local surface; both are updated together.

No runtime/Supabase/package-behavior change — documentation only. `ledger/sot.json` regenerated because `CLAUDE.md` is a tracked SoT file.
