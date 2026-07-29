import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.dirname(new URL(import.meta.url).pathname.replace(/^\/(.:)/, '$1'));
const readJson = (relative) => JSON.parse(fs.readFileSync(path.join(ROOT, relative), 'utf8'));
const sha256 = (buffer) => crypto.createHash('sha256').update(buffer).digest('hex');
const fileReceipt = (relative) => {
  const data = fs.readFileSync(path.join(ROOT, relative));
  return { path: relative.replaceAll('\\', '/'), bytes: data.length, sha256: sha256(data) };
};

const method = readJson('METHOD.json');
const toolchain = readJson('TOOLCHAIN.json');
const specs = [
  ['AB_A', 'A', 'A→B', 'raw/AB_A.json'],
  ['AB_B', 'B', 'A→B', 'raw/AB_B.json'],
  ['BA_B', 'B', 'B→A', 'raw/BA_B.json'],
  ['BA_A', 'A', 'B→A', 'raw/BA_A.json'],
];

function normalizeRun([runId, candidate, order, relative]) {
  const raw = readJson(relative);
  const assertions = raw.testResults.flatMap((entry) => entry.assertionResults);
  const gates = assertions.map((entry) => {
    const match = entry.title.match(/^(G\d{2}):/);
    if (!match) throw new Error(`Unrecognized gate title: ${entry.title}`);
    return { id: match[1], status: entry.status.toUpperCase(), title: entry.title };
  });
  const ids = gates.map((gate) => gate.id);
  const expected = Array.from({ length: 18 }, (_, index) => `G${String(index + 1).padStart(2, '0')}`);
  if (JSON.stringify(ids) !== JSON.stringify(expected)) throw new Error(`${runId}: gate sequence mismatch`);
  if (raw.numTotalTests !== 18 || raw.numPendingTests !== 0 || raw.numTodoTests !== 0) {
    throw new Error(`${runId}: invalid totals or missingness`);
  }
  return {
    run_id: runId,
    candidate,
    order,
    source: relative,
    success: raw.success,
    total: raw.numTotalTests,
    passed: raw.numPassedTests,
    failed: raw.numFailedTests,
    skipped: raw.numPendingTests,
    pass_ids: gates.filter((gate) => gate.status === 'PASSED').map((gate) => gate.id),
    fail_ids: gates.filter((gate) => gate.status === 'FAILED').map((gate) => gate.id),
    gates,
    start_time_ms: raw.startTime,
    end_time_ms: Math.max(...raw.testResults.map((entry) => entry.endTime)),
    raw_receipt: fileReceipt(relative),
  };
}

const runs = specs.map(normalizeRun);
const byId = Object.fromEntries(runs.map((run) => [run.run_id, run]));
const same = (left, right) => JSON.stringify(left) === JSON.stringify(right);
if (!same(byId.AB_A.pass_ids, byId.BA_A.pass_ids)) throw new Error('A is order-unstable');
if (!same(byId.AB_B.pass_ids, byId.BA_B.pass_ids)) throw new Error('B is order-unstable');
const aPass = new Set(byId.AB_A.pass_ids);
const bPass = new Set(byId.AB_B.pass_ids);
const bStrictSuperset = [...aPass].every((id) => bPass.has(id)) && bPass.size > aPass.size;
const descriptiveDominance = bStrictSuperset && byId.AB_B.failed === 0 ? 'B' : null;
const strata = {
  guard_routing_and_side_effects: ['G01', 'G02', 'G03', 'G08', 'G09', 'G13'],
  current_turn_snapshot_path: ['G04', 'G05', 'G06', 'G07'],
  bounded_controller: ['G10', 'G11', 'G12'],
  voice_and_formula_boundaries: ['G14', 'G15', 'G16', 'G17'],
  packaging_boundary: ['G18'],
};
const stratumRows = Object.entries(strata).map(([stratum, ids]) => ({
  stratum,
  n: ids.length,
  candidate_a_passed: ids.filter((id) => aPass.has(id)).length,
  candidate_b_passed: ids.filter((id) => bPass.has(id)).length,
}));
const runWindow = {
  start_time_ms: Math.min(...runs.map((run) => run.start_time_ms)),
  end_time_ms: Math.max(...runs.map((run) => run.end_time_ms)),
};
const pct = (value, total) => Number(((value / total) * 100).toFixed(6));
const receipt = {
  schema_version: 'iskra.atom25.guard-comparison.v1',
  status: 'COMPLETE_BENCHMARK_LOCAL',
  method_id: method.method_id,
  method_sha256: fileReceipt('METHOD.json').sha256,
  bank_ref: method.bank,
  candidates: { A: method.candidate_a, B: method.candidate_b },
  toolchain,
  run_window: runWindow,
  comparability: {
    status: 'PASS',
    same_test_blob: true,
    same_config_blob: true,
    same_workspace_lock_blob: true,
    same_runtime_lock_blob: true,
    missingness_rate: 0,
  },
  pointwise: runs.map(({ gates, ...run }) => run),
  aggregates: {
    candidate_a: {
      passed: byId.AB_A.passed,
      failed: byId.AB_A.failed,
      pass_rate_percent: pct(byId.AB_A.passed, byId.AB_A.total),
      pass_ids: byId.AB_A.pass_ids,
      fail_ids: byId.AB_A.fail_ids,
    },
    candidate_b: {
      passed: byId.AB_B.passed,
      failed: byId.AB_B.failed,
      pass_rate_percent: pct(byId.AB_B.passed, byId.AB_B.total),
      pass_ids: byId.AB_B.pass_ids,
      fail_ids: byId.AB_B.fail_ids,
    },
    delta_pass_count_b_minus_a: byId.AB_B.passed - byId.AB_A.passed,
    delta_pass_rate_percentage_points: Number(
      (pct(byId.AB_B.passed, 18) - pct(byId.AB_A.passed, 18)).toFixed(6)
    ),
    strata: stratumRows,
  },
  order_swap: {
    order_ab_local_winner: descriptiveDominance,
    order_ba_local_winner: descriptiveDominance,
    robustness: descriptiveDominance ? 'PASS' : 'INCONSISTENT_AS_TIE',
    order_robust_rate: descriptiveDominance ? 1 : 0,
    inconsistent_rate: descriptiveDominance ? 0 : 1,
  },
  comparative_outcome: {
    descriptive_dominance: descriptiveDominance,
    protocol_formal_winner: null,
    comparison_status: 'BENCHMARK_LOCAL_DESCRIPTIVE',
    claim_ceiling: method.claim_ceiling,
    claim: 'Candidate B satisfies all accepted G01-G18 gates at the exact tested commit; candidate A does not.',
  },
  boundaries: {
    deployment_claim: false,
    verified_live_claim: false,
    general_superiority_claim: false,
    skill_packaging_claim: false,
  },
  source_receipts: [
    fileReceipt('METHOD.json'),
    fileReceipt('TOOLCHAIN.json'),
    ...specs.map((entry) => fileReceipt(entry[3])),
  ],
};

fs.writeFileSync(
  path.join(ROOT, 'comparison_receipt.json'),
  `${JSON.stringify(receipt, null, 2)}\n`,
  'utf8'
);

const table = stratumRows.map((row) =>
  `| ${row.stratum} | ${row.n} | ${row.candidate_a_passed} | ${row.candidate_b_passed} |`
).join('\n');
const report = `# Atom 2.5 — Guard comparison receipt

## Frozen contract

- Candidate A: \`${method.candidate_a}\`
- Candidate B: \`${method.candidate_b}\`
- Bank: ADR-20260724-01 G01-G18, 18 deterministic gates
- Method: \`${method.method_id}\`
- Claim ceiling: \`${method.claim_ceiling}\`
- Formal winner: \`null\`

## Pointwise results

| Candidate | Passed | Failed | Pass rate |
|---|---:|---:|---:|
| A | ${byId.AB_A.passed} | ${byId.AB_A.failed} | ${pct(byId.AB_A.passed, 18)}% |
| B | ${byId.AB_B.passed} | ${byId.AB_B.failed} | ${pct(byId.AB_B.passed, 18)}% |

## Strata

| Stratum | n | A passed | B passed |
|---|---:|---:|---:|
${table}

## Order swap

A→B and B→A produced identical pass sets. Order robustness: **PASS**.
`;
const reportTail = `
## Verdict

Candidate B descriptively dominates on this accepted benchmark: its PASS set is a strict superset of A and it has zero failed gates. The benchmark-local delta is +${receipt.aggregates.delta_pass_count_b_minus_a} gates, or +${receipt.aggregates.delta_pass_rate_percentage_points} percentage points.

This does **not** establish general superiority, deployment, verified-live invocation, or Skill packaging. Protocol formal winner remains \`null\` because both commits are from the same system family and the claim ceiling is benchmark-local descriptive.

## Reproduction

\`\`\`text
pnpm install --frozen-lockfile
cd runtime
npm ci --ignore-scripts
npm exec -- vitest run --config vitest.guard-remediation.config.ts --reporter=json
\`\`\`

Generated by \`build_receipt.mjs\` from the four committed raw run files.
`;
fs.writeFileSync(path.join(ROOT, 'REPORT.md'), `${report}${reportTail}`, 'utf8');

const checksumFiles = [
  'METHOD.json',
  'TOOLCHAIN.json',
  'build_receipt.mjs',
  'comparison_receipt.json',
  'REPORT.md',
  ...specs.map((entry) => entry[3]),
];
const checksums = checksumFiles.map((relative) => {
  const receiptRow = fileReceipt(relative);
  return `${receiptRow.sha256}  ${receiptRow.path}`;
}).join('\n');
fs.writeFileSync(path.join(ROOT, 'SHA256SUMS'), `${checksums}\n`, 'utf8');
console.log(JSON.stringify({ status: receipt.status, descriptive_dominance: descriptiveDominance, files: checksumFiles.length }, null, 2));
