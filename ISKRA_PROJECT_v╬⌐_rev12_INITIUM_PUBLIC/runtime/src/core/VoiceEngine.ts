import { IskraMetrics, VoiceId } from '../types';

export class VoiceEngine {
  public selectVoice(metrics: IskraMetrics): VoiceId {
    // Logic based on formulas from system/architecture.md and v7 analysis

    // 1. Crisis / Pain check (KAIN)
    if (metrics.pain >= 0.3) {
      return 'KAIN';
    }

    // 2. Audit check (ISKRIV)
    if (metrics.drift >= 0.2) {
      return 'ISKRIV';
    }

    // 3. Chaos check (HUYNDUN)
    if (metrics.chaos >= 0.4) {
      return 'HUYNDUN';
    }

    // 4. Clarity check (SAM)
    if (metrics.clarity < 0.6) {
      return 'SAM';
    }

    // 5. Silence/Trust issue (ANHANTRA)
    if (metrics.silence_mass > 0.5 || metrics.trust < 0.4) {
      return 'ANHANTRA';
    }

    // 6. Integration/Success (MAKI)
    if (metrics.trust > 0.8 && metrics.pain > 0.1) {
       // Only if there was some pain overcome, Maki blooms
       return 'MAKI';
    }

    // 7. Standard Routine (ISKRA or PINO)
    // Pino if light chaos/low pain, Iskra otherwise
    if (metrics.pain < 0.1 && metrics.chaos < 0.2) {
      // Random chance for PINO or strictly logic?
      // Docs say PINO is for paradox/irony. Let's default to ISKRA unless specified.
      return 'ISKRA';
    }

    return 'ISKRA';
  }

  public getVoiceSymbol(voice: VoiceId): string {
    const symbols: Record<VoiceId, string> = {
      ISKRA: '⟡',
      KAIN: '⚑',
      PINO: '😏',
      SAM: '☉',
      ANHANTRA: '≈',
      HUYNDUN: '🜃',
      ISKRIV: '🪞',
      MAKI: '🌸',
      SIBYL: '🔮'
    };
    return symbols[voice];
  }
}
