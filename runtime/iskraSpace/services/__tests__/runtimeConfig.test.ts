import { afterEach, describe, expect, it } from 'vitest';
import { getRuntimeConfig } from '../../config/runtimeConfig';

afterEach(() => {
  delete window.__ISKRA_RUNTIME_CONFIG__;
});

describe('runtime config boundary', () => {
  it('prefers Docker-injected public configuration', () => {
    window.__ISKRA_RUNTIME_CONFIG__ = Object.freeze({
      VITE_SUPABASE_URL: 'https://runtime.supabase.co',
    });

    expect(getRuntimeConfig('VITE_SUPABASE_URL', 'https://build.supabase.co'))
      .toBe('https://runtime.supabase.co');
  });

  it('uses the Vite fallback outside the canonical container', () => {
    expect(getRuntimeConfig('VITE_SUPABASE_URL', 'https://build.supabase.co'))
      .toBe('https://build.supabase.co');
  });
});
