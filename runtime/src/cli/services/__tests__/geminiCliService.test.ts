import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GeminiCliService, GeminiCliConfig } from '../geminiCliService';

// Define mocks first
const mockGenerateContent = vi.fn();
const mockGenerateContentStream = vi.fn();

// Mock @google/genai module
vi.mock('@google/genai', () => {
  return {
    GoogleGenAI: class {
      constructor() {
        return {
          models: {
            generateContent: mockGenerateContent,
            generateContentStream: mockGenerateContentStream,
          },
        };
      }
    },
    Type: {
      OBJECT: 'object',
      STRING: 'string',
      ARRAY: 'array',
      NUMBER: 'number',
    },
  };
});

describe('GeminiCliService', () => {
  const mockConfig: GeminiCliConfig = {
    apiKey: 'test-api-key',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with API key', () => {
    const service = new GeminiCliService(mockConfig);
    expect(service).toBeDefined();
    expect(service.getModelName()).toBe('gemini-2.0-flash');
  });

  it('should generate response', async () => {
    mockGenerateContent.mockResolvedValue({
      response: {
        text: () => 'Test response',
      },
    });

    const service = new GeminiCliService(mockConfig);
    const response = await service.generateResponse('Hello');

    expect(response).toBe('Test response');
    expect(mockGenerateContent).toHaveBeenCalledWith(expect.objectContaining({
      contents: expect.arrayContaining([
        expect.objectContaining({
          role: 'user',
          parts: [{ text: 'Hello' }],
        }),
      ]),
    }));
  });

  it('should generate streaming response', async () => {
    const mockStream = (async function* () {
      yield { text: () => 'Chunk 1' };
      yield { text: () => 'Chunk 2' };
    })();

    mockGenerateContentStream.mockResolvedValue({
      stream: mockStream,
    });

    const service = new GeminiCliService(mockConfig);
    const chunks: string[] = [];

    for await (const chunk of service.generateResponseStream('Hello')) {
      chunks.push(chunk);
    }

    expect(chunks).toEqual(['Chunk 1', 'Chunk 2']);
  });

  it('should handle SIFT verification', async () => {
    const mockSiftResponse = {
      statement: 'Test statement',
      verdict: 'FACT',
      confidence: 0.9,
      reasoning: 'Verified by sources',
      sources: ['Source A'],
      trace: 'SIFT-TEST-123',
    };

    mockGenerateContent.mockResolvedValue({
      response: {
        text: () => JSON.stringify(mockSiftResponse),
      },
    });

    const service = new GeminiCliService(mockConfig);
    const result = await service.siftVerify('Test statement');

    expect(result).toEqual(mockSiftResponse);
    // Check if schema was passed
    expect(mockGenerateContent).toHaveBeenCalledWith(expect.objectContaining({
      config: expect.objectContaining({
        responseMimeType: 'application/json',
      }),
    }));
  });
});
