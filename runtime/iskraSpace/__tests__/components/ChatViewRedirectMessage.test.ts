import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const source = readFileSync(join(__dirname, '../../components/ChatView.tsx'), 'utf-8');

describe('ChatView REDIRECT security messaging', () => {
  it('gives REDIRECT its own branch distinct from the generic non-PROCEED error', () => {
    const redirectCheck = source.indexOf("security.action === 'REDIRECT'");
    const genericCheck = source.indexOf("security.action !== 'PROCEED'");

    expect(redirectCheck).toBeGreaterThan(-1);
    expect(genericCheck).toBeGreaterThan(redirectCheck);
  });

  it('does not reuse the generic "не сработал безопасный контур" phrasing for REDIRECT', () => {
    const redirectBlock = source.slice(
      source.indexOf("security.action === 'REDIRECT'"),
      source.indexOf("security.action !== 'PROCEED'"),
    );
    expect(redirectBlock).not.toContain('сработал безопасный контур');
    expect(redirectBlock.toLowerCase()).toContain('дневник');
  });
});
