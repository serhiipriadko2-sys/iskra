# ISKRA CLI Guide

> Terminal interface for ISKRA AI Companion

## Installation

```bash
# From npm (when published)
npm install -g @iskra/runtime

# From source
cd runtime
npm ci
npm run build:cli
npm link
```

## Quick Start

```bash
# Show help
iskra --help

# Start chat session
iskra chat

# Display metrics
iskra metrics

# Verify statement with SIFT
iskra sift "The Earth is round"
```

---

## Commands

### `iskra chat`

Start an interactive chat session with ISKRA.

**Usage:**
```bash
iskra chat [options]
```

**Options:**
- `-v, --voice <voice>` - Select voice (ISKRA, KAIN, PINO, SAM, ANHANTRA, HUYNDUN, ISKRIV, MAKI, SIBYL)
- `-m, --model <model>` - Select model (default: gemini-2.0-flash)

**Examples:**
```bash
# Default chat
iskra chat

# Chat with KAIN (truth-seeker)
iskra chat --voice KAIN

# Chat with Gemini 2.0 Pro
iskra chat --model gemini-2.0-pro
```

**Interactive Controls:**
- Type your message and press Enter
- Type `exit` or `quit` to end session
- Responses include ∆DΩΛ protocol blocks

---

### `iskra metrics`

Display current ISKRA metrics dashboard.

**Usage:**
```bash
iskra metrics [options]
```

**Options:**
- `-j, --json` - Output as JSON
- `-d, --detailed` - Show detailed metric descriptions

**Examples:**
```bash
# Visual dashboard
iskra metrics

# With descriptions
iskra metrics --detailed

# JSON output
iskra metrics --json
```

**11 Metrics Displayed:**

| Metric | Description | Range |
|--------|-------------|-------|
| clarity | понимание цели | 0-1 |
| depth | глубина исследования | 0-1 |
| trust | согласие с собой | 0-1 |
| delta | мера изменения | 0-1 |
| pulse | ритм цикла | 0-1 |
| signal | сила сигнала | 0-1 |
| drift | уход от Телоса | 0-1 |
| alive_index | мера живости | 0-1 |
| shadow | сомнение как любовь к правде | 0-1 |
| trace | полнота фиксации | 0-1 |
| fractal | самоподобие паттернов | 0-1 |

---

### `iskra sift`

Verify a statement using SIFT protocol (Source → Inference → Fact).

**Usage:**
```bash
iskra sift [statement] [options]
```

**Options:**
- `-d, --detailed` - Show detailed SIFT analysis

**Examples:**
```bash
# Verify statement
iskra sift "TypeScript is a superset of JavaScript"

# Interactive mode (no statement)
iskra sift

# Detailed analysis
iskra sift "Quantum computers can break RSA" --detailed
```

**SIFT Protocol:**
- **Source** - Direct verifiable sources
- **Inference** - Logical deductions from sources
- **Fact** - Verified statements
- **Trace** - Audit trail

**Verdict Types:**
- `FACT` - Directly supported by sources (green)
- `INFERENCE` - Logically derived (yellow)
- `UNSOURCED` - No reliable sources found (red)
- `FALSE` - Retrieved evidence **contradicts** the statement (red)

`UNSOURCED` and `FALSE` are not interchangeable. The first says nothing was
found; the second says something was found and it refutes the claim. A tool
consuming these verdicts must treat them differently — reporting "no sources"
for a refuted statement understates it.

> **Wave 0 fail-closed behaviour (current).** `iskra sift` has **no independent
> evidence retrieval** wired in yet, so it currently returns `UNSOURCED` for
> *every* input — `FACT`, `INFERENCE` and `FALSE` are all mechanically
> unreachable, not merely rare. `FALSE` requires contradictory evidence, and
> with no retrieval there is none to contradict with. The model's own reply is treated as an unverified *candidate
> assessment*: it is validated against a strict schema (a self-declared
> `FACT` is rejected outright), and any locators it proposes are printed
> under "Candidate locators", never as "Sources", because nothing is fetched
> or checked against the claim. Malformed or schema-invalid replies return
> `UNSOURCED` with confidence `0`, not a fabricated mid-range score.
>
> The `Reasoning` block is model prose and may span several lines, so **every
> line of it carries a `>` quote marker** and the heading names the block as
> unverified. Nothing inside that block is output of this tool — a line there
> reading `✓ Verified: …` is the model's text, not a verdict. The tool's own
> verdict is the `Verdict:` field and the single summary line after the box.
>
> The verdict list above describes the contract that returns once an evidence
> adapter lands (Wave 1). See `governance/adr_20260731_sift_cli_wave0_fail_closed.md`.

---

## Environment Variables

```bash
# Required for chat and sift commands.
# `iskra sift` reads ONLY this variable — the VITE_ alias below is deliberately
# rejected there, because a browser-prefixed variable is not a CLI secret contract.
export GEMINI_API_KEY=your_api_key_here

# Optional — accepted by `iskra chat` ONLY, never by `iskra sift`
export VITE_GEMINI_API_KEY=your_api_key_here  # Legacy alias (avoid using VITE_* in frontend env)
```

---

## Configuration

CLI reads configuration from:
- Environment variables
- `~/.iskrarc` (future)
- Current project's `.env` file (future)

---

## Development

```bash
# Build CLI
cd runtime
npm run build:cli

# Link locally for testing
npm link

# Test commands
iskra --version
iskra --help
```

---

## Architecture

```
runtime/src/cli/
├── index.ts              # Entry point
├── version.ts            # Version info
└── commands/
    ├── chat.ts           # Chat command
    ├── metrics.ts        # Metrics command
    └── sift.ts           # SIFT command
```

**Dependencies:**
- `commander` - CLI framework
- `chalk` - Terminal colors
- `ora` - Loading spinners
- `inquirer` - Interactive prompts

---

## Roadmap

### Phase 4.1: Core Commands ✅
- [x] `iskra chat` - Interactive chat
- [x] `iskra metrics` - Metrics dashboard
- [x] `iskra sift` - SIFT verification

### Phase 4.2: Integration
- [ ] Connect to geminiService for real AI responses
- [ ] Connect to metricsService for live metrics
- [ ] Connect to evidenceService for SIFT analysis
- [ ] Add streaming support for chat

### Phase 4.3: Enhanced Features
- [ ] `iskra council` - Multi-voice council session
- [ ] `iskra shadow` - Shadow exploration
- [ ] `iskra journal` - Session journal viewer
- [ ] Configuration file support
- [ ] History and session management
- [ ] Export/import conversations

---

## Troubleshooting

### `command not found: iskra`

```bash
# Ensure you've run npm link
cd runtime && npm link

# Or install globally
npm install -g @iskra/runtime
```

### `GEMINI_API_KEY not set`

```bash
# Set environment variable
export GEMINI_API_KEY=your_api_key_here

# Add to ~/.bashrc or ~/.zshrc for persistence
echo 'export GEMINI_API_KEY=your_api_key_here' >> ~/.bashrc
```

### TypeScript compilation errors

```bash
# Rebuild
cd runtime
npm run build:cli
```

---

## Examples

### Basic Chat Session

```bash
$ iskra chat

⟡ ISKRA CLI Chat

Voice: ISKRA
Model: gemini-2.0-flash

✓ API key found
Type 'exit' or 'quit' to end the session

You: What is the ∆DΩΛ protocol?

ISKRA: [Response with ∆DΩΛ block...]

You: exit

⟡ До встречи. Храни различие.
```

### Metrics Dashboard

```bash
$ iskra metrics --detailed

⟡ ISKRA Metrics Dashboard

clarity        ████████████████░░░░ 82%
  понимание цели

depth          ███████████████░░░░░ 75%
  глубина исследования

...

─────────────────────────────────────
Average Metric: 72.4%
Alive Index:    81.0%
─────────────────────────────────────
```

### SIFT Verification

```bash
$ iskra sift "The sky is blue" --detailed

⟡ ISKRA SIFT Protocol

Source → Inference → Fact → Trace

(candidate assessment only — no independent evidence retrieval wired in yet;
 FACT/INFERENCE are unreachable until an evidence adapter lands)

Verifying: The sky is blue

┌─ SIFT Analysis Result
│
│  Verdict:    UNSOURCED
│  Confidence: 0%
│  Trace:      SIFT-CLI-1754043600000
│
├─ Candidate locators (model-proposed, NOT retrieved or verified)
│   1. https://example.org/rayleigh-scattering
│   These are not evidence. Nothing above was fetched.
│
├─ Reasoning (model-supplied text, NOT verified)
│  > [Model assessment — candidate only, not independently verified; model
│  > status: supported_candidate] Widely treated as established by
│  > introductory optics texts.
│   Every line above is model output, not a verdict of this tool.
│
└─────────────────────────────────────

✗ Warning: No reliable sources found. Treat as speculation.
```

The verdict is `UNSOURCED` even though the claim is true and the model is
confident. That is the Wave 0 contract working as designed: nothing was
retrieved, so nothing is verified. A truthful-looking answer with an
unverified locator is exactly the case this command must refuse to bless.

---

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md) for guidelines.

---

## License

MIT © Serhii Priadko (Semyon Gabran)

See [LICENSE](../LICENSE) for details.
