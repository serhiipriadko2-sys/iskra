export interface E2eAuthEnvironment {
  dev: boolean;
  bypass?: string;
}

export function isE2eAuthBypassEnabled(
  environment: E2eAuthEnvironment = {
    dev: import.meta.env.DEV,
    bypass: import.meta.env.VITE_E2E_AUTH_BYPASS,
  },
): boolean {
  return environment.dev && environment.bypass === 'true';
}
