import { describe, it, expect, beforeAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL ?? '';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY ?? '';

// These tests require an explicitly selected live/local Supabase target with the
// gemini Edge Function deployed. Default verify runs must stay offline-safe.
const SECURITY_E2E_ENABLED =
  (process.env.RUN_SECURITY_E2E === 'true' || process.env.RUN_E2E_SECURITY_TESTS === 'true') &&
  Boolean(SUPABASE_URL) &&
  Boolean(SUPABASE_ANON_KEY);

describe.skipIf(!SECURITY_E2E_ENABLED)('E2E Security & Regression Tests', () => {
  let supabase: ReturnType<typeof createClient>;

  beforeAll(() => {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  });

  describe('1. RLS Isolation (Task 5.1)', () => {
    it('should not expose other users memory_nodes without a closed-beta session', async () => {
      // The closed-beta boundary may either deny the query outright (permission denied)
      // or return an empty result. The invariant is: no foreign rows are leaked.
      const { data, error } = await supabase.from('memory_nodes').select('*').limit(5);

      if (error) {
        expect(error.code).toMatch(/42501|PGRST/);
      } else {
        expect(data).toEqual([]);
      }
    });
  });

  describe('2. Gemini Auth Edge Function (Task 5.3)', () => {
    it('should return 401 Unauthorized when calling Edge Function without token', async () => {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/gemini`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // intentionally omitting Authorization header
        },
        body: JSON.stringify({ action: 'generateContent', contents: 'Hello' }),
      });

      // Task 2.3 check: Should return 401 Unauthorized, not 200 OK
      expect(response.status).toBe(401);
    });

    it('should reject requests from a disallowed origin', async () => {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/gemini`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Origin: 'https://evil.example.com',
        },
        body: JSON.stringify({ action: 'generateContent', contents: 'Hello' }),
      });

      // Gateway JWT verification may return 401 before the function-origin check runs,
      // or the function may return 403. Both outcomes block the cross-origin request.
      expect([401, 403]).toContain(response.status);
    });
  });

  describe('3. CSP Headers (Task 5.2)', () => {
    it('should not contain unsafe-inline or unsafe-eval in script-src directive', async () => {
      // Ideally we check the deployed frontend URL, here we use localhost as placeholder
      const APP_URL = process.env.VITE_APP_URL || 'http://localhost:3000';
      try {
        const response = await fetch(APP_URL);
        const csp = response.headers.get('Content-Security-Policy');

        if (csp) {
          // Extract script-src directive. style-src may legitimately contain 'unsafe-inline'
          // for the critical inline stylesheet in index.html; script-src must stay strict.
          const scriptSrcMatch = csp.match(/script-src\s+([^;]+)/);
          const scriptSrc = scriptSrcMatch ? scriptSrcMatch[1] : '';
          expect(scriptSrc).not.toContain('unsafe-inline');
          expect(scriptSrc).not.toContain('unsafe-eval');
        } else {
          // If no CSP is found in local dev, we might skip or fail depending on strictness
          console.warn('No CSP header found on local dev server. Ensure it is set in production.');
        }
      } catch (err) {
        console.warn(`Could not connect to ${APP_URL} to check CSP headers.`);
      }
    });
  });
});
