import { GoogleGenAI } from 'npm:@google/genai@1.34.0';
import {
  AI_RATE_LIMIT_IP_HMAC_SECRET_ENV,
  buildCorsHeaders,
  enforceAiRequestBoundary,
  parseVerifiedAiUser,
  isAllowedOrigin,
  type AiBoundaryConfig,
  type VerifiedAiUser,
} from '../_shared/aiBoundary.ts';
import { readBoundedJsonBody } from '../_shared/aiContentPolicy.ts';

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

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_API_KEY = Deno.env.get('SUPABASE_ANON_KEY') ?? Deno.env.get('SUPABASE_PUBLISHABLE_KEY') ?? '';
const EDGE_ENVIRONMENT = Deno.env.get('AI_EDGE_ENV') ?? 'production';
const ALLOW_DEVELOPMENT_WILDCARD = Deno.env.get('AI_EDGE_ALLOW_DEV_WILDCARD') === 'true';
const IP_HMAC_SECRET = Deno.env.get(AI_RATE_LIMIT_IP_HMAC_SECRET_ENV) ?? '';

function boundaryConfig(): AiBoundaryConfig {
  return {
    supabaseUrl: SUPABASE_URL,
    supabaseApiKey: SUPABASE_API_KEY,
    allowedOrigins: Deno.env.get('AI_PROXY_ALLOWED_ORIGINS') ?? '',
    environment: EDGE_ENVIRONMENT,
    allowDevelopmentWildcard: ALLOW_DEVELOPMENT_WILDCARD,
    ipHmacSecret: IP_HMAC_SECRET,
  };
}

function isOriginAllowed(origin: string | null): boolean {
  return isAllowedOrigin(origin, boundaryConfig());
}

function corsHeaders(origin: string | null): Record<string, string> {
  return buildCorsHeaders(origin, boundaryConfig());
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

async function validateJwt(token: string): Promise<VerifiedAiUser | null> {
  if (!SUPABASE_URL || !SUPABASE_API_KEY) return null;

  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        apikey: SUPABASE_API_KEY,
      },
    });

    if (!res.ok) return null;

    return parseVerifiedAiUser(await res.json());
  } catch {
    return null;
  }
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
    throw new Error(`OpenAI ${path} failed with ${response.status}`);
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
  for (const provider of providerSequence(payload)) {
    try {
      const response = await runProvider(provider, action, payload);
      return { provider, response };
    } catch {}
  }
  throw new Error('AI provider unavailable');
}

async function streamWithFallback(payload: AiProxyPayload, controller: ReadableStreamDefaultController<Uint8Array>) {
  const encoder = new TextEncoder();

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
    } catch {}
  }

  throw new Error('AI stream provider unavailable');
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

  // The beta is browser-only: an absent origin is denied too.
  if (!isOriginAllowed(origin)) {
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

  // Membership and quota are security boundaries, not payload-dependent
  // validation. Run them before parsing or routing so inactive/anonymous
  // sessions cannot probe provider behavior through alternate error paths.
  const boundary = await enforceAiRequestBoundary(req, token, jwt, boundaryConfig());
  if (!boundary.allowed) {
    return json({ error: boundary.error }, { status: boundary.status }, origin);
  }

  const parsedBody = await readBoundedJsonBody(req);
  if (!parsedBody.ok) {
    return json({ error: parsedBody.code }, { status: parsedBody.status }, origin);
  }

  const payload = parsedBody.value.body as AiProxyPayload;
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
            } catch {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ error: 'Stream failed' })}\n\n`),
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
  } catch {
    return json(
      { error: 'AI provider unavailable' },
      { status: 502 },
      origin,
    );
  }
});
