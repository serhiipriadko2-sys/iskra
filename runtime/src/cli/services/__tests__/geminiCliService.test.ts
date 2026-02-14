/**
 * Tests for GeminiCliService
 *
 * Tests voice instructions, configuration, and SIFT verification parsing.
 * API calls are mocked since they require actual Gemini API key.
 */

import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest';

// Mock @google/genai with Vitest 4.x compatible class mock
vi.mock('@google/genai', () => {
  return {
    GoogleGenAI: class MockGoogleGenAI {
      models = {
        generateContent: vi.fn().mockResolvedValue({
          text: 'Mocked response',
        }),
        generateContentStream: vi.fn().mockResolvedValue(
          (async function* () {
            yield { text: 'Chunk 1' };
            yield { text: 'Chunk 2' };
          })()
        ),
      };
    },
  };
});

import { GeminiCliService, createGeminiCliService, ChatMessage } from '../geminiCliService.js';
import type { IskraMetrics } from '../../../types/metrics.js';

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
      expect(result).toHaveProperty('sources');
      expect(result).toHaveProperty('trace');
    });

    it('handles invalid JSON with fallback', async () => {
      const service = new GeminiCliService({ apiKey: testApiKey });
      const result = await service.siftVerify('Test statement');

      // Mock returns 'Mocked response' which is invalid JSON
      expect(result.statement).toBe('Test statement');
      expect(result.verdict).toBe('UNSOURCED');
      expect(result.confidence).toBe(0.5);
      expect(result.reasoning).toBe('Mocked response');
      expect(result.trace).toMatch(/^SIFT-CLI-\d+$/);
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
