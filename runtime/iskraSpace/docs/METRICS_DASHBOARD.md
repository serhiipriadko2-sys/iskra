# Real-Time Metrics Dashboard

## Overview

The Real-Time Metrics Dashboard provides live visualization of ISKRA's fractal and quantum cognitive indicators. It tracks system state evolution in real-time and displays advanced metrics based on the canonical definitions from `metrics/indices.md`.

## Features

### 1. System Phase Detection
- **Stable** (D: 1.0-1.4): Smooth, predictable signal
- **Edge of Chaos** (D: 1.4-1.6): Optimal complexity zone
- **Chaotic** (D: 1.6-2.0): High entropy regime

### 2. Fractal Indicators (§10)
Based on `metrics/indices.md` §10, the dashboard calculates and visualizes:

- **D_chaos**: Fractal dimension of chaos metric (1.0-2.0)
- **D_clarity**: Fractal dimension of clarity metric (1.0-2.0)
- **D_drift**: Fractal dimension of drift metric (1.0-2.0)
- **H_trust**: Hurst exponent for trust (0-1)
  - 0.0-0.4: Anti-persistent (mean-reverting)
  - 0.4-0.6: Random walk
  - 0.6-1.0: Persistent (trend-following)
- **complexityIndex**: Composite complexity measure
- **edgeDistance**: Distance to "edge of chaos" zone

### 3. Quantum Indicators (§11)
Cognitive quantum indicators based on §11:

- **CSI (Cognitive Superposition Index)**: Ability to hold multiple states simultaneously
  - Low: Collapsed state
  - Medium: Balance
  - High: Superposition
- **EI (Entanglement Index)**: Correlation between metrics
  - Low: Decoupled metrics
  - Medium: Normal correlation
  - High: Entangled metrics
- **NC (Non-Commutativity Index)**: Order-dependency of operations

### 4. Real-Time Trend Visualization
Line charts showing the last 30 cycles for:
- Chaos
- Clarity
- Drift
- Trust

### 5. Metrics History Tracking
- Stores last 100 metric snapshots
- Updates automatically when metrics change
- Minimum 10 data points required for fractal/quantum calculations

## Usage

### Accessing the Dashboard
1. Navigate to the sidebar
2. Click on "Метрики" (Metrics) icon (📈)
3. The dashboard will begin collecting data immediately

### Reading the Indicators

#### Fractal Dimension (D)
```
1.0 ────── 1.4 ────── 1.6 ────── 2.0
  Stable    │  Edge   │  Chaotic
            Optimal
```

#### Hurst Exponent (H)
```
0.0 ────── 0.4 ────── 0.6 ────── 1.0
Anti-persistent │ Random │ Persistent
   (Mean-rev)    │        │  (Trending)
```

### Color Coding
- 🟢 **Green**: Optimal/Good state
- 🟡 **Yellow**: Warning/Moderate state
- 🔴 **Red**: Critical/Poor state
- 🔵 **Blue**: Accent/Neutral state

## Implementation Details

### Component Location
`runtime/iskraSpace/components/MetricsDashboard.tsx`

### Dependencies
- Uses types from `@iskra/runtime` (FractalIndicators, QuantumIndicators)
- Integrates with existing metrics system
- No external charting libraries (pure SVG)

### Performance
- History capped at 100 entries (~5 minutes at 3s intervals)
- Calculations only run when sufficient data available
- Uses React state for efficient re-renders

### Calculations
All calculations use the canonical algorithms from `runtime/src/types/fractal.ts`:
- `calculateHFD()`: Higuchi Fractal Dimension
- `calculateDFA()`: Detrended Fluctuation Analysis
- `calculateCSI()`: Cognitive Superposition Index
- `calculateEI()`: Entanglement Index
- `calculateNC()`: Non-Commutativity Index

## Integration with ISKRA Canon

This dashboard implements the specifications from:
- **metrics/indices.md** §10 (Fractal Indicators)
- **metrics/indices.md** §11 (Quantum Indicators)
- **system/architecture.md** (Core metrics system)

It follows the **∆DΩΛ Protocol**:
- **∆ (Delta)**: Real-time state changes visualized
- **D (Depth)**: Based on canonical calculations
- **Ω (Omega)**: Confidence levels implicit in thresholds
- **Λ (Lambda)**: Actionable insights via phase detection

## Future Enhancements

Potential improvements:
- [ ] Export metrics history to CSV
- [ ] Configurable time windows
- [ ] Alert system for critical thresholds
- [ ] Integration with EWS (Early Warning System)
- [ ] Playback/replay of historical sessions
- [ ] Detailed drill-down views per indicator
- [ ] Voice-specific metric tracking

## Related Components

- `IskraStateView.tsx`: Shows basic metrics and system state
- `EvalDashboard.tsx`: Shows evaluation metrics
- `MetricsService.ts`: Core metrics calculation logic

## Version

**Initial Release**: v0.3.1
**Date**: 2026-01-05
**Status**: Stable
