# 🧪 ISKRA SPACE - TESTING STRATEGY

> **Version:** 4.0.0 | **Coverage Goal:** ≥80% | **Status:** Active Development

---

## 📊 CURRENT TEST COVERAGE

| Test Type | Count | Status | Coverage |
|-----------|-------|--------|----------|
| Unit Tests | 7 | ✅ Passing | ~51% |
| E2E Tests | 5 | ✅ Passing | Critical paths |
| Integration Tests | 0 | 🔴 Missing | - |
| Visual Regression | 0 | 🔴 Missing | - |

**Target for v4.0.0 Release:** ≥80% coverage

---

## 🧪 UNIT TESTS

### Location: `__tests__/`

#### Services (5 tests)
```bash
__tests__/services/
├── graphService.test.ts          # Graph operations
├── graphServiceSupabase.test.ts  # Supabase integration
├── evidenceService.test.ts       # Evidence validation
├── validatorsService.test.ts     # Input/output validation
└── sibylActivation.test.ts       # Voice activation logic
```

#### Utils (1 test)
```bash
__tests__/utils/
└── voiceUtils.test.ts            # Voice utility functions
```

#### E2E (1 security test)
```bash
__tests__/e2e/
└── security.e2e.test.ts          # Security protocol tests
```

### Running Unit Tests
```bash
# Watch mode
npm run test

# Single run
npm run test:run

# With coverage
npm run test:run -- --coverage

# Specific test file
npm run test -- graphService.test.ts
```

---

## 🌐 E2E TESTS (Playwright)

### Location: `e2e/`

```bash
e2e/
├── app.spec.ts              # Main app flow
├── council_ritual.spec.ts   # Council decision-making
├── navigation.spec.ts       # Navigation & routing
├── onboarding.spec.ts       # User onboarding
└── sibyl_voice.spec.ts      # SIBYL voice interaction
```

### Running E2E Tests
```bash
# Headless mode (CI/CD)
npm run test:e2e

# UI mode (debugging)
npm run test:e2e:ui

# Headed mode (see browser)
npm run test:e2e:headed

# Specific test
npm run test:e2e -- onboarding.spec.ts
```

### E2E Test Coverage Matrix

| Feature | Test | Status | Priority |
|---------|------|--------|----------|
| App Load | `app.spec.ts` | ✅ | P0 |
| Onboarding Flow | `onboarding.spec.ts` | ✅ | P0 |
| Navigation | `navigation.spec.ts` | ✅ | P0 |
| Council Ritual | `council_ritual.spec.ts` | ✅ | P1 |
| SIBYL Voice | `sibyl_voice.spec.ts` | ✅ | P1 |
| Chat Interface | 🔴 Missing | ❌ | P0 |
| Memory View | 🔴 Missing | ❌ | P1 |
| Settings | 🔴 Missing | ❌ | P2 |
| Journal | 🔴 Missing | ❌ | P2 |

---

## 🎯 MISSING TESTS (Priority for Release)

### High Priority (P0) - Must Have

#### 1. Component Tests
```bash
# Create: __tests__/components/
ChatView.test.tsx          # Chat interface
EvalDashboard.test.tsx     # Metrics dashboard
MemoryView.test.tsx        # Memory visualization
VoiceVisualizer.test.tsx   # Voice selection
```

#### 2. Service Tests
```bash
# Create: __tests__/services/
geminiService.test.ts      # AI generation
policyEngine.test.ts       # Playbook routing
ragService.test.ts         # RAG + SIFT
evalService.test.ts        # Quality assessment
voiceEngine.test.ts        # Voice selection
```

#### 3. Hook Tests
```bash
# Create: __tests__/hooks/
useChat.test.ts            # Chat state management
useMetrics.test.ts         # Metrics updates
useVoice.test.ts           # Voice switching
useMemory.test.ts          # Memory operations
```

### Medium Priority (P1) - Should Have

#### 4. Integration Tests
```bash
# Create: __tests__/integration/
auth-flow.test.ts          # Login/logout
database-crud.test.ts      # DB operations
edge-functions.test.ts     # Supabase functions
api-integration.test.ts    # Gemini API
```

#### 5. Visual Regression Tests
```bash
# Create: __tests__/visual/
snapshots/
  ├── ChatView-light.png
  ├── ChatView-dark.png
  ├── EvalDashboard.png
  └── MemoryView.png
```

### Low Priority (P2) - Nice to Have

#### 6. Performance Tests
```bash
# Create: __tests__/performance/
load-time.test.ts          # Page load metrics
bundle-size.test.ts        # Bundle analysis
memory-leak.test.ts        # Memory usage
```

#### 7. Accessibility Tests
```bash
# Create: __tests__/a11y/
axe-chat.test.ts           # Chat accessibility
axe-navigation.test.ts     # Nav accessibility
```

---

## 📝 TEST TEMPLATES

### Unit Test Template
```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { functionName } from '../path/to/module';

describe('functionName', () => {
  beforeEach(() => {
    // Setup
  });

  it('should return expected value', () => {
    const result = functionName(input);
    expect(result).toBe(expectedOutput);
  });

  it('should handle edge case', () => {
    expect(() => functionName(invalidInput)).toThrow();
  });
});
```

### Component Test Template
```typescript
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ComponentName from './ComponentName';

describe('ComponentName', () => {
  it('renders correctly', () => {
    render(<ComponentName />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  it('handles user interaction', async () => {
    render(<ComponentName />);
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByText('After Click')).toBeInTheDocument();
  });
});
```

### E2E Test Template (Playwright)
```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should do something', async ({ page }) => {
    await page.click('[data-testid="button"]');
    await expect(page.locator('.result')).toBeVisible();
  });
});
```

---

## 🔧 TEST UTILITIES

### Mock Data
Location: `testSupport/`

```typescript
// mockData.ts
export const mockUser = {
  id: 'test-user-id',
  name: 'Test User',
  email: 'test@example.com',
};

export const mockMetrics = {
  rhythm: 75,
  trust: 0.8,
  clarity: 0.7,
  pain: 0.1,
  drift: 0.2,
  chaos: 0.3,
};
```

### Test Helpers
```typescript
// testHelpers.ts
export function renderWithProviders(component: ReactElement) {
  return render(
    <QueryClientProvider client={queryClient}>
      <SupabaseProvider>{component}</SupabaseProvider>
    </QueryClientProvider>
  );
}
```

---

## 📈 COVERAGE REPORTING

### Generate Coverage Report
```bash
npm run test:run -- --coverage
```

### Coverage Configuration (vite.config.ts)
```typescript
test: {
  coverage: {
    provider: 'v8',
    reporter: ['text', 'json', 'html'],
    threshold: {
      lines: 80,
      functions: 80,
      branches: 80,
      statements: 80,
    },
    include: ['src/**/*.ts', 'src/**/*.tsx'],
    exclude: ['node_modules/', 'e2e/'],
  },
},
```

### View HTML Report
```bash
open coverage/index.html
```

---

## 🚀 CI/CD INTEGRATION

### GitHub Actions Workflow
Create: `.github/workflows/test.yml`

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run type checking
        run: npm run typecheck
      
      - name: Run linter
        run: npm run lint
      
      - name: Run unit tests
        run: npm run test:run -- --coverage
      
      - name: Run E2E tests
        run: npm run test:e2e
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
```

---

## 🎯 RELEASE CRITERIA

### Must Pass Before v4.0.0
- [ ] All existing tests pass (7 unit + 5 E2E)
- [ ] TypeScript compilation: 0 errors
- [ ] Linting: 0 critical warnings
- [ ] Coverage: ≥80% (currently 51%)
- [ ] No memory leaks detected
- [ ] Performance budget met

### Test Coverage by Module

| Module | Current | Target | Gap |
|--------|---------|--------|-----|
| Services | 45% | 85% | -40% |
| Components | 30% | 80% | -50% |
| Utils | 70% | 90% | -20% |
| Hooks | 0% | 80% | -80% |
| Types | N/A | 100% | N/A |

---

## 🐛 DEBUGGING TIPS

### Common Issues

#### Test Fails Due to Async
```typescript
// ❌ Wrong
it('loads data', () => {
  fetchData().then(data => expect(data).toBeDefined());
});

// ✅ Correct
it('loads data', async () => {
  const data = await fetchData();
  expect(data).toBeDefined();
});
```

#### Mock Not Working
```typescript
// ❌ Wrong
vi.mock('./module', () => ({
  fn: () => 'value',
}));

// ✅ Correct
vi.mock('./module', async () => {
  const actual = await vi.importActual('./module');
  return {
    ...actual,
    fn: vi.fn(() => 'value'),
  };
});
```

#### E2E Test Flaky
```typescript
// Add explicit waits
await page.waitForSelector('[data-testid="element"]');
await expect(page.locator('.result')).toBeVisible({ timeout: 5000 });
```

---

## 📚 RESOURCES

- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Library](https://testing-library.com/)
- [TypeScript Testing](https://www.typescriptlang.org/docs/handbook/testing.html)

---

**🎯 Goal: 80%+ coverage by release date!**

*"Tests are the safety net that lets us innovate fearlessly"* © ISKRA Engineering
