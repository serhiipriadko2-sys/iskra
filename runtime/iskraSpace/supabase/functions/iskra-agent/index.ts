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
  MAX_AI_PROVIDER_TIMEOUT_MS,
  createDeadline,
  readBoundedJsonBody,
  validateAgentRequest,
  type ValidatedAgentRequest,
} from '../_shared/aiContentPolicy.ts';

type IskraAgentResponse = {
  reply: string;
  status: 'ok' | 'partial' | 'blocked' | 'error';
  actions: unknown[];
  trace: {
    facts: unknown[];
    hypotheses: unknown[];
    risks: unknown[];
  };
  delta: Record<string, unknown>;
  artifact_receipt: Record<string, unknown> | null;
  request_id: string;
};

const CANONICAL_WORKSPACE_AGENT_ORIGIN = 'https://api.chatgpt.com';
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
    allowedOrigins: Deno.env.get('ISKRA_AGENT_ALLOWED_ORIGINS') ?? '',
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

function requestId(): string {
  return crypto.randomUUID();
}

function buildAgentTarget(agentId: string): URL | null {
  if (!/^[A-Za-z0-9_-]{1,128}$/.test(agentId)) return null;
  const target = new URL(
    `/v1/workspace_agents/${encodeURIComponent(agentId)}/trigger`,
    CANONICAL_WORKSPACE_AGENT_ORIGIN,
  );
  if (target.origin !== CANONICAL_WORKSPACE_AGENT_ORIGIN) return null;
  return target;
}

function normalizePayload(payload: ValidatedAgentRequest, userId: string, rid: string): Record<string, unknown> {
  return {
    mode: 'iskraSpace',
    route: payload.route,
    phase: 'runtime',
    request_id: rid,
    message: payload.message,
    user_id: userId,
    context: {
      sift: true,
      delta_receipt: true,
    },
  };
}

function normalizeAgentResponse(raw: unknown, fallbackRequestId: string): IskraAgentResponse {
  const source = raw && typeof raw === 'object' ? raw as Record<string, unknown> : {};
  const trace = source.trace && typeof source.trace === 'object' ? source.trace as Record<string, unknown> : {};
  const replyCandidate = source.reply ?? source.output_text ?? source.message ?? source.content;
  const statusCandidate = source.status;

  return {
    reply: typeof replyCandidate === 'string' ? replyCandidate : JSON.stringify(raw),
    status: statusCandidate === 'partial' || statusCandidate === 'blocked' || statusCandidate === 'error'
      ? statusCandidate
      : 'ok',
    actions: Array.isArray(source.actions) ? source.actions : [],
    trace: {
      facts: Array.isArray(trace.facts) ? trace.facts : [],
      hypotheses: Array.isArray(trace.hypotheses) ? trace.hypotheses : [],
      risks: Array.isArray(trace.risks) ? trace.risks : [],
    },
    delta: source.delta && typeof source.delta === 'object' ? source.delta as Record<string, unknown> : {},
    artifact_receipt: source.artifact_receipt && typeof source.artifact_receipt === 'object'
      ? source.artifact_receipt as Record<string, unknown>
      : null,
    request_id: typeof source.request_id === 'string' ? source.request_id : fallbackRequestId,
  };
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

  const body = await readBoundedJsonBody(req);
  if (!body.ok) return json({ error: body.code }, { status: body.status }, origin);
  const payload = validateAgentRequest(body.value.body);
  if (!payload.ok) return json({ error: payload.code }, { status: payload.status }, origin);

  const boundary = await enforceAiRequestBoundary(req, token, jwt, config);
  if (!boundary.allowed) return json({ error: boundary.error }, { status: boundary.status }, origin);

  const agentId = Deno.env.get('AGENT_ID') ?? '';
  const agentToken = Deno.env.get('AGENT_ACCESS_TOKEN') ?? '';
  const target = buildAgentTarget(agentId);
  if (!target) return json({ error: 'agent_target_not_allowed' }, { status: 500 }, origin);
  if (!agentToken) return json({ error: 'agent_not_configured' }, { status: 500 }, origin);
  if (AI_EDGE_TEST_MODE) return json({ error: 'provider_upstream_disabled' }, { status: 503 }, origin);

  const rid = requestId();
  const deadline = createDeadline(req.signal, MAX_AI_PROVIDER_TIMEOUT_MS);
  try {
    const response = await fetch(target, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${agentToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({ input: normalizePayload(payload.value, jwt.sub, rid) }),
      signal: deadline.signal,
    });
    const raw = await response.json().catch(() => ({}));
    if (!response.ok) {
      return json({
        reply: 'Agent API request failed.',
        status: 'error',
        actions: [],
        trace: { facts: [], hypotheses: [], risks: ['upstream_unavailable'] },
        delta: {},
        artifact_receipt: null,
        request_id: rid,
      }, { status: 502 }, origin);
    }
    return json(normalizeAgentResponse(raw, rid), {}, origin);
  } catch {
    return json({ error: 'agent_upstream_unavailable' }, { status: 502 }, origin);
  } finally {
    deadline.dispose();
  }
});
