import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const thisFile = fileURLToPath(import.meta.url);
const migration = readFileSync(
  join(dirname(thisFile), '../../../../supabase/migrations/20260709180000_audit_log_append_only.sql'),
  'utf8',
);
const schema = readFileSync(
  join(dirname(thisFile), '../../supabase/schema.sql'),
  'utf8',
);

describe('audit_log append-only boundary', () => {
  it('migration grants only SELECT and INSERT on audit_log to users', () => {
    expect(migration).toMatch(/create policy "Users can view own audit_log"\s+on public\.audit_log for select/i);
    expect(migration).toMatch(/create policy "Users can insert own audit_log"\s+on public\.audit_log for insert/i);
  });

  it('migration removes the permissive FOR ALL policy', () => {
    expect(migration).toContain('drop policy if exists "Users can manage own audit_log" on public.audit_log');
  });

  it('neither migration nor schema grants UPDATE/DELETE/ALL on audit_log to users', () => {
    // No user-facing policy may allow mutation of existing audit rows.
    const forbidden = /audit_log\s+for\s+(all|update|delete)/i;
    expect(migration).not.toMatch(forbidden);
    // schema.sql snapshot must match the append-only shape.
    const auditSection = schema.slice(schema.indexOf('audit_log FOR'));
    expect(schema).not.toMatch(/"Users can manage own audit_log"\s+ON audit_log FOR ALL/i);
    expect(auditSection).toBeDefined();
  });

  it('schema.sql exposes append-only SELECT + INSERT policies for audit_log', () => {
    expect(schema).toMatch(/CREATE POLICY "Users can view own audit_log"\s+ON audit_log FOR SELECT/i);
    expect(schema).toMatch(/CREATE POLICY "Users can insert own audit_log"\s+ON audit_log FOR INSERT/i);
  });
});
