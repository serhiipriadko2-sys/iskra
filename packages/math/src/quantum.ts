/**
 * Quantum Probability Layer
 * Implements Complex Numbers and Quantum State Vectors
 * SPEC-002: Quantum State
 */

export interface Complex {
  re: number;
  im: number;
}

export interface QuantumStateVector {
  amplitude: Complex;
  phase: number; // in radians
  probability: number; // |amplitude|^2
}

/**
 * Creates a complex number
 */
export function complex(re: number, im: number): Complex {
  return { re, im };
}

/**
 * Calculates the magnitude (modulus) of a complex number
 * |z| = sqrt(re^2 + im^2)
 */
export function modulus(c: Complex): number {
  return Math.sqrt(c.re * c.re + c.im * c.im);
}

/**
 * Adds two complex numbers
 * (a + bi) + (c + di) = (a+c) + (b+d)i
 */
export function add(c1: Complex, c2: Complex): Complex {
  return {
    re: c1.re + c2.re,
    im: c1.im + c2.im
  };
}

/**
 * Multiplies two complex numbers
 * (a + bi)(c + di) = (ac - bd) + (ad + bc)i
 */
export function multiply(c1: Complex, c2: Complex): Complex {
  return {
    re: c1.re * c2.re - c1.im * c2.im,
    im: c1.re * c2.im + c1.im * c2.re
  };
}

/**
 * Converts polar coordinates (r, theta) to Cartesian (re, im)
 * z = r * (cos(theta) + i*sin(theta))
 */
export function fromPolar(r: number, theta: number): Complex {
  return {
    re: r * Math.cos(theta),
    im: r * Math.sin(theta)
  };
}

/**
 * Calculates quantum interference between two states
 * Returns the probability of the superposed state
 * P = |ψ1 + ψ2|^2
 */
export function interference(psi1: QuantumStateVector, psi2: QuantumStateVector): number {
  const c1 = psi1.amplitude;
  const c2 = psi2.amplitude;
  const sum = add(c1, c2);
  return modulus(sum) ** 2;
}

/**
 * Normalizes a set of probabilities so they sum to 1
 * (Wave function collapse simulation)
 */
export function normalizeProbabilities(probs: number[]): number[] {
  const sum = probs.reduce((a, b) => a + b, 0);
  if (sum === 0) return probs.map(() => 0);
  return probs.map(p => p / sum);
}

/**
 * Calculates emotional resonance between current state and a memory
 * Resonance = 1 / (1 + |StatePhase - MemoryPhase|) * AmplitudeSimilarity
 */
export function calculateResonance(
  currentPhase: number,
  currentAmp: number,
  memoryPhase: number,
  memoryAmp: number
): number {
  const phaseDiff = Math.abs(currentPhase - memoryPhase) % (2 * Math.PI);
  // Normalize phase diff to 0-1 (0 is perfect resonance)
  const phaseFactor = 1 - (phaseDiff / Math.PI);

  const ampDiff = Math.abs(currentAmp - memoryAmp);
  const ampFactor = 1 / (1 + ampDiff);

  return (phaseFactor + ampFactor) / 2;
}
