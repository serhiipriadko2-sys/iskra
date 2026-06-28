"""Read-only connector tools for Iskra Agents SDK runtime."""

from .github_tool import github_read
from .supabase_tool import supabase_read

__all__ = ["github_read", "supabase_read"]
