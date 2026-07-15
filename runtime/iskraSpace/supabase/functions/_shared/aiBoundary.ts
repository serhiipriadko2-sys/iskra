export const AI_RATE_LIMIT_IP_HMAC_SECRET_ENV = 'AI_RATE_LIMIT_IP_HMAC_SECRET';

export type AiBoundaryConfig = {
  supabaseUrl: string;
  supabaseApiKey: string;
  allowedOrigins: string;
  environment: string;
  allowDevelopmentWildcard: boolean;
  ipHmacSecret: string;
};

export type VerifiedAiUser = {
  sub: string;
  isAnonymous: boolean;
};

export function parseVerifiedAiUser(value: unknown): VerifiedAiUser | null {
  if (!value || typeof value !== 'object') return null;

  const record = value as Record<string, unknown>;
  if (typeof record.id !== 'string' || record.id.length === 0) return null;

  const appMetadata = record.app_metadata;
  const anonymousProvider = typeof appMetadata === 'object'
    && appMetadata !== null
    && (appMetadata as Record<string, unknown>).provider === 'anonymous';

  return {
    sub: record.id,
    isAnonymous: record.is_anonymous === true || anonymousProvider,
  };
}

export type AiBoundaryResult =
  | { allowed: true }
  | { allowed: false; status: 401 | 403 | 429 | 503; error: string };

type OriginPolicy = {
  wildcard: boolean;
  origins: Set<string>;
};

const IP_DIGEST_PATTERN = /^[0-9a-f]{64}$/;

function isDevelopmentEnvironment(environment: string): boolean {
  return environment === 'development' || environment === 'test';
}

function originPolicy(config: AiBoundaryConfig): OriginPolicy {
  const normalized = config.allowedOrigins.trim();
  const wildcard = normalized === '*'
    && config.allowDevelopmentWildcard
    && isDevelopmentEnvironment(config.environment);

  return {
    wildcard,
    origins: new Set(
      normalized
        .split(',')
        .map((origin) => origin.trim().toLowerCase())
        .filter((origin) => origin && origin !== '*'),
    ),
  };
}

export function isAllowedOrigin(origin: string | null, config: AiBoundaryConfig): boolean {
  if (!origin) return false;
  const policy = originPolicy(config);
  return policy.wildcard || policy.origins.has(origin.toLowerCase());
}

export function buildCorsHeaders(origin: string | null, config: AiBoundaryConfig): Record<string, string> {
  const headers: Record<string, string> = {
    'access-control-allow-headers': 'authorization, x-client-info, apikey, content-type',
    'access-control-allow-methods': 'POST, OPTIONS',
    vary: 'origin',
  };

  if (isAllowedOrigin(origin, config)) {
    headers['access-control-allow-origin'] = origin ?? '';
  }

  return headers;
}

function trustedClientIp(req: Request): string | null {
  const forwarded = req.headers.get('x-forwarded-for');
  const candidate = forwarded?.split(',')[0]?.trim() ?? req.headers.get('x-real-ip')?.trim();

  // The value is held only long enough to derive the HMAC digest. The database
  // receives only that digest, never this network identifier.
  if (!candidate || candidate.length > 128) return null;
  return candidate;
}

async function hashClientIp(ip: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(ip));
  return Array.from(new Uint8Array(signature), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function unavailable(): AiBoundaryResult {
  // 'unavailable' is the canonical error code when the boundary cannot reach
  // the database or derive a safe client identity.
  return { allowed: false, status: 503, error: 'unavailable' };
}

function denied(status: 401 | 403 | 429, error: string): AiBoundaryResult {
  return { allowed: false, status, error };
}

function quotaDecision(body: unknown): AiBoundaryResult {
  if (!body || typeof body !== 'object') return unavailable();

  const record = body as Record<string, unknown>;
  if (record.allowed === true) return { allowed: true };
  if (record.allowed !== false || typeof record.reason !== 'string') return unavailable();

  if (record.reason === 'anonymous_session') {
    return denied(401, 'anonymous_sessions_are_not_allowed');
  }
  if (record.reason === 'inactive_member') {
    return denied(403, 'active_beta_membership_required');
  }
  if (record.reason === 'member_minute' || record.reason === 'ip_minute' || record.reason === 'member_day') {
    return denied(429, 'rate_limit_exceeded');
  }

  return unavailable();
}

/**
 * Verifies the closed-beta membership and consumes all quota windows through a
 * single user-JWT-scoped database RPC. The RPC is the source of truth: Edge
 * isolate memory must not be used for authorization or billing limits.
 */
export async function enforceAiRequestBoundary(
  req: Request,
  token: string,
  user: VerifiedAiUser,
  config: AiBoundaryConfig,
): Promise<AiBoundaryResult> {
  // Callers already derive anonymity from auth.jwt() ->> 'is_anonymous' and the
  // anonymous provider marker; this guard ensures the shared boundary stays
  // independent of how the JWT was parsed.
  if (!user.sub || user.isAnonymous) {
    return denied(401, 'anonymous_sessions_are_not_allowed');
  }
  if (!config.supabaseUrl || !config.supabaseApiKey || !config.ipHmacSecret) {
    return unavailable();
  }

  const ip = trustedClientIp(req);
  if (!ip) return unavailable();

  let ipDigest: string;
  try {
    ipDigest = await hashClientIp(ip, config.ipHmacSecret);
  } catch {
    return unavailable();
  }

  if (!IP_DIGEST_PATTERN.test(ipDigest)) return unavailable();

  let response: Response;
  try {
    response = await fetch(`${config.supabaseUrl.replace(/\/$/, '')}/rest/v1/rpc/consume_ai_quota`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${token}`,
        apikey: config.supabaseApiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify({ p_ip_digest: ipDigest }),
    });
  } catch {
    return unavailable();
  }

  if (response.status === 401) return denied(401, 'invalid_or_expired_token');
  if (response.status === 403) return denied(403, 'active_beta_membership_required');
  if (!response.ok) return unavailable();

  try {
    return quotaDecision(await response.json());
  } catch {
    return unavailable();
  }
}
