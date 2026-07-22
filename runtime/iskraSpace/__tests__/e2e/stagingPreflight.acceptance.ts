import { describe, expect, it } from 'vitest';
import { parseStagingAcceptanceConfig } from '../../services/stagingAcceptanceConfig';

// This filename is not discovered by the default Vitest pattern. The dedicated
// staging config includes it so an explicit acceptance command can never turn
// missing opt-in or unsafe production configuration into a silent skip.
describe('staging acceptance command preflight', () => {
  it('passes the complete fail-closed configuration before live suites start', () => {
    expect(() => parseStagingAcceptanceConfig()).not.toThrow();
  });
});
