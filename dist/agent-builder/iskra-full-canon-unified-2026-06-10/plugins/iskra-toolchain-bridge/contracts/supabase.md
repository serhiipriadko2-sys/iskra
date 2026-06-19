# Supabase Connector Contract

Connector name: Supabase
Owner: Iskra vOmega.7
Status: proposed
Date: 2026-06-06

## Purpose

Expose Supabase project metadata, database schema, RLS policies, advisors, logs,
branches, Edge Functions, and migrations.

## Scope

Allowed reads:

- Project identity, branch identity, schema metadata, policies, advisors, logs,
  function metadata, migration files.

Allowed writes:

- Branch creation, migrations, function deploys, config changes, only after
  blast-radius review and explicit approval.

Explicitly forbidden:

- Production DDL without Git migration path or explicit emergency drift approval.
- Printing service-role keys, JWT secrets, database passwords, or webhook secrets.
- Inferring live schema from repo migrations alone.

## Operations

| Operation | Read/Write | Approval required | Evidence returned |
|---|---:|---:|---|
| `get_project_identity` | read | no | project ref, org, branch |
| `list_tables` | read | no | schema/table list |
| `list_rls_policies` | read | no | policy names and definitions |
| `run_advisors` | read | no | advisor result ids |
| `create_branch` | write | yes, include cost | branch id, cost, parent |
| `apply_migration` | write | yes | migration id, SQL path, result |
| `deploy_function` | write | yes | function name, version, logs |

## Secret Handling

- Service-role values are never printed or stored.
- Receipts name secret handles only.
- Logs are redacted before quoting.

## Verification

PASS criteria:

- Live project identity is observed before live claims.
- Migration path is linked for schema changes.
- Branch/cost is confirmed before branch creation.

FAIL criteria:

- Live state is claimed from repo files only.
- Production is mutated before branch/staging evidence when branch-first policy applies.

## Rollback

Use migration rollback notes, revert deploys by version, and preserve a drift
receipt if live state diverges from Git.

## Delta

Delta: Supabase runtime work is branch/migration/receipt-gated.
D: live metadata plus Git migration path.
Omega: 0.82 until connector permissions are observed.
Lambda: revise after live Supabase read/write smoke.
