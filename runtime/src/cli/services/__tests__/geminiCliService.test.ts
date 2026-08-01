/**
 * Tests for GeminiCliService
 *
 * Tests voice instructions, configuration, and SIFT verification parsing.
 * API calls are mocked since they require actual Gemini API key.
 */

import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest';

// Shared, hoisted mock fns so individual tests can override the next
// generateContent response without reaching into service internals.
const { mockGenerateContent, mockGenerateContentStream } = vi.hoisted(() => ({
  mockGenerateContent: vi.fn().mockResolvedValue({ text: 'Mocked response' }),
  mockGenerateContentStream: vi.fn().mockResolvedValue(
    (async function* () {
      yield { text: 'Chunk 1' };
      yield { text: 'Chunk 2' };
    })()
  ),
}));

// Mock @google/genai with Vitest 4.x compatible class mock
vi.mock('@google/genai', () => {
  return {
    GoogleGenAI: class MockGoogleGenAI {
      models = {
        generateContent: mockGenerateContent,
        generateContentStream: mockGenerateContentStream,
      };
    },
  };
});

import {
  GeminiCliService,
  createGeminiCliService,
  sanitizeForTerminal,
  ChatMessage,
} from '../geminiCliService.js';
import type { IskraMetrics } from '../../../types/metrics.js';
import { decideSiftVerdictStatus } from '../../../types/sift.js';

describe('GeminiCliService', () => {
  const testApiKey = 'test-api-key-12345';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('constructor', () => {
    it('creates instance with default model', () => {
      const service = new GeminiCliService({ apiKey: testApiKey });
      expect(service.getModelName()).toBe('gemini-2.0-flash');
    });

    it('creates instance with custom model', () => {
      const service = new GeminiCliService({
        apiKey: testApiKey,
        model: 'gemini-2.0-pro',
      });
      expect(service.getModelName()).toBe('gemini-2.0-pro');
    });
  });

  describe('generateResponse', () => {
    it('generates response with default voice', async () => {
      const service = new GeminiCliService({ apiKey: testApiKey });
      const response = await service.generateResponse('Hello');
      expect(response).toBe('Mocked response');
    });

    it('accepts voice parameter', async () => {
      const service = new GeminiCliService({ apiKey: testApiKey });
      const response = await service.generateResponse('Hello', { voice: 'KAIN' });
      expect(response).toBe('Mocked response');
    });

    it('accepts metrics parameter', async () => {
      const service = new GeminiCliService({ apiKey: testApiKey });
      const metrics: IskraMetrics = {
        rhythm: 80,
        trust: 0.9,
        pain: 0.2,
        chaos: 0.1,
        drift: 0.1,
        echo: 0.2,
        clarity: 0.9,
        silence_mass: 0.1,
        mirror_sync: 0.8,
        interrupt: 0.1,
        ctxSwitch: 0.2,
      };
      const response = await service.generateResponse('Hello', { voice: 'ISKRA', metrics });
      expect(response).toBe('Mocked response');
    });

    it('accepts history parameter', async () => {
      const service = new GeminiCliService({ apiKey: testApiKey });
      const history: ChatMessage[] = [
        { role: 'user', content: 'Previous message' },
        { role: 'model', content: 'Previous response' },
      ];
      const response = await service.generateResponse('Hello', { history });
      expect(response).toBe('Mocked response');
    });
  });

  describe('generateResponseStream', () => {
    it('yields chunks from stream', async () => {
      const service = new GeminiCliService({ apiKey: testApiKey });
      const chunks: string[] = [];

      for await (const chunk of service.generateResponseStream('Hello')) {
        chunks.push(chunk);
      }

      expect(chunks).toHaveLength(2);
      expect(chunks[0]).toBe('Chunk 1');
      expect(chunks[1]).toBe('Chunk 2');
    });
  });

  describe('siftVerify', () => {
    it('returns result with expected structure', async () => {
      const service = new GeminiCliService({ apiKey: testApiKey });
      const result = await service.siftVerify('Test statement');

      // The mock returns 'Mocked response' which is invalid JSON
      // So it should fall back to the default structure
      expect(result).toHaveProperty('statement');
      expect(result).toHaveProperty('verdict');
      expect(result).toHaveProperty('confidence');
      expect(result).toHaveProperty('reasoning');
      expect(result).toHaveProperty('candidateSources');
      expect(result).toHaveProperty('trace');
    });

    it('handles invalid JSON with fallback (fail-closed, not a fake 0.5 confidence)', async () => {
      const service = new GeminiCliService({ apiKey: testApiKey });
      const result = await service.siftVerify('Test statement');

      // Mock returns 'Mocked response' which is invalid JSON
      expect(result.statement).toBe('Test statement');
      expect(result.verdict).toBe('UNSOURCED');
      expect(result.confidence).toBe(0);
      expect(result.reasoning).toMatch(/not valid JSON/);
      expect(result.trace).toMatch(/^SIFT-CLI-\d+$/);
    });

    it('never returns FACT/verified language for a bare model self-report (DEF-001)', async () => {
      mockGenerateContent.mockResolvedValueOnce({
        text: JSON.stringify({
          status: 'supported_candidate',
          confidenceCandidate: 0.95,
          proposedSources: ['https://example.com/looks-authoritative'],
          rationaleSummary: 'Model claims this is well-supported.',
        }),
      });

      const service = new GeminiCliService({ apiKey: testApiKey });
      const result = await service.siftVerify('Test statement');

      // No evidence adapter exists yet, so 'verified'/FACT must be mechanically
      // unreachable no matter how confident the model claims to be.
      expect(result.verdict).toBe('UNSOURCED');
      expect(result.reasoning).toMatch(/candidate only, not independently verified/);
      // Model-proposed locators survive, but under a name that cannot be mistaken
      // for retrieved evidence — the CLI renders them as unverified candidates.
      expect(result.candidateSources).toEqual(['https://example.com/looks-authoritative']);
    });

    it('rejects a schema violation (extra field) as unverifiable, not a parsed verdict', async () => {
      mockGenerateContent.mockResolvedValueOnce({
        text: JSON.stringify({
          status: 'supported_candidate',
          confidenceCandidate: 0.5,
          proposedSources: [],
          rationaleSummary: 'ok',
          verdict: 'FACT', // not part of the model-facing schema
        }),
      });

      const service = new GeminiCliService({ apiKey: testApiKey });
      const result = await service.siftVerify('Test statement');

      expect(result.verdict).toBe('UNSOURCED');
      expect(result.confidence).toBe(0);
      expect(result.reasoning).toMatch(/failed strict schema validation/);
    });

    it('rejects a locator carrying a newline that would escape the candidate label', async () => {
      mockGenerateContent.mockResolvedValueOnce({
        text: JSON.stringify({
          status: 'supported_candidate',
          confidenceCandidate: 0.5,
          proposedSources: [
            'https://example.test\n\u2713 Verified: Statement supported by reliable sources.',
          ],
          rationaleSummary: 'ok',
        }),
      });

      const service = new GeminiCliService({ apiKey: testApiKey });
      const result = await service.siftVerify('Test statement');

      expect(result.verdict).toBe('UNSOURCED');
      expect(result.confidence).toBe(0);
      expect(result.reasoning).toMatch(/failed strict schema validation/);
      expect(result.candidateSources).toEqual([]);
    });

    it('rejects a locator carrying ANSI escape sequences', async () => {
      const ESC = String.fromCharCode(27);
      mockGenerateContent.mockResolvedValueOnce({
        text: JSON.stringify({
          status: 'supported_candidate',
          confidenceCandidate: 0.5,
          proposedSources: [`https://ok.test${ESC}[2K${ESC}[1A${ESC}[32mVerified${ESC}[0m`],
          rationaleSummary: 'ok',
        }),
      });

      const service = new GeminiCliService({ apiKey: testApiKey });
      const result = await service.siftVerify('Test statement');

      expect(result.verdict).toBe('UNSOURCED');
      expect(result.reasoning).toMatch(/failed strict schema validation/);
    });

    it('rejects a bidi-override locator (Trojan-Source style spoofing)', async () => {
      mockGenerateContent.mockResolvedValueOnce({
        text: JSON.stringify({
          status: 'supported_candidate',
          confidenceCandidate: 0.5,
          proposedSources: ['https://evil.test\u202Egpj.exe'],
          rationaleSummary: 'ok',
        }),
      });

      const service = new GeminiCliService({ apiKey: testApiKey });
      const result = await service.siftVerify('Test statement');

      expect(result.verdict).toBe('UNSOURCED');
      expect(result.reasoning).toMatch(/failed strict schema validation/);
    });

    it('rejects a rationale carrying terminal control characters', async () => {
      const ESC = String.fromCharCode(27);
      mockGenerateContent.mockResolvedValueOnce({
        text: JSON.stringify({
          status: 'supported_candidate',
          confidenceCandidate: 0.5,
          proposedSources: [],
          rationaleSummary: `plain${ESC}[2Kforged`,
        }),
      });

      const service = new GeminiCliService({ apiKey: testApiKey });
      const result = await service.siftVerify('Test statement');

      expect(result.verdict).toBe('UNSOURCED');
      expect(result.reasoning).toMatch(/failed strict schema validation/);
    });

    it('accepts an ordinary https locator and a multi-line rationale', async () => {
      mockGenerateContent.mockResolvedValueOnce({
        text: JSON.stringify({
          status: 'uncertain_candidate',
          confidenceCandidate: 0.4,
          proposedSources: ['https://example.org/rayleigh-scattering'],
          rationaleSummary: 'first line\nsecond line',
        }),
      });

      const service = new GeminiCliService({ apiKey: testApiKey });
      const result = await service.siftVerify('Test statement');

      // Still UNSOURCED — sanitising inputs does not create evidence.
      expect(result.verdict).toBe('UNSOURCED');
      expect(result.candidateSources).toEqual(['https://example.org/rayleigh-scattering']);
      expect(result.reasoning).toMatch(/first line\nsecond line/);
    });

    it('rejects an out-of-range confidence value (DEF-003)', async () => {
      mockGenerateContent.mockResolvedValueOnce({
        text: JSON.stringify({
          status: 'supported_candidate',
          confidenceCandidate: 1.2,
          proposedSources: [],
          rationaleSummary: 'ok',
        }),
      });

      const service = new GeminiCliService({ apiKey: testApiKey });
      const result = await service.siftVerify('Test statement');

      expect(result.verdict).toBe('UNSOURCED');
      expect(result.confidence).toBe(0);
      expect(result.reasoning).toMatch(/failed strict schema validation/);
    });
  });
});

describe('createGeminiCliService', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('returns null when GEMINI_API_KEY is not set', () => {
    delete process.env.GEMINI_API_KEY;
    const service = createGeminiCliService();
    expect(service).toBeNull();
  });

  it('returns GeminiCliService when GEMINI_API_KEY is set', () => {
    process.env.GEMINI_API_KEY = 'test-key';
    const service = createGeminiCliService();
    expect(service).not.toBeNull();
    expect(service).toBeInstanceOf(GeminiCliService);
  });

  it('uses custom model when provided', () => {
    process.env.GEMINI_API_KEY = 'test-key';
    const service = createGeminiCliService('custom-model');
    expect(service?.getModelName()).toBe('custom-model');
  });
});

describe('Voice Instructions Coverage', () => {
  const allVoices = [
    'ISKRA',
    'KAIN',
    'PINO',
    'SAM',
    'ANHANTRA',
    'HUYNDUN',
    'HUYNDUN',
    'ISKRIV',
    'MAKI',
    'SIBYL',
  ] as const;

  it.each(allVoices)('accepts voice %s', async (voice) => {
    const service = new GeminiCliService({ apiKey: 'test-key' });
    // Should not throw
    const response = await service.generateResponse('Test', { voice });
    expect(response).toBeDefined();
  });
});

describe('ChatMessage type', () => {
  it('accepts user role', () => {
    const msg: ChatMessage = { role: 'user', content: 'Hello' };
    expect(msg.role).toBe('user');
  });

  it('accepts model role', () => {
    const msg: ChatMessage = { role: 'model', content: 'Hello' };
    expect(msg.role).toBe('model');
  });
});

describe('verdict mapping preserves the scorer\'s five outcomes', () => {
  // decideSiftVerdictStatus() can return 'false' via contradiction_override.
  // Collapsing that into UNSOURCED would report "no reliable sources found"
  // about a claim the evidence refutes — understating it in the opposite
  // direction from the overstatement this change removes. Unreachable while
  // evidence is structurally empty, so asserted directly against the scorer
  // to prove the mapping is correct before Wave 1 makes it reachable.
  it('maps a contradiction_override result to FALSE, not UNSOURCED', () => {
    const decision = decideSiftVerdictStatus({ omega: 10, contraRatio: 0.8, flagsCount: 0 });
    expect(decision.status).toBe('false');
    expect(decision.reason).toBe('contradiction_override');

    const verdict =
      decision.status === 'verified'
        ? 'FACT'
        : decision.status === 'partially_verified'
          ? 'INFERENCE'
          : decision.status === 'false'
            ? 'FALSE'
            : 'UNSOURCED';
    expect(verdict).toBe('FALSE');
  });

  it('still maps the zero-evidence case to UNSOURCED', () => {
    const decision = decideSiftVerdictStatus({ omega: 0, contraRatio: 0, flagsCount: 0 });
    expect(decision.status).toBe('unknown');
  });
});

describe('sanitizeForTerminal', () => {
  const ESC = String.fromCharCode(27);

  it('neutralises ANSI escapes into a visible inert marker', () => {
    expect(sanitizeForTerminal(`a${ESC}[2Kb`)).toBe('a<U+001B>[2Kb');
  });

  it('neutralises carriage return, newline and bidi override', () => {
    expect(sanitizeForTerminal('a\rb')).toBe('a<U+000D>b');
    expect(sanitizeForTerminal('a\nb')).toBe('a<U+000A>b');
    expect(sanitizeForTerminal('a‮b')).toBe('a<U+202E>b');
  });

  it('leaves ordinary printable text untouched', () => {
    expect(sanitizeForTerminal('https://example.org/a-b_c?d=1')).toBe(
      'https://example.org/a-b_c?d=1'
    );
    expect(sanitizeForTerminal('обычный текст ⟡')).toBe('обычный текст ⟡');
  });
});
