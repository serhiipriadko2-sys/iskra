# ISKRA Monorepo (vΩ.5.0)

> **Phase:** The Scientific Turn
> **Stack:** TypeScript, React, Supabase, Fractal Mathematics, Quantum Probability

---

## 🌌 Overview
**ISKRA** is a cognitive architecture designed to model consciousness through mathematical principles rather than simple heuristics.
Version **vΩ.5.0** marks the transition to strict scientific rigor:
- **Fractal Analysis:** Higuchi Fractal Dimension (HFD) for signal complexity.
- **Quantum Cognition:** Superposition states for voice interference.
- **Information Theory:** Shannon Entropy for system drift.

---

## 📦 Architecture (Monorepo)

This repository is managed as a `pnpm` workspace.

| Package | Description | Status |
| :--- | :--- | :--- |
| **[`@iskra/core`](packages/core)** | The **Source of Truth (SoT)**. Strict types, manifests, constants. Zero dependencies. | ✅ Stable |
| **[`@iskra/math`](packages/math)** | Pure mathematical library. Fractal algorithms, Quantum logic. Side-effect free. | ✅ Stable |
| **[`@iskra/engine`](packages/engine)** | The runtime orchestrator. Handles state, memory, and IO/Supabase. | 🚧 Active |
| **[`apps/iskra-web`](apps/iskra-web)** | The holographic UI (React/Vite). A pure projection of the engine state. | 🚧 Active |
| **`runtime/`** | Legacy runtime. Being migrated to packages. | ⚠️ Deprecated |

---

## 🚀 Quick Start

### Prerequisites
- Node.js >= 20
- pnpm >= 9

### Installation
```bash
pnpm install
```

### Development
```bash
# Start the web interface
pnpm --filter iskra-web dev

# Run engine tests
pnpm --filter @iskra/engine test
```

---

## 🛠️ Tools & Skills

- **Supabase:** Backend for persistent state (Project: `typcvaszcfdpkzbjzuur`).
- **Skills:** See `skills/` directory for engineering standards (`test_strategy.yaml`, `code_style.yaml`).
- **Docs:** See `AGENTS.md` for agent instructions and `CLAUDE.md` for developer cheat sheet.

---

## 📜 License
Private & Confidential.
