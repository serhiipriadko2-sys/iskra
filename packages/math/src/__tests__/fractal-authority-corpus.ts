import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import {
  FRACTAL_PARITY_CORPUS_HASH,
  type DfaMetricOptions,
  type FractalMetricResult,
  type HfdMetricOptions,
} from '../fractal-authority.js'

export interface CorpusExpectation {
  readonly status: FractalMetricResult['status']
  readonly reason?: string
  readonly value?: number | null
}

export interface FractalAuthorityCorpusCase {
  readonly id: string
  readonly kind: string
  readonly length?: number
  readonly value?: unknown
  readonly values?: readonly unknown[]
  readonly seed?: number
  readonly inject?: string
  readonly hfd_options?: HfdMetricOptions
  readonly dfa_options?: DfaMetricOptions
  readonly expected: {
    readonly hfd: CorpusExpectation
    readonly dfa: CorpusExpectation
  }
}

const corpusPath = fileURLToPath(new URL('../fractal-authority-corpus.json', import.meta.url))
const corpusText = readFileSync(corpusPath, 'utf8').replace(/\r\n?/g, '\n')
const corpus = JSON.parse(corpusText) as { readonly cases: readonly FractalAuthorityCorpusCase[] }

export const FRACTAL_AUTHORITY_CORPUS_CASES = corpus.cases

export function assertCorpusHash(): void {
  const actual = createHash('sha256').update(corpusText).digest('hex')
  if (actual !== FRACTAL_PARITY_CORPUS_HASH) {
    throw new Error(`corpus hash mismatch: ${actual} != ${FRACTAL_PARITY_CORPUS_HASH}`)
  }
}

export function materializeCorpusSignal(testCase: FractalAuthorityCorpusCase): unknown {
  const length = testCase.length ?? 0
  switch (testCase.kind) {
    case 'literal':
      return [...(testCase.values ?? [])]
    case 'constant':
      return Array.from({ length }, () => Number(testCase.value))
    case 'linear':
      return Array.from({ length }, (_, index) => index / Math.max(1, length))
    case 'periodic':
      return Array.from(
        { length },
        (_, index) => Math.sin(index / 3) + Math.cos(index / 11) + (index % 7) * 0.05,
      )
    case 'alternating':
      return Array.from({ length }, (_, index) => (index % 2 === 0 ? -1 : 1))
    case 'seeded-noise': {
      let state = (testCase.seed ?? 1729) >>> 0
      return Array.from({ length }, () => {
        state = (1664525 * state + 1013904223) >>> 0
        return state / 0xffffffff
      })
    }
    case 'special': {
      const values = testCase.values
        ? testCase.values.map((value) => value === 'NaN' ? Number.NaN : value)
        : Array.from({ length }, (_, index) => index / Math.max(1, length))
      if (testCase.inject === 'Infinity' && values.length > 0) {
        values[Math.floor(values.length / 2)] = Number.POSITIVE_INFINITY
      }
      return values
    }
    case 'overflow-alternating':
      return Array.from(
        { length },
        (_, index) => (index % 2 === 0 ? Number.MAX_VALUE : -Number.MAX_VALUE),
      )
    case 'invalid-container':
      return testCase.value
    default:
      throw new Error(`unsupported corpus kind: ${testCase.kind}`)
  }
}
