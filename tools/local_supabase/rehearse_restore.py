#!/usr/bin/env python3
"""Preflight/import/verify only the fixed, isolated local Iskra Supabase copy.

All psql output is captured in memory. Never print its error detail or COPY
context: those may contain account data. Import is one atomic transaction and
requires application services stopped. This controller never starts/stops them.
"""

from __future__ import annotations

import argparse
from collections import Counter
import hashlib
import json
from pathlib import Path
import re
import subprocess
import sys

import local_stack
from restore_backup import (APPLICATION_SCHEMAS, BackupError, normalize,
                            parse_units, qualified, read_backup, skip_space, token_values)


PROJECT = local_stack.PROJECT
DATABASE_CONTAINER = PROJECT + "-db"
DEFAULT_BACKUP = Path(r"C:\Users\gabra\Downloads\db_cluster-20-08-2026@09-53-05.backup.gz")
SOURCE_SHA256 = "e916fef8a5419bb10efa0a5f0c2c35d13f7150e454aa11aa117f288519125a69"
STOPPED_SERVICES = frozenset({"auth", "rest", "realtime", "storage", "functions",
                              "studio", "meta", "api-gw", "supavisor"})
NAME = re.compile(r"[A-Za-z_][A-Za-z_0-9]*")
REHEARSAL_MIGRATIONS = {
    "20260718200634": "20260718200634_restore_closed_beta_graph_acl.sql",
    "20260728180000": "20260728180000_reconcile_gateway_events_live_schema.sql",
    "20261014000000": "20261014000000_graph_table_least_privilege.sql",
    "20261014001000": "20261014001000_restore_graphql_runtime.sql",
}
HISTORY_TABLE = "supabase_migrations.schema_migrations"


class RehearsalError(Exception):
    def __init__(self, code: str, details: dict | None = None):
        super().__init__(code)
        self.code = code
        self.details = details or {}


def literal(value: str) -> str:
    if not isinstance(value, str) or "\x00" in value:
        raise RehearsalError("invalid_metadata_literal")
    return "'" + value.replace("'", "''") + "'"


def quote_name(value: str) -> str:
    if not NAME.fullmatch(value):
        raise RehearsalError("unsupported_metadata_identifier")
    return '"' + value + '"'


def relation(value: str) -> str:
    pieces = value.split(".")
    if len(pieces) != 2:
        raise RehearsalError("qualified_relation_required")
    return ".".join(quote_name(piece) for piece in pieces)


def docker(arguments: list[str], sql: str | None = None, timeout: int = 180):
    try:
        # Windows text-mode pipes translate LF to CRLF, including newlines
        # inside quoted SQL/function bodies. Send exact UTF-8 bytes instead.
        result = subprocess.run(["docker", "--context", "desktop-linux", *arguments],
                                input=sql.encode("utf-8") if sql is not None else None,
                                capture_output=True, timeout=timeout, check=False)
        return subprocess.CompletedProcess(result.args, result.returncode,
                                           result.stdout.decode("utf-8", errors="replace"),
                                           result.stderr.decode("utf-8", errors="replace"))
    except (OSError, subprocess.TimeoutExpired):
        raise RehearsalError("docker_execution_unavailable_or_timed_out") from None


def database_boundary() -> None:
    template = ('{{index .Config.Labels "com.docker.compose.project"}}|'
                '{{index .Config.Labels "com.docker.compose.service"}}|{{.State.Running}}')
    inspected = docker(["inspect", "--format", template, DATABASE_CONTAINER], timeout=30)
    if inspected.returncode or inspected.stdout.strip() != PROJECT + "|db|true":
        raise RehearsalError("database_container_isolation_check_failed")


def psql(sql: str, read_only: bool = True) -> str:
    if read_only:
        sql = "SET default_transaction_read_only = on;\n" + sql
    result = docker(["exec", "-i", DATABASE_CONTAINER, "psql", "-U", "supabase_admin",
                     "-d", "postgres", "-X", "-q", "-A", "-t", "-v", "ON_ERROR_STOP=1",
                     "-v", "VERBOSITY=sqlstate", "-v", "SHOW_CONTEXT=never", "-f", "-"], sql)
    if result.returncode:
        # SQLSTATE values are fixed diagnostic identifiers, never SQL/COPY data.
        code = re.search(r"(?:ERROR|FATAL):\s*([0-9A-Z]{5})\b", result.stderr)
        details = {"sqlstate": code.group(1)} if code else {}
        raise RehearsalError("psql_failed_output_suppressed", details)
    return result.stdout.strip()


def query(sql: str):
    raw = psql(sql)
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        raise RehearsalError("metadata_query_json_invalid") from None


def load_sources(state: Path, backup: Path) -> dict:
    env = local_stack.read_environment(state / ".env")
    if env.get("ISKRA_LOCAL_STATE_DIR") != state.as_posix():
        raise RehearsalError("private_state_identity_mismatch")
    text, source_hash = read_backup(backup)
    if source_hash != SOURCE_SHA256:
        raise RehearsalError("source_backup_hash_differs_from_audited_backup")
    sources = {}
    for mode, filename in (("platform-data", "platform.sql"), ("application", "application.sql")):
        sql, manifest = normalize(text, mode)
        path = state / "restore" / filename
        local_stack.reject_reparse(path)
        current_hash = hashlib.sha256(path.read_bytes()).hexdigest()
        if current_hash != manifest["normalized_sql_sha256"]:
            raise RehearsalError("private_normalized_sql_hash_mismatch", {"mode": mode})
        sources[mode] = {"sql": sql, "manifest": manifest}
    return sources


def application_contract(sources: dict) -> dict:
    tables = []
    schemas = []
    functions = Counter()
    rls = set()
    for unit in parse_units(sources["application"]["sql"]):
        if unit.kind == "psql":
            continue
        values = token_values(unit)
        if values[:2] == ["create", "table"]:
            schema, name, _ = qualified(unit.tokens, 2)
            tables.append(f"{schema}.{name}")
        elif values[:2] == ["create", "schema"]:
            schemas.append(values[2])
        elif values[:2] == ["create", "function"]:
            schema, name, _ = qualified(unit.tokens, 2)
            functions[f"{schema}.{name}"] += 1
        elif values[:2] == ["alter", "table"] and values[-5:] == ["enable", "row", "level", "security", ";"]:
            cursor = 3 if values[2] == "only" else 2
            schema, name, _ = qualified(unit.tokens, cursor)
            rls.add(f"{schema}.{name}")
    return {"tables": tables, "schemas": schemas, "functions": functions, "rls": rls}


def included_copies(sources: dict, mode: str) -> list[dict]:
    return [block for block in sources[mode]["manifest"]["copy_blocks"] if block["included"]]


def target_tables(tables: list[str]) -> dict:
    wanted = ",".join(literal(table) for table in tables)
    rows = query("SELECT COALESCE(json_agg(json_build_object('table', n.nspname || '.' || c.relname,"
                 " 'rls', c.relrowsecurity)), '[]'::json) FROM pg_catalog.pg_class c"
                 " JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace"
                 f" WHERE c.relkind IN ('r','p') AND n.nspname || '.' || c.relname IN ({wanted});")
    return {row["table"]: row for row in rows}


def row_counts(tables: list[str]) -> dict:
    if not tables:
        return {}
    parts = [f"SELECT {literal(table)} AS relation, count(*) AS rows FROM {relation(table)}" for table in tables]
    return query("SELECT json_object_agg(relation, rows) FROM (" + " UNION ALL ".join(parts) + ") counts;")


def preflight(sources: dict) -> dict:
    database_boundary()
    version = query("SELECT json_build_object('version_num', current_setting('server_version_num')::integer);")
    if version["version_num"] // 10000 != 17:
        raise RehearsalError("target_postgres_major_version_must_be_17")
    app = application_contract(sources)
    platform = included_copies(sources, "platform-data")
    found = target_tables(app["tables"] + [block["table"] for block in platform])
    conflicts = [table for table in app["tables"] if table in found]
    if conflicts:
        raise RehearsalError("application_target_is_not_empty", {"existing_tables": conflicts})
    wanted_schemas = ",".join(literal(schema) for schema in app["schemas"])
    schema_conflicts = query("SELECT COALESCE(json_agg(nspname), '[]'::json) FROM pg_catalog.pg_namespace"
                             f" WHERE nspname IN ({wanted_schemas});")
    if schema_conflicts:
        raise RehearsalError("application_schema_already_exists", {"schemas": schema_conflicts})
    missing_tables = [block["table"] for block in platform if block["table"] not in found]
    if missing_tables:
        raise RehearsalError("platform_copy_target_table_missing", {"tables": missing_tables})
    wanted_tables = ",".join(literal(block["table"]) for block in platform)
    columns = query("SELECT COALESCE(json_agg(json_build_object('table',table_schema||'.'||table_name,"
                    "'column',column_name,'nullable',is_nullable,'default',column_default,"
                    "'identity',is_identity,'generated',is_generated)), '[]'::json)"
                    " FROM information_schema.columns"
                    f" WHERE table_schema||'.'||table_name IN ({wanted_tables});")
    missing_columns = []
    required_columns = []
    for block in platform:
        target = {column["column"]: column for column in columns if column["table"] == block["table"]}
        absent = sorted(set(block["columns"]) - set(target))
        if absent:
            missing_columns.append({"table": block["table"], "columns": absent, "source_rows": block["rows"]})
        required = sorted(column["column"] for column in target.values()
                          if column["column"] not in block["columns"] and column["nullable"] == "NO"
                          and column["default"] is None and column["identity"] == "NO"
                          and column["generated"] == "NEVER")
        if block["rows"] and required:
            required_columns.append({"table": block["table"], "columns": required})
    if missing_columns or required_columns:
        raise RehearsalError("platform_copy_column_contract_mismatch",
                             {"missing_columns": missing_columns, "unprovided_required_columns": required_columns})
    counts = row_counts([block["table"] for block in platform])
    populated = {table: count for table, count in counts.items() if count}
    if populated:
        raise RehearsalError("platform_target_is_not_empty", {"row_counts": populated})
    return {"status": "pass", "project": PROJECT, "postgres_major": 17,
            "platform_copy_tables": len(platform), "application_tables": len(app["tables"]),
            "source_rows": sum(block["rows"] for mode in sources for block in included_copies(sources, mode)),
            "excluded_session_rows": sources["platform-data"]["manifest"]["excluded_session_rows"],
            "sql_hashes": {mode: item["manifest"]["normalized_sql_sha256"] for mode, item in sources.items()}}


def require_stopped_services() -> None:
    result = docker(["ps", "--filter", "label=com.docker.compose.project=" + PROJECT,
                     "--format", '{{.Label "com.docker.compose.service"}}'], timeout=30)
    if result.returncode:
        raise RehearsalError("service_stop_state_check_failed")
    running = set(result.stdout.splitlines())
    active = sorted(running & STOPPED_SERVICES)
    if active:
        raise RehearsalError("application_services_must_be_stopped_for_import", {"running_services": active})


def transaction_body(sql: str) -> str:
    retained = []
    begins = commits = 0
    for unit in parse_units(sql):
        if unit.kind == "psql":
            if unit.raw.strip() != "\\set ON_ERROR_STOP on":
                raise RehearsalError("unexpected_normalized_psql_command")
            continue
        values = token_values(unit)
        if values == ["begin", ";"]:
            begins += 1
        elif values == ["commit", ";"]:
            commits += 1
        else:
            retained.append(unit.raw)
    if begins != 1 or commits != 1:
        raise RehearsalError("normalized_transaction_wrapper_invalid")
    return "\n".join(retained)


def import_snapshot(sources: dict) -> dict:
    checked = preflight(sources)
    require_stopped_services()
    sql = ("BEGIN;\nSET LOCAL session_replication_role = replica;\n"
           + transaction_body(sources["platform-data"]["sql"])
           + "\nSET LOCAL session_replication_role = origin;\n"
           + transaction_body(sources["application"]["sql"]) + "\nCOMMIT;\n")
    psql(sql, read_only=False)
    return {"status": "import_committed", "project": PROJECT, "atomic_transaction": True,
            "source_rows": checked["source_rows"], "services_restarted": False,
            "verification_required": True}


def foreign_key_verification(tables: list[str]) -> dict:
    wanted = ",".join(literal(table) for table in tables)
    keys = query("SELECT COALESCE(json_agg(json_build_object('name',k.conname, 'validated',k.convalidated,"
                 "'match',k.confmatchtype,'child_schema',cn.nspname,'child_table',c.relname,"
                 "'parent_schema',pn.nspname,'parent_table',p.relname,"
                 "'child_columns',ARRAY(SELECT a.attname FROM unnest(k.conkey) WITH ORDINALITY v(num,ord)"
                 " JOIN pg_attribute a ON a.attrelid=k.conrelid AND a.attnum=v.num ORDER BY v.ord),"
                 "'parent_columns',ARRAY(SELECT a.attname FROM unnest(k.confkey) WITH ORDINALITY v(num,ord)"
                 " JOIN pg_attribute a ON a.attrelid=k.confrelid AND a.attnum=v.num ORDER BY v.ord))), '[]'::json)"
                 " FROM pg_constraint k JOIN pg_class c ON c.oid=k.conrelid"
                 " JOIN pg_namespace cn ON cn.oid=c.relnamespace JOIN pg_class p ON p.oid=k.confrelid"
                 " JOIN pg_namespace pn ON pn.oid=p.relnamespace"
                 f" WHERE k.contype='f' AND cn.nspname||'.'||c.relname IN ({wanted});")
    if len(keys) > 200 or any(not key["validated"] for key in keys):
        raise RehearsalError("foreign_key_validation_metadata_invalid")
    parts = []
    for index, key in enumerate(keys):
        child = relation(key["child_schema"] + "." + key["child_table"])
        parent = relation(key["parent_schema"] + "." + key["parent_table"])
        child_columns = key["child_columns"]
        parent_columns = key["parent_columns"]
        if not child_columns or len(child_columns) != len(parent_columns) or key["match"] not in {"s", "f"}:
            raise RehearsalError("unsupported_foreign_key_metadata")
        complete = " AND ".join("c." + quote_name(column) + " IS NOT NULL" for column in child_columns)
        equality = " AND ".join("c." + quote_name(left) + "=p." + quote_name(right)
                                for left, right in zip(child_columns, parent_columns))
        predicate = f"({complete}) AND NOT EXISTS (SELECT 1 FROM {parent} p WHERE {equality})"
        if key["match"] == "f":
            any_present = " OR ".join("c." + quote_name(column) + " IS NOT NULL" for column in child_columns)
            predicate += f" OR (({any_present}) AND NOT ({complete}))"
        parts.append(f"SELECT {index} AS number, count(*) AS orphans FROM {child} c WHERE {predicate}")
    counts = query("SELECT json_object_agg(number,orphans) FROM (" + " UNION ALL ".join(parts) + ") checks;") if parts else {}
    failures = [{"constraint": keys[int(index)]["name"], "orphans": count}
                for index, count in counts.items() if count]
    if failures:
        raise RehearsalError("foreign_key_orphans_detected", {"constraints": failures})
    return {"constraints_checked": len(keys), "orphan_rows": 0}


def original_migration_versions(sources: dict) -> set[str]:
    versions = set()
    for unit in parse_units(sources["application"]["sql"]):
        if unit.kind != "copy" or unit.table != HISTORY_TABLE:
            continue
        column = unit.columns.index("version")
        first_token = skip_space(unit.raw, 0)
        header_end = first_token + unit.tokens[-1].end - unit.tokens[0].start
        rows = unit.raw[header_end:].splitlines()
        for row in rows:
            if not row or row == "\\.":
                continue
            version = row.split("\t")[column]
            if not re.fullmatch(r"[0-9]{14}", version) or version in versions:
                raise RehearsalError("original_migration_versions_invalid")
            versions.add(version)
    return versions


def verify_migration_history(sources: dict, allow_rehearsal_migrations: bool) -> dict:
    originals = original_migration_versions(sources)
    expected = originals | (set(REHEARSAL_MIGRATIONS) if allow_rehearsal_migrations else set())
    rows = query("SELECT COALESCE(json_agg(json_build_object('version',version,"
                 "'statement_count',cardinality(statements), 'statement_sha256',"
                 "encode(extensions.digest(convert_to(array_to_string(statements,E'\\n'),'UTF8'),'sha256'),'hex'),"
                 "'statement_sha256_lf', encode(extensions.digest(convert_to("
                 "replace(array_to_string(statements,E'\\n'),E'\\r\\n',E'\\n'),'UTF8'),'sha256'),'hex'))),"
                 "'[]'::json) FROM supabase_migrations.schema_migrations;")
    observed = []
    for row in rows:
        version = row["version"]
        if not isinstance(version, str) or not re.fullmatch(r"[0-9]{14}", version):
            raise RehearsalError("target_migration_version_invalid")
        observed.append(version)
    if len(set(observed)) != len(observed) or set(observed) != expected:
        raise RehearsalError("migration_history_version_set_mismatch",
                             {"missing_versions": sorted(expected - set(observed)),
                              "unexpected_versions": sorted(set(observed) - expected)})
    verified = {}
    newline_normalized = []
    if allow_rehearsal_migrations:
        by_version = {row["version"]: row for row in rows}
        for version, filename in REHEARSAL_MIGRATIONS.items():
            # The local apply controller records one complete, decoded Git file.
            # read_text normalizes CRLF exactly as the applying Python controller.
            text = (local_stack.REPO / "supabase" / "migrations" / filename).read_text(encoding="utf-8")
            digest = hashlib.sha256(text.encode("utf-8")).hexdigest()
            row = by_version[version]
            # Three initial records were transported through Windows text-mode
            # stdin. Root's read-only diagnostic proved CRLF->LF is their only
            # difference. Permit exactly that normalization; never trim, alter
            # other whitespace, or repair/reapply the stored migration bodies.
            exact = row["statement_sha256"] == digest
            canonical_lf = row.get("statement_sha256_lf") == digest
            if row["statement_count"] != 1 or not (exact or canonical_lf):
                raise RehearsalError("rehearsal_migration_body_differs_from_git_file", {"version": version})
            if not exact:
                newline_normalized.append(version)
            verified[version] = digest
    return {"original_versions_verified": len(originals), "history_rows": len(expected),
            "allowed_rehearsal_versions_verified": verified,
            "crlf_to_lf_comparison_versions": newline_normalized}


def verify(sources: dict, allow_rehearsal_migrations: bool = False) -> dict:
    database_boundary()
    app = application_contract(sources)
    copies = [block for mode in sources for block in included_copies(sources, mode)]
    all_tables = [block["table"] for block in copies]
    found = target_tables(all_tables)
    missing = sorted(set(all_tables) - set(found))
    if missing:
        raise RehearsalError("restored_tables_missing", {"tables": missing})
    counts = row_counts(all_tables)
    expected_counts = {block["table"]: block["rows"] for block in copies}
    if allow_rehearsal_migrations:
        expected_counts[HISTORY_TABLE] += len(REHEARSAL_MIGRATIONS)
    differences = [{"table": table, "expected": count, "actual": counts[table]}
                   for table, count in expected_counts.items() if count != counts[table]]
    if differences:
        raise RehearsalError("restored_row_counts_differ", {"tables": differences})
    missing_rls = sorted(table for table in app["rls"] if not found[table]["rls"])
    if missing_rls:
        raise RehearsalError("restored_rls_missing", {"tables": missing_rls})
    schemas = ",".join(literal(schema) for schema in APPLICATION_SCHEMAS)
    functions = query("SELECT COALESCE(json_object_agg(name,qty),'{}'::json) FROM ("
                      " SELECT n.nspname||'.'||p.proname AS name,count(*) AS qty FROM pg_proc p"
                      " JOIN pg_namespace n ON n.oid=p.pronamespace"
                      f" WHERE n.nspname IN ({schemas}) AND NOT EXISTS (SELECT 1 FROM pg_depend d"
                      " WHERE d.classid='pg_proc'::regclass AND d.objid=p.oid AND d.deptype='e')"
                      " GROUP BY n.nspname,p.proname) functions;")
    function_diff = {name: {"expected": count, "actual": functions.get(name, 0)}
                     for name, count in app["functions"].items() if functions.get(name, 0) != count}
    if function_diff:
        raise RehearsalError("restored_function_counts_differ", {"functions": function_diff})
    old_state = [block["table"] for block in sources["platform-data"]["manifest"]["copy_blocks"]
                 if block["exclusion"] == "transient_session_state"]
    state_found = target_tables(old_state)
    old_counts = row_counts([table for table in old_state if table in state_found])
    stale = {table: count for table, count in old_counts.items() if count}
    if stale:
        raise RehearsalError("old_session_state_present", {"row_counts": stale})
    history = verify_migration_history(sources, allow_rehearsal_migrations)
    fk = foreign_key_verification(all_tables)
    return {"status": "pass", "project": PROJECT, "row_counts": counts,
            "tables_verified": len(all_tables), "application_functions_verified": sum(app["functions"].values()),
            "rls_tables_verified": len(app["rls"]), "old_session_rows": 0, "foreign_keys": fk,
            "migration_history": history,
            "auth_storage_runtime_verified": False, "external_access_configured": False}


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--state-dir", required=True)
    parser.add_argument("--backup", type=Path, default=DEFAULT_BACKUP)
    parser.add_argument("--allow-rehearsal-migrations", action="store_true",
                        help="verify only: allow exactly the four reviewed local delta versions, checking their Git file hashes")
    parser.add_argument("command", choices=("preflight", "import", "verify"))
    arguments = parser.parse_args(argv)
    try:
        state = local_stack.state_path(arguments.state_dir)
        sources = load_sources(state, arguments.backup)
        if arguments.allow_rehearsal_migrations and arguments.command != "verify":
            raise RehearsalError("rehearsal_migration_allowance_is_verify_only")
        result = (verify(sources, arguments.allow_rehearsal_migrations) if arguments.command == "verify"
                  else {"preflight": preflight, "import": import_snapshot}[arguments.command](sources))
        print(json.dumps(result, indent=2, sort_keys=True))
        return 0
    except RehearsalError as error:
        print(json.dumps({"status": "error", "error": error.code, **error.details}), file=sys.stderr)
        return 1
    except (BackupError, local_stack.StackError, OSError, ValueError, KeyError):
        print(json.dumps({"status": "error", "error": "source_or_private_state_validation_failed"}), file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
