"""Tests for credential isolation and public Compose boundaries, without Docker."""

import base64
import hashlib
import hmac
import json
from pathlib import Path
import tempfile
import unittest
from urllib.parse import urljoin, urlsplit

from local_stack import (PROJECT, REPO, SERVICES, StackError, allowed_compose_args,
                         config_summary, env_text, legacy_jwt, make_environment,
                         prepare, read_environment, redact, secret_values, state_path)


def valid_config():
    services = {name: {"image": "synthetic/image:1", "container_name": PROJECT + "-" + name,
                       "volumes": [], "ports": [], "environment": {"SECRET": "must-not-appear"}}
                for name in SERVICES}
    services["studio"]["ports"] = [{"host_ip": "127.0.0.1", "published": "13000", "target": 3000}]
    for name, target, source in (("db", "/var/lib/postgresql/data", "iskra-db-data"),
                                 ("storage", "/var/lib/storage", "iskra-storage"),
                                 ("imgproxy", "/var/lib/storage", "iskra-storage")):
        services[name]["volumes"] = [{"type": "volume", "source": source, "target": target}]
    return {"name": PROJECT, "services": services,
            "volumes": {name: {"name": PROJECT + "_" + name} for name in ("iskra-db-data", "iskra-storage")}}


class LocalStackTests(unittest.TestCase):
    def test_legacy_keys_have_independently_verified_hmac_and_roles(self):
        secret = "synthetic-secret"
        for role in ("anon", "service_role"):
            token = legacy_jwt(secret, role, 1000)
            head, body, signature = token.split(".")
            actual = base64.urlsafe_b64decode(signature + "==")
            expected = hmac.new(secret.encode(), (head + "." + body).encode(), hashlib.sha256).digest()
            self.assertEqual(actual, expected)
            claims = json.loads(base64.urlsafe_b64decode(body + "=="))
            self.assertEqual(claims["role"], role)
            self.assertEqual(claims["iat"], 1000)
            self.assertGreater(claims["exp"], claims["iat"])

    def test_preparation_refuses_existing_state_and_workspace_paths(self):
        with tempfile.TemporaryDirectory() as directory:
            existing = Path(directory) / PROJECT
            existing.mkdir()
            (existing / "sentinel").write_text("unchanged")
            with self.assertRaises(StackError):
                prepare(existing)
            self.assertEqual((existing / "sentinel").read_text(), "unchanged")
        with self.assertRaises(StackError):
            state_path(str(REPO / PROJECT))
        with self.assertRaises(StackError):
            state_path("relative/" + PROJECT)

    def test_environment_disables_billed_providers_and_preserves_verification(self):
        env, functions = make_environment(Path("/synthetic") / PROJECT)
        self.assertEqual(env["FUNCTIONS_VERIFY_JWT"], "true")
        self.assertEqual(env["AI_EDGE_TEST_MODE"], "false")
        self.assertEqual(env["GEMINI_API_KEY"], "")
        self.assertEqual(env["OPENAI_API_KEY"], "")
        self.assertEqual(env["SUPABASE_PUBLIC_URL"], "http://127.0.0.1:18000")
        self.assertEqual(env["AI_RATE_LIMIT_IP_HMAC_SECRET"], functions["AI_RATE_LIMIT_IP_HMAC_SECRET"])
        self.assertEqual(len(env["REALTIME_DB_ENC_KEY"]), 16)
        self.assertEqual(len(env["VAULT_ENC_KEY"]), 32)

    def test_environment_round_trip_preserves_paths_and_refuses_injection(self):
        values = {"PATH_VALUE": "E:/Folder with spaces/state", "EMPTY": "", "URL": "http://localhost:3000/**"}
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / ".env"
            path.write_text(env_text(values), encoding="utf-8")
            self.assertEqual(read_environment(path), values)
        for value in ("bad\nKEY=value", "$(bad)", "bad'quote", "bad#comment"):
            with self.assertRaises(StackError):
                env_text({"VALUE": value})

    def test_auth_mail_paths_resolve_once_and_issuer_uses_auth_endpoint(self):
        env, functions = make_environment(Path("/synthetic") / PROJECT)
        self.assertEqual(env["API_EXTERNAL_URL"], env["SUPABASE_PUBLIC_URL"] + "/auth/v1")
        self.assertEqual(functions["ISKRA_GATEWAY_EXPECTED_ISSUER"], env["API_EXTERNAL_URL"])
        # GoTrue v2.196.0 templatemailer uses net/url ResolveReference, whose
        # RFC resolution replaces the base path for these absolute paths.
        for key in ("MAILER_URLPATHS_CONFIRMATION", "MAILER_URLPATHS_INVITE",
                    "MAILER_URLPATHS_RECOVERY", "MAILER_URLPATHS_EMAIL_CHANGE"):
            self.assertEqual(urlsplit(urljoin(env["API_EXTERNAL_URL"], env[key])).path,
                             "/auth/v1/verify")

    def test_redaction_covers_nested_urls_and_all_credential_classes(self):
        env = {"JWT_SECRET": "synthetic-secret", "SERVICE_ROLE_KEY": "synthetic-key", "SITE_URL": "http://localhost"}
        output = redact("postgres://user:synthetic-secret@db synthetic-key http://localhost", secret_values(env))
        self.assertNotIn("synthetic-secret", output)
        self.assertNotIn("synthetic-key", output)
        self.assertIn("http://localhost", output)

    def test_command_scope_cannot_change_project_run_exec_or_remove_data(self):
        for arguments in (["down", "-v"], ["exec", "db", "sh"], ["logs", "db"],
                          ["up", "--project-name", "another"], ["up", "unknown-service"],
                          ["up", "--wait-timeout", "0"], ["config", "--environment"]):
            with self.subTest(arguments=arguments), self.assertRaises(StackError):
                allowed_compose_args(arguments)
        self.assertEqual(allowed_compose_args(["up", "-d", "--wait", "--wait-timeout", "180", "db"]),
                         ["up", "-d", "--wait", "--wait-timeout", "180", "db"])

    def test_config_summary_contains_no_env_or_healthcheck_values(self):
        config = valid_config()
        config["services"]["db"]["healthcheck"] = {"test": ["must-not-appear"]}
        summary = json.dumps(config_summary(config))
        self.assertNotIn("must-not-appear", summary)
        self.assertNotIn("environment", summary)

    def test_config_rejects_public_ports_foreign_services_names_and_data_mounts(self):
        variants = []
        config = valid_config(); config["name"] = "another"; variants.append(config)
        config = valid_config(); config["services"]["studio"]["ports"][0]["host_ip"] = "0.0.0.0"; variants.append(config)
        config = valid_config(); config["services"]["extra"] = {}; variants.append(config)
        config = valid_config(); config["services"]["db"]["container_name"] = "supabase-db"; variants.append(config)
        config = valid_config(); config["services"]["db"]["volumes"][0]["type"] = "bind"; variants.append(config)
        config = valid_config(); config["volumes"]["iskra-db-data"]["external"] = True; variants.append(config)
        for config in variants:
            with self.subTest(config_name=config.get("name")), self.assertRaises(StackError):
                config_summary(config)


if __name__ == "__main__":
    unittest.main()
