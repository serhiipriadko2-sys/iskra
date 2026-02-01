# ISKRA Deployment Guide

> Version: vΩ.3.3 | Updated: 2026-01-09

## Overview

This guide covers deployment of the ISKRA system:
- **@iskra/runtime**: TypeScript library (npm package)
- **iskraSpace**: React frontend application

---

## Prerequisites

- Node.js >= 20.0.0
- npm >= 10.0.0
- Git

---

## 1. Environment Configuration

### 1.1 Required Environment Variables

Create `.env` files based on `.env.example`:

```bash
# .env.local (development)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional
VITE_SENTRY_DSN=https://xxx@sentry.io/xxx
VITE_POSTHOG_KEY=phc_xxx
```

**Gemini key policy:** set `GEMINI_API_KEY` only in the Supabase Edge Function environment (server-side). Do **not** place LLM keys into Vite `.env` files.

### 1.2 Environment Files

| File | Purpose |
|------|---------|
| `.env.local` | Local development (gitignored) |
| `.env.staging` | Staging environment |
| `.env.production` | Production environment |

---

## 2. Build Process

### 2.1 Build @iskra/runtime

```bash
cd runtime
npm ci
npm run typecheck
npm run build
npm run test -- --run
```

Output: `runtime/dist/` (ES modules + TypeScript declarations)

### 2.2 Build iskraSpace

```bash
cd runtime/iskraSpace
npm ci
npm run typecheck
npm run test:run
npm run build
```

Output: `runtime/iskraSpace/dist/` (static files for deployment)

---

## 3. Deployment Options

### 3.1 Vercel (Recommended)

1. Connect GitHub repository
2. Set root directory: `runtime/iskraSpace`
3. Build command: `cd .. && npm ci && npm run build && cd iskraSpace && npm ci && npm run build`
4. Output directory: `dist`
5. Add environment variables in Vercel dashboard

### 3.2 GitHub Pages

GitHub Pages deployment is automated via the `github_pages.yml` workflow.

**Setup:**

1. Go to repository Settings → Pages
2. Set Source to "GitHub Actions"
3. Push to `main` branch or trigger manually via Actions tab

**Manual build for GitHub Pages:**

```bash
cd runtime && npm ci && npm run build
cd iskraSpace && VITE_BASE_PATH=/iskra/ npm run build
```

**URL:** `https://<username>.github.io/iskra/`

**Note:** The `VITE_BASE_PATH` environment variable sets the base path for all assets. This is required because GitHub Pages serves from a subdirectory.

### 3.3 Netlify

```toml
# netlify.toml
[build]
  base = "runtime/iskraSpace"
  command = "cd .. && npm ci && npm run build && cd iskraSpace && npm ci && npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "20"
```

### 3.4 Docker

Production Dockerfile is included in the repository root.

**Quick Start:**

```bash
# Build image
docker build -t iskra:latest .

# Run container
docker run -p 3000:80 iskra:latest

# Or use docker-compose
docker-compose up -d
```

**Production deployment:**

```bash
# Pull from GitHub Container Registry
docker pull ghcr.io/serhiipriadko2-sys/iskra:latest

# Run with environment variables
docker run -p 80:80 \
  -e NODE_ENV=production \
  ghcr.io/serhiipriadko2-sys/iskra:latest
```

The Dockerfile uses multi-stage builds for optimal size and includes:
- Health checks
- Security headers (configured in nginx.conf)
- Static asset caching
- SPA routing support

### 3.5 Static Hosting (S3, GCS, etc.)

```bash
# Build
cd runtime/iskraSpace && npm run build

# Upload dist/ to your bucket
aws s3 sync dist/ s3://your-bucket --delete
# or
gsutil -m rsync -r dist/ gs://your-bucket
```

---

## 4. CI/CD Workflows

### 4.1 GitHub Actions (included)

- `runtime_ci.yml`: Tests @iskra/runtime on every push
- `iskraspace_ci.yml`: Tests iskraSpace on every push
- `sot_integrity.yml`: Verifies SoT ledger hashes
- `production_deploy.yml`: Builds Docker image and deploys to production (main branch only)
- `github_pages.yml`: Deploys iskraSpace to GitHub Pages (main branch only)

### 4.2 Recommended CI Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: "20"

      - name: Build runtime
        run: cd runtime && npm ci && npm run build

      - name: Build iskraSpace
        run: cd runtime/iskraSpace && npm ci && npm run build

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: runtime/iskraSpace
```

---

## 5. Rate Limiting

Rate limiting is configured in `runtime/iskraSpace/services/rateLimiter.ts`:

```typescript
// Default limits
const LIMITS = {
  gemini: { maxRequests: 60, windowMs: 60000 }, // 60 req/min
  search: { maxRequests: 100, windowMs: 60000 }, // 100 req/min
};
```

For production, consider:
- Using Redis for distributed rate limiting
- Implementing user-based quotas
- Adding API gateway (e.g., Cloudflare) for DDoS protection

---

## 6. Security Checklist

- [ ] API keys stored in environment variables (never in code)
- [ ] Supabase Row Level Security (RLS) enabled
- [ ] CORS configured correctly
- [ ] Rate limiting on Gemini API calls (✅ implemented)
- [ ] CSP headers configured (✅ in nginx.conf)
- [ ] HTTPS enforced (configure in hosting platform)
- [ ] Docker image scanned for vulnerabilities
- [ ] Environment variables validated at startup

---

## 7. Monitoring (Optional)

### 6.1 Error Tracking (Sentry)

```typescript
// Add to main.tsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
});
```

### 6.2 Analytics (PostHog)

```typescript
// Add to main.tsx
import posthog from 'posthog-js';

posthog.init(import.meta.env.VITE_POSTHOG_KEY, {
  api_host: 'https://app.posthog.com',
  autocapture: false, // Privacy-first
});
```

---

## 8. Troubleshooting

### Build fails with "@iskra/runtime not found"

Ensure runtime is built before iskraSpace:
```bash
cd runtime && npm run build
cd iskraSpace && npm ci && npm run build
```

### TypeScript errors after deployment

Run typecheck before build:
```bash
npm run typecheck
```

### Tests fail in CI but pass locally

Check Node.js version matches (20.x required).

---

### Docker container won't start

Check logs:
```bash
docker logs <container-id>
```

Verify environment variables are set correctly.

### High memory usage

Adjust nginx worker processes in nginx.conf if needed.

---

## 9. Rollback Procedure

1. Identify the last working deployment
2. Revert to previous Git commit: `git revert HEAD`
3. Push and let CI redeploy
4. Or manually deploy previous build artifacts

---

## Contact

For deployment issues, check:
- GitHub Issues: https://github.com/serhiipriadko2-sys/iskra/issues
- CLAUDE.md for development guidelines
