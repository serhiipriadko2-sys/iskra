import {
  ALGORITHM_VERSION,
  type CalculatorResult,
  type ComputedMetrics,
  type DerivedValue,
  type EntropyRegime,
  type RawObservation,
} from './contracts.ts'
import { canonicalJson } from './canonicalJson.ts'
import { sha256Hex } from './hash.ts'
import { calculateShannonEntropy, interpretEntropy } from './entropy.ts'
import { calculateDFAMetric, calculateHFDMetric } from './fractal-authority.ts'

function available<T>(value: T): DerivedValue<T> {
  return { value, unavailable: false, reason: null }
}

function unavailable<T>(reason: string): DerivedValue<T> {
  return { value: null, unavailable: true, reason }
}

type HashableSignalValue =
  | number
  | { readonly non_finite: 'NaN' | '+Infinity' | '-Infinity' }

function hashableSignalValue(value: number): HashableSignalValue {
  if (Number.isNaN(value)) return { non_finite: 'NaN' }
  if (value === Number.POSITIVE_INFINITY) return { non_finite: '+Infinity' }
  if (value === Number.NEGATIVE_INFINITY) return { non_finite: '-Infinity' }
  return value
}

function hashableUnknown(value: unknown): unknown {
  if (typeof value === 'number') return hashableSignalValue(value)
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return value
  if (Array.isArray(value)) return value.map(hashableUnknown)
  if (typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, item]) => [key, hashableUnknown(item)]),
    )
  }
  return { unsupported_type: typeof value }
}

function hashableObservation(raw: RawObservation): unknown {
  return {
    ...(raw.text === undefined ? {} : { text: raw.text }),
    ...(raw.signal === undefined ? {} : { signal: hashableUnknown(raw.signal) }),
  }
}

export async function computeMetrics(raw: RawObservation): Promise<CalculatorResult> {
  const input_hash = await sha256Hex(canonicalJson(hashableObservation(raw)))

  let shannon_entropy: DerivedValue<number>
  let entropy_regime: DerivedValue<EntropyRegime>
  if (typeof raw.text === 'string' && raw.text.trim().length > 0) {
    const entropy = calculateShannonEntropy(raw.text)
    shannon_entropy = available(entropy)
    entropy_regime = available(interpretEntropy(entropy))
  } else {
    shannon_entropy = unavailable('no text provided')
    entropy_regime = unavailable('no text provided')
  }

  const signal = raw.signal ?? []
  const hfd = calculateHFDMetric(signal)
  const dfa = calculateDFAMetric(signal)
  const metrics: ComputedMetrics = { shannon_entropy, entropy_regime, hfd, dfa }

  const unavailableNames = [
    ...(shannon_entropy.unavailable ? ['shannon_entropy'] : []),
    ...(entropy_regime.unavailable ? ['entropy_regime'] : []),
    ...(hfd.status === 'unavailable' ? ['hfd'] : []),
    ...(dfa.status === 'unavailable' ? ['dfa'] : []),
  ]
  const invalidNames = [
    ...(hfd.status === 'invalid' ? ['hfd'] : []),
    ...(dfa.status === 'invalid' ? ['dfa'] : []),
  ]
  const numericalFailureNames = [
    ...(hfd.status === 'numerical_failure' ? ['hfd'] : []),
    ...(dfa.status === 'numerical_failure' ? ['dfa'] : []),
  ]

  return {
    algorithm_version: ALGORITHM_VERSION,
    input_hash,
    metrics,
    unavailable: unavailableNames,
    invalid: invalidNames,
    numerical_failure: numericalFailureNames,
  }
}
