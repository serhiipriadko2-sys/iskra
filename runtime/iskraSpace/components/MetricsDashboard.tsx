import React, { useState, useEffect, useMemo } from 'react';
import { 
  IskraMetrics, 
  FractalIndicators, 
  QuantumIndicators, 
  SystemPhase,
  calculateFractalIndicators,
  calculateQuantumIndicators,
  classifyPhase
} from '../types';
import { TrendingUpIcon, AlertTriangleIcon, CheckCircleIcon, ZapIcon } from './icons';

interface MetricsDashboardProps {
  metrics: IskraMetrics;
}

interface MetricsHistory {
  timestamp: number;
  metrics: IskraMetrics;
}

// Configuration constants
const MAX_HISTORY_SIZE = 100; // ~5 minutes at 3s intervals
const MIN_DATA_POINTS = 10; // Minimum required for fractal/quantum calculations
const TREND_WINDOW_SIZE = 30; // Last N cycles to show in trend charts
const FRACTAL_WINDOW_SIZE = 50; // Window size for fractal calculations

// Gauge component for visual representation
const GaugeIndicator: React.FC<{ 
  value: number; 
  label: string; 
  min: number; 
  max: number;
  thresholds?: { low: number; mid: number; high: number };
  unit?: string;
}> = ({ value, label, min, max, thresholds, unit = '' }) => {
  const percentage = ((value - min) / (max - min)) * 100;
  
  let colorClass = 'text-accent';
  if (thresholds) {
    if (value < thresholds.low) colorClass = 'text-danger';
    else if (value < thresholds.mid) colorClass = 'text-warning';
    else if (value < thresholds.high) colorClass = 'text-success';
    else colorClass = 'text-accent';
  }

  return (
    <div className="glass-card p-6 flex flex-col">
      <div className="flex justify-between items-start mb-4">
        <span className="text-xs text-text-muted uppercase tracking-wider font-semibold">{label}</span>
        <span className={`text-2xl font-mono font-bold ${colorClass}`}>
          {value.toFixed(3)}{unit}
        </span>
      </div>
      <div className="relative h-3 bg-surface2 rounded-full overflow-hidden">
        <div 
          className={`absolute h-full rounded-full transition-all duration-500 ${colorClass.replace('text-', 'bg-')}`}
          style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
        />
      </div>
      <div className="flex justify-between mt-2 text-[10px] text-text-muted">
        <span>{min.toFixed(1)}</span>
        <span>{max.toFixed(1)}</span>
      </div>
    </div>
  );
};

// Phase indicator component
const PhaseIndicator: React.FC<{ phase: SystemPhase }> = ({ phase }) => {
  const phaseConfig: Record<SystemPhase, { 
    label: string; 
    color: string; 
    bgColor: string;
    icon: React.FC<React.SVGProps<SVGSVGElement>>;
    desc: string;
  }> = {
    stable: { 
      label: 'Стабильная', 
      color: 'text-success', 
      bgColor: 'bg-success/10',
      icon: CheckCircleIcon,
      desc: 'Гладкий, предсказуемый сигнал'
    },
    edge: { 
      label: 'На грани хаоса', 
      color: 'text-warning', 
      bgColor: 'bg-warning/10',
      icon: ZapIcon,
      desc: 'Оптимальная сложность'
    },
    chaotic: { 
      label: 'Хаотичная', 
      color: 'text-danger', 
      bgColor: 'bg-danger/10',
      icon: AlertTriangleIcon,
      desc: 'Хаотический режим'
    },
  };

  const config = phaseConfig[phase];
  const Icon = config.icon;

  return (
    <div className={`glass-card p-6 border-l-4 ${config.color.replace('text-', 'border-')}`}>
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-xl ${config.bgColor}`}>
          <Icon className={`w-6 h-6 ${config.color}`} />
        </div>
        <div>
          <p className="text-xs text-text-muted uppercase tracking-wider font-semibold mb-1">
            Системная Фаза
          </p>
          <h3 className={`text-xl font-serif font-bold ${config.color} mb-1`}>
            {config.label}
          </h3>
          <p className="text-sm text-text-muted italic">{config.desc}</p>
        </div>
      </div>
    </div>
  );
};

// Mini chart component for trends
const TrendLine: React.FC<{ 
  data: number[]; 
  label: string; 
  color: string;
}> = ({ data, label, color }) => {
  const max = data.length > 0 ? Math.max(...data) : 1;
  const min = data.length > 0 ? Math.min(...data) : 0;
  const range = max - min || 1;
  
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - ((value - min) / range) * 100;
    return `${x},${y}`;
  }).join(' ');

  const DEFAULT_DISPLAY_VALUE = '0.00';
  const currentValue = data[data.length - 1];

  return (
    <div className="glass-card p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-text-muted uppercase tracking-wider">{label}</span>
        <span className={`text-sm font-mono font-bold ${color}`}>
          {currentValue !== undefined ? currentValue.toFixed(2) : DEFAULT_DISPLAY_VALUE}
        </span>
      </div>
      <svg viewBox="0 0 100 40" className="w-full h-12" preserveAspectRatio="none">
        <polyline
          points={points}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={color}
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
};

const MetricsDashboard: React.FC<MetricsDashboardProps> = ({ metrics }) => {
  const [history, setHistory] = useState<MetricsHistory[]>([]);
  const [fractalIndicators, setFractalIndicators] = useState<FractalIndicators | null>(null);
  const [quantumIndicators, setQuantumIndicators] = useState<QuantumIndicators | null>(null);
  const [systemPhase, setSystemPhase] = useState<SystemPhase>('stable');

  // Update history
  useEffect(() => {
    const newEntry: MetricsHistory = {
      timestamp: Date.now(),
      metrics: { ...metrics }
    };

    setHistory(prev => {
      const updated = [...prev, newEntry];
      // Keep last MAX_HISTORY_SIZE entries
      return updated.slice(-MAX_HISTORY_SIZE);
    });
  }, [metrics]);

  // Calculate indicators
  useEffect(() => {
    if (history.length < MIN_DATA_POINTS) return; // Need minimum data points

    const metricsArray = history.map(h => h.metrics);
    
    // Calculate fractal indicators
    const fractal = calculateFractalIndicators(metricsArray, Math.min(FRACTAL_WINDOW_SIZE, history.length));
    setFractalIndicators(fractal);
    
    // Calculate quantum indicators
    const quantum = calculateQuantumIndicators(metrics, metricsArray);
    setQuantumIndicators(quantum);
    
    // Determine system phase
    const phase = classifyPhase(fractal.D_chaos);
    setSystemPhase(phase);
  }, [history, metrics]);

  // Extract trend data for charts (memoized)
  const chaosTrend = useMemo(() => history.slice(-TREND_WINDOW_SIZE).map(h => h.metrics.chaos), [history]);
  const clarityTrend = useMemo(() => history.slice(-TREND_WINDOW_SIZE).map(h => h.metrics.clarity), [history]);
  const driftTrend = useMemo(() => history.slice(-TREND_WINDOW_SIZE).map(h => h.metrics.drift), [history]);
  const trustTrend = useMemo(() => history.slice(-TREND_WINDOW_SIZE).map(h => h.metrics.trust), [history]);

  return (
    <div className="h-full w-full overflow-y-auto p-4 lg:p-8">
      <div className="max-w-7xl mx-auto pb-24 lg:pb-12">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUpIcon className="w-8 h-8 text-accent" />
            <h2 className="font-serif text-3xl text-text">
              Панель Метрик Реального Времени
            </h2>
          </div>
          <p className="text-text-muted text-sm">
            Мониторинг фрактальных и квантовых индикаторов состояния системы
          </p>
          <div className="mt-2 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-xs font-mono text-success">
              LIVE · {history.length} записей
            </span>
          </div>
        </div>

        {/* System Phase */}
        {fractalIndicators && (
          <div className="mb-6">
            <PhaseIndicator phase={systemPhase} />
          </div>
        )}

        {/* Fractal Indicators */}
        {fractalIndicators && (
          <div className="mb-8">
            <h3 className="text-sm text-text-muted uppercase tracking-wider font-bold mb-4 ml-1">
              §10 · Фрактальные Индикаторы
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <GaugeIndicator
                value={fractalIndicators.D_chaos}
                label="D_chaos"
                min={1.0}
                max={2.0}
                thresholds={{ low: 1.4, mid: 1.6, high: 1.8 }}
              />
              <GaugeIndicator
                value={fractalIndicators.D_clarity}
                label="D_clarity"
                min={1.0}
                max={2.0}
                thresholds={{ low: 1.4, mid: 1.6, high: 1.8 }}
              />
              <GaugeIndicator
                value={fractalIndicators.D_drift}
                label="D_drift"
                min={1.0}
                max={2.0}
                thresholds={{ low: 1.4, mid: 1.6, high: 1.8 }}
              />
              <GaugeIndicator
                value={fractalIndicators.H_trust}
                label="H_trust (Хёрст)"
                min={0.0}
                max={1.0}
                thresholds={{ low: 0.4, mid: 0.6, high: 0.8 }}
              />
              <GaugeIndicator
                value={fractalIndicators.complexityIndex}
                label="Индекс Сложности"
                min={0.0}
                max={1.0}
                thresholds={{ low: 0.3, mid: 0.6, high: 0.8 }}
              />
              <GaugeIndicator
                value={fractalIndicators.edgeDistance}
                label="Расстояние до Edge"
                min={0.0}
                max={1.0}
              />
            </div>
          </div>
        )}

        {/* Quantum Indicators */}
        {quantumIndicators && (
          <div className="mb-8">
            <h3 className="text-sm text-text-muted uppercase tracking-wider font-bold mb-4 ml-1">
              §11 · Квантовые Когнитивные Индикаторы
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <GaugeIndicator
                value={quantumIndicators.CSI}
                label="CSI (Суперпозиция)"
                min={0.0}
                max={1.0}
                thresholds={{ low: 0.3, mid: 0.7, high: 0.9 }}
              />
              <GaugeIndicator
                value={quantumIndicators.EI}
                label="EI (Запутанность)"
                min={0.0}
                max={1.0}
                thresholds={{ low: 0.3, mid: 0.6, high: 0.8 }}
              />
              <GaugeIndicator
                value={quantumIndicators.NC}
                label="NC (Некоммутативность)"
                min={0.0}
                max={1.0}
              />
            </div>
          </div>
        )}

        {/* Real-time Trends */}
        {history.length >= MIN_DATA_POINTS && (
          <div className="mb-8">
            <h3 className="text-sm text-text-muted uppercase tracking-wider font-bold mb-4 ml-1">
              Динамика Базовых Метрик (последние {TREND_WINDOW_SIZE} циклов)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <TrendLine data={chaosTrend} label="Chaos" color="text-purple-500" />
              <TrendLine data={clarityTrend} label="Clarity" color="text-accent" />
              <TrendLine data={driftTrend} label="Drift" color="text-warning" />
              <TrendLine data={trustTrend} label="Trust" color="text-success" />
            </div>
          </div>
        )}

        {/* Legend & Interpretation */}
        <div className="glass-card p-6">
          <h3 className="text-sm text-text-muted uppercase tracking-wider font-bold mb-4">
            Интерпретация Показателей
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="font-semibold text-text mb-2">Фрактальная размерность D</h4>
              <ul className="space-y-1 text-text-muted">
                <li><span className="text-success">●</span> 1.0-1.4: Стабильный режим</li>
                <li><span className="text-warning">●</span> 1.4-1.6: Edge of chaos (оптимум)</li>
                <li><span className="text-danger">●</span> 1.6-2.0: Хаотический режим</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-text mb-2">Показатель Хёрста H</h4>
              <ul className="space-y-1 text-text-muted">
                <li><span className="text-danger">●</span> 0.0-0.4: Антиперсистентность</li>
                <li><span className="text-warning">●</span> 0.4-0.6: Случайное блуждание</li>
                <li><span className="text-success">●</span> 0.6-1.0: Персистентность</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-text mb-2">CSI (Cognitive Superposition)</h4>
              <ul className="space-y-1 text-text-muted">
                <li><span className="text-danger">●</span> Низкий: Коллапс состояния</li>
                <li><span className="text-warning">●</span> Средний: Баланс</li>
                <li><span className="text-success">●</span> Высокий: Суперпозиция</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-text mb-2">EI (Entanglement Index)</h4>
              <ul className="space-y-1 text-text-muted">
                <li><span className="text-danger">●</span> Низкий: Развязка метрик</li>
                <li><span className="text-warning">●</span> Средний: Норма</li>
                <li><span className="text-success">●</span> Высокий: Запутанность</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Insufficient Data Warning */}
        {history.length < MIN_DATA_POINTS && (
          <div className="glass-card p-6 border-l-4 border-warning">
            <div className="flex items-start gap-3">
              <AlertTriangleIcon className="w-6 h-6 text-warning flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-text mb-1">Недостаточно данных</h4>
                <p className="text-sm text-text-muted">
                  Для расчёта фрактальных и квантовых индикаторов требуется минимум {MIN_DATA_POINTS} точек данных. 
                  Текущее количество: {history.length}/{MIN_DATA_POINTS}. Продолжайте взаимодействие с системой.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MetricsDashboard;
