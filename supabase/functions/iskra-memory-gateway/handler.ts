import { jwtVerify, type JWTPayload } from 'jose';

export type CredentialClass =
  | 'service_role'
  | 'anon'
  | 'authenticated'
  | 'other';

export type GatewayMode = 'probe_only' | 'enabled';

export type PrivilegedRoute =
  | 'observe'
  | 'dry-run'
  | 'dark-run'
  | 'commit'
  | 'horizon/propose'
  | 'memory/write'
  | 'memory/search'
  | 'shadow/promote'
  | 'dream/crystallize';

export type GatewayRoute = 'auth/whoami' | PrivilegedRoute;

export interface VerifiedCredential {
  credentialClass: CredentialClass;
  issuerValidated: boolean;
  audienceValidated: boolean;
}

export type CredentialVerifier = (
  authorizationHeader: string | null,
) => Promise<VerifiedCredential>;

export interface PrivilegedCapabilityContext {
  request: Request;
  route: PrivilegedRoute;
  credential: VerifiedCredential;
}

export type PrivilegedCapability = (
  context: PrivilegedCapabilityContext,
) => Promise<Response>;

export interface GatewayHandlerOptions {
  mode: GatewayMode;
  verifyCredential: CredentialVerifier;
  privilegedCapability?: PrivilegedCapability;
  allowedOrigins?: readonly string[];
}

export interface JwtCredentialVerifierOptions {
  secret: Uint8Array;
  expectedIssuer?: string;
  expectedAudience?: string | string[];
}

const SERVICE = 'iskra-memory-gateway';

const DEFAULT_ALLOWED_ORIGINS = ['https://chatgpt.com'] as const;

const ROUTE_PREFIXES = [
  '/functions/v1/iskra-memory-gateway',
  '/iskra-memory-gateway',
] as const;

const PRIVILEGED_ROUTES = [
  'observe',
  'dry-run',
  'dark-run',
  'commit',
  'horizon/propose',
  'memory/write',
  'memory/search',
  'shadow/promote',
  'dream/crystallize',
] as const satisfies readonly PrivilegedRoute[];

export function resolveGatewayRoute(pathname: string): GatewayRoute | null {
  for (const prefix of ROUTE_PREFIXES) {
    if (pathname === `${prefix}/auth/whoami`) {
      return 'auth/whoami';
    }

    for (const route of PRIVILEGED_ROUTES) {
      if (pathname === `${prefix}/${route}`) {
        return route;
      }
    }
  }

  return null;
}

export function classifyCredential(payload: JWTPayload): CredentialClass {
  const role = typeof payload.role === 'string' ? payload.role : '';

  if (role === 'service_role') return 'service_role';
  if (role === 'anon') return 'anon';
  if (role === 'authenticated') return 'authenticated';
  return 'other';
}

export function createJwtCredentialVerifier(
  options: JwtCredentialVerifierOptions,
): CredentialVerifier {
  return async (authorizationHeader) => {
    const token = authorizationHeader?.match(/^Bearer\s+(.+)$/i)?.[1]?.trim();
    if (!token) {
      throw new Error('missing_authorization_bearer');
    }

    try {
      const verified = await jwtVerify(token, options.secret, {
        algorithms: ['HS256'],
        ...(options.expectedIssuer
          ? { issuer: options.expectedIssuer }
          : {}),
        ...(options.expectedAudience
          ? { audience: options.expectedAudience }
          : {}),
      });
      return {
        credentialClass: classifyCredential(verified.payload),
        issuerValidated: options.expectedIssuer !== undefined,
        audienceValidated: options.expectedAudience !== undefined,
      };
    } catch {
      throw new Error('invalid_authorization_jwt');
    }
  };
}

export function normalizeAllowedOrigins(
  origins: readonly string[],
): string[] {
  return origins
    .map((origin) => origin.trim().replace(/\/+$/, ''))
    .filter(Boolean);
}

function corsHeaders(
  request: Request,
  allowedOrigins: readonly string[],
): HeadersInit {
  const origin = request.headers.get('origin') ?? '';
  const allowed = origin && allowedOrigins.includes(origin)
    ? origin
    : (allowedOrigins[0] ?? 'https://chatgpt.com');

  return {
    'access-control-allow-origin': allowed,
    'access-control-allow-headers':
      'authorization, x-client-info, apikey, content-type',
    'access-control-allow-methods': 'POST, OPTIONS',
    vary: 'Origin',
    'content-type': 'application/json',
  };
}

function jsonResponse(
  request: Request,
  body: unknown,
  status: number,
  allowedOrigins: readonly string[],
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: corsHeaders(request, allowedOrigins),
  });
}

function unauthorizedError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return 'unauthorized';
}

export function createGatewayHandler(
  options: GatewayHandlerOptions,
): (request: Request) => Promise<Response> {
  const configuredOrigins = normalizeAllowedOrigins(
    options.allowedOrigins ?? [],
  );
  const allowedOrigins = configuredOrigins.length > 0
    ? configuredOrigins
    : DEFAULT_ALLOWED_ORIGINS;

  return async (request) => {
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(request, allowedOrigins),
      });
    }

    if (request.method !== 'POST') {
      return jsonResponse(
        request,
        { ok: false, error: 'method_not_allowed' },
        405,
        allowedOrigins,
      );
    }

    let credential: VerifiedCredential;
    try {
      credential = await options.verifyCredential(
        request.headers.get('authorization'),
      );
    } catch (error) {
      return jsonResponse(
        request,
        { ok: false, error: unauthorizedError(error) },
        401,
        allowedOrigins,
      );
    }

    const route = resolveGatewayRoute(new URL(request.url).pathname);
    if (!route) {
      return jsonResponse(
        request,
        {
          ok: false,
          error: 'route_not_found',
          service: SERVICE,
        },
        404,
        allowedOrigins,
      );
    }

    if (route === 'auth/whoami') {
      return jsonResponse(
        request,
        {
          ok: true,
          service: SERVICE,
          mode: options.mode,
          credential_class: credential.credentialClass,
        },
        200,
        allowedOrigins,
      );
    }

    if (options.mode === 'probe_only') {
      return jsonResponse(
        request,
        {
          ok: false,
          error: 'gateway_security_hold',
          service: SERVICE,
          mode: options.mode,
        },
        503,
        allowedOrigins,
      );
    }

    if (!options.privilegedCapability) {
      return jsonResponse(
        request,
        {
          ok: false,
          error: 'privileged_capability_unavailable',
          service: SERVICE,
          mode: options.mode,
        },
        503,
        allowedOrigins,
      );
    }

    return options.privilegedCapability({
      request,
      route,
      credential,
    });
  };
}
