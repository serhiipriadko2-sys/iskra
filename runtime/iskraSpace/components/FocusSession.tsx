import React, { useState, useEffect, useRef } from 'react';
import type { ConsentReceipt } from '@iskra/runtime';
import { aiInteractionCoordinator } from '../services/aiInteractionCoordinator';
import {
    depthConsentService,
    type DepthConsentTtlMinutes,
} from '../services/depthConsentService';
import { memoryService } from '../services/memoryService';
import { userMetricsService } from '../services/userMetricsService';
import { XIcon, TriangleIcon, FlameIcon } from './icons';
import { soundService } from '../services/soundService';
import DepthConsentDialog from './DepthConsentDialog';

const service = aiInteractionCoordinator;

interface FocusSessionProps {
    onClose: () => void;
}

interface Artifact {
    title: string;
    description: string;
    action: string;
    rune: string;
}

type DeepDiveDecision = 'PENDING' | 'GRANTED' | 'DENIED';

const FocusSession: React.FC<FocusSessionProps> = ({ onClose }) => {
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [energy, setEnergy] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [distractionCount, setDistractionCount] = useState(0);
    const [status, setStatus] = useState<'FOCUS' | 'RESEARCHING' | 'COMPLETED' | 'BROKEN'>('FOCUS');
    const [artifact, setArtifact] = useState<Artifact | null>(null);
    const [statusMessage, setStatusMessage] = useState('Связь установлена. Погружение...');
    const [deepDiveDecision, setDeepDiveDecision] = useState<DeepDiveDecision>('PENDING');
    const [consentOpen, setConsentOpen] = useState(false);
    const [consentBusy, setConsentBusy] = useState(false);
    const [consentError, setConsentError] = useState<string | null>(null);
    
    const gracePeriodRef = useRef<number | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const energyRef = useRef(0);
    const maxEnergy = 25 * 60;

    useEffect(() => {
        energyRef.current = energy;
    }, [energy]);

    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden) {
                gracePeriodRef.current = window.setTimeout(() => {
                    setIsPaused(true);
                    setDistractionCount(prev => prev + 1);
                    setStatusMessage('Связь истончается... Вернись в фокус.');
                    soundService.playTone(150, 'sawtooth', 0.5);
                }, 5000);
            } else {
                if (gracePeriodRef.current) {
                    clearTimeout(gracePeriodRef.current);
                    gracePeriodRef.current = null;
                }
                
                if (isPaused && !consentOpen) {
                    setIsPaused(false);
                    setStatusMessage('Связь восстановлена. Продолжаем.');
                    soundService.playRitualConnect();
                }
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            if (gracePeriodRef.current) clearTimeout(gracePeriodRef.current);
        };
    }, [isPaused, consentOpen]);

    useEffect(() => {
        if (status !== 'FOCUS' && status !== 'RESEARCHING') return;
        
        const interval = setInterval(() => {
            if (!isPaused && timeLeft > 0) {
                setTimeLeft(prev => prev - 1);
                const penalty = distractionCount * 0.5;
                setEnergy(prev => Math.min(maxEnergy, prev + (1 - Math.min(0.9, penalty))));
            } else if (timeLeft === 0) {
                handleComplete();
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [isPaused, timeLeft, status, distractionCount]);

    useEffect(() => {
        if (
            status === 'FOCUS' &&
            timeLeft < (12.5 * 60) &&
            !artifact &&
            deepDiveDecision === 'PENDING' &&
            !isPaused &&
            !consentOpen
        ) {
            setIsPaused(true);
            setConsentError(null);
            setConsentOpen(true);
            setStatusMessage('Нужно разрешение перед глубоким AI-анализом.');
        }
    }, [timeLeft, status, artifact, deepDiveDecision, isPaused, consentOpen]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationId: number;
        let t = 0;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', resize);
        resize();

        const runes = [
            'ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', 'ᚱ', 'ᚲ', 'ᚷ', 'ᚹ', 
            'ᚺ', 'ᚾ', 'ᛁ', 'ᛃ', 'ᛇ', 'ᛈ', 'ᛉ', 'ᛊ', 
            'ᛏ', 'ᛒ', 'ᛖ', 'ᛗ', 'ᛚ', 'ᛜ', 'ᛞ', 'ᛟ'
        ];

        const draw = () => {
            if (!ctx) return;
            
            ctx.fillStyle = 'rgba(5, 8, 10, 0.1)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const progress = energyRef.current / maxEnergy;
            const branches = 6 + Math.floor(progress * 12);
            const radius = 100 + Math.sin(t * 0.02) * 20 + (progress * 200);

            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.rotate(t * 0.005);

            for (let i = 0; i < branches; i++) {
                ctx.rotate((Math.PI * 2) / branches);
                const runeIndex = Math.floor((i + t * 0.1) % runes.length);
                ctx.fillStyle = `rgba(255, 122, 0, ${0.1 + progress * 0.5})`;
                ctx.font = `${20 + progress * 30}px serif`;
                ctx.fillText(runes[runeIndex], radius, 0);

                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(radius * 0.8, 0);
                ctx.strokeStyle = `rgba(77, 163, 255, ${0.05 + progress * 0.2})`;
                ctx.stroke();
            }

            ctx.restore();
            t++;
            animationId = requestAnimationFrame(draw);
        };

        draw();
        return () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener('resize', resize);
        };
    }, []);

    const recordFocusAction = (
        consent: ConsentReceipt,
        result: 'DONE' | 'BLOCKED' | 'FAILED',
        archiveCount: number,
    ) => {
        const actionReceipt = depthConsentService.recordAction(
            'ai.focus.artifact',
            consent.id,
            result,
            [
                'route:focus.artifact',
                `archive_nodes:${archiveCount}`,
                'source:focus-session',
            ],
        );
        if (!actionReceipt.verified) {
            console.warn('[FocusSession] action receipt read-back failed');
        }
    };

    const performDeepDive = async (consent: ConsentReceipt) => {
        setStatus('RESEARCHING');
        setIsPaused(false);
        setStatusMessage('Искра исследует выбранный архивный контекст...');
        let archiveCount = 0;

        try {
            const archives = memoryService.getArchive().slice(0, 10);
            archiveCount = archives.length;
            const generatedArtifact = await service.generateFocusArtifact(archives);
            setArtifact(generatedArtifact);
            recordFocusAction(consent, 'DONE', archiveCount);
            setStatusMessage('Артефакт сформирован. Ожидание завершения цикла...');
        } catch (e) {
            const errorCode = e instanceof Error && 'code' in e
                ? String((e as Error & { code?: string }).code ?? '')
                : '';
            const result = errorCode === 'AI_CONSENT_BLOCKED' || errorCode === 'AI_POLICY_BLOCKED'
                ? 'BLOCKED'
                : 'FAILED';
            recordFocusAction(consent, result, archiveCount);
            setDeepDiveDecision('DENIED');
            setStatus('FOCUS');
            setIsPaused(false);
            setStatusMessage('AI-артефакт не создан; фокус продолжается локально.');
            console.error('Deep dive failed', e instanceof Error ? e.name : 'UnknownError');
        }
    };

    const handleGrantConsent = async (ttlMinutes: DepthConsentTtlMinutes) => {
        setConsentBusy(true);
        setConsentError(null);
        const consent = depthConsentService.grant(
            'Разрешить одно создание AI-артефакта из последних записей Архива Памяти во время фокус-сессии.',
            ttlMinutes,
        );
        if (!consent) {
            setConsentError('Разрешение недоступно. Завершите onboarding в режиме CONSENTED.');
            setConsentBusy(false);
            return;
        }

        setDeepDiveDecision('GRANTED');
        setConsentOpen(false);
        try {
            await performDeepDive(consent);
        } finally {
            setConsentBusy(false);
        }
    };

    const handleDenyConsent = () => {
        const denial = depthConsentService.deny(
            'Пользователь отклонил создание AI-артефакта во время фокус-сессии.',
        );
        if (denial) {
            depthConsentService.recordAction(
                'ai.focus.artifact',
                denial.id,
                'BLOCKED',
                ['route:focus.artifact', 'decision:denied', 'source:focus-session'],
            );
        }
        setDeepDiveDecision('DENIED');
        setConsentOpen(false);
        setConsentError(null);
        setIsPaused(false);
        setStatusMessage('AI-артефакт отключён; фокус продолжается локально.');
    };

    const handleComplete = () => {
        setStatus('COMPLETED');
        soundService.playRitualConnect();

        const focusMinutes = Math.round((25 * 60 - timeLeft) / 60);
        userMetricsService.addFocusMinutes(focusMinutes);

        if (artifact) {
            memoryService.addArchiveEntry({
                title: `Дар Фокуса: ${artifact.title}`,
                type: 'artifact',
                content: artifact,
                layer: 'archive',
                evidence: [{
                    source: 'Ritual of Focus',
                    inference: 'Generated based on user deep dive during focus session.',
                    fact: 'true',
                    trace: 'FocusSession -> generateFocusArtifact'
                }]
            });
        }
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <>
            <div className="fixed inset-0 z-[100] bg-bg text-text flex flex-col items-center justify-center overflow-hidden">
                <canvas ref={canvasRef} className="absolute inset-0 z-0" />
                <div className="absolute inset-0 bg-radial-gradient from-transparent to-bg z-0 pointer-events-none" />

                {status === 'COMPLETED' ? (
                    artifact ? (
                        <div className="relative z-10 max-w-lg w-full p-8 bg-surface/90 backdrop-blur-xl border border-primary/30 rounded-2xl shadow-glow-ember animate-fade-in text-center">
                            <div className="text-6xl mb-6 animate-pulse">{artifact.rune}</div>
                            <h2 className="font-serif text-3xl text-primary mb-2">{artifact.title}</h2>
                            <p className="text-text-muted italic mb-6 border-b border-white/10 pb-4">
                                "{artifact.description}"
                            </p>
                            
                            <div className="text-left bg-black/20 p-4 rounded-lg border border-white/5 mb-8">
                                <p className="text-xs text-accent uppercase tracking-widest mb-2">Твоя новая механика:</p>
                                <p className="text-lg font-serif">{artifact.action}</p>
                            </div>

                            <button onClick={onClose} className="button-primary w-full">
                                Принять Дар и Вернуться
                            </button>
                        </div>
                    ) : (
                        <div className="relative z-10 max-w-lg w-full p-8 bg-surface/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-deep animate-fade-in text-center">
                            <h2 className="font-serif text-3xl text-primary mb-3">Цикл фокуса завершён</h2>
                            <p className="text-text-muted mb-8">
                                Сессия сохранена без AI-артефакта. Локальные метрики фокуса обновлены.
                            </p>
                            <button onClick={onClose} className="button-primary w-full">
                                Вернуться
                            </button>
                        </div>
                    )
                ) : (
                    <div className="relative z-10 flex flex-col items-center">
                        <div className={`relative w-64 h-64 flex items-center justify-center rounded-full border-2 border-white/10 backdrop-blur-sm transition-all duration-1000 ${isPaused ? 'scale-95 opacity-50 grayscale' : 'scale-100 opacity-100'}`}>
                            <div className="absolute inset-0 bg-primary/5 rounded-full animate-pulse" style={{ animationDuration: isPaused ? '0s' : '4s' }} />
                            <div className="text-center">
                                <div className="text-6xl font-mono font-bold tracking-tighter text-text">
                                    {formatTime(timeLeft)}
                                </div>
                                <div className="text-xs text-accent font-mono mt-2 uppercase tracking-widest">
                                    {status === 'RESEARCHING' ? 'Deep Dive...' : statusMessage}
                                </div>
                            </div>
                        </div>

                        <div className="mt-12 flex gap-6">
                            <button 
                                onClick={() => setIsPaused(!isPaused)}
                                disabled={consentOpen}
                                className="p-4 rounded-full bg-surface border border-white/10 hover:bg-white/5 transition-all active:scale-95 disabled:opacity-50"
                            >
                                {isPaused ? <FlameIcon className="w-6 h-6 text-text-muted" /> : <TriangleIcon className="w-6 h-6 text-primary rotate-90" />}
                            </button>
                            <button 
                                onClick={onClose}
                                disabled={consentOpen}
                                className="p-4 rounded-full bg-surface border border-white/10 hover:bg-white/5 transition-all active:scale-95 disabled:opacity-50"
                            >
                                <XIcon className="w-6 h-6 text-text-muted" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <DepthConsentDialog
                open={consentOpen}
                title="Создать AI-артефакт фокуса?"
                actionLabel="Разрешить один deep dive"
                busy={consentBusy}
                error={consentError}
                contextItems={[
                    'До 10 последних записей Архива Памяти в их текущем формате MemoryNode.',
                    'AI использует этот контекст только для создания одного артефакта: название, описание, действие и руна.',
                    'Таймер, события видимости, пароли, ключи и другие локальные данные не передаются.',
                    'При отказе фокус-сессия продолжится локально без AI-артефакта.',
                ]}
                onGrant={handleGrantConsent}
                onDeny={handleDenyConsent}
            />
        </>
    );
};

export default FocusSession;
