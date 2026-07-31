#!/usr/bin/env bash
set -euo pipefail

expected_branch='feat/math-fractal-authority-v1'
current_branch="$(git branch --show-current)"
if [[ "$current_branch" != "$expected_branch" ]]; then
  echo "unexpected branch: $current_branch" >&2
  exit 1
fi

node tools/generate-fractal-authority-mirrors.mjs --check
node tools/check-fractal-authority-boundary.mjs
pnpm exec vitest run \
  packages/math/src/__tests__/fractal-authority.test.ts \
  packages/math/src/__tests__/edgeMetricsParity.test.ts \
  packages/engine/src/__tests__/metricsServiceFractalAuthority.test.ts \
  runtime/src/__tests__/fractalAuthority.test.ts

(
  cd runtime
  npm ci --ignore-scripts
  npm run typecheck
  npm run test -- --run src/__tests__/fractalAuthority.test.ts
)

deno test --no-lock supabase/functions/_shared/iskra-metrics/iskra-metrics_test.ts

node <<'NODE'
const fs = require('node:fs')
const stage = '.github/fractal-authority.workflow.yml.stage'
const target = '.github/workflows/fractal_authority.yml'
const source = fs.readFileSync(stage, 'utf8')
const duplicatePin = `      - uses: pnpm/action-setup@v4\n        with:\n          version: 10\n`
const replacement = `      - uses: pnpm/action-setup@v4\n`
const occurrences = source.split(duplicatePin).length - 1
if (occurrences !== 1) {
  throw new Error(`expected one duplicate pnpm pin, found ${occurrences}`)
}
fs.writeFileSync(target, source.replace(duplicatePin, replacement), 'utf8')
NODE

rm -f \
  .github/workflows/fractal_authority_bootstrap.yml \
  .github/workflows/fractal_authority_finalize_probe.yml \
  .github/fractal-authority.workflow.yml.stage \
  .github/fractal-authority.finalize.trigger \
  tools/finalize-fractal-authority-pr326.sh

git add -A .github tools/finalize-fractal-authority-pr326.sh
pnpm exec tsx tools/update_ledger.ts
pnpm exec tsx tools/verify_ledger.ts

cp ledger/sot.json /tmp/fractal-authority-sot.json
cp ledger/checksum.asc /tmp/fractal-authority-checksum.asc

git reset --hard HEAD
rm -f .github/workflows/fractal_authority.yml
cp /tmp/fractal-authority-sot.json ledger/sot.json
cp /tmp/fractal-authority-checksum.asc ledger/checksum.asc

git add ledger/sot.json ledger/checksum.asc
git diff --cached --check
git diff --cached --name-only | sort > /tmp/fractal-authority-actual-paths
printf '%s\n' ledger/checksum.asc ledger/sot.json | sort > /tmp/fractal-authority-expected-paths
diff -u /tmp/fractal-authority-expected-paths /tmp/fractal-authority-actual-paths

git config user.name 'github-actions[bot]'
git config user.email '41898282+github-actions[bot]@users.noreply.github.com'
git commit -m 'chore(ledger): precompute final fractal authority topology'
git push origin HEAD:feat/math-fractal-authority-v1
