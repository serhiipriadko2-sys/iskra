"""Apply only the reviewed Git deltas to the isolated local copy."""

import argparse
import hashlib
import json

import local_stack
import rehearse_restore as restore


FILES = (
    "20260718200634_restore_closed_beta_graph_acl.sql",
    "20260728180000_reconcile_gateway_events_live_schema.sql",
    "20261014000000_graph_table_least_privilege.sql",
    "20261014001000_restore_graphql_runtime.sql",
)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--state-dir", required=True)
    parser.add_argument("--graphql-only", action="store_true",
                        help="apply only the fixed GraphQL parity delta after the initial three were recorded")
    args = parser.parse_args()
    try:
        state = local_stack.state_path(args.state_dir)
        env = local_stack.read_environment(state / ".env")
        if env.get("ISKRA_LOCAL_STATE_DIR") != state.as_posix():
            raise restore.RehearsalError("private_state_identity_mismatch")
        restore.database_boundary()
        restore.require_stopped_services()
        files = FILES[-1:] if args.graphql_only else FILES
        versions = [filename.split("_", 1)[0] for filename in files]
        existing = restore.query(
            "SELECT COALESCE(json_agg(version),'[]'::json) "
            "FROM supabase_migrations.schema_migrations WHERE version IN ("
            + ",".join(restore.literal(version) for version in versions) + ");"
        )
        if existing:
            raise restore.RehearsalError("reviewed_deltas_already_recorded", {"versions": existing})
        parts = ["BEGIN;"]
        receipt = []
        for filename, version in zip(files, versions):
            path = local_stack.REPO / "supabase/migrations" / filename
            text = path.read_text(encoding="utf-8")
            body = restore.transaction_body(text)
            parts.append(body)
            name = filename.split("_", 1)[1].removesuffix(".sql")
            parts.append(
                "INSERT INTO supabase_migrations.schema_migrations(version,statements,name) VALUES ("
                + restore.literal(version) + ",ARRAY[" + restore.literal(text) + "],"
                + restore.literal(name) + ");"
            )
            receipt.append({"version": version, "path": str(path.relative_to(local_stack.REPO)),
                            "sha256": hashlib.sha256(text.encode("utf-8")).hexdigest()})
        parts.append("COMMIT;")
        restore.psql("\n".join(parts), read_only=False)
        privileges = restore.query(
            "SELECT json_agg(json_build_object('role',r,'table',t,'truncate',"
            "has_table_privilege(r,t,'TRUNCATE'),'references',has_table_privilege(r,t,'REFERENCES'),"
            "'trigger',has_table_privilege(r,t,'TRIGGER'))) FROM "
            "unnest(ARRAY['anon','authenticated']) r CROSS JOIN "
            "unnest(ARRAY['public.graph_nodes','public.graph_edges']) t;"
        )
        if any(row[key] for row in privileges for key in ("truncate", "references", "trigger")):
            raise restore.RehearsalError("graph_client_privileges_remain_broad")
        print(json.dumps({"status": "pass", "project": local_stack.PROJECT,
                          "applied": receipt, "graph_privileges": privileges}, indent=2))
        return 0
    except restore.RehearsalError as error:
        print(json.dumps({"status": "error", "error": error.code, **error.details}))
        return 1
    except (local_stack.StackError, OSError, ValueError):
        print(json.dumps({"status": "error", "error": "source_or_private_state_validation_failed"}))
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
