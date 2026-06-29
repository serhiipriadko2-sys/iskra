import { describe, expect, it } from 'vitest';
import { ReflexAnalyzer } from '../services/reflexAnalyzer';

describe('ReflexAnalyzer', () => {
  const analyzer = new ReflexAnalyzer();

  it('detects English somatic reflex terms', () => {
    const reflex = analyzer.analyze('I feel pain, chaos, and I need trust and love.');

    expect(reflex.pain).toBe(0.4);
    expect(reflex.chaos).toBe(0.3);
    expect(reflex.trust).toBe(0.2);
    expect(reflex.rhythm).toBe(0.1);
  });

  it('detects Russian somatic reflex terms without human-comparison assumptions', () => {
    const reflex = analyzer.analyze('Мне больно и я потерян, но я верю: здесь есть любовь и опора.');

    expect(reflex.pain).toBe(0.4);
    expect(reflex.chaos).toBe(0.3);
    expect(reflex.trust).toBe(0.2);
    expect(reflex.rhythm).toBe(0.1);
  });
});
