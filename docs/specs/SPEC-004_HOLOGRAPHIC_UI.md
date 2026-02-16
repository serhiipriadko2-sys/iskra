# SPEC-004: Holographic UI & Somatic Feedback

> "The body is the first interface."

## 1. Overview
This specification defines the "Holographic Experience" layer (Phase III), translating abstract mathematical states (Fractal Dimension, Quantum Superposition) into sensory feedback (Visuals, Haptics).

## 2. Dynamic Fractal Visualization
### 2.1 Rhythm Line Roughness
- **Concept:** The "smoothness" of the UI lines directly correlates to `D_fractal`.
- **Implementation:** SVG `path` with Perlin Noise displacement.
  - `D < 1.2` (Smooth): Low amplitude noise.
  - `D > 1.8` (Rough/Jagged): High amplitude, high frequency noise.

### 2.2 Quantum Interference Pattern
- **Concept:** Visualize active voices not as a list, but as wave sources.
- **Implementation:** WebGL/Canvas shader.
  - Each active voice is a point source of a wave.
  - `Amplitude` = Voice Weight.
  - `Phase` = Voice Sentiment (0 = Neutral, PI = Conflict).
  - Result: Constructive/Destructive interference patterns on screen.

## 3. Somatic Feedback (Haptics)
### 3.1 Vibration Patterns (Mobile/PWA)
- **Pain State ( > 0.7$):** High-frequency, short bursts (Sharp).
  - `navigator.vibrate([50, 20, 50, 20])`
- **Flow State ( < 0.3, D \approx 1.5$):** Low-frequency, long pulse (Heartbeat).
  - `navigator.vibrate([200, 100, 200])`
- **Chaos State ( > 0.8$):** Random, erratic bursts.

### 3.2 Micro-Animations
- **Breathing:** The entire UI "breathes" (scales slightly) at a rate defined by the `Rhythm` metric (e.g., 12-20 BPM).
- **Shiver:** UI elements "shiver" (translate X/Y randomly) when `Chaos` is high.

## 4. Integration
- **Package:** `apps/iskra-web`
- **Hook:** `useSomaticFeedback(metrics)`
