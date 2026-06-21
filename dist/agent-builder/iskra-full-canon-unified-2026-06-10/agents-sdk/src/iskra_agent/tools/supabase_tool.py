from __future__ import annotations

from agents import function_tool


@function_tool
def supabase_read(project_ref: str, table: str, select: str = "*", limit: int = 10) -> str:
    """Read rows from a Supabase table via the REST API.

    Requires SUPABASE_ANON_KEY environment variable.

    Args:
        project_ref: Supabase project reference, e.g. "typcvaszcfdpkzbjzuur".
        table: Table name.
        select: Columns to select.
        limit: Maximum rows to return.

    Returns:
        JSON string or an error message.
    """
    import json
    import os
    import urllib.request

    anon_key = os.environ.get("SUPABASE_ANON_KEY")
    if not anon_key:
        return "[ERROR] SUPABASE_ANON_KEY not set."

    url = f"https://{project_ref}.supabase.co/rest/v1/{table}?select={select}&limit={limit}"
    headers = {
        "apikey": anon_key,
        "Authorization": f"Bearer {anon_key}",
        "Accept": "application/json",
    }
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=20) as response:
            data = json.loads(response.read().decode("utf-8"))
            return json.dumps(data, ensure_ascii=False, indent=2)
    except Exception as exc:
        return f"[ERROR] Failed to read {url}: {exc}"
