import { beforeAll, describe, expect, it } from 'vitest';
import {
  parseStagingAcceptanceConfig,
  type StagingAcceptanceConfig,
} from '../../services/stagingAcceptanceConfig';

type EdgeFunction = 'gemini' | 'iskra-agent';

describe.skipIf(process.env.RUN_STAGING_ACCEPTANCE !== 'true').sequential(
  'S1 staging Edge closed-beta boundary',
  () => {
    let config: StagingAcceptanceConfig;

    beforeAll(() => {
      config = parseStagingAcceptanceConfig();
    });

    function invoke(
      functionName: EdgeFunction,
      options: { token?: string; origin?: string; forwardedFor?: string; body?: unknown } = {},
    ): Promise<Response> {
      const headers: Record<string, string> = {
        apikey: config.publishableKey,
        'content-type': 'application/json',
      };
      if (options.token) headers.authorization = `Bearer ${options.token}`;
      if (options.origin) headers.origin = options.origin;
      if (options.forwardedFor) headers['x-forwarded-for'] = options.forwardedFor;

      return fetch(`${config.url}/functions/v1/${functionName}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(options.body ?? { action: 'stagingBoundaryProbe' }),
      });
    }

    function validBody(functionName: EdgeFunction): unknown {
      return functionName === 'gemini'
        ? {
            action: 'generateContent',
            contents: [{ role: 'user', parts: [{ text: 'staging access probe' }] }],
          }
        : { message: 'staging access probe', route: 'chat' };
    }

    async function waitForStableQuotaWindow(): Promise<void> {
      const response = await fetch(`${config.url}/rest/v1/`, {
        headers: { apikey: config.publishableKey },
      });
      const gatewayDate = response.headers.get('date');
      const seconds = gatewayDate ? new Date(gatewayDate).getUTCSeconds() : new Date().getUTCSeconds();

      // consume_ai_quota uses database minute buckets. Starting late in a
      // minute can split eleven sequential requests into two valid buckets and
      // create a false negative. The gateway clock keeps this wait independent
      // of workstation clock skew.
      if (seconds > 35) {
        await new Promise(resolve => setTimeout(resolve, (61 - seconds) * 1_000));
      }
    }

    it.each<EdgeFunction>(['gemini', 'iskra-agent'])(
      '%s rejects missing, malformed, and genuinely expired JWTs',
      async functionName => {
        const [missing, malformed, expired] = await Promise.all([
          invoke(functionName, { origin: config.allowedOrigin }),
          invoke(functionName, { origin: config.allowedOrigin, token: 'malformed.jwt.value' }),
          invoke(functionName, { origin: config.allowedOrigin, token: config.expiredToken }),
        ]);
        expect(missing.status).toBe(401);
        expect(malformed.status).toBe(401);
        expect(expired.status).toBe(401);
      },
    );

    it.each<EdgeFunction>(['gemini', 'iskra-agent'])(
      '%s rejects non-members and suspended members before provider routing',
      async functionName => {
        const [nonMember, suspended] = await Promise.all([
          invoke(functionName, {
            origin: config.allowedOrigin,
            token: config.nonMemberToken,
            body: validBody(functionName),
          }),
          invoke(functionName, {
            origin: config.allowedOrigin,
            token: config.suspendedMemberToken,
            body: validBody(functionName),
          }),
        ]);
        expect(nonMember.status).toBe(403);
        expect(suspended.status).toBe(403);
      },
    );

    it.each<EdgeFunction>(['gemini', 'iskra-agent'])(
      '%s rejects missing and disallowed Origin without reflecting a CORS allow header',
      async functionName => {
        const [missing, disallowed] = await Promise.all([
          invoke(functionName, { token: config.userAToken }),
          invoke(functionName, { token: config.userAToken, origin: 'https://disallowed.invalid' }),
        ]);
        for (const response of [missing, disallowed]) {
          expect(response.status).toBe(403);
          expect(response.headers.get('access-control-allow-origin')).toBeNull();
        }
      },
    );

    it('proves the Gemini IP limiter cannot be bypassed with client-selected X-Forwarded-For values', async () => {
      await waitForStableQuotaWindow();
      const responses: Response[] = [];
      for (let index = 0; index < 11; index += 1) {
        responses.push(await invoke('gemini', {
          token: config.userAToken,
          origin: config.allowedOrigin,
          forwardedFor: `198.51.100.${index + 1}`,
          body: validBody('gemini'),
        }));
      }

      // Staging runs with AI_EDGE_TEST_MODE=true, so a request which clears
      // auth, policy, membership and quota reaches the explicit no-upstream
      // response. The eleventh request must be stopped at the shared quota.
      expect(responses.slice(0, 10).map(response => response.status)).toEqual(Array(10).fill(502));
      expect(responses[10]?.status).toBe(429);
      expect(responses[10]?.headers.get('access-control-allow-origin')).toBe(config.allowedOrigin);
    }, 45_000);
  },
);
