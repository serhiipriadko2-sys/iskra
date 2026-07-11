import {
  AI_RATE_LIMIT_IP_HMAC_SECRET_ENV,
  buildCorsHeaders,
  enforceAiRequestBoundary,
  parseVerifiedAiUser,
  isAllowedOrigin,
  type AiBoundaryConfig,
  type VerifiedAiUser,
} from '../_shared/aiBoundary.ts';

type IskraAgentRequest = {
  message?: string;
  input?: unknown;
  route?: string;
  phase?: string;
  request_id?: string;
  context?: Record<string, unknown>;
};

type IskraAgentResponse = {
  reply: string;
  status: "ok" | "partial" | "blocked" | "error";
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

const AGENT_API_BASE_ENV = Deno.env.get("AGENT_API_BASE") ?? "https://api.chatgpt.com/v1/workspace_agents";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_API_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ?? "";
const EDGE_ENVIRONMENT = Deno.env.get("AI_EDGE_ENV") ?? "production";
const ALLOW_DEVELOPMENT_WILDCARD = Deno.env.get("AI_EDGE_ALLOW_DEV_WILDCARD") === "true";
const IP_HMAC_SECRET = Deno.env.get(AI_RATE_LIMIT_IP_HMAC_SECRET_ENV) ?? "";

function boundaryConfig(): AiBoundaryConfig {
  return {
    supabaseUrl: SUPABASE_URL,
    supabaseApiKey: SUPABASE_API_KEY,
    allowedOrigins: Deno.env.get("ISKRA_AGENT_ALLOWED_ORIGINS") ?? "",
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

function json(body: unknown, init: ResponseInit = {}, origin: string | null = null): Response {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      ...corsHeaders(origin),
      "content-type": "application/json",
      ...(init.headers ?? {}),
    },
  });
}

function extractBearerToken(req: Request): string | null {
  const auth = req.headers.get("authorization") ?? req.headers.get("Authorization");
  if (!auth) return null;
  const [scheme, token] = auth.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) return null;
  return token;
}

async function validateJwt(token: string): Promise<VerifiedAiUser | null> {
  if (!SUPABASE_URL || !SUPABASE_API_KEY) return null;

  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      method: "GET",
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

function requestId(): string {
  return crypto.randomUUID();
}

function normalizePayload(payload: IskraAgentRequest, userId: string | null): Record<string, unknown> {
  return {
    mode: "iskraSpace",
    route: payload.route ?? "chat",
    phase: payload.phase ?? "runtime",
    request_id: payload.request_id ?? requestId(),
    message: payload.message ?? payload.input ?? "",
    user_id: userId,
    context: {
      sift: true,
      delta_receipt: true,
      ...(payload.context ?? {}),
    },
  };
}

function normalizeAgentResponse(raw: unknown, fallbackRequestId: string): IskraAgentResponse {
  const source = raw && typeof raw === "object" ? raw as Record<string, unknown> : {};
  const trace = source.trace && typeof source.trace === "object" ? source.trace as Record<string, unknown> : {};

  const replyCandidate = source.reply ?? source.output_text ?? source.message ?? source.content;
  const statusCandidate = source.status;

  return {
    reply: typeof replyCandidate === "string" ? replyCandidate : JSON.stringify(raw),
    status: statusCandidate === "partial" || statusCandidate === "blocked" || statusCandidate === "error" ? statusCandidate : "ok",
    actions: Array.isArray(source.actions) ? source.actions : [],
    trace: {
      facts: Array.isArray(trace.facts) ? trace.facts : [],
      hypotheses: Array.isArray(trace.hypotheses) ? trace.hypotheses : [],
      risks: Array.isArray(trace.risks) ? trace.risks : [],
    },
    delta: source.delta && typeof source.delta === "object" ? source.delta as Record<string, unknown> : {},
    artifact_receipt: source.artifact_receipt && typeof source.artifact_receipt === "object"
      ? source.artifact_receipt as Record<string, unknown>
      : null,
    request_id: typeof source.request_id === "string" ? source.request_id : fallbackRequestId,
  };
}

Deno.serve(async (req) => {
  const origin = req.headers.get("origin");

  if (req.method === "OPTIONS") {
    if (!isOriginAllowed(origin)) {
      return json({ error: "Origin not allowed" }, { status: 403 }, origin);
    }
    return new Response(null, { status: 204, headers: corsHeaders(origin) });
  }

  if (req.method !== "POST") {
    return json({ error: "method_not_allowed" }, { status: 405 }, origin);
  }

  if (!isOriginAllowed(origin)) {
    return json({ error: "Origin not allowed" }, { status: 403 }, origin);
  }

  const token = extractBearerToken(req);
  if (!token) {
    return json({ error: "Missing Authorization bearer token" }, { status: 401 }, origin);
  }

  const jwt = await validateJwt(token);
  if (!jwt) {
    return json({ error: "Invalid or expired token" }, { status: 401 }, origin);
  }

  const agentId = Deno.env.get("AGENT_ID");
  const agentToken = Deno.env.get("AGENT_ACCESS_TOKEN");

  if (!agentId || !agentToken) {
    return json({ error: "agent_not_configured" }, { status: 500 }, origin);
  }

  const payload = await req.json().catch(() => null) as IskraAgentRequest | null;
  if (!payload || typeof payload !== "object") {
    return json({ error: "invalid_json" }, { status: 400 }, origin);
  }

  const input = normalizePayload(payload, jwt.sub);
  const rid = typeof input.request_id === "string" ? input.request_id : requestId();

  const boundary = await enforceAiRequestBoundary(req, token, jwt, boundaryConfig());
  if (!boundary.allowed) {
    return json({ error: boundary.error }, { status: boundary.status }, origin);
  }

  try {
    const agentResponse = await fetch(`${AGENT_API_BASE_ENV}/${agentId}/trigger`, {
      method: "POST",
      headers: {
        "authorization": `Bearer ${agentToken}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ input }),
    });

    const raw = await agentResponse.json().catch(() => ({}));

    if (!agentResponse.ok) {
      return json({
        reply: "Agent API request failed.",
        status: "error",
        actions: [],
        trace: { facts: [], hypotheses: [], risks: ["upstream_unavailable"] },
        delta: {},
        artifact_receipt: null,
        request_id: rid,
      }, { status: 502 }, origin);
    }

    return json(normalizeAgentResponse(raw, rid), {}, origin);
  } catch {
    return json({ error: "agent_upstream_unavailable" }, { status: 502 }, origin);
  }
});
