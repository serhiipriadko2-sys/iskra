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
  definition?: string;
};

type PolicySnapshot = {
  table: string;
  name: string;
  command?: string;
  permissive?: string;
  roles?: string[];
  using?: string | null;
  with_check?: string | null;
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
  policies?: PolicySnapshot[];
  rls?: RlsSnapshot[];
  migration_history?: Array<{ version?: string; name?: string }>;
};

type ExpectedColumn = {
  table: string;
  name: string;
  type: string;
  nullable: 'YES' | 'NO';
  default: string | null;
};

type ExpectedMigration = {
  name: string;
  version: string;
  file: string;
};

const ROOT = process.cwd();

// Production SQL is an ordered root migration chain. Runtime copies below are
// retained only as historical snapshots and are intentionally not SQL inputs.
const CANONICAL_GRAPH_MIGRATION_FILES = [
  'supabase/migrations/20260305000000_graph_nodes.sql',
  'supabase/migrations/20260626153642_graph_schema_contract_repair.sql',
  'supabase/migrations/20260626153934_graph_schema_contract_hardening.sql',
  'supabase/migrations/20260626161747_graph_anon_select_revoke.sql',
  'supabase/migrations/20260626164633_graph_rpc_boundary.sql',
  'supabase/migrations/20260626164745_graph_rpc_boundary_acl_hardening.sql',
  'supabase/migrations/20260709170000_closed_beta_access_boundary.sql',
  'supabase/migrations/20260710110000_graph_shared_row_guard.sql',
];

const LEGACY_RUNTIME_SQL_SNAPSHOTS = [
  'runtime/iskraSpace/supabase/schema.sql',
  'runtime/iskraSpace/supabase_graphrag_migration.sql',
];

const GRAPH_RUNTIME_SERVICE = 'runtime/iskraSpace/services/graphServiceSupabase.ts';
const GRAPH_BASE_SCHEMA_FILE = CANONICAL_GRAPH_MIGRATION_FILES[0];
const GRAPH_RPC_BOUNDARY_FILE = CANONICAL_GRAPH_MIGRATION_FILES[4];
const GRAPH_RPC_ACL_FILE = CANONICAL_GRAPH_MIGRATION_FILES[5];
const CLOSED_BETA_FILE = CANONICAL_GRAPH_MIGRATION_FILES[6];
const GRAPH_SHARED_ROW_GUARD_FILE = CANONICAL_GRAPH_MIGRATION_FILES[7];

const CANONICAL_GRAPH_MIGRATION_RECEIPTS: ExpectedMigration[] = CANONICAL_GRAPH_MIGRATION_FILES.map((file) => {
  const match = path.basename(file).match(/^(\d+)_([^/]+)\.sql$/);
  if (!match) throw new Error(`Invalid canonical graph migration name: ${file}`);
  return { version: match[1], name: match[2], file };
});

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

const REQUIRED_GRAPH_RPC_NAMES = [
  'graph_create_edge',
  'graph_create_node',
  'graph_delete_node',
  'graph_find_resonant_nodes',
  'graph_get_connection_candidates',
  'graph_get_node_with_edges',
  'graph_get_stats',
  'graph_get_user_nodes',
  'graph_search_nodes',
  'graph_traverse_bfs_nodes',
  'graph_update_node_resonance',
].sort();

const MUTATING_GRAPH_RPC_NAMES = [
  'graph_create_edge',
  'graph_create_node',
  'graph_delete_node',
  'graph_update_node_resonance',
].sort();

const REQUIRED_GRAPH_POLICY_NAMES = [
  'graph_nodes_active_beta_read_visible',
  'graph_nodes_active_beta_insert_own',
  'graph_nodes_active_beta_update_own',
  'graph_nodes_active_beta_delete_own',
  'graph_edges_active_beta_read_visible',
  'graph_edges_active_beta_insert_own',
  'graph_edges_active_beta_update_own',
  'graph_edges_active_beta_delete_own',
].sort();

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
      'security_definer', p.prosecdef,
      'definition', pg_get_functiondef(p.oid)
    ) order by p.proname)
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    join pg_language l on l.oid = p.prolang
    where n.nspname = 'public'
      and p.proname = any (array[
        'graph_create_edge',
        'graph_create_node',
        'graph_delete_node',
        'graph_find_resonant_nodes',
        'graph_get_connection_candidates',
        'graph_get_node_with_edges',
        'graph_get_stats',
        'graph_get_user_nodes',
        'graph_search_nodes',
        'graph_traverse_bfs_nodes',
        'graph_update_node_resonance'
      ])
  ), '[]'::jsonb),
  'policies', coalesce((
    select jsonb_agg(jsonb_build_object(
      'table', tablename,
      'name', policyname,
      'command', cmd,
      'permissive', permissive,
      'roles', roles,
      'using', qual,
      'with_check', with_check
    ) order by tablename, policyname)
    from pg_policies
    where schemaname = 'public'
      and tablename in ('graph_nodes', 'graph_edges')
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
    where version = any (array[
      '20260305000000',
      '20260626153642',
      '20260626153934',
      '20260626161747',
      '20260626164633',
      '20260626164745',
      '20260709170000',
      '20260710110000'
    ])
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
  --repo-only                    Verify the canonical root-migration graph contract only.
  --snapshot <snapshot.json>     Compare canonical contract to a read-only live snapshot.
  --print-sql                    Print the read-only SQL used to produce a live snapshot.
  --allow-unreconciled-history   Downgrade missing live migration receipts to warnings; never release-ready.
  --require-migration-history    Accepted for compatibility; strict receipt checking is already the default.

Live mode requires migration receipts by default. Repo-only mode proves neither
deployed DDL nor Supabase function state. Runtime SQL snapshots are deliberately
excluded because applying them can reintroduce superseded GraphRAG policies.

Env:
  SUPABASE_DB_URL or DATABASE_URL
  SUPABASE_LIVE_GRAPH_SCHEMA_SNAPSHOT_JSON
  SUPABASE_LIVE_GRAPH_SCHEMA_SNAPSHOT_FILE`);
}

function parseArgs(argv: string[]): {
  repoOnly: boolean;
  snapshotPath?: string;
  printSql: boolean;
  allowUnreconciledHistory: boolean;
} {
  const out = {
    repoOnly: false,
    snapshotPath: undefined as string | undefined,
    printSql: false,
    allowUnreconciledHistory: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--repo-only') out.repoOnly = true;
    else if (arg === '--print-sql') out.printSql = true;
    else if (arg === '--allow-unreconciled-history') out.allowUnreconciledHistory = true;
    else if (arg === '--require-migration-history') continue;
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
  if (!fs.existsSync(full)) fail(`Missing canonical graph contract file: ${rel}`);
  return fs.readFileSync(full, 'utf8').replace(/\r\n/g, '\n');
}

function normalizeSql(input: string): string {
  return input.replace(/\s+/g, ' ').trim().toLowerCase();
}

function sameJson(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function extractCreateTableBody(sql: string, table: string, fileLabel: string): string {
  const pattern = new RegExp(
    `CREATE\\s+TABLE\\s+(?:IF\\s+NOT\\s+EXISTS\\s+)?${escapeRegex(table)}\\s*\\(([\\s\\S]*?)\\n\\);`,
    'i',
  );
  const match = sql.match(pattern);
  if (!match) fail(`${fileLabel}: missing CREATE TABLE body for ${table}`);
  return match[1];
}

function extractColumnBlock(body: string, column: string, nextColumn: string): string {
  const pattern = new RegExp(`\\b${escapeRegex(column)}\\b[\\s\\S]*?\\n\\s*${escapeRegex(nextColumn)}\\b`, 'i');
  const match = body.match(pattern);
  if (!match) fail(`Missing ${column} column block before ${nextColumn}`);
  return match[0].replace(new RegExp(`\\n\\s*${escapeRegex(nextColumn)}\\b[\\s\\S]*$`, 'i'), '');
}

function extractQuotedValues(input: string): string[] {
  const values: string[] = [];
  const quoted = /'([^']+)'/g;
  let match: RegExpExecArray | null;
  while ((match = quoted.exec(input)) !== null) values.push(match[1]);
  return Array.from(new Set(values)).sort();
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

function assertRepoColumn(body: string, file: string, expected: ExpectedColumn): void {
  const linePattern = new RegExp(`(?:^|\\n)\\s*${escapeRegex(expected.name)}\\b\\s+([^,\\n]+)`, 'i');
  const match = body.match(linePattern);
  if (!match) fail(`${file}: ${expected.table}.${expected.name} is missing`);

  const normalized = normalizeSql(match[0]);
  if (!normalized.includes(expected.type)) {
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

function assertCanonicalBaseTables(): void {
  const sql = readText(GRAPH_BASE_SCHEMA_FILE);
  const nodes = extractCreateTableBody(sql, 'graph_nodes', GRAPH_BASE_SCHEMA_FILE);
  const edges = extractCreateTableBody(sql, 'graph_edges', GRAPH_BASE_SCHEMA_FILE);

  for (const column of EXPECTED_COLUMNS) {
    assertRepoColumn(column.table === 'graph_nodes' ? nodes : edges, GRAPH_BASE_SCHEMA_FILE, column);
  }

  const nodeLayerBlock = extractColumnBlock(nodes, 'layer', 'type');
  const nodeTypeBlock = extractColumnBlock(nodes, 'type', 'content');
  const edgeTypeBlock = extractColumnBlock(edges, 'type', 'weight');

  if (!sameJson(extractQuotedValues(nodeLayerBlock), GRAPH_NODE_LAYERS)) {
    fail(`${GRAPH_BASE_SCHEMA_FILE}: graph_nodes.layer CHECK drift`);
  }
  if (!sameJson(extractQuotedValues(nodeTypeBlock), GRAPH_NODE_TYPES)) {
    fail(`${GRAPH_BASE_SCHEMA_FILE}: graph_nodes.type CHECK drift`);
  }
  if (!sameJson(extractQuotedValues(edgeTypeBlock), GRAPH_EDGE_TYPES)) {
    fail(`${GRAPH_BASE_SCHEMA_FILE}: graph_edges.type CHECK drift`);
  }

  for (const indexName of REQUIRED_INDEXES) {
    if (!new RegExp(`create\\s+index\\s+(?:if\\s+not\\s+exists\\s+)?${escapeRegex(indexName)}\\b`, 'i').test(sql)) {
      fail(`${GRAPH_BASE_SCHEMA_FILE}: missing required graph index ${indexName}`);
    }
  }
}

function extractFunctionDefinition(sql: string, name: string, file: string): string {
  const pattern = new RegExp(
    `create\\s+(?:or\\s+replace\\s+)?function\\s+public\\.${escapeRegex(name)}\\s*\\([\\s\\S]*?\\)\\s*returns[\\s\\S]*?as\\s+\\$\\$[\\s\\S]*?\\$\\$\\s*;`,
    'i',
  );
  const match = sql.match(pattern);
  if (!match) fail(`${file}: missing current definition for RPC ${name}`);
  return match[0];
}

function extractGraphServiceRpcNames(): string[] {
  const service = readText(GRAPH_RUNTIME_SERVICE);
  const names = Array.from(
    service.matchAll(/graphRpcClient\.rpc(?:<[^>]+>)?\(\s*'([a-z0-9_]+)'/g),
    ([, name]) => name,
  );
  return Array.from(new Set(names)).sort();
}

function assertContains(value: string, expected: string, context: string): void {
  if (!normalizeSql(value).includes(normalizeSql(expected))) {
    fail(`${context}: expected ${JSON.stringify(expected)}`);
  }
}

function assertCurrentGraphRpcBoundary(): void {
  const actualRuntimeRpcNames = extractGraphServiceRpcNames();
  if (!sameJson(actualRuntimeRpcNames, REQUIRED_GRAPH_RPC_NAMES)) {
    fail(
      `${GRAPH_RUNTIME_SERVICE}: RPC surface drift. expected=${JSON.stringify(REQUIRED_GRAPH_RPC_NAMES)} got=${JSON.stringify(actualRuntimeRpcNames)}`,
    );
  }

  const closedBetaSql = readText(CLOSED_BETA_FILE);
  assertContains(closedBetaSql, 'create schema if not exists private', CLOSED_BETA_FILE);
  assertContains(closedBetaSql, 'create or replace function private.is_active_beta_member()', CLOSED_BETA_FILE);
  assertContains(closedBetaSql, "auth.jwt() ->> 'is_anonymous'", CLOSED_BETA_FILE);
  assertContains(closedBetaSql, 'create policy beta_membership_required', CLOSED_BETA_FILE);

  for (const rpcName of REQUIRED_GRAPH_RPC_NAMES) {
    const definition = extractFunctionDefinition(closedBetaSql, rpcName, CLOSED_BETA_FILE);
    assertContains(definition, 'security definer', `${CLOSED_BETA_FILE}:${rpcName}`);
    assertContains(definition, 'set search_path', `${CLOSED_BETA_FILE}:${rpcName}`);
    assertContains(definition, 'private.is_active_beta_member()', `${CLOSED_BETA_FILE}:${rpcName}`);
    assertContains(definition, 'auth.uid()', `${CLOSED_BETA_FILE}:${rpcName}`);
  }

  const aclSql = readText(GRAPH_RPC_ACL_FILE);
  for (const rpcName of REQUIRED_GRAPH_RPC_NAMES) {
    assertContains(aclSql, `revoke all on function public.${rpcName}`, `${GRAPH_RPC_ACL_FILE}:${rpcName}`);
    assertContains(aclSql, `grant execute on function public.${rpcName}`, `${GRAPH_RPC_ACL_FILE}:${rpcName}`);
  }

  const boundarySql = readText(GRAPH_RPC_BOUNDARY_FILE);
  assertContains(boundarySql, 'set search_path = public, pg_temp', GRAPH_RPC_BOUNDARY_FILE);
}

function assertCurrentGraphSharedRowGuard(): void {
  const sql = readText(GRAPH_SHARED_ROW_GUARD_FILE);

  for (const policyName of REQUIRED_GRAPH_POLICY_NAMES) {
    if (!new RegExp(`create\\s+policy\\s+${escapeRegex(policyName)}\\b`, 'i').test(sql)) {
      fail(`${GRAPH_SHARED_ROW_GUARD_FILE}: missing closed-beta graph policy ${policyName}`);
    }
  }

  assertContains(sql, 'create policy graph_nodes_active_beta_read_visible', GRAPH_SHARED_ROW_GUARD_FILE);
  assertContains(sql, 'user_id = (select auth.uid()) or user_id is null', GRAPH_SHARED_ROW_GUARD_FILE);
  assertContains(sql, 'create policy graph_nodes_active_beta_insert_own', GRAPH_SHARED_ROW_GUARD_FILE);
  assertContains(sql, 'create policy graph_edges_active_beta_insert_own', GRAPH_SHARED_ROW_GUARD_FILE);
  assertContains(sql, 'user_id = (select auth.uid())', GRAPH_SHARED_ROW_GUARD_FILE);

  for (const rpcName of MUTATING_GRAPH_RPC_NAMES) {
    const definition = extractFunctionDefinition(sql, rpcName, GRAPH_SHARED_ROW_GUARD_FILE);
    assertContains(definition, 'security definer', `${GRAPH_SHARED_ROW_GUARD_FILE}:${rpcName}`);
    assertContains(definition, 'if not private.is_active_beta_member()', `${GRAPH_SHARED_ROW_GUARD_FILE}:${rpcName}`);
  }

  const createEdge = extractFunctionDefinition(sql, 'graph_create_edge', GRAPH_SHARED_ROW_GUARD_FILE);
  assertContains(createEdge, 'where public.graph_edges.user_id = v_uid', `${GRAPH_SHARED_ROW_GUARD_FILE}:graph_create_edge`);
  if (/where\s+public\.graph_edges\.user_id\s*=\s*v_uid\s+or\s+public\.graph_edges\.user_id\s+is\s+null/i.test(createEdge)) {
    fail(`${GRAPH_SHARED_ROW_GUARD_FILE}:graph_create_edge permits shared-edge conflict updates`);
  }

  const deleteNode = extractFunctionDefinition(sql, 'graph_delete_node', GRAPH_SHARED_ROW_GUARD_FILE);
  assertContains(deleteNode, 'and node.user_id = v_uid', `${GRAPH_SHARED_ROW_GUARD_FILE}:graph_delete_node`);
  assertContains(deleteNode, 'edge.user_id is distinct from v_uid', `${GRAPH_SHARED_ROW_GUARD_FILE}:graph_delete_node`);

  const updateNode = extractFunctionDefinition(sql, 'graph_update_node_resonance', GRAPH_SHARED_ROW_GUARD_FILE);
  assertContains(updateNode, 'and node.user_id = v_uid', `${GRAPH_SHARED_ROW_GUARD_FILE}:graph_update_node_resonance`);

  assertContains(sql, 'create trigger graph_nodes_block_cross_owner_cascade', GRAPH_SHARED_ROW_GUARD_FILE);
}

function assertLegacySnapshotsAreExcluded(): void {
  for (const file of LEGACY_RUNTIME_SQL_SNAPSHOTS) {
    const header = readText(file).split('\n').slice(0, 8).join('\n');
    if (!/^--\s+DEPRECATED:.*DO NOT APPLY/im.test(header)) {
      fail(`${file}: legacy manual SQL snapshot must start with a DEPRECATED / DO NOT APPLY header`);
    }
    warn(`legacy manual SQL snapshot excluded from release contracts: ${file}`);
  }
}

function verifyRepoContract(): void {
  for (const file of CANONICAL_GRAPH_MIGRATION_FILES) readText(file);
  assertCanonicalBaseTables();
  assertCurrentGraphRpcBoundary();
  assertCurrentGraphSharedRowGuard();
  assertLegacySnapshotsAreExcluded();
  ok(`canonical root-migration graph contract verified: ${CANONICAL_GRAPH_MIGRATION_FILES.join(', ')}`);
  warn('repo-only graph contract does not prove deployed DDL, deployed Edge Functions, or live migration parity');
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
    const row = parsed as Record<string, unknown>;
    if (row.current_snapshot || row.after_snapshot || row.before_snapshot || row.audit_snapshot) {
      return unwrapSnapshot(row.current_snapshot ?? row.after_snapshot ?? row.before_snapshot ?? row.audit_snapshot);
    }
    return row as LiveSnapshot;
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
      'Missing live snapshot source. Set SUPABASE_DB_URL/DATABASE_URL, SUPABASE_LIVE_GRAPH_SCHEMA_SNAPSHOT_JSON, SUPABASE_LIVE_GRAPH_SCHEMA_SNAPSHOT_FILE, or pass --snapshot.',
    );
  }

  const result = spawnSync('psql', [dbUrl, '-t', '-A', '-v', 'ON_ERROR_STOP=1', '-c', LIVE_SQL], {
    encoding: 'utf8',
    windowsHide: true,
    maxBuffer: 8 * 1024 * 1024,
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
    if (normalizeLiveType(row) !== expected.type) {
      fail(`Live ${expected.table}.${expected.name} type is ${normalizeLiveType(row)}, expected ${expected.type}`);
    }
    if ((row.nullable ?? '') !== expected.nullable) {
      fail(`Live ${expected.table}.${expected.name} nullable is ${row.nullable}, expected ${expected.nullable}`);
    }
    if (normalizeDefault(row.default) !== expected.default) {
      fail(`Live ${expected.table}.${expected.name} default is ${normalizeDefault(row.default)}, expected ${expected.default}`);
    }
  }
}

function liveCheckValues(snapshot: LiveSnapshot, table: string, constraintName: string): string[] {
  const row = (snapshot.constraints ?? []).find((item) => item.table === table && item.name === constraintName);
  if (!row) fail(`Live graph snapshot missing ${table}.${constraintName}`);
  return extractQuotedValues(row.definition);
}

function verifyLiveConstraints(snapshot: LiveSnapshot): void {
  if (!sameJson(liveCheckValues(snapshot, 'graph_nodes', 'graph_nodes_layer_check'), GRAPH_NODE_LAYERS)) {
    fail('Live graph_nodes.layer CHECK drift');
  }
  if (!sameJson(liveCheckValues(snapshot, 'graph_nodes', 'graph_nodes_type_check'), GRAPH_NODE_TYPES)) {
    fail('Live graph_nodes.type CHECK drift');
  }
  if (!sameJson(liveCheckValues(snapshot, 'graph_edges', 'graph_edges_type_check'), GRAPH_EDGE_TYPES)) {
    fail('Live graph_edges.type CHECK drift');
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
  for (const name of REQUIRED_GRAPH_RPC_NAMES) {
    const fn = (snapshot.functions ?? []).find((row) => row.name === name);
    if (!fn) fail(`Live graph snapshot missing RPC ${name}`);
    if (fn.security_definer !== true) fail(`Live graph RPC ${name} must be SECURITY DEFINER`);
    if (!fn.definition) fail(`Live graph snapshot must include pg_get_functiondef output for ${name}`);
    assertContains(fn.definition, 'private.is_active_beta_member()', `Live graph RPC ${name}`);
    assertContains(fn.definition, 'auth.uid()', `Live graph RPC ${name}`);
  }

  const createEdge = (snapshot.functions ?? []).find((row) => row.name === 'graph_create_edge')?.definition ?? '';
  assertContains(createEdge, 'where public.graph_edges.user_id = v_uid', 'Live graph RPC graph_create_edge');
  if (/where\s+public\.graph_edges\.user_id\s*=\s*v_uid\s+or\s+public\.graph_edges\.user_id\s+is\s+null/i.test(createEdge)) {
    fail('Live graph RPC graph_create_edge permits shared-edge conflict updates');
  }

  for (const name of ['graph_delete_node', 'graph_update_node_resonance']) {
    const definition = (snapshot.functions ?? []).find((row) => row.name === name)?.definition ?? '';
    assertContains(definition, 'and node.user_id = v_uid', `Live graph RPC ${name}`);
  }
}

function verifyLiveRls(snapshot: LiveSnapshot): void {
  for (const table of ['graph_nodes', 'graph_edges']) {
    const row = (snapshot.rls ?? []).find((item) => item.table === table);
    if (!row) fail(`Live graph snapshot missing RLS metadata for ${table}`);
    if (row.rowsecurity !== true) fail(`Live ${table} must have row level security enabled`);
  }
}

function normalizePolicyExpression(policy: PolicySnapshot): string {
  return normalizeSql(`${policy.using ?? ''} ${policy.with_check ?? ''}`);
}

function verifyLivePolicies(snapshot: LiveSnapshot): void {
  const policies = snapshot.policies ?? [];
  for (const name of REQUIRED_GRAPH_POLICY_NAMES) {
    const policy = policies.find((item) => item.name === name);
    if (!policy) fail(`Live graph snapshot missing policy ${name}`);
    if (!normalizePolicyExpression(policy).includes('private.is_active_beta_member')) {
      fail(`Live graph policy ${name} is missing the active closed-beta membership guard`);
    }
  }

  for (const table of ['graph_nodes', 'graph_edges']) {
    const membershipPolicy = policies.find((item) => item.table === table && item.name === 'beta_membership_required');
    if (!membershipPolicy) fail(`Live ${table} is missing restrictive beta_membership_required policy`);
    if (membershipPolicy.permissive?.toUpperCase() !== 'RESTRICTIVE') {
      fail(`Live ${table}.beta_membership_required must be RESTRICTIVE`);
    }
    if (!normalizePolicyExpression(membershipPolicy).includes('private.is_active_beta_member')) {
      fail(`Live ${table}.beta_membership_required is missing active-member guard`);
    }
  }
}

function verifyMigrationHistory(snapshot: LiveSnapshot, allowUnreconciledHistory: boolean): void {
  const missing = CANONICAL_GRAPH_MIGRATION_RECEIPTS.filter(
    (expected) => !(snapshot.migration_history ?? []).some((row) => row.name === expected.name && row.version === expected.version),
  );
  if (missing.length === 0) return;

  const message = `Live migration history is missing canonical graph receipts: ${missing
    .map((item) => `${item.version}_${item.name}`)
    .join(', ')}`;
  if (allowUnreconciledHistory) {
    warn(`${message}. Structural-only check is explicitly non-release-ready.`);
    return;
  }
  fail(message);
}

function compareLiveToRepo(snapshot: LiveSnapshot, allowUnreconciledHistory: boolean): void {
  verifyLiveColumns(snapshot);
  verifyLiveConstraints(snapshot);
  verifyLiveIndexes(snapshot);
  verifyLiveFunctions(snapshot);
  verifyLiveRls(snapshot);
  verifyLivePolicies(snapshot);
  verifyMigrationHistory(snapshot, allowUnreconciledHistory);
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
  compareLiveToRepo(snapshot, args.allowUnreconciledHistory);
  ok(`live Supabase graph contract matches canonical migration invariants${snapshot.checked_at ? ` at ${snapshot.checked_at}` : ''}`);
}

main();
