export const PRODUCTION_PROJECT_REF = 'typcvaszcfdpkzbjzuur';
export const STAGING_ACCEPTANCE_ORIGIN = 'http://127.0.0.1:4173';

type Environment = Record<string, string | undefined>;

export interface StagingAcceptanceConfig {
  projectRef: string;
  url: string;
  publishableKey: string;
  serviceRoleKey: string;
  userAToken: string;
  userBToken: string;
  nonMemberToken: string;
  suspendedMemberToken: string;
  anonymousToken: string;
  expiredToken: string;
  allowedOrigin: string;
  ipHmacSecret: string;
  magicLinkReceiptA: string;
  magicLinkReceiptB: string;
}

function fail(reason: string): never {
  throw new Error(`Staging acceptance preflight failed: ${reason}`);
}

function required(environment: Environment, name: string): string {
  const value = environment[name]?.trim();
  return value || fail(`${name} is required`);
}

/**
 * Validates the opt-in acceptance environment before a network client exists.
 * Error messages intentionally name configuration fields, never their values.
 */
export function parseStagingAcceptanceConfig(environment: Environment = process.env): StagingAcceptanceConfig {
  if (environment.RUN_STAGING_ACCEPTANCE !== 'true') {
    fail('RUN_STAGING_ACCEPTANCE=true is required');
  }

  const projectRef = required(environment, 'ISKRA_STAGING_PROJECT_REF');
  if (projectRef === PRODUCTION_PROJECT_REF) {
    fail('the production project ref is forbidden');
  }

  const url = required(environment, 'ISKRA_STAGING_URL');
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    fail('ISKRA_STAGING_URL must be an absolute HTTPS URL');
  }
  if (parsedUrl!.protocol !== 'https:' || parsedUrl!.hostname !== `${projectRef}.supabase.co`) {
    fail('ISKRA_STAGING_URL must be https://<ISKRA_STAGING_PROJECT_REF>.supabase.co');
  }
  if (parsedUrl!.hostname === `${PRODUCTION_PROJECT_REF}.supabase.co`) {
    fail('the production Supabase hostname is forbidden');
  }
  if (
    parsedUrl!.username ||
    parsedUrl!.password ||
    parsedUrl!.port ||
    parsedUrl!.pathname !== '/' ||
    parsedUrl!.search ||
    parsedUrl!.hash
  ) {
    fail('ISKRA_STAGING_URL must be the project root URL without credentials, port, path, query, or fragment');
  }

  if (environment.VITE_E2E_AUTH_BYPASS && environment.VITE_E2E_AUTH_BYPASS !== 'false') {
    fail('VITE_E2E_AUTH_BYPASS must be absent or false');
  }

  const userAToken = required(environment, 'ISKRA_STAGING_USER_A_JWT');
  const userBToken = required(environment, 'ISKRA_STAGING_USER_B_JWT');
  const nonMemberToken = required(environment, 'ISKRA_STAGING_NON_MEMBER_JWT');
  const suspendedMemberToken = required(environment, 'ISKRA_STAGING_SUSPENDED_MEMBER_JWT');
  const anonymousToken = required(environment, 'ISKRA_STAGING_ANONYMOUS_JWT');
  const expiredToken = required(environment, 'ISKRA_STAGING_EXPIRED_JWT');
  const tokens = [userAToken, userBToken, nonMemberToken, suspendedMemberToken, anonymousToken, expiredToken];
  if (new Set(tokens).size !== tokens.length) {
    fail('all staging acceptance tokens must be distinct');
  }

  const allowedOrigin = required(environment, 'ISKRA_STAGING_ALLOWED_ORIGIN');
  if (allowedOrigin !== STAGING_ACCEPTANCE_ORIGIN) {
    fail(`ISKRA_STAGING_ALLOWED_ORIGIN must be ${STAGING_ACCEPTANCE_ORIGIN}`);
  }

  const ipHmacSecret = required(environment, 'ISKRA_STAGING_IP_HMAC_SECRET');
  if (ipHmacSecret.length < 32) fail('ISKRA_STAGING_IP_HMAC_SECRET must contain at least 32 characters');

  const receiptPattern = /^[a-f0-9]{64}$/;
  const magicLinkReceiptA = required(environment, 'ISKRA_STAGING_MAGIC_LINK_A_RECEIPT_SHA256');
  const magicLinkReceiptB = required(environment, 'ISKRA_STAGING_MAGIC_LINK_B_RECEIPT_SHA256');
  if (!receiptPattern.test(magicLinkReceiptA) || !receiptPattern.test(magicLinkReceiptB)) {
    fail('magic-link receipt SHA-256 values must be 64 lowercase hexadecimal characters');
  }
  if (magicLinkReceiptA === magicLinkReceiptB) fail('magic-link receipts must be distinct');

  return {
    projectRef,
    url,
    publishableKey: required(environment, 'ISKRA_STAGING_PUBLISHABLE_KEY'),
    serviceRoleKey: required(environment, 'ISKRA_STAGING_SERVICE_ROLE_KEY'),
    userAToken,
    userBToken,
    nonMemberToken,
    suspendedMemberToken,
    anonymousToken,
    expiredToken,
    allowedOrigin,
    ipHmacSecret,
    magicLinkReceiptA,
    magicLinkReceiptB,
  };
}
