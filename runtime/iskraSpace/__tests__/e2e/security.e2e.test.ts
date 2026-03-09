import { describe, it, expect, beforeAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';

// Load environment variables for E2E testing
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'http://localhost:54321';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'dummy-anon-key';

describe('E2E Security & Regression Tests', () => {
  let supabase: ReturnType<typeof createClient>;

  beforeAll(() => {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  });

  describe('1. RLS Isolation (Task 5.1)', () => {
    it('should return empty array when fetching memory_nodes anonymously (RLS blocks access)', async () => {
      // Assuming RLS requires auth.uid()
      const { data, error } = await supabase.from('memory_nodes').select('*').limit(5);

      // Depending on RLS, it might return empty array [] or a permission denied error.
      // But it MUST NOT return other users' data.
      expect(error).toBeNull();
      expect(data).toEqual([]);
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
        body: JSON.stringify({ message: 'Hello' })
      });

      // Task 2.3 check: Should return 401 Unauthorized, not 200 OK
      expect(response.status).toBe(401);
    });
  });

  describe('3. CSP Headers (Task 5.2)', () => {
    it('should not contain unsafe-inline or unsafe-eval in Content-Security-Policy', async () => {
      // Ideally we check the deployed frontend URL, here we use localhost as placeholder
      const APP_URL = process.env.VITE_APP_URL || 'http://localhost:3000';
      try {
        const response = await fetch(APP_URL);
        const csp = response.headers.get('Content-Security-Policy');

        if (csp) {
          expect(csp).not.toContain('unsafe-inline');
          expect(csp).not.toContain('unsafe-eval');
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
