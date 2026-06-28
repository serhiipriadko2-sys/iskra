from pathlib import Path

PACKAGE_ROOT = Path(__file__).resolve().parents[3]
INSTRUCTIONS_PATH = PACKAGE_ROOT / "agent_files" / "instructions"
COMPACT_INSTRUCTIONS_PATH = (
    PACKAGE_ROOT / "agent_files" / "files_for_agent_builder" / "01_AGENT_INSTRUCTIONS_COMPACT.md"
)
CANON_DIR = PACKAGE_ROOT / "agent_files" / "canon_source_files"
KNOWLEDGE_DIRS = [
    CANON_DIR,
    PACKAGE_ROOT / "agent_files" / "files_for_agent_builder",
]

DESTRUCTIVE_TOOLS_ENABLED = False
REQUIRES_HUMAN_APPROVAL_FOR_WRITES = True
TESTED_AGENTS_SDK_VERSION = "0.17.6"
AGENTS_SDK_DEPENDENCY_POLICY = (
    "Pinned for this release's reproducible local tests; refresh against the "
    "official OpenAI Agents SDK docs before cutting the next release."
)

STATE_STRATEGY = "session_or_server_managed_continuation"
TRACING_EXPECTED = True
INPUT_GUARDRAILS_REQUIRED = True
OUTPUT_GUARDRAILS_REQUIRED = True
TOOL_GUARDRAILS_REQUIRED = True
HUMAN_REVIEW_REQUIRED_FOR_SIDE_EFFECTS = True
STRUCTURED_OUTPUTS_RECOMMENDED_FOR_AUDITS = True

WORKSPACE_AGENT_API_BOUNDARY = {
    "api_base": "https://api.chatgpt.com/v1",
    "trigger_id_prefix": "agtch_",
    "auth": "Workspace Agent access token, not an OpenAI Platform API key",
    "success": "202 Accepted queues the run and does not return the final answer",
    "status": "requires published API channel and Builder/UI configuration",
}
