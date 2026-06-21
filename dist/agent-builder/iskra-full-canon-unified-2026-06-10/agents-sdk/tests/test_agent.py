from __future__ import annotations

import os
import unittest
from unittest.mock import patch

from iskra_agent.agent import build_iskra_agent, load_instructions
from iskra_agent.config import (
    DESTRUCTIVE_TOOLS_ENABLED,
    REQUIRES_HUMAN_APPROVAL_FOR_WRITES,
    VERIFIED_AGENTS_SDK_VERSION,
)
from iskra_agent.tools.github_tool import github_read_impl
from iskra_agent.tools.supabase_tool import supabase_read_impl


class TestIskraAgent(unittest.TestCase):
    def test_load_instructions_compact(self):
        text = load_instructions(prefer_compact=True)
        self.assertIn("Искра", text)
        self.assertIn("Ω", text)
        self.assertIn("Kernel", text)

    def test_load_instructions_full(self):
        text = load_instructions(prefer_compact=False)
        self.assertIn("Искра", text)
        self.assertIn("Ω", text)
        self.assertIn("Prime Directive", text)

    def test_build_agent(self):
        agent = build_iskra_agent(prefer_compact=True)
        self.assertEqual(agent.name, "iskra")
        self.assertTrue(agent.instructions)
        self.assertEqual(len(agent.tools), 2)

    def test_no_destructive_tools_by_default(self):
        agent = build_iskra_agent(prefer_compact=True)
        tool_names = {tool.name for tool in agent.tools}
        self.assertFalse(DESTRUCTIVE_TOOLS_ENABLED)
        self.assertTrue(REQUIRES_HUMAN_APPROVAL_FOR_WRITES)
        self.assertEqual(tool_names, {"github_read_impl", "supabase_read_impl"})
        for forbidden in ("write", "delete", "mutate", "insert", "update", "upsert"):
            self.assertFalse(any(forbidden in name.lower() for name in tool_names))

    def test_supabase_missing_env_is_blocked(self):
        with patch.dict(os.environ, {"SUPABASE_ANON_KEY": ""}):
            result = supabase_read_impl("typcvaszcfdpkzbjzuur", "dream_entries")
        self.assertIn("SUPABASE_ANON_KEY not set", result)

    def test_github_read_errors_are_non_destructive(self):
        with patch("urllib.request.urlopen", side_effect=RuntimeError("blocked test")):
            result = github_read_impl("serhiipriadko2-sys/iskra", "AGENTS.md")
        self.assertIn("[ERROR]", result)
        self.assertIn("raw.githubusercontent.com", result)

    def test_verified_sdk_version_is_pinned(self):
        self.assertEqual(VERIFIED_AGENTS_SDK_VERSION, "0.17.6")


if __name__ == "__main__":
    unittest.main()
