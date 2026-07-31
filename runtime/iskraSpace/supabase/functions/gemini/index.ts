import { GoogleGenAI } from 'npm:@google/genai@1.34.0';
import {
  AI_RATE_LIMIT_IP_HMAC_SECRET_ENV,
  buildCorsHeaders,
  enforceAiRequestBoundary,
  fetchVerifiedAiUser,
  isAllowedOrigin,
  type AiBoundaryConfig,
} from '../_shared/aiBoundary.ts';
import {
  MAX_AI_AUTH_QUOTA_TIMEOUT_MS,
  MAX_AI_PROVIDER_TIMEOUT_MS,
  MAX_AI_REQUEST_DURATION_MS,
  MAX_AI_STREAM_BYTES,
  MAX_AI_STREAM_DURATION_MS,
  createDeadline,
  readBoundedJsonBody,
} from '../_shared/aiContentPolicy.ts';
import {
  createStreamByteBudget,
  encodeWithinStreamBudget,
} from '../_shared/aiProviderLimits.ts';

type AiProvider = 'gemini' | 'openai';
type RequestedProvider = AiProvider | 'auto';
type AiAction = 'generateContent' | 'streamGenerateContent' | 'embedContent';

type AiProxyPayload = {
  intent: 'text.generate' | 'text.stream' | 'embedding.generate';
  action: AiAction;
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

function getProviderConfig(payload: AiProxyPayload, signal: AbortSignal) {
  return { ...getConfig(payload), abortSignal: signal };
}

function abortError(message: string): DOMException {
  return new DOMException(message, 'AbortError');
}

function normalizeProvider(value: unknown, fallback: RequestedProvider): RequestedProvider {
  if (value === 'gemini' || value === 'openai' || value === 'auto') return value;
  return fallback;
}

function providerSequence(): AiProvider[] {
  const configured = normalizeProvider(Deno.env.get('AI_PROVIDER'), 'gemini');
  const fallback = normalizeProvider(Deno.env.get('AI_FALLBACK_PROVIDER'), 'auto');
  const primary: AiProvider = configured === 'auto' ? 'gemini' : configured;

  const providers: AiProvider[] = [primary];
  if (fallback !== 'auto' && fallback !== primary) providers.push(fallback);
  return providers;
}

function modelFor(provider: AiProvider, action: AiAction): string {
  if (provider === 'gemini') {
    if (action === 'embedContent') {
      return Deno.env.get('GEMINI_EMBEDDING_MODEL') || DEFAULT_GEMINI_EMBEDDING_MODEL;
    }
    return Deno.env.get('GEMINI_TEXT_MODEL') || DEFAULT_GEMINI_TEXT_MODEL;
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

async function openAiFetch(
  path: string,
  body: Record<string, unknown>,
  signal: AbortSignal,
): Promise<unknown> {
  const apiKey = Deno.env.get('OPENAI_API_KEY');
  if (!apiKey) throw new Error('OPENAI_API_KEY is not configured');

  const response = await fetch(`https://api.openai.com/v1/${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
    signal,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(`OpenAI ${path} failed with ${response.status}`);
  }
  return data;
}

async function generateWithGemini(payload: AiProxyPayload, signal: AbortSignal) {
  const ai = getGeminiClient();
  const response = await ai.models.generateContent({
    model: modelFor('gemini', 'generateContent'),
    contents: payload.contents as never,
    config: getProviderConfig(payload, signal),
  });

  return {
    text: response.text ?? '',
    candidates: response.candidates ?? [],
  };
}

async function generateWithOpenAi(payload: AiProxyPayload, signal: AbortSignal) {
  const input = inputFromContents(payload.contents);
  if (!input) throw new Error('Missing or invalid contents');

  const response = await openAiFetch('responses', {
    model: modelFor('openai', 'generateContent'),
    input,
    instructions: payload.systemInstruction || undefined,
    text: openAiTextConfig(payload),
  }, signal);
  return geminiTextResponse(extractOpenAiText(response));
}

async function embedWithGemini(payload: AiProxyPayload, signal: AbortSignal) {
  const ai = getGeminiClient();
  const response = await ai.models.embedContent({
    model: modelFor('gemini', 'embedContent'),
    contents: payload.content as never,
    config: {
      outputDimensionality: EMBEDDING_DIMENSIONS,
      abortSignal: signal,
    },
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

async function embedWithOpenAi(payload: AiProxyPayload, signal: AbortSignal) {
  const input = inputFromEmbeddingContent(payload.content);
  if (!input) throw new Error('Missing or invalid content');

  const response = await openAiFetch('embeddings', {
    model: modelFor('openai', 'embedContent'),
    input,
  }, signal);
  const embedding = (response as { data?: Array<{ embedding?: unknown }> }).data?.[0]?.embedding;
  return {
    embedding: {
      values: Array.isArray(embedding) ? embedding : [],
    },
  };
}

async function runProvider(
  provider: AiProvider,
  action: AiAction,
  payload: AiProxyPayload,
  signal: AbortSignal,
) {
  if (provider === 'gemini') {
    if (action === 'embedContent') return embedWithGemini(payload, signal);
    return generateWithGemini(payload, signal);
  }

  if (action === 'embedContent') return embedWithOpenAi(payload, signal);
  return generateWithOpenAi(payload, signal);
}

async function runWithFallback(
  action: AiAction,
  payload: AiProxyPayload,
  parentSignal: AbortSignal,
) {
  const deadline = createDeadline(parentSignal, MAX_AI_PROVIDER_TIMEOUT_MS);
  try {
    for (const provider of providerSequence()) {
      if (deadline.signal.aborted) throw abortError('provider deadline exceeded');
      try {
        const response = await runProvider(provider, action, payload, deadline.signal);
        return { provider, response };
      } catch (error) {
        if (parentSignal.aborted || deadline.signal.aborted) throw error;
      }
    }
    throw new Error('AI provider unavailable');
  } finally {
    deadline.abort();
    deadline.dispose();
  }
}

async function streamWithFallback(
  payload: AiProxyPayload,
  controller: ReadableStreamDefaultController<Uint8Array>,
  parentSignal: AbortSignal,
) {
  const encoder = new TextEncoder();
  const budget = createStreamByteBudget(MAX_AI_STREAM_BYTES);
  const deadline = createDeadline(parentSignal, MAX_AI_STREAM_DURATION_MS);

  const enqueue = (value: string): void => {
    const chunk = encodeWithinStreamBudget(value, budget, encoder);
    if (!chunk) {
      deadline.abort();
      throw abortError('stream byte cap exceeded');
    }
    controller.enqueue(chunk);
  };

  try {
    for (const provider of providerSequence()) {
      if (deadline.signal.aborted) throw abortError('stream deadline exceeded');
      const bytesBeforeAttempt = budget.used;

      try {
        if (provider === 'gemini') {
          const ai = getGeminiClient();
          const response = await ai.models.generateContentStream({
            model: modelFor('gemini', 'generateContent'),
            contents: payload.contents as never,
            config: getProviderConfig(payload, deadline.signal),
          });

          for await (const chunk of response) {
            if (deadline.signal.aborted) throw abortError('stream deadline exceeded');
            enqueue(`data: ${JSON.stringify({
              provider,
              text: chunk.text ?? '',
              candidates: chunk.candidates ?? [],
            })}\n\n`);
          }
          enqueue('data: [DONE]\n\n');
          return;
        }

        const response = await generateWithOpenAi(payload, deadline.signal);
        enqueue(`data: ${JSON.stringify({
          provider,
          ...response,
        })}\n\n`);
        enqueue('data: [DONE]\n\n');
        return;
      } catch (error) {
        const emittedBytes = budget.used > bytesBeforeAttempt;
        if (parentSignal.aborted || deadline.signal.aborted || emittedBytes) {
          throw error;
        }
      }
    }

    throw new Error('AI stream provider unavailable');
  } finally {
    deadline.abort();
    deadline.dispose();
  }
}

Deno.serve(async (req) => {
  const origin = req.headers.get('origin');

  if (req.method === 'OPTIONS') {
    if (!isOriginAllowed(origin)) {
      return json({ error: 'Origin not allowed' }, { status: 403 }, origin);
    }
    return new Response(null, { headers: corsHeaders(origin), status: 204 });
  }
  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 }, origin);
  }
  if (!isOriginAllowed(origin)) {
    return json({ error: 'Origin not allowed' }, { status: 403 }, origin);
  }

  const token = extractBearerToken(req);
  if (!token) {
    return json({ error: 'Missing Authorization bearer token' }, { status: 401 }, origin);
  }

  const config = boundaryConfig();
  const requestDeadline = createDeadline(req.signal, MAX_AI_REQUEST_DURATION_MS);
  let deadlineTransferredToStream = false;

  try {
    const authQuotaDeadline = createDeadline(
      requestDeadline.signal,
      MAX_AI_AUTH_QUOTA_TIMEOUT_MS,
    );
    let jwt;
    try {
      jwt = await fetchVerifiedAiUser(token, config, authQuotaDeadline.signal);
      if (!jwt) {
        const error = authQuotaDeadline.signal.aborted
          ? 'auth_quota_timeout'
          : 'Invalid or expired token';
        const status = authQuotaDeadline.signal.aborted ? 503 : 401;
        return json({ error }, { status }, origin);
      }

      const boundary = await enforceAiRequestBoundary(
        req,
        token,
        jwt,
        config,
        authQuotaDeadline.signal,
      );
      if (!boundary.allowed) {
        if (authQuotaDeadline.signal.aborted) {
          return json({ error: 'auth_quota_timeout' }, { status: 503 }, origin);
        }
        return json({ error: boundary.error }, { status: boundary.status }, origin);
      }
    } finally {
      authQuotaDeadline.abort();
      authQuotaDeadline.dispose();
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
          const result = await runWithFallback(
            action,
            payload,
            requestDeadline.signal,
          );
          return json(
            { provider: result.provider, ...(result.response as Record<string, unknown>) },
            {},
            origin,
          );
        }

        case 'streamGenerateContent': {
          const stream = new ReadableStream<Uint8Array>({
            async start(controller) {
              try {
                await streamWithFallback(payload, controller, requestDeadline.signal);
                controller.close();
              } catch (error) {
                if (!requestDeadline.signal.aborted) {
                  controller.error(
                    error instanceof Error ? error : new Error('AI stream failed'),
                  );
                }
              } finally {
                requestDeadline.abort();
                requestDeadline.dispose();
              }
            },
            cancel() {
              requestDeadline.abort();
              requestDeadline.dispose();
            },
          });

          const response = new Response(stream, {
            headers: {
              ...corsHeaders(origin),
              'content-type': 'text/event-stream; charset=utf-8',
              'cache-control': 'no-cache, no-store',
              connection: 'keep-alive',
            },
          });
          deadlineTransferredToStream = true;
          return response;
        }

        default:
          return json({ error: `Unsupported action: ${action}` }, { status: 400 }, origin);
      }
    } catch {
      return json({ error: 'AI provider unavailable' }, { status: 502 }, origin);
    }
  } finally {
    if (!deadlineTransferredToStream) {
      requestDeadline.abort();
      requestDeadline.dispose();
    }
  }
});
