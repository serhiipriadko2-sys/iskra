import { parseVerifiedAiUser } from './aiBoundary.ts';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

Deno.test('auth payload parser returns a permanent user with a boolean boundary', () => {
  const user = parseVerifiedAiUser({
    id: 'member-1',
    is_anonymous: false,
    app_metadata: { provider: 'email' },
  });

  assert(user?.sub === 'member-1', 'expected member id');
  assert(user.isAnonymous === false, 'expected permanent member');
});

Deno.test('auth payload parser rejects both anonymous markers', () => {
  const flagUser = parseVerifiedAiUser({ id: 'anon-1', is_anonymous: true });
  const providerUser = parseVerifiedAiUser({
    id: 'anon-2',
    app_metadata: { provider: 'anonymous' },
  });

  assert(flagUser?.isAnonymous === true, 'expected is_anonymous marker');
  assert(providerUser?.isAnonymous === true, 'expected provider marker');
});

Deno.test('auth payload parser rejects malformed payloads', () => {
  assert(parseVerifiedAiUser(null) === null, 'expected null denial');
  assert(parseVerifiedAiUser({ id: 42 }) === null, 'expected non-string id denial');
  assert(parseVerifiedAiUser({}) === null, 'expected missing id denial');
});
