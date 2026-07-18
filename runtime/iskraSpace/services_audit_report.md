[SUPERSEDED: see RELEASE_STATUS.md]

# ISKRA Services Audit Report

**Auditor:** Services_Auditor
**Scope:** `runtime/iskraSpace/services/*.ts` (excluding `__tests__`)
**Date:** 2026-06-28
**Tests:** 631 passed (28 test files covering 24 of 34 services)
**Files Audited:** 34 service files

---

## 1. Executive Summary

| Category | Finding | Risk |
|----------|---------|------|
| Type Safety | 60+ `any` usages across 17 files; 9 unsafe `as any` casts | Medium |
| Logic Consistency | `ritualService.executeCouncil` is completely broken (calls `getAI()` which throws) | **Critical** |
| Logic Consistency | `syncService` has no retry/backoff; race condition on `isSyncing` is basic | Medium |
| Logic Consistency | `geminiService` has no rate limiter integration; no streaming abort controller | Medium |
| Service Boundaries | Circular import cycle: `geminiService → policyEngine → auditService → ritualService → geminiService` | High |
| Architecture Drift | ARCHITECTURE.md claims 27 services; actual = 34 | Medium |
| Architecture Drift | README.md claims 42 components; ARCHITECTURE.md claims 39; actual = 51 | Medium |
| Test Coverage | 10 services have zero dedicated tests | Medium |

---

## 2. Type Safety Analysis

### 2.1 `any` Density by File (Top 10)

| File | `any` Count | Risk | Notes |
|------|-------------|------|-------|
| `auditService.ts` | 10 | High | `as any` for records, JSON parse casts |
| `supabaseService.ts` | 9 | High | DB row → type casts for `type`, `layer`, `doc_type`, `facet`, `content`, `evidence` |
| `geminiService.ts` | 6 | Medium | Voice name `as any`, `unknown` misused as `any` |
| `securityService.ts` | 6 | Medium | Config loaded as `any` from JSON |
| `healthService.ts` | 4 | Medium | `window as any` for global bridge |
| `errorTracking.ts` | 4 | Medium | `sentry: any` for optional dependency |
| `memoryService.ts` | 4 | Low | Validation functions use `any` for runtime checks |
| `integrityService.ts` | 3 | Medium | `evidenceStats.byContour as any` |
| `ritualService.ts` | 2 | Low | `getAI().models.generateContent` (now broken) |
| `rule8Service.ts` | 2 | Low | `userFiles?: any[]` |

### 2.2 Unsafe Casts

| File | Line | Cast | Issue |
|------|------|------|-------|
| `supabaseService.ts` | 439 | `type: row.type as any` | No runtime validation of DB enum |
| `supabaseService.ts` | 440 | `layer: row.layer as any` | No runtime validation of DB enum |
| `supabaseService.ts` | 467 | `content: node.content as any` | Content typed as string in DB but could be object |
| `geminiService.ts` | 821 | `voice.name as any` | VoiceName should be strongly typed |
| `geminiService.ts` | 883, 901 | `(effectiveVoice as any)?.name` | Circumvents type safety |
| `searchService.ts` | 205 | `layer: node.layer?.toLowerCase() as any` | Bypasses MemoryNodeLayer type |
| `integrityService.ts` | 201 | `evidenceStats.byContour as any` | Should use typed mapping |
| `auditService.ts` | 409–410 | `Record<...> = {} as any` | Empty initialization bypass |

### 2.3 Missing Return Types

While many public functions have explicit return types, the following **public or significant functions** lack them:

| File | Function | Impact |
|------|----------|--------|
| `geminiService.ts` | `callAiEdgeFunction()` | Core API call; no type on return |
| `geminiService.ts` | `generateContentText()` | Core generation; no type on return |
| `geminiService.ts` | `streamGenerateContentText()` | Streaming core; no type on return |
| `geminiService.ts` | `embedContentValues()` | Embedding core; no type on return |
| `geminiService.ts` | `withRetry()` | Generic helper; no type on return |
| `searchService.ts` | `build()` | Public API; no return type |
| `searchService.ts` | `invalidate()` | Public API; no return type |
| `memoryService.ts` | `seedDefaultMantra()` | Public API; no return type |
| `memoryService.ts` | `importMemory()` | Public API; no return type |
| `integrityService.ts` | `saveLastPlaybook()` | Public API; no return type |
| `integrityService.ts` | `saveIntegrityState()` | Public API; no return type |

---

## 3. Logic Consistency Deep Dive

### 3.1 `syncService.ts` — Offline/Online Sync

| Aspect | Status | Detail |
|--------|--------|--------|
| Race condition guard | ⚠️ Partial | `isSyncing` boolean prevents concurrent runs, but no timeout/recovery if sync hangs |
| Retry logic | ❌ Missing | No retry on failure; `catch(() => {})` silently swallows errors in inner loops |
| Auth token refresh | ❌ Missing | Relies on `supabaseClient.ts` auto-refresh; no explicit handling |
| Offline queue | ⚠️ Basic | Only chat history and memory nodes are synced; tasks, habits, journal entries are not |
| Idempotency | ⚠️ Partial | `addChatMessage` is called in a loop without deduplication; duplicates possible on retry |
| Error handling | ⚠️ Weak | `catch(() => {})` on `supabaseService.addChatMessage` and `graphServiceSupabase.addNode` — silent failures |

**Risk:** If a sync batch partially fails, some data is lost with no retry or user notification.

### 3.2 `geminiService.ts` — API Error Handling & Security

| Aspect | Status | Detail |
|--------|--------|--------|
| API key exposure | ✅ Safe | API key is NOT exposed client-side; uses Supabase Edge Function proxy |
| Rate limiting | ❌ Missing | No integration with `rateLimiter.ts`; `withRetry` exists but is not tied to rate limiter |
| Streaming abort | ❌ Missing | No `AbortController` for `streamGenerateContentText`; cannot cancel in-flight requests |
| Error handling | ⚠️ Partial | `withRetry` catches errors and retries 3 times with exponential backoff; good for transient errors, but no distinction between 4xx/5xx/timeout |
| Offline mode | ✅ Implemented | `OFFLINE_MODE` flag blocks all API calls; fallback responses provided for most methods |
| Token refresh | ⚠️ Indirect | Uses `getAccessToken()` from `supabaseClient.ts`; no explicit refresh on 401 |

**Risk:** Users can trigger multiple expensive AI requests with no client-side rate limiting or cancellation.

### 3.3 `ritualService.ts` — Phase Transitions & Determinism

| Aspect | Status | Detail |
|--------|--------|--------|
| `checkRitualTriggers` | ✅ Deterministic | Priority order: PHOENIX > SHATTER > COUNCIL; thresholds are hardcoded; deterministic |
| `executePhoenix` | ✅ Deterministic | Hard reset to fixed values; no randomness |
| `executeShatter` | ✅ Deterministic | `Math.max`/`Math.min` clamped; deterministic given same input |
| `executeCouncil` | **❌ BROKEN** | Calls `getAI()` from `geminiService.ts`, which **always throws an error** (`throw new Error('Direct AI client is disabled...')`). All 9 voices return fallback silence messages. |
| `executeRetune` | ✅ Deterministic | 30% interpolation toward baseline; no randomness |
| `executeReverse` | ✅ Deterministic | History-based restore; no randomness |
| `executeRule88` | ✅ Deterministic | Fixed arithmetic transformations |
| `executeSrez5` | ✅ Deterministic | Pure function of metrics |
| `metricsHistory` | ⚠️ In-memory only | `MAX_HISTORY = 10` snapshots stored in module-level variable; lost on reload |
| `rule21Commitments` | ⚠️ In-memory only | Stored in module-level array; lost on reload |

**CRITICAL BUG:** `executeCouncil` is completely non-functional in production. It must be refactored to use `IskraAIService` or `generateText` instead of the disabled `getAI()` legacy function.

### 3.4 `policyEngine.ts` — Playbook Coverage

| Playbook | Implemented | Config | Test Coverage |
|----------|-------------|--------|---------------|
| `ROUTINE` | ✅ Yes | `deltaRequired: false`, `timeoutMs: 5000` | ✅ Yes |
| `SIFT` | ✅ Yes | `deltaRequired: true`, `siftDepth: 'standard'` | ✅ Yes |
| `SHADOW` | ✅ Yes | `deltaRequired: true`, `councilSize: 2` | ✅ Yes |
| `COUNCIL` | ✅ Yes | `deltaRequired: true`, `councilSize: 9` | ✅ Yes |
| `CRISIS` | ✅ Yes | `deltaRequired: true`, `timeoutMs: 10000` | ✅ Yes |

All 5 playbooks are fully implemented with configs, classification patterns, and SLO Guard integration. The `forcePlaybook` override function exists for manual control.

**Note:** The `councilSize` config field is not actually used by any downstream consumer.

### 3.5 `ragService.ts` — Supabase GraphRAG Usage

| Aspect | Status | Detail |
|--------|--------|--------|
| Supabase GraphRAG direct use | ❌ No | `ragService` does NOT call `graphServiceSupabase` directly |
| Indirect use | ✅ Yes | Uses `searchService` which calls `graphServiceSupabase.searchNodes()` when online |
| Env var handling | ✅ N/A | No direct env vars; relies on `supabaseClient.ts` configuration |
| SIFT conflict detection | ✅ Implemented | `detectConflicts()` finds Russian keyword oppositions |
| Multi-step SIFT | ✅ Implemented | `buildRAGContextWithSIFT()` re-queries up to 3 iterations |
| Source priority | ✅ Implemented | A_CANON > B_PROJECT > C_COMPANY > D_WEB |

**Risk:** The `ragService` is decoupled from `graphServiceSupabase` by one layer (`searchService`). If `searchService` changes its cloud search behavior, `ragService` may receive inconsistent results.

### 3.6 `securityService.ts` — PII Detection

| Aspect | Status | Detail |
|--------|--------|--------|
| PII patterns | ✅ Loaded from `securityPatterns.json` | Regex-based detection |
| PII sanitization | ✅ Implemented | `sanitizeInput()` replaces matches with `[REDACTED]` |
| Allowlist | ✅ Implemented | False positive suppression via regex |
| Prompt injection | ✅ Implemented | Pattern-based detection with `error` severity for blocking |
| Dangerous topics | ✅ Implemented | Keyword-based Russian/English dangerous topic detection |
| Validation | ✅ Implemented | `validate()` returns `PROCEED` / `REJECT` / `REDIRECT` |
| Test coverage | ✅ Exists | `securityService.test.ts` exists |
| Config freshness | ⚠️ Unknown | `schema_version` and `updated_at` loaded from JSON; no validation of version |

**Risk:** The `scanPII` regex is reset (`regex.lastIndex = 0`) before each scan, which is good. However, if the JSON config contains invalid regex patterns, the `SecurityService` constructor will throw during instantiation, potentially crashing the app on load.

### 3.7 `supabaseService.ts` — Auth Session Handling

| Aspect | Status | Detail |
|--------|--------|--------|
| Session retrieval | ✅ Implemented | Uses `getUserId()` from `supabaseClient.ts` |
| Anonymous auth | ✅ Supported | Falls back to anonymous sign-in if no real user |
| Token refresh | ✅ Automatic | `supabaseClient.ts` configures `autoRefreshToken: true` |
| Session expiry | ⚠️ Partial | No explicit handling of expired sessions in `supabaseService`; relies on client auto-refresh |
| Error handling | ⚠️ Weak | Most functions `console.error` and return empty arrays/null on failure; no user-facing error propagation |
| Data fallback | ✅ Implemented | `getChatHistory`, `getMemoryNodes`, `getLatestMetrics` fall back to `localStorage` |
| RLS compliance | ✅ Yes | Uses `auth.uid()`-based RLS via real Supabase sessions |

**Risk:** The `saveTasks` and `saveHabits` functions use a destructive "delete all + re-insert" pattern, which is not atomic. If the delete succeeds but the insert fails, all user data is lost.

---

## 4. Service Boundaries

### 4.1 Circular Imports

**CRITICAL CYCLE FOUND:**

```
geminiService.ts → policyEngine.ts → auditService.ts → ritualService.ts → geminiService.ts
```

- `geminiService` imports `policyEngine` for `getChatResponseStreamWithPolicy`
- `policyEngine` imports `auditService` for `log()`
- `auditService` imports `ritualService` for `RitualName` type
- `ritualService` imports `geminiService` for `getAI()` and `DELTA_PROTOCOL_INSTRUCTION`

**Secondary cycle:**

```
geminiService.ts → evalService.ts → auditService.ts → ritualService.ts → geminiService.ts
```

**Type-only cycle:**

```
policyEngine.ts → integrityService.ts (type only) → policyEngine.ts (type only)
```

**Impact:** The main cycle is dangerous because `ritualService` imports `geminiService` at module load time, and `geminiService` imports `policyEngine` at module load time. While the runtime may handle this due to the specific export shapes (the `getAI()` function is exported early), this is fragile and can cause initialization order bugs or `undefined` imports during bundling.

**Recommendation:** Break the cycle by moving `RitualName` to `../types` (where it belongs) so `auditService` does not depend on `ritualService`. Also, `ritualService` should not import `geminiService` for `getAI()` (especially since `getAI()` is deprecated and broken); it should import only the types/instructions it needs, or use a separate AI gateway service.

### 4.2 UI Layer Leak

| Direction | Status | Detail |
|-----------|--------|--------|
| Services → Components | ✅ Clean | No service imports from `components/` |
| Services → UI libraries | ✅ Clean | No React/Vue imports in services |
| Components → Services | ✅ Expected | Components import services (correct direction) |

### 4.3 `App.tsx` Direct Imports

The audit did not find direct `from 'services/'` imports in `App.tsx`, but `App.tsx` likely imports services via barrel files or relative paths. This is allowed by architecture.

---

## 5. Contradictions & Drift

### 5.1 `memoryService.ts` vs `syncService.ts` — Dual Sync Conflict

| `memoryService` | `syncService` |
|----------------|---------------|
| On `addArchiveEntry` / `addShadowEntry`: immediate background sync to `graphServiceSupabase` via `void (async () => { ... })()` | On `online` event: batch sync all pending memory nodes to `graphServiceSupabase` |
| Syncs individual node + builds connections immediately | Syncs all cached nodes + builds connections for each |
| Uses `isSupabaseAvailable()` check | Uses `isSupabaseAvailable()` check |
| **Result:** Same node can be synced twice: once on add, once on online event. No deduplication logic. | |

**Risk:** Duplicate nodes in Supabase GraphRAG. The `graphServiceSupabase.addNode` uses `crypto.randomUUID()` for node IDs, so duplicates will have different IDs, creating orphaned nodes.

### 5.2 `graphService.ts` vs `graphServiceSupabase.ts` — Inconsistent Usage

| Consumer | Uses `graphService` (in-memory) | Uses `graphServiceSupabase` (persistent) |
|----------|-------------------------------|------------------------------------------|
| `memoryService.ts` | ❌ No | ✅ Yes (for sync) |
| `searchService.ts` | ❌ No | ✅ Yes (for cloud search) |
| `ragService.ts` | ❌ No | ⚠️ Indirect (via `searchService`) |
| `syncService.ts` | ❌ No | ✅ Yes (for memory sync) |
| `canonService.ts` | ❌ No | ❌ No (uses `memoryService` only) |
| `App.tsx` / Components | ❌ Unknown | ❌ Unknown |

`graphService.ts` (in-memory) is initialized with 8 canon mantra nodes but appears to have **no active consumers** in the service layer. All memory-related features route to `graphServiceSupabase`. This means the in-memory hypergraph is dead code in the current architecture.

**Recommendation:** Either revive `graphService` as a local cache layer, or remove it to reduce bundle size.

### 5.3 Service Count Drift

| Source | Claimed | Actual | Delta |
|--------|---------|--------|-------|
| `ARCHITECTURE.md` | 27 | 34 | +7 |
| `README.md` | 27 | 34 | +7 |

**Services missing from both docs:**

1. `analytics.ts` — PostHog analytics wrapper
2. `graphServiceSupabase.ts` — Persistent GraphRAG via Supabase RPC
3. `healthService.ts` — HealthKit/Health Connect bridge
4. `integrityService.ts` — Integrity state between turns (SLO Guard support)
5. `supabaseClient.ts` — Supabase client initialization & auth
6. `supabaseService.ts` — CRUD operations for users, tasks, habits, journal, chat, memory
7. `storageCompat.ts` — Safe localStorage wrapper for Node/Vitest compatibility

### 5.4 Component Count Drift

| Source | Claimed | Actual | Delta |
|--------|---------|--------|-------|
| `README.md` | 42 | 51 | +9 |
| `ARCHITECTURE.md` | 39 | 51 | +12 |

Actual count includes 48 UI components + 3 infrastructure files (`index.ts`, `types.ts`, `icons.tsx`). Even excluding infrastructure, the docs are undercounted by 6–9 components.

---

## 6. Missing / Incomplete / Stubs

| File | Issue | Severity |
|------|-------|----------|
| `ritualService.ts` | `executeCouncil` is broken; `getAI()` always throws | **Critical** |
| `rule8Service.ts` | `checkFileUpdates` is a mock implementation (`// Mock implementation`) | Medium |
| `healthService.ts` | `_StubHealthProvider` is marked `@ts-ignore - unused` but kept for reference | Low |
| `analytics.ts` | `posthog` typed as `any`; no error handling if `init` fails | Low |
| `errorTracking.ts` | `sentry` typed as `any`; no error handling if `init` fails | Low |
| `graphService.ts` | No active consumers in service layer; potentially dead code | Medium |
| `storageService.ts` | `importAllData` calls `window.location.reload()` which is a UX anti-pattern | Low |
| `supabaseService.ts` | `saveTasks` / `saveHabits` use destructive delete-all-then-insert; not atomic | Medium |

### 6.1 Services Without Tests (10 of 34)

| Service | Notes |
|---------|-------|
| `analytics.ts` | PostHog integration; no tests |
| `errorTracking.ts` | Sentry integration; no tests |
| `graphService.ts` | In-memory graph; no tests |
| `graphServiceSupabase.ts` | Supabase RPC graph; no tests |
| `healthService.ts` | Health bridge; no tests (though `healthService.test.ts` exists — wait, it DOES exist) |
| `integrityService.ts` | SLO Guard helper; no tests |
| `rateLimiter.ts` | Rate limiting; no tests |
| `supabaseClient.ts` | Auth client; no tests |
| `supabaseService.ts` | CRUD service; no tests |
| `storageCompat.ts` | localStorage compat; no tests |
| `validatorsService.ts` | Validation helpers; no tests |

**Correction:** `healthService.test.ts` exists. So the actual count is 10 services without tests, not 11.

---

## 7. Architecture Recommendations

### 7.1 Immediate Actions (Critical / High Priority)

1. **Fix `ritualService.executeCouncil`** — Replace `getAI()` with `new IskraAIService()` or `generateText()` from `geminiService.ts`. The COUNCIL ritual is a core feature and is completely broken.
2. **Break circular import** — Move `RitualName` type from `ritualService.ts` to `../types.ts` so `auditService` can import it without creating a cycle.
3. **Fix dual sync in `memoryService` + `syncService`** — Add a `synced_to_cloud` flag to localStorage entries, or use a single sync coordinator. Prevent duplicate node creation in Supabase.
4. **Document missing services** — Update `ARCHITECTURE.md` and `README.md` to include the 7 undocumented services.

### 7.2 Short-Term Improvements (Medium Priority)

5. **Integrate `rateLimiter.ts` with `geminiService.ts`** — All API calls should pass through `withRateLimit` before hitting the network.
6. **Add `AbortController` to `streamGenerateContentText`** — Allow users to cancel streaming responses.
7. **Replace `as any` casts in `supabaseService.ts`** with proper type guards or Zod validation for DB rows.
8. **Add atomic upsert to `supabaseService.ts`** — Replace `delete all + insert` with `upsert` for tasks and habits.
9. **Add tests for the 10 uncovered services** — Especially `validatorsService`, `integrityService`, and `supabaseService`.
10. **Decide fate of `graphService.ts`** — Either use it as a local cache in front of `graphServiceSupabase`, or remove it.

### 7.3 Long-Term Hygiene (Low Priority)

11. **Add explicit return types to all public functions** — Enable `noImplicitAny` and `strict` if not already enabled.
12. **Remove `@ts-ignore` and `@ts-expect-error` comments** where possible (currently 3 in `analytics.ts`, `errorTracking.ts`).
13. **Standardize env var handling** — `geminiService.ts`, `analytics.ts`, `errorTracking.ts` all read `import.meta.env` inline; centralize to a config service.
14. **Improve `syncService.ts` retry logic** — Add exponential backoff with jitter, partial failure tracking, and user notification on persistent sync failures.
15. **Update component counts in docs** — `README.md` and `ARCHITECTURE.md` should reflect 51 files (or 48 UI components).

---

## 8. Summary Table: Service × Issues × Risk

| Service | Issues | Risk | Notes |
|---------|--------|------|-------|
| `syncService.ts` | No retry, weak error handling, dual sync | Medium | Core offline feature |
| `geminiService.ts` | No rate limiter, no abort, 6 `any` | Medium | Core AI gateway |
| `ritualService.ts` | **executeCouncil BROKEN**, 2 `any` | **Critical** | Core ritual feature |
| `policyEngine.ts` | 1 `any`, type-only cycle | Low | Complete & tested |
| `ragService.ts` | None significant | Low | Well-implemented |
| `evalService.ts` | None significant | Low | Well-implemented |
| `securityService.ts` | 6 `any`, config validation gap | Medium | Tested but loose types |
| `supabaseService.ts` | 9 `any`, destructive save, weak errors | Medium | Core data layer |
| `memoryService.ts` | 4 `any`, dual sync, no Supabase fallback | Medium | Core memory layer |
| `graphService.ts` | Dead code | Low | No consumers |
| `graphServiceSupabase.ts` | None significant | Low | Clean RPC boundary |
| `validatorsService.ts` | 2 `any`, no tests | Low | Complete but untested |
| `metricsService.ts` | None | Low | Clean & tested |
| `auditService.ts` | 10 `any`, weak storage | Medium | Tested but loose |
| `integrityService.ts` | 3 `any`, no tests | Medium | SLO Guard support |
| `deltaProtocol.ts` | None | Low | Clean & tested |
| `deltaEnforcer.ts` | 1 `any` | Low | Clean & tested |
| `searchService.ts` | 1 `any`, indirect cloud deps | Low | Clean |
| `voiceEngine.ts` | None | Low | Clean & tested |
| `voiceSynapseService.ts` | None | Low | Clean & tested |
| `makiService.ts` | None | Low | Clean & tested |
| `rule8Service.ts` | 2 `any`, mock file updates | Low | Partially tested |
| `evidenceService.ts` | None | Low | Clean & tested |
| `glossaryService.ts` | None | Low | Clean & tested |
| `canonService.ts` | None | Low | Clean & tested |
| `analytics.ts` | 2 `any`, optional dep | Low | Untested |
| `errorTracking.ts` | 4 `any`, optional dep | Low | Untested |
| `healthService.ts` | 4 `any` (window bridge) | Low | Tested |
| `rateLimiter.ts` | None | Low | Untested |
| `storageService.ts` | None | Low | Tested |
| `storageCompat.ts` | None | Low | Untested |
| `soundService.ts` | 1 `any` (window bridge) | Low | Tested |
| `userMetricsService.ts` | None | Low | Tested |
| `supabaseClient.ts` | None | Low | Untested |

---

*Report generated by Services_Auditor. Next step: Create ADR or ticket for the critical `executeCouncil` fix and the circular import break.*
