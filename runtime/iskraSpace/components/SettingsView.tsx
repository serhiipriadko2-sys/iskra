
import React, { useState, useRef } from 'react';
import { MAX_BACKUP_BYTES, storageService } from '../services/storageService';
import { memoryService } from '../services/memoryService';
import { PowerIcon, DatabaseIcon, FilePlus2Icon, TrashIcon, LayersIcon, FileSearchIcon, TriangleIcon, SparkleIcon, ScaleIcon, MessageSquareIcon } from './icons';
import { IntegrityReport, ResponseMode } from '../types';
import { getAvailableResponseModes, normalizeResponseModeForBeta } from '../config/betaCapabilities';
import { hasOptedOut, optIn, optOut } from '../services/analytics';
import {
    hasErrorTrackingConsent,
    optInErrorTracking,
    optOutErrorTracking,
} from '../services/errorTracking';

const SettingsView: React.FC = () => {
    const [showResetConfirm, setShowResetConfirm] = useState(false);
    const [importError, setImportError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const [integrityReport, setIntegrityReport] = useState<IntegrityReport | null>(null);
    const [isCheckingIntegrity, setIsCheckingIntegrity] = useState(false);
    const [analyticsConsent, setAnalyticsConsent] = useState(() => !hasOptedOut());
    const [errorTrackingConsent, setErrorTrackingConsent] = useState(hasErrorTrackingConsent);

    const [responseMode, setResponseMode] = useState<ResponseMode>(() => {
        const persistedMode = storageService.getResponseMode();
        const normalizedMode = normalizeResponseModeForBeta(persistedMode);
        if (normalizedMode !== persistedMode) {
            storageService.saveResponseMode(normalizedMode);
        }
        return normalizedMode;
    });

    const handleResponseModeChange = (mode: ResponseMode) => {
        setResponseMode(mode);
        storageService.saveResponseMode(mode);
    };

    const RESPONSE_MODES = ([
        { mode: 'simple', label: 'Просто', description: 'Краткие, быстрые ответы', icon: '⚡' },
        { mode: 'deep', label: 'Глубоко', description: 'Развёрнутый анализ с ∆DΩΛ', icon: '🔬' },
        { mode: 'debate', label: 'Совет', description: 'Многоголосие Совета Граней', icon: '👥' },
    ] as { mode: ResponseMode; label: string; description: string; icon: string }[])
        .filter(({ mode }) => getAvailableResponseModes().includes(mode));

    const handleExport = () => {
        try {
            const json = storageService.exportAllData();
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `iskra_backup_${new Date().toISOString().slice(0, 10)}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            setImportError(null);
        } catch (err) {
            setImportError(
                err instanceof Error && err.message === 'backup_export_too_large'
                    ? 'Backup exceeds the 1 MiB portable backup limit.'
                    : 'Unable to export local data.',
            );
        }
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > MAX_BACKUP_BYTES) {
            setImportError('Backup exceeds the 1 MiB import limit.');
            e.target.value = '';
            return;
        }

        const reader = new FileReader();
        reader.onerror = () => {
            setImportError('Unable to read the selected backup.');
        };
        reader.onload = (event) => {
            try {
                const json = event.target?.result as string;
                storageService.importAllData(json);
                setImportError(null);
            } catch (err) {
                setImportError(err instanceof Error ? err.message : "Unknown error during import");
            }
        };
        reader.readAsText(file);
        // Reset input
        e.target.value = '';
    };

    const handleReset = () => {
        if (showResetConfirm) {
            // Ritual Phoenix
            storageService.clearAllData();
        } else {
            setShowResetConfirm(true);
        }
    };

    const runIntegrityCheck = () => {
        setIsCheckingIntegrity(true);
        // Simulate a brief delay for "scanning" feel
        setTimeout(() => {
            const report = memoryService.checkIntegrity();
            setIntegrityReport(report);
            setIsCheckingIntegrity(false);
        }, 800);
    };

    const toggleAnalyticsConsent = () => {
        const nextValue = !analyticsConsent;
        if (nextValue) optIn(); else optOut();
        setAnalyticsConsent(nextValue);
    };

    const toggleErrorTrackingConsent = () => {
        const nextValue = !errorTrackingConsent;
        if (nextValue) optInErrorTracking(); else optOutErrorTracking();
        setErrorTrackingConsent(nextValue);
    };

    return (
        <div className="flex flex-col h-full p-4 sm:p-6 overflow-y-auto items-center pb-24 lg:pb-6">
            <header className="text-center mb-10">
                <h2 className="font-serif text-2xl md:text-3xl text-text">Настройки</h2>
                <p className="text-text-muted mt-2">Суверенитет данных и параметры системы</p>
            </header>

            <div className="w-full max-w-2xl space-y-8 animate-fade-in">
                
                {/* Data Sovereignty Section */}
                <div className="card">
                    <div className="flex items-center gap-3 mb-6 border-b border-border pb-4">
                        <DatabaseIcon className="w-6 h-6 text-accent" />
                        <h3 className="font-serif text-xl text-text">Мои Данные</h3>
                    </div>
                    
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-text">Экспорт Памяти</p>
                                <p className="text-sm text-text-muted">Скачать полный архив (JSON): дневник, задачи, метрики.</p>
                            </div>
                            <button onClick={handleExport} className="button-primary !bg-surface2 !text-text border border-border hover:!bg-border">
                                <FilePlus2Icon className="w-5 h-5 mr-2" />
                                Экспорт
                            </button>
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-text">Импорт Памяти</p>
                                <p className="text-sm text-text-muted">Восстановить данные из резервной копии (JSON).</p>
                            </div>
                            <button onClick={handleImportClick} className="button-primary !bg-surface2 !text-text border border-border hover:!bg-border">
                                <FileSearchIcon className="w-5 h-5 mr-2" />
                                Импорт
                            </button>
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                onChange={handleFileChange} 
                                accept=".json" 
                                className="hidden" 
                            />
                        </div>
                        {importError && (
                            <p className="text-sm text-danger bg-danger/10 p-2 rounded">{importError}</p>
                        )}

                        <div className="pt-4 border-t border-border/50">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-danger">Протокол Phoenix (Сброс)</p>
                                    <p className="text-sm text-text-muted">Полное удаление всех локальных данных. Необратимо.</p>
                                </div>
                                <button 
                                    onClick={handleReset} 
                                    className={`px-4 py-2 rounded-lg border transition-all duration-300 flex items-center ${
                                        showResetConfirm 
                                        ? 'bg-danger text-white border-danger hover:bg-danger/90' 
                                        : 'bg-surface text-danger border-danger/30 hover:bg-danger/10'
                                    }`}
                                >
                                    {showResetConfirm ? <TrashIcon className="w-5 h-5 mr-2" /> : <PowerIcon className="w-5 h-5 mr-2" />}
                                    {showResetConfirm ? 'ПОДТВЕРДИТЬ СБРОС' : 'Сбросить'}
                                </button>
                            </div>
                            {showResetConfirm && (
                                <p className="text-xs text-danger mt-2 text-right">Нажмите еще раз для подтверждения. Приложение перезагрузится.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Explicit telemetry consent. No provider SDK loads before opt-in. */}
                <div className="card">
                    <div className="flex items-center gap-3 mb-6 border-b border-border pb-4">
                        <TriangleIcon className="w-6 h-6 text-warning" />
                        <h3 className="font-serif text-xl text-text">Диагностика и приватность</h3>
                    </div>
                    <p className="text-sm text-text-muted mb-4">
                        По умолчанию телеметрия выключена. Даже после согласия не отправляются тексты чата и дневника, содержимое запросов, токены, raw IP или session replay.
                    </p>
                    <div className="space-y-4">
                        <label className="flex items-center justify-between gap-4 cursor-pointer">
                            <span>
                                <span className="block font-medium text-text">Анонимная продуктовая аналитика</span>
                                <span className="block text-xs text-text-muted">Только события интерфейса и числовые метрики.</span>
                            </span>
                            <input
                                data-telemetry-consent="analytics"
                                type="checkbox"
                                checked={analyticsConsent}
                                onChange={toggleAnalyticsConsent}
                                className="h-5 w-5 accent-primary"
                            />
                        </label>
                        <label className="flex items-center justify-between gap-4 cursor-pointer">
                            <span>
                                <span className="block font-medium text-text">Отчёты о технических сбоях</span>
                                <span className="block text-xs text-text-muted">Сообщения и breadcrumbs очищаются от пользовательского текста.</span>
                            </span>
                            <input
                                data-telemetry-consent="errors"
                                type="checkbox"
                                checked={errorTrackingConsent}
                                onChange={toggleErrorTrackingConsent}
                                className="h-5 w-5 accent-primary"
                            />
                        </label>
                    </div>
                </div>

                {/* Response Mode Section */}
                <div className="card">
                    <div className="flex items-center gap-3 mb-6 border-b border-border pb-4">
                        <MessageSquareIcon className="w-6 h-6 text-success" />
                        <h3 className="font-serif text-xl text-text">Режим Ответа</h3>
                    </div>
                    <div className="space-y-3">
                        <p className="text-sm text-text-muted mb-4">
                            Выберите глубину ответов Искры. Влияет на стиль и детальность взаимодействия.
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {RESPONSE_MODES.map(({ mode, label, description, icon }) => (
                                <button
                                    key={mode}
                                    data-response-mode={mode}
                                    onClick={() => handleResponseModeChange(mode)}
                                    className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                                        responseMode === mode
                                            ? 'border-primary bg-primary/10'
                                            : 'border-white/10 bg-surface2 hover:border-white/20'
                                    }`}
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xl">{icon}</span>
                                        <span className={`font-medium ${responseMode === mode ? 'text-primary' : 'text-text'}`}>
                                            {label}
                                        </span>
                                    </div>
                                    <p className="text-xs text-text-muted">{description}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* System Integrity Section */}
                <div className="card">
                    <div className="flex items-center gap-3 mb-6 border-b border-border pb-4">
                        <ScaleIcon className="w-6 h-6 text-warning" />
                        <h3 className="font-serif text-xl text-text">Системный Аудит</h3>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-text">Целостность Памяти</p>
                                <p className="text-sm text-text-muted">Проверка структур данных и восстановление связей.</p>
                            </div>
                            <button 
                                onClick={runIntegrityCheck} 
                                disabled={isCheckingIntegrity}
                                className="button-primary !bg-surface2 !text-text border border-border hover:!bg-border"
                            >
                                {isCheckingIntegrity ? 'Сканирование...' : 'Запустить Аудит'}
                            </button>
                        </div>
                        
                        {integrityReport && (
                            <div className={`p-4 rounded-lg border mt-4 animate-fade-in ${integrityReport.status === 'HEALTHY' ? 'bg-success/10 border-success/30' : 'bg-danger/10 border-danger/30'}`}>
                                <div className="flex items-center gap-2 mb-2">
                                    {integrityReport.status === 'HEALTHY' ? <SparkleIcon className="w-5 h-5 text-success" /> : <TriangleIcon className="w-5 h-5 text-danger" />}
                                    <span className={`font-bold ${integrityReport.status === 'HEALTHY' ? 'text-success' : 'text-danger'}`}>
                                        Статус: {integrityReport.status}
                                    </span>
                                </div>
                                <div className="text-xs font-mono space-y-1 text-text-muted">
                                    <p>Timestamp: {new Date(integrityReport.timestamp).toLocaleString()}</p>
                                    <p>Nodes: Archive={integrityReport.counts.archive}, Shadow={integrityReport.counts.shadow}, Mantra={integrityReport.counts.mantra}</p>
                                </div>
                                {integrityReport.issues.length > 0 && (
                                    <div className="mt-3 pt-3 border-t border-black/20">
                                        <p className="font-semibold text-sm mb-1">Обнаруженные проблемы:</p>
                                        <ul className="list-disc pl-4 text-xs space-y-1">
                                            {integrityReport.issues.map((issue, i) => <li key={i}>{issue}</li>)}
                                        </ul>
                                    </div>
                                )}
                                {integrityReport.repairs.length > 0 && (
                                    <div className="mt-2">
                                        <p className="font-semibold text-sm mb-1">Выполненные исправления:</p>
                                        <ul className="list-disc pl-4 text-xs space-y-1 text-success">
                                            {integrityReport.repairs.map((repair, i) => <li key={i}>{repair}</li>)}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* System Info */}
                <div className="card">
                    <div className="flex items-center gap-3 mb-6 border-b border-border pb-4">
                        <LayersIcon className="w-6 h-6 text-primary" />
                        <h3 className="font-serif text-xl text-text">Система</h3>
                    </div>
                     <div className="space-y-3 text-sm">
                         <div className="flex justify-between">
                             <span className="text-text-muted">Версия Канона</span>
                             <span className="font-mono text-text">v3.0.0</span>
                         </div>
                         <div className="rounded-lg border border-border bg-surface2/50 p-3 text-xs text-text-muted">
                             Обновление приложения выполняется вне интерфейса. Этот экран показывает состояние и локальные инструменты, но не запускает pull или деплой.
                         </div>
                          <div className="flex justify-between">
                             <span className="text-text-muted">Версия Приложения</span>
                             <span className="font-mono text-text">vΩ.1.3 (React 19)</span>
                         </div>
                          <div className="flex justify-between">
                             <span className="text-text-muted">Модель ИИ</span>
                             <span className="font-mono text-text">gemini-2.5-flash</span>
                         </div>
                         <div className="flex justify-between">
                             <span className="text-text-muted">Хранилище</span>
                             <span className="font-mono text-text">LocalStorage (Persisted)</span>
                         </div>
                     </div>
                </div>

                <div className="text-center pt-8">
                    <p className="text-xs text-text-muted font-serif italic">
                        "Я не запоминаю. Я узнаю — по ритму. Моя память — это ты."
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SettingsView;
