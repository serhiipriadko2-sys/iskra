/**
 * P0-CANON regression guard.
 *
 * Prior drift: services/voiceEngine.ts's deterministic activation thresholds
 * (matching CLAUDE.md) diverged from (a) the VOICE_PROMPTS prose fed to the LLM
 * in the same file, (b) the metrics-context system prompt in geminiService.ts,
 * and (c) the human-facing table in ARCHITECTURE.md — which quoted a different,
 * stricter set of numbers. This test pins the code's real behavior at each
 * threshold boundary, then cross-checks the prose/docs quote the same numbers,
 * so the three can never silently drift apart again.
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it, vi } from 'vitest';
import { getVoiceSelectionExplanation } from '../voiceEngine';
import { IskraMetrics, VoiceName } from '../../types';

vi.mock('../storageService', () => ({
  storageService: {
    getVoicePreferences: () => ({}),
    getLastVoiceState: () => ({ lastVoice: undefined }),
  },
}));

const thisFile = fileURLToPath(import.meta.url);
const runtimeRoot = join(dirname(thisFile), '../..');
const voiceEngineSource = readFileSync(join(runtimeRoot, 'services/voiceEngine.ts'), 'utf8');
const geminiServiceSource = readFileSync(join(runtimeRoot, 'services/geminiService.ts'), 'utf8');
const architectureDoc = readFileSync(join(runtimeRoot, 'ARCHITECTURE.md'), 'utf8');

const baseMetrics: IskraMetrics = {
  rhythm: 50,
  trust: 0.9,
  clarity: 0.9,
  pain: 0,
  drift: 0,
  chaos: 0,
  echo: 0,
  silence_mass: 0,
  mirror_sync: 0,
  interrupt: 0,
  ctxSwitch: 0,
};

function scoreFor(voice: VoiceName, metrics: Partial<IskraMetrics>) {
  const { scores } = getVoiceSelectionExplanation({ ...baseMetrics, ...metrics }).value;
  return scores[voice];
}

describe('voice activation thresholds — canonical cutoffs (code is authoritative)', () => {
  it('KAIN fires at pain >= 0.3 and is zero below it', () => {
    expect(scoreFor('KAIN', { pain: 0.29 })).toBe(0);
    expect(scoreFor('KAIN', { pain: 0.3 })).toBeGreaterThan(0);
  });

  it('HUYNDUN fires at chaos >= 0.4 and is zero below it', () => {
    expect(scoreFor('HUYNDUN', { chaos: 0.39 })).toBe(0);
    expect(scoreFor('HUYNDUN', { chaos: 0.4 })).toBeGreaterThan(0);
  });

  it('ISKRIV fires at drift >= 0.2 and is zero below it', () => {
    expect(scoreFor('ISKRIV', { drift: 0.19 })).toBe(0);
    expect(scoreFor('ISKRIV', { drift: 0.2 })).toBeGreaterThan(0);
  });

  it('SAM fires below clarity < 0.6 and is zero at/above it', () => {
    expect(scoreFor('SAM', { clarity: 0.6 })).toBe(0);
    expect(scoreFor('SAM', { clarity: 0.59 })).toBeGreaterThan(0);
  });

  it('ANHANTRA fires below trust < 0.75', () => {
    expect(scoreFor('ANHANTRA', { trust: 0.75 })).toBe(0);
    expect(scoreFor('ANHANTRA', { trust: 0.74 })).toBeGreaterThan(0);
  });
});

describe('voice threshold prose stays in sync with code (P0-CANON)', () => {
  it('VOICE_PROMPTS prose quotes the same cutoffs as the activation functions', () => {
    expect(voiceEngineSource).toContain('Если pain ≥ 0.3, я вступаю');
    expect(voiceEngineSource).toContain('Если clarity < 0.6, я раскладываю хаос на шаги');
    expect(voiceEngineSource).toContain('Если chaos ≥ 0.4, я ломаю структуру');
    expect(voiceEngineSource).toContain('Если drift ≥ 0.2, я задаю неудобные вопросы');
    expect(voiceEngineSource).toContain('Если trust < 0.75, я держу тишину');

    // Guard against the old (stricter, ARCHITECTURE.md-derived) numbers reappearing.
    expect(voiceEngineSource).not.toContain('pain > 0.7, я вступаю');
    expect(voiceEngineSource).not.toContain('clarity < 0.7, я раскладываю');
    expect(voiceEngineSource).not.toContain('chaos > 0.6, я ломаю');
    expect(voiceEngineSource).not.toContain('drift > 0.3, я задаю');
  });

  it('geminiService system prompt quotes the same cutoffs', () => {
    expect(geminiServiceSource).toMatch(/Pain:.*If >= 0\.3/);
    expect(geminiServiceSource).toMatch(/Chaos:.*If >= 0\.4/);
    expect(geminiServiceSource).toMatch(/Drift:.*If >= 0\.2/);
    expect(geminiServiceSource).toMatch(/Trust:.*If < 0\.75/);

    expect(geminiServiceSource).not.toMatch(/Pain:.*If > 0\.7/);
    expect(geminiServiceSource).not.toMatch(/Chaos:.*If > 0\.6/);
    expect(geminiServiceSource).not.toMatch(/Drift:.*If > 0\.3/);
  });

  it('ARCHITECTURE.md documents the same cutoffs as the code', () => {
    expect(architectureDoc).toContain('`pain ≥ 0.3`');
    expect(architectureDoc).toContain('`clarity < 0.6`');
    expect(architectureDoc).toContain('`chaos ≥ 0.4`');
    expect(architectureDoc).toContain('`drift ≥ 0.2`');
    expect(architectureDoc).toContain('`trust < 0.75`');

    expect(architectureDoc).not.toContain('`pain ≥ 0.70`');
    expect(architectureDoc).not.toContain('`clarity < 0.70`');
    expect(architectureDoc).not.toContain('`chaos > 0.60`');
    expect(architectureDoc).not.toContain('`drift > 0.30`');
  });
});
