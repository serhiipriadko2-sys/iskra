// =============================================================================
// Fractal measures — ported 1:1 from @iskra/math (packages/math/src/fractal.ts)
// =============================================================================
// HFD (Higuchi Fractal Dimension) and DFA (Detrended Fluctuation Analysis),
// with the same private linearRegressionSlope / linearFit helpers and the same
// graceful-degradation fallbacks (HFD→1.5 for N<6, DFA→0.5 for N<maxBox).
// This module intentionally does not port the rest of fractal.ts. Parity for
// these two functions is asserted directly against @iskra/math in CI.
// =============================================================================

/** Throws on empty / NaN / Infinity signal (mirrors @iskra/math validateSignal). */
function validateSignal(signal: readonly number[]): void {
  if (!signal || signal.length === 0) {
    throw new Error('Signal cannot be empty');
  }
  if (signal.some((x) => Number.isNaN(x))) {
    throw new Error('Signal contains NaN values');
  }
  if (signal.some((x) => !Number.isFinite(x))) {
    throw new Error('Signal contains Infinity values');
  }
}

/** Mirrors @iskra/math validateKmax. */
function validateKmax(kmax: number, signalLength: number): void {
  if (kmax < 1) {
    throw new Error('kMax must be >= 1');
  }
  if (kmax * 2 > signalLength) {
    throw new Error('kMax too large for signal length');
  }
}

export function calculateHFD(timeSeries: readonly number[], kMax = 10): number {
  validateSignal(timeSeries);

  const N = timeSeries.length;
  if (N < 6) return 1.5;

  if (N >= kMax * 2) {
    validateKmax(kMax, N);
  } else {
    kMax = Math.max(1, Math.floor(N / 2));
  }

  const L: number[] = [];

  for (let k = 1; k <= kMax; k++) {
    let Lk = 0;
    for (let m = 1; m <= k; m++) {
      let Lmk = 0;
      const limit = Math.floor((N - m) / k);

      for (let i = 1; i < limit; i++) {
        const idx1 = m + i * k - 1;
        const idx2 = m + (i - 1) * k - 1;
        const val1 = timeSeries[idx1];
        const val2 = timeSeries[idx2];
        if (val1 === undefined || val2 === undefined) continue;
        Lmk += Math.abs(val1 - val2);
      }

      Lmk = (Lmk * (N - 1)) / (k * limit * k);
      Lk += Lmk;
    }
    L.push(Lk / k);
  }

  const logX = L.map((_, i) => Math.log(1 / (i + 1)));
  const logY = L.map((l) => Math.log(l + 0.001));

  return linearRegressionSlope(logX, logY);
}

export function calculateDFA(
  timeSeries: readonly number[],
  minBox = 4,
  maxBox = 64,
): number {
  validateSignal(timeSeries);

  const N = timeSeries.length;
  if (N < maxBox) return 0.5;

  const mean = timeSeries.reduce((a, b) => a + b, 0) / N;
  const integrated: number[] = [];
  let sum = 0;
  for (const x of timeSeries) {
    sum += x - mean;
    integrated.push(sum);
  }

  const boxSizes: number[] = [];
  const fluctuations: number[] = [];

  for (let s = minBox; s <= maxBox; s = Math.floor(s * 1.5)) {
    const numBoxes = Math.floor(N / s);
    if (numBoxes < 2) continue;

    let F2 = 0;
    for (let b = 0; b < numBoxes; b++) {
      const segment = integrated.slice(b * s, (b + 1) * s);
      const trend = linearFit(segment);
      const residuals = segment.map((y, i) => y - (trend[i] ?? 0));
      F2 += residuals.reduce((acc, r) => acc + r * r, 0) / s;
    }

    boxSizes.push(s);
    fluctuations.push(Math.sqrt(F2 / numBoxes));
  }

  if (boxSizes.length < 2) return 0.5;

  return linearRegressionSlope(
    boxSizes.map((s) => Math.log(s)),
    fluctuations.map((f) => Math.log(f + 0.001)),
  );
}

function linearFit(values: number[]): number[] {
  const n = values.length;
  const xMean = (n - 1) / 2;
  const yMean = values.reduce((a, b) => a + b, 0) / n;

  let slope = 0;
  let denominator = 0;

  for (let i = 0; i < n; i++) {
    const vi = values[i];
    if (vi === undefined) continue;
    slope += (i - xMean) * (vi - yMean);
    denominator += (i - xMean) ** 2;
  }

  slope = denominator === 0 ? 0 : slope / denominator;
  const intercept = yMean - slope * xMean;

  return values.map((_, i) => intercept + slope * i);
}

function linearRegressionSlope(x: number[], y: number[]): number {
  const n = x.length;
  if (n < 2) return 0;

  const xMean = x.reduce((a, b) => a + b, 0) / n;
  const yMean = y.reduce((a, b) => a + b, 0) / n;

  let numerator = 0;
  let denominator = 0;

  for (let i = 0; i < n; i++) {
    const xi = x[i];
    const yi = y[i];
    if (xi === undefined || yi === undefined) continue;
    numerator += (xi - xMean) * (yi - yMean);
    denominator += (xi - xMean) ** 2;
  }

  return denominator === 0 ? 0 : numerator / denominator;
}
