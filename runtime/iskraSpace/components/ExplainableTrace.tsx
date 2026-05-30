import React from 'react';
import type { ExplainStep, Explainable } from '../types';
import type { VoiceSelectionExplanationValue } from '../services/voiceEngine';

interface ExplainableTraceProps {
  title?: string;
  explainable: Explainable<VoiceSelectionExplanationValue>;
}

const formatScore = (value: number) => value.toFixed(2).replace(/\.00$/, '');

const formatUnknown = (value: unknown): string => {
  if (typeof value === 'number') return value.toFixed(4);
  if (typeof value === 'string') return value;
  return JSON.stringify(value, null, 2);
};

const VoiceExplainableDisplay: React.FC<ExplainableTraceProps> = ({
  title = 'Почему выбран этот голос?',
  explainable,
}) => {
  const rankedScores = Object.entries(explainable.value.scores).sort((a, b) => b[1] - a[1]);

  return (
    <div className="rounded-xl border border-white/10 bg-surface2/80 p-4 text-sm text-text shadow-soft backdrop-blur-sm">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <div className="text-xs uppercase tracking-wide text-text-muted">XCode trace</div>
          <h3 className="font-medium text-text">{title}</h3>
        </div>
        <div className="rounded-lg border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-mono text-primary">
          Выбран: {explainable.value.selectedVoice}
        </div>
      </div>

      <div className="mt-4">
        <div className="mb-2 text-xs uppercase tracking-wide text-text-muted">Рейтинг голосов</div>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
          {rankedScores.map(([voice, score]) => (
            <div
              key={voice}
              className={`rounded-lg border px-3 py-2 ${voice === explainable.value.selectedVoice ? 'border-primary/30 bg-primary/10' : 'border-white/10 bg-black/10'}`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs text-text-muted">{voice}</span>
                <span className="font-mono text-xs text-text">{formatScore(score)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {explainable.how.map((step: ExplainStep) => (
          <div key={step.label} className="rounded-lg border border-white/10 bg-black/10 p-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="font-mono text-xs text-text-muted">{step.label}</div>
              {step.formula ? <div className="text-xs text-accent">{step.formula}</div> : null}
            </div>
            {step.output !== undefined ? (
              <pre className="mt-2 overflow-x-auto whitespace-pre-wrap break-words font-mono text-xs text-text">{formatUnknown(step.output)}</pre>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
};

export default VoiceExplainableDisplay;

// =============================================================================
// Generic Metric XCode Card (for integrity_score, alive_index, etc.)
// =============================================================================

interface MetricExplainableCardProps {
  title: string;
  explainable: Explainable<number>;
  color?: string;
}

export const MetricExplainableCard: React.FC<MetricExplainableCardProps> = ({
  title,
  explainable,
  color = 'text-primary',
}) => {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="bg-surface border border-border p-4 rounded-xl relative overflow-hidden group hover:border-opacity-50 hover:border-white/20 transition-all h-full flex flex-col justify-between min-w-0">
      <div>
        <div className="flex items-center justify-between gap-2 mb-1">
          <p className="text-xs text-text-muted uppercase tracking-wider font-semibold">{title}</p>
          <button
            onClick={() => setOpen((p) => !p)}
            className={`px-1.5 py-0.5 rounded-full text-[10px] border flex items-center gap-0.5 transition-colors ${open ? 'text-primary bg-primary/10 border-primary/20' : 'text-text-muted bg-white/5 border-white/10 hover:bg-white/10'}`}
            title="Показать XCode trace"
          >
            <span>💡</span>
          </button>
        </div>
        <div className="flex items-end gap-2 mb-2">
          <span className={`text-2xl font-mono font-bold ${color}`}>{explainable.value.toFixed(3)}</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-surface2 overflow-hidden mb-2">
          <div
            className={`h-full rounded-full ${color.replace('text-', 'bg-')}`}
            style={{ width: `${Math.min(100, Math.max(0, explainable.value * 100))}%` }}
          />
        </div>
      </div>

      {open && (
        <div className="mt-3 space-y-2 animate-fade-in">
          <div className="text-[10px] uppercase tracking-wide text-text-muted">XCode trace</div>
          {explainable.how.map((step: ExplainStep) => (
            <div key={step.label} className="rounded-lg border border-white/10 bg-black/10 p-2">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="font-mono text-[10px] text-text-muted">{step.label}</div>
                {step.formula ? <div className="text-[10px] text-accent">{step.formula}</div> : null}
              </div>
              {step.output !== undefined ? (
                <pre className="mt-1 font-mono text-[10px] text-text">{formatUnknown(step.output)}</pre>
              ) : null}
            </div>
          ))}
          {explainable.contracts_checked && explainable.contracts_checked.length > 0 && (
            <div className="text-[9px] text-text-muted mt-1">
              contracts: {explainable.contracts_checked.join(' · ')}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
