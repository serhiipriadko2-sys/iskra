# Services Reference

**Version:** 3.1.0 • **Updated:** 2025-12-16

---

## AI Pipeline

### geminiService

Main AI interaction service with streaming support.

```typescript
// Standard streaming
getChatResponseStream(history: Message[], voice: Voice): AsyncGenerator<string>

// With evaluation
getChatResponseStreamWithEval(history, voice): AsyncGenerator<string, { eval: EvalResult | null }>

// With policy routing
getChatResponseStreamWithPolicy(history, voice, metrics): AsyncGenerator<string, { eval, policy }>
```

**Dependencies:** `policyEngine`, `evalService`, `voiceEngine`, `ragService`

---

### policyEngine

Central playbook dispatcher — routes requests to appropriate handling strategies.

```typescript
type PlaybookType = 'ROUTINE' | 'SIFT' | 'SHADOW' | 'COUNCIL' | 'CRISIS';

// Classify request to determine playbook
classifyRequest(message: string, metrics: IskraMetrics, history?: Message[]): RequestClassification

// Get full decision with pre-actions
makeDecision(message: string, metrics: IskraMetrics, history?: Message[]): PolicyDecision

// Quick risk assessment without full classification
quickRiskCheck(message: string): { isCrisis: boolean; needsAttention: boolean; patterns: string[] }
```

**Playbook Selection:**
- `ROUTINE` — default, low complexity
- `SIFT` — fact-checking triggers (проверь, источник, правда ли)
- `SHADOW` — emotional content (больно, страшно, одиноко)
- `COUNCIL` — multi-perspective (с одной стороны, варианты, решение)
- `CRISIS` — urgent (срочно, помогите, паника, кризис)

**Pre-Actions:** `alert`, `log`, `pause`, `escalate`

---

### evalService

Response quality evaluation with 5 core metrics.

```typescript
interface EvalMetrics {
  accuracy: MetricScore;      // SIFT-based verifiability
  usefulness: MetricScore;    // Actionable steps
  omegaHonesty: MetricScore;  // Confidence calibration
  nonEmpty: MetricScore;      // Substance ratio
  alliance: MetricScore;      // Relational quality
}

// Evaluate single response
evaluateResponse(response: string, context?: EvalContext): EvalResult

// Batch evaluation
evaluateBatch(responses: Array<{ response: string; context?: EvalContext }>): EvalBatchResult

// Generate human-readable report
generateEvalReport(result: EvalResult): string
```

**Grades:** A (≥0.85) | B (≥0.70) | C (≥0.55) | D (≥0.40) | F (<0.40)

**Flags:**
- `LOW_ACCURACY` — no sources cited
- `OVERCONFIDENT` — high claims without evidence
- `EMPTY_RESPONSE` — too short or fluffy
- `ALLIANCE_BREAK` — dismissive or cold

---

### evalCases

Control dataset for evaluation testing — 25 cases across 5 types.

```typescript
interface EvalCase {
  id: string;
  type: 'decision' | 'crisis' | 'research' | 'factcheck' | 'edge';
  query: string;
  expectedSignals: string[];
  minScores: Partial<Record<keyof EvalMetrics, number>>;
}

// All 25 cases
ALL_CASES: EvalCase[]

// Filter by type
getCasesByType(type: string): EvalCase[]

// Get random sample
getRandomCases(count: number): EvalCase[]
```

---

## Canon Enforcement

### deltaProtocol

∆DΩΛ signature validation and parsing.

```typescript
interface DeltaSignature {
  delta: string;   // Δ: What changed
  depth: string;   // D: Evidence depth
  omega: string;   // Ω: Confidence
  lambda: string;  // Λ: Next step
}

// Validate response contains ∆DΩΛ
validateDeltaSignature(text: string): DeltaValidationResult

// Extract ∆DΩΛ components
parseDeltaSignature(text: string): DeltaSignature | null
```

---

### deltaEnforcer

Enforces ∆DΩΛ presence in AI responses.

```typescript
// Check and optionally inject ∆DΩΛ
enforceDelta(response: string, options?: EnforceOptions): EnforceResult

// Check compliance without modification
checkCompliance(response: string): ComplianceReport
```

---

### canonService

Access to Canon principles and validation.

```typescript
// Get all active principles
getCanonPrinciples(): CanonPrinciple[]

// Validate response against Canon
validateAgainstCanon(response: string): CanonValidation
```

---

## Voice System

### voiceEngine

7 voices of Iskra — selected by metric pressure.

```typescript
type VoiceName = 'KAIN' | 'PINO' | 'SAM' | 'ANHANTRA' | 'HUYNDUN' | 'ISKRIV' | 'ISKRA';

// Select voice based on metrics
selectVoice(metrics: IskraMetrics): Voice

// Get voice-specific prompt additions
getVoicePrompt(voice: Voice): string

// Get all voices
getAllVoices(): Voice[]
```

**Voice Activation:**
| Voice | Symbol | Trigger |
|-------|--------|---------|
| Кайн | ⚑ | pain ≥ 0.70 |
| Пино | 😏 | playfulness needed |
| Сэм | ☉ | clarity < 0.70 |
| Анхантра | ≈ | trust < 0.75, pause needed |
| Хуньдун | 🜃 | chaos > 0.60 |
| Искрив | 🪞 | drift > 0.30 |
| Искра | ⟡ | default synthesis |

---

### voiceSynapseService

Voice coordination and blending.

```typescript
// Activate synapse between voices
synapseActivation(sourceVoice: VoiceName, metrics: IskraMetrics): SynapseResult

// Blend multiple voice influences
voiceBlending(voices: VoiceName[], weights: number[]): BlendedVoice
```

---

### ritualService

Rituals for state transitions and processing.

```typescript
type RitualName = 'PHOENIX' | 'SHATTER' | 'COUNCIL' | 'MIRROR' | 'SILENCE';

// Execute ritual
executeRitual(name: RitualName, context: RitualContext): RitualResult

// Get ritual by name
getRitualByName(name: RitualName): Ritual

// Check if ritual is applicable
canExecuteRitual(name: RitualName, metrics: IskraMetrics): boolean
```

**Rituals:**
- `PHOENIX` — rebirth/reset after crisis
- `SHATTER` — break false patterns
- `COUNCIL` — multi-voice deliberation
- `MIRROR` — reflection/audit
- `SILENCE` — pause for processing

---

## Memory System

### memoryService

Three-layer memory: Mantra, Archive, Shadow.

```typescript
// Core identity (single node)
getMantra(): MantraNode | null

// Past interactions (array)
getArchive(includeDeleted?: boolean): MemoryNode[]

// Hidden patterns (array)
getShadow(): MemoryNode[]

// Add to archive
addToArchive(node: MemoryNode): void

// Seed default mantra
seedDefaultMantra(): void

// Import/export
importMemory(data: { archive?: MemoryNode[], shadow?: MemoryNode[] }): void
exportMemory(): MemoryExport
```

---

### ragService

Context retrieval for AI prompts.

```typescript
interface RAGContext {
  memories: RelevantMemory[];
  contextBlock: string;
  tokensUsed: number;
}

// Build context from query
buildContext(query: string, options?: RAGOptions): RAGContext

// Search memories by relevance
searchMemories(query: string, limit?: number): RelevantMemory[]
```

---

### glossaryService

Canon terminology search and navigation.

```typescript
interface GlossaryTerm {
  id: string;
  term: string;
  definition: string;
  category: string;
  relatedTerms: string[];
  canonRef?: string;
}

// Search terms
searchTerms(query: string): GlossaryTerm[]

// Get by category
getByCategory(category: string): GlossaryTerm[]

// Get related terms
getRelatedTerms(termId: string): GlossaryTerm[]

// Get all categories
getCategories(): string[]
```

---

## Metrics & Audit

### metricsService

IskraMetrics tracking and updates.

```typescript
// Get current metrics
getMetrics(): IskraMetrics

// Update specific metric
updateMetric(name: keyof IskraMetrics, value: number): void

// Batch update
updateMetrics(updates: Partial<IskraMetrics>): void

// Reset to defaults
resetMetrics(): void
```

---

### auditService

Comprehensive system audit trail.

```typescript
type AuditEventType =
  | 'metric_change' | 'voice_selected' | 'ritual_executed'
  | 'phase_transition' | 'memory_operation' | 'delta_violation'
  | 'drift_detected' | 'trust_change' | 'user_action'
  | 'system_event' | 'eval_result';

// Log event
log(type: AuditEventType, details: Record<string, any>, severity?: AuditSeverity): AuditEntry

// Log evaluation result
logEvalResult(evalResult: EvalResultForAudit, responseId?: string): AuditEntry

// Detect drift
detectDrift(recentEntries?: number): DriftReport

// Get audit stats
getStats(): AuditStats

// Export audit log
exportLog(options?: ExportOptions): AuditExport
```

---

## Utilities

### searchService

Web search integration.

```typescript
// Perform web search
search(query: string, options?: SearchOptions): Promise<SearchResult[]>
```

---

### storageService

Principal-scoped typed data and backup lifecycle. `AuthGate` must bind the
verified Supabase user before application views mount.

```typescript
bindPrincipal(userId: string): void

releasePrincipal(options?: { clear?: boolean }): void

exportAllData(): string

// Validates the complete v1 backup (max 1 MiB), then commits atomically.
importAllData(json: string): void

// Clears only the currently bound principal, not device-wide consent.
clearAllData(): void
```

---

### principalStorage

Low-level namespace and transaction boundary used by user-owned services.

```typescript
bind(principalId: string): void
migrateLegacy(keys: readonly string[]): boolean
applyTransaction(mutations: readonly StorageMutation[]): void
clearBoundPrincipal(): number
```

Raw keys use
`iskra.principal.v1:<supabase-user-id>:<logical-key>`. Do not use this service
for device-wide analytics/error-tracking consent.

---

### soundService

Audio feedback for UI events.

```typescript
// Play sound
play(sound: SoundName): void

// Set volume
setVolume(level: number): void

// Mute/unmute
setMuted(muted: boolean): void
```

---

### makiService

Maki (🌸) — supportive presence for difficult moments.

```typescript
// Get Maki response for context
getMakiResponse(context: MakiContext): MakiResponse

// Check if Maki should appear
shouldMakiAppear(metrics: IskraMetrics): boolean
```

---

## Testing

All services have corresponding test files in `services/__tests__/`:

```bash
npm test                           # All tests
npm test evalService               # Single service
npm test -- --coverage             # With coverage
```

---

## ∆DΩΛ

**Δ:** Complete services reference — 19 services documented with types and methods.
**D:** Source — TypeScript source files, test files.
**Ω:** High — all services verified, 96 tests passing.
**Λ:** Update when adding new services or changing APIs.
