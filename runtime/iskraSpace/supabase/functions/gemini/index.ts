import { GoogleGenAI } from 'npm:@google/genai@1.34.0';
import {
  AI_EDGE_INGRESS_IP_HEADER_ENV,
  AI_RATE_LIMIT_IP_HMAC_SECRET_ENV,
  buildCorsHeaders,
  enforceAiRequestBoundary,
  isAllowedOrigin,
  parseVerifiedAiUser,
  type AiBoundaryConfig,
  type VerifiedAiUser,
} from '../_shared/aiBoundary.ts';
import {
  CANONICAL_GEMINI_TEXT_MODEL,
  MAX_AI_PROVIDER_TIMEOUT_MS,
  MAX_AI_STREAM_BYTES,
  MAX_AI_STREAM_DURATION_MS,
  createDeadline,
  readBoundedJsonBody,
  validateGeminiRequest,
  type ValidatedGeminiRequest,
} from '../_shared/aiContentPolicy.ts';

const EMBEDDING_DIMENSIONS = 1536;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_API_KEY = Deno.env.get('SUPABASE_ANON_KEY') ?? Deno.env.get('SUPABASE_PUBLISHABLE_KEY') ?? '';
const EDGE_ENVIRONMENT = Deno.env.get('AI_EDGE_ENV') ?? 'production';
const ALLOW_DEVELOPMENT_WILDCARD = Deno.env.get('AI_EDGE_ALLOW_DEV_WILDCARD') === 'true';
const IP_HMAC_SECRET = Deno.env.get(AI_RATE_LIMIT_IP_HMAC_SECRET_ENV) ?? '';
const CANONICAL_INGRESS_HEADER = Deno.env.get(AI_EDGE_INGRESS_IP_HEADER_ENV) ?? '';
const AI_EDGE_TEST_MODE = Deno.env.get('AI_EDGE_TEST_MODE') === 'true';

function boundaryConfig(): AiBoundaryConfig {
  return {
    supabaseUrl: SUPABASE_URL,
    supabaseApiKey: SUPABASE_API_KEY,
    allowedOrigins: Deno.env.get('AI_PROXY_ALLOWED_ORIGINS') ?? '',
    environment: EDGE_ENVIRONMENT,
    allowDevelopmentWildcard: ALLOW_DEVELOPMENT_WILDCARD,
    ipHmacSecret: IP_HMAC_SECRET,
    canonicalIngressHeader: CANONICAL_INGRESS_HEADER,
  };
}

function corsHeaders(origin: string | null): Record<string, string> {
  return buildCorsHeaders(origin, boundaryConfig());
}

function json(body: unknown, init: ResponseInit = {}, origin: string | null = null): Response {
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
  const auth = req.headers.get('authorization');
  if (!auth) return null;
  const [scheme, token] = auth.split(' ');
  return scheme?.toLowerCase() === 'bearer' && token ? token : null;
}

async function validateJwt(token: string, parentSignal: AbortSignal): Promise<VerifiedAiUser | null> {
  if (!SUPABASE_URL || !SUPABASE_API_KEY) return null;
  const deadline = createDeadline(parentSignal, MAX_AI_PROVIDER_TIMEOUT_MS);
  try {
    const response = await fetch(`${SUPABASE_URL.replace(/\/$/, '')}/auth/v1/user`, {
      method: 'GET',
      headers: {
        authorization: `Bearer ${token}`,
        apikey: SUPABASE_API_KEY,
      },
      signal: deadline.signal,
    });
    return response.ok ? parseVerifiedAiUser(await response.json()) : null;
  } catch {
    return null;
  } finally {
    deadline.dispose();
  }
}

function getGeminiClient(): GoogleGenAI {
  if (AI_EDGE_TEST_MODE) throw new Error('provider_upstream_disabled');
  const apiKey = Deno.env.get('GEMINI_API_KEY');
  if (!apiKey) throw new Error('provider_not_configured');
  return new GoogleGenAI({ apiKey });
}

function generationConfig(payload: ValidatedGeminiRequest, signal: AbortSignal) {
  return {
    ...payload.generationConfig,
    ...(payload.systemInstruction ? { systemInstruction: payload.systemInstruction } : {}),
    abortSignal: signal,
  };
}

async function generate(payload: ValidatedGeminiRequest, parentSignal: AbortSignal) {
  const deadline = createDeadline(parentSignal, MAX_AI_PROVIDER_TIMEOUT_MS);
  try {
    const response = await getGeminiClient().models.generateContent({
      model: CANONICAL_GEMINI_TEXT_MODEL,
      contents: payload.contents ?? [],
      config: generationConfig(payload, deadline.signal),
    });
    return {
      provider: 'gemini',
      text: response.text ?? '',
      candidates: response.candidates ?? [],
    };
  } finally {
    deadline.dispose();
  }
}

async function embed(payload: ValidatedGeminiRequest, parentSignal: AbortSignal) {
  const deadline = createDeadline(parentSignal, MAX_AI_PROVIDER_TIMEOUT_MS);
  try {
    const response = await getGeminiClient().models.embedContent({
      model: payload.model,
      contents: payload.content ?? { role: 'user', parts: [] },
      config: {
        outputDimensionality: EMBEDDING_DIMENSIONS,
        abortSignal: deadline.signal,
      },
    });
    const result = response as {
      embedding?: { values?: unknown };
      embeddings?: Array<{ values?: unknown }>;
    };
    const values = result.embedding?.values ?? result.embeddings?.[0]?.values;
    return {
      provider: 'gemini',
      embedding: { values: Array.isArray(values) ? values : [] },
    };
  } finally {
    deadline.dispose();
  }
}

function stream(payload: ValidatedGeminiRequest, parentSignal: AbortSignal): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  let activeDeadline: ReturnType<typeof createDeadline> | null = null;

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      const deadline = createDeadline(parentSignal, MAX_AI_STREAM_DURATION_MS);
      activeDeadline = deadline;
      let bytes = 0;

      const enqueue = (value: string): boolean => {
        const chunk = encoder.encode(value);
        if (bytes + chunk.byteLength > MAX_AI_STREAM_BYTES) {
          deadline.abort();
          return false;
        }
        bytes += chunk.byteLength;
        controller.enqueue(chunk);
        return true;
      };

      try {
        const response = await getGeminiClient().models.generateContentStream({
          model: CANONICAL_GEMINI_TEXT_MODEL,
          contents: payload.contents ?? [],
          config: generationConfig(payload, deadline.signal),
        });

        for await (const chunk of response) {
          if (deadline.signal.aborted) throw new DOMException('stream deadline exceeded', 'AbortError');
          const accepted = enqueue(`data: ${JSON.stringify({
            provider: 'gemini',
            text: chunk.text ?? '',
            candidates: chunk.candidates ?? [],
          })}\n\n`);
          if (!accepted) throw new DOMException('stream byte cap exceeded', 'AbortError');
        }

        enqueue('data: [DONE]\n\n');
      } catch {
        if (!deadline.signal.aborted) {
          enqueue(`data: ${JSON.stringify({ error: 'stream_upstream_unavailable' })}\n\n`);
        }
      } finally {
        deadline.abort();
        deadline.dispose();
        activeDeadline = null;
        controller.close();
      }
    },
    cancel() {
      activeDeadline?.abort();
      activeDeadline?.dispose();
      activeDeadline = null;
    },
  });
}

Deno.serve(async (req) => {
  const origin = req.headers.get('origin');
  const config = boundaryConfig();

  if (req.method === 'OPTIONS') {
    if (!isAllowedOrigin(origin, config)) {
      return json({ error: 'origin_not_allowed' }, { status: 403 }, origin);
    }
    return new Response(null, { status: 204, headers: corsHeaders(origin) });
  }
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, { status: 405 }, origin);
  if (!isAllowedOrigin(origin, config)) return json({ error: 'origin_not_allowed' }, { status: 403 }, origin);

  const token = extractBearerToken(req);
  if (!token) return json({ error: 'missing_bearer_token' }, { status: 401 }, origin);
  const jwt = await validateJwt(token, req.signal);
  if (!jwt) return json({ error: 'invalid_or_expired_token' }, { status: 401 }, origin);

  // Malformed or unsafe requests are rejected before a beta quota is consumed.
  const body = await readBoundedJsonBody(req);
  if (!body.ok) return json({ error: body.code }, { status: body.status }, origin);
  const payload = validateGeminiRequest(body.value.body);
  if (!payload.ok) return json({ error: payload.code }, { status: payload.status }, origin);

  const boundary = await enforceAiRequestBoundary(req, token, jwt, config);
  if (!boundary.allowed) return json({ error: boundary.error }, { status: boundary.status }, origin);

  try {
    if (payload.value.action === 'generateContent') {
      return json(await generate(payload.value, req.signal), {}, origin);
    }
    if (payload.value.action === 'embedContent') {
      return json(await embed(payload.value, req.signal), {}, origin);
    }

    return new Response(stream(payload.value, req.signal), {
      headers: {
        ...corsHeaders(origin),
        'content-type': 'text/event-stream; charset=utf-8',
        'cache-control': 'no-cache, no-store',
        connection: 'keep-alive',
      },
    });
  } catch {
    return json({ error: 'provider_upstream_unavailable' }, { status: 502 }, origin);
  }
});
