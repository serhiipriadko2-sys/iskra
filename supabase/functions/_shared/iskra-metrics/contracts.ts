import type { FractalMetricResult } from './fractal-authority.ts'

export const ALGORITHM_VERSION = 'iskra-metrics-compute-v1.2.0'

export type EntropyRegime = 'LOOP' | 'FLOW' | 'CHAOS'

export interface RawObservation {
  readonly text?: string
  readonly signal?: readonly number[]
}

export interface DerivedValue<T> {
  readonly value: T | null
  readonly unavailable: boolean
  readonly reason: string | null
}

export interface ComputedMetrics {
  readonly shannon_entropy: DerivedValue<number>
  readonly entropy_regime: DerivedValue<EntropyRegime>
  readonly hfd: FractalMetricResult
  readonly dfa: FractalMetricResult
}

export interface CalculatorResult {
  readonly algorithm_version: string
  readonly input_hash: string
  readonly metrics: ComputedMetrics
  readonly unavailable: readonly string[]
  readonly invalid: readonly string[]
  readonly numerical_failure: readonly string[]
}

export interface MetricObservation<T = number> {
  readonly value: T | null
  readonly source: string | null
  readonly observed_at: string | null
  readonly algorithm_version: string | null
  readonly input_hash: string | null
}
