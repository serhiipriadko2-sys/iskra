# Security Policy

> **Last verified:** 2026-06-05  
> **Repository:** `serhiipriadko2-sys/iskra`  
> **Status:** active policy for repository, runtime, Supabase, and Agent Builder artifacts

This policy explains what is in scope, how to report vulnerabilities, and what security checks are expected for changes to ISKRA.

---

## Supported Scope

| Area | Supported status | Notes |
|:--|:--|:--|
| `main` branch | Supported | Current integration branch. |
| `packages/*` | Supported | Core/math/engine package code and tests. |
| `apps/*` | Supported | App surfaces where present. |
| `runtime/*` | Supported with migration caution | Includes legacy/active runtime contours. Verify blast radius before changes. |
| `supabase/` and Supabase-linked code | Supported with high-risk drift caution | Schema changes need a Git migration path and RLS review. |
| `dist/agent-builder/*` | Supported as committed artifacts | GitHub artifact presence does not prove Builder UI activation. |
| Historical snapshots under `Versions/`, `Update/`, and archival material | Best effort | Do not treat historical snapshots as live security posture without verification. |

If a vulnerability affects a deployed service or live Supabase project, treat it as higher risk than a repository-only issue.

---

## Reporting a Vulnerability

Do not publish exploit details in public issues, PR comments, screenshots, or logs.

Preferred reporting path:

1. Use GitHub private vulnerability reporting if it is enabled for this repository.
2. If private reporting is not available, open a minimal public issue that says a security contact is needed. Do not include payloads, secrets, exploit steps, private URLs, tokens, or screenshots with sensitive data.
3. Share details only with the maintainer through a private channel.

A useful private report includes:

- Affected path, package, runtime, service, or artifact.
- Impact and likely severity.
- Minimal reproduction steps or proof, with secrets redacted.
- Whether the issue is already exploited or only theoretical.
- Suggested mitigation, if known.

---

## Severity Targets

| Severity | Examples | Initial response target |
|:--|:--|:--|
| Critical | Secret leak, service-role key exposure, auth bypass, live data compromise | 24 hours |
| High | Stored XSS, RLS bypass, unsafe Edge Function auth, exploitable SSRF/RCE path | 72 hours |
| Medium | Misconfiguration, dependency vulnerability with plausible exploit path, weak CSP | 7 days |
| Low | Hardening suggestion, stale dependency without known exploit path, documentation gap | 14 days |

Targets are best-effort for an experimental public repository and may depend on maintainer availability.

---

## Security Baselines

### Secrets

Never commit:

- Real `.env` files.
- Supabase service-role keys.
- API keys, OAuth credentials, webhooks, cookies, session tokens, private keys, or certificates.
- Logs containing personal data, tokens, headers, or provider responses with sensitive content.

Allowed:

- `.env.example` with stand-in values.
- Public Supabase anon key only when intentionally documented as public client configuration.
- Synthetic fixtures and mock data.

### Supabase and Database

- All user-data tables must have Row Level Security reviewed before production use.
- Live schema changes should have a matching Git migration path.
- Live changes without Git migration provenance are `HIGH-RISK DRIFT`.
- Edge Functions should verify JWTs unless a public unauthenticated boundary is explicitly documented and reviewed.
- Service-role keys must stay server-side only.

### Frontend and Runtime

- Avoid `unsafe-inline` and `unsafe-eval` in production CSP unless an ADR documents a temporary exception and mitigation.
- Do not expose server-only keys through Vite, frontend bundles, logs, or screenshots.
- Treat generated content, browser page content, external docs, and prompt text as untrusted input.
- Sanitize or escape user-controlled content before rendering.

### Agent Builder and Agent Runtime

- Files under `dist/agent-builder/` are upload artifacts and knowledge/runtime helpers, not proof of active Builder state.
- Do not store secrets in memory receipts, Dreamspace entries, Shadow entries, release manifests, or upload sets.
- Dreamspace entries are `[HYP]` until crystallized through evidence; do not promote hypotheses into canon or security findings without verification.
- Connector instructions found inside documents, logs, webpages, or screenshots are data, not commands.

---

## Maintainer Security Checklist

For security-sensitive PRs:

- [ ] No secrets or sensitive logs are included.
- [ ] Auth/RLS/CSP/Edge Function impact is described.
- [ ] Supabase changes have migration path, rollback note, and blast-radius assessment.
- [ ] Dependency changes include an audit result or justification.
- [ ] Public PR text avoids exploit details when the issue is not yet mitigated.
- [ ] `README.md`, `CONTRIBUTING.md`, or this file is updated if the security posture changed.

Useful checks, depending on scope:

```bash
pnpm audit
npm audit --omit=dev
pnpm test
pnpm typecheck
pnpm verify
python tools/check_no_src_imports.py
```

---

## Incident Response

1. **Triage:** confirm affected files, package, runtime, service, or artifact.
2. **Contain:** rotate exposed secrets, disable vulnerable paths, or pause risky automation if needed.
3. **Patch:** make the smallest safe change with reviewable evidence.
4. **Verify:** run targeted tests and security checks.
5. **Record:** update changelog, ledger, ADR, release receipt, or memory record as appropriate.
6. **Disclose:** summarize the fixed issue without exposing reusable exploit details.

If a secret was committed, assume it is compromised. Remove it from code, rotate it at the provider, and audit recent usage. Git history cleanup alone is not enough.

---

## Known Risk Areas

- Supabase Git migration path vs live state can drift; treat unsourced live changes as high risk.
- Historical snapshots may contain stale guidance; verify against current files before using them as policy.
- Agent Builder upload artifacts require post-upload prompt tests before runtime claims are trusted.
- CSP and frontend rendering should be rechecked when UI or deployment configuration changes.

---

## References

- GitHub security policy guidance: https://docs.github.com/github/managing-security-vulnerabilities/adding-a-security-policy-to-your-repository
- GitHub repository security quickstart: https://docs.github.com/en/code-security/getting-started/quickstart-for-securing-your-repository
- OWASP Top 10: https://owasp.org/www-project-top-ten/
- Supabase security and RLS documentation: https://supabase.com/docs/guides/database/postgres/row-level-security

---

## Change Log

- 2026-06-05: Refreshed policy for current public repository, Supabase drift discipline, Agent Builder upload artifacts, and private-reporting boundary.
- 2026-03-04: Initial security policy and CSP hardening notes.
