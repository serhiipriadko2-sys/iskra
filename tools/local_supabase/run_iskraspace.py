"""Run IskraSpace against the isolated local backend, without changing env files."""

from __future__ import annotations

import argparse
import base64
import hashlib
import hmac
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import time

import local_stack


API_URL = "http://127.0.0.1:18000"
FRONTEND_URL = "http://127.0.0.1:3000/"
PROVIDER_VARIABLES = {
    "OPENAI_API_KEY", "GEMINI_API_KEY", "GOOGLE_API_KEY", "ANTHROPIC_API_KEY",
    "AGENT_ACCESS_TOKEN", "SUPABASE_SERVICE_ROLE_KEY", "SUPABASE_SECRET_KEY",
    "VITE_OPENAI_API_KEY", "VITE_GEMINI_API_KEY", "VITE_GOOGLE_API_KEY", "VITE_ANTHROPIC_API_KEY",
}


def frontend_environment(state: Path) -> dict[str, str]:
    backend = local_stack.read_environment(state / ".env")
    public = local_stack.read_environment(state / "frontend.env")
    if backend.get("ISKRA_LOCAL_STATE_DIR") != state.as_posix():
        raise local_stack.StackError("Private state identity mismatch")
    if public.get("VITE_SUPABASE_URL") != API_URL or backend.get("SUPABASE_PUBLIC_URL") != API_URL:
        raise local_stack.StackError("Frontend must use the fixed loopback backend URL")
    key = public.get("VITE_SUPABASE_ANON_KEY", "")
    if not key or key != backend.get("ANON_KEY") or key == backend.get("SERVICE_ROLE_KEY"):
        raise local_stack.StackError("Frontend key must match the local anon key")
    try:
        header, payload, signature = key.split(".")
        decode = lambda value: base64.urlsafe_b64decode(value + "=" * (-len(value) % 4))
        algorithm = json.loads(decode(header)).get("alg")
        claims = json.loads(decode(payload))
        expected = hmac.new(backend["JWT_SECRET"].encode(), (header + "." + payload).encode(), hashlib.sha256).digest()
        if algorithm != "HS256" or claims.get("role") != "anon" or claims.get("exp", 0) <= time.time():
            raise ValueError("invalid public credential")
        if not hmac.compare_digest(decode(signature), expected):
            raise ValueError("invalid public signature")
    except (KeyError, ValueError, TypeError, AttributeError):
        raise local_stack.StackError("Frontend anon credential validation failed") from None
    child = {name: value for name, value in os.environ.items()
             if name not in PROVIDER_VARIABLES and name not in backend}
    child.update({"VITE_SUPABASE_URL": API_URL, "VITE_SUPABASE_ANON_KEY": key})
    return child


def launch(state: Path) -> int:
    environment = frontend_environment(state)
    executable = shutil.which("pnpm.cmd" if os.name == "nt" else "pnpm")
    if not executable:
        raise local_stack.StackError("pnpm is unavailable")
    arguments = [executable, "--filter", "iskra-space", "exec", "vite", "--host",
                 "127.0.0.1", "--port", "3000", "--strictPort"]
    # All command arguments are fixed. Credential values are passed only in the
    # child environment, never on the command line or through a shell string.
    process = subprocess.Popen(arguments, cwd=local_stack.REPO, env=environment,
                               shell=False, stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
                               text=True, encoding="utf-8", errors="replace")
    announced = False
    try:
        assert process.stdout is not None
        for line in process.stdout:
            if FRONTEND_URL in line and not announced:
                print("IskraSpace: " + FRONTEND_URL, flush=True)
                announced = True
        status = process.wait()
        if status:
            print("IskraSpace exited with an error; child output was suppressed", file=sys.stderr)
        return status
    except KeyboardInterrupt:
        process.terminate()
        try:
            process.wait(timeout=10)
        except subprocess.TimeoutExpired:
            process.kill()
        return 130


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--state-dir", required=True)
    arguments = parser.parse_args(argv)
    try:
        return launch(local_stack.state_path(arguments.state_dir))
    except (local_stack.StackError, OSError):
        print("IskraSpace launcher validation or process creation failed; values were suppressed", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
