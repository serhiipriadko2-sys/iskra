import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => {
  const auth = {
    getSession: vi.fn(),
    signInWithOtp: vi.fn(),
    signInAnonymously: vi.fn(),
    signOut: vi.fn(),
    onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
  };

  const client = {
    auth,
    rpc: vi.fn(),
    from: vi.fn(() => ({ upsert: vi.fn().mockResolvedValue({ error: null }) })),
  };

  return { auth, client };
});

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => mocks.client),
}));

function sessionFor(user: {
  id: string;
  email?: string;
  is_anonymous?: boolean;
}) {
  return {
    access_token: 'member-access-token',
    user,
  };
}

describe('closed-beta Supabase client boundary', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv('VITE_SUPABASE_URL', 'https://beta.example.test');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'test-publishable-key');
    vi.stubEnv('VITE_ENABLE_ANONYMOUS_AUTH', 'false');
    vi.clearAllMocks();
    mocks.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    });
    mocks.client.from.mockReturnValue({ upsert: vi.fn().mockResolvedValue({ error: null }) });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('denies anonymous sessions before a beta access token can be obtained', async () => {
    mocks.auth.getSession.mockResolvedValue({
      data: { session: sessionFor({ id: 'anon-user', is_anonymous: true }) },
    });

    const client = await import('../supabaseClient');

    await expect(client.getBetaSession()).resolves.toEqual({
      status: 'denied',
      reason: 'anonymous-session',
    });
    await expect(client.getAccessToken()).rejects.toThrow('active closed-beta membership');
    expect(mocks.client.rpc).not.toHaveBeenCalled();
    expect(mocks.auth.signInAnonymously).not.toHaveBeenCalled();
  });

  it('denies a permanent session whose membership resolver is inactive', async () => {
    mocks.auth.getSession.mockResolvedValue({
      data: { session: sessionFor({ id: 'inactive-member', email: 'inactive@example.test' }) },
    });
    mocks.client.rpc.mockResolvedValue({
      data: { active: false, membership_status: 'suspended' },
      error: null,
    });

    const client = await import('../supabaseClient');

    await expect(client.getBetaSession()).resolves.toEqual({
      status: 'denied',
      reason: 'membership-inactive',
    });
    expect(mocks.client.rpc).toHaveBeenCalledWith('resolve_beta_access');
  });

  it('requests a magic link without self-service account creation', async () => {
    mocks.auth.signInWithOtp.mockResolvedValue({ error: null });
    const betaUrl = 'https://beta.example.test/iskra/';
    vi.stubGlobal('window', { location: { href: betaUrl } });

    const client = await import('../supabaseClient');

    await expect(client.requestMagicLink('member@example.test')).resolves.toEqual({ ok: true });
    expect(mocks.auth.signInWithOtp).toHaveBeenCalledWith({
      email: 'member@example.test',
      options: {
        emailRedirectTo: betaUrl,
        shouldCreateUser: false,
      },
    });
  });

  it('does not require a browser global when requesting a magic link from a non-browser runtime', async () => {
    mocks.auth.signInWithOtp.mockResolvedValue({ error: null });
    vi.stubGlobal('window', undefined);

    const client = await import('../supabaseClient');

    await expect(client.requestMagicLink('member@example.test')).resolves.toEqual({ ok: true });
    expect(mocks.auth.signInWithOtp).toHaveBeenCalledWith({
      email: 'member@example.test',
      options: {
        shouldCreateUser: false,
      },
    });
  });

  it('returns a token only after the server membership resolver grants active access', async () => {
    mocks.auth.getSession.mockResolvedValue({
      data: { session: sessionFor({ id: 'active-member', email: 'member@example.test' }) },
    });
    mocks.client.rpc.mockResolvedValue({
      data: { active: true, membership_status: 'active' },
      error: null,
    });

    const client = await import('../supabaseClient');

    await expect(client.getBetaSession()).resolves.toMatchObject({
      status: 'granted',
      session: {
        userId: 'active-member',
        email: 'member@example.test',
        accessToken: 'member-access-token',
      },
    });
    await expect(client.getAccessToken()).resolves.toBe('member-access-token');
    expect(mocks.client.from).toHaveBeenCalledWith('users');
  });
});
