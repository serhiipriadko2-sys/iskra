#!/usr/bin/env python3
"""Check basic security guardrails for Supabase Edge Functions.

This is a lightweight, repo-local gate:
- `supabase/config.toml` must explicitly set `[functions.embed] verify_jwt = true`.
- `supabase/functions/embed/index.ts` must:
  - handle OPTIONS (CORS preflight)
  - require an Authorization bearer token

Rationale: prevent accidental public exposure and browser invocation breakage.
"""

from __future__ import annotations

import re
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def fail(msg: str) -> None:
  print(f"[FAIL] {msg}")
  sys.exit(1)


def main() -> None:
  cfg = ROOT / "supabase" / "config.toml"
  if not cfg.exists():
    fail("Missing supabase/config.toml")

  cfg_text = cfg.read_text(encoding="utf-8", errors="replace")
  # Very small TOML check via regex; we only care about this one pin.
  if not re.search(r"\[functions\.embed\]", cfg_text):
    fail("supabase/config.toml missing [functions.embed] section")
  if not re.search(r"^\s*verify_jwt\s*=\s*true\s*$", cfg_text, flags=re.MULTILINE):
    fail("supabase/config.toml must pin verify_jwt = true")

  embed = ROOT / "supabase" / "functions" / "embed" / "index.ts"
  if not embed.exists():
    fail("Missing supabase/functions/embed/index.ts")

  ts = embed.read_text(encoding="utf-8", errors="replace")
  if "req.method === 'OPTIONS'" not in ts and 'req.method === "OPTIONS"' not in ts:
    fail("embed/index.ts must handle OPTIONS preflight")

  # Require bearer token (defense-in-depth, even if verify_jwt is enabled).
  if "Missing Authorization bearer token" not in ts:
    fail("embed/index.ts must reject missing Authorization bearer token")

  print("[OK] supabase edge security gate")


if __name__ == "__main__":
  main()
