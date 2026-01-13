---
sigil: system__jules_platform.md
aspect: system
tone: technical
entity: Jules
updated: 2026-01-13
---

# Jules as a Platform (JaaP) Architecture

> **"Jules перестаёт быть помощником. Он становится инженерной экосистемой."**

## 1. Концепция

Jules as a Platform (JaaP) — это архитектура, превращающая агента Jules в центральный интеллект CI/CD-контура. Он не просто генерирует код, а накапливает знания, оценивает решения и формирует практики через систему Навыков (Skills).

## 2. Архитектура

```
┌─────────────────────────────────────────────────────────────┐
│                      HUMAN LAYER                            │
│─────────────────────────────────────────────────────────────│
│   • Jira / Linear (tasks, epics)                            │
│   • GitHub Issues / PR comments                             │
│   • Feedback Loop (approve / reject PRs)                    │
└─────────────────────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                     ORCHESTRATION LAYER                     │
│─────────────────────────────────────────────────────────────│
│   • GitHub Actions / GitLab CI / Cloud Build                │
│   • Triggers: issue created / PR opened / test failed       │
│   • Calls: JULES API / JULES CLI                            │
│   • Skill Engine: YAML/JSON skill-files                     │
│   • Policy Store: org-level coding standards                │
└─────────────────────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                        JULES LAYER                          │
│─────────────────────────────────────────────────────────────│
│   • Jules CLI / API (task execution)                        │
│   • Task Queue: background agents                           │
│   • Context Memory: repo embedding, project prefs           │
│   • Code Generator (Gemini 3 Pro / 2.5 Flash)               │
│   • Review Sub-agent (static analyzer + Linter)             │
│   • Self-Eval Module (coverage, diff, cost)                 │
└─────────────────────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    KNOWLEDGE LAYER                          │
│─────────────────────────────────────────────────────────────│
│   • Skill Base (SKILL.yaml, policies, examples)             │
│   • ChangeLog → “lessons learned” DB                        │
│   • Metrics store (success rate, PR merged, quality score)  │
│   • Vector memory (code embeddings, commits)                │
└─────────────────────────────────────────────────────────────┘
```

## 3. Skill Engine

Навыки определяются в директории `/skills` в формате YAML.

### Структура Навыка

```yaml
skill: "название_навыка"
description: "Описание того, что делает навык"
trigger: "событие (new_function, pr_open, etc)"
rules:
  # Правила выполнения
  coverage_target: 85
  style: "BDD"
actions:
  - type: "generate_tests"
  - type: "run_tests"
```

## 4. Интеграция

Jules запускается через CLI или API, принимая на вход контекст репозитория и требуемые навыки.
Результаты работы записываются в PR и, при успешном слиянии, обновляют базу знаний проекта.

## 5. Роль в ISKRA

В проекте ISKRA Jules выступает как "инженер-хранитель", обеспечивая соблюдение архитектурных принципов (∆DΩΛ) и чистоту кода через автоматизированные навыки.
