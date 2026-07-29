import React, { useEffect, useState } from 'react';
import {
  DEPTH_CONSENT_TTL_OPTIONS,
  type DepthConsentTtlMinutes,
} from '../services/depthConsentService';

interface DepthConsentDialogProps {
  open: boolean;
  title: string;
  actionLabel: string;
  contextItems: readonly string[];
  busy?: boolean;
  error?: string | null;
  onGrant: (ttlMinutes: DepthConsentTtlMinutes) => void | Promise<void>;
  onDeny: () => void | Promise<void>;
}

const ttlLabel = (minutes: DepthConsentTtlMinutes): string => {
  if (minutes === 60) return '1 час';
  return `${minutes} минут`;
};

const DepthConsentDialog: React.FC<DepthConsentDialogProps> = ({
  open,
  title,
  actionLabel,
  contextItems,
  busy = false,
  error = null,
  onGrant,
  onDeny,
}) => {
  const [ttlMinutes, setTtlMinutes] = useState<DepthConsentTtlMinutes>(15);

  useEffect(() => {
    if (open) setTtlMinutes(15);
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="depth-consent-title"
        className="w-full max-w-xl rounded-2xl border border-primary/30 bg-surface p-6 shadow-deep"
      >
        <p className="mb-2 text-xs font-mono uppercase tracking-widest text-accent">
          Разрешение depth.surgery
        </p>
        <h3 id="depth-consent-title" className="font-serif text-2xl text-text">
          {title}
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-text-muted">
          Это отдельное разрешение на одно глубокое AI-действие. Оно перестанет
          действовать после использования или по истечении выбранного срока.
        </p>

        <div className="mt-5 rounded-xl border border-white/10 bg-black/20 p-4">
          <p className="mb-3 text-sm font-semibold text-text">Что будет передано:</p>
          <ul className="space-y-2 text-sm text-text-muted">
            {contextItems.map(item => (
              <li key={item} className="flex items-start gap-2">
                <span className="mt-0.5 text-primary">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <fieldset className="mt-5">
          <legend className="mb-2 text-sm font-semibold text-text">
            Срок действия, если действие не началось сразу
          </legend>
          <div className="grid grid-cols-3 gap-2">
            {DEPTH_CONSENT_TTL_OPTIONS.map(option => (
              <button
                key={option}
                type="button"
                disabled={busy}
                onClick={() => setTtlMinutes(option)}
                className={`rounded-lg border px-3 py-2 text-sm transition-colors ${
                  ttlMinutes === option
                    ? 'border-primary bg-primary/15 text-primary'
                    : 'border-white/10 bg-white/5 text-text-muted hover:bg-white/10'
                }`}
              >
                {ttlLabel(option)}
              </button>
            ))}
          </div>
        </fieldset>

        {error && (
          <p className="mt-4 rounded-lg border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
            {error}
          </p>
        )}

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            disabled={busy}
            onClick={() => void onDeny()}
            className="rounded-lg border border-white/10 px-5 py-3 text-sm text-text-muted hover:bg-white/5 disabled:opacity-50"
          >
            Не разрешать
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => void onGrant(ttlMinutes)}
            className="button-primary px-5 py-3 disabled:opacity-50"
          >
            {busy ? 'Фиксирую разрешение…' : actionLabel}
          </button>
        </div>
      </section>
    </div>
  );
};

export default DepthConsentDialog;
