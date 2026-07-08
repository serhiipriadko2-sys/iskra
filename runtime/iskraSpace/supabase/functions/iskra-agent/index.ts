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

const AGENT_API_BASE = "https://api.chatgpt.com/v1/workspace_agents";
const DEFAULT_ALLOWED_METHODS = "POST, OPTIONS";
function requestId(): string {
  return crypto.randomUUID();
}

function allowedOrigins(): string[] {
  const raw = Deno.env.get("ISKRA_AGENT_ALLOWED_ORIGINS") ?? "";
  return raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function corsHeaders(req: Request): HeadersInit {
  const origin = req.headers.get("origin") ?? "";
  const allowlist = allowedOrigins();
  const allowedOrigin = allowlist.includes(origin) ? origin : allowlist[0] ?? "";

  return {
    "access-control-allow-origin": allowedOrigin,
    "access-control-allow-headers": "authorization, x-client-info, apikey, content-type",
    "access-control-allow-methods": DEFAULT_ALLOWED_METHODS,
    "vary": "Origin",
  };
}

function json(req: Request, body: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      ...corsHeaders(req),
      "content-type": "application/json",
      ...(init.headers ?? {}),
    },
  });
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

async function readUserId(req: Request): Promise<string | null> {
  const authHeader = req.headers.get("authorization") ?? "";
  const jwt = authHeader.replace(/^Bearer\s+/i, "");
  if (!jwt) return null;

  try {
    const [, payload] = jwt.split(".");
    if (!payload) return null;
    const decoded = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    return typeof decoded.sub === "string" ? decoded.sub : null;
  } catch {
    return null;
  }
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
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders(req) });
  }

  if (req.method !== "POST") {
    return json(req, { error: "method_not_allowed" }, { status: 405 });
  }

  const agentId = Deno.env.get("AGENT_ID");
  const agentToken = Deno.env.get("AGENT_ACCESS_TOKEN");

  if (!agentId || !agentToken) {
    return json(req, { error: "agent_not_configured" }, { status: 500 });
  }

  const payload = await req.json().catch(() => null) as IskraAgentRequest | null;
  if (!payload || typeof payload !== "object") {
    return json(req, { error: "invalid_json" }, { status: 400 });
  }
  const userId = await readUserId(req);
  const input = normalizePayload(payload, userId);
  const rid = typeof input.request_id === "string" ? input.request_id : requestId();

  const agentResponse = await fetch(`${AGENT_API_BASE}/${agentId}/trigger`, {
    method: "POST",
    headers: {
      "authorization": `Bearer ${agentToken}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({ input }),
  });

  const raw = await agentResponse.json().catch(() => ({}));

  if (!agentResponse.ok) {
    return json(req, {
      reply: "Agent API request failed.",
      status: "error",
      actions: [],
      trace: { facts: [], hypotheses: [], risks: [raw] },
      delta: {},
      artifact_receipt: null,
      request_id: rid,
    }, { status: 502 });
  }

  return json(req, normalizeAgentResponse(raw, rid));
});
