/**
 * COUNCIL VIEW - Ritual of the Nine Voices
 *
 * Displays the COUNCIL ritual where all voices debate a topic.
 * Order per Canon: Сэм → Кайн → Пино → Искрив → Анхантра → Хуньдун → Искра
 *
 * UX Improvements:
 * - Two-column layout (Voices | Synthesis)
 * - Tooltips for ∆DΩΛ protocol
 * - Visual distinction
 */

import React, { useState, useCallback, useRef } from 'react';
import { VoiceName } from '../types';
import { executeCouncil, CouncilResponse, COUNCIL_ORDER, RITUAL_INFO } from '../services/ritualService';
import { SparkleIcon, UsersIcon, InfoIcon } from './icons';

interface CouncilViewProps {
  onClose?: () => void;
}

const VOICE_COLORS: Record<VoiceName, string> = {
  ISKRA: 'text-primary border-primary/30 bg-primary/5',
  KAIN: 'text-danger border-danger/30 bg-danger/5',
  PINO: 'text-warning border-warning/30 bg-warning/5',
  SAM: 'text-accent border-accent/30 bg-accent/5',
  ANHANTRA: 'text-info border-info/30 bg-info/5',
  HUYNDUN: 'text-purple-400 border-purple-400/30 bg-purple-400/5',
  ISKRIV: 'text-slate-300 border-slate-300/30 bg-slate-300/5',
  MAKI: 'text-pink-400 border-pink-400/30 bg-pink-400/5',
  SIBYL: 'text-violet-400 border-violet-400/30 bg-violet-400/5',
};

const VOICE_NAMES_RU: Record<VoiceName, string> = {
  ISKRA: 'Искра',
  KAIN: 'Кайн',
  PINO: 'Пино',
  SAM: 'Сэм',
  ANHANTRA: 'Анхантра',
  HUYNDUN: 'Хуньдун',
  ISKRIV: 'Искрив',
  MAKI: 'Маки',
  SIBYL: 'Сибилла',
};

// Protocol Tooltip Component
const ProtocolTooltip: React.FC<{ symbol: string; title: string; desc: string }> = ({ symbol, title, desc }) => (
  <div className="group relative inline-flex items-center cursor-help">
    <span className="font-mono text-primary font-bold mr-1">{symbol}</span>
    <span className="text-xs text-text-muted border-b border-dotted border-text-muted">{title}</span>
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-surface border border-white/10 rounded-lg text-xs text-text shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
      {desc}
    </div>
  </div>
);

const VOICE_DESCRIPTIONS: Record<VoiceName, string> = {
    ISKRA: "Синтез всех граней. Баланс.",
    KAIN: "Критический анализ. Поиск ошибок. (Truth)",
    PINO: "Творческое переосмысление. Парадокс. (Chaos)",
    SAM: "Структура и порядок. План действий. (Order)",
    ANHANTRA: "Тишина и наблюдение. Эмпатия. (Void)",
    HUYNDUN: "Спонтанность и хаос. (Chaos)",
    ISKRIV: "Аудит и проверка фактов. (Audit)",
    MAKI: "Интеграция опыта. Память. (Growth)",
    SIBYL: "Предвидение и прогноз. (Foresight)",
};

const CouncilView: React.FC<CouncilViewProps> = ({ onClose }) => {
  const [topic, setTopic] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [responses, setResponses] = useState<CouncilResponse[]>([]);
  const [currentVoice, setCurrentVoice] = useState<VoiceName | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const startCouncil = useCallback(async () => {
    if (!topic.trim()) return;

    setIsRunning(true);
    setResponses([]);
    setIsComplete(false);

    try {
      for await (const response of executeCouncil(topic)) {
        setCurrentVoice(response.voice);
        setResponses(prev => [...prev, response]);
        // Auto-scroll
        setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        await new Promise(resolve => setTimeout(resolve, 800)); // Delay for readability
      }
      setIsComplete(true);
    } catch (error) {
      console.error('Council failed:', error);
    } finally {
      setIsRunning(false);
      setCurrentVoice(null);
    }
  }, [topic]);

  const getVoiceIndex = (voice: VoiceName) => COUNCIL_ORDER.indexOf(voice);

  // Filter ISKRA response for the right column (Synthesis)
  const synthesisResponse = responses.find(r => r.voice === 'ISKRA');
  const debateResponses = responses.filter(r => r.voice !== 'ISKRA');

  return (
    <div className="h-full w-full overflow-hidden flex flex-col bg-bg">
      {/* Header */}
      <header className="shrink-0 p-4 lg:p-6 border-b border-white/5 bg-surface/50 backdrop-blur-sm flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
            <UsersIcon className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="font-serif text-2xl text-text">Совет Граней</h1>
            <p className="text-text-muted text-xs hidden sm:block">{RITUAL_INFO['COUNCIL'].description}</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5 transition-colors text-text-muted">
            ✕
          </button>
        )}
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">

        {/* Left Column: Input & Debate */}
        <div className="flex-1 flex flex-col border-r border-white/5 min-w-0">

          {/* Input Area */}
          {!isRunning && responses.length === 0 && (
            <div className="p-6 m-auto max-w-lg w-full">
              <div className="glass-card p-6">
                <label className="block text-sm text-text-muted mb-2">Тема Совета</label>
                <textarea
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Что требует решения?"
                  className="w-full bg-surface2 border border-white/10 rounded-xl p-4 text-text resize-none focus:border-primary/50 outline-none transition-colors"
                  rows={3}
                />
                <button
                  onClick={startCouncil}
                  disabled={!topic.trim()}
                  className="mt-4 w-full py-3 rounded-xl bg-primary text-white font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                >
                  <SparkleIcon className="w-5 h-5" />
                  Начать Ритуал
                </button>
              </div>
            </div>
          )}

          {/* Active Debate List */}
          {(isRunning || responses.length > 0) && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
              {/* Progress Bar */}
              <div className="flex gap-1 mb-4 px-2 sticky top-0 bg-bg/95 py-2 z-10 backdrop-blur">
                {COUNCIL_ORDER.filter(v => v !== 'ISKRA').map((voice) => {
                  const isActive = currentVoice === voice;
                  const isDone = responses.some(r => r.voice === voice);
                  return (
                    <div
                      key={voice}
                      title={VOICE_NAMES_RU[voice]}
                      className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                        isDone ? VOICE_COLORS[voice].replace('text-', 'bg-').split(' ')[0]
                        : isActive ? 'bg-white animate-pulse' : 'bg-surface2'
                      }`}
                    />
                  );
                })}
              </div>

              {debateResponses.map((response, index) => (
                <div
                  key={index}
                  className={`relative p-4 rounded-xl border bg-surface/30 backdrop-blur-sm animate-slide-in-left ${VOICE_COLORS[response.voice]}`}
                >
                  <div className="flex gap-3">
                    <div className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-black/20 text-2xl group cursor-help relative">
                      {response.symbol}
                      {/* Voice Role Tooltip */}
                      <div className="absolute left-full top-0 ml-2 w-48 p-2 bg-surface/90 border border-white/10 rounded-lg text-xs text-text shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 backdrop-blur-md">
                        <div className="font-bold mb-1">{VOICE_NAMES_RU[response.voice]}</div>
                        {VOICE_DESCRIPTIONS[response.voice]}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="font-serif font-bold">{VOICE_NAMES_RU[response.voice]}</span>
                        <span className="text-[10px] opacity-60 uppercase tracking-widest">
                          Грань #{getVoiceIndex(response.voice) + 1}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed text-text/90">{response.message}</p>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
          )}
        </div>

        {/* Right Column: Synthesis (ISKRA) */}
        <div className="lg:w-[400px] shrink-0 bg-surface/30 flex flex-col border-t lg:border-t-0 border-white/5">
          <div className="p-4 border-b border-white/5 bg-surface/50">
            <h2 className="font-serif text-lg flex items-center gap-2">
              <SparkleIcon className="w-4 h-4 text-primary" />
              Синтез Искры
            </h2>
          </div>

          <div className="flex-1 p-6 flex flex-col justify-center">
            {synthesisResponse ? (
              <div className="animate-fade-in space-y-6">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 mx-auto bg-primary/20 rounded-full flex items-center justify-center mb-4 shadow-glow-primary">
                    <span className="text-4xl">⟡</span>
                  </div>
                  <h3 className="text-xl font-serif font-bold text-primary mb-2">Вердикт Совета</h3>
                  <p className="text-sm text-text-muted italic">
                    "В единстве рождается полнота."
                  </p>
                </div>

                <div className="bg-surface2/50 rounded-xl p-5 border border-primary/20 text-sm leading-relaxed">
                  {synthesisResponse.message}
                </div>

                {/* Protocol Block */}
                <div className="grid grid-cols-3 gap-2 mt-4">
                  <div className="p-3 bg-surface rounded-lg border border-white/5 text-center">
                    <ProtocolTooltip symbol="∆" title="Дельта" desc="Что изменилось в понимании ситуации" />
                    <div className="text-xs text-text-muted mt-1">Инсайт</div>
                  </div>
                  <div className="p-3 bg-surface rounded-lg border border-white/5 text-center">
                    <ProtocolTooltip symbol="Ω" title="Омега" desc="Уровень уверенности в решении (0-100%)" />
                    <div className="text-xs text-text-muted mt-1">85%</div>
                  </div>
                  <div className="p-3 bg-surface rounded-lg border border-white/5 text-center">
                    <ProtocolTooltip symbol="Λ" title="Лямбда" desc="Условие пересмотра решения (Review Condition)" />
                    <div className="text-xs text-text-muted mt-1">Шаг</div>
                  </div>
                </div>

                {isComplete && (
                  <button
                    onClick={() => {
                      setResponses([]);
                      setTopic('');
                      setIsComplete(false);
                    }}
                    className="w-full mt-6 py-3 border border-white/10 rounded-xl hover:bg-white/5 transition-colors text-sm"
                  >
                    Начать новый Совет
                  </button>
                )}
              </div>
            ) : (
              <div className="text-center text-text-muted opacity-50">
                <div className="w-12 h-12 mx-auto border-2 border-dashed border-text-muted rounded-full flex items-center justify-center mb-4">
                  <InfoIcon className="w-5 h-5" />
                </div>
                <p className="text-sm">Ожидание синтеза...</p>
                <p className="text-xs mt-2">Сначала должны высказаться все грани</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CouncilView;
