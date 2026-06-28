from __future__ import annotations

import argparse
import asyncio

from agents import Runner

from .agent import build_iskra_agent


async def main() -> None:
    parser = argparse.ArgumentParser(description="Run Iskra vΩ.7 via OpenAI Agents SDK.")
    parser.add_argument("query", help="User query to send to Iskra.")
    parser.add_argument(
        "--full-instructions",
        action="store_true",
        help="Use the full 32 KB instructions instead of the compact version.",
    )
    args = parser.parse_args()

    agent = build_iskra_agent(prefer_compact=not args.full_instructions)
    result = await Runner.run(agent, args.query)
    print(result.final_output)


if __name__ == "__main__":
    asyncio.run(main())
