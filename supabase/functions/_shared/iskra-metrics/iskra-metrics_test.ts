import { computeMetrics } from './calculator.ts'
import { ALGORITHM_VERSION } from './contracts.ts'
import { calculateShannonEntropy, interpretEntropy } from './entropy.ts'
import { calculateDFAMetric, calculateHFDMetric } from './fractal-authority.ts'

function assert(condition: unknown, message = 'assertion failed'): asserts condition {
  if (!condition) throw new Error(message)
}

function assertEquals<T>(actual: T, expected: T): void {
  if (Object.is(actual, expected)) return
  if (JSON.stringify(actual) === JSON.stringify(expected)) return
  throw new Error(`expected ${JSON.stringify(expected)}, received ${JSON.stringify(actual)}`)
}

const ENTROPY_VECTOR = {
  text: 'the fire speaks the truth the fire speaks again',
  expected: 2.197159723424149,
}

const signal = (length: number): number[] =>
  Array.from({ length }, (_, index) => Math.sin(index / 3) + (index % 7) * 0.05)

Deno.test('algorithm version identifies typed fractal authority', () => {
  assertEquals(ALGORITHM_VERSION, 'iskra-metrics-compute-v1.2.0')
})

Deno.test('entropy behavior is unchanged', () => {
  assertEquals(calculateShannonEntropy(ENTROPY_VECTOR.text), ENTROPY_VECTOR.expected)
  assertEquals(interpretEntropy(1.9), 'LOOP')
  assertEquals(interpretEntropy(3.0), 'FLOW')
  assertEquals(interpretEntropy(5.1), 'CHAOS')
})

Deno.test('T1/T2 boundary statuses match the authoritative contract', () => {
  assertEquals(calculateHFDMetric(signal(19)).status, 'unavailable')
  assertEquals(calculateHFDMetric(signal(20)).status, 'computed')
  assertEquals(calculateDFAMetric(signal(49)).status, 'unavailable')
  assertEquals(calculateDFAMetric(signal(50)).status, 'computed')
})

Deno.test('T3 malformed input is invalid before sufficiency', () => {
  assertEquals(calculateHFDMetric([1, Number.NaN]).status, 'invalid')
  assertEquals(calculateDFAMetric([1, Number.POSITIVE_INFINITY]).status, 'invalid')
})

Deno.test('T4 explicit defaults match omission', () => {
  const values = signal(80)
  const hfdOmitted = calculateHFDMetric(values)
  const hfdExplicit = calculateHFDMetric(values, { kMax: 5 })
  const dfaOmitted = calculateDFAMetric(values)
  const dfaExplicit = calculateDFAMetric(values, { minBox: 4, maxBox: 16 })

  assert(hfdOmitted.status === 'computed')
  assert(hfdExplicit.status === 'computed')
  assert(dfaOmitted.status === 'computed')
  assert(dfaExplicit.status === 'computed')
  assertEquals(hfdExplicit.value, hfdOmitted.value)
  assertEquals(dfaExplicit.value, dfaOmitted.value)
})

Deno.test('T6 overflow returns numerical_failure', () => {
  const overflow = Array.from(
    { length: 80 },
    (_, index) => (index % 2 === 0 ? Number.MAX_VALUE : -Number.MAX_VALUE),
  )
  assertEquals(calculateHFDMetric(overflow).status, 'numerical_failure')
  assertEquals(calculateDFAMetric(overflow).status, 'numerical_failure')
})

Deno.test('calculator preserves typed fractal statuses', async () => {
  const insufficient = await computeMetrics({ signal: signal(19) })
  assertEquals(insufficient.metrics.hfd.status, 'unavailable')
  assertEquals(insufficient.metrics.dfa.status, 'unavailable')
  assertEquals([...insufficient.unavailable].sort(), [
    'dfa',
    'entropy_regime',
    'hfd',
    'shannon_entropy',
  ])

  const invalid = await computeMetrics({ signal: [1, Number.NaN] })
  assertEquals(invalid.metrics.hfd.status, 'invalid')
  assertEquals(invalid.metrics.dfa.status, 'invalid')
  assertEquals([...invalid.invalid].sort(), ['dfa', 'hfd'])
})

Deno.test('determinism: same input gives same hash and output', async () => {
  const raw = { text: ENTROPY_VECTOR.text, signal: signal(80) }
  const first = await computeMetrics(raw)
  const second = await computeMetrics(raw)
  assertEquals(first.input_hash, second.input_hash)
  assertEquals(first.metrics, second.metrics)
})
