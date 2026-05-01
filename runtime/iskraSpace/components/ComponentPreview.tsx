import React, { useMemo, useState } from 'react';
import type { IskraMetrics, VoiceName } from '../types';
import type { SessionStatus } from './LiveConversation';
import QuantumField from './QuantumField';
import IskraMetricsDisplay from './IskraMetricsDisplay';
import InputField from './InputField';

type PreviewSectionId = 'QUANTUM_FIELD' | 'METRICS_DISPLAY' | 'INPUT_FIELD';

const DEFAULT_STATUS: SessionStatus = 'LISTENING';

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

function buildMockMetrics(overrides?: Partial<IskraMetrics>): IskraMetrics {
  const base: IskraMetrics = {
    rhythm: 72,
    trust: 0.82,
    pain: 0.18,
    chaos: 0.34,
    drift: 0.22,
    echo: 0.12,
    clarity: 0.86,
    silence_mass: 0.14,
    mirror_sync: 0.68,
    interrupt: 0.1,
    ctxSwitch: 0.22,
  };

  const merged: IskraMetrics = {
    ...base,
    ...(overrides ?? {}),
    trust: clamp01(overrides?.trust ?? base.trust),
    pain: clamp01(overrides?.pain ?? base.pain),
    chaos: clamp01(overrides?.chaos ?? base.chaos),
    drift: clamp01(overrides?.drift ?? base.drift),
    echo: clamp01(overrides?.echo ?? base.echo),
    clarity: clamp01(overrides?.clarity ?? base.clarity),
    silence_mass: clamp01(overrides?.silence_mass ?? base.silence_mass),
    mirror_sync: clamp01(overrides?.mirror_sync ?? base.mirror_sync),
    interrupt: clamp01(overrides?.interrupt ?? base.interrupt),
    ctxSwitch: clamp01(overrides?.ctxSwitch ?? base.ctxSwitch),
    rhythm: Math.max(0, overrides?.rhythm ?? base.rhythm),
  };

  return merged;
}

const SectionButton = ({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={[
      'px-3 py-2 rounded-xl border transition-colors',
      active
        ? 'bg-primary/20 border-primary text-primary shadow-[0_0_20px_rgba(255,122,0,0.15)]'
        : 'bg-surface/70 border-white/10 text-text-muted hover:bg-surface2 hover:border-white/20 hover:text-text',
    ].join(' ')}
  >
    <span className="font-medium text-sm">{label}</span>
  </button>
);

export default function ComponentPreview() {
  const [activeSection, setActiveSection] = useState<PreviewSectionId>('QUANTUM_FIELD');
  const [metrics, setMetrics] = useState<IskraMetrics>(() => buildMockMetrics());
  const [activeVoice, setActiveVoice] = useState<VoiceName | undefined>(undefined);

  const status: SessionStatus = DEFAULT_STATUS;

  const previewStyle = useMemo(
    () => ({
      position: 'relative' as const,
      borderRadius: 18,
      overflow: 'hidden',
      border: '1px solid rgba(255,255,255,0.10)',
      background: 'rgba(0,0,0,0.25)',
      minHeight: 260,
    }),
    []
  );

  const renderActive = () => {
    if (activeSection === 'QUANTUM_FIELD') {
      return (
        <div style={previewStyle} className="p-4">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div>
              <h3 className="font-serif text-lg text-text">QuantumField</h3>
              <p className="text-xs text-text-muted">Mock metrics + optional active voice</p>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs text-text-muted whitespace-nowrap">Chaos</label>
              <input
                aria-label="chaos"
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={metrics.chaos}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setMetrics((prev) => ({ ...prev, chaos: Number(e.target.value) }))
                }
              />
            </div>
          </div>

          <div className="relative w-full h-[220px] rounded-2xl overflow-hidden border border-white/10 bg-bg/40">
            <QuantumField
              metrics={metrics}
              activeVoice={activeVoice}
              intensity="normal"
              className="absolute inset-0"
            />
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute left-4 bottom-4">
              <div className="text-xs text-text-muted">
                trust={metrics.trust.toFixed(2)} · clarity={metrics.clarity.toFixed(2)} · rhythm=
                {Math.round(metrics.rhythm)}
              </div>
            </div>
          </div>

          <div className="mt-4 flex gap-3 flex-wrap">
            <button
              type="button"
              className="px-3 py-2 rounded-xl bg-surface2 border border-white/10 hover:bg-surface hover:text-text text-text-muted transition-colors"
              onClick={() => setMetrics((prev) => ({ ...prev, pain: 0.82, chaos: 0.2, trust: 0.35 }))}
            >
              Резкая боль
            </button>
            <button
              type="button"
              className="px-3 py-2 rounded-xl bg-surface2 border border-white/10 hover:bg-surface hover:text-text text-text-muted transition-colors"
              onClick={() => setMetrics((prev) => ({ ...prev, chaos: 0.9, drift: 0.75, trust: 0.2 }))}
            >
              Хаос
            </button>
            <button
              type="button"
              className="px-3 py-2 rounded-xl bg-surface2 border border-white/10 hover:bg-surface hover:text-text text-text-muted transition-colors"
              onClick={() => setMetrics(buildMockMetrics())}
            >
              Сброс
            </button>
          </div>
        </div>
      );
    }

    if (activeSection === 'METRICS_DISPLAY') {
      return (
        <div style={previewStyle} className="p-4">
          <h3 className="font-serif text-lg text-text mb-3">IskraMetricsDisplay</h3>
          <IskraMetricsDisplay metrics={metrics} status={status} className="max-w-md" />
        </div>
      );
    }

    return (
      <div style={previewStyle} className="p-4">
        <h3 className="font-serif text-lg text-text mb-3">InputField</h3>
        <div className="max-w-xl">
          <InputField
            isLoading={false}
            onQuery={(query: string) => {
              // Preview-only: no-op
              // eslint-disable-next-line no-console
              console.log('[ComponentPreview] onQuery:', query);
            }}
          />
          <div className="mt-2 text-xs text-text-muted">
            Preview-only component harness. No microphone, no network calls.
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full w-full p-4 sm:p-6 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="font-serif text-2xl md:text-3xl text-text">Component Preview</h2>
          <p className="text-sm text-text-muted mt-1">
            Render core UI components with mock data. Changes appear instantly via Vite HMR.
          </p>
        </div>

        <div className="flex gap-2 flex-wrap items-center">
          <SectionButton
            active={activeSection === 'QUANTUM_FIELD'}
            onClick={() => setActiveSection('QUANTUM_FIELD')}
            label="QuantumField"
          />
          <SectionButton
            active={activeSection === 'METRICS_DISPLAY'}
            onClick={() => setActiveSection('METRICS_DISPLAY')}
            label="MetricsDisplay"
          />
          <SectionButton
            active={activeSection === 'INPUT_FIELD'}
            onClick={() => setActiveSection('INPUT_FIELD')}
            label="InputField"
          />
        </div>
      </div>

      {renderActive()}
    </div>
  );
}
