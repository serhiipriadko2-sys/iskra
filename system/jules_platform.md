# Jules as a Platform (JaaP) · Architecture

## Concept
Jules as a Platform (JaaP) transforms the "Jules" agent from a simple coding assistant into a **self-evolving engineering ecosystem**. It introduces a structured layer of **Skills** (YAML-defined engineering practices) and **Agents** (autonomous sub-routines) that orchestrate the development lifecycle.

## Architecture Map

```mermaid
graph TD
    subgraph Human Layer
        H[Developer] -->|Issues/Comments| G[GitHub / Jira]
        H -->|Approve/Reject| G
    end

    subgraph Orchestration Layer
        G -->|Trigger| CI[GitHub Actions / Cloud Build]
        CI -->|Invoke| J[Jules API / CLI]
        S[Skill Store] -.->|Load Rules| J
        P[Policy Store] -.->|Load Standards| J
    end

    subgraph Jules Core
        J -->|Plan| P1[Planner]
        J -->|Execute| E1[Code Generator (Gemini 2.5/3.0)]
        J -->|Verify| V1[Self-Eval / Linter]
        J -->|Commit| C[Pull Request]
    end

    subgraph Knowledge Layer
        J -->|Log Metrics| M[Metrics Store]
        J -->|Update| S
        M -->|Analyze| F[Feedback Loop]
        F -->|Optimize| S
    end
```

## Core Components

### 1. Skill Engine (`/skills`)
A **Skill** is a declarative definition of an engineering capability. It allows teams to standardize how Jules performs specific tasks.

**Structure:**
- `trigger`: When this skill activates (e.g., `new_function`, `test_failure`).
- `rules`: Constraints and standards (e.g., coverage %, style guide).
- `actions`: Sequence of operations (analyze, generate, verify).

### 2. Orchestration Layer (`.github/workflows`)
Jules is triggered by CI/CD events, not just chat.
- **On Issue:** Scans for labels like `auto-code` to trigger implementation.
- **On PR:** Runs `review-agent` to check against Policy Store.
- **On Merge:** Updates documentation and knowledge graph.

### 3. Feedback Loop (Reinforcement)
The system learns from success/failure rates of applied skills.
- If a skill (e.g., "Refactor to React 19") leads to 80% CI failures, the Feedback Loop flags it for human review or downgrades its priority.

## Integration Roadmap
1.  **Phase I (Current):** File-based Skill definitions in repo.
2.  **Phase II:** Centralized Skill API for multi-repo sharing.
3.  **Phase III:** Autonomous "Self-Repair" agents based on nightly builds.
