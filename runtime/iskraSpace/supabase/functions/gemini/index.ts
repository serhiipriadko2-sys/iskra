import { GoogleGenAI } from 'npm:@google/genai@1.34.0';

type AiProvider = 'gemini' | 'openai';
type RequestedProvider = AiProvider | 'auto';
type AiAction = 'generateContent' | 'streamGenerateContent' | 'embedContent';

type AiProxyPayload = {
  action?: AiAction;
  provider?: RequestedProvider;
  model?: string;
  contents?: unknown;
  content?: unknown;
  systemInstruction?: string;
  generationConfig?: Record<string, unknown>;
};

const DEFAULT_GEMINI_TEXT_MODEL = 'gemini-2.5-flash';
const DEFAULT_GEMINI_EMBEDDING_MODEL = 'gemini-embedding-001';
const DEFAULT_OPENAI_TEXT_MODEL = 'gpt-5';
const DEFAULT_OPENAI_EMBEDDING_MODEL = 'text-embedding-3-small';
const EMBEDDING_DIMENSIONS = 1536;

type AllowedOriginMode = 'any' | 'explicit';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') ?? '';

function getAllowedOrigins(): { mode: AllowedOriginMode; origins: Set<string> } {
  const raw = Deno.env.get('AI_PROXY_ALLOWED_ORIGINS') ?? '';
  const trimmed = raw.trim();
  if (trimmed === '*') {
    return { mode: 'any', origins: new Set<string>() };
  }
  return {
    mode: 'explicit',
    origins: new Set(
      trimmed
        .split(',')
        .map((o) => o.trim().toLowerCase())
        .filter(Boolean),
    ),
  };
}

function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return false;
  const { mode, origins } = getAllowedOrigins();
  if (mode === 'any') return true;
  return origins.has(origin.toLowerCase());
}

function corsHeaders(origin: string | null): Record<string, string> {
  const headers: Record<string, string> = {
    'access-control-allow-headers': 'authorization, x-client-info, apikey, content-type',
    'access-control-allow-methods': 'POST, OPTIONS',
    'vary': 'origin',
  };
  if (isOriginAllowed(origin)) {
    headers['access-control-allow-origin'] = origin ?? '';
  }
  return headers;
}

function json(body: unknown, init: ResponseInit = {}, origin: string | null = null) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      ...corsHeaders(origin),
      'content-type': 'application/json',
      ...(init.headers ?? {}),
    },
  });
}

async function validateJwt(token: string): Promise<{ sub: string; user?: Record<string, unknown> } | null> {
  // Local/dev bypass: if Supabase env vars are missing, we cannot validate.
  // In production these are injected by Supabase and validation is enforced.
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn('[gemini] SUPABASE_URL or SUPABASE_ANON_KEY missing; JWT validation skipped (dev mode)');
    return { sub: 'dev' };
  }

  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        apikey: SUPABASE_ANON_KEY,
      },
    });

    if (!res.ok) return null;

    const data = (await res.json()) as Record<string, unknown> | undefined;
    if (!data || typeof data.id !== 'string') return null;

    return { sub: data.id, user: data };
  } catch (err) {
    console.error('[gemini] JWT validation error:', err);
    return null;
  }
}

function getClientIdentifier(req: Request, userSub?: string): string {
  if (userSub) return `user:${userSub}`;
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'unknown';
  return `ip:${ip}`;
}

const RL_WINDOW_MS = Number(Deno.env.get('AI_PROXY_RL_WINDOW_MS') ?? '') || 60_000;
const RL_MAX = Number(Deno.env.get('AI_PROXY_RL_MAX') ?? '') || 60;
const rlBuckets = new Map<string, { windowStart: number; count: number }>();

function cleanupExpiredBuckets(now: number): void {
  for (const [key, bucket] of rlBuckets.entries()) {
    if (now - bucket.windowStart >= RL_WINDOW_MS) {
      rlBuckets.delete(key);
    }
  }
}

function rateLimit(req: Request, userSub?: string): Response | null {
  const now = Date.now();
  // Best-effort cleanup to prevent unbounded growth across long-lived workers.
  if (rlBuckets.size > 10_000) cleanupExpiredBuckets(now);

  const key = getClientIdentifier(req, userSub);
  const bucket = rlBuckets.get(key);

  if (!bucket || now - bucket.windowStart >= RL_WINDOW_MS) {
    rlBuckets.set(key, { windowStart: now, count: 1 });
    return null;
  }

  bucket.count += 1;
  if (bucket.count > RL_MAX) {
    return json(
      { error: 'Rate limit exceeded. Slow down.' },
      { status: 429 },
      req.headers.get('origin'),
    );
  }
  return null;
}

function extractBearerToken(req: Request): string | null {
  const auth = req.headers.get('authorization') ?? req.headers.get('Authorization');
  if (!auth) return null;
  const [scheme, token] = auth.split(' ');
  if (scheme?.toLowerCase() !== 'bearer' || !token) return null;
  return token;
}

function getConfig(payload: AiProxyPayload) {
  return {
    ...(payload.generationConfig ?? {}),
    ...(payload.systemInstruction ? { systemInstruction: payload.systemInstruction } : {}),
  };
}

function normalizeProvider(value: unknown, fallback: RequestedProvider): RequestedProvider {
  if (value === 'gemini' || value === 'openai' || value === 'auto') return value;
  return fallback;
}

function providerSequence(payload: AiProxyPayload): AiProvider[] {
  const envProvider = normalizeProvider(Deno.env.get('AI_PROVIDER'), 'gemini');
  const requested = normalizeProvider(payload.provider, envProvider);
  const fallback = normalizeProvider(Deno.env.get('AI_FALLBACK_PROVIDER'), 'auto');
  const primary: AiProvider = requested === 'auto'
    ? (envProvider === 'auto' ? 'gemini' : envProvider)
    : requested;

  const providers: AiProvider[] = [primary];
  if (fallback !== 'auto' && fallback !== primary) providers.push(fallback);
  return providers;
}

function modelFor(provider: AiProvider, action: AiAction, requestedModel: unknown): string {
  if (provider === 'gemini') {
    if (action === 'embedContent') return DEFAULT_GEMINI_EMBEDDING_MODEL;
    if (typeof requestedModel === 'string' && requestedModel.trim()) return requestedModel;
    return DEFAULT_GEMINI_TEXT_MODEL;
  }

  if (action === 'embedContent') {
    return Deno.env.get('OPENAI_EMBEDDING_MODEL') || DEFAULT_OPENAI_EMBEDDING_MODEL;
  }
  return Deno.env.get('OPENAI_TEXT_MODEL') || DEFAULT_OPENAI_TEXT_MODEL;
}

function extractTextFromPart(part: unknown): string {
  if (typeof part === 'string') return part;
  if (!part || typeof part !== 'object') return '';
  const maybeText = (part as { text?: unknown }).text;
  return typeof maybeText === 'string' ? maybeText : '';
}

function inputFromContents(contents: unknown): string {
  if (typeof contents === 'string') return contents;
  if (!Array.isArray(contents)) return '';

  return contents
    .map((item) => {
      if (!item || typeof item !== 'object') return '';
      const role = typeof (item as { role?: unknown }).role === 'string'
        ? `${(item as { role: string }).role}: `
        : '';
      const parts = (item as { parts?: unknown }).parts;
      const text = Array.isArray(parts)
        ? parts.map(extractTextFromPart).filter(Boolean).join('')
        : extractTextFromPart(item);
      return text ? `${role}${text}` : '';
    })
    .filter(Boolean)
    .join('\n');
}

function inputFromEmbeddingContent(content: unknown): string {
  const text = inputFromContents([content]);
  if (text) return text.replace(/^user: /, '');
  return extractTextFromPart(content);
}

function extractOpenAiText(response: unknown): string {
  if (!response || typeof response !== 'object') return '';
  const outputText = (response as { output_text?: unknown }).output_text;
  if (typeof outputText === 'string') return outputText;

  const output = (response as { output?: unknown }).output;
  if (!Array.isArray(output)) return '';

  return output
    .flatMap((item) => {
      if (!item || typeof item !== 'object') return [];
      const content = (item as { content?: unknown }).content;
      return Array.isArray(content) ? content : [];
    })
    .map((part) => {
      if (!part || typeof part !== 'object') return '';
      const text = (part as { text?: unknown }).text;
      return typeof text === 'string' ? text : '';
    })
    .join('');
}

function geminiTextResponse(text: string) {
  return {
    text,
    candidates: [
      {
        content: {
          parts: [{ text }],
        },
      },
    ],
  };
}

function normalizeJsonSchema(schema: unknown): unknown {
  if (Array.isArray(schema)) return schema.map(normalizeJsonSchema);
  if (!schema || typeof schema !== 'object') return schema;

  const normalized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(schema)) {
    if (key === 'type' && typeof value === 'string') {
      normalized[key] = value.toLowerCase();
    } else {
      normalized[key] = normalizeJsonSchema(value);
    }
  }
  return normalized;
}

function openAiTextConfig(payload: AiProxyPayload): Record<string, unknown> | undefined {
  const config = payload.generationConfig ?? {};
  const responseSchema = config.responseSchema;
  const responseMimeType = config.responseMimeType;

  if (responseSchema && typeof responseSchema === 'object') {
    return {
      format: {
        type: 'json_schema',
        name: 'iskra_response',
        schema: normalizeJsonSchema(responseSchema),
        strict: false,
      },
    };
  }

  if (typeof responseMimeType === 'string' && responseMimeType.includes('json')) {
    return {
      format: { type: 'json_object' },
    };
  }

  return undefined;
}

function getGeminiClient() {
  const apiKey = Deno.env.get('GEMINI_API_KEY');
  if (!apiKey) throw new Error('GEMINI_API_KEY is not configured');
  return new GoogleGenAI({ apiKey });
}

async function openAiFetch(path: string, body: Record<string, unknown>): Promise<unknown> {
  const apiKey = Deno.env.get('OPENAI_API_KEY');
  if (!apiKey) throw new Error('OPENAI_API_KEY is not configured');

  const response = await fetch(`https://api.openai.com/v1/${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = typeof (data as { error?: { message?: unknown } }).error?.message === 'string'
      ? (data as { error: { message: string } }).error.message
      : `OpenAI ${path} failed with ${response.status}`;
    throw new Error(message);
  }
  return data;
}

async function generateWithGemini(payload: AiProxyPayload) {
  const ai = getGeminiClient();
  const response = await ai.models.generateContent({
    model: modelFor('gemini', 'generateContent', payload.model),
    contents: payload.contents as never,
    config: getConfig(payload),
  });

  return {
    text: response.text ?? '',
    candidates: response.candidates ?? [],
  };
}

async function generateWithOpenAi(payload: AiProxyPayload) {
  const input = inputFromContents(payload.contents);
  if (!input) throw new Error('Missing or invalid contents');

  const response = await openAiFetch('responses', {
    model: modelFor('openai', 'generateContent', payload.model),
    input,
    instructions: payload.systemInstruction || undefined,
    text: openAiTextConfig(payload),
  });
  return geminiTextResponse(extractOpenAiText(response));
}

async function embedWithGemini(payload: AiProxyPayload) {
  const ai = getGeminiClient();
  const response = await ai.models.embedContent({
    model: modelFor('gemini', 'embedContent', payload.model),
    contents: payload.content as never,
    config: { outputDimensionality: EMBEDDING_DIMENSIONS },
  });
  const maybeEmbedding = response as {
    embedding?: { values?: unknown };
    embeddings?: Array<{ values?: unknown }>;
  };
  const values = maybeEmbedding.embedding?.values ?? maybeEmbedding.embeddings?.[0]?.values;

  return {
    embedding: {
      values: Array.isArray(values) ? values : [],
    },
  };
}

async function embedWithOpenAi(payload: AiProxyPayload) {
  const input = inputFromEmbeddingContent(payload.content);
  if (!input) throw new Error('Missing or invalid content');

  const response = await openAiFetch('embeddings', {
    model: modelFor('openai', 'embedContent', payload.model),
    input,
  });
  const embedding = (response as { data?: Array<{ embedding?: unknown }> }).data?.[0]?.embedding;
  return {
    embedding: {
      values: Array.isArray(embedding) ? embedding : [],
    },
  };
}

async function runProvider(provider: AiProvider, action: AiAction, payload: AiProxyPayload) {
  if (provider === 'gemini') {
    if (action === 'embedContent') return embedWithGemini(payload);
    return generateWithGemini(payload);
  }

  if (action === 'embedContent') return embedWithOpenAi(payload);
  return generateWithOpenAi(payload);
}

async function runWithFallback(action: AiAction, payload: AiProxyPayload) {
  const errors: string[] = [];
  for (const provider of providerSequence(payload)) {
    try {
      const response = await runProvider(provider, action, payload);
      return { provider, response };
    } catch (error) {
      errors.push(`${provider}: ${error instanceof Error ? error.message : 'failed'}`);
    }
  }
  throw new Error(errors.join('; ') || 'AI provider failed');
}

async function streamWithFallback(payload: AiProxyPayload, controller: ReadableStreamDefaultController<Uint8Array>) {
  const encoder = new TextEncoder();
  const errors: string[] = [];

  for (const provider of providerSequence(payload)) {
    try {
      if (provider === 'gemini') {
        const ai = getGeminiClient();
        const response = await ai.models.generateContentStream({
          model: modelFor('gemini', 'generateContent', payload.model),
          contents: payload.contents as never,
          config: getConfig(payload),
        });

        for await (const chunk of response) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({
              provider,
              text: chunk.text ?? '',
              candidates: chunk.candidates ?? [],
            })}\n\n`),
          );
        }
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        return;
      }

      const response = await generateWithOpenAi(payload);
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({
          provider,
          ...response,
        })}\n\n`),
      );
      controller.enqueue(encoder.encode('data: [DONE]\n\n'));
      return;
    } catch (error) {
      errors.push(`${provider}: ${error instanceof Error ? error.message : 'failed'}`);
    }
  }

  throw new Error(errors.join('; ') || 'AI stream provider failed');
}


Deno.serve(async (req) => {
  const origin = req.headers.get('origin');

  // CORS preflight
  if (req.method === 'OPTIONS') {
    if (!isOriginAllowed(origin)) {
      return json({ error: 'Origin not allowed' }, { status: 403 }, origin);
    }
    return new Response(null, { headers: corsHeaders(origin), status: 204 });
  }

  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 }, origin);
  }

  // Origin check for actual requests
  if (origin && !isOriginAllowed(origin)) {
    return json({ error: 'Origin not allowed' }, { status: 403 }, origin);
  }

  // Authentication: require a valid Supabase JWT
  const token = extractBearerToken(req);
  if (!token) {
    return json({ error: 'Missing Authorization bearer token' }, { status: 401 }, origin);
  }

  const jwt = await validateJwt(token);
  if (!jwt) {
    return json({ error: 'Invalid or expired token' }, { status: 401 }, origin);
  }

  // Rate limiting (per user, fallback to IP)
  const rl = rateLimit(req, jwt.sub);
  if (rl) return rl;

  let payload: AiProxyPayload;
  try {
    payload = await req.json();
  } catch {
    return json({ error: 'Invalid JSON body' }, { status: 400 }, origin);
  }

  const action = payload.action;
  if (!action) {
    return json({ error: 'Missing action' }, { status: 400 }, origin);
  }

  try {
    switch (action) {
      case 'generateContent':
      case 'embedContent': {
        const result = await runWithFallback(action, payload);
        return json({ provider: result.provider, ...(result.response as Record<string, unknown>) }, {}, origin);
      }

      case 'streamGenerateContent': {
        const stream = new ReadableStream({
          async start(controller) {
            const encoder = new TextEncoder();
            try {
              await streamWithFallback(payload, controller);
              controller.close();
            } catch (error) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({
                  error: error instanceof Error ? error.message : 'Stream failed',
                })}\n\n`),
              );
              controller.close();
            }
          },
        });

        return new Response(stream, {
          headers: {
            ...corsHeaders(origin),
            'content-type': 'text/event-stream; charset=utf-8',
            'cache-control': 'no-cache',
            connection: 'keep-alive',
          },
        });
      }

      default:
        return json({ error: `Unsupported action: ${action}` }, { status: 400 }, origin);
    }
  } catch (error) {
    console.error('ai edge function error', error);
    return json(
      { error: error instanceof Error ? error.message : 'Internal error' },
      { status: 500 },
      origin,
    );
  }
});
