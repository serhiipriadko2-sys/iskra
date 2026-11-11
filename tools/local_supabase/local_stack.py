"""Prepare isolated self-hosted Supabase state and run redacted Compose commands.

Runtime credentials are created outside Git. Preparation never starts Docker,
reuses an existing state directory, or changes another Compose project.
"""

from __future__ import annotations

import argparse
import base64
import hashlib
import hmac
import json
import os
from pathlib import Path
import re
import secrets
import shutil
import stat
import subprocess
import sys
import time


PROJECT = "iskra-supabase-local-20261014"
UPSTREAM_COMMIT = "564eab8ad7840b13324f68b1bfac074ef8d51c21"
REPO = Path(__file__).resolve().parents[2]
UPSTREAM = REPO / "infra/supabase-local/upstream"
OVERRIDE = REPO / "infra/supabase-local/compose.local.yml"
SERVICES = frozenset({"db", "studio", "api-gw", "auth", "rest", "realtime", "storage",
                      "imgproxy", "meta", "functions", "supavisor", "mailpit"})


class StackError(Exception):
    """A failed boundary check; messages must never contain credentials."""


def reject_reparse(path: Path) -> None:
    for candidate in (path, *path.parents):
        if candidate.is_symlink():
            raise StackError("State/source paths must not contain symbolic links or junctions")
        try:
            attrs = candidate.lstat().st_file_attributes
        except (FileNotFoundError, AttributeError):
            continue
        if attrs & stat.FILE_ATTRIBUTE_REPARSE_POINT:
            raise StackError("State/source paths must not contain reparse points")


def state_path(value: str, repo: Path = REPO) -> Path:
    path = Path(value).expanduser()
    if not path.is_absolute():
        raise StackError("State directory must be an absolute path")
    reject_reparse(path)
    path = path.resolve()
    repo = repo.resolve()
    if path == repo or repo in path.parents:
        raise StackError("Private state must be outside the Git workspace")
    if path.name != PROJECT:
        raise StackError("State directory name must match the fixed isolated project")
    return path


def private_permissions(path: Path, directory: bool = False) -> None:
    if os.name != "nt":
        path.chmod(0o700 if directory else 0o600)
        return
    # Remove inherited grants before any credential file is created. Use SIDs
    # so localized Windows account/group names do not change the ACL behavior.
    who = subprocess.run(["whoami", "/user", "/fo", "csv", "/nh"],
                         capture_output=True, text=True, check=False)
    sid = re.search(r"S-1-5-(?:\d+-)*\d+", who.stdout)
    if who.returncode or not sid:
        raise StackError("Cannot identify the current account for the private state ACL")
    suffix = ":(OI)(CI)F" if directory else ":F"
    result = subprocess.run(["icacls", str(path), "/inheritance:r", "/grant:r",
                             "*" + sid.group() + suffix, "*S-1-5-18" + suffix],
                            capture_output=True, text=True, check=False)
    if result.returncode:
        raise StackError("Cannot restrict the private state ACL; no credentials were created")


def write_private(path: Path, content: str) -> None:
    with path.open("x", encoding="utf-8", newline="\n") as handle:
        handle.write(content)
    private_permissions(path)


def legacy_jwt(secret: str, role: str, now: int) -> str:
    def encode(value: object) -> str:
        raw = json.dumps(value, separators=(",", ":")).encode()
        return base64.urlsafe_b64encode(raw).rstrip(b"=").decode()
    head = encode({"alg": "HS256", "typ": "JWT"})
    body = encode({"role": role, "iss": "supabase", "iat": now, "exp": now + 315360000})
    signing = f"{head}.{body}"
    signature = hmac.new(secret.encode(), signing.encode(), hashlib.sha256).digest()
    return signing + "." + base64.urlsafe_b64encode(signature).rstrip(b"=").decode()


def make_environment(state: Path) -> tuple[dict[str, str], dict[str, str]]:
    jwt_secret = secrets.token_hex(32)
    now = int(time.time())
    env = {
        "COMPOSE_FILE": "docker-compose.yml", "ISKRA_LOCAL_STATE_DIR": state.as_posix(),
        "POSTGRES_HOST": "db", "POSTGRES_DB": "postgres", "POSTGRES_PORT": "5432",
        "POSTGRES_PASSWORD": secrets.token_hex(32), "JWT_SECRET": jwt_secret,
        "ANON_KEY": legacy_jwt(jwt_secret, "anon", now),
        "SERVICE_ROLE_KEY": legacy_jwt(jwt_secret, "service_role", now),
        "SUPABASE_PUBLISHABLE_KEY": "", "SUPABASE_SECRET_KEY": "",
        "JWT_KEYS": "", "JWT_JWKS": "", "ANON_KEY_ASYMMETRIC": "",
        "SERVICE_ROLE_KEY_ASYMMETRIC": "", "JWT_EXPIRY": "3600",
        "DASHBOARD_USERNAME": "iskra", "DASHBOARD_PASSWORD": secrets.token_hex(24),
        "SECRET_KEY_BASE": secrets.token_hex(48), "REALTIME_DB_ENC_KEY": secrets.token_hex(8),
        "VAULT_ENC_KEY": secrets.token_hex(16), "PG_META_CRYPTO_KEY": secrets.token_hex(32),
        "LOGFLARE_PUBLIC_ACCESS_TOKEN": secrets.token_hex(24),
        "LOGFLARE_PRIVATE_ACCESS_TOKEN": secrets.token_hex(24),
        "S3_PROTOCOL_ACCESS_KEY_ID": secrets.token_hex(16),
        "S3_PROTOCOL_ACCESS_KEY_SECRET": secrets.token_hex(32),
        "MINIO_ROOT_USER": "iskra-storage", "MINIO_ROOT_PASSWORD": secrets.token_hex(24),
        "SUPABASE_PUBLIC_URL": "http://127.0.0.1:18000",
        # v0.8.2 uses the full Auth URL. GoTrue resolves absolute mailer paths
        # with url.URL.ResolveReference; it does not concatenate both prefixes.
        "API_EXTERNAL_URL": "http://127.0.0.1:18000/auth/v1",
        "API_GW_HTTP_PORT": "18000", "KONG_HTTP_PORT": "18000", "KONG_HTTPS_PORT": "18443",
        "SITE_URL": "http://localhost:3000",
        "ADDITIONAL_REDIRECT_URLS": "http://localhost:3000/**,http://127.0.0.1:3000/**",
        "DISABLE_SIGNUP": "true", "ENABLE_EMAIL_SIGNUP": "true",
        "ENABLE_EMAIL_AUTOCONFIRM": "false", "ENABLE_ANONYMOUS_USERS": "false",
        "ENABLE_PHONE_SIGNUP": "false", "ENABLE_PHONE_AUTOCONFIRM": "false",
        "SMTP_ADMIN_EMAIL": "iskra@localhost", "SMTP_HOST": "mailpit", "SMTP_PORT": "1025",
        "SMTP_USER": "", "SMTP_PASS": "", "SMTP_SENDER_NAME": "Iskra Local",
        "MAILER_URLPATHS_CONFIRMATION": "/auth/v1/verify", "MAILER_URLPATHS_INVITE": "/auth/v1/verify",
        "MAILER_URLPATHS_RECOVERY": "/auth/v1/verify", "MAILER_URLPATHS_EMAIL_CHANGE": "/auth/v1/verify",
        "POOLER_PROXY_PORT_TRANSACTION": "6543", "POOLER_DEFAULT_POOL_SIZE": "10",
        "POOLER_MAX_CLIENT_CONN": "100", "POOLER_TENANT_ID": PROJECT, "POOLER_DB_POOL_SIZE": "5",
        "STUDIO_DEFAULT_ORGANIZATION": "Iskra Local", "STUDIO_DEFAULT_PROJECT": "AgiIskra rehearsal",
        "OPENAI_API_KEY": "", "FUNCTIONS_VERIFY_JWT": "true",
        "PGRST_DB_SCHEMAS": "public,graphql_public", "PGRST_DB_MAX_ROWS": "1000",
        "PGRST_DB_EXTRA_SEARCH_PATH": "public", "GLOBAL_S3_BUCKET": "iskra-local",
        "STORAGE_TENANT_ID": PROJECT, "REGION": "local", "IMGPROXY_AUTO_WEBP": "true",
        "DOCKER_SOCKET_LOCATION": "/var/run/docker.sock", "GOOGLE_PROJECT_ID": "",
        "GOOGLE_PROJECT_NUMBER": "", "PROXY_DOMAIN": "", "CERTBOT_EMAIL": "",
    }
    origins = "http://localhost:3000,http://127.0.0.1:3000"
    function_env = {
        "AI_EDGE_ENV": "development", "AI_EDGE_ALLOW_DEV_WILDCARD": "false",
        "AI_EDGE_TEST_MODE": "false", "AI_RATE_LIMIT_IP_HMAC_SECRET": secrets.token_hex(32),
        "AI_EDGE_INGRESS_IP_HEADER": "x-real-ip", "AI_PROXY_ALLOWED_ORIGINS": origins,
        "ISKRA_AGENT_ALLOWED_ORIGINS": origins, "KAIN_ALLOWED_ORIGINS": origins,
        "ISKRA_GATEWAY_ALLOWED_ORIGINS": origins + ",https://chatgpt.com",
        "ISKRA_GATEWAY_EXPECTED_ISSUER": env["API_EXTERNAL_URL"],
        "ISKRA_GATEWAY_EXPECTED_AUDIENCE": "authenticated",
        "GEMINI_API_KEY": "", "AGENT_ID": "", "AGENT_ACCESS_TOKEN": "",
        "EMBED_RL_WINDOW_MS": "60000", "EMBED_RL_MAX": "60",
    }
    # The reviewed local overlay references these through Compose interpolation.
    # Keep the separate function file available for later secure provisioning.
    env.update(function_env)
    return env, function_env


def env_text(env: dict[str, str]) -> str:
    lines = []
    for key, value in env.items():
        if not re.fullmatch(r"[A-Z][A-Z0-9_]*", key) or any(c in value for c in "\n\r\x00'$#"):
            raise StackError("Environment values must be literal single-line values")
        # Single quotes make spaces, URL glob characters and backslashes literal.
        lines.append(f"{key}='{value}'")
    return "\n".join(lines) + "\n"


def copy_sources(source: Path, target: Path) -> int:
    reject_reparse(source)
    count = 0
    for path in sorted(source.rglob("*")):
        reject_reparse(path)
        if not path.is_file() or path.suffix not in {".ts", ".json", ".jsonc", ".lock"}:
            continue
        if path.name.endswith(("_test.ts", ".test.ts")) or "node_modules" in path.parts:
            continue
        destination = target / path.relative_to(source)
        destination.parent.mkdir(parents=True, exist_ok=True)
        if destination.exists():
            raise StackError("Function source collision; preparation stopped")
        shutil.copyfile(path, destination)
        count += 1
    return count


def local_envoy_template() -> str:
    source = (UPSTREAM / "volumes/api/envoy/lds.template.yaml").read_text(encoding="utf-8")
    log_marker = "              access_log:\n"
    route_marker = "              route_config:\n"
    header_marker = ("                    request_headers_to_add:\n"
                     "                      - header:\n"
                     "                          key: X-Forwarded-Host\n")
    if any(source.count(marker) != 1 for marker in (log_marker, route_marker, header_marker)):
        raise StackError("Pinned Envoy template shape changed; inspect before adapting")
    start, end = source.index(log_marker), source.index(route_marker)
    if start >= end:
        raise StackError("Pinned Envoy access-log block is malformed")
    # Auth verification URLs contain one-time credentials. Disable request-path
    # logging before real account use; the immutable upstream copy stays intact.
    source = source[:start] + source[end:]
    replacement = ("                    request_headers_to_add:\n"
                   "                      - header:\n"
                   "                          key: X-Real-IP\n"
                   "                          value: \"%DOWNSTREAM_REMOTE_ADDRESS_WITHOUT_PORT%\"\n"
                   "                        append_action: OVERWRITE_IF_EXISTS_OR_ADD\n"
                   "                      - header:\n"
                   "                          key: X-Forwarded-Host\n")
    # The trusted boundary derives identity from the TCP peer, overwriting any
    # client-supplied X-Real-IP. Functions retain only its HMAC digest.
    return source.replace(header_marker, replacement)


def local_edge_main() -> str:
    source = (UPSTREAM / "volumes/functions/main/index.ts").read_text(encoding="utf-8")
    replacements = {
        "console.error('Symmetric Legacy JWT verification error', e);":
            "console.error('Symmetric Legacy JWT verification error');",
        "console.error('Asymmetric JWT verification error', e);":
            "console.error('Asymmetric JWT verification error');",
        "console.error('JWT format error', e)": "console.error('JWT format error')",
        "console.error(e)": "console.error('JWT authentication failed')",
    }
    # jose claim-validation errors contain decoded JWT payloads. Keep the
    # authorization result, but never serialize the error or its cause/payload.
    for original, replacement in replacements.items():
        if source.count(original) != 1:
            raise StackError("Pinned Edge authentication logging changed; inspect before adapting")
        source = source.replace(original, replacement)
    return source


def prepare(state: Path) -> dict[str, object]:
    if state.exists():
        raise StackError("State directory already exists; preparation never overwrites state")
    required = [UPSTREAM / "docker-compose.yml", UPSTREAM / "volumes/functions/main/index.ts",
                UPSTREAM / "volumes/functions/hello/index.ts", UPSTREAM / "volumes/functions/deno.jsonc"]
    if not all(path.is_file() for path in required):
        raise StackError("Pinned upstream files are incomplete")
    state.mkdir(parents=True, mode=0o700)
    private_permissions(state, directory=True)
    for name in ("functions", "snippets", "storage", "restore", "envoy"):
        (state / name).mkdir(mode=0o700)
    write_private(state / "envoy/lds.template.yaml", local_envoy_template())
    (state / "functions/main").mkdir(mode=0o700)
    write_private(state / "functions/main/index.ts", local_edge_main())
    function_count = 1 + copy_sources(UPSTREAM / "volumes/functions/hello", state / "functions/hello")
    sources = {
        "embed": REPO / "supabase/functions/embed",
        "iskra-memory-gateway": REPO / "supabase/functions/iskra-memory-gateway",
        "gemini": REPO / "runtime/iskraSpace/supabase/functions/gemini",
        "iskra-agent": REPO / "runtime/iskraSpace/supabase/functions/iskra-agent",
        "kain": REPO / "runtime/iskraSpace/supabase/functions/kain",
    }
    for name, source in sources.items():
        function_count += copy_sources(source, state / "functions" / name)
    for source in (REPO / "supabase/functions/_shared", REPO / "runtime/iskraSpace/supabase/functions/_shared"):
        function_count += copy_sources(source, state / "functions/_shared")
    imports = json.loads((UPSTREAM / "volumes/functions/deno.jsonc").read_text(encoding="utf-8"))
    imports.setdefault("imports", {}).update({
        "jose": "npm:jose@6.1.0",
        "supabase-edge-runtime": "jsr:@supabase/functions-js@2.110.5/edge-runtime.d.ts",
    })
    write_private(state / "functions/deno.jsonc", json.dumps(imports, indent=2) + "\n")
    env, function_env = make_environment(state)
    write_private(state / ".env", env_text(env))
    write_private(state / ".env.functions", env_text(function_env))
    write_private(state / "frontend.env", env_text({
        "VITE_SUPABASE_URL": env["SUPABASE_PUBLIC_URL"], "VITE_SUPABASE_ANON_KEY": env["ANON_KEY"],
    }))
    receipt = {"project": PROJECT, "upstream_commit": UPSTREAM_COMMIT, "state_dir": str(state),
               "api_url": env["SUPABASE_PUBLIC_URL"], "studio_url": "http://127.0.0.1:13000",
               "mail_url": "http://127.0.0.1:18025", "function_files": function_count,
               "local_functions": sorted(sources), "gateway_mode": "probe_only",
               "provider_credentials_configured": False, "docker_started": False}
    write_private(state / "prepare-receipt.json", json.dumps(receipt, indent=2) + "\n")
    return receipt


def read_environment(path: Path) -> dict[str, str]:
    reject_reparse(path)
    result = {}
    for line in path.read_text(encoding="utf-8").splitlines():
        if not line.strip() or line.lstrip().startswith("#"):
            continue
        match = re.fullmatch(r"([A-Z][A-Z0-9_]*)=(.*)", line)
        if not match:
            raise StackError("Private environment file contains unsupported syntax")
        key, value = match.groups()
        if value.startswith("'") and value.endswith("'"):
            value = value[1:-1]
        elif value.startswith('"') and value.endswith('"'):
            value = value[1:-1]
        result[key] = value
    return result


def secret_values(env: dict[str, str]) -> list[str]:
    return sorted({value for key, value in env.items() if value and
                   re.search(r"KEY|TOKEN|SECRET|PASSWORD|PASS", key)}, key=len, reverse=True)


def redact(text: str, values: list[str]) -> str:
    for value in values:
        text = text.replace(value, "[REDACTED]")
    return text


def allowed_compose_args(args: list[str]) -> list[str]:
    if not args or args[0] not in {"config", "pull", "up", "start", "stop", "restart", "ps", "images"}:
        raise StackError("Compose command is not allowed")
    command = args[0]
    switches = {
        "config": {"--quiet", "--images"}, "pull": {"--quiet"},
        "up": {"-d", "--detach", "--wait", "--no-deps", "--force-recreate"},
        "start": {"--wait"}, "stop": set(), "restart": {"--no-deps"},
        "ps": {"--all", "-a", "--quiet", "-q"}, "images": {"--quiet", "-q"},
    }
    value_switches = {"up": {"--wait-timeout"}, "start": {"--wait-timeout"},
                      "stop": {"--timeout", "-t"}, "restart": {"--timeout", "-t"}}
    index = 1
    while index < len(args):
        arg = args[index]
        if arg in switches[command]:
            index += 1
        elif arg in value_switches.get(command, set()):
            if index + 1 >= len(args) or not args[index + 1].isdigit() or not 0 < int(args[index + 1]) <= 3600:
                raise StackError("Compose timeout must be between 1 and 3600 seconds")
            index += 2
        elif arg == "--format" and command in {"ps", "images"} and index + 1 < len(args) and args[index + 1] == "json":
            index += 2
        elif arg in SERVICES and command != "config":
            index += 1
        else:
            raise StackError("Compose option or service is not allowed")
    if command == "config" and len(args) > 2:
        raise StackError("Use one supported Compose config mode at a time")
    return args


def compose_prefix(state: Path) -> list[str]:
    return ["docker", "--context", "desktop-linux", "compose", "--project-name", PROJECT,
            "--env-file", str(state / ".env"), "--project-directory", str(UPSTREAM),
            "-f", str(UPSTREAM / "docker-compose.yml"), "-f", str(OVERRIDE)]


def config_summary(config: dict[str, object]) -> dict[str, object]:
    if config.get("name") != PROJECT:
        raise StackError("Compose project name differs from the fixed isolated project")
    services = config.get("services", {})
    if not isinstance(services, dict) or set(services) != SERVICES:
        raise StackError("Compose services differ from the reviewed local stack")
    volumes = config.get("volumes", {})
    if not isinstance(volumes, dict):
        raise StackError("Compose data volumes are missing")
    for volume in volumes.values():
        if not isinstance(volume, dict) or volume.get("external") or not str(volume.get("name", "")).startswith(PROJECT + "_"):
            raise StackError("Compose volumes must belong only to the isolated project")
    data_targets = {"db": "/var/lib/postgresql/data", "storage": "/var/lib/storage", "imgproxy": "/var/lib/storage"}
    summaries = {}
    for name, service in services.items():
        if not isinstance(service, dict):
            raise StackError("Compose service config is malformed")
        ports = service.get("ports", [])
        for port in ports:
            if not isinstance(port, dict) or port.get("host_ip") not in {"127.0.0.1", "::1"}:
                raise StackError("Every published port must be explicitly bound to loopback")
        if name in {"db", "supavisor", "meta", "functions", "auth", "rest", "realtime", "storage", "imgproxy"} and ports:
            raise StackError("A private backend service must not publish a host port")
        container_name = str(service.get("container_name", ""))
        if not (container_name.startswith(PROJECT + "-") or container_name == "realtime-dev." + PROJECT + "-realtime"):
            raise StackError("Compose container name is not isolated")
        if name in data_targets:
            matches = [mount for mount in service.get("volumes", []) if mount.get("target") == data_targets[name]]
            if len(matches) != 1 or matches[0].get("type") != "volume" or matches[0].get("source") not in volumes:
                raise StackError("Database and storage data must use isolated named volumes")
        summaries[name] = {"image": service.get("image"), "container_name": service.get("container_name"),
                           "ports": ports, "mount_targets": [mount.get("target") for mount in service.get("volumes", [])]}
    return {"project": config.get("name"), "services": summaries, "secrets_omitted": True}


def compose(state: Path, args: list[str]) -> int:
    args = allowed_compose_args(args)
    if not state.is_dir() or not OVERRIDE.is_file():
        raise StackError("Prepared private state and local Compose override are required")
    env = read_environment(state / ".env")
    if env.get("ISKRA_LOCAL_STATE_DIR") != state.as_posix():
        raise StackError("Environment belongs to a different private state directory")
    function_env = read_environment(state / ".env.functions")
    values = sorted(set(secret_values(env) + secret_values(function_env)), key=len, reverse=True)
    child_env = {key: value for key, value in os.environ.items() if not key.startswith("COMPOSE_")}
    # Shell variables override Compose env-file values; remove all managed keys.
    child_env = {key: value for key, value in child_env.items() if key not in env and key not in function_env}
    prefix = compose_prefix(state)
    # Inspect the merged configuration before any lifecycle action, not only
    # when the caller explicitly asks for a configuration summary.
    checked = subprocess.run(prefix + ["config", "--format", "json"], capture_output=True,
                             text=True, encoding="utf-8", errors="replace", env=child_env, check=False)
    if checked.stderr:
        print(redact(checked.stderr, values), file=sys.stderr, end="")
    if checked.returncode:
        print("Compose configuration failed; values were suppressed", file=sys.stderr)
        return checked.returncode
    try:
        summary = config_summary(json.loads(checked.stdout))
    except json.JSONDecodeError as exc:
        raise StackError("Compose config JSON could not be parsed") from exc
    config = args[0] == "config"
    if config and "--images" not in args:
        print(json.dumps(summary, indent=2))
        return 0
    result = subprocess.run(prefix + args, capture_output=True,
                            text=True, encoding="utf-8", errors="replace", env=child_env, check=False)
    if result.stderr:
        print(redact(result.stderr, values), file=sys.stderr, end="")
    if result.returncode:
        if not config and result.stdout:
            print(redact(result.stdout, values), end="")
        print("Compose command failed; configuration values were suppressed", file=sys.stderr)
        return result.returncode
    if result.stdout:
        print(redact(result.stdout, values), end="")
    return 0


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--state-dir", required=True)
    commands = parser.add_subparsers(dest="command", required=True)
    commands.add_parser("prepare")
    compose_parser = commands.add_parser("compose")
    compose_parser.add_argument("arguments", nargs=argparse.REMAINDER)
    args = parser.parse_args(argv)
    try:
        state = state_path(args.state_dir)
        if args.command == "prepare":
            print(json.dumps(prepare(state), indent=2))
            return 0
        return compose(state, args.arguments)
    except (StackError, OSError, ValueError) as exc:
        # Errors from file/ACL operations contain paths, never credential values.
        print(f"local-stack: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
