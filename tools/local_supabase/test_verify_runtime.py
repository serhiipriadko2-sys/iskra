"""Runtime acceptance safety tests without HTTP, Docker or real accounts."""

import base64
import hashlib
import hmac
import json
import time
import unittest
from unittest.mock import patch

import verify_runtime as runtime


def fixture():
    value = runtime.RuntimeAcceptance.__new__(runtime.RuntimeAcceptance)
    value.emails = ["synthetic-runtime@example.invalid"]
    value.bucket_created = value.object_created = False
    value.env = {"SERVICE_ROLE_KEY": "synthetic-service-key", "ANON_KEY": "synthetic-anon-key"}
    value.checks, value.statuses, value.sources = {}, {}, {}
    return value


class RuntimeSafetyTests(unittest.TestCase):
    def test_http_refuses_external_destinations_and_protocol_relative_paths(self):
        for base, path in (("https://example.invalid", "/"), (runtime.API, "//example.invalid")):
            with self.assertRaises(runtime.AcceptanceError):
                runtime.request(base, path)

    def test_magic_link_only_selects_fixed_loopback_auth_endpoint(self):
        message = {"HTML": '<a href="http://127.0.0.1:18000/auth/v1/verify?token=synthetic&amp;type=magiclink">link</a>'}
        self.assertEqual(runtime.magic_link(message), "/auth/v1/verify?token=synthetic&type=magiclink")
        with self.assertRaises(runtime.AcceptanceError):
            runtime.magic_link({"HTML": '<a href="https://example.invalid/auth/v1/verify?token=synthetic&type=magiclink">link</a>'})

    def test_mail_cleanup_never_calls_delete_without_explicit_fixture_ids(self):
        value = fixture()
        with patch.object(runtime, "fixture_messages", return_value=[]), \
                patch.object(runtime.restore, "query", return_value=[]), \
                patch.object(runtime, "request") as requested:
            self.assertEqual(value.cleanup(), [])
        requested.assert_not_called()

    def test_database_cleanup_is_scoped_to_users_found_by_fixture_email(self):
        value = fixture()
        user = "00000000-0000-4000-8000-000000000001"
        statements = []
        with patch.object(runtime, "fixture_messages", return_value=[]), \
                patch.object(runtime.restore, "query", return_value=[user]), \
                patch.object(runtime.restore, "psql", side_effect=lambda sql, **kw: statements.append(sql)):
            self.assertEqual(value.cleanup(), [])
        self.assertIn("DELETE FROM auth.users WHERE id IN ('" + user + "')", statements[0])
        self.assertNotIn("TRUNCATE", statements[0])
        self.assertNotIn("DELETE FROM auth.users;", statements[0])

    def test_cleanup_runs_when_acceptance_step_fails(self):
        value = fixture()
        verified = {"row_counts": {"public.users": 1}, "tables_verified": 1}
        with patch.object(runtime.restore, "verify", return_value=verified), \
                patch.object(value, "users_and_login", side_effect=runtime.AcceptanceError("fixture_failure")), \
                patch.object(value, "cleanup", return_value=[]) as cleanup:
            result = value.run()
        cleanup.assert_called_once()
        self.assertEqual(result["status"], "fail")
        self.assertEqual(result["failed_stage"], "fixture_failure")
        self.assertTrue(result["fixture_cleanup_verified"])

    def test_local_jwt_check_rejects_another_key_issuer_or_role(self):
        secret, user, issuer = "synthetic-secret", "fixture-user", runtime.API + "/auth/v1"
        encode = lambda value: base64.urlsafe_b64encode(json.dumps(value).encode()).rstrip(b"=").decode()
        head = encode({"alg": "HS256"})
        body = encode({"sub": user, "role": "authenticated", "aud": "authenticated", "iss": issuer, "exp": time.time() + 600})
        signature = base64.urlsafe_b64encode(hmac.new(secret.encode(), (head + "." + body).encode(), hashlib.sha256).digest()).rstrip(b"=").decode()
        token = head + "." + body + "." + signature
        self.assertTrue(runtime.verified_user_jwt(token, secret, user, issuer))
        self.assertFalse(runtime.verified_user_jwt(token, "other-secret", user, issuer))
        self.assertFalse(runtime.verified_user_jwt(token, secret, user, "other-issuer"))


if __name__ == "__main__":
    unittest.main()
