import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

function collectSourceFiles(dir: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (['node_modules', 'dist', 'coverage', 'supabase', '__tests__', 'testSupport'].includes(entry.name)) {
        continue;
      }
      files.push(...collectSourceFiles(fullPath));
      continue;
    }

    if (/\.(ts|tsx)$/.test(entry.name)) {
      files.push(fullPath);
    }
  }

  return files;
}

describe('release AI boundary', () => {
  it('keeps direct Gemini clients out of release-facing frontend modules', () => {
    const allowedFiles = new Set([
      path.normalize(path.join(rootDir, 'services/geminiService.ts')),
    ]);

    const violations = collectSourceFiles(rootDir)
      .filter(file => !allowedFiles.has(path.normalize(file)))
      .flatMap(file => {
        const source = fs.readFileSync(file, 'utf8');
        const relative = path.relative(rootDir, file).replace(/\\/g, '/');
        const hits: string[] = [];
        if (source.includes('@google/genai')) {
          hits.push(`${relative}: imports @google/genai`);
        }
        if (/\bgetAI\s*\(/.test(source)) {
          hits.push(`${relative}: calls getAI()`);
        }
        return hits;
      });

    expect(violations).toEqual([]);
  });
});
