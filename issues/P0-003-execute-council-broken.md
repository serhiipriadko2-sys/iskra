# [P0-BLOCKER] `executeCouncil` Completely Broken — All 9 Council Voices Return Silence

## Status: 🔴 BLOCKER — Core ritual mechanic non-functional

## Problem
`services/ritualService.ts` → `executeCouncil()` calls `getAI()` which **always throws** an error: `"Direct AI client is disabled"`. This means the COUNCIL ritual — a key feature of the Iskra Canon — generates 9 silent fallback responses instead of actual multi-voice deliberation.

## Evidence

**`ritualService.ts:141`:**
```typescript
const getAI = () => geminiService.getAI(); // or similar
// ...
const voiceResponse = await getAI()({ ... }); // Always throws
```

**`geminiService.ts:821`:**
```typescript
getAI(): () => Promise<string> {
  throw new Error('Direct AI client is disabled');
}
```

The `getAI()` method was explicitly disabled for security (client-side API key prevention), but `ritualService.ts` was never updated to use the new Supabase Edge Function proxy.

## Impact
- COUNCIL ritual is the most complex and philosophically important ritual in the Canon
- Users triggering COUNCIL receive 9 copies of "молчание" (silence) — degrading trust
- All 9 voices (ISKRA, KAIN, PINO, SAM, ANHANTRA, HUYNDUN, ISKRIV, MAKI, SIBYL) fail to generate deliberation content
- No test catches this because `ritualService.test.ts` mocks `getAI()` or tests the trigger logic, not the generation

## Fix

Replace `getAI()` call in `executeCouncil` with `generateText()` or a dedicated Edge Function call:

```typescript
// Instead of:
const voiceResponse = await getAI()({ prompt: voicePrompt, temperature: 0.8 });

// Use:
const voiceResponse = await generateText({
  prompt: voicePrompt,
  temperature: 0.8,
  maxTokens: 500,
  // Route through Supabase Edge Function
});
```

Or create a dedicated `councilService.ts` that orchestrates the 9 calls through the Edge Function in parallel (`Promise.all`).

## ∆DΩΛ
∆: COUNCIL ritual generation completely broken  
D: `ritualService.ts:141` + `geminiService.ts:821`  
Ω: 99%  
Λ: Replace `getAI()` with `generateText()` via Edge Function
