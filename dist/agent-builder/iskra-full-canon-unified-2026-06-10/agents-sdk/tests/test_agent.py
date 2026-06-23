from __future__ import annotations

import os
import unittest
from unittest.mock import patch

from iskra_agent.agent import build_iskra_agent, load_instructions
from iskra_agent.config import (
    AGENTS_SDK_DEPENDENCY_POLICY,
    DESTRUCTIVE_TOOLS_ENABLED,
    HUMAN_REVIEW_REQUIRED_FOR_SIDE_EFFECTS,
    INPUT_GUARDRAILS_REQUIRED,
    OUTPUT_GUARDRAILS_REQUIRED,
    REQUIRES_HUMAN_APPROVAL_FOR_WRITES,
    STATE_STRATEGY,
    TESTED_AGENTS_SDK_VERSION,
    TOOL_GUARDRAILS_REQUIRED,
    TRACING_EXPECTED,
    WORKSPACE_AGENT_API_BOUNDARY,
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
        self.assertIn("Agents SDK Runtime Boundary", agent.instructions)
        self.assertIn("Workspace Agent API triggers", agent.instructions)
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

    def test_tested_sdk_version_policy_is_explicit(self):
        self.assertEqual(TESTED_AGENTS_SDK_VERSION, "0.17.6")
        self.assertIn("Pinned", AGENTS_SDK_DEPENDENCY_POLICY)
        self.assertIn("refresh", AGENTS_SDK_DEPENDENCY_POLICY)

    def test_runtime_alignment_policy_is_explicit(self):
        self.assertEqual(STATE_STRATEGY, "session_or_server_managed_continuation")
        self.assertTrue(TRACING_EXPECTED)
        self.assertTrue(INPUT_GUARDRAILS_REQUIRED)
        self.assertTrue(OUTPUT_GUARDRAILS_REQUIRED)
        self.assertTrue(TOOL_GUARDRAILS_REQUIRED)
        self.assertTrue(HUMAN_REVIEW_REQUIRED_FOR_SIDE_EFFECTS)

    def test_workspace_agent_api_boundary(self):
        self.assertEqual(WORKSPACE_AGENT_API_BOUNDARY["api_base"], "https://api.chatgpt.com/v1")
        self.assertEqual(WORKSPACE_AGENT_API_BOUNDARY["trigger_id_prefix"], "agtch_")
        self.assertIn("not an OpenAI Platform API key", WORKSPACE_AGENT_API_BOUNDARY["auth"])
        self.assertIn("202 Accepted", WORKSPACE_AGENT_API_BOUNDARY["success"])


if __name__ == "__main__":
    unittest.main()
