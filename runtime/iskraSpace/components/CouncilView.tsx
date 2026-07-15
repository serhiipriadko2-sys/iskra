/**
 * COUNCIL VIEW - Ritual of the Nine Voices
 *
 * Displays the COUNCIL ritual where all voices debate a topic.
 * Order per Canon: Сэм → Кайн → Пино → Искрив → Анхантра → Хуньдун → Искра
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { VoiceName } from '../types';
import { executeCouncil, CouncilResponse, COUNCIL_ORDER, RITUAL_INFO } from '../services/ritualService';
import { SparkleIcon, UsersIcon } from './icons';

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

// Voice role descriptions (telos) for better UX understanding
const VOICE_TELOS: Record<VoiceName, string> = {
  ISKRA: 'Синтез • Единство противоречий',
  KAIN: 'Правда • Контур истины',
  PINO: 'Ирония • Разрядка напряжения',
  SAM: 'Структура • Ясность из хаоса',
  ANHANTRA: 'Тишина • Принятие без давления',
  HUYNDUN: 'Хаос • Разрушение паттернов',
  ISKRIV: 'Аудит • Совесть и факты',
  MAKI: 'Интеграция • Красота и гармония',
  SIBYL: 'Предвидение • Паттерны и траектории',
};

const CouncilView: React.FC<CouncilViewProps> = ({ onClose }) => {
  const [topic, setTopic] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [responses, setResponses] = useState<CouncilResponse[]>([]);
  const [currentVoice, setCurrentVoice] = useState<VoiceName | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [wasCancelled, setWasCancelled] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const controllerRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      controllerRef.current?.abort();
    };
  }, []);

  const cancelCouncil = useCallback(() => {
    const controller = controllerRef.current;
    if (!controller || controller.signal.aborted) return;
    controller.abort();
    setWasCancelled(true);
  }, []);

  const startCouncil = useCallback(async () => {
    if (!topic.trim() || isRunning) return;

    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    setIsRunning(true);
    setResponses([]);
    setIsComplete(false);
    setWasCancelled(false);
    setErrorMessage(null);

    try {
      for await (const response of executeCouncil(topic, undefined, { signal: controller.signal })) {
        if (controller.signal.aborted || !mountedRef.current) break;
        setCurrentVoice(response.voice);
        setResponses(prev => [...prev.filter((item) => item.voice !== response.voice), response]);
      }
      if (!mountedRef.current) return;
      if (controller.signal.aborted) {
        setWasCancelled(true);
      } else {
        setIsComplete(true);
      }
    } catch {
      if (!mountedRef.current) return;
      if (controller.signal.aborted) {
        setWasCancelled(true);
      } else {
        setErrorMessage('Совет не удалось завершить. Повторите попытку.');
      }
    } finally {
      if (mountedRef.current) {
        if (controllerRef.current === controller) {
          controllerRef.current = null;
        }
        setIsRunning(false);
        setCurrentVoice(null);
      }
    }
  }, [isRunning, topic]);

  const getVoiceIndex = (voice: VoiceName) => COUNCIL_ORDER.indexOf(voice);
  const orderedResponses = useMemo(
    () => COUNCIL_ORDER.flatMap((voice) => responses.filter((response) => response.voice === voice)),
    [responses]
  );

  const resetCouncil = () => {
    controllerRef.current?.abort();
    setResponses([]);
    setTopic('');
    setCurrentVoice(null);
    setIsComplete(false);
    setWasCancelled(false);
    setErrorMessage(null);
  };

  const handleClose = () => {
    cancelCouncil();
    onClose?.();
  };

  return (
    <div className="h-full w-full overflow-y-auto p-4 lg:p-8">
      <div className="max-w-4xl mx-auto pb-24 lg:pb-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
              <UsersIcon className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="font-serif text-3xl text-text">Совет Граней</h1>
              <p className="text-text-muted text-sm">{RITUAL_INFO['COUNCIL'].description}</p>
            </div>
          </div>
          {onClose && (
            <button
              type="button"
              aria-label="Закрыть Совет"
              onClick={handleClose}
              className="p-2 rounded-lg hover:bg-surface2 transition-colors text-text-muted"
            >
              ✕
            </button>
          )}
        </div>

        {/* Topic Input */}
        {!isRunning && responses.length === 0 && (
          <div className="glass-card p-6 mb-8">
            <label className="block text-sm text-text-muted mb-2">
              Тема для обсуждения
            </label>
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Введите вопрос или тему для Совета Граней..."
              className="w-full bg-surface2 border border-white/10 rounded-xl p-4 text-text resize-none focus:outline-none focus:border-primary/50 transition-colors"
              rows={3}
            />
            <button
              type="button"
              onClick={startCouncil}
              disabled={!topic.trim()}
              className="mt-4 w-full py-3 px-6 rounded-xl bg-primary text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
            >
              <SparkleIcon className="w-5 h-5" />
              Созвать Совет
            </button>
          </div>
        )}

        {/* Council Progress */}
        {(isRunning || responses.length > 0) && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              {COUNCIL_ORDER.map((voice, _index) => {
                const isActive = currentVoice === voice;
                const isComplete = responses.some(r => r.voice === voice);
                return (
                  <div
                    key={voice}
                    className={`flex-1 h-2 rounded-full transition-all duration-500 ${
                      isComplete
                        ? VOICE_COLORS[voice].replace('text-', 'bg-').split(' ')[0]
                        : isActive
                        ? 'bg-white/50 animate-pulse'
                        : 'bg-surface2'
                    }`}
                  />
                );
              })}
            </div>
            {currentVoice && (
              <p className="text-center text-sm text-text-muted animate-pulse">
                Говорит {VOICE_NAMES_RU[currentVoice]}...
              </p>
            )}
            {isRunning && (
              <div className="mt-4 flex justify-center">
                <button
                  type="button"
                  aria-label="Отменить Совет"
                  onClick={cancelCouncil}
                  className="rounded-lg border border-danger/40 px-4 py-2 text-sm text-danger transition-colors hover:bg-danger/10"
                >
                  Отменить Совет
                </button>
              </div>
            )}
          </div>
        )}

        {wasCancelled && (
          <p role="status" className="mb-6 rounded-lg border border-warning/30 bg-warning/5 p-3 text-sm text-warning">
            Совет отменён. Уже полученные ответы сохранены, незавершённые запросы остановлены.
          </p>
        )}

        {errorMessage && (
          <p role="alert" className="mb-6 rounded-lg border border-danger/30 bg-danger/5 p-3 text-sm text-danger">
            {errorMessage}
          </p>
        )}

        {/* Responses */}
        <div className="space-y-4">
          {orderedResponses.map((response, index) => {
            const isIskraSynthesis = response.voice === 'ISKRA';
            return (
              <div
                key={response.voice}
                data-council-voice={response.voice}
                className={`glass-card p-5 border transition-all duration-300 ${
                  isIskraSynthesis
                    ? 'bg-gradient-to-r from-primary/10 to-accent/10 border-primary/40 ring-2 ring-primary/20'
                    : VOICE_COLORS[response.voice]
                } animate-fade-in`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start gap-4">
                  {/* Voice Avatar */}
                  <div className={`shrink-0 w-14 h-14 rounded-xl flex items-center justify-center ${
                    isIskraSynthesis
                      ? 'bg-primary/20 ring-2 ring-primary/30'
                      : VOICE_COLORS[response.voice].replace('text-', 'bg-').split(' ')[0] + '/20'
                  }`}>
                    <span className={`text-3xl ${isIskraSynthesis ? 'animate-pulse' : ''}`}>
                      {response.symbol}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    {/* Voice Header */}
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className={`font-serif font-bold text-lg ${
                          isIskraSynthesis ? 'text-primary' : VOICE_COLORS[response.voice].split(' ')[0]
                        }`}>
                          {VOICE_NAMES_RU[response.voice]}
                        </span>
                        {isIskraSynthesis && (
                          <span className="px-2 py-0.5 text-xs rounded-full bg-primary/20 text-primary border border-primary/30">
                            Синтез
                          </span>
                        )}
                        {response.status !== 'ok' && (
                          <span className="px-2 py-0.5 text-xs rounded-full border border-warning/30 text-warning">
                            {response.status === 'timeout'
                              ? 'Время ожидания истекло'
                              : response.status === 'cancelled'
                                ? 'Отменено'
                                : 'Недоступно'}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-text-muted">
                        #{getVoiceIndex(response.voice) + 1}
                      </span>
                    </div>
                    {/* Voice Telos */}
                    <p className="text-xs text-text-muted/70 mb-3 italic">
                      {VOICE_TELOS[response.voice]}
                    </p>
                    {/* Voice Message */}
                    <p className={`leading-relaxed whitespace-pre-wrap ${
                      isIskraSynthesis ? 'text-text font-medium' : 'text-text/90'
                    }`}>
                      {response.message}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Synthesis highlight */}
        {(isComplete || wasCancelled) && responses.length > 0 && (
          <div className="mt-8 p-6 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
            <div className="flex items-center gap-2 mb-3">
              <SparkleIcon className="w-5 h-5 text-primary" />
              <span className="font-serif font-bold text-primary">
                {isComplete ? 'Совет завершён' : 'Совет остановлен'}
              </span>
            </div>
            <p className="text-text-muted text-sm">
              {isComplete
                ? 'Все грани высказались. Финальный синтез от Искры выше.'
                : 'Показаны только ответы, успевшие завершиться до отмены.'}
            </p>
            <button
              type="button"
              onClick={resetCouncil}
              className="mt-4 py-2 px-4 rounded-lg border border-white/10 text-text-muted hover:text-text hover:border-white/20 transition-colors"
            >
              Новый Совет
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CouncilView;
