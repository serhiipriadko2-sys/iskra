import {
  calculateDFA as calculateDFACompatibility,
  calculateFractalIndicators as calculateFractalIndicatorsCompatibility,
  calculateHFD as calculateHFDCompatibility,
} from './fractal.js'

export * from './types.js'
export * from './quantum.js'
export * from './entropy.js'
export * from './fractal-authority.js'

export type { MetricTimeSeries } from './fractal.js'
export {
  D_THRESHOLDS,
  H_THRESHOLDS,
  QUANTUM_THRESHOLDS,
  calculateCSI,
  calculateEI,
  calculateEdgeDistance,
  calculateNC,
  calculateQuantumIndicators,
  classifyPhase,
} from './fractal.js'

/**
 * Compatibility-only raw scalar and aggregate APIs.
 * New consumers must use calculateHFDMetric/calculateDFAMetric.
 */
export const fractalCompatibility = Object.freeze({
  calculateHFD: calculateHFDCompatibility,
  calculateDFA: calculateDFACompatibility,
  calculateFractalIndicators: calculateFractalIndicatorsCompatibility,
})
