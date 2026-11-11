#!/usr/bin/env python3
"""Review and filter a pg_dumpall backup for an isolated Supabase rehearsal.

This does not connect to PostgreSQL or execute SQL. By default it prints only a
redacted manifest. --output creates a new, private SQL file outside the repository.
Import platform-data first into a compatible, initialized target; application
then supplies the complete application schema, COPY data, policies and ACLs.
Original database roles, credentials and service migration history are excluded.
"""

from __future__ import annotations

import argparse
import gzip
import hashlib
import io
import json
import os
import re
import sys
import zlib
from collections import Counter
from dataclasses import dataclass
from pathlib import Path


APPLICATION_SCHEMAS = frozenset({"public", "iskra", "iskra_memory", "private", "supabase_migrations"})
APPLICATION_EXTENSIONS = frozenset({"vector", "pg_trgm", "pgcrypto", "uuid-ossp"})
PLATFORM_TABLES = (
    "auth.users", "auth.identities", "auth.mfa_factors", "auth.webauthn_credentials",
    "auth.sso_providers", "auth.sso_domains", "auth.saml_providers", "auth.oauth_clients",
    "auth.oauth_consents", "auth.audit_log_entries", "storage.buckets", "storage.objects",
)
TRANSIENT_TABLES = frozenset({
    "auth.sessions", "auth.refresh_tokens", "auth.one_time_tokens", "auth.flow_state",
    "auth.mfa_amr_claims", "auth.mfa_challenges", "auth.oauth_authorizations",
    "auth.oauth_client_states", "auth.saml_relay_states", "auth.webauthn_challenges",
    "storage.s3_multipart_uploads", "storage.s3_multipart_uploads_parts",
})
SERVICE_HISTORY_TABLES = frozenset({
    "auth.schema_migrations", "storage.migrations", "realtime.schema_migrations",
    "supabase_functions.migrations",
})
SESSION_SETTINGS = frozenset({
    "statement_timeout", "lock_timeout", "idle_in_transaction_session_timeout",
    "transaction_timeout", "client_encoding", "standard_conforming_strings",
    "check_function_bodies", "xmloption", "client_min_messages", "row_security",
    "default_tablespace", "default_table_access_method", "default_transaction_read_only",
})
SETTING_VALUES = {
    "statement_timeout": {"0"}, "lock_timeout": {"0"},
    "idle_in_transaction_session_timeout": {"0"}, "transaction_timeout": {"0"},
    "client_encoding": {"UTF8"}, "standard_conforming_strings": {"on"},
    "check_function_bodies": {"false"}, "xmloption": {"content"},
    "client_min_messages": {"warning"}, "row_security": {"off"},
    "default_tablespace": {""}, "default_table_access_method": {"heap"},
    "default_transaction_read_only": {"off"},
}
IDENTIFIER = re.compile(r"[A-Za-z_][A-Za-z_0-9$]*")
DOLLAR = re.compile(r"\$(?:[A-Za-z_][A-Za-z_0-9]*)?\$")
HEADER = re.compile(r"^-- Name: (.*); Type: ([A-Z ]+); Schema: ([^;]+); Owner: [^\r\n]+$", re.M)
MAX_BYTES = 256 * 1024 * 1024


class BackupError(ValueError):
    """Safe error code: never embed source SQL, COPY rows or credentials."""


@dataclass(frozen=True)
class Token:
    kind: str
    value: str
    start: int
    end: int


@dataclass(frozen=True)
class Unit:
    raw: str
    tokens: tuple[Token, ...]
    kind: str = "sql"
    table: str | None = None
    columns: tuple[str, ...] = ()
    rows: int = 0


def skip_space(text: str, position: int) -> int:
    """Skip comments without treating quotes or SQL inside comments as code."""
    while position < len(text):
        if text[position].isspace():
            position += 1
        elif text.startswith("--", position):
            newline = text.find("\n", position)
            position = len(text) if newline < 0 else newline + 1
        elif text.startswith("/*", position):
            depth = 1
            position += 2
            while depth:
                if position >= len(text):
                    raise BackupError("unterminated_comment")
                if text.startswith("/*", position):
                    depth += 1
                    position += 2
                elif text.startswith("*/", position):
                    depth -= 1
                    position += 2
                else:
                    position += 1
        else:
            break
    return position


def quoted(text: str, position: int, delimiter: str, escapes: bool = False) -> int:
    cursor = position + 1
    while cursor < len(text):
        if escapes and text[cursor] == "\\":
            cursor += 2
        elif text[cursor] == delimiter:
            if cursor + 1 < len(text) and text[cursor + 1] == delimiter:
                cursor += 2
            else:
                return cursor + 1
        else:
            cursor += 1
    raise BackupError("unterminated_quoted_token")


def next_token(text: str, position: int) -> Token:
    character = text[position]
    if character == '"':
        end = quoted(text, position, '"')
        value = text[position + 1:end - 1].replace('""', '"')
        return Token("identifier", value, position, end)
    if character == "'" or (character in "eE" and text[position:position + 2].lower() == "e'"):
        beginning = position + 1 if character in "eE" else position
        end = quoted(text, beginning, "'", escapes=beginning != position)
        # Internal values support setval selection, and are never in the manifest.
        value = text[beginning + 1:end - 1].replace("''", "'")
        return Token("string", value, position, end)
    dollar = DOLLAR.match(text, position)
    if dollar:
        end = text.find(dollar.group(), dollar.end())
        if end < 0:
            raise BackupError("unterminated_dollar_quote")
        return Token("body", "", position, end + len(dollar.group()))
    word = IDENTIFIER.match(text, position)
    if word:
        return Token("identifier", word.group().lower(), position, word.end())
    if character.isdigit():
        end = position + 1
        while end < len(text) and (text[end].isdigit() or text[end] == "."):
            end += 1
        return Token("number", text[position:end], position, end)
    if character == "\\" or character == "\x00":
        raise BackupError("unexpected_control_character")
    return Token("symbol", character, position, position + 1)


def identifier(tokens: tuple[Token, ...] | list[Token], position: int) -> tuple[str, int]:
    if position >= len(tokens) or tokens[position].kind != "identifier":
        raise BackupError("expected_identifier")
    value = tokens[position].value
    if not IDENTIFIER.fullmatch(value) and value != "uuid-ossp":
        raise BackupError("unsupported_identifier")
    return value, position + 1


def qualified(tokens: tuple[Token, ...] | list[Token], position: int) -> tuple[str, str, int]:
    schema, cursor = identifier(tokens, position)
    if cursor >= len(tokens) or tokens[cursor].value != ".":
        raise BackupError("expected_qualified_identifier")
    name, cursor = identifier(tokens, cursor + 1)
    return schema, name, cursor


def copy_header(tokens: tuple[Token, ...]) -> tuple[str, tuple[str, ...]]:
    schema, name, cursor = qualified(tokens, 1)
    if cursor >= len(tokens) or tokens[cursor].value != "(":
        raise BackupError("copy_requires_explicit_columns")
    columns = []
    while True:
        column, cursor = identifier(tokens, cursor + 1)
        columns.append(column)
        if cursor >= len(tokens):
            raise BackupError("malformed_copy_columns")
        if tokens[cursor].value == ")":
            cursor += 1
            break
        if tokens[cursor].value != ",":
            raise BackupError("malformed_copy_columns")
    if len(set(columns)) != len(columns):
        raise BackupError("duplicate_copy_columns")
    if [token.value for token in tokens[cursor:]] != ["from", "stdin", ";"]:
        raise BackupError("copy_only_text_stdin_allowed")
    return f"{schema}.{name}", tuple(columns)


def parse_units(text: str):
    """Split SQL lexically; COPY contents and function bodies stay opaque."""
    cursor = 0
    while cursor < len(text):
        start = cursor
        cursor = skip_space(text, cursor)
        if cursor == len(text):
            return
        if text[cursor] == "\\":
            if text[text.rfind("\n", 0, cursor) + 1:cursor].strip():
                raise BackupError("misplaced_psql_command")
            end = text.find("\n", cursor)
            end = len(text) if end < 0 else end + 1
            yield Unit(text[cursor:end], (), kind="psql")
            cursor = end
            continue
        tokens = []
        while True:
            cursor = skip_space(text, cursor)
            if cursor >= len(text):
                raise BackupError("unterminated_statement")
            token = next_token(text, cursor)
            tokens.append(token)
            cursor = token.end
            if token.value == ";" and token.kind == "symbol":
                break
        frozen = tuple(tokens)
        if frozen[0].value != "copy":
            yield Unit(text[start:cursor], frozen)
            continue
        table, columns = copy_header(frozen)
        newline = text.find("\n", cursor)
        if newline < 0 or text[cursor:newline].strip():
            raise BackupError("copy_header_not_on_own_line")
        cursor = newline + 1
        rows = 0
        while True:
            end = text.find("\n", cursor)
            if end < 0:
                raise BackupError("unterminated_copy")
            line = text[cursor:end].removesuffix("\r")
            cursor = end + 1
            if line == "\\.":
                break
            if line.count("\t") + 1 != len(columns):
                raise BackupError("copy_column_count_mismatch")
            if "\x00" in line:
                raise BackupError("copy_contains_nul")
            rows += 1
        yield Unit(text[start:cursor], frozen, kind="copy", table=table, columns=columns, rows=rows)


def token_values(unit: Unit) -> list[str]:
    return [token.value for token in unit.tokens]


def schema_target(unit: Unit) -> tuple[str | None, str]:
    """Resolve the actual SQL object target, independently of dump comments."""
    values = token_values(unit)
    command = values[0]
    cursor = 1
    if command == "create" and values[cursor:cursor + 2] == ["or", "replace"]:
        cursor += 2
    if command == "create" and values[cursor] == "unique":
        cursor += 1
    if command in {"grant", "revoke"}:
        if "on" not in values:
            return None, "cluster_membership"
        cursor = values.index("on") + 1
        object_type = values[cursor]
        if object_type == "all":
            raise BackupError("unrecognized_bulk_grant")
        if object_type in {"table", "sequence", "function", "schema"}:
            cursor += 1
        else:
            object_type = "table"
        if object_type == "schema":
            schema, cursor = identifier(unit.tokens, cursor)
        else:
            schema, _, cursor = qualified(unit.tokens, cursor)
        if object_type == "function":
            if cursor >= len(values) or values[cursor] != "(":
                raise BackupError("function_acl_requires_signature")
            depth = 1
            cursor += 1
            while depth and cursor < len(values):
                if values[cursor] == "(":
                    depth += 1
                elif values[cursor] == ")":
                    depth -= 1
                cursor += 1
            if depth:
                raise BackupError("malformed_function_acl")
        # Never let an allowed first object smuggle additional platform objects.
        boundary = "to" if command == "grant" else "from"
        if cursor >= len(values) or values[cursor] != boundary:
            raise BackupError("multiple_or_malformed_acl_targets")
        return schema, "acl"
    if command == "comment":
        if values[1] != "on":
            raise BackupError("malformed_comment")
        cursor = 2
    if command == "alter" and values[1:3] == ["default", "privileges"]:
        if "schema" not in values:
            raise BackupError("default_acl_requires_schema")
        schema, _ = identifier(unit.tokens, values.index("schema") + 1)
        return schema, "default acl"
    object_type = values[cursor]
    cursor += 1
    if object_type == "event":
        if values[cursor] != "trigger":
            raise BackupError("unrecognized_event_command")
        return None, "event trigger"
    if object_type in {"role", "database", "publication"}:
        identifier(unit.tokens, cursor)
        return None, object_type
    if object_type == "extension":
        if values[cursor:cursor + 3] == ["if", "not", "exists"]:
            cursor += 3
        extension, _ = identifier(unit.tokens, cursor)
        return None, f"extension:{extension}"
    if object_type == "schema":
        schema, _ = identifier(unit.tokens, cursor)
        return schema, "schema"
    if object_type in {"index", "trigger", "policy"} and command == "create":
        if "on" not in values[cursor:]:
            raise BackupError("object_requires_target_table")
        on = values.index("on", cursor) + 1
        if values[on] == "only":
            on += 1
        schema, _, _ = qualified(unit.tokens, on)
        return schema, object_type
    if object_type in {"type", "function", "table", "sequence", "view", "column", "index"}:
        if values[cursor] == "only":
            cursor += 1
        schema, _, _ = qualified(unit.tokens, cursor)
        return schema, object_type
    raise BackupError("unrecognized_sql_object")


def validate_statement(unit: Unit) -> tuple[str | None, str]:
    values = token_values(unit)
    command = values[0]
    if command == "copy":
        return unit.table.split(".", 1)[0], "copy"
    if command == "set":
        if len(values) != 5 or values[1] not in SESSION_SETTINGS or values[2] not in {"=", "to"}:
            raise BackupError("unrecognized_session_setting")
        if values[3] not in SETTING_VALUES[values[1]] or values[4] != ";":
            raise BackupError("unrecognized_session_setting_value")
        return None, "session setting"
    if command == "select":
        if values[1:4] != ["pg_catalog", ".", "set_config"] and values[1:4] != ["pg_catalog", ".", "setval"]:
            raise BackupError("unrecognized_top_level_select")
        if values[4] != "(" or unit.tokens[5].kind != "string":
            raise BackupError("malformed_dump_select")
        if values[3] == "set_config":
            if values[5:] != ["search_path", ",", "", ",", "false", ")", ";"]:
                raise BackupError("unrecognized_set_config")
            return None, "session setting"
        sequence = values[5]
        if not re.fullmatch(r"[A-Za-z_][A-Za-z_0-9]*\.[A-Za-z_][A-Za-z_0-9]*", sequence):
            raise BackupError("unsupported_sequence_identifier")
        if len(values) != 12 or values[6] != "," or unit.tokens[7].kind != "number" or values[8] != "," or values[9] not in {"true", "false"} or values[10:] != [")", ";"]:
            raise BackupError("malformed_setval")
        return sequence.split(".", 1)[0], "sequence set"
    if command not in {"create", "alter", "comment", "grant", "revoke"}:
        raise BackupError("unrecognized_or_destructive_top_level_command")
    return schema_target(unit)


def application_trigger_on_auth(unit: Unit, schema: str | None, kind: str) -> bool:
    """Retain profile/bootstrap triggers on auth.users calling app functions."""
    values = token_values(unit)
    if kind != "trigger" or schema != "auth" or values[:2] != ["create", "trigger"]:
        return False
    on = values.index("on") + 1
    target_schema, target_table, _ = qualified(unit.tokens, on)
    if (target_schema, target_table) != ("auth", "users") or "execute" not in values:
        return False
    execute = values.index("execute") + 1
    if values[execute] not in {"function", "procedure"}:
        raise BackupError("malformed_application_auth_trigger")
    function_schema, _, _ = qualified(unit.tokens, execute + 1)
    return function_schema in APPLICATION_SCHEMAS


def parse_psql(raw: str) -> tuple[str, str | None]:
    command = raw.strip().split(None, 1)
    if command[0] in {"\\restrict", "\\unrestrict"}:
        if len(command) != 2 or not re.fullmatch(r"[A-Za-z_0-9]+", command[1]):
            raise BackupError("malformed_psql_guard")
        return "guard", None
    if command[0] != "\\connect" or len(command) != 2:
        raise BackupError("unrecognized_psql_command")
    database = command[1]
    if database.startswith('"') and database.endswith('"'):
        database = database[1:-1].replace('""', '"')
    if not IDENTIFIER.fullmatch(database):
        raise BackupError("unsupported_database_identifier")
    return "connect", database


def normalize(text: str, mode: str = "application") -> tuple[str, dict]:
    if mode not in {"application", "platform-data"}:
        raise BackupError("unsupported_mode")
    if "\x00" in text:
        raise BackupError("input_contains_nul")
    database = None
    databases = []
    selected = []
    copies = []
    copy_tables = set()
    exclusions = Counter()
    statements = Counter()
    source_counts = Counter()
    ddl_counts = Counter()
    guards = []
    for unit in parse_units(text):
        if unit.kind == "psql":
            kind, value = parse_psql(unit.raw)
            if kind == "connect":
                database = value
                if value not in databases:
                    databases.append(value)
                exclusions["database_connection_commands"] += 1
            else:
                name, token = unit.raw.strip().split(None, 1)
                if name == "\\restrict":
                    if guards:
                        raise BackupError("nested_psql_guard")
                    guards.append(token)
                elif not guards or guards.pop() != token:
                    raise BackupError("unbalanced_psql_guard")
                exclusions["psql_guard_commands"] += 1
            continue
        try:
            schema, kind = validate_statement(unit)
        except IndexError:
            raise BackupError("malformed_sql_statement") from None
        source_counts[kind] += 1
        if database != "postgres":
            exclusions["outside_postgres_database"] += 1
            continue
        if unit.kind == "copy":
            if unit.table in copy_tables:
                raise BackupError("duplicate_copy_table")
            copy_tables.add(unit.table)
            reason = None
            if unit.table in TRANSIENT_TABLES:
                reason = "transient_session_state"
            elif unit.table in SERVICE_HISTORY_TABLES:
                reason = "target_owned_service_migration_history"
            elif mode == "application" and schema not in APPLICATION_SCHEMAS:
                reason = "platform_data_separate_import"
            elif mode == "platform-data" and unit.table not in PLATFORM_TABLES:
                reason = "outside_platform_data_allowlist"
            copies.append({"table": unit.table, "columns": list(unit.columns), "rows": unit.rows,
                           "included": reason is None, "exclusion": reason})
            if reason:
                exclusions[reason] += 1
            else:
                selected.append(unit)
                statements["copy"] += 1
            continue
        if mode == "platform-data":
            exclusions["platform_data_omits_ddl"] += 1
            continue
        if kind == "session setting":
            selected.append(unit)
            statements[kind] += 1
            continue
        if kind.startswith("extension:"):
            extension = kind.split(":", 1)[1]
            if extension in APPLICATION_EXTENSIONS and token_values(unit)[:2] == ["create", "extension"]:
                selected.append(unit)
                statements[kind] += 1
            else:
                exclusions["target_owned_extension_objects"] += 1
            continue
        if schema not in APPLICATION_SCHEMAS and not application_trigger_on_auth(unit, schema, kind):
            exclusions["cluster_or_platform_objects"] += 1
            continue
        if schema == "public" and kind == "schema":
            exclusions["existing_public_schema_definition"] += 1
            continue
        selected.append(unit)
        statements[kind] += 1
        if token_values(unit)[0] == "create":
            ddl_counts[f"{schema}.{kind}"] += 1
    if guards:
        raise BackupError("unclosed_psql_guard")
    if "postgres" not in databases:
        raise BackupError("postgres_database_not_found")
    if mode == "platform-data":
        rank = {table: index for index, table in enumerate(PLATFORM_TABLES)}
        selected.sort(key=lambda unit: rank[unit.table])
    sql = "\\set ON_ERROR_STOP on\nBEGIN;\n" + "\n".join(unit.raw for unit in selected) + "\nCOMMIT;\n"
    manifest = {
        "format": "iskra-supabase-rehearsal-normalization-v1", "mode": mode,
        "source_databases": databases, "selected_database": "postgres",
        "original_sql_sha256": hashlib.sha256(text.encode("utf-8")).hexdigest(),
        "normalized_sql_sha256": hashlib.sha256(sql.encode("utf-8")).hexdigest(),
        "normalized_sql_bytes": len(sql.encode("utf-8")),
        "selected_statement_counts": dict(sorted(statements.items())),
        "selected_create_object_counts": dict(sorted(ddl_counts.items())),
        "source_statement_counts": dict(sorted(source_counts.items())),
        "excluded_statement_counts": dict(sorted(exclusions.items())),
        "copy_blocks": copies,
        "included_copy_rows": sum(copy["rows"] for copy in copies if copy["included"]),
        "excluded_session_rows": sum(copy["rows"] for copy in copies if copy["exclusion"] == "transient_session_state"),
        "prerequisites": [
            "Fresh isolated PostgreSQL 17 Supabase target with standard platform roles/extensions",
            "Platform COPY columns checked against target before import; target selected tables empty",
            "Import platform-data before application SQL to satisfy auth foreign keys",
            "Existing public application objects must not overlap; imports are atomic and fail on conflicts",
            "Review copied auth.users action-token fields and MFA encryption compatibility before public access",
        ],
        "never_copied": ["cluster role credentials", "old sessions and refresh tokens", "service migration history"],
    }
    return sql, manifest


def read_backup(path: Path) -> tuple[str, str]:
    with path.open("rb") as source:
        compressed = source.read(MAX_BYTES + 1)
    if len(compressed) > MAX_BYTES:
        raise BackupError("compressed_backup_too_large")
    try:
        with gzip.GzipFile(fileobj=io.BytesIO(compressed), mode="rb") as source:
            decompressed = source.read(MAX_BYTES + 1)
    except (OSError, EOFError, zlib.error):
        raise BackupError("invalid_gzip_backup") from None
    if len(decompressed) > MAX_BYTES:
        raise BackupError("decompressed_backup_too_large")
    try:
        text = decompressed.decode("utf-8")
    except UnicodeDecodeError:
        raise BackupError("backup_not_utf8") from None
    return text, hashlib.sha256(compressed).hexdigest()


def write_private_sql(path: Path, sql: str, repository: Path | None = None) -> None:
    repository = (repository or Path(__file__).resolve().parents[2]).resolve()
    destination = path.resolve()
    if destination == repository or repository in destination.parents:
        raise BackupError("private_sql_output_inside_repository_forbidden")
    if not destination.parent.is_dir():
        raise BackupError("private_output_parent_must_exist")
    descriptor = os.open(destination, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
    with os.fdopen(descriptor, "w", encoding="utf-8", newline="") as output:
        output.write(sql)


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input", required=True, type=Path, help="Original pg_dumpall .gz backup (read only)")
    parser.add_argument("--mode", choices=("application", "platform-data"), default="application")
    parser.add_argument("--output", type=Path, help="Exclusive new SQL file outside the repository; parent must already be private")
    arguments = parser.parse_args(argv)
    try:
        text, compressed_hash = read_backup(arguments.input)
        sql, manifest = normalize(text, arguments.mode)
        manifest["compressed_backup_sha256"] = compressed_hash
        manifest["sql_file_written"] = arguments.output is not None
        if arguments.output:
            write_private_sql(arguments.output, sql)
        print(json.dumps(manifest, indent=2, sort_keys=True))
        return 0
    except (BackupError, OSError) as error:
        code = str(error) if isinstance(error, BackupError) else "filesystem_operation_failed"
        print(json.dumps({"status": "error", "error": code}), file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
