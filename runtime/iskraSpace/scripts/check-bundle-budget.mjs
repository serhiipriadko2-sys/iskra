import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { stdout } from 'node:process';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';

const distDir = new URL('../dist/', import.meta.url);
const assetsDir = new URL('assets/', distDir);
const assetsPath = fileURLToPath(assetsDir);

const budgets = {
  maxJsChunkRaw: 512 * 1024,
  maxJsChunkGzip: 180 * 1024,
  totalJsGzip: 550 * 1024,
  totalCssGzip: 16 * 1024,
};

function measure(extension) {
  return readdirSync(assetsPath)
    .filter(name => name.endsWith(extension))
    .map(name => {
      const path = join(assetsPath, name);
      const content = readFileSync(path);
      return {
        name,
        raw: statSync(path).size,
        gzip: gzipSync(content).length,
      };
    });
}

function total(items, key) {
  return items.reduce((sum, item) => sum + item[key], 0);
}

const javascript = measure('.js');
const css = measure('.css');
const largestRaw = javascript.reduce((largest, item) => item.raw > largest.raw ? item : largest);
const largestGzip = javascript.reduce((largest, item) => item.gzip > largest.gzip ? item : largest);
const receipt = {
  javascriptChunks: javascript.length,
  largestJsRaw: largestRaw,
  largestJsGzip: largestGzip,
  totalJsGzip: total(javascript, 'gzip'),
  totalCssGzip: total(css, 'gzip'),
  budgets,
};

stdout.write(`${JSON.stringify(receipt, null, 2)}\n`);

const failures = [];
if (largestRaw.raw > budgets.maxJsChunkRaw) failures.push('largest JS raw chunk');
if (largestGzip.gzip > budgets.maxJsChunkGzip) failures.push('largest JS gzip chunk');
if (receipt.totalJsGzip > budgets.totalJsGzip) failures.push('total JS gzip');
if (receipt.totalCssGzip > budgets.totalCssGzip) failures.push('total CSS gzip');

if (failures.length > 0) {
  throw new Error(`Bundle budget exceeded: ${failures.join(', ')}`);
}
