import { describe, expect, it } from 'vitest'
import {
  calculateDFAMetric,
  calculateHFDMetric,
} from '../types/fractal-authority.js'

const signal = (length: number): number[] =>
  Array.from({ length }, (_, index) => Math.sin(index / 3) + (index % 7) * 0.05)

describe('generated runtime fractal authority mirror', () => {
  it('exposes typed HFD and DFA results without numeric stand-ins', () => {
    expect(calculateHFDMetric(signal(19)).status).toBe('unavailable')
    expect(calculateHFDMetric(signal(20)).status).toBe('computed')
    expect(calculateDFAMetric(signal(49)).status).toBe('unavailable')
    expect(calculateDFAMetric(signal(50)).status).toBe('computed')
  })

  it('preserves invalid and numerical failure statuses', () => {
    expect(calculateHFDMetric([1, Number.NaN]).status).toBe('invalid')
    const overflow = Array.from(
      { length: 80 },
      (_, index) => (index % 2 === 0 ? Number.MAX_VALUE : -Number.MAX_VALUE),
    )
    expect(calculateDFAMetric(overflow).status).toBe('numerical_failure')
  })
})
