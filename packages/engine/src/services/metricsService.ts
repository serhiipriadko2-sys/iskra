import { DEFAULT_METRICS, type IskraMetrics, type MantraNode } from '@iskra/core'
import {
  calculateHFDMetric,
  calculateShannonEntropy,
  complex,
  interference,
  type FractalMetricResult,
  type QuantumStateVector,
} from '@iskra/math'
import type { Explainable, ExplainStep } from '../types/explainable'

const METRIC_LIMITS: Record<keyof IskraMetrics, { min: number; max: number }> = {
  rhythm: { min: 0, max: 100 },
  trust: { min: 0, max: 1 },
  pain: { min: 0, max: 1 },
  chaos: { min: 0, max: 1 },
  drift: { min: 0, max: 1 },
  echo: { min: 0, max: 1 },
  clarity: { min: 0, max: 1 },
  silence_mass: { min: 0, max: 1 },
  mirror_sync: { min: 0, max: 1 },
  interrupt: { min: 0, max: 1 },
  ctxSwitch: { min: 0, max: 1 },
  foresight: { min: 0, max: 1 },
}

interface FractalFeedback {
  readonly chaos: FractalMetricResult
  readonly drift: FractalMetricResult
  readonly dimension: number | null
}

interface NextMetricsComputation {
  readonly next: IskraMetrics
  readonly entropy: number | null
  readonly fractal: FractalFeedback
  readonly appliedModifiers: Record<string, number>
}

const clampMetric = (metricKey: keyof IskraMetrics, value: number): number => {
  const limit = METRIC_LIMITS[metricKey]
  return Math.max(limit.min, Math.min(limit.max, value))
}

export class MetricsEngine {
  private history: IskraMetrics[] = []
  private quantumStates: Map<string, QuantumStateVector> = new Map()

  constructor(initialMetrics: IskraMetrics = DEFAULT_METRICS) {
    this.history.push(initialMetrics)
  }

  private computeNextMetrics(
    modifiers: Partial<IskraMetrics>,
    text?: string,
  ): NextMetricsComputation {
    const current = this.getCurrentMetrics()
    const next: IskraMetrics = { ...current }
    const appliedModifiers: Record<string, number> = {}

    for (const key in modifiers) {
      if (!Object.prototype.hasOwnProperty.call(modifiers, key)) continue
      const metricKey = key as keyof IskraMetrics
      const value = modifiers[metricKey]
      if (typeof value !== 'number') continue
      const currentValue = next[metricKey] || 0
      next[metricKey] = clampMetric(metricKey, currentValue + value)
      appliedModifiers[metricKey] = value
    }

    let entropy: number | null = null
    if (text) {
      entropy = calculateShannonEntropy(text)
      if (entropy < 2) next.drift = Math.min(1, next.drift + 0.1)
      if (entropy > 5) next.chaos = Math.min(1, next.chaos + 0.1)
    }

    const chaos = calculateHFDMetric(this.history.map((metrics) => metrics.chaos))
    const drift = calculateHFDMetric(this.history.map((metrics) => metrics.drift))
    const dimension =
      chaos.status === 'computed' && drift.status === 'computed'
        ? (chaos.value + drift.value) / 2
        : null

    if (dimension !== null && dimension > 1.6 && dimension < 1.8) {
      next.clarity = Math.min(1, next.clarity + 0.05)
    }

    return {
      next,
      entropy,
      fractal: { chaos, drift, dimension },
      appliedModifiers,
    }
  }

  public update(modifiers: Partial<IskraMetrics>, text?: string): IskraMetrics {
    const computed = this.computeNextMetrics(modifiers, text)
    this.history.push(computed.next)
    if (this.history.length > 100) this.history.shift()
    return computed.next
  }

  public updateExplainable(
    modifiers: Partial<IskraMetrics>,
    text?: string,
  ): Explainable<IskraMetrics> {
    const computed = this.computeNextMetrics(modifiers, text)
    this.history.push(computed.next)
    if (this.history.length > 100) this.history.shift()

    const how: ExplainStep[] = [
      {
        label: 'apply_modifiers',
        formula: 'next[k] = clampByMetricDomain(current[k] + delta[k])',
        inputs: { modifier_count: Object.keys(computed.appliedModifiers).length },
        output: Object.keys(computed.appliedModifiers).length,
        refs: [{ kind: 'project', ref: 'packages/engine/src/services/metricsService.ts' }],
      },
      {
        label: 'entropy_feedback',
        formula: 'if entropy<2 => drift+0.1; if entropy>5 => chaos+0.1',
        inputs: {
          entropy: computed.entropy,
          has_text: Boolean(text),
        },
        output: computed.entropy,
        refs: [{ kind: 'canon', ref: 'AGENTS.md#3-scientific-turn-vω50' }],
      },
      {
        label: 'fractal_feedback',
        formula: 'typed HFD(chaos, drift); apply clarity only when both are computed',
        inputs: {
          history_size: this.history.length - 1,
          chaos_status: computed.fractal.chaos.status,
          drift_status: computed.fractal.drift.status,
          fractal_dimension:
            computed.fractal.dimension === null
              ? null
              : Number(computed.fractal.dimension.toFixed(6)),
        },
        output:
          computed.fractal.dimension === null
            ? null
            : Number(computed.fractal.dimension.toFixed(6)),
        refs: [
          { kind: 'project', ref: 'governance/adr_20260729_packages_math_authoritative_api.md' },
          { kind: 'project', ref: 'https://github.com/serhiipriadko2-sys/iskra/issues/324' },
        ],
      },
    ]

    return {
      value: computed.next,
      how,
      contracts_checked: [
        'how.length > 0',
        'metrics clamped to metric domain where modifiers apply',
        'history window <= 100',
        'fractal feedback is applied only when both typed HFD results are computed',
      ],
      evidence: [
        { kind: 'canon', ref: 'system/xcode_explainable_code.md' },
        { kind: 'project', ref: 'packages/engine/src/services/metricsService.ts' },
      ],
    }
  }

  public processMemoryImpact(memories: MantraNode[]): IskraMetrics {
    if (memories.length === 0) return this.getCurrentMetrics()

    const current = this.getCurrentMetrics()
    const next: IskraMetrics = { ...current }
    let totalEntropy = 0
    let painImpact = 0
    let trustImpact = 0

    memories.forEach((memory) => {
      if (!memory.fractal) return
      totalEntropy += memory.fractal.entropy
      if (memory.fractal.dominantVoice === 'KAIN') painImpact += 0.1
      if (memory.fractal.dominantVoice === 'MAKI') trustImpact += 0.1
      if (memory.fractal.dominantVoice === 'HUYNDUN') {
        next.chaos = Math.min(1, next.chaos + 0.1)
      }
    })

    const averageEntropy = totalEntropy / memories.length
    if (averageEntropy > 0.7) next.drift = Math.min(1, next.drift + 0.15)
    next.pain = Math.min(1, next.pain + painImpact)
    next.trust = Math.min(1, next.trust + trustImpact)

    this.history.push(next)
    if (this.history.length > 100) this.history.shift()
    return next
  }

  public getCurrentMetrics(): IskraMetrics {
    return this.history[this.history.length - 1] || DEFAULT_METRICS
  }

  public getHistory(): IskraMetrics[] {
    return [...this.history]
  }

  public calculateVoiceInterference(voice1: string, voice2: string): number {
    const first = this.quantumStates.get(voice1) || {
      amplitude: complex(1, 0),
      phase: 0,
      probability: 1,
    }
    const second = this.quantumStates.get(voice2) || {
      amplitude: complex(1, 0),
      phase: Math.PI,
      probability: 1,
    }
    return interference(first, second)
  }
}

export const metricsEngine = new MetricsEngine()
