"""Synthetic boundary tests: no real backup rows or credentials in fixtures."""

import gzip
import json
import tempfile
import unittest
from contextlib import redirect_stdout
from io import StringIO
from pathlib import Path

from restore_backup import BackupError, main, normalize, write_private_sql


PREAMBLE = "CREATE ROLE synthetic_role;\nALTER ROLE synthetic_role PASSWORD 'synthetic_password';\n\\connect template1\nSET client_encoding = 'UTF8';\n\\connect postgres\n"


class BackupNormalizationTests(unittest.TestCase):
    def test_copy_and_dollar_functions_preserved_without_interpreting_embedded_commands(self):
        function = "CREATE FUNCTION iskra.example() RETURNS text LANGUAGE sql AS $function$\nSELECT 'DROP DATABASE postgres;';\n-- Name: malicious; Type: TABLE; Schema: auth; Owner: postgres\n$function$;"
        copy = "COPY iskra.example (payload) FROM stdin;\nDROP DATABASE postgres;\n\\connect other\n\\.\n"
        sql, manifest = normalize(PREAMBLE + function + "\n" + copy)
        self.assertIn(function, sql)
        self.assertIn(copy, sql)
        self.assertNotIn("synthetic_password", sql)
        self.assertEqual(manifest["included_copy_rows"], 2)
        self.assertEqual(manifest["source_databases"], ["template1", "postgres"])
        self.assertNotIn("synthetic_password", json.dumps(manifest))
        self.assertNotIn("DROP DATABASE", json.dumps(manifest))

    def test_malformed_copy_fails_before_emitting_output(self):
        for suffix in ("COPY auth.users (id, email) FROM stdin;\nonly_one_field\n\\.\n",
                       "COPY auth.users (id) FROM stdin;\nunterminated\n",
                       "COPY auth.users (id) FROM '/tmp/file';\n",
                       "COPY auth.users (id, id) FROM stdin;\n\\.\n"):
            with self.subTest(suffix=suffix), self.assertRaises(BackupError):
                normalize(PREAMBLE + suffix)

    def test_session_state_excluded_and_platform_copy_dependency_ordered(self):
        source = PREAMBLE + (
            "COPY auth.identities (id, user_id) FROM stdin;\nidentity\tuser\n\\.\n"
            "COPY auth.refresh_tokens (id, token) FROM stdin;\n1\tsynthetic_token\n\\.\n"
            "COPY auth.sessions (id) FROM stdin;\nsession\n\\.\n"
            "COPY auth.users (id) FROM stdin;\nuser\n\\.\n"
            "COPY storage.objects (id, bucket_id) FROM stdin;\nobject\tbucket\n\\.\n"
            "COPY storage.buckets (id) FROM stdin;\nbucket\n\\.\n"
            "COPY auth.schema_migrations (version) FROM stdin;\nversion\n\\.\n"
        )
        sql, manifest = normalize(source, "platform-data")
        self.assertNotIn("synthetic_token", sql)
        self.assertNotIn("COPY auth.sessions", sql)
        self.assertNotIn("COPY auth.schema_migrations", sql)
        self.assertLess(sql.index("COPY auth.users"), sql.index("COPY auth.identities"))
        self.assertLess(sql.index("COPY storage.buckets"), sql.index("COPY storage.objects"))
        self.assertEqual(manifest["excluded_session_rows"], 2)
        self.assertEqual(manifest["included_copy_rows"], 4)

    def test_actual_schema_scope_controls_selection(self):
        source = PREAMBLE + (
            "-- Name: pretend; Type: TABLE; Schema: iskra; Owner: postgres\n"
            "CREATE TABLE auth.pretend (id uuid);\n"
            "CREATE TABLE private.beta_members (id uuid);\n"
            "ALTER TABLE private.beta_members OWNER TO postgres;\n"
            "GRANT ALL ON TABLE private.beta_members TO service_role;\n"
            "CREATE SCHEMA public;\nALTER SCHEMA public OWNER TO postgres;\n"
            "CREATE SCHEMA iskra;\n"
        )
        sql, manifest = normalize(source)
        self.assertNotIn("CREATE TABLE auth.pretend", sql)
        self.assertNotIn("CREATE SCHEMA public", sql)
        self.assertNotIn("ALTER SCHEMA public", sql)
        self.assertIn("CREATE TABLE private.beta_members", sql)
        self.assertIn("GRANT ALL ON TABLE private.beta_members", sql)
        self.assertEqual(manifest["selected_create_object_counts"]["private.table"], 1)

    def test_comments_nested_blocks_and_escaped_literals_do_not_split_statements(self):
        source = PREAMBLE + "/* outer /* nested ; */ comment */\nCREATE FUNCTION iskra.sample() RETURNS text LANGUAGE sql AS E'SELECT ''a;''; -- x';\n"
        sql, _ = normalize(source)
        self.assertIn("E'SELECT ''a;''; -- x'", sql)

    def test_unrecognized_top_level_commands_and_meta_commands_fail_closed(self):
        for command in ("DROP DATABASE postgres;", "TRUNCATE public.users;", "DELETE FROM public.users;",
                        "ALTER SYSTEM SET shared_preload_libraries = 'bad';", "\\! echo bad\n",
                        "SELECT evil_function();", "SET session_replication_role = replica;",
                        "SET standard_conforming_strings = off;", "CREATE;",
                        "GRANT ALL ON TABLE public.users, auth.users TO authenticated;",
                        "GRANT USAGE ON SCHEMA iskra, auth TO authenticated;",
                        "COPY auth.users FROM stdin;\n\\.\n"):
            with self.subTest(command=command), self.assertRaises(BackupError):
                normalize(PREAMBLE + command)

    def test_auth_user_trigger_is_retained_only_for_application_function(self):
        source = PREAMBLE + (
            "CREATE TRIGGER app_profile AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.create_profile();\n"
            "CREATE TRIGGER platform_trigger AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION auth.internal_helper();\n"
        )
        sql, manifest = normalize(source)
        self.assertIn("CREATE TRIGGER app_profile", sql)
        self.assertNotIn("CREATE TRIGGER platform_trigger", sql)
        self.assertEqual(manifest["selected_create_object_counts"]["auth.trigger"], 1)

    def test_guards_are_balanced_and_removed(self):
        source = "\\restrict synthetic_guard\n" + PREAMBLE + "\\unrestrict synthetic_guard\n"
        sql, _ = normalize(source)
        self.assertNotIn("restrict", sql)
        with self.assertRaises(BackupError):
            normalize(source.replace("unrestrict synthetic_guard", "unrestrict wrong"))

    def test_sequence_values_and_function_signatures_preserved(self):
        source = PREAMBLE + (
            "CREATE SEQUENCE iskra.counter START WITH 1;\n"
            "SELECT pg_catalog.setval('iskra.counter', 42, true);\n"
            "GRANT ALL ON FUNCTION iskra.function_name(uuid, text) TO service_role;\n"
            "CREATE UNIQUE INDEX idx ON public.users USING btree (id);\n"
        )
        sql, _ = normalize(source)
        self.assertIn("42, true", sql)
        self.assertIn("FUNCTION iskra.function_name(uuid, text)", sql)
        self.assertIn("CREATE UNIQUE INDEX idx", sql)

    def test_private_output_rejects_repo_and_existing_files(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            repository = root / "repository"
            repository.mkdir()
            with self.assertRaises(BackupError):
                write_private_sql(repository / "unsafe.sql", "secret", repository)
            destination = root / "new.sql"
            write_private_sql(destination, "synthetic SQL", repository)
            with self.assertRaises(FileExistsError):
                write_private_sql(destination, "replacement", repository)
            self.assertEqual(destination.read_text(), "synthetic SQL")

    def test_manifest_only_cli_does_not_create_normalized_sql(self):
        with tempfile.TemporaryDirectory() as temporary:
            backup = Path(temporary) / "synthetic.gz"
            backup.write_bytes(gzip.compress(PREAMBLE.encode()))
            output = StringIO()
            with redirect_stdout(output):
                result = main(["--input", str(backup)])
            self.assertEqual(result, 0)
            manifest = json.loads(output.getvalue())
            self.assertFalse(manifest["sql_file_written"])
            self.assertEqual(len(list(Path(temporary).iterdir())), 1)

    def test_corrupt_backup_fails_without_creating_private_output(self):
        from contextlib import redirect_stderr

        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            backup = root / "broken.gz"
            backup.write_bytes(gzip.compress(PREAMBLE.encode())[:-4])
            destination = root / "should_not_exist.sql"
            error = StringIO()
            with redirect_stderr(error):
                result = main(["--input", str(backup), "--output", str(destination)])
            self.assertEqual(result, 1)
            self.assertEqual(json.loads(error.getvalue())["error"], "invalid_gzip_backup")
            self.assertFalse(destination.exists())


if __name__ == "__main__":
    unittest.main()
