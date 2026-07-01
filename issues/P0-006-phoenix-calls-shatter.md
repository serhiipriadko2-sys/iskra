# [P0-BLOCKER] `IskraStateView.handlePhoenix` Calls `onShatter` — Destructive UI Bug

## Status: 🔴 BLOCKER — User triggers Phoenix, gets Shatter

## Problem
In `components/IskraStateView.tsx`, the `handlePhoenix` button handler calls `onShatter()` instead of `onPhoenix()`. This means when a user clicks the Phoenix (rebirth/renewal) ritual button, the app executes the Shatter (destructive reset) ritual instead.

## Evidence

**`components/IskraStateView.tsx:121-124`:**
```typescript
const handlePhoenix = () => {
    triggerGlitch();
    soundService.playRitualShatter(); // ← Wrong sound too
    onShatter(); // ← BUG: This is handleShatter from App.tsx, NOT handlePhoenix!
    ...
};
```

**`App.tsx`:**
```typescript
const handlePhoenix = () => { ... }; // Defined but NEVER passed to IskraStateView
const handleShatter = () => { ... }; // Passed as onShatter prop

// In JSX:
<IskraStateView metrics={metrics} phase={phase} onShatter={handleShatter} />
// onPhoenix is NOT passed!
```

## Impact
- User intentionally triggers renewal (Phoenix) but experiences destructive reset (Shatter)
- Metrics are wiped instead of being reborn from ashes
- User trust in ritual mechanics is destroyed
- This is a direct contradiction between UI intent and actual execution

## Fix

**In `App.tsx`:**
```typescript
<IskraStateView
    metrics={metrics}
    phase={phase}
    onShatter={handleShatter}
    onPhoenix={handlePhoenix} // ← ADD THIS
/>
```

**In `IskraStateView.tsx`:**
```typescript
// Update interface
interface IskraStateViewProps {
    metrics: IskraMetrics;
    phase: IskraPhase;
    onShatter: () => void;
    onPhoenix: () => void; // ← ADD THIS
}

// Fix handler
const handlePhoenix = () => {
    triggerGlitch();
    soundService.playRitualPhoenix(); // ← Fix sound too
    onPhoenix(); // ← FIX: Call onPhoenix, not onShatter
    ...
};
```

## ∆DΩΛ
∆: Phoenix button calls Shatter — destructive UI bug
D: `IskraStateView.tsx:121` + `App.tsx` props
Ω: 99%
Λ: Pass onPhoenix prop + fix handler + fix sound
