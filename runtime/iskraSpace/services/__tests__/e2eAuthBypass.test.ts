import { describe, expect, it } from 'vitest';
import { isE2eAuthBypassEnabled } from '../../config/e2eAuth';

describe('E2E auth bypass boundary', () => {
  it('requires both a development build and the explicit E2E flag', () => {
    expect(isE2eAuthBypassEnabled({ dev: true, bypass: 'true' })).toBe(true);
    expect(isE2eAuthBypassEnabled({ dev: true, bypass: 'false' })).toBe(false);
    expect(isE2eAuthBypassEnabled({ dev: false, bypass: 'true' })).toBe(false);
  });
});
