# Temporary local Supabase

Status: local restore and runtime acceptance passed on 2026-10-14. The backend
and IskraSpace are running on loopback. The owner approved an external experiment;
it was rolled back after a client TLS validation failure. External access is off.
See [attempt, diagnosis and rollback](public/experiment-20261014.json).

Context: Docker Desktop hosts an isolated copy of AgiIskra for IskraSpace and
later a reviewed external gateway. The managed Supabase project remains a
separate source of truth. This deployment does not activate persona memory.

Decision: use the official self-hosted release `self-hosted/v0.8.2`, commit
`564eab8ad7840b13324f68b1bfac074ef8d51c21`, with an isolation overlay. The source
files and SHA-256 manifest are in `upstream/` and `upstream-manifest.json`.
Do not run upstream reset instructions or expose its default ports.

## Local boundary

Project: `iskra-supabase-local-20261014`. Every container and named volume belongs
to this project. API: `http://127.0.0.1:18000`; Studio:
`http://127.0.0.1:13000`; Mailpit: `http://127.0.0.1:18025`.
Database, pooler, Realtime and internal services have no published host ports.
IskraSpace: `http://127.0.0.1:3000/`. Its browser rendering and invitation screen
were observed; Auth and magic-link consumption were separately verified via HTTP.

Runtime credentials, function copies and normalized SQL belong to the protected
directory `E:/IskraSupabase/iskra-supabase-local-20261014`, outside Git. The local
HS256 credentials are fresh; cloud credentials and session state are not reused.
Mailpit captures local test email and does not provide external SMTP delivery.
Model-provider credentials must be provisioned separately before provider calls.
The memory gateway retains `probe_only` and its existing authorization boundary.
The original archives and pre-existing Docker volumes were retained. Docker/WSL
now has an 8 GiB memory limit; the user explicitly allowed the WSL restart.

## Observed acceptance

- All 12 services healthy; 42 restored tables, 44 application functions, 29 RLS
  tables and 27 foreign keys checked. No orphan rows or old sessions remain.
- 37 original migration records preserved. Exactly four reviewed Git deltas
  applied locally; the checked tables now contain 135 rows, including migration
  history. Migration body comparison permits only the documented CRLF/LF
  transport difference.
- 34 runtime checks passed: fresh password and magic-link sessions, memory CRUD,
  cross-user/anonymous denials, Graph endpoint ownership, private Storage, Kain
  execution and gateway authentication. Fixtures were removed and restored
  counts rechecked. Two retired canon functions still return 410.
- The ZIP contains only one empty-folder placeholder; that zero-byte object was
  restored and downloaded successfully. It contains no additional file payloads.
- F1 integrity fencing was repaired in the frontend policy path; 36 policy tests
  and TypeScript passed. Graph client TRUNCATE/REFERENCES/TRIGGER were revoked.
- 37 Python controller tests, repository Graph contract and sensitive-dump check
  passed. The separate metrics-authority drift remains outside this repair.
- Proxy request access logs are disabled. Derived Edge main keeps JWT validation
  and emits constant authentication errors; a signed expired canary token returned
  401 without its token or decoded payload entering the checked function log.
- The separate HTTPS probe passed 15 loopback checks; HTTP-01 bootstrap passed
  five local routing checks. These do not verify public TLS, renewal or Builder.

Results: [runtime verification](runtime-verification.json),
[JWT log verification](edge-log-verification.json),
[external probe packet](public/README.md). The full execution receipt and hashes
are recorded in `execution-receipt.json`.

Realtime public Broadcast was checked between two temporary clients. The backup's
Realtime publication contains no tables; database-change subscriptions are not
enabled by this restore. Private-channel RLS was not tested. GraphQL required a
fourth Git delta because the image's available extension was not installed;
the backup's disabled-introspection annotation is set before enabling it.
GraphQL query/authentication and two-user/anonymous row isolation passed.
`HIGH-RISK DRIFT:` this image only offers `pg_graphql 1.5.11`, which still serves
introspection despite that annotation. The current version's schema directive
type has no introspection setting. GraphQL stays loopback-only and is excluded
from the public packet; a supported-version review and negative retest are
required before any GraphQL exposure. See [observed result](graphql-verification.json),
[versioned source](https://github.com/supabase/pg_graphql/blob/v1.5.11/src/sql_types.rs),
and [current configuration docs](https://supabase.com/docs/guides/graphql/configuration).
Gemini, embeddings and Agent provider execution remain unconfigured and untested.
Existing canon embeddings are NULL; restoring rows does not enable semantic search.
Managed Supabase account features, OAuth configuration and external SMTP are not
copied by the SQL archive. The cloud project remains a separate inactive backend.

## Preparation and lifecycle

Run from the repository root. Preparation exclusively creates a new private
directory; it refuses existing state and paths inside a Git working tree.

```powershell
python -B tools/local_supabase/local_stack.py --state-dir E:/IskraSupabase/iskra-supabase-local-20261014 prepare
python -B tools/local_supabase/local_stack.py --state-dir E:/IskraSupabase/iskra-supabase-local-20261014 compose config --quiet
python -B tools/local_supabase/local_stack.py --state-dir E:/IskraSupabase/iskra-supabase-local-20261014 compose up -d --wait --wait-timeout 240
```

`prepare` is for a new deployment only; the current state already exists. To use
the restored deployment after a restart, run the `compose up` command above, then:

```powershell
python -B tools/local_supabase/run_iskraspace.py --state-dir E:/IskraSupabase/iskra-supabase-local-20261014
```

Sign in with the restored account's email. Mailpit at `http://127.0.0.1:18025`
receives the local magic link; local email is not sent to an external mailbox.
Do not copy magic links or their tokens into receipts or chat.

Provider values belong in the protected backend `.env`, followed by recreation
of the functions service. The overlay reads `.env`; `.env.functions` is a generated
reference snapshot and is not its input. Provider activation needs its own
configuration and a scoped execution check. Do not place provider keys in Vite.

The wrapper validates the merged project, names, named data volumes and loopback
ports before lifecycle commands. It suppresses interpolated secrets. Never dump
raw Compose config, environment, Docker inspect output, SQL rows or private logs.
Preparation derives private Envoy/Edge files from the immutable pinned upstream
with checked source markers. The execution receipt records their hashes.

## Restore boundary

The source is plain PostgreSQL 17 `pg_dumpall`, not a `pg_restore` archive. The
normalizer retains the full application schemas (`public`, `private`, `iskra`,
`iskra_memory`, `supabase_migrations`) and produces separate Auth/Storage data.
It preserves COPY bodies and function bodies, excludes cluster credentials and
transient sessions, and never overwrites the original archive.

Check destination columns and empty application tables first. Stop consumers
before importing platform data and application SQL in one transaction. Validate
row counts, foreign-key integrity and RLS before restarting consumers. The
backup's 37 migration records are history; replaying all Git migrations is not a
substitute for restoring its richer schema. Apply only verified missing deltas.

## Verification and rollback

Acceptance: healthy services; matching restored counts; no orphan foreign keys;
fresh Auth login; denied cross-user access; Graph client roles lack TRUNCATE,
REFERENCES and TRIGGER; valid function authentication; gateway memory routes
remain held. Provider execution and external ChatGPT calls are separate gates.

Rollback: stop this project through the wrapper and return client configuration
to its prior endpoint. Retain the original backup and all pre-existing Docker
volumes. No `down -v`, global prune, cloud mutation, router change or publication
is part of local rehearsal.

Risk: the backup is historical; later cloud writes cannot be inferred from it.
The pinned release is a compatibility baseline for local rehearsal, not an
approval for public publication. Check current security updates before exposure.
Production app CSP currently lists hosted Supabase origins; public deployment
requires a reviewed same-origin API route or explicit CSP configuration.

Next: identify the target GPT/Builder client before retrying the already authorized
exact `auth/whoami` experiment. Validate TLS with current public trust anchors,
observe an independent external client, renewal and actual Preview. Keep routing
closed while awaiting the target surface. Additional memory or AI routes require
another review.

Sources: [Supabase Docker](https://supabase.com/docs/guides/self-hosting/docker),
[platform restore](https://supabase.com/docs/guides/self-hosting/restore-from-platform).
