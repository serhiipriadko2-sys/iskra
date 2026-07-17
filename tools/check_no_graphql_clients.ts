import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const SEARCH_ROOTS = ['runtime/iskraSpace/', 'apps/', 'packages/', 'deploy/'];
const FORBIDDEN = /\b(apollo|urql|graphql-request)\b|\/graphql\/v1\b|from\s+['"]graphql['"]/i;

const files = execFileSync('git', ['ls-files', ...SEARCH_ROOTS], { encoding: 'utf8' })
  .split(/\r?\n/)
  .filter(Boolean)
  .filter((file) => /\.(?:[cm]?[jt]sx?|json|ya?ml)$/i.test(file));

const matches: string[] = [];
for (const file of files) {
  const content = readFileSync(file, 'utf8');
  if (FORBIDDEN.test(content)) matches.push(file);
}

if (matches.length > 0) {
  throw new Error(`GraphQL client surface detected: ${matches.join(', ')}`);
}

console.log(`GraphQL client check OK (${files.length} source/config files scanned)`);
