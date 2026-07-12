import { spawnSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

type Contract = {
  voicesByTable: Record<string, string[]>;
  metricDefaults: Record<string, string>;
};

type LiveSnapshot = {
  checked_at?: string;
  voice_constraints?: Array<{
    table: string;
    name?: string;
    definition: string;
  }>;
  metrics_defaults?: Array<{
    name: string;
    type?: string;
    default: string | null;
  }>;
  migration_history?: Array<{
    version?: string;
    name?: string;
  }>;
};

const ROOT = process.cwd();
const CANONICAL_VOICE_METRICS_MIGRATION_FILES = [
  'supabase/migrations/20260101000000_schema.sql',
  'supabase/migrations/20260626141034_voice_metrics_drift_repair.sql',
  'supabase/migrations/20260701000000_vomega7_1_metrics_baseline_defaults.sql',
];
const VOICE_METRICS_BASE_SCHEMA_FILE = CANONICAL_VOICE_METRICS_MIGRATION_FILES[0];
const VOICE_METRICS_REPAIR_FILE = CANONICAL_VOICE_METRICS_MIGRATION_FILES[1];
const VOICE_TABLES = ['voice_preferences', 'chat_history'];
const METRIC_COLUMNS = ['rhythm', 'trust', 'clarity', 'chaos', 'foresight'];
const REPAIR_MIGRATION = 'voice_metrics_drift_repair';

const LIVE_SQL = `
select jsonb_build_object(
  'checked_at', now(),
  'voice_constraints', coalesce((
    select jsonb_agg(jsonb_build_object(
      'table', c.relname,
      'name', con.conname,
      'definition', pg_get_constraintdef(con.oid)
    ) order by c.relname, con.conname)
    from pg_constraint con
    join pg_class c on c.oid = con.conrelid
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relname in ('voice_preferences', 'chat_history')
      and con.contype = 'c'
      and pg_get_constraintdef(con.oid) ilike '%voice_name%'
  ), '[]'::jsonb),
  'metrics_defaults', coalesce((
    select jsonb_agg(jsonb_build_object(
      'name', column_name,
      'type', data_type,
      'default', column_default
    ) order by ordinal_position)
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'metrics_snapshots'
      and column_name in ('rhythm','trust','clarity','chaos','foresight')
  ), '[]'::jsonb),
  'migration_history', coalesce((
    select jsonb_agg(jsonb_build_object('version', version, 'name', name) order by version desc)
    from supabase_migrations.schema_migrations
    where name = 'voice_metrics_drift_repair'
  ), '[]'::jsonb)
)::text as snapshot;
`.trim();

function fail(message: string): never {
  console.error(`[FAIL] ${message}`);
  process.exit(1);
}

function ok(message: string): void {
  console.log(`[OK] ${message}`);
}

function usage(): void {
  console.log(`Usage:
  npx tsx tools/verify_supabase_voice_metrics_contract.ts --repo-only
  npx tsx tools/verify_supabase_voice_metrics_contract.ts --snapshot <snapshot.json>
  SUPABASE_DB_URL=postgresql://... npx tsx tools/verify_supabase_voice_metrics_contract.ts

Options:
  --repo-only   Verify the canonical root-migration contract.
  --snapshot    Compare the canonical repo contract to a live snapshot JSON file.
  --print-sql   Print the read-only SQL used to produce a live snapshot.

Env:
  SUPABASE_DB_URL or DATABASE_URL
  SUPABASE_LIVE_SCHEMA_SNAPSHOT_JSON
  SUPABASE_LIVE_SCHEMA_SNAPSHOT_FILE`);
}

function parseArgs(argv: string[]): { repoOnly: boolean; snapshotPath?: string; printSql: boolean } {
  const out = { repoOnly: false, snapshotPath: undefined as string | undefined, printSql: false };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--repo-only') out.repoOnly = true;
    else if (arg === '--print-sql') out.printSql = true;
    else if (arg === '--snapshot') {
      const value = argv[i + 1];
      if (!value) fail('--snapshot requires a file path');
      out.snapshotPath = value;
      i += 1;
    } else if (arg === '--help' || arg === '-h') {
      usage();
      process.exit(0);
    } else {
      fail(`Unknown argument: ${arg}`);
    }
  }

  return out;
}

function readText(rel: string): string {
  const full = path.join(ROOT, rel);
  if (!fs.existsSync(full)) fail(`Missing schema file: ${rel}`);
  return fs.readFileSync(full, 'utf8').replace(/\r\n/g, '\n');
}

function extractCreateTableBody(sql: string, table: string, fileLabel: string): string {
  const pattern = new RegExp(
    `CREATE\\s+TABLE\\s+(?:IF\\s+NOT\\s+EXISTS\\s+)?${table}\\s*\\(([\\s\\S]*?)\\n\\);`,
    'i',
  );
  const match = sql.match(pattern);
  if (!match) fail(`${fileLabel}: missing CREATE TABLE body for ${table}`);
  return match[1];
}

function extractQuotedValues(input: string): string[] {
  const values: string[] = [];
  const quoted = /'([^']+)'/g;
  let match: RegExpExecArray | null;
  while ((match = quoted.exec(input)) !== null) values.push(match[1]);
  return values;
}

function sortedUnique(values: string[]): string[] {
  return Array.from(new Set(values)).sort();
}

function normalizeDefault(value: string | null | undefined): string {
  if (value == null) return '';
  const stripped = value.trim().replace(/::[a-zA-Z0-9_ ]+$/g, '').replace(/^'(.+)'$/g, '$1');
  const numeric = Number(stripped);
  if (Number.isFinite(numeric)) return numeric.toString();
  return stripped;
}

function parseRepoContractFromFile(rel: string): Contract {
  const sql = readText(rel);
  const voicesByTable: Record<string, string[]> = {};

  for (const table of VOICE_TABLES) {
    const body = extractCreateTableBody(sql, table, rel);
    const voiceLine = body.split('\n').find((line) => line.includes('voice_name') && line.includes('CHECK'));
    if (!voiceLine) fail(`${rel}: ${table} missing voice_name CHECK`);
    const inMatch = voiceLine.match(/IN\s*\(([^)]+)\)/i);
    if (!inMatch) fail(`${rel}: ${table} voice_name CHECK is not an IN (...) contract`);
    voicesByTable[table] = sortedUnique(extractQuotedValues(inMatch[1]));
  }

  const metricsBody = extractCreateTableBody(sql, 'metrics_snapshots', rel);
  const metricDefaults: Record<string, string> = {};
  for (const column of METRIC_COLUMNS) {
    const columnMatch = metricsBody.match(new RegExp(`\\b${column}\\b\\s+REAL\\s+DEFAULT\\s+([^,\\n]+)`, 'i'));
    if (!columnMatch) fail(`${rel}: metrics_snapshots.${column} REAL DEFAULT is missing`);
    metricDefaults[column] = normalizeDefault(columnMatch[1]);
  }

  return { voicesByTable, metricDefaults };
}

function sameJson(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

function buildRepoContract(): Contract {
  for (const file of CANONICAL_VOICE_METRICS_MIGRATION_FILES) {
    readText(file);
  }

  const contract = parseRepoContractFromFile(VOICE_METRICS_BASE_SCHEMA_FILE);
  const repair = readText(VOICE_METRICS_REPAIR_FILE);
  const normalizedRepair = repair.replace(/\s+/g, ' ').toLowerCase();

  for (const voice of contract.voicesByTable.voice_preferences) {
    if (!normalizedRepair.includes(`'${voice.toLowerCase()}'::text`)) {
      fail(`${VOICE_METRICS_REPAIR_FILE}: missing canonical voice ${voice}`);
    }
  }

  for (const [metric, value] of Object.entries(contract.metricDefaults)) {
    const expected = metric === 'foresight'
      ? `add column if not exists ${metric} real default ${value}`
      : `alter column ${metric} set default ${value}`;
    if (!normalizedRepair.includes(expected)) {
      fail(`${VOICE_METRICS_REPAIR_FILE}: missing canonical default ${metric}=${value}`);
    }
  }

  return contract;
}

function extractJsonObject(input: string): string {
  const trimmed = input.trim();
  const start = trimmed.indexOf('{');
  const end = trimmed.lastIndexOf('}');
  if (start < 0 || end < start) fail('No JSON object found in live snapshot input');
  return trimmed.slice(start, end + 1);
}

function unwrapSnapshot(parsed: unknown): LiveSnapshot {
  if (Array.isArray(parsed) && parsed.length === 1 && typeof parsed[0] === 'object' && parsed[0] !== null) {
    const row = parsed[0] as Record<string, unknown>;
    return unwrapSnapshot(row.current_snapshot ?? row.after_snapshot ?? row.before_snapshot ?? row.audit_snapshot ?? row);
  }

  if (typeof parsed === 'object' && parsed !== null) {
    const obj = parsed as Record<string, unknown>;
    if (obj.current_snapshot || obj.after_snapshot || obj.before_snapshot || obj.audit_snapshot) {
      return unwrapSnapshot(obj.current_snapshot ?? obj.after_snapshot ?? obj.before_snapshot ?? obj.audit_snapshot);
    }
    return obj as LiveSnapshot;
  }

  fail('Live snapshot JSON must be an object');
}

function parseSnapshotJson(input: string): LiveSnapshot {
  return unwrapSnapshot(JSON.parse(extractJsonObject(input)));
}

function readSnapshotFromPsql(): LiveSnapshot {
  const dbUrl = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;
  if (!dbUrl) {
    fail(
      'Missing live snapshot source. Set SUPABASE_DB_URL/DATABASE_URL, SUPABASE_LIVE_SCHEMA_SNAPSHOT_JSON, SUPABASE_LIVE_SCHEMA_SNAPSHOT_FILE, or pass --snapshot.',
    );
  }

  const result = spawnSync('psql', [dbUrl, '-t', '-A', '-v', 'ON_ERROR_STOP=1', '-c', LIVE_SQL], {
    encoding: 'utf8',
    windowsHide: true,
    maxBuffer: 1024 * 1024,
  });

  if (result.error) {
    fail(`Failed to run psql: ${result.error.message}`);
  }
  if (result.status !== 0) {
    fail(`psql exited with ${result.status}: ${result.stderr.trim()}`);
  }

  return parseSnapshotJson(result.stdout);
}

function readLiveSnapshot(snapshotPath?: string): LiveSnapshot {
  if (snapshotPath) return parseSnapshotJson(fs.readFileSync(snapshotPath, 'utf8'));
  if (process.env.SUPABASE_LIVE_SCHEMA_SNAPSHOT_JSON) {
    return parseSnapshotJson(process.env.SUPABASE_LIVE_SCHEMA_SNAPSHOT_JSON);
  }
  if (process.env.SUPABASE_LIVE_SCHEMA_SNAPSHOT_FILE) {
    return parseSnapshotJson(fs.readFileSync(process.env.SUPABASE_LIVE_SCHEMA_SNAPSHOT_FILE, 'utf8'));
  }
  return readSnapshotFromPsql();
}

function parseLiveVoices(snapshot: LiveSnapshot): Record<string, string[]> {
  const constraints = snapshot.voice_constraints ?? [];
  const byTable: Record<string, string[]> = {};

  for (const table of VOICE_TABLES) {
    const row = constraints.find((constraint) => constraint.table === table);
    if (!row) fail(`Live snapshot missing voice CHECK constraint for ${table}`);
    byTable[table] = sortedUnique(extractQuotedValues(row.definition));
  }

  return byTable;
}

function parseLiveMetricDefaults(snapshot: LiveSnapshot): Record<string, string> {
  const rows = snapshot.metrics_defaults ?? [];
  const defaults: Record<string, string> = {};

  for (const column of METRIC_COLUMNS) {
    const row = rows.find((item) => item.name === column);
    if (!row) fail(`Live snapshot missing metrics_snapshots.${column}`);
    if (row.type && row.type !== 'real') fail(`Live metrics_snapshots.${column} type is ${row.type}, expected real`);
    defaults[column] = normalizeDefault(row.default);
  }

  return defaults;
}

function compareLiveToRepo(repo: Contract, snapshot: LiveSnapshot): void {
  const live: Contract = {
    voicesByTable: parseLiveVoices(snapshot),
    metricDefaults: parseLiveMetricDefaults(snapshot),
  };

  if (!sameJson(live.voicesByTable, repo.voicesByTable)) {
    console.error('[DRIFT] Live voice constraints differ from repo schema.');
    console.error(`repo: ${JSON.stringify(repo.voicesByTable, null, 2)}`);
    console.error(`live: ${JSON.stringify(live.voicesByTable, null, 2)}`);
    process.exit(1);
  }

  if (!sameJson(live.metricDefaults, repo.metricDefaults)) {
    console.error('[DRIFT] Live metrics defaults differ from repo schema.');
    console.error(`repo: ${JSON.stringify(repo.metricDefaults, null, 2)}`);
    console.error(`live: ${JSON.stringify(live.metricDefaults, null, 2)}`);
    process.exit(1);
  }

  const migrationNames = (snapshot.migration_history ?? []).map((row) => row.name).filter(Boolean);
  if (!migrationNames.includes(REPAIR_MIGRATION)) {
    fail(`Live migration history does not include ${REPAIR_MIGRATION}`);
  }
}

function main(): void {
  const args = parseArgs(process.argv.slice(2));

  if (args.printSql) {
    console.log(LIVE_SQL);
    if (!args.repoOnly && !args.snapshotPath) return;
  }

  const repo = buildRepoContract();
  ok(`canonical root-migration voice/metrics contract verified: ${CANONICAL_VOICE_METRICS_MIGRATION_FILES.join(', ')}`);

  if (args.repoOnly) return;

  const snapshot = readLiveSnapshot(args.snapshotPath);
  compareLiveToRepo(repo, snapshot);
  ok(`live Supabase schema matches repo voice/metrics contract${snapshot.checked_at ? ` at ${snapshot.checked_at}` : ''}`);
}

main();
