#!/usr/bin/env node
/**
 * Apply a single SQL migration via Supabase Management API and record it in migration history.
 *
 * Usage:
 *   SUPABASE_ACCESS_TOKEN=sbp_... npx tsx tools/apply_supabase_migration.ts <path-to-migration.sql> [migration-name]
 */
import * as fs from 'fs';

const PROJECT_REF = 'typcvaszcfdpkzbjzuur';
const API_BASE = 'https://api.supabase.com';

const token = process.env.SUPABASE_ACCESS_TOKEN;
if (!token) {
  console.error('Missing SUPABASE_ACCESS_TOKEN');
  process.exit(1);
}

const filePath = process.argv[2];
if (!filePath) {
  console.error('Usage: npx tsx tools/apply_supabase_migration.ts <path-to-migration.sql> [migration-name]');
  process.exit(1);
}

const name = process.argv[3] || 'applied_via_cli';
const query = fs.readFileSync(filePath, 'utf8');

async function main(): Promise<void> {
  const res = await fetch(`${API_BASE}/v1/projects/${PROJECT_REF}/database/migrations`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, name }),
  });

  const body = await res.text();
  if (!res.ok) {
    console.error(`[FAIL] ${res.status} ${res.statusText}`);
    console.error(body.slice(0, 2000));
    process.exit(1);
  }

  console.log('[OK] Migration applied');
  console.log(body.slice(0, 2000));
}

main().catch((err) => {
  console.error('[FAIL]', err.message);
  process.exit(1);
});
