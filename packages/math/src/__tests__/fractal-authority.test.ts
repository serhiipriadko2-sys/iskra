import { describe, expect, it } from 'vitest'
import {
  calculateDFAMetric,
  calculateFractalIndicatorsMetric,
  calculateHFDMetric,
  FRACTAL_CANONICAL_SOURCE_HASH,
  FRACTAL_GENERATED_ARTIFACT_HASH,
  FRACTAL_PARITY_CORPUS_HASH,
} from '../fractal-authority.js'
import {
  assertCorpusHash,
  FRACTAL_AUTHORITY_CORPUS_CASES,
  materializeCorpusSignal,
  type CorpusExpectation,
} from './fractal-authority-corpus.js'

const periodic = (length: number): number[] =>
  Array.from({ length }, (_, index) => Math.sin(index / 3) + (index % 7) * 0.05)

function expectRegisteredResult(
  result: ReturnType<typeof calculateHFDMetric>,
  expected: CorpusExpectation,
): void {
  expect(result.status).toBe(expected.status)
  if ('reason' in result && expected.reason !== undefined) expect(result.reason).toBe(expected.reason)
  if (result.status === 'computed') {
    expect(Number.isFinite(result.value)).toBe(true)
    expect(result.value).toBe(expected.value)
  }
}

describe('ADR-20260729-02 authoritative fractal contract', () => {
  it('T7: executes the SHA-bound registered corpus', () => {
    assertCorpusHash()
    expect(FRACTAL_AUTHORITY_CORPUS_CASES.length).toBeGreaterThanOrEqual(18)
    for (const testCase of FRACTAL_AUTHORITY_CORPUS_CASES) {
      const signal = materializeCorpusSignal(testCase)
      expectRegisteredResult(calculateHFDMetric(signal, testCase.hfd_options), testCase.expected.hfd)
      expectRegisteredResult(calculateDFAMetric(signal, testCase.dfa_options), testCase.expected.dfa)
    }
  })

  it('T1: HFD boundary uses kMax=5 without stand-ins', () => {
    expect(calculateHFDMetric(periodic(19)).status).toBe('unavailable')
    const result = calculateHFDMetric(periodic(20))
    expect(result.status).toBe('computed')
    expect(result.effective_parameters).toEqual({ kMax: 5 })
  })

  it('T2: DFA boundary uses fixed boxes without stand-ins', () => {
    expect(calculateDFAMetric(periodic(49)).status).toBe('unavailable')
    const result = calculateDFAMetric(periodic(50))
    expect(result.status).toBe('computed')
    expect(result.effective_parameters).toEqual({ minBox: 4, maxBox: 16 })
  })

  it('T3: malformed signal wins over malformed explicit parameters', () => {
    const hfd = calculateHFDMetric([Number.NaN], { kMax: Number.NaN } as never)
    const dfa = calculateDFAMetric('not-an-array', { unsupported: 1 } as never)
    expect(hfd.status).toBe('invalid')
    expect(dfa.status).toBe('invalid')
    if (hfd.status === 'invalid') expect(hfd.reason).toBe('invalid_signal')
    if (dfa.status === 'invalid') expect(dfa.reason).toBe('invalid_container')
  })

  it('T4: explicit defaults equal omission; non-defaults fail closed', () => {
    const values = periodic(80)
    const hfdOmitted = calculateHFDMetric(values)
    const hfdExplicit = calculateHFDMetric(values, { kMax: 5 })
    const dfaOmitted = calculateDFAMetric(values)
    const dfaExplicit = calculateDFAMetric(values, { minBox: 4, maxBox: 16 })
    expect(hfdExplicit.status).toBe('computed')
    expect(dfaExplicit.status).toBe('computed')
    if (hfdOmitted.status === 'computed' && hfdExplicit.status === 'computed') {
      expect(hfdExplicit.value).toBe(hfdOmitted.value)
      expect(hfdExplicit.effective_parameters).toEqual(hfdOmitted.effective_parameters)
    }
    if (dfaOmitted.status === 'computed' && dfaExplicit.status === 'computed') {
      expect(dfaExplicit.value).toBe(dfaOmitted.value)
      expect(dfaExplicit.effective_parameters).toEqual(dfaOmitted.effective_parameters)
    }
    expect(calculateHFDMetric(values, { kMax: 6 }).status).toBe('invalid')
    expect(calculateDFAMetric(values, { maxBox: 64 }).status).toBe('invalid')
  })

  it('T5/T6: computed receipts bind provenance and never contain non-finite values', () => {
    const computed = calculateHFDMetric(periodic(80), { kMax: 5 })
    expect(computed.status).toBe('computed')
    expect(computed.canonical_source_hash).toBe(FRACTAL_CANONICAL_SOURCE_HASH)
    expect(computed.generated_artifact_hash).toBe(FRACTAL_GENERATED_ARTIFACT_HASH)
    expect(computed.parity_corpus_hash).toBe(FRACTAL_PARITY_CORPUS_HASH)
    const overflow = Array.from(
      { length: 80 },
      (_, index) => (index % 2 === 0 ? Number.MAX_VALUE : -Number.MAX_VALUE),
    )
    expect(calculateHFDMetric(overflow).status).toBe('numerical_failure')
    expect(calculateDFAMetric(overflow).status).toBe('numerical_failure')
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
