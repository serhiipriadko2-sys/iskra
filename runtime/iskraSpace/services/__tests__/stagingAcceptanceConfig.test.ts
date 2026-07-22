import { describe, expect, it } from 'vitest';
import { parseStagingAcceptanceConfig } from '../stagingAcceptanceConfig';

const valid = {
  RUN_STAGING_ACCEPTANCE: 'true',
  ISKRA_STAGING_PROJECT_REF: 'stagingacceptance',
  ISKRA_STAGING_URL: 'https://stagingacceptance.supabase.co',
  ISKRA_STAGING_PUBLISHABLE_KEY: 'publishable-key',
  ISKRA_STAGING_SERVICE_ROLE_KEY: 'service-role-key',
  ISKRA_STAGING_USER_A_JWT: 'user-a-jwt',
  ISKRA_STAGING_USER_B_JWT: 'user-b-jwt',
  ISKRA_STAGING_NON_MEMBER_JWT: 'non-member-jwt',
  ISKRA_STAGING_SUSPENDED_MEMBER_JWT: 'suspended-member-jwt',
  ISKRA_STAGING_ANONYMOUS_JWT: 'anonymous-jwt',
  ISKRA_STAGING_EXPIRED_JWT: 'expired-jwt',
  ISKRA_STAGING_ALLOWED_ORIGIN: 'http://127.0.0.1:4173',
  ISKRA_STAGING_IP_HMAC_SECRET: 'hmac-secret-with-at-least-32-characters',
  ISKRA_STAGING_MAGIC_LINK_A_RECEIPT_SHA256: 'a'.repeat(64),
  ISKRA_STAGING_MAGIC_LINK_B_RECEIPT_SHA256: 'b'.repeat(64),
};

describe('parseStagingAcceptanceConfig', () => {
  it('accepts a complete non-production staging configuration', () => {
    expect(parseStagingAcceptanceConfig(valid)).toMatchObject({
      projectRef: 'stagingacceptance',
      url: 'https://stagingacceptance.supabase.co',
      allowedOrigin: 'http://127.0.0.1:4173',
    });
  });

  it.each([
    ['opt-in is absent', { ...valid, RUN_STAGING_ACCEPTANCE: undefined }],
    ['project ref is production', { ...valid, ISKRA_STAGING_PROJECT_REF: 'typcvaszcfdpkzbjzuur' }],
    ['URL is not HTTPS', { ...valid, ISKRA_STAGING_URL: 'http://stagingacceptance.supabase.co' }],
    ['URL hostname differs from project ref', { ...valid, ISKRA_STAGING_URL: 'https://other.supabase.co' }],
    ['URL has a path', { ...valid, ISKRA_STAGING_URL: 'https://stagingacceptance.supabase.co/rest/v1' }],
    ['auth bypass is enabled', { ...valid, VITE_E2E_AUTH_BYPASS: 'true' }],
    ['user tokens match', { ...valid, ISKRA_STAGING_USER_B_JWT: valid.ISKRA_STAGING_USER_A_JWT }],
    ['non-member token is absent', { ...valid, ISKRA_STAGING_NON_MEMBER_JWT: undefined }],
    ['expired token is reused', { ...valid, ISKRA_STAGING_EXPIRED_JWT: valid.ISKRA_STAGING_USER_A_JWT }],
    ['origin differs from the acceptance harness', { ...valid, ISKRA_STAGING_ALLOWED_ORIGIN: 'http://localhost:4173' }],
    ['required credential is absent', { ...valid, ISKRA_STAGING_IP_HMAC_SECRET: undefined }],
    ['HMAC secret is too short', { ...valid, ISKRA_STAGING_IP_HMAC_SECRET: 'short' }],
    ['magic-link receipt is absent', { ...valid, ISKRA_STAGING_MAGIC_LINK_A_RECEIPT_SHA256: undefined }],
    ['magic-link receipts match', { ...valid, ISKRA_STAGING_MAGIC_LINK_B_RECEIPT_SHA256: 'a'.repeat(64) }],
  ])('fails closed when %s', (_caseName, environment) => {
    expect(() => parseStagingAcceptanceConfig(environment)).toThrow(/staging acceptance/i);
  });
});
