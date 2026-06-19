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
  | 'start';

export interface SiteSection {
  id: SectionId;
  label: string;
  shortLabel: string;
}
