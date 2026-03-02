#!/usr/bin/env python3
"""Static gate: pgvector HNSW schema must exist when Supabase is present.

We don't connect to the database here.
This is a repo-local safety net to prevent shipping GraphRAG DB code
without the required SQL migrations / RPC.

Checks:
  - supabase/migrations contains a migration with:
      - "USING hnsw"
      - "vector_cosine_ops"
      - function names: match_memory_nodes, match_memory_causal, upsert_memory_node

Exit codes:
  0 OK
  1 FAIL
"""

from __future__ import annotations

import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def fail(msg: str) -> None:
  print(f"[FAIL] {msg}")
  sys.exit(1)


def main() -> None:
  migrations_dir = ROOT / "supabase" / "migrations"
  if not migrations_dir.exists():
    fail("Missing supabase/migrations (required for pgvector HNSW)")

  sql_files = sorted(migrations_dir.glob("*.sql"))
  if not sql_files:
    fail("supabase/migrations has no .sql files")

  text = "\n".join(p.read_text(encoding="utf-8", errors="replace") for p in sql_files)
  hay = text.lower()

  required = [
    "using hnsw",
    "vector_cosine_ops",
    "match_memory_nodes",
    "match_memory_causal",
    "upsert_memory_node",
  ]
  missing = [x for x in required if x not in hay]
  if missing:
    fail(f"pgvector HNSW migration missing: {', '.join(missing)}")

  print("[OK] pgvector HNSW schema gate")


if __name__ == "__main__":
  main()
