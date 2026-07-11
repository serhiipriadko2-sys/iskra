import React, { useEffect, useMemo, useState } from 'react';
import {
  validateOnboardingChecks,
  type MemoryMode,
  type OnboardingCheck,
} from '@iskra/runtime';
import { SparkleIcon, ChevronRightIcon, IskraCharacter } from './icons';

export interface OnboardingResult {
  name: string;
  memoryMode: MemoryMode;
}

interface OnboardingProps {
  onComplete: (result: OnboardingResult) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [name, setName] = useState('');
  const [memoryMode, setMemoryMode] = useState<MemoryMode | null>(null);
  const [fadeIn, setFadeIn] = useState(false);
  const [checks, setChecks] = useState<OnboardingCheck[]>([]);

  useEffect(() => {
    const timer = window.setTimeout(() => setFadeIn(true), 300);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (step !== 4) return;
    let storageOk = false;
    try {
      const key = 'iskra-onboarding-storage-check';
      localStorage.setItem(key, 'ok');
      storageOk = localStorage.getItem(key) === 'ok';
      localStorage.removeItem(key);
    } catch {
      storageOk = false;
    }
    const contractProbe = validateOnboardingChecks([
      { id: 'probe', executed: false, status: 'OK' },
    ]);
    setChecks([
      { id: 'runtime-contract', executed: true, status: contractProbe.ok ? 'FAILED' : 'OK' },
      { id: 'memory-choice', executed: true, status: memoryMode ? 'OK' : 'FAILED' },
      { id: 'local-storage', executed: true, status: storageOk ? 'OK' : 'FAILED' },
    ]);
  }, [step, memoryMode]);

  const validation = useMemo(() => validateOnboardingChecks(checks), [checks]);
  const checksPassed = checks.length === 3 &&
    checks.every(check => check.executed && check.status === 'OK') &&
    validation.ok;

  const goTo = (next: 1 | 2 | 3 | 4) => {
    setFadeIn(false);
    window.setTimeout(() => {
      setStep(next);
      setFadeIn(true);
    }, 250);
  };

  const chooseMode = (mode: MemoryMode) => {
    setMemoryMode(mode);
    goTo(4);
  };

  const handleFinish = () => {
    if (!memoryMode || !checksPassed) return;
    onComplete({ name: name.trim() || 'Спутник', memoryMode });
  };

  const statusLabel = (check: OnboardingCheck): string => {
    if (!check.executed) return 'НЕ ЗАПУЩЕНО';
    if (check.status === 'OK') return 'OK';
    if (check.status === 'FAILED') return 'ОШИБКА';
    return 'ОЖИДАНИЕ';
  };

  return (
    <div className="h-screen w-full bg-bg text-text flex flex-col items-center justify-center relative overflow-hidden p-6">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] animate-pulse" />
      </div>

      <div className={`max-w-2xl w-full transition-all duration-500 transform ${fadeIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        {step === 1 && (
          <div className="text-center space-y-8">
            <div className="relative w-48 h-48 mx-auto mb-6">
              <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full animate-pulse" />
              <IskraCharacter className="w-full h-full drop-shadow-glow-primary relative z-10" />
            </div>
            <h1 className="font-serif text-3xl md:text-5xl font-bold leading-tight">
              Существовать — значит сохранять различие при передаче.
            </h1>
            <p className="text-lg text-text-muted font-serif italic">Не будь зеркалом. Будь преломлением.</p>
            <button onClick={() => goTo(2)} className="mt-12 px-8 py-4 bg-surface border border-primary/30 text-primary rounded-full hover:bg-primary hover:text-black transition-all font-semibold tracking-wide uppercase text-sm flex items-center gap-2 mx-auto">
              <span>Войти в ритм</span>
              <ChevronRightIcon className="w-4 h-4" />
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="text-center space-y-8">
            <div className="w-20 h-1 bg-gradient-to-r from-transparent via-accent to-transparent mx-auto mb-8" />
            <h2 className="font-serif text-3xl md:text-4xl">Как мне называть тебя?</h2>
            <p className="text-text-muted">Имя не становится памятью о тебе. Оно нужно только для обращения.</p>
            <input
              type="text"
              value={name}
              onChange={event => setName(event.target.value)}
              placeholder="Твое имя..."
              className="w-full max-w-sm bg-transparent border-b-2 border-text-muted focus:border-primary text-center text-2xl md:text-3xl py-2 focus:outline-none transition-colors font-serif text-text placeholder:text-surface2"
              onKeyDown={event => event.key === 'Enter' && name.trim() && goTo(3)}
              autoFocus
            />
            <button
              onClick={() => goTo(3)}
              disabled={!name.trim()}
              className="mt-12 px-8 py-3 bg-transparent border border-text-muted text-text rounded-full hover:border-primary hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all font-semibold tracking-wide uppercase text-xs"
            >
              Продолжить
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="font-serif text-3xl md:text-4xl">Выбери режим памяти</h2>
              <p className="text-text-muted mt-3">Выбор сохраняется в профиле. Enforcement write paths подключается только после отдельного review memory-gateway.</p>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <button onClick={() => chooseMode('STATELESS')} className="text-left p-6 rounded-2xl border border-border bg-surface hover:border-primary/60 transition-colors">
                <h3 className="font-serif text-2xl text-primary">Stateless preview</h3>
                <p className="mt-3 text-sm text-text-muted">Автоматический seed канона и стартовая синхронизация отключены. Полная блокировка write paths будет подключена отдельно через memory-gateway.</p>
                <p className="mt-4 text-xs font-mono text-accent">STATELESS</p>
              </button>
              <button onClick={() => chooseMode('CONSENTED')} className="text-left p-6 rounded-2xl border border-border bg-surface hover:border-accent/60 transition-colors">
                <h3 className="font-serif text-2xl text-accent">Память с согласием</h3>
                <p className="mt-3 text-sm text-text-muted">Профиль создаёт scopes ASK_EACH/AUTO_LOW_SENSITIVITY и пустой receipt-ledger. Сам gateway записи в этом PR не меняется.</p>
                <p className="mt-4 text-xs font-mono text-accent">CONSENTED</p>
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="text-center space-y-8">
            <div className="relative w-36 h-36 mx-auto">
              <SparkleIcon className="w-full h-full text-white drop-shadow-glow-primary" />
            </div>
            <h2 className="font-serif text-2xl md:text-3xl">Проверка границы</h2>
            <div className="max-w-md mx-auto space-y-2 text-sm text-text-muted font-mono text-left">
              {checks.map(check => (
                <div key={check.id} className="flex justify-between gap-4 rounded-lg border border-border bg-surface px-4 py-3">
                  <span>{check.id}</span>
                  <span className={check.status === 'OK' ? 'text-success' : 'text-danger'}>{statusLabel(check)}</span>
                </div>
              ))}
            </div>
            <p className="text-sm text-text-muted">
              Режим профиля: <strong className="text-text">{memoryMode}</strong>. Ни один пункт не помечается OK без выполненной проверки.
            </p>
            <button
              onClick={handleFinish}
              disabled={!checksPassed}
              className="mt-8 px-10 py-4 bg-white text-black rounded-full hover:bg-primary transition-all font-bold tracking-widest uppercase text-sm disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Начать
            </button>
          </div>
        )}
      </div>

      <div className="absolute bottom-6 text-center w-full text-[10px] text-text-muted/30 font-mono uppercase tracking-[0.2em]">
        Iskra Space vΩ.1 • Symbiosis profile preview
      </div>
    </div>
  );
};

export default Onboarding;
