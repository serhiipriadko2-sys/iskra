import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  calculateDFAMetric as calculateNodeDFA,
  calculateHFDMetric as calculateNodeHFD,
} from '../fractal-authority.js'
import {
  calculateDFAMetric as calculateEdgeDFA,
  calculateHFDMetric as calculateEdgeHFD,
} from '../../../../supabase/functions/_shared/iskra-metrics/fractal-authority'
import {
  calculateShannonEntropy as calculateCanonicalEntropy,
  interpretEntropy as interpretCanonicalEntropy,
} from '../entropy'
import {
  calculateShannonEntropy as calculateEdgeEntropy,
  interpretEntropy as interpretEdgeEntropy,
} from '../../../../supabase/functions/_shared/iskra-metrics/entropy'

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../../..')
const signal = (length: number): number[] =>
  Array.from(
    { length },
    (_, index) => Math.sin(index / 3) + Math.cos(index / 11) + (index % 7) * 0.05,
  )

describe('generated Edge fractal authority parity', () => {
  it.each([
    '',
    'one one two',
    'Signal, signal; entropy must keep the canonical tokenizer.',
  ])('keeps entropy and regime unchanged for %j', (text) => {
    const entropy = calculateCanonicalEntropy(text)
    expect(calculateEdgeEntropy(text)).toBe(entropy)
    expect(interpretEdgeEntropy(entropy)).toBe(interpretCanonicalEntropy(entropy))
  })

  it.each([0, 1, 19, 20, 49, 50, 80])(
    'T8: Node and generated Edge results are exact for N=%i',
    (length) => {
      const values = signal(length)
      expect(calculateEdgeHFD(values)).toEqual(calculateNodeHFD(values))
      expect(calculateEdgeDFA(values)).toEqual(calculateNodeDFA(values))
    },
  )

  it('T8: invalid and numerical-failure results are exact', () => {
    const overflow = Array.from(
      { length: 80 },
      (_, index) => (index % 2 === 0 ? Number.MAX_VALUE : -Number.MAX_VALUE),
    )
    expect(calculateEdgeHFD([1, Number.NaN])).toEqual(calculateNodeHFD([1, Number.NaN]))
    expect(calculateEdgeDFA([1, Number.POSITIVE_INFINITY])).toEqual(
      calculateNodeDFA([1, Number.POSITIVE_INFINITY]),
    )
    expect(calculateEdgeHFD(overflow)).toEqual(calculateNodeHFD(overflow))
    expect(calculateEdgeDFA(overflow)).toEqual(calculateNodeDFA(overflow))
  })

  it('T15: committed mirrors regenerate without drift', () => {
    expect(() =>
      execFileSync(
        process.execPath,
        ['tools/generate-fractal-authority-mirrors.mjs', '--check'],
        { cwd: repositoryRoot, stdio: 'pipe' },
      ),
    ).not.toThrow()
  })
})
