#!/usr/bin/env node
/**
 * Fetch remote Supabase migration statements via Management API read-only query.
 *
 * Usage:
 *   SUPABASE_ACCESS_TOKEN=sbp_... npx tsx tools/fetch_supabase_migration_statements.ts [out-dir]
 *
 * Security:
 *   - Token is read from env only and never written to output.
 *   - Output SQL files contain the actual statements executed on the remote project.
 */
import * as fs from 'fs';
import * as path from 'path';

const PROJECT_REF = 'typcvaszcfdpkzbjzuur';
const API_BASE = 'https://api.supabase.com';

const token = process.env.SUPABASE_ACCESS_TOKEN;
if (!token) {
  console.error('Missing SUPABASE_ACCESS_TOKEN');
  process.exit(1);
}

const outDir = process.argv[2] || 'output/supabase_audit_remote_migrations';

function sanitizeName(name: string): string {
  return name.replace(/[^a-zA-Z0-9_-]/g, '_');
}

async function query<T = unknown>(sql: string): Promise<T> {
  const res = await fetch(`${API_BASE}/v1/projects/${PROJECT_REF}/database/query/read-only`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: sql }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Management API query failed: ${res.status} ${res.statusText}\n${body.slice(0, 2000)}`);
  }
  return (await res.json()) as T;
}

type MigrationRow = {
  version: string;
  name: string;
  statements?: string[] | null;
};

async function main(): Promise<void> {
  fs.mkdirSync(outDir, { recursive: true });

  const list = await query<MigrationRow[]>(
    'SELECT version, name FROM supabase_migrations.schema_migrations ORDER BY version',
  );

  const manifest: MigrationRow[] = [];

  for (const row of list) {
    const detail = await query<MigrationRow[]>(
      `SELECT version, name, statements FROM supabase_migrations.schema_migrations WHERE version = '${row.version}'`,
    );
    const item = detail[0];
    const sql = (item.statements ?? []).join('\n');
    const fileName = `${row.version}_${sanitizeName(row.name)}.sql`;
    const filePath = path.join(outDir, fileName);
    fs.writeFileSync(filePath, `-- Remote migration: ${row.version} / ${row.name}\n\n${sql}\n`);
    manifest.push({ version: row.version, name: row.name });
    console.log(`[OK] ${fileName}`);
  }

  fs.writeFileSync(path.join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
  console.log(`\nWrote ${manifest.length} migrations to ${outDir}`);
}

main().catch((err) => {
  console.error('[FAIL]', err.message);
  process.exit(1);
});
