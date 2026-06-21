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
VERIFIED_AGENTS_SDK_VERSION = "0.17.6"
