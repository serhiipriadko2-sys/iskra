import { describe, it, expect } from 'vitest';
import { supabase } from '../supabase.js';

describe('Supabase Client', () => {
  it('should be initialized', () => {
    expect(supabase).toBeDefined();
    expect(supabase.from).toBeDefined();
  });

  // This test requires network and valid credentials
  it.skipIf(!process.env.NEXT_PUBLIC_SUPABASE_URL)('should connect to Supabase', async () => {
    const response = await supabase
      .from('graph_nodes')
      .select('*', { count: 'exact', head: true });

    console.log('Supabase Response:', JSON.stringify(response, null, 2));

    const { count, error, status } = response;

    if (error) {
      console.error('Supabase Error:', error);
    }

    expect(status).toBeDefined();
    // If table doesn't exist or RLS blocks, count might be null.
    // We just want to ensure we connected.
    // Status 200-299 is good.
    expect(status).toBeGreaterThanOrEqual(200);
    expect(status).toBeLessThan(300);
  });
});
