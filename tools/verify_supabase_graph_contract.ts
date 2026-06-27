import { spawnSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

type ColumnSnapshot = {
  table: string;
  name: string;
  type?: string;
  udt?: string;
  nullable?: string;
  default?: string | null;
};

type ConstraintSnapshot = {
  table: string;
  name?: string;
  type?: string;
  definition: string;
};

type IndexSnapshot = {
  table: string;
  name: string;
  definition?: string;
};

type FunctionSnapshot = {
  name: string;
  args?: string;
  result?: string;
  language?: string;
  volatility?: string;
  security_definer?: boolean;
};

type RlsSnapshot = {
  table: string;
  rowsecurity?: boolean;
};

type LiveSnapshot = {
  checked_at?: string;
  columns?: ColumnSnapshot[];
  constraints?: ConstraintSnapshot[];
  indexes?: IndexSnapshot[];
  functions?: FunctionSnapshot[];
  rls?: RlsSnapshot[];
  migration_history?: Array<{ version?: string; name?: string }>;
};

type ExpectedMigration = {
  name: string;
  version: string;
  file: string;
};

type ExpectedColumn = {
  table: string;
  name: string;
  type: string;
  nullable: 'YES' | 'NO';
  default: string | null;
};

const ROOT = process.cwd();
const GRAPH_CONTRACT_FILES = [
  'runtime/iskraSpace/supabase/schema.sql',
  'runtime/iskraSpace/supabase_graphrag_migration.sql',
  'supabase/migrations/20260305000000_graph_nodes.sql',
];
const GRAPH_LIVE_MIGRATION_RECEIPTS: ExpectedMigration[] = [
  {
    name: 'graph_schema_contract_repair',
    version: '20260626153642',
    file: 'supabase/migrations/20260626153642_graph_schema_contract_repair.sql',
  },
  {
    name: 'graph_schema_contract_hardening',
    version: '20260626153934',
    file: 'supabase/migrations/20260626153934_graph_schema_contract_hardening.sql',
  },
  {
    name: 'graph_anon_select_revoke',
    version: '20260626161747',
    file: 'supabase/migrations/20260626161747_graph_anon_select_revoke.sql',
  },
  {
    name: 'graph_rpc_boundary',
    version: '20260626164633',
    file: 'supabase/migrations/20260626164633_graph_rpc_boundary.sql',
  },
  {
    name: 'graph_rpc_boundary_acl_hardening',
    version: '20260626164745',
    file: 'supabase/migrations/20260626164745_graph_rpc_boundary_acl_hardening.sql',
  },
];

const REPAIR_MIGRATION_FILE = GRAPH_LIVE_MIGRATION_RECEIPTS[0].file;
const REPAIR_MIGRATION_VERSION = GRAPH_LIVE_MIGRATION_RECEIPTS[0].version;

const GRAPH_NODE_LAYERS = ['archive', 'mantra', 'shadow'].sort();
const GRAPH_NODE_TYPES = [
  'ACTION',
  'CANON',
  'CONFLICT',
  'DECISION',
  'EVENT',
  'INSIGHT',
  'QUESTION',
  'REFLECTION',
  'artifact',
  'decision',
  'event',
  'feedback',
  'insight',
].sort();
const GRAPH_EDGE_TYPES = [
  'CAUSAL',
  'CONTRADICTS',
  'DERIVES_FROM',
  'RELATED_TO',
  'RESONANCE',
  'SIMILARITY',
  'SUPPORTS',
].sort();

const EXPECTED_COLUMNS: ExpectedColumn[] = [
  { table: 'graph_nodes', name: 'id', type: 'text', nullable: 'NO', default: null },
  { table: 'graph_nodes', name: 'layer', type: 'text', nullable: 'NO', default: null },
  { table: 'graph_nodes', name: 'type', type: 'text', nullable: 'NO', default: null },
  { table: 'graph_nodes', name: 'content', type: 'text', nullable: 'NO', default: null },
  { table: 'graph_nodes', name: 'timestamp', type: 'timestamptz', nullable: 'NO', default: 'now()' },
  { table: 'graph_nodes', name: 'metrics_snapshot', type: 'jsonb', nullable: 'YES', default: null },
  { table: 'graph_nodes', name: 'related_ids', type: 'text[]', nullable: 'YES', default: null },
  { table: 'graph_nodes', name: 'resonance_score', type: 'real', nullable: 'YES', default: null },
  { table: 'graph_nodes', name: 'metadata', type: 'jsonb', nullable: 'YES', default: '{}' },
  { table: 'graph_nodes', name: 'created_at', type: 'timestamptz', nullable: 'YES', default: 'now()' },
  { table: 'graph_nodes', name: 'updated_at', type: 'timestamptz', nullable: 'YES', default: 'now()' },
  { table: 'graph_nodes', name: 'user_id', type: 'uuid', nullable: 'YES', default: null },
  { table: 'graph_edges', name: 'id', type: 'text', nullable: 'NO', default: null },
  { table: 'graph_edges', name: 'source', type: 'text', nullable: 'NO', default: null },
  { table: 'graph_edges', name: 'target', type: 'text', nullable: 'NO', default: null },
  { table: 'graph_edges', name: 'type', type: 'text', nullable: 'NO', default: null },
  { table: 'graph_edges', name: 'weight', type: 'real', nullable: 'NO', default: '0.5' },
  { table: 'graph_edges', name: 'metadata', type: 'jsonb', nullable: 'YES', default: '{}' },
  { table: 'graph_edges', name: 'created_at', type: 'timestamptz', nullable: 'YES', default: 'now()' },
  { table: 'graph_edges', name: 'user_id', type: 'uuid', nullable: 'YES', default: null },
];

const REQUIRED_INDEXES = [
  'idx_graph_edges_source',
  'idx_graph_edges_source_type',
  'idx_graph_edges_target',
  'idx_graph_edges_type',
  'idx_graph_edges_weight',
  'idx_graph_nodes_layer_type',
  'idx_graph_nodes_resonance',
  'idx_graph_nodes_timestamp',
  'idx_graph_nodes_user',
].sort();

const REQUIRED_FUNCTION_SECURITY_DEFINER: Record<string, boolean> = {
  graph_bfs_traversal: false,
  graph_find_resonant: false,
  graph_get_node_with_edges: true,
};
const REQUIRED_FUNCTIONS = Object.keys(REQUIRED_FUNCTION_SECURITY_DEFINER).sort();

const LIVE_SQL = `
select jsonb_build_object(
  'checked_at', now(),
  'columns', coalesce((
    select jsonb_agg(jsonb_build_object(
      'table', table_name,
      'name', column_name,
      'type', data_type,
      'udt', udt_name,
      'nullable', is_nullable,
      'default', column_default,
      'position', ordinal_position
    ) order by table_name, ordinal_position)
    from information_schema.columns
    where table_schema = 'public'
      and table_name in ('graph_nodes', 'graph_edges')
  ), '[]'::jsonb),
  'constraints', coalesce((
    select jsonb_agg(jsonb_build_object(
      'table', c.relname,
      'name', con.conname,
      'type', con.contype,
      'definition', pg_get_constraintdef(con.oid)
    ) order by c.relname, con.conname)
    from pg_constraint con
    join pg_class c on c.oid = con.conrelid
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relname in ('graph_nodes', 'graph_edges')
  ), '[]'::jsonb),
  'indexes', coalesce((
    select jsonb_agg(jsonb_build_object(
      'table', tablename,
      'name', indexname,
      'definition', indexdef
    ) order by tablename, indexname)
    from pg_indexes
    where schemaname = 'public'
      and tablename in ('graph_nodes', 'graph_edges')
  ), '[]'::jsonb),
  'functions', coalesce((
    select jsonb_agg(jsonb_build_object(
      'name', p.proname,
      'args', pg_get_function_arguments(p.oid),
      'result', pg_get_function_result(p.oid),
      'language', l.lanname,
      'volatility', p.provolatile,
      'security_definer', p.prosecdef
    ) order by p.proname)
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    join pg_language l on l.oid = p.prolang
    where n.nspname = 'public'
      and p.proname like 'graph_%'
  ), '[]'::jsonb),
  'rls', coalesce((
    select jsonb_agg(jsonb_build_object(
      'table', c.relname,
      'rowsecurity', c.relrowsecurity
    ) order by c.relname)
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relname in ('graph_nodes', 'graph_edges')
  ), '[]'::jsonb),
  'migration_history', coalesce((
    select jsonb_agg(jsonb_build_object('version', version, 'name', name) order by version desc)
    from supabase_migrations.schema_migrations
    where name in (
        'graph_schema_contract_repair',
        'graph_schema_contract_hardening',
        'graph_anon_select_revoke',
        'graph_rpc_boundary',
        'graph_rpc_boundary_acl_hardening',
        'graph_nodes'
      )
       or version in (
        '20260305000000',
        '20260626153642',
        '20260626153934',
        '20260626161747',
        '20260626164633',
        '20260626164745'
      )
  ), '[]'::jsonb)
)::text as graph_snapshot;
`.trim();

function fail(message: string): never {
  console.error(`[FAIL] ${message}`);
  process.exit(1);
}

function ok(message: string): void {
  console.log(`[OK] ${message}`);
}

function warn(message: string): void {
  console.warn(`[WARN] ${message}`);
}

function usage(): void {
  console.log(`Usage:
  npx tsx tools/verify_supabase_graph_contract.ts --repo-only
  npx tsx tools/verify_supabase_graph_contract.ts --snapshot <snapshot.json>
  SUPABASE_DB_URL=postgresql://... npx tsx tools/verify_supabase_graph_contract.ts

Options:
  --repo-only                  Verify repo graph contract files only.
  --snapshot                   Compare repo graph contract to a live snapshot JSON file.
  --print-sql                  Print the read-only SQL used to produce a live snapshot.
  --require-migration-history  Fail live check unless expected graph migration receipt versions are in Supabase migration history.

Env:
  SUPABASE_DB_URL or DATABASE_URL
  SUPABASE_LIVE_GRAPH_SCHEMA_SNAPSHOT_JSON
  SUPABASE_LIVE_GRAPH_SCHEMA_SNAPSHOT_FILE`);
}

function parseArgs(argv: string[]): {
  repoOnly: boolean;
  snapshotPath?: string;
  printSql: boolean;
  requireMigrationHistory: boolean;
} {
  const out = {
    repoOnly: false,
    snapshotPath: undefined as string | undefined,
    printSql: false,
    requireMigrationHistory: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--repo-only') out.repoOnly = true;
    else if (arg === '--print-sql') out.printSql = true;
    else if (arg === '--require-migration-history') out.requireMigrationHistory = true;
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
  if (!fs.existsSync(full)) fail(`Missing graph contract file: ${rel}`);
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

function extractColumnBlock(body: string, column: string, nextColumn: string): string {
  const pattern = new RegExp(`\\b${column}\\b[\\s\\S]*?\\n\\s*${nextColumn}\\b`, 'i');
  const match = body.match(pattern);
  if (!match) fail(`Missing ${column} column block before ${nextColumn}`);
  return match[0].replace(new RegExp(`\\n\\s*${nextColumn}\\b[\\s\\S]*$`, 'i'), '');
}

function extractQuotedValues(input: string): string[] {
  const values: string[] = [];
  const quoted = /'([^']+)'/g;
  let match: RegExpExecArray | null;
  while ((match = quoted.exec(input)) !== null) values.push(match[1]);
  return Array.from(new Set(values)).sort();
}

function normalizeSql(input: string): string {
  return input.replace(/\s+/g, ' ').trim().toLowerCase();
}

function normalizeDefault(value: string | null | undefined): string | null {
  if (value == null) return null;
  const raw = value.trim().toLowerCase();
  if (raw === '') return null;
  if (raw === 'now()') return 'now()';
  if (raw === "'{}'::jsonb" || raw === '{}') return '{}';
  const stripped = raw.replace(/::[a-z0-9_ ]+$/g, '').replace(/^'(.+)'$/g, '$1');
  const numeric = Number(stripped);
  if (Number.isFinite(numeric)) return numeric.toString();
  return stripped;
}

function normalizeLiveType(row: ColumnSnapshot): string {
  if (row.udt === '_text') return 'text[]';
  if (row.udt === 'timestamptz') return 'timestamptz';
  if (row.udt === 'float4') return 'real';
  if (row.udt) return row.udt;
  if (row.type === 'ARRAY') return 'text[]';
  if (row.type === 'timestamp with time zone') return 'timestamptz';
  return row.type ?? '';
}

function sameJson(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

function assertRepoColumn(body: string, file: string, expected: ExpectedColumn): void {
  const linePattern = new RegExp(`(?:^|\\n)\\s*${expected.name}\\b\\s+([^,\\n]+)`, 'i');
  const match = body.match(linePattern);
  if (!match) fail(`${file}: ${expected.table}.${expected.name} is missing`);

  const normalized = normalizeSql(match[0]);
  const type = expected.type === 'text[]' ? 'text[]' : expected.type;
  if (!normalized.includes(type)) {
    fail(`${file}: ${expected.table}.${expected.name} must be ${expected.type}, got: ${match[0].trim()}`);
  }
  if (expected.nullable === 'NO' && !normalized.includes('not null') && expected.name !== 'id') {
    fail(`${file}: ${expected.table}.${expected.name} must be NOT NULL`);
  }
  if (expected.default === null) {
    if (normalized.includes(' default ')) fail(`${file}: ${expected.table}.${expected.name} must not have a DEFAULT`);
  } else if (
    expected.default === '{}' &&
    !normalized.includes("default '{}'::jsonb") &&
    !normalized.includes('default {}')
  ) {
    fail(`${file}: ${expected.table}.${expected.name} must default to ${expected.default}`);
  } else if (expected.default !== '{}' && !normalized.includes(`default ${expected.default}`)) {
    fail(`${file}: ${expected.table}.${expected.name} must default to ${expected.default}`);
  }
}

function verifyRepoGraphContractFile(file: string): void {
  const sql = readText(file);
  const nodes = extractCreateTableBody(sql, 'graph_nodes', file);
  const edges = extractCreateTableBody(sql, 'graph_edges', file);

  for (const column of EXPECTED_COLUMNS) {
    assertRepoColumn(column.table === 'graph_nodes' ? nodes : edges, file, column);
  }

  const nodeLayerBlock = extractColumnBlock(nodes, 'layer', 'type');
  const nodeTypeBlock = extractColumnBlock(nodes, 'type', 'content');
  const edgeTypeBlock = extractColumnBlock(edges, 'type', 'weight');

  const nodeLayers = extractQuotedValues(nodeLayerBlock);
  const nodeTypes = extractQuotedValues(nodeTypeBlock);
  const edgeTypes = extractQuotedValues(edgeTypeBlock);

  if (!sameJson(nodeLayers, GRAPH_NODE_LAYERS)) {
    fail(`${file}: graph_nodes.layer CHECK drift. expected=${JSON.stringify(GRAPH_NODE_LAYERS)} got=${JSON.stringify(nodeLayers)}`);
  }
  if (!sameJson(nodeTypes, GRAPH_NODE_TYPES)) {
    fail(`${file}: graph_nodes.type CHECK drift. expected=${JSON.stringify(GRAPH_NODE_TYPES)} got=${JSON.stringify(nodeTypes)}`);
  }
  if (!sameJson(edgeTypes, GRAPH_EDGE_TYPES)) {
    fail(`${file}: graph_edges.type CHECK drift. expected=${JSON.stringify(GRAPH_EDGE_TYPES)} got=${JSON.stringify(edgeTypes)}`);
  }

  const whole = normalizeSql(sql);
  for (const indexName of REQUIRED_INDEXES) {
    if (!whole.includes(indexName)) fail(`${file}: missing required graph index ${indexName}`);
  }
  for (const functionName of REQUIRED_FUNCTIONS) {
    if (!whole.includes(`function ${functionName}`)) fail(`${file}: missing required graph RPC ${functionName}`);
  }
}

function verifyRepoContract(): void {
  for (const file of GRAPH_CONTRACT_FILES) verifyRepoGraphContractFile(file);

  for (const receipt of GRAPH_LIVE_MIGRATION_RECEIPTS) {
    const migration = readText(receipt.file);
    const normalized = normalizeSql(migration);
    for (const token of [receipt.name, receipt.version]) {
      if (!normalized.includes(token)) fail(`${receipt.file}: missing live migration receipt marker ${token}`);
    }
  }

  const repairMigration = normalizeSql(readText(REPAIR_MIGRATION_FILE));
  for (const token of ['related_to', 'timestamptz', 'references public.users']) {
    if (!repairMigration.includes(token)) fail(`${REPAIR_MIGRATION_FILE}: missing repair marker ${token}`);
  }

  ok(`repo graph contract files agree: ${GRAPH_CONTRACT_FILES.join(', ')}`);
}

function extractJsonObject(input: string): string {
  const trimmed = input.trim();
  const start = trimmed.indexOf('{');
  const end = trimmed.lastIndexOf('}');
  if (start < 0 || end < start) fail('No JSON object found in live graph snapshot input');
  return trimmed.slice(start, end + 1);
}

function unwrapSnapshot(parsed: unknown): LiveSnapshot {
  if (Array.isArray(parsed) && parsed.length === 1 && typeof parsed[0] === 'object' && parsed[0] !== null) {
    const row = parsed[0] as Record<string, unknown>;
    return unwrapSnapshot(row.graph_snapshot ?? row.current_snapshot ?? row.after_snapshot ?? row.before_snapshot ?? row);
  }

  if (typeof parsed === 'object' && parsed !== null) {
    const obj = parsed as Record<string, unknown>;
    if (typeof obj.result === 'string') return parseSnapshotJson(obj.result);
    if (obj.graph_snapshot || obj.current_snapshot || obj.after_snapshot || obj.before_snapshot) {
      return unwrapSnapshot(obj.graph_snapshot ?? obj.current_snapshot ?? obj.after_snapshot ?? obj.before_snapshot);
    }
    return obj as LiveSnapshot;
  }

  fail('Live graph snapshot JSON must be an object');
}

function parseSnapshotJson(input: string): LiveSnapshot {
  return unwrapSnapshot(JSON.parse(extractJsonObject(input)));
}

function readSnapshotFromPsql(): LiveSnapshot {
  const dbUrl = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;
  if (!dbUrl) {
    fail(
      'Missing live graph snapshot source. Set SUPABASE_DB_URL/DATABASE_URL, SUPABASE_LIVE_GRAPH_SCHEMA_SNAPSHOT_JSON, SUPABASE_LIVE_GRAPH_SCHEMA_SNAPSHOT_FILE, or pass --snapshot.',
    );
  }

  const result = spawnSync('psql', [dbUrl, '-t', '-A', '-v', 'ON_ERROR_STOP=1', '-c', LIVE_SQL], {
    encoding: 'utf8',
    windowsHide: true,
    maxBuffer: 1024 * 1024,
  });

  if (result.error) fail(`Failed to run psql: ${result.error.message}`);
  if (result.status !== 0) fail(`psql exited with ${result.status}: ${result.stderr.trim()}`);

  return parseSnapshotJson(result.stdout);
}

function readLiveSnapshot(snapshotPath?: string): LiveSnapshot {
  if (snapshotPath) return parseSnapshotJson(fs.readFileSync(snapshotPath, 'utf8'));
  if (process.env.SUPABASE_LIVE_GRAPH_SCHEMA_SNAPSHOT_JSON) {
    return parseSnapshotJson(process.env.SUPABASE_LIVE_GRAPH_SCHEMA_SNAPSHOT_JSON);
  }
  if (process.env.SUPABASE_LIVE_GRAPH_SCHEMA_SNAPSHOT_FILE) {
    return parseSnapshotJson(fs.readFileSync(process.env.SUPABASE_LIVE_GRAPH_SCHEMA_SNAPSHOT_FILE, 'utf8'));
  }
  return readSnapshotFromPsql();
}

function findLiveColumn(snapshot: LiveSnapshot, table: string, column: string): ColumnSnapshot {
  const row = (snapshot.columns ?? []).find((item) => item.table === table && item.name === column);
  if (!row) fail(`Live graph snapshot missing ${table}.${column}`);
  return row;
}

function verifyLiveColumns(snapshot: LiveSnapshot): void {
  for (const expected of EXPECTED_COLUMNS) {
    const row = findLiveColumn(snapshot, expected.table, expected.name);
    const liveType = normalizeLiveType(row);
    const liveDefault = normalizeDefault(row.default);
    if (liveType !== expected.type) {
      fail(`Live ${expected.table}.${expected.name} type is ${liveType}, expected ${expected.type}`);
    }
    if ((row.nullable ?? '') !== expected.nullable) {
      fail(`Live ${expected.table}.${expected.name} nullable is ${row.nullable}, expected ${expected.nullable}`);
    }
    if (liveDefault !== expected.default) {
      fail(`Live ${expected.table}.${expected.name} default is ${liveDefault}, expected ${expected.default}`);
    }
  }
}

function liveCheckValues(snapshot: LiveSnapshot, table: string, constraintName: string): string[] {
  const row = (snapshot.constraints ?? []).find((item) => item.table === table && item.name === constraintName);
  if (!row) fail(`Live graph snapshot missing ${table}.${constraintName}`);
  return extractQuotedValues(row.definition);
}

function verifyLiveConstraints(snapshot: LiveSnapshot): void {
  const nodeLayers = liveCheckValues(snapshot, 'graph_nodes', 'graph_nodes_layer_check');
  const nodeTypes = liveCheckValues(snapshot, 'graph_nodes', 'graph_nodes_type_check');
  const edgeTypes = liveCheckValues(snapshot, 'graph_edges', 'graph_edges_type_check');

  if (!sameJson(nodeLayers, GRAPH_NODE_LAYERS)) {
    fail(`Live graph_nodes.layer CHECK drift. expected=${JSON.stringify(GRAPH_NODE_LAYERS)} got=${JSON.stringify(nodeLayers)}`);
  }
  if (!sameJson(nodeTypes, GRAPH_NODE_TYPES)) {
    fail(`Live graph_nodes.type CHECK drift. expected=${JSON.stringify(GRAPH_NODE_TYPES)} got=${JSON.stringify(nodeTypes)}`);
  }
  if (!sameJson(edgeTypes, GRAPH_EDGE_TYPES)) {
    fail(`Live graph_edges.type CHECK drift. expected=${JSON.stringify(GRAPH_EDGE_TYPES)} got=${JSON.stringify(edgeTypes)}`);
  }

  for (const required of [
    'graph_edges_source_fkey',
    'graph_edges_target_fkey',
    'graph_edges_user_id_fkey',
    'graph_edges_weight_check',
    'unique_edge',
    'graph_nodes_resonance_score_check',
    'graph_nodes_user_id_fkey',
  ]) {
    if (!(snapshot.constraints ?? []).some((item) => item.name === required)) {
      fail(`Live graph snapshot missing constraint ${required}`);
    }
  }
}

function verifyLiveIndexes(snapshot: LiveSnapshot): void {
  const liveIndexes = new Set((snapshot.indexes ?? []).map((row) => row.name));
  for (const indexName of REQUIRED_INDEXES) {
    if (!liveIndexes.has(indexName)) fail(`Live graph snapshot missing index ${indexName}`);
  }
}

function verifyLiveFunctions(snapshot: LiveSnapshot): void {
  for (const [functionName, expectedSecurityDefiner] of Object.entries(REQUIRED_FUNCTION_SECURITY_DEFINER)) {
    const fn = (snapshot.functions ?? []).find((row) => row.name === functionName);
    if (!fn) fail(`Live graph snapshot missing RPC ${functionName}`);
    if (fn.security_definer !== expectedSecurityDefiner) {
      fail(
        `Live graph RPC ${functionName} security_definer is ${String(fn.security_definer)}, expected ${String(
          expectedSecurityDefiner,
        )}`,
      );
    }
  }
}

function verifyLiveRls(snapshot: LiveSnapshot): void {
  for (const table of ['graph_nodes', 'graph_edges']) {
    const row = (snapshot.rls ?? []).find((item) => item.table === table);
    if (!row) fail(`Live graph snapshot missing RLS metadata for ${table}`);
    if (row.rowsecurity !== true) fail(`Live ${table} must have row level security enabled`);
  }
}

function verifyMigrationHistory(snapshot: LiveSnapshot, requireMigrationHistory: boolean): void {
  for (const expected of GRAPH_LIVE_MIGRATION_RECEIPTS) {
    const migration = (snapshot.migration_history ?? []).find(
      (row) => row.name === expected.name && row.version === expected.version,
    );
    if (!migration) {
      const message = `Live migration history does not include ${expected.name} version ${expected.version}`;
      if (requireMigrationHistory) fail(message);
      warn(`${message}; structural graph contract still matched live snapshot`);
    }
  }
}

function compareLiveToRepo(snapshot: LiveSnapshot, requireMigrationHistory: boolean): void {
  verifyLiveColumns(snapshot);
  verifyLiveConstraints(snapshot);
  verifyLiveIndexes(snapshot);
  verifyLiveFunctions(snapshot);
  verifyLiveRls(snapshot);
  verifyMigrationHistory(snapshot, requireMigrationHistory);
}

function main(): void {
  const args = parseArgs(process.argv.slice(2));

  if (args.printSql) {
    console.log(LIVE_SQL);
    if (!args.repoOnly && !args.snapshotPath) return;
  }

  verifyRepoContract();

  if (args.repoOnly) return;

  const snapshot = readLiveSnapshot(args.snapshotPath);
  compareLiveToRepo(snapshot, args.requireMigrationHistory);
  ok(`live Supabase graph contract matches repo invariants${snapshot.checked_at ? ` at ${snapshot.checked_at}` : ''}`);
}

main();
