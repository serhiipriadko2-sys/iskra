import { describe, expect, it } from 'vitest'
import {
  calculateDFAMetric,
  calculateFractalIndicatorsMetric,
  calculateHFDMetric,
  FRACTAL_CANONICAL_SOURCE_HASH,
  FRACTAL_GENERATED_ARTIFACT_HASH,
  FRACTAL_PARITY_CORPUS_HASH,
} from '../fractal-authority.js'

const periodic = (length: number): number[] =>
  Array.from({ length }, (_, index) => Math.sin(index / 3) + (index % 7) * 0.05)

const seededNoise = (length: number, seed = 1729): number[] => {
  let state = seed >>> 0
  return Array.from({ length }, () => {
    state = (1664525 * state + 1013904223) >>> 0
    return state / 0xffffffff
  })
}

const expectComputed = (result: ReturnType<typeof calculateHFDMetric>): number => {
  expect(result.status).toBe('computed')
  if (result.status !== 'computed') throw new Error(`expected computed, got ${result.status}`)
  expect(Number.isFinite(result.value)).toBe(true)
  return result.value
}

describe('ADR-20260729-02 authoritative fractal contract', () => {
  it.each([0, 1, 19])('T1: HFD N=%i is unavailable', (length) => {
    const result = calculateHFDMetric(periodic(length))
    expect(result.status).toBe('unavailable')
    expect(result.sample_count).toBe(length)
    expect(result.effective_parameters).toBeNull()
  })

  it('T1: HFD N=20 computes with kMax=5', () => {
    const result = calculateHFDMetric(periodic(20))
    expect(result.status).toBe('computed')
    expect(result.effective_parameters).toEqual({ kMax: 5 })
    expectComputed(result)
  })

  it.each([0, 1, 49])('T2: DFA N=%i is unavailable', (length) => {
    const result = calculateDFAMetric(periodic(length))
    expect(result.status).toBe('unavailable')
    expect(result.sample_count).toBe(length)
    expect(result.effective_parameters).toBeNull()
  })

  it('T2: DFA N=50 computes with fixed boxes', () => {
    const result = calculateDFAMetric(periodic(50))
    expect(result.status).toBe('computed')
    expect(result.effective_parameters).toEqual({ minBox: 4, maxBox: 16 })
    if (result.status === 'computed') expect(Number.isFinite(result.value)).toBe(true)
  })

  it.each([
    null,
    'not-an-array',
    [1, Number.NaN],
    [1, Number.POSITIVE_INFINITY],
  ])('T3: malformed signal is invalid before sufficiency', (signal) => {
    expect(calculateHFDMetric(signal).status).toBe('invalid')
    expect(calculateDFAMetric(signal).status).toBe('invalid')
  })

  it('T4: explicit HFD default matches omission', () => {
    const values = periodic(80)
    const omitted = calculateHFDMetric(values)
    const explicit = calculateHFDMetric(values, { kMax: 5 })
    expect(omitted.status).toBe('computed')
    expect(explicit.status).toBe('computed')
    if (omitted.status === 'computed' && explicit.status === 'computed') {
      expect(explicit.value).toBe(omitted.value)
      expect(explicit.effective_parameters).toEqual(omitted.effective_parameters)
    }
  })

  it('T4: explicit DFA defaults match omission', () => {
    const values = periodic(80)
    const omitted = calculateDFAMetric(values)
    const explicit = calculateDFAMetric(values, { minBox: 4, maxBox: 16 })
    expect(omitted.status).toBe('computed')
    expect(explicit.status).toBe('computed')
    if (omitted.status === 'computed' && explicit.status === 'computed') {
      expect(explicit.value).toBe(omitted.value)
      expect(explicit.effective_parameters).toEqual(omitted.effective_parameters)
    }
  })

  it('T4: non-default parameters are invalid without clamping', () => {
    expect(calculateHFDMetric(periodic(80), { kMax: 6 }).status).toBe('invalid')
    expect(calculateDFAMetric(periodic(80), { minBox: 5 }).status).toBe('invalid')
    expect(calculateDFAMetric(periodic(80), { maxBox: 64 }).status).toBe('invalid')
  })

  it('T5: computed receipts bind requested/effective parameters and hashes', () => {
    const result = calculateHFDMetric(periodic(80), { kMax: 5 })
    expect(result.status).toBe('computed')
    expect(result.requested_parameters).toEqual({ kMax: 5 })
    expect(result.effective_parameters).toEqual({ kMax: 5 })
    expect(result.canonical_source_hash).toBe(FRACTAL_CANONICAL_SOURCE_HASH)
    expect(result.generated_artifact_hash).toBe(FRACTAL_GENERATED_ARTIFACT_HASH)
    expect(result.parity_corpus_hash).toBe(FRACTAL_PARITY_CORPUS_HASH)
  })

  it('T6: overflow is numerical_failure, never computed non-finite', () => {
    const values = Array.from(
      { length: 80 },
      (_, index) => (index % 2 === 0 ? Number.MAX_VALUE : -Number.MAX_VALUE),
    )
    expect(calculateHFDMetric(values).status).toBe('numerical_failure')
    expect(calculateDFAMetric(values).status).toBe('numerical_failure')
  })

  it.each([
    Array.from({ length: 80 }, () => 0.25),
    Array.from({ length: 80 }, (_, index) => index / 80),
    periodic(80),
    Array.from({ length: 80 }, (_, index) => (index % 2 === 0 ? -1 : 1)),
    seededNoise(80),
  ])('T7: deterministic corpus case produces finite scalars', (values) => {
    expectComputed(calculateHFDMetric(values))
    const dfa = calculateDFAMetric(values)
    expect(dfa.status).toBe('computed')
    if (dfa.status === 'computed') expect(Number.isFinite(dfa.value)).toBe(true)
  })

  it('T11: aggregate preserves component statuses without stand-ins', () => {
    const shortHistory = periodic(19).map((value) => ({
      chaos: value,
      clarity: value,
      drift: value,
      trust: value,
    }))
    const shortResult = calculateFractalIndicatorsMetric(shortHistory)
    expect(shortResult.status).toBe('unavailable')
    expect(shortResult.value).toBeNull()

    const history = periodic(50).map((value) => ({
      chaos: value,
      clarity: value * 0.8,
      drift: value * 0.5,
      trust: value * 0.3,
    }))
    const result = calculateFractalIndicatorsMetric(history)
    expect(result.status).toBe('computed')
    if (result.status === 'computed') {
      expect(Number.isFinite(result.value.D_chaos)).toBe(true)
      expect(Number.isFinite(result.value.H_trust)).toBe(true)
    }
  })
})
