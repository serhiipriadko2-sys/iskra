# ADR: Temporary isolated Supabase rehearsal

Status: proposed for external deployment; local rehearsal authorized by the
user's supplied implementation plan on 2026-10-14.

Context: the managed AgiIskra project is inactive, and an audited PostgreSQL 17
backup contains a richer memory model than a clean Git migration replay. The
user selected both local IskraSpace and later external ChatGPT integration.

Decision: restore an isolated local copy using a pinned official self-hosted
release and project-specific volumes. Retain the original archives. Recreate
runtime secrets outside Git and require fresh sessions. Keep the memory gateway
in `probe_only`. Match Auth/Storage columns before an atomic import, validate
counts and FK/RLS contracts, and apply verified Git migration deltas locally.

Security: fix the observed integrity/Guard ordering defect and remove Graph
client TRUNCATE/REFERENCES/TRIGGER privileges before considering exposure. Those
changes do not establish compliance with the separate metrics-authority ADR.
Only loopback ports are published during rehearsal. External proxy paths,
authentication, TLS renewal, client CSP and actual ChatGPT invocation remain
separate reviewed gates; this ADR does not approve public deployment.

Evidence: workspace Git base `e38ecb00c07176c7a1b0dcbee24ccac3cbe5f786`;
backup compressed SHA-256
`e916fef8a5419bb10efa0a5f0c2c35d13f7150e454aa11aa117f288519125a69`;
upstream `self-hosted/v0.8.2` at
`564eab8ad7840b13324f68b1bfac074ef8d51c21`; executable normalizer and local
Compose boundary checks under `tools/local_supabase/`.

Risk: historical data cannot prove current cloud state. Cloud configuration and
provider credentials are not restored from SQL. Self-hosting transfers backup,
uptime and updates to the host. No Dreamspace persistence or permanent canonical
source-of-truth change is introduced by this rehearsal.

Rollback: stop only the new Compose project; restore the client's previous URL.
Retain original backups and previous Docker volumes. The WSL memory update has a
separate preserved configuration backup.

Verification: local restore and acceptance passed: 42 checked tables, 29 RLS
tables, 27 foreign keys with no orphans, exactly four local migration deltas and
34 HTTP runtime checks with fixture cleanup. F1 policy tests and TypeScript pass.
The loopback external probe passed 15 HTTPS checks and five HTTP-01 routing
checks. JWT failure logging was adapted and checked with a signed expired canary.
Upstream source remains immutable. Results and hashes live under
`infra/supabase-local/`; the execution receipt is the implementation evidence.

Next: approve external deployment only against its concrete change-set and
observed local results. Use the separate empty production certificate store;
verify WAN forwarding, trusted TLS, renewal and actual ChatGPT/Builder access.
Realtime Broadcast and GraphQL two-user/anonymous isolation also passed.
HIGH-RISK DRIFT: local pg_graphql 1.5.11 does not enforce the restored introspection
annotation. GraphQL remains loopback-only and excluded from the public packet
pending a supported-version review. Provider execution, Realtime database-change
subscriptions and the metrics-authority drift remain separate unresolved gates.
