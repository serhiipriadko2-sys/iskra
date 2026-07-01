# [P0-BLOCKER] CI/CD Pipeline Break: PR #228 deletes package-lock.json but CI/Docker use `npm ci`

## Status: 🔴 BLOCKER — Merge will break all CI builds

## Problem
PR #228 (`codex/iskraspace-production-ready`) deletes `runtime/iskraSpace/package-lock.json` (5764 lines), but the following CI/CD files still use `npm ci`:

- `.github/workflows/iskraspace_ci.yml` line 48 → `npm ci`
- `.github/workflows/production_deploy.yml` line 66 → `npm ci`
- `Dockerfile` line 40 → `npm ci`

`npm ci` **requires** an existing `package-lock.json`. Without it, the command fails.

## Impact
- Any CI run after PR merge will fail immediately
- Docker builds will fail
- Automated deployments (Vercel, Docker) will break
- The monorepo root uses `pnpm`, but `runtime/iskraSpace` CI steps use `npm`

## Evidence
```
# iskraspace_ci.yml:48
- run: npm ci
  working-directory: runtime/iskraSpace

# production_deploy.yml:66
- run: npm ci
  working-directory: runtime/iskraSpace

# Dockerfile:40
RUN npm ci
```

Also, `production_deploy.yml` uses `cache-dependency-path: runtime/package-lock.json` which caches the **wrong** lockfile (parent `runtime/` directory, not `iskraSpace/`).

## Fix Options

**Option A (Recommended):** Migrate CI/Docker to `pnpm` consistently:
1. Update `iskraspace_ci.yml` to use `pnpm/action-setup@v3` + `pnpm install --frozen-lockfile`
2. Update `production_deploy.yml` to use `pnpm` throughout (remove mixed npm/pnpm)
3. Update `Dockerfile` to copy `pnpm-lock.yaml` + `pnpm-workspace.yaml` and use `pnpm install --frozen-lockfile`
4. Remove `cache-dependency-path: runtime/package-lock.json`

**Option B (Quick fix):** Keep `package-lock.json` in `runtime/iskraSpace/` and do NOT delete it in PR #228. Defer migration to pnpm to a separate ADR/PR.

## ∆DΩΛ
∆: CI/CD pipeline break identified
D: `.github/workflows/iskraspace_ci.yml`, `production_deploy.yml`, `Dockerfile`
Ω: 95%
Λ: Choose Option A or B and implement before merge
