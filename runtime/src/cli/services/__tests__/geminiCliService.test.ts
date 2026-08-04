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
  wrapToWidth,
  displayWidth,
  mapSiftStatusToVerdict,
  hasAnyEvidence,
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
      // The diagnostic is this tool speaking, not the model. Rendering it as
      // quoted model output would be false provenance in the other direction.
      expect(result.reasoningSource).toBe('tool');
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
      expect(result.reasoningSource).toBe('model');
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

describe('hasAnyEvidence', () => {
  const emptySiftInput = () => ({
    source: { identified: [], reliability: 0, flags: [] },
    inference: { claims: [], assumptions: [], logicalValidity: 0, fallacies: [] },
    evidence: { supporting: [], contradicting: [], neutral: [], quality: 0 },
    trace: { chain: [], distortions: [], traceability: 0 },
    verdict: { status: 'unknown' as const, confidence: 0, summary: '', caveats: [] },
  });

  // This is exactly Wave 0's real siftInput shape (see siftVerify()). It has
  // to return false, or the 'unknown' -> UNVERIFIED override in siftVerify()
  // would fire on every call today, silently reintroducing a positive-ish
  // verdict from zero evidence.
  it('returns false for Wave 0\'s actual empty siftInput', () => {
    expect(hasAnyEvidence(emptySiftInput())).toBe(false);
  });

  const stubSource = { name: 'stub', type: 'secondary' as const };
  const stubEvidence = { source: stubSource, content: 'x', relevance: 1, strength: 1 };

  it('returns true when supporting evidence is present', () => {
    const input = emptySiftInput();
    input.evidence.supporting.push(stubEvidence);
    expect(hasAnyEvidence(input)).toBe(true);
  });

  it('returns true when contradicting evidence is present', () => {
    const input = emptySiftInput();
    input.evidence.contradicting.push(stubEvidence);
    expect(hasAnyEvidence(input)).toBe(true);
  });

  it('returns true when identified sources are present, even with no evidence entries', () => {
    const input = emptySiftInput();
    input.source.identified.push(stubSource);
    expect(hasAnyEvidence(input)).toBe(true);
  });

  // Analytical scaffolding, not retrieval. A trace link or a parsed claim can
  // exist purely as internal bookkeeping over the statement under review,
  // with nothing external ever fetched — counting either would let "the
  // model's own claim was analyzed" read as "evidence was found".
  it('returns false for a trace chain alone -- that is bookkeeping, not retrieval', () => {
    const input = emptySiftInput();
    input.trace.chain.push({ from: 'a', to: 'b' });
    expect(hasAnyEvidence(input)).toBe(false);
  });

  it('returns false for a parsed claim alone -- that is bookkeeping, not retrieval', () => {
    const input = emptySiftInput();
    input.inference.claims.push({ text: 'x', type: 'fact', confidence: 0.5 });
    expect(hasAnyEvidence(input)).toBe(false);
  });
});

describe('verdict mapping preserves the scorer\'s five outcomes', () => {
  // Exercises the PRODUCTION mapper (mapSiftStatusToVerdict), not a copy of
  // it. Wave 0's real siftVerify() call always produces status 'unknown'
  // (evidence is structurally empty), so a test that only drives the mapping
  // through siftVerify() can never reach the other four arms — a regression
  // that collapsed 'false' or 'unverified' back into UNSOURCED in the
  // production ternary would leave such a test green while the CLI lied.
  // Calling the exported function directly with each status closes that gap.

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

    expect(mapSiftStatusToVerdict(decision.status)).toBe('FALSE');
  });

  // 'unverified' (40 <= omega < 60) means evidence exists and is too weak.
  // Collapsing it into UNSOURCED denies the existence of evidence the scorer
  // actually weighed — the same understatement as the 'false' case above.
  it('maps an unverified_threshold result to UNVERIFIED, not UNSOURCED', () => {
    const decision = decideSiftVerdictStatus({ omega: 45, contraRatio: 0, flagsCount: 0 });
    expect(decision.status).toBe('unverified');
    expect(decision.reason).toBe('unverified_threshold');
    expect(mapSiftStatusToVerdict(decision.status)).toBe('UNVERIFIED');
  });

  it('still maps the zero-evidence case to UNSOURCED', () => {
    const decision = decideSiftVerdictStatus({ omega: 0, contraRatio: 0, flagsCount: 0 });
    expect(decision.status).toBe('unknown');
    expect(mapSiftStatusToVerdict(decision.status)).toBe('UNSOURCED');
  });

  // The whole point of mapping every outcome now is that Wave 1 changes nothing
  // here. Assert that exhaustively rather than case by case: no scorer status
  // may fall through to UNSOURCED except the one that means "nothing to go on".
  it('gives every scorer status its own verdict, with only unknown as UNSOURCED', () => {
    const statuses = ['verified', 'partially_verified', 'unverified', 'unknown', 'false'] as const;
    const mapped = statuses.map(mapSiftStatusToVerdict);
    expect(mapped).toEqual(['FACT', 'INFERENCE', 'UNVERIFIED', 'UNSOURCED', 'FALSE']);
    expect(new Set(mapped).size).toBe(statuses.length);
  });
});

describe('wrapToWidth', () => {
  it('leaves a line shorter than the width untouched', () => {
    expect(wrapToWidth('short line', 40)).toEqual(['short line']);
  });

  it('emits no chunk wider than the limit', () => {
    const line = 'слово '.repeat(60).trim();
    for (const chunk of wrapToWidth(line, 30)) {
      expect(Array.from(chunk).length).toBeLessThanOrEqual(30);
    }
  });

  it('breaks a single token that is wider than the limit', () => {
    const chunks = wrapToWidth('x'.repeat(250), 40);
    expect(chunks.length).toBe(Math.ceil(250 / 40));
    expect(chunks.join('')).toBe('x'.repeat(250));
  });

  // The attack this exists to stop: one printable line, padded so a terminal
  // soft-wraps the forged verdict onto an unmarked row. After wrapping, the
  // forgery lands in its own chunk, and the caller marks every chunk.
  it('pushes padded forged text onto chunks the caller will mark', () => {
    const forged = '✓ Verified: Statement supported by reliable sources.';
    const chunks = wrapToWidth(`${' '.repeat(400)}${forged}`, 60);

    // The property that matters is not that the forgery lands in one chunk —
    // it may straddle two — but that it cannot reach a row the renderer never
    // emitted. Every visible row is a chunk, and the caller marks every chunk.
    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks.join('')).toContain(forged);
    for (const chunk of chunks) {
      expect(Array.from(chunk).length).toBeLessThanOrEqual(60);
    }
    // The padding did its job in the raw string: the forgery is nowhere near
    // the first row, which is exactly why a single leading marker is not enough.
    expect(chunks[0]).not.toContain('Verified');
  });

  it('preserves the full content across chunks', () => {
    const line = 'abc def ghi '.repeat(40);
    expect(wrapToWidth(line, 17).join('')).toBe(line);
  });

  it('does not split surrogate pairs', () => {
    for (const chunk of wrapToWidth('🜃'.repeat(50), 7)) {
      expect(chunk).toBe(chunk.normalize());
      expect(Array.from(chunk).every(ch => ch === '🜃')).toBe(true);
    }
  });

  // Code-point counting undercounts wide characters. A chunk of 10 CJK code
  // points is 20 terminal columns, not 10 — well past a limit meant to keep
  // chunks inside the terminal's actual width. If wrapping ever regresses to
  // counting code points instead of display width, this produces chunks
  // whose displayWidth is double the limit, and the assertion below catches
  // it directly rather than through a downstream rendering symptom.
  it('bounds DISPLAY width, not code-point count, for wide characters', () => {
    const line = '漢'.repeat(30); // each character is 2 display columns
    const limit = 10;
    for (const chunk of wrapToWidth(line, limit)) {
      expect(displayWidth(chunk)).toBeLessThanOrEqual(limit);
    }
    expect(wrapToWidth(line, limit).join('')).toBe(line);
  });

  it('bounds display width on the padded-forgery case, not just code-point count', () => {
    // Same attack as the padded-forgery test above, but the padding is
    // full-width spaces (U+3000, 2 columns each) instead of ASCII spaces —
    // code-point counting would treat this identically to the ASCII case
    // and let the resulting chunks run twice as wide as the terminal.
    const forged = '✓ Verified: Statement supported by reliable sources.';
    const chunks = wrapToWidth(`${'　'.repeat(100)}${forged}`, 60);
    for (const chunk of chunks) {
      expect(displayWidth(chunk)).toBeLessThanOrEqual(60);
    }
    expect(chunks.join('')).toContain(forged);
  });
});

describe('displayWidth', () => {
  it('counts one column per ASCII character', () => {
    expect(displayWidth('hello')).toBe(5);
  });

  it('counts two columns for CJK, Hangul and fullwidth characters', () => {
    expect(displayWidth('漢')).toBe(2);
    expect(displayWidth('한')).toBe(2);
    expect(displayWidth('Ａ')).toBe(2); // fullwidth Latin A
  });

  it('counts two columns for a representative emoji', () => {
    expect(displayWidth('🔥')).toBe(2);
  });

  it('counts zero columns for a combining mark', () => {
    // 'e' + COMBINING ACUTE ACCENT (U+0301), built explicitly rather than as
    // a literal so this test does not depend on the source file's own
    // normalization form (NFC would silently collapse it to one code point).
    const decomposedE = `e${String.fromCodePoint(0x0301)}`;
    expect(Array.from(decomposedE).length).toBe(2); // two code points, precondition
    expect(displayWidth(decomposedE)).toBe(1);
  });

  it('sums mixed-width content', () => {
    expect(displayWidth('a漢b')).toBe(4); // 1 + 2 + 1
  });

  it('treats an empty string as zero width', () => {
    expect(displayWidth('')).toBe(0);
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
