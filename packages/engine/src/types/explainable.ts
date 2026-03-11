export type EvidenceKind = 'canon' | 'project' | 'data';

export interface EvidenceRef {
  kind: EvidenceKind;
  ref: string;
}

export interface ExplainStep {
  label: string;
  formula?: string;
  inputs?: Record<string, number | string | boolean | null>;
  output?: number | string | boolean | null | Record<string, number | string | boolean | null>;
  refs?: EvidenceRef[];
}

export interface Explainable<T> {
  value: T;
  how: ExplainStep[];
  contracts_checked: string[];
  evidence: EvidenceRef[];
}
