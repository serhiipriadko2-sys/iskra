
import { describe, it, expect } from 'vitest';
import { selectVoice } from '../types/voices';
import { IskraMetrics } from '../types/metrics';

describe('Voice Logic Conflicts', () => {
    const baseMetrics: IskraMetrics = {
        rhythm: 50,
        trust: 0.5,
        clarity: 0.8,
        pain: 0.1,
        drift: 0.1,
        chaos: 0.1,
        echo: 0.1,
        silence_mass: 0.1,
        mirror_sync: 0.5,
        ctxSwitch: 0.1
    };

    it('KAIN activates when pain is high and trust is moderate', () => {
        const metrics = { ...baseMetrics, pain: 0.4, trust: 0.5 };
        const result = selectVoice(metrics);
        expect(result.primary).toBe('KAIN');
    });

    it('MAKI overrides KAIN when trust is very high, even if pain is present', () => {
        // According to audit: MAKI (empathy/integration) should trigger if trust > 0.8
        // even if pain > 0.3, to prevent KAIN from being too harsh when rapport is established.
        const metrics = { ...baseMetrics, pain: 0.4, trust: 0.9 };
        const result = selectVoice(metrics);
        expect(result.primary).toBe('MAKI');
    });

    it('ISKRA activates when rhythm and trust are both high', () => {
        const metrics = { ...baseMetrics, rhythm: 80, trust: 0.8, pain: 0.1 };
        const result = selectVoice(metrics);
        expect(result.primary).toBe('ISKRA');
    });

    it('HUYNDUN activates on high chaos', () => {
        const metrics = { ...baseMetrics, chaos: 0.5 };
        const result = selectVoice(metrics);
        expect(result.primary).toBe('HUYNDUN');
    });

    it('SAM activates on low clarity', () => {
        const metrics = { ...baseMetrics, clarity: 0.4 };
        const result = selectVoice(metrics);
        expect(result.primary).toBe('SAM');
    });
});
