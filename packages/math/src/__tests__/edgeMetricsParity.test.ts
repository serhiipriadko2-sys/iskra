import { execFileSync } from 'node:child_process'
import { cpSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import {
  calculateDFAMetric as calculateNodeDFA,
  calculateHFDMetric as calculateNodeHFD,
} from '../fractal-authority.js'
import {
  calculateDFAMetric as calculateEdgeDFA,
  calculateHFDMetric as calculateEdgeHFD,
} from '../../../../supabase/functions/_shared/iskra-metrics/fractal-authority'
import {
  FRACTAL_AUTHORITY_CORPUS_CASES,
  materializeCorpusSignal,
} from './fractal-authority-corpus.js'

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../../..')
const generatedFiles = [
  'packages/math/src/fractal-authority-source.ts',
  'packages/math/src/fractal-authority-contracts.ts',
  'packages/math/src/fractal-authority.ts',
  'packages/math/src/fractal-authority-provenance.ts',
  'packages/math/src/fractal-authority-corpus.json',
  'runtime/src/types/fractal-authority-source.ts',
  'runtime/src/types/fractal-authority-contracts.ts',
  'runtime/src/types/fractal-authority.ts',
  'runtime/src/types/fractal-authority-provenance.ts',
  'supabase/functions/_shared/iskra-metrics/fractal-authority-source.ts',
  'supabase/functions/_shared/iskra-metrics/fractal-authority-contracts.ts',
  'supabase/functions/_shared/iskra-metrics/fractal-authority.ts',
  'supabase/functions/_shared/iskra-metrics/fractal-authority-provenance.ts',
]

describe('generated Edge fractal authority parity', () => {
  it('T8: Node and generated Edge results match for every registered corpus case', () => {
    for (const testCase of FRACTAL_AUTHORITY_CORPUS_CASES) {
      const signal = materializeCorpusSignal(testCase)
      expect(calculateEdgeHFD(signal, testCase.hfd_options)).toEqual(
        calculateNodeHFD(signal, testCase.hfd_options),
      )
      expect(calculateEdgeDFA(signal, testCase.dfa_options)).toEqual(
        calculateNodeDFA(signal, testCase.dfa_options),
      )
    }
  })

  it('T15: committed mirrors regenerate without drift', () => {
    expect(() => execFileSync(
      process.execPath,
      ['tools/generate-fractal-authority-mirrors.mjs', '--check'],
      { cwd: repositoryRoot, stdio: 'pipe' },
    )).not.toThrow()
  })

  it('T15: CRLF worktrees produce the same normalized hashes and mirrors', () => {
    const fixtureRoot = mkdtempSync(resolve(tmpdir(), 'iskra-fractal-generator-'))
    try {
      for (const relativePath of generatedFiles) {
        const source = resolve(repositoryRoot, relativePath)
        const target = resolve(fixtureRoot, relativePath)
        mkdirSync(dirname(target), { recursive: true })
        const crlf = readFileSync(source, 'utf8').replace(/\r\n?/g, '\n').replace(/\n/g, '\r\n')
        writeFileSync(target, crlf, 'utf8')
      }
      cpSync(
        resolve(repositoryRoot, 'tools/generate-fractal-authority-mirrors.mjs'),
        resolve(fixtureRoot, 'tools/generate-fractal-authority-mirrors.mjs'),
      )
      expect(() => execFileSync(
        process.execPath,
        ['tools/generate-fractal-authority-mirrors.mjs', '--check', '--root', fixtureRoot],
        { cwd: fixtureRoot, stdio: 'pipe' },
      )).not.toThrow()
    } finally {
      rmSync(fixtureRoot, { recursive: true, force: true })
    }
  })
})
