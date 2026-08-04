export const HFD_V1_MIN_SAMPLES = 20
export const HFD_V1_K_MAX = 5
export const DFA_V1_MIN_SAMPLES = 50
export const DFA_V1_MIN_BOX = 4

export function getDfaV1MaxBox(sampleCount: number): number {
  return Math.min(16, Math.floor(sampleCount / 2))
}

export function computeHfdV1(values: readonly number[]): number {
  const lengths: number[] = []
  const sampleCount = values.length

  for (let k = 1; k <= HFD_V1_K_MAX; k += 1) {
    let averageLength = 0

    for (let offset = 1; offset <= k; offset += 1) {
      const segmentCount = Math.floor((sampleCount - offset) / k)
      let segmentLength = 0

      for (let index = 1; index <= segmentCount; index += 1) {
        const current = values[offset + index * k - 1]
        const previous = values[offset + (index - 1) * k - 1]

        if (current === undefined || previous === undefined) continue
        segmentLength += Math.abs(current - previous)
      }

      const normalized =
        (segmentLength * (sampleCount - 1)) / (k * segmentCount * k)
      averageLength += normalized
    }

    lengths.push(averageLength / k)
  }

  return linearRegressionSlope(
    lengths.map((_, index) => Math.log(1 / (index + 1))),
    lengths.map((length) => Math.log(length + 0.001)),
  )
}

export function computeDfaV1(values: readonly number[]): number {
  const sampleCount = values.length
  const maxBox = getDfaV1MaxBox(sampleCount)
  const mean = values.reduce((sum, value) => sum + value, 0) / sampleCount
  const integrated: number[] = []
  let cumulative = 0

  for (const value of values) {
    cumulative += value - mean
    integrated.push(cumulative)
  }

  const boxSizes: number[] = []
  const fluctuations: number[] = []

  for (
    let boxSize = DFA_V1_MIN_BOX;
    boxSize <= maxBox;
    boxSize = Math.floor(boxSize * 1.5)
  ) {
    const boxCount = Math.floor(sampleCount / boxSize)
    if (boxCount < 2) continue

    let squaredFluctuation = 0
    for (let box = 0; box < boxCount; box += 1) {
      const segment = integrated.slice(box * boxSize, (box + 1) * boxSize)
      const trend = linearFit(segment)
      const residuals = segment.map((value, index) => value - (trend[index] ?? 0))
      squaredFluctuation +=
        residuals.reduce((sum, residual) => sum + residual * residual, 0) / boxSize
    }

    boxSizes.push(boxSize)
    fluctuations.push(Math.sqrt(squaredFluctuation / boxCount))
  }

  return linearRegressionSlope(
    boxSizes.map((boxSize) => Math.log(boxSize)),
    fluctuations.map((fluctuation) => Math.log(fluctuation + 0.001)),
  )
}

function linearFit(values: readonly number[]): number[] {
  const sampleCount = values.length
  const xMean = (sampleCount - 1) / 2
  const yMean = values.reduce((sum, value) => sum + value, 0) / sampleCount
  let numerator = 0
  let denominator = 0

  for (let index = 0; index < sampleCount; index += 1) {
    const value = values[index]
    if (value === undefined) continue
    numerator += (index - xMean) * (value - yMean)
    denominator += (index - xMean) ** 2
  }

  const slope = denominator === 0 ? 0 : numerator / denominator
  const intercept = yMean - slope * xMean
  return values.map((_, index) => intercept + slope * index)
}

function linearRegressionSlope(
  xValues: readonly number[],
  yValues: readonly number[],
): number {
  const sampleCount = xValues.length
  if (sampleCount < 2 || yValues.length !== sampleCount) return Number.NaN

  const xMean = xValues.reduce((sum, value) => sum + value, 0) / sampleCount
  const yMean = yValues.reduce((sum, value) => sum + value, 0) / sampleCount
  let numerator = 0
  let denominator = 0

  for (let index = 0; index < sampleCount; index += 1) {
    const xValue = xValues[index]
    const yValue = yValues[index]
    if (xValue === undefined || yValue === undefined) continue
    numerator += (xValue - xMean) * (yValue - yMean)
    denominator += (xValue - xMean) ** 2
  }

  return denominator === 0 ? Number.NaN : numerator / denominator
}
