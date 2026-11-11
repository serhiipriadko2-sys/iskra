#!/usr/bin/env python3
"""Local HTTP acceptance with temporary fixtures, scoped cleanup and redacted output.

Only the fixed rehearsal project and loopback API/Mailpit are supported. Credentials,
fixture addresses/IDs, message bodies, URLs with tokens and SQL errors stay in RAM.
No model-provider function is called. The root operator runs this controller.
"""

from __future__ import annotations

import argparse
import base64
import hashlib
import hmac
import html
import json
from pathlib import Path
import re
import secrets
import sys
import time
from urllib.error import HTTPError, URLError
from urllib.parse import parse_qs, quote, urlparse
from urllib.request import HTTPRedirectHandler, ProxyHandler, Request, build_opener
import uuid

import local_stack
import rehearse_restore as restore


API = "http://127.0.0.1:18000"
MAIL = "http://127.0.0.1:18025"


class AcceptanceError(Exception):
    def __init__(self, stage: str):
        self.stage = stage
        super().__init__(stage)


class NoRedirect(HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


def request(base: str, path: str, method: str = "GET", body=None, headers=None):
    if base not in {API, MAIL} or not path.startswith("/") or path.startswith("//"):
        raise AcceptanceError("non_loopback_request_forbidden")
    payload = body if isinstance(body, bytes) else (json.dumps(body).encode() if body is not None else None)
    actual_headers = {"Content-Type": "application/json", **(headers or {})}
    req = Request(base + path, data=payload, method=method, headers=actual_headers)
    opener = build_opener(ProxyHandler({}), NoRedirect())
    try:
        response = opener.open(req, timeout=25)
    except HTTPError as error:
        response = error
    except (URLError, OSError):
        raise AcceptanceError("loopback_http_unavailable") from None
    with response:
        raw = response.read(2 * 1024 * 1024)
        location = response.headers.get("Location", "")
        try:
            value = json.loads(raw)
        except (ValueError, UnicodeDecodeError):
            value = raw
        return response.code, value, location


def uuid_value(value: str) -> str:
    try:
        return str(uuid.UUID(value))
    except (ValueError, TypeError, AttributeError):
        raise AcceptanceError("fixture_identity_invalid") from None


def verified_user_jwt(token: str, secret: str, user: str, issuer: str) -> bool:
    try:
        head, body, signature = token.split(".")
        decode = lambda part: base64.urlsafe_b64decode(part + "=" * (-len(part) % 4))
        header, payload = json.loads(decode(head)), json.loads(decode(body))
        expected = hmac.new(secret.encode(), (head + "." + body).encode(), hashlib.sha256).digest()
        return (header.get("alg") == "HS256" and hmac.compare_digest(decode(signature), expected)
                and payload.get("sub") == user and payload.get("role") == "authenticated"
                and payload.get("aud") == "authenticated" and payload.get("iss") == issuer
                and payload.get("exp", 0) > time.time())
    except (ValueError, TypeError, KeyError):
        return False


def fixture_messages(emails: list[str]) -> list[dict]:
    messages = []
    for email in emails:
        status, value, _ = request(MAIL, "/api/v1/search?query=" + quote("to:" + email) + "&limit=100")
        if status != 200 or not isinstance(value, dict):
            raise AcceptanceError("mailpit_search_failed")
        for message in value.get("messages", []):
            recipients = {recipient.get("Address") for recipient in message.get("To", [])}
            if email in recipients:
                messages.append(message)
    return messages


def magic_link(message: dict) -> str:
    content = html.unescape(str(message.get("HTML", "")) + "\n" + str(message.get("Text", "")))
    for candidate in re.findall(r"https?://[^\s<>\"']+", content):
        parsed = urlparse(candidate)
        if (parsed.scheme == "http" and parsed.hostname == "127.0.0.1" and parsed.port == 18000
                and parsed.path == "/auth/v1/verify" and parse_qs(parsed.query).get("type") == ["magiclink"]):
            return parsed.path + "?" + parsed.query
    raise AcceptanceError("fixture_magic_link_not_found")


class RuntimeAcceptance:
    def __init__(self, state: Path):
        self.state = state
        self.env = local_stack.read_environment(state / ".env")
        if self.env.get("SUPABASE_PUBLIC_URL") != API or self.env.get("ISKRA_LOCAL_STATE_DIR") != state.as_posix():
            raise AcceptanceError("private_state_identity_mismatch")
        if self.env.get("GEMINI_API_KEY") or self.env.get("AGENT_ACCESS_TOKEN"):
            raise AcceptanceError("provider_credentials_must_be_empty_for_acceptance")
        self.sources = restore.load_sources(state, restore.DEFAULT_BACKUP)
        self.marker = secrets.token_hex(12)
        self.emails = [f"iskra-smoke-{self.marker}-{index}@example.invalid" for index in (1, 2)]
        self.users: list[str] = []
        self.tokens: list[str] = []
        self.bucket = "iskra-smoke-" + self.marker
        self.bucket_created = False
        self.object_created = False
        self.checks = {}
        self.statuses = {}

    def headers(self, token=None, admin=False, prefer=False):
        key = self.env["SERVICE_ROLE_KEY" if admin else "ANON_KEY"]
        result = {"apikey": key, "Authorization": "Bearer " + (token or key), "Origin": "http://localhost:3000"}
        if prefer:
            result["Prefer"] = "return=representation"
        return result

    def check(self, name, condition, status=None):
        self.checks[name] = bool(condition)
        if status is not None:
            self.statuses[name] = status
        if not condition:
            raise AcceptanceError(name)

    def users_and_login(self):
        for email in self.emails:
            password = secrets.token_urlsafe(32)
            status, created, _ = request(API, "/auth/v1/admin/users", "POST",
                {"email": email, "password": password, "email_confirm": True}, self.headers(admin=True))
            self.check("fixture_users_created", status in {200, 201} and isinstance(created, dict), status)
            self.check("fixture_user_identity_matches_request", created.get("email") == email)
            user = uuid_value(created.get("id"))
            self.users.append(user)
            status, session, _ = request(API, "/auth/v1/token?grant_type=password", "POST",
                {"email": email, "password": password}, self.headers())
            self.check("password_login", status == 200 and isinstance(session, dict), status)
            token = session.get("access_token", "")
            self.check("fresh_hs256_authenticated_jwt", verified_user_jwt(token, self.env["JWT_SECRET"], user,
                                                                         self.env["API_EXTERNAL_URL"]))
            self.tokens.append(token)
            status, account, _ = request(API, "/auth/v1/user", headers=self.headers(token))
            self.check("auth_user_verified", status == 200 and account.get("id") == user, status)
        values = ",".join(restore.literal(user) for user in self.users)
        restore.psql("BEGIN; INSERT INTO public.users(id,name) VALUES " +
                     ",".join("(" + restore.literal(user) + ",'Local acceptance fixture')" for user in self.users) +
                     " ON CONFLICT (id) DO NOTHING; INSERT INTO private.beta_members(user_id,status)"
                     " SELECT id,'active' FROM auth.users WHERE id IN (" + values + ")"
                     " AND NOT EXISTS (SELECT 1 FROM private.beta_members b WHERE b.user_id=auth.users.id); COMMIT;",
                     read_only=False)

    def memory_and_graph(self):
        memory_id = str(uuid.uuid4())
        path = "/rest/v1/memory_nodes?id=eq." + memory_id
        row = {"id": memory_id, "user_id": self.users[0], "layer": "archive", "type": "event",
               "title": "Local acceptance fixture", "content": {"synthetic": True}}
        status, rows, _ = request(API, "/rest/v1/memory_nodes", "POST", row, self.headers(self.tokens[0], prefer=True))
        self.check("memory_owner_create", status == 201 and len(rows) == 1, status)
        status, rows, _ = request(API, path, headers=self.headers(self.tokens[0]))
        self.check("memory_owner_read", status == 200 and len(rows) == 1, status)
        status, rows, _ = request(API, path, headers=self.headers(self.tokens[1]))
        self.check("memory_other_user_read_denied", status == 200 and rows == [], status)
        status, rows, _ = request(API, path, "PATCH", {"title": "Unauthorized fixture change"},
                                   self.headers(self.tokens[1], prefer=True))
        self.check("memory_other_user_update_denied", (status == 200 and rows == []) or status in {401, 403}, status)
        status, rows, _ = request(API, path, headers=self.headers(self.tokens[0]))
        self.check("memory_owner_content_preserved", status == 200 and rows[0]["title"] == row["title"], status)
        status, rows, _ = request(API, path, headers=self.headers())
        self.check("memory_anon_read_denied", status in {401, 403} or (status == 200 and rows == []), status)
        status, rows, _ = request(API, path, "PATCH", {"title": "Local acceptance updated"},
                                   self.headers(self.tokens[0], prefer=True))
        self.check("memory_owner_update", status == 200 and len(rows) == 1, status)
        status, rows, _ = request(API, path, "DELETE", headers=self.headers(self.tokens[0], prefer=True))
        self.check("memory_owner_delete", status == 200 and len(rows) == 1, status)
        nodes = ["smoke-" + self.marker + "-" + str(index) for index in range(3)]
        for index, node in enumerate(nodes):
            owner = 0 if index < 2 else 1
            status, rows, _ = request(API, "/rest/v1/graph_nodes", "POST",
                {"id": node, "user_id": self.users[owner], "layer": "archive", "type": "EVENT",
                 "content": "Local synthetic acceptance fixture"}, self.headers(self.tokens[owner], prefer=True))
            self.check("graph_owner_node_create", status == 201 and len(rows) == 1, status)
        edge = {"id": "smoke-" + self.marker + "-own", "user_id": self.users[0],
                "source": nodes[0], "target": nodes[1], "type": "CAUSAL"}
        status, rows, _ = request(API, "/rest/v1/graph_edges", "POST", edge,
                                   self.headers(self.tokens[0], prefer=True))
        self.check("graph_owned_endpoint_insert", status == 201 and len(rows) == 1, status)
        edge.update(id="smoke-" + self.marker + "-foreign", target=nodes[2])
        status, _, _ = request(API, "/rest/v1/graph_edges", "POST", edge, self.headers(self.tokens[0]))
        self.check("graph_foreign_endpoint_rejected", status in {401, 403}, status)
        status, _, _ = request(API, "/rest/v1/rpc/graph_create_edge", "POST",
            {"p_id": "smoke-" + self.marker + "-anon", "p_source": nodes[0], "p_target": nodes[1], "p_type": "CAUSAL"},
            self.headers())
        self.check("graph_anon_rpc_rejected", status in {401, 403}, status)

    def storage(self):
        status, _, _ = request(API, "/storage/v1/bucket", "POST",
                                {"id": self.bucket, "name": self.bucket, "public": False}, self.headers(admin=True))
        self.check("storage_private_bucket_create", status in {200, 201}, status)
        self.bucket_created = True
        headers = {**self.headers(admin=True), "Content-Type": "text/plain"}
        payload = b"ISKRA local synthetic acceptance fixture\n"
        path = "/storage/v1/object/" + self.bucket + "/fixture.txt"
        status, _, _ = request(API, path, "POST", payload, headers)
        self.check("storage_object_upload", status in {200, 201}, status)
        self.object_created = True
        status, data, _ = request(API, path, headers=self.headers(admin=True))
        self.check("storage_object_download", status == 200 and data == payload, status)
        status, _, _ = request(API, path, headers=self.headers(self.tokens[1]))
        self.check("storage_private_other_user_read_denied", status in {400, 401, 403, 404}, status)
        status, _, _ = request(API, path, headers=self.headers())
        self.check("storage_private_anon_read_denied", status in {400, 401, 403, 404}, status)

    def functions(self):
        root = "/functions/v1/iskra-memory-gateway"
        status, _, _ = request(API, root + "/memory/search", "POST", {})
        self.check("gateway_unauthenticated_rejected", status in {401, 403}, status)
        status, value, _ = request(API, root + "/auth/whoami", "POST", {}, self.headers(self.tokens[0]))
        self.check("gateway_authenticated_whoami", status == 200 and value.get("credential_class") == "authenticated"
                   and value.get("mode") == "probe_only", status)
        status, value, _ = request(API, root + "/memory/search", "POST", {}, self.headers(self.tokens[0]))
        self.check("gateway_privileged_route_held", status == 503 and value.get("error") == "gateway_security_hold", status)
        status, value, _ = request(API, "/functions/v1/kain", "POST", {"metrics": {"pain": 0.4}}, self.headers(self.tokens[0]))
        self.check("kain_authenticated_local_execution", status == 200 and value.get("repairNeeded") is True, status)
        for slug, label in (("iskra-canon-import-1536", "canon_import_retired"),
                            ("iskra-canon-backfill-1536", "canon_backfill_retired")):
            status, _, _ = request(API, "/functions/v1/" + slug, "POST", {}, self.headers(self.tokens[0]))
            self.check(label, status == 410, status)

    def email_magic_link(self):
        status, _, _ = request(API, "/auth/v1/otp", "POST",
                                {"email": self.emails[0], "create_user": False}, self.headers())
        self.check("magic_link_email_requested", status == 200, status)
        deadline = time.monotonic() + 20
        messages = []
        while time.monotonic() < deadline:
            messages = fixture_messages([self.emails[0]])
            if messages:
                break
            time.sleep(0.25)
        self.check("mailpit_received_fixture_message", bool(messages))
        status, message, _ = request(MAIL, "/api/v1/message/" + quote(messages[0]["ID"]))
        self.check("fixture_message_read", status == 200, status)
        status, _, location = request(API, magic_link(message))
        self.check("magic_link_consumed_without_following_redirect", status in {302, 303}, status)
        token = parse_qs(urlparse(location).fragment).get("access_token", [""])[0]
        self.check("magic_link_fresh_authenticated_session", verified_user_jwt(token, self.env["JWT_SECRET"],
                   self.users[0], self.env["API_EXTERNAL_URL"]))
        status, user, _ = request(API, "/auth/v1/user", headers=self.headers(token))
        self.check("magic_link_user_verified", status == 200 and user.get("id") == self.users[0], status)

    def cleanup(self):
        errors = []
        try:
            if self.object_created:
                status, _, _ = request(API, "/storage/v1/object/" + self.bucket, "DELETE",
                                        {"prefixes": ["fixture.txt"]}, self.headers(admin=True))
                if status not in {200, 204}: errors.append("fixture_storage_object_cleanup")
            if self.bucket_created:
                status, _, _ = request(API, "/storage/v1/bucket/" + self.bucket, "DELETE", headers=self.headers(admin=True))
                if status not in {200, 204}: errors.append("fixture_storage_bucket_cleanup")
        except AcceptanceError:
            errors.append("fixture_storage_cleanup_unavailable")
        try:
            ids = list({message["ID"] for message in fixture_messages(self.emails)})
            if ids:  # Mailpit DELETE without explicit IDs would erase unrelated messages.
                status, _, _ = request(MAIL, "/api/v1/messages", "DELETE", {"IDs": ids})
                if status not in {200, 204}: errors.append("fixture_mail_cleanup")
        except (AcceptanceError, KeyError):
            errors.append("fixture_mail_cleanup_unavailable")
        try:
            emails = ",".join(restore.literal(email) for email in self.emails)
            found = restore.query("SELECT COALESCE(json_agg(id),'[]'::json) FROM auth.users WHERE email IN (" + emails + ");")
            users = [uuid_value(user) for user in found]
            if users:
                values = ",".join(restore.literal(user) for user in users)
                statements = ["BEGIN;"]
                for table in ("public.graph_edges", "public.graph_nodes", "public.memory_nodes", "private.beta_members"):
                    statements.append("DELETE FROM " + table + " WHERE user_id IN (" + values + ");")
                statements.extend(["DELETE FROM public.users WHERE id IN (" + values + ");",
                                   "DELETE FROM auth.users WHERE id IN (" + values + ");"])
                patterns = ["payload::text LIKE " + restore.literal("%" + value + "%") for value in users + self.emails]
                statements.append("DELETE FROM auth.audit_log_entries WHERE " + " OR ".join(patterns) + ";")
                statements.append("COMMIT;")
                restore.psql("\n".join(statements), read_only=False)
        except (restore.RehearsalError, AcceptanceError):
            errors.append("fixture_database_cleanup")
        return errors

    def run(self):
        before = restore.verify(self.sources, allow_rehearsal_migrations=True)
        failed = None
        try:
            self.users_and_login()
            self.memory_and_graph()
            self.storage()
            self.functions()
            self.email_magic_link()
        except AcceptanceError as error:
            failed = error.stage
        except (ValueError, KeyError, TypeError, IndexError, restore.RehearsalError):
            failed = "acceptance_response_or_database_failure"
        finally:
            cleanup_errors = self.cleanup()
        verified = None
        try:
            verified = restore.verify(self.sources, allow_rehearsal_migrations=True)
            if verified["row_counts"] != before["row_counts"]:
                cleanup_errors.append("restored_row_counts_changed")
        except restore.RehearsalError:
            cleanup_errors.append("post_cleanup_restore_verification")
        return {"status": "pass" if not failed and not cleanup_errors else "fail", "project": local_stack.PROJECT,
                "checks": self.checks, "http_statuses": self.statuses, "failed_stage": failed,
                "cleanup_errors": cleanup_errors, "fixture_cleanup_verified": not cleanup_errors,
                "restored_tables_after_cleanup": verified["tables_verified"] if verified else None,
                "restored_rows_after_cleanup": sum(verified["row_counts"].values()) if verified else None,
                "provider_calls": 0, "gemini_agent_provider_execution_verified": False,
                "external_access_verified": False, "secrets_output": False}


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--state-dir", required=True)
    args = parser.parse_args(argv)
    try:
        result = RuntimeAcceptance(local_stack.state_path(args.state_dir)).run()
        print(json.dumps(result, indent=2, sort_keys=True))
        return 0 if result["status"] == "pass" else 1
    except (AcceptanceError, restore.RehearsalError, local_stack.StackError, OSError, ValueError, KeyError):
        print(json.dumps({"status": "fail", "error": "local_runtime_precondition_failed", "secrets_output": False}))
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
