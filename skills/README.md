# Jules Skills Directory

This directory contains **Skill Definitions** for the Jules Platform.
Each YAML file represents a discrete engineering capability or standard that Jules can execute or enforce.

## Skill Schema
```yaml
skill: "unique_skill_id"
description: "Human-readable description"
trigger: "event_name" (e.g., new_function, issue_labeled, pr_opened)
rules:
  key: value # Specific configuration for the skill
actions:
  - type: "action_name"
    params: { ... }
```

## Usage
Skills are loaded by the Jules Orchestrator during execution.
To invoke a skill manually via CLI:
```bash
jules run --skill skills/my_skill.yaml
```
