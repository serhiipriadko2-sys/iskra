
import React from 'react';
import { IskraMetrics } from '../types';
import { SessionStatus } from './LiveConversation';

interface IskraMetricsDisplayProps {
  metrics: IskraMetrics;
  status: SessionStatus;
  className?: string;
}

const MetricBar: React.FC<{ label: string; value: number; colorClass: string; description: string }> = ({ label, value, colorClass, description }) => {
    const width = `${Math.round(value * 100)}%`;
    return (
        <div className="group relative">
            <div className="flex justify-between items-baseline mb-1">
                <span className="text-xs font-bold text-text-muted uppercase tracking-wider">{label}</span>
                <span className={`font-mono text-xs ${colorClass.replace('bg-', 'text-')}`}>{value.toFixed(2)}</span>
            </div>
            <div className="h-1.5 rounded-full bg-surface2 overflow-hidden mb-1">
                <div 
                    className={`h-full rounded-full ${colorClass} transition-all duration-500 ease-out`}
                    style={{ width: width }}
                />
            </div>
            {/* Contextual Description */}
            <p className="text-[10px] text-text-muted/70 truncate group-hover:text-text-muted transition-colors">
                {getDescriptionForValue(value, description)}
            </p>
        </div>
    );
};

// Helper to get text explanation based on value
const getDescriptionForValue = (value: number, type: string) => {
    if (type === 'chaos') {
        if (value > 0.6) return '⚠️ Высокая энтропия (нужна структура)';
        if (value > 0.3) return 'Активный поиск';
        return 'Стабильность';
    }
    if (type === 'trust') {
        if (value > 0.8) return 'Глубокий резонанс';
        if (value < 0.4) return '⚠️ Барьер недоверия';
        return 'Установление связи';
    }
    if (type === 'pain') {
        if (value > 0.5) return '⚠️ Острая фаза';
        if (value > 0.2) return 'Фоновое напряжение';
        return 'Спокойствие';
    }
    if (type === 'drift') {
        if (value > 0.4) return 'Потеря контекста';
        return 'В русле диалога';
    }
    return '';
};

const getStatusClasses = (status: SessionStatus) => {
    switch (status) {
        case 'LISTENING': return { text: 'text-accent', border: 'border-accent', glow: 'drop-shadow-glow-accent' };
        case 'SPEAKING': return { text: 'text-primary', border: 'border-primary', glow: 'drop-shadow-glow-primary' };
        case 'ERROR': return { text: 'text-danger', border: 'border-danger', glow: '' };
        default: return { text: 'text-text-muted', border: 'border-border', glow: '' };
    }
}

const IskraMetricsDisplay: React.FC<IskraMetricsDisplayProps> = ({ metrics, status, className = '' }) => {
    const { rhythm, trust, clarity, pain, drift, chaos } = metrics;
    const rhythmScore = Math.round(rhythm);

    const circumference = 2 * Math.PI * 40; // Reduced size
    const strokeDashoffset = circumference - (rhythmScore / 100) * circumference;
    
    const statusClasses = getStatusClasses(status);

    return (
        <div className={`flex flex-col h-full bg-surface/30 backdrop-blur-md border-l border-white/5 p-4 transition-colors duration-500 ${className}`}>
            <h3 className="font-serif text-sm font-bold text-text-muted uppercase tracking-widest mb-6 text-center">
                Состояние Системы
            </h3>

            {/* Rhythm Circle */}
            <div className="relative flex items-center justify-center w-32 h-32 mx-auto mb-8 shrink-0">
                {/* Background Track */}
                <svg className="w-full h-full rotate-[-90deg]" viewBox="0 0 100 100">
                    <circle
                        className="text-surface2"
                        strokeWidth="8"
                        stroke="currentColor"
                        fill="transparent"
                        r="40"
                        cx="50"
                        cy="50"
                    />
                    {/* Progress */}
                    <circle
                        className={`${statusClasses.text} ${statusClasses.glow}`}
                        strokeWidth="8"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="transparent"
                        r="40"
                        cx="50"
                        cy="50"
                        style={{ transition: 'stroke-dashoffset 1s ease-out' }}
                    />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="font-serif text-3xl font-bold text-text">{rhythmScore}</span>
                    <span className="text-[10px] uppercase text-text-muted mt-1">∆-Ритм</span>
                </div>
            </div>

            {/* Metrics List */}
            <div className="space-y-5 flex-1 overflow-y-auto px-1">
                <MetricBar label="Доверие" value={trust} colorClass="bg-success" description="trust" />
                <MetricBar label="Ясность" value={clarity} colorClass="bg-accent" description="clarity" />
                <MetricBar label="Боль" value={pain} colorClass="bg-danger" description="pain" />
                <MetricBar label="Дрейф" value={drift} colorClass="bg-warning" description="drift" />
                <MetricBar label="Хаос" value={chaos} colorClass="bg-purple-500" description="chaos" />
            </div>
            
            {/* Status Footer */}
            <div className="mt-6 pt-4 border-t border-white/5 text-center">
                <span className={`text-xs font-mono ${statusClasses.text}`}>
                    ● {status === 'IDLE' ? 'ОЖИДАНИЕ' : status}
                </span>
            </div>
        </div>
    );
};

export default IskraMetricsDisplay;
