"""Rehearsal boundary tests without Docker, real accounts or database writes."""

import subprocess
import hashlib
import unittest
from unittest.mock import patch

import rehearse_restore as rehearsal
from restore_backup import normalize


def sources():
    text = ("\\connect postgres\nCREATE SCHEMA iskra;\n"
            "CREATE TABLE iskra.items (id uuid);\n"
            "CREATE FUNCTION iskra.sample() RETURNS text LANGUAGE sql AS $$ SELECT 'synthetic'; $$;\n"
            "COPY auth.identities (id, user_id) FROM stdin;\nidentity\tuser\n\\.\n"
            "COPY auth.users (id) FROM stdin;\nuser\n\\.\n"
            "COPY iskra.items (id) FROM stdin;\nitem\n\\.\n"
            "ALTER TABLE iskra.items ENABLE ROW LEVEL SECURITY;\n")
    result = {}
    for mode in ("application", "platform-data"):
        sql, manifest = normalize(text, mode)
        result[mode] = {"sql": sql, "manifest": manifest}
    return result


class RehearsalControllerTests(unittest.TestCase):
    def test_docker_stdin_is_binary_utf8_without_windows_newline_conversion(self):
        completed = subprocess.CompletedProcess([], 0, b'synthetic\n', b'')
        sql = "SELECT 'line1\nline2';\n"
        with patch.object(rehearsal.subprocess, "run", return_value=completed) as run:
            result = rehearsal.docker(["exec", "synthetic"], sql)
        self.assertEqual(run.call_args.kwargs["input"], sql.encode("utf-8"))
        self.assertNotIn("text", run.call_args.kwargs)
        self.assertNotIn("encoding", run.call_args.kwargs)
        self.assertEqual(result.stdout, "synthetic\n")

    def test_atomic_import_has_one_transaction_and_replication_role_restored_before_app(self):
        executed = []
        with patch.object(rehearsal, "preflight", return_value={"source_rows": 3}), \
                patch.object(rehearsal, "require_stopped_services"), \
                patch.object(rehearsal, "psql", side_effect=lambda sql, **kwargs: executed.append(sql)):
            result = rehearsal.import_snapshot(sources())
        self.assertTrue(result["atomic_transaction"])
        sql = executed[0]
        self.assertEqual(sql.count("BEGIN;"), 1)
        self.assertEqual(sql.count("COMMIT;"), 1)
        self.assertLess(sql.index("replication_role = replica"), sql.index("COPY auth.users"))
        self.assertLess(sql.index("COPY auth.identities"), sql.index("replication_role = origin"))
        self.assertLess(sql.index("replication_role = origin"), sql.index("CREATE TABLE iskra.items"))

    def test_sensitive_psql_error_context_never_enters_error_details(self):
        output = subprocess.CompletedProcess([], 1, "synthetic private value",
                    "psql:<stdin>: ERROR: 23505\nCONTEXT: COPY users, line 1: synthetic@example.invalid secret_token\n")
        with patch.object(rehearsal, "docker", return_value=output):
            with self.assertRaises(rehearsal.RehearsalError) as raised:
                rehearsal.psql("synthetic sql")
        self.assertEqual(raised.exception.details, {"sqlstate": "23505"})
        self.assertNotIn("example", str(raised.exception))
        self.assertNotIn("secret_token", str(raised.exception.details))

    def test_database_identity_gate_rejects_another_project(self):
        output = subprocess.CompletedProcess([], 0, "katestudio|db|true", "")
        with patch.object(rehearsal, "docker", return_value=output), self.assertRaises(rehearsal.RehearsalError):
            rehearsal.database_boundary()

    def test_import_requires_app_services_stopped(self):
        output = subprocess.CompletedProcess([], 0, "db\nauth\nmailpit\n", "")
        with patch.object(rehearsal, "docker", return_value=output), self.assertRaises(rehearsal.RehearsalError) as raised:
            rehearsal.require_stopped_services()
        self.assertEqual(raised.exception.details["running_services"], ["auth"])

    def test_contract_captures_tables_functions_and_rls(self):
        contract = rehearsal.application_contract(sources())
        self.assertEqual(contract["tables"], ["iskra.items"])
        self.assertEqual(contract["functions"], {"iskra.sample": 1})
        self.assertEqual(contract["rls"], {"iskra.items"})

    def test_identifiers_cannot_inject_sql(self):
        with self.assertRaises(rehearsal.RehearsalError):
            rehearsal.relation('public.users"; DROP DATABASE postgres; --')
        self.assertEqual(rehearsal.relation("public.users"), '"public"."users"')

    def migration_sources(self):
        original = "20260101000000"
        text = ("\\connect postgres\n"
                "COPY supabase_migrations.schema_migrations (version, statements) FROM stdin;\n"
                + original + '\t{"synthetic"}\n\\.\n')
        sql, manifest = normalize(text)
        return {"application": {"sql": sql, "manifest": manifest}}

    def test_history_default_rejects_extra_versions(self):
        rows = [{"version": "20260101000000"}, {"version": "20260718200634"}]
        with patch.object(rehearsal, "query", return_value=rows), self.assertRaises(rehearsal.RehearsalError):
            rehearsal.verify_migration_history(self.migration_sources(), False)

    def test_history_allowance_requires_exact_versions_and_git_bodies(self):
        rows = [{"version": "20260101000000", "statement_count": 1, "statement_sha256": "unused"}]
        for version, filename in rehearsal.REHEARSAL_MIGRATIONS.items():
            text = (rehearsal.local_stack.REPO / "supabase" / "migrations" / filename).read_text(encoding="utf-8")
            rows.append({"version": version, "statement_count": 1,
                         "statement_sha256": hashlib.sha256(text.encode()).hexdigest()})
        with patch.object(rehearsal, "query", return_value=rows):
            result = rehearsal.verify_migration_history(self.migration_sources(), True)
        self.assertEqual(result["history_rows"], 5)
        self.assertEqual(len(result["allowed_rehearsal_versions_verified"]), 4)
        rows[-1]["statement_sha256"] = "wrong"
        with patch.object(rehearsal, "query", return_value=rows), self.assertRaises(rehearsal.RehearsalError):
            rehearsal.verify_migration_history(self.migration_sources(), True)

    def test_history_allows_only_recorded_crlf_to_lf_difference(self):
        rows = [{"version": "20260101000000", "statement_count": 1, "statement_sha256": "unused"}]
        for version, filename in rehearsal.REHEARSAL_MIGRATIONS.items():
            text = (rehearsal.local_stack.REPO / "supabase" / "migrations" / filename).read_text(encoding="utf-8")
            stored = text.replace("\n", "\r\n")
            rows.append({"version": version, "statement_count": 1,
                         "statement_sha256": hashlib.sha256(stored.encode()).hexdigest(),
                         "statement_sha256_lf": hashlib.sha256(stored.replace("\r\n", "\n").encode()).hexdigest()})
        with patch.object(rehearsal, "query", return_value=rows):
            result = rehearsal.verify_migration_history(self.migration_sources(), True)
        self.assertEqual(set(result["crlf_to_lf_comparison_versions"]), set(rehearsal.REHEARSAL_MIGRATIONS))
        rows[-1]["statement_sha256_lf"] = hashlib.sha256(b"additional whitespace is forbidden").hexdigest()
        with patch.object(rehearsal, "query", return_value=rows), self.assertRaises(rehearsal.RehearsalError):
            rehearsal.verify_migration_history(self.migration_sources(), True)
        rows[-1]["version"] = "20990101000000"
        with patch.object(rehearsal, "query", return_value=rows), self.assertRaises(rehearsal.RehearsalError):
            rehearsal.verify_migration_history(self.migration_sources(), True)


if __name__ == "__main__":
    unittest.main()
