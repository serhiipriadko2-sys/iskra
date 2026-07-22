import { execFileSync } from 'node:child_process';

const forbiddenPath = 'supabase/functions/iskra-memory-gateway/';

/**
 * Git narrows an implicit pathspec to its current directory. Acceptance
 * tests execute from runtime/iskraSpace, while the protected Gateway lives
 * at the repository root, so every inspection must first resolve that root.
 */
export function resolveRepositoryRoot(workingDirectory = process.cwd()): string {
  return execFileSync('git', ['rev-parse', '--show-toplevel'], {
    cwd: workingDirectory,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
}

function resolveComparisonBase(
  repositoryRoot: string,
  requestedBase: string | undefined,
): string {
  // PR CI supplies the exact base SHA. Local invocations may use the remote
  // tracking branch; detached CI checkouts without one fall back to the parent
  // only when an explicit base was not requested.
  const explicitBase = requestedBase?.trim() || process.env.ISKRA_ACCEPTANCE_BASE_SHA?.trim();
  const candidates = explicitBase ? [explicitBase] : ['origin/main', 'HEAD^'];
  for (const candidate of candidates) {
    try {
      execFileSync('git', ['rev-parse', '--verify', `${candidate}^{commit}`], {
        cwd: repositoryRoot,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe'],
      });
      return candidate;
    } catch {
      // Try the local fallbacks only when no caller/CI made the base explicit.
    }
  }
  throw new Error(`no readable acceptance comparison base (${candidates.join(', ')})`);
}

export function findForbiddenMemoryGatewayPaths(...fileLists: string[]): string[] {
  return [...new Set(
    fileLists
      .flatMap(files => files.split(/\r?\n/))
      .map(path => path.trim().replace(/\\/g, '/'))
      .filter(path => path.startsWith(forbiddenPath)),
  )].sort();
}

/** Fails closed if the branch comparison is unavailable or crosses the gateway boundary. */
export function assertMemoryGatewayUnchanged(
  baseSha?: string,
  workingDirectory = process.cwd(),
): void {
  let changedFiles: string;
  let untrackedFiles: string;
  try {
    // Compare the base tree with the complete working tree so the guard covers
    // committed, staged, and unstaged changes during local execution and CI.
    // This cannot run from runtime/iskraSpace: the protected path is rooted at
    // supabase/, outside that directory.
    const repositoryRoot = resolveRepositoryRoot(workingDirectory);
    const comparisonBase = resolveComparisonBase(repositoryRoot, baseSha);
    changedFiles = execFileSync('git', ['diff', '--name-only', comparisonBase, '--'], {
      cwd: repositoryRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    untrackedFiles = execFileSync('git', ['ls-files', '--others', '--exclude-standard'], {
      cwd: repositoryRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new Error(`Staging acceptance source contract could not compare against ${baseSha || process.env.ISKRA_ACCEPTANCE_BASE_SHA || 'default base'}: ${detail}`);
  }

  const forbidden = findForbiddenMemoryGatewayPaths(changedFiles, untrackedFiles);
  if (forbidden.length > 0) {
    throw new Error(`Staging acceptance source contract forbids Memory Gateway changes: ${forbidden.join(', ')}`);
  }
}
