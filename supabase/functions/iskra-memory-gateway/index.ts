import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import postgres from "npm:postgres@3.4.5";
import { jwtVerify } from "jsr:@panva/jose";

type Json = Record<string, unknown>;
type RouteHandler = (body: Json, actor: string) => Promise<unknown>;

const dbUrl = Deno.env.get("SUPABASE_DB_POOLER_URL") ?? Deno.env.get("SUPABASE_DB_URL");
if (!dbUrl) throw new Error("SUPABASE_DB_POOLER_URL or SUPABASE_DB_URL is not configured");

const poolMaxRaw = Number(Deno.env.get("SUPABASE_DB_POOL_MAX") ?? "2");
const poolMax = Number.isInteger(poolMaxRaw) && poolMaxRaw > 0 && poolMaxRaw <= 4 ? poolMaxRaw : 2;

const sql = postgres(dbUrl, {
  prepare: false,
  idle_timeout: 10,
  max_lifetime: 60 * 5,
  max: poolMax,
});

function allowedOrigins(): string[] {
  return (Deno.env.get("ISKRA_GATEWAY_ALLOWED_ORIGINS") ?? "https://chatgpt.com")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function corsHeaders(req: Request): HeadersInit {
  const origin = req.headers.get("origin") ?? "";
  const allowlist = allowedOrigins();
  const allowed = origin && allowlist.includes(origin) ? origin : allowlist[0] ?? "https://chatgpt.com";

  return {
    "access-control-allow-origin": allowed,
    "access-control-allow-headers": "authorization, x-client-info, apikey, content-type",
    "access-control-allow-methods": "POST, OPTIONS",
    "vary": "Origin",
    "content-type": "application/json",
  };
}

function json(req: Request, body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: corsHeaders(req),
  });
}

function routeName(pathname: string): string {
  const parts = pathname.split("/").filter(Boolean);
  const last = parts.at(-1) ?? "";
  const previous = parts.at(-2) ?? "";
  if (["write", "search", "promote", "crystallize", "propose"].includes(last)) {
    return `${previous}/${last}`;
  }
  return last;
}

// SECURITY: this gateway is called server-to-server (ChatGPT Projects backend),
// not from a browser user session, so identity is a static service_role/anon
// project key rather than a Supabase Auth user session. Those static keys are
// HS256-signed JWTs verifiable against the project's legacy JWT secret; they
// cannot be validated via the /auth/v1/user endpoint (that endpoint expects a
// user session JWT, not a project key). Do NOT rely solely on the platform
// `verify_jwt` function setting for identity binding — verify the signature
// independently here.
//
// [HYP] Role scope is intentionally NOT restricted to service_role yet: the
// actual Authorization value sent by the live ChatGPT Projects connector has
// not been confirmed (custom GPT Actions/connectors may not forward a
// service_role-signed token). Once that is verified, tighten this to require
// role === "service_role" to match the Postgres grants in
// supabase/migrations/20260709190000_iskra_memory_gateway_rpc_contract.sql.
const JWT_SECRET_RAW = Deno.env.get("SUPABASE_JWT_SECRET") ?? "";
const JWT_SECRET_KEY = JWT_SECRET_RAW ? new TextEncoder().encode(JWT_SECRET_RAW) : null;

async function verifyActor(authHeader: string | null): Promise<string> {
  const token = authHeader?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) throw new Error("missing_authorization_bearer");
  if (!JWT_SECRET_KEY) throw new Error("jwt_secret_not_configured");

  let claims: Json;
  try {
    const verified = await jwtVerify(token, JWT_SECRET_KEY, { algorithms: ["HS256"] });
    claims = verified.payload as Json;
  } catch {
    throw new Error("invalid_authorization_jwt");
  }

  const role = typeof claims.role === "string" ? claims.role : "unknown";
  const subject = typeof claims.sub === "string" ? claims.sub : "";
  const ref = typeof claims.ref === "string" ? claims.ref : "";
  const stableId = subject || ref || role;
  return `jwt:${role}:${stableId}`;
}

function withoutClientActor(body: Json): Json {
  const { actor: _actor, ...rest } = body;
  return rest;
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function boundedLimit(value: unknown, fallback = 20, max = 100): number {
  return Number.isInteger(value) && (value as number) > 0 ? Math.min(value as number, max) : fallback;
}

function cleanError(error: unknown): string {
  let message: string;
  if (error instanceof Error) {
    message = error.message;
  } else {
    try {
      message = typeof error === "object" && error !== null ? JSON.stringify(error) : String(error);
    } catch {
      message = String(error);
    }
  }
  return String(message ?? "unknown_error")
    .replace(/sk-[A-Za-z0-9_-]+/g, "[redacted-openai-key]")
    .replace(/sb_secret_[A-Za-z0-9_-]+/g, "[redacted-supabase-secret]")
    .replace(/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g, "[redacted-jwt]")
    .slice(0, 500);
}

async function observe(body: Json, actor: string): Promise<unknown> {
  const safeBody = withoutClientActor(body);
  const payload = safeBody.route_mode === "dry-run" ? { ...safeBody, mode: "dry_run" }
    : safeBody.route_mode === "dark-run" ? { ...safeBody, mode: "dark_run" }
    : safeBody;

  const rows = await sql`
    select iskra_memory.iskra_project_observe(${sql.json(payload)}::jsonb, ${actor}) as result
  `;
  return rows[0]?.result;
}

async function commit(body: Json, actor: string): Promise<unknown> {
  if (typeof body.snapshot_id !== "string") throw new Error("snapshot_id_required");

  const rows = await sql`
    select iskra_memory.iskra_project_commit(
      ${body.snapshot_id}::uuid,
      ${sql.json((body.delta ?? {}) as Json)}::jsonb,
      ${actor}
    ) as result
  `;
  return rows[0]?.result;
}

async function horizonPropose(body: Json, actor: string): Promise<unknown> {
  const rows = await sql`
    select iskra_memory.iskra_project_horizon_propose(${sql.json(withoutClientActor(body))}::jsonb, ${actor}) as result
  `;
  return rows[0]?.result;
}

async function memoryWrite(body: Json, actor: string): Promise<unknown> {
  if (typeof body.container !== "string") throw new Error("container_required");

  const rows = await sql`
    select iskra_memory.iskra_memory_write(
      ${body.container},
      ${sql.json((body.payload ?? {}) as Json)}::jsonb,
      ${actor}
    ) as result
  `;
  return rows[0]?.result;
}

async function memorySearch(body: Json): Promise<unknown> {
  const containers = Array.isArray(body.containers) ? stringArray(body.containers) : null;
  const limit = boundedLimit(body.limit);

  const rows = await sql`
    select iskra_memory.iskra_memory_search(
      ${typeof body.query === "string" ? body.query : null},
      ${containers}::text[],
      ${limit}::integer
    ) as result
  `;
  return rows[0]?.result;
}

async function shadowPromote(body: Json, actor: string): Promise<unknown> {
  if (typeof body.shadow_id !== "string") throw new Error("shadow_id_required");
  if (typeof body.claim !== "string") throw new Error("claim_required");
  if (typeof body.source_surface !== "string") throw new Error("source_surface_required");

  const trustLevel = typeof body.trust_level === "number" && Number.isFinite(body.trust_level)
    ? body.trust_level
    : 0.85;

  const rows = await sql`
    select iskra_memory.iskra_memory_promote_shadow(
      ${body.shadow_id}::uuid,
      ${body.claim},
      ${sql.json((body.evidence ?? {}) as Json)}::jsonb,
      ${body.source_surface},
      ${actor},
      ${typeof body.decision_link === "string" ? body.decision_link : null},
      ${stringArray(body.tags)}::text[],
      ${trustLevel}::numeric
    ) as result
  `;
  return rows[0]?.result;
}

async function dreamCrystallize(body: Json, actor: string): Promise<unknown> {
  if (typeof body.dream_seed_id !== "string") throw new Error("dream_seed_id_required");
  if (typeof body.target !== "string") throw new Error("target_required");

  const rows = await sql`
    select iskra_memory.iskra_memory_crystallize_dream(
      ${body.dream_seed_id}::uuid,
      ${body.target},
      ${actor},
      ${sql.json(stringArray(body.evidence_refs))}::jsonb,
      ${typeof body.claim === "string" ? body.claim : null},
      ${typeof body.source_surface === "string" ? body.source_surface : null},
      ${typeof body.decision_link === "string" ? body.decision_link : null},
      ${typeof body.iskriv_check === "string" ? body.iskriv_check : null}
    ) as result
  `;
  return rows[0]?.result;
}

const routes: Record<string, RouteHandler> = {
  "observe": observe,
  "dry-run": (body, actor) => observe({ ...body, route_mode: "dry-run" }, actor),
  "dark-run": (body, actor) => observe({ ...body, route_mode: "dark-run" }, actor),
  "commit": commit,
  "horizon/propose": horizonPropose,
  "memory/write": memoryWrite,
  "memory/search": (body) => memorySearch(body),
  "shadow/promote": shadowPromote,
  "dream/crystallize": dreamCrystallize,
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders(req) });
  if (req.method !== "POST") return json(req, { ok: false, error: "method_not_allowed" }, 405);

  // Verify the JWT signature before touching the body or routing, so an
  // unauthenticated caller cannot reach any handler. (Role is not yet gated
  // here — see the [HYP] note on verifyActor above.)
  let actor: string;
  try {
    actor = await verifyActor(req.headers.get("authorization"));
  } catch (error) {
    const message = error instanceof Error ? error.message : "unauthorized";
    return json(req, { ok: false, error: message }, 401);
  }

  const body = await req.json().catch(() => null) as Json | null;
  if (!body) return json(req, { ok: false, error: "invalid_json" }, 400);

  const route = routeName(new URL(req.url).pathname);
  const handler = routes[route];

  if (!handler) {
    return json(req, {
      ok: false,
      error: "route_not_found",
      service: "iskra-memory-gateway",
      surface: "chatgpt_projects",
      routes: Object.keys(routes),
    }, 404);
  }

  try {
    const result = await handler(body, actor);
    return json(req, result ?? { ok: true });
  } catch (error) {
    return json(req, {
      ok: false,
      error: "gateway_failed",
      detail: cleanError(error),
    }, 500);
  }
});
