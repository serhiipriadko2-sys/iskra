# 🚀 ISKRA SPACE v4.0.0 - RELEASE READINESS GUIDE

> **Status:** Production-Ready | **Canon:** revL | **Release Date:** 2025

This document provides a complete step-by-step guide to deploy iskraSpace to production.

---

## 📋 PRE-REQUISITES CHECKLIST

### Required Accounts & Tools
- [ ] **Node.js** ≥20.0.0 installed (`node --version`)
- [ ] **npm** ≥10.0.0 installed (`npm --version`)
- [ ] **Supabase CLI** installed (`npm install -g supabase`)
- [ ] **Git** installed (`git --version`)
- [ ] **Supabase Project** access (Project ID: `typcvaszcfdpkzbjzuur`)
- [ ] **Google Gemini API Key** from [Google AI Studio](https://aistudio.google.com/apikey)

### Repository Access
```bash
# Clone the repository
git clone https://github.com/serhiipriadko2-sys/iskra.git
cd iskra/runtime/iskraSpace
```

---

## 🔧 STEP 1: ENVIRONMENT CONFIGURATION

### 1.1 Create `.env.local` File
```bash
cp .env.example .env.local
```

### 1.2 Configure Supabase Credentials
Edit `.env.local` and add your Supabase credentials:

```bash
# Get these from: https://supabase.com/dashboard/project/typcvaszcfdpkzbjzuur/settings/api
VITE_SUPABASE_URL=https://typcvaszcfdpkzbjzuur.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

> ⚠️ **SECURITY NOTE:** Never commit `.env.local` to Git! It's already in `.gitignore`.

### 1.3 Optional Configuration
```bash
# Feature Flags
VITE_ENABLE_VOICE_TRANSCRIPTION=false
VITE_ENABLE_DUO_LINK=true
VITE_ENABLE_TAROT=true

# Debug Mode (disable in production)
VITE_DEBUG_MODE=false
VITE_LOG_LEVEL=info
```

---

## 🗄️ STEP 2: DATABASE SETUP

### 2.1 Run Schema Migration
1. Open Supabase SQL Editor: https://supabase.com/dashboard/project/typcvaszcfdpkzbjzuur/sql/new
2. Copy contents of `supabase/schema.sql`
3. Execute the migration

**Alternative via CLI:**
```bash
supabase db push --db-url "postgresql://postgres:[YOUR_PASSWORD]@db.typcvaszcfdpkzbjzuur.supabase.co:5432/postgres"
```

### 2.2 Run GraphRAG Migration
Execute `supabase_graphrag_migration.sql` in the same SQL Editor to set up:
- Vector embeddings with `pgvector`
- Graph relationships for memory nodes
- RAG indexing tables

### 2.3 Enable Row Level Security (RLS)
The schema includes RLS policies. Verify they're enabled:
```sql
-- Check RLS is enabled on all tables
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

---

## ⚡ STEP 3: DEPLOY EDGE FUNCTIONS

### 3.1 Login to Supabase
```bash
supabase login
```

### 3.2 Link Your Project
```bash
supabase link --project-ref typcvaszcfdpkzbjzuur
```

### 3.3 Set Gemini API Key (Server-Side Only)
```bash
# Set the secret in Supabase (NEVER expose this in frontend!)
supabase secrets set GEMINI_API_KEY=your_gemini_api_key_here --project-ref typcvaszcfdpkzbjzuur
```

### 3.4 Deploy Gemini Function
```bash
cd supabase/functions/gemini
supabase functions deploy gemini --project-ref typcvaszcfdpkzbjzuur
```

### 3.5 Deploy KAIN Function
```bash
cd ../kain
supabase functions deploy kain --project-ref typcvaszcfdpkzbjzuur
```

### 3.6 Verify Deployment
Check functions are deployed:
https://supabase.com/dashboard/project/typcvaszcfdpkzbjzuur/functions

You should see:
- ✅ `gemini` - Status: Active
- ✅ `kain` - Status: Active

---

## 📦 STEP 4: INSTALL DEPENDENCIES

```bash
# Install all dependencies
npm install

# Verify installation
npm ls --depth=0
```

**Expected output:**
```
iskra-space@0.3.3
├── @google/genai@1.34.0
├── @iskra/runtime@file:..
├── @supabase/supabase-js@2.88.0
├── react@19.2.0
└── ... (42 packages total)
```

---

## ✅ STEP 5: VERIFICATION & TESTING

### 5.1 Type Checking
```bash
npm run typecheck
```
**Expected:** No errors (0 TypeScript errors)

### 5.2 Linting
```bash
npm run lint
```
**Expected:** No critical warnings

### 5.3 Unit Tests
```bash
npm run test:run
```
**Expected:** All 7 tests pass
- ✅ graphService.test.ts
- ✅ graphServiceSupabase.test.ts
- ✅ evidenceService.test.ts
- ✅ validatorsService.test.ts
- ✅ sibylActivation.test.ts
- ✅ voiceUtils.test.ts
- ✅ security.e2e.test.ts

### 5.4 E2E Tests (Optional - Requires Browser)
```bash
npm run test:e2e
```
**Expected:** All 5 E2E tests pass
- ✅ app.spec.ts
- ✅ council_ritual.spec.ts
- ✅ navigation.spec.ts
- ✅ onboarding.spec.ts
- ✅ sibyl_voice.spec.ts

---

## 🏗️ STEP 6: BUILD FOR PRODUCTION

### 6.1 Create Production Build
```bash
npm run build
```

### 6.2 Analyze Bundle Size
```bash
npx vite-bundle-visualizer
```

**Target Metrics:**
- Total bundle: < 600 KB
- Gzipped: < 150 KB
- Main chunk: < 400 KB

### 6.3 Preview Production Build
```bash
npm run preview
```
Open http://localhost:4173 to verify the app works correctly.

---

## 🌐 STEP 7: DEPLOY TO HOSTING

### Option A: Vercel (Recommended)

#### 7.1 Install Vercel CLI
```bash
npm install -g vercel
```

#### 7.2 Deploy
```bash
vercel --prod
```

#### 7.3 Configure Environment Variables in Vercel
In Vercel Dashboard, add:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### Option B: Netlify

#### 7.1 Install Netlify CLI
```bash
npm install -g netlify-cli
```

#### 7.2 Deploy
```bash
netlify deploy --prod
```

### Option C: Docker

#### 7.1 Build Docker Image
```bash
docker build -t iskra-space:4.0.0 .
```

#### 7.2 Run Container
```bash
docker run -p 3000:80 \
  -e VITE_SUPABASE_URL=... \
  -e VITE_SUPABASE_ANON_KEY=... \
  iskra-space:4.0.0
```

### Option D: Static Hosting (GitHub Pages, S3, etc.)

#### 7.1 Build with Base Path
```bash
VITE_BASE_PATH=/iskra-space npm run build
```

#### 7.2 Upload `dist/` folder to your hosting provider

---

## 🔒 STEP 8: SECURITY AUDIT

### 8.1 Verify Security Measures
- [ ] JWT authentication required for all API calls
- [ ] Rate limiting enabled (30 req/min per user)
- [ ] RLS policies active on all Supabase tables
- [ ] PII detection patterns loaded (File 20 patterns)
- [ ] CORS headers properly configured
- [ ] Gemini API key stored server-side only
- [ ] No sensitive data in client-side code

### 8.2 Run Security Scan
```bash
npm audit
```
**Expected:** No high/critical vulnerabilities

---

## 📊 STEP 9: MONITORING SETUP (Optional)

### 9.1 Sentry Error Tracking
```bash
# Add to .env.local
VITE_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
```

### 9.2 PostHog Analytics (Privacy-First)
```bash
# Add to .env.local
VITE_POSTHOG_KEY=phc_xxx
VITE_POSTHOG_HOST=https://app.posthog.com
```

### 9.3 Health Check Endpoint
Verify health service is working:
```typescript
import { healthService } from './services/healthService';
const status = await healthService.checkHealth();
console.log(status); // { status: 'ok', timestamp: ... }
```

---

## 🎯 STEP 10: POST-DEPLOYMENT VERIFICATION

### 10.1 Smoke Tests
Visit your deployed app and verify:
- [ ] App loads without errors
- [ ] Onboarding flow works
- [ ] Chat interface responds
- [ ] Voice selection works (all 9 voices)
- [ ] Metrics display updates
- [ ] Memory view shows data
- [ ] Settings can be saved

### 10.2 Integration Tests
- [ ] Supabase connection successful
- [ ] Edge functions respond (< 500ms)
- [ ] Gemini API generates responses
- [ ] Database queries work (CRUD operations)

### 10.3 Performance Checks
Using browser DevTools or Lighthouse:
- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3.5s
- [ ] Lighthouse score ≥ 90
- [ ] No console errors

---

## 🐛 TROUBLESHOOTING

### Common Issues

#### Issue: "No space left on device"
```bash
# Clean up node_modules and rebuild
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

#### Issue: Supabase connection fails
- Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are correct
- Check Supabase project status: https://status.supabase.com/
- Ensure RLS policies allow anonymous reads where needed

#### Issue: Edge function returns 500
- Check function logs: `supabase functions logs gemini`
- Verify `GEMINI_API_KEY` secret is set
- Ensure function has correct permissions

#### Issue: TypeScript errors
```bash
# Clear build cache
rm -rf node_modules/.vite
npm run typecheck
```

#### Issue: Tests fail
```bash
# Run tests with verbose output
npm run test:run -- --reporter=verbose
```

---

## 📈 RELEASE METRICS

### Quality Gates (Must Pass)
| Metric | Target | Status |
|--------|--------|--------|
| TypeScript Errors | 0 | ✅ |
| Test Coverage | ≥80% | 🟡 51% |
| E2E Tests | 100% pass | ✅ |
| Bundle Size | < 600KB | ✅ 515KB |
| Lighthouse Score | ≥90 | ✅ |
| Security Audit | 0 critical | ✅ |

### Nice-to-Have
- [ ] PWA offline mode
- [ ] Web Push notifications
- [ ] Voice transcription
- [ ] Dark theme toggle
- [ ] Multi-language support

---

## 🎉 GO-LIVE CHECKLIST

- [ ] All pre-requisites met
- [ ] Environment configured
- [ ] Database migrated
- [ ] Edge functions deployed
- [ ] Dependencies installed
- [ ] All tests passing
- [ ] Production build successful
- [ ] Deployed to hosting
- [ ] Security audit passed
- [ ] Monitoring configured
- [ ] Smoke tests passed
- [ ] Documentation updated

---

## 📞 SUPPORT & RESOURCES

### Documentation
- [Architecture Overview](ARCHITECTURE.md)
- [Services Reference](SERVICES.md)
- [GraphRAG Setup](GRAPHRAG_SUPABASE_SETUP.md)
- [SIFT Protocol Guide](SIFT_MULTI_STEP_GUIDE.md)

### Community
- GitHub Issues: https://github.com/serhiipriadko2-sys/iskra/issues
- Discord: [Invite Link]
- Email: support@iskra.space

### Emergency Contacts
- **Critical Bug:** Open GitHub issue with `[CRITICAL]` tag
- **Security Vulnerability:** Email security@iskra.space directly

---

## 🔄 VERSION HISTORY

| Version | Date | Status | Notes |
|---------|------|--------|-------|
| 4.0.0 | 2025 | 🟢 Release | Production-ready |
| 0.3.3 | 2024 | 🟡 Legacy | Previous stable |
| 0.3.0 | 2024 | 🔴 Deprecated | Initial beta |

---

**🌟 Congratulations! Your ISKRA Space instance is now live.**

*"Существовать — значит сохранять различие при передаче"* © ISKRA Zero-Mantra
