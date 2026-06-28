from __future__ import annotations

from agents import function_tool


def github_read_impl(owner_repo: str, path: str, ref: str = "main") -> str:
    """Read a file from a public GitHub repository.

    Args:
        owner_repo: Repository in "owner/repo" format, e.g. "serhiipriadko2-sys/iskra".
        path: File path inside the repository.
        ref: Branch, tag, or commit SHA.

    Returns:
        Raw file content or an error message.
    """
    import urllib.request

    url = f"https://raw.githubusercontent.com/{owner_repo}/{ref}/{path}"
    try:
        with urllib.request.urlopen(url, timeout=20) as response:
            return response.read().decode("utf-8")
    except Exception as exc:
        return f"[ERROR] Failed to read {url}: {exc}"


github_read = function_tool(github_read_impl)
