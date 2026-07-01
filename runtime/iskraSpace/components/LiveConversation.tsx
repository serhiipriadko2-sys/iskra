/**
 * Release-disabled voice surface.
 *
 * The previous implementation used the browser Gemini Live client directly.
 * Production release keeps voice hidden until this path is moved behind an
 * authenticated server-side streaming gateway.
 */

import React, { useCallback, useState } from 'react';
import { IskraMetrics } from '../types';
import { SparkleIcon } from './icons';
import type { SessionStatus } from './live';

export type { SessionStatus };

interface LiveConversationProps {
  metrics: IskraMetrics;
}

const DISABLED_MESSAGE =
  'Голосовой режим временно отключен в release-контуре. Он вернется после перевода на серверный streaming gateway.';

const LiveConversation: React.FC<LiveConversationProps> = ({ metrics }) => {
  const [status, setStatus] = useState<SessionStatus>('IDLE');
  const [error, setError] = useState<string | null>(null);

  const startSession = useCallback(() => {
    setStatus('ERROR');
    setError(DISABLED_MESSAGE);
  }, []);

  const activeColor = metrics.pain > 0.6
    ? '#E5484D'
    : metrics.clarity < 0.6
      ? '#FFB020'
      : metrics.chaos > 0.6
        ? '#A855F7'
        : '#4DA3FF';

  return (
    <div className="flex flex-col h-full p-4 sm:p-6 items-center overflow-y-hidden pb-[100px] lg:pb-6">
      <h2 className="font-serif text-2xl md:text-3xl text-text mb-6 text-center">Живой Диалог</h2>
      <div className="flex-grow flex items-center justify-center">
        <div className="flex flex-col items-center text-center max-w-lg animate-fade-in p-4">
          <SparkleIcon className="w-16 h-16 text-primary drop-shadow-glow-primary mb-4" />
          <h3 className="font-serif text-3xl text-text mb-2">Голос скрыт из release</h3>
          <p className="text-text-muted mb-8">
            Этот режим больше не использует прямой browser Gemini Live client. Он будет возвращен
            только через серверный streaming gateway с проверенной auth/JWT границей.
          </p>
          <button
            type="button"
            onClick={startSession}
            className="button-primary !px-8 !py-3"
            style={{ boxShadow: status === 'ERROR' ? `0 0 24px ${activeColor}55` : undefined }}
          >
            Проверить статус
          </button>
          {error && <p className="mt-4 text-sm text-danger">{error}</p>}
        </div>
      </div>
    </div>
  );
};

export default LiveConversation;
