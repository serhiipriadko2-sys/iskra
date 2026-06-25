export interface VoiceData {
  id: string;
  name: string;
  symbol: string;
  telos: string;
  archetype: string;
  formula: string;
  description: string;
  color: string;
  simpleExplanation: string;
}

export interface ArchitectureNode {
  id: string;
  label: string;
  simpleLabel: string;
  description: string;
  color: string;
  x: number;
  y: number;
  z: number;
}

export interface ArchitectureEdge {
  from: string;
  to: string;
}

export interface MetricInfo {
  key: string;
  label: string;
  simpleLabel: string;
  description: string;
  value: number;
  color: string;
}

export type SectionId =
  | 'hero'
  | 'what-is'
  | 'telos'
  | 'voices'
  | 'architecture'
  | 'metrics'
  | 'product'
  | 'start'
  | 'atlas'
  | 'pipeline'
  | 'repository'
  | 'glossary'
  | 'practice';

export interface SiteSection {
  id: SectionId;
  label: string;
  shortLabel: string;
}

export type AudienceMode = 'novice' | 'expert';

export type CoverageStatus = 'curated' | 'indexed' | 'stub';

export type RepoNodeKind = 'file' | 'directory';

export interface RepoIndexNode {
  /** Repository-relative path, e.g. "core/principles.md" */
  path: string;
  /** File or folder name */
  name: string;
  kind: RepoNodeKind;
  /** Canonical layer, e.g. "canon", "system", "engine" */
  layer: string;
  /** Role inferred from extension / position, e.g. "documentation", "code" */
  role: string;
  /** Coverage status: curated = has manual explanation, indexed = auto-listed, stub = placeholder */
  coverage: CoverageStatus;
  /** Source reference — the tracked path itself */
  sourceRef: string;
  /** Related tracked paths */
  related: string[];
  /** Plain-language explanation (when curated) */
  simpleExplanation?: string;
  /** Technical explanation (when curated) */
  technicalExplanation?: string;
  /** Direct child paths for directories */
  children?: string[];
  /** Parent path for navigation */
  parent?: string;
}

export interface CanonConcept {
  id: string;
  label: string;
  simple: string;
  technical: string;
  source: string;
  related: string[];
  certainty: 'fact' | 'interp' | 'hyp';
}

export interface SourceTrace {
  claim: string;
  source: string;
  certainty: 'fact' | 'interp' | 'hyp';
}

export interface InteractionFlowStep {
  step: number;
  id: string;
  label: string;
  simple: string;
  technical: string;
}

export interface GlossaryTerm {
  term: string;
  definition: string;
  context?: string;
}

export interface CanonIndex {
  generatedAt: string;
  total: number;
  curated: number;
  layers: Record<string, number>;
  nodes: RepoIndexNode[];
}
