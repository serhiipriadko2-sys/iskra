export type VoiceId = 'ISKRA' | 'KAIN' | 'PINO' | 'SAM' | 'ANHANTRA' | 'HUYNDUN' | 'ISKRIV' | 'MAKI' | 'SIBYL';

export type PhaseId = 'DARKNESS' | 'CLARITY' | 'ECHO' | 'SILENCE' | 'TRANSITION' | 'REPAIR' | 'INTEGRATION' | 'SYNTHESIS';

export interface IskraMetrics {
  rhythm: number;        // 0-100
  trust: number;         // 0-1
  pain: number;          // 0-1
  chaos: number;         // 0-1
  drift: number;         // 0-1
  echo: number;          // 0-1
  clarity: number;       // 0-1
  silence_mass: number;  // 0-1
  mirror_sync: number;   // 0-1
  interrupt: number;     // 0-1
  ctxSwitch: number;     // 0-1
}

export type PlaybookType = 'ROUTINE' | 'SIFT' | 'SHADOW' | 'COUNCIL' | 'CRISIS';

export interface ShadowEntry {
  id: string;
  timestamp: string;
  cycle: {
    trigger: string;
    reaction: string;
    stabilization: string;
    new_frame: string;
  };
  metrics: IskraMetrics;
  active_voice: VoiceId;
  phase: PhaseId;
}

export interface ProcessingContext {
  input: string;
  history: any[];
  metrics: IskraMetrics;
  activeVoice?: VoiceId;
  activePhase?: PhaseId;
  playbook?: PlaybookType;
}
