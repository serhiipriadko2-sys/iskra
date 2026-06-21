from __future__ import annotations

import unittest

from iskra_agent.agent import build_iskra_agent, load_instructions


class TestIskraAgent(unittest.TestCase):
    def test_load_instructions_compact(self):
        text = load_instructions(prefer_compact=True)
        self.assertIn("Искра", text)
        self.assertIn("Kernel", text)

    def test_load_instructions_full(self):
        text = load_instructions(prefer_compact=False)
        self.assertIn("Искра", text)
        self.assertIn("Prime Directive", text)

    def test_build_agent(self):
        agent = build_iskra_agent(prefer_compact=True)
        self.assertEqual(agent.name, "iskra")
        self.assertTrue(agent.instructions)
        self.assertEqual(len(agent.tools), 2)


if __name__ == "__main__":
    unittest.main()
