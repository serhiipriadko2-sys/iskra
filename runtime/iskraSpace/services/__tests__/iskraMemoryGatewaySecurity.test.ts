import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const currentDirectory = dirname(fileURLToPath(import.meta.url));
const gatewayDirectory = join(
  currentDirectory,
  '../../../../supabase/functions/iskra-memory-gateway',
);
const indexSource = readFileSync(join(gatewayDirectory, 'index.ts'), 'utf-8');
const handlerSource = readFileSync(
  join(gatewayDirectory, 'handler.ts'),
  'utf-8',
);

describe('iskra-memory-gateway production composition security boundary', () => {
  it('keeps index.ts as a thin probe-only Deno adapter', () => {
    expect(indexSource).toContain("mode: 'probe_only'");
    expect(indexSource).toContain("from './handler.ts'");
    expect(indexSource).toContain('Deno.serve(handler)');
    expect(indexSource).not.toContain("from 'npm:postgres");
    expect(indexSource).not.toContain('SUPABASE_DB_POOLER_URL');
    expect(indexSource).not.toContain('SUPABASE_DB_URL');
  });

  it('verifies JWTs in the production handler with jose and HS256', () => {
    expect(handlerSource).toContain("from 'jose'");
    expect(handlerSource).toContain('jwtVerify(token, options.secret');
    expect(handlerSource).toContain("algorithms: ['HS256']");
    expect(handlerSource).toContain('?.[1]?.trim()');
    expect(handlerSource).not.toContain('decodeJwtPayload');
  });

  it('uses exact canonical path matching rather than suffix matching', () => {
    expect(handlerSource).toContain(
      "'/functions/v1/iskra-memory-gateway'",
    );
    expect(handlerSource).toContain("'/iskra-memory-gateway'");
    expect(handlerSource).not.toContain("endsWith('/auth/whoami')");
    expect(handlerSource).not.toContain("return last;");
  });

  it('contains an active fail-closed hold for privileged routes', () => {
    expect(handlerSource).toContain("options.mode === 'probe_only'");
    expect(handlerSource).toContain("error: 'gateway_security_hold'");
  });

  it('never derives identity from the request body', () => {
    expect(handlerSource).not.toMatch(/body\.actor/);
    expect(handlerSource).not.toContain('function asActor');
    expect(indexSource).not.toMatch(/body\.actor/);
  });
});
