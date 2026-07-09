import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import postgres from "npm:postgres@3.4.5";

type Json = Record<string, unknown>;
type RouteHandler = (body: Json, actor: string) => Promise<unknown>;

const dbUrl = Deno.env.get("SUPABASE_DB_URL");
if (!dbUrl) throw new Error("SUPABASE_DB_URL is not configured");

const sql = postgres(dbUrl, {
  prepare: false,
  idle_timeout: 10,
  max_lifetime: 60 * 5,
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

function asActor(body: Json): string {
  const candidate = body.actor;
  return typeof candidate === "string" && candidate.trim().length > 0
    ? candidate.trim()
    : "ISKRA_PROJECT";
}

function cleanError(error: unknown): string {
  const message = error instanceof Error ? error.message : JSON.stringify(error);
  return String(message ?? "unknown_error")
    .replace(/sk-[A-Za-z0-9_-]+/g, "[redacted-openai-key]")
    .replace(/sb_secret_[A-Za-z0-9_-]+/g, "[redacted-supabase-secret]")
    .replace(/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g, "[redacted-jwt]")
    .slice(0, 500);
}

async function observe(body: Json, actor: string): Promise<unknown> {
  const payload = body.route_mode === "dry-run" ? { ...body, mode: "dry_run" }
    : body.route_mode === "dark-run" ? { ...body, mode: "dark_run" }
    : body;

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
      ${sql.json(body.delta ?? {})}::jsonb,
      ${actor}
    ) as result
  `;
  return rows[0]?.result;
}

async function horizonPropose(body: Json, actor: string): Promise<unknown> {
  const rows = await sql`
    select iskra_memory.iskra_project_horizon_propose(${sql.json(body)}::jsonb, ${actor}) as result
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
  const containers = Array.isArray(body.containers) ? body.containers as string[] : null;
  const limit = typeof body.limit === "number" ? body.limit : 20;

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

  const rows = await sql`
    select iskra_memory.iskra_memory_promote_shadow(
      ${body.shadow_id}::uuid,
      ${body.claim},
      ${sql.json((body.evidence ?? {}) as Json)}::jsonb,
      ${body.source_surface},
      ${actor},
      ${typeof body.decision_link === "string" ? body.decision_link : null},
      ${Array.isArray(body.tags) ? body.tags as string[] : []}::text[],
      ${typeof body.trust_level === "number" ? body.trust_level : 0.85}::numeric
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
      ${sql.json(Array.isArray(body.evidence_refs) ? body.evidence_refs : [])}::jsonb,
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

  const body = await req.json().catch(() => null) as Json | null;
  if (!body) return json(req, { ok: false, error: "invalid_json" }, 400);

  const route = routeName(new URL(req.url).pathname);
  const handler = routes[route];

  if (!handler) {
    return json(req, {
      ok: true,
      service: "iskra-memory-gateway",
      surface: "chatgpt_projects",
      routes: Object.keys(routes),
      auth: "verify_jwt=true required by Supabase function config",
    });
  }

  try {
    const result = await handler(body, asActor(body));
    return json(req, result ?? { ok: true });
  } catch (error) {
    return json(req, {
      ok: false,
      error: "gateway_failed",
      detail: cleanError(error),
    }, 500);
  }
});
