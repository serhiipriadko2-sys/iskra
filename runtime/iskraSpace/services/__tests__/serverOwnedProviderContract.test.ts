import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const here = dirname(fileURLToPath(import.meta.url));
const serviceSource = readFileSync(join(here, '../geminiService.ts'), 'utf8');
const handlerSource = readFileSync(
  join(here, '../../supabase/functions/gemini/index.ts'),
  'utf8',
);
const schemaSource = readFileSync(
  join(here, '../../supabase/functions/_shared/aiContentSchemaPolicy.ts'),
  'utf8',
);
const promptSource = readFileSync(
  join(here, '../../supabase/functions/_shared/aiServerPromptPolicy.ts'),
  'utf8',
);

describe('server-owned provider contract', () => {
  it('sends only intent content and bounded config across the browser boundary', () => {
    expect(serviceSource).not.toContain("getRuntimeConfig('VITE_AI_PROVIDER'");
    expect(serviceSource).toContain("intent: 'text.generate'");
    expect(serviceSource).toContain("intent: 'text.stream'");
    expect(serviceSource).toContain("intent: 'embedding.generate'");
    expect(serviceSource).toContain('[NON-AUTHORITATIVE CLIENT CONTEXT]');
    expect(serviceSource).not.toContain('provider: AI_PROVIDER');
    expect(serviceSource).not.toContain("model: 'text-embedding-004'");
  });

  it('rejects authority fields in the strict request schema', () => {
    expect(schemaSource).toContain("hasOnlyKeys(body, ['intent', 'contents', 'content', 'config'])");
    expect(schemaSource).not.toContain("'provider', 'model'");
    expect(schemaSource).not.toContain('parseSystemInstruction');
    expect(schemaSource).toContain('systemInstructionForIntent(intent)');
  });

  it('keeps provider fallback and models server-owned', () => {
    expect(handlerSource).toContain('function providerSequence(): AiProvider[]');
    expect(handlerSource).not.toContain('providerSequence(payload)');
    expect(handlerSource).toContain('function modelFor(provider: AiProvider, action: AiAction): string');
    expect(handlerSource).not.toContain('requestedModel');
    expect(handlerSource).toContain("Deno.env.get('AI_FALLBACK_PROVIDER')");
    expect(handlerSource).toContain("Deno.env.get('GEMINI_TEXT_MODEL')");
    expect(handlerSource).toContain("Deno.env.get('OPENAI_TEXT_MODEL')");
  });

  it('selects the system prompt from the transport intent', () => {
    expect(promptSource).toContain("'text.generate': 'generateContent'");
    expect(promptSource).toContain("'text.stream': 'streamGenerateContent'");
    expect(promptSource).toContain("'embedding.generate': 'embedContent'");
    expect(promptSource).toContain('systemInstructionForIntent');
  });
});
