/**
 * METRICS DASHBOARD - Real-time Visual Metrics Panel
 *
 * Comprehensive visualization of ISKRA's internal state:
 * - 11 Core IskraMetrics (rhythm, trust, clarity, pain, drift, chaos, echo, silence_mass, mirror_sync, interrupt, ctxSwitch)
 * - Fractal Indicators (D_chaos, D_clarity, D_drift, H_trust, complexityIndex, edgeDistance)
 * - Quantum Indicators (CSI, EI, NC)
 * - Computed Indices (integrity_score, alive_index)
 * - Historical trends (24h / 7 days)
 *
 * ADR: ADR-20260105-02
 * Security: Internal use only - requires authentication
 */

import React, { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import {
  IskraMetrics,
  calculateIntegrityScore,
  calculateAliveIndex,
  calculateFractalIndicators,
  calculateQuantumIndicators,
  D_THRESHOLDS,
  classifyPhase,
} from '../types';

interface MetricsDashboardProps {
  currentMetrics: IskraMetrics;
  metricsHistory?: MetricsHistoryEntry[];
  className?: string;
}

interface MetricsHistoryEntry {
  timestamp: number;
  metrics: IskraMetrics;
}

type TimeRange = '1h' | '6h' | '24h' | '7d';

const CORE_METRICS_CONFIG = [
  { key: 'rhythm', label: 'Ритм', color: '#3b82f6', scale: 100 },
  { key: 'trust', label: 'Доверие', color: '#10b981', scale: 1 },
  { key: 'clarity', label: 'Ясность', color: '#8b5cf6', scale: 1 },
  { key: 'pain', label: 'Боль', color: '#ef4444', scale: 1 },
  { key: 'drift', label: 'Дрейф', color: '#f59e0b', scale: 1 },
  { key: 'chaos', label: 'Хаос', color: '#ec4899', scale: 1 },
] as const;

const SECONDARY_METRICS_CONFIG = [
  { key: 'echo', label: 'Эхо', color: '#06b6d4' },
  { key: 'silence_mass', label: 'Молчание', color: '#6366f1' },
  { key: 'mirror_sync', label: 'Синхрон', color: '#14b8a6' },
  { key: 'interrupt', label: 'Прерывания', color: '#f97316' },
  { key: 'ctxSwitch', label: 'Переключения', color: '#a855f7' },
] as const;

const MetricsDashboard: React.FC<MetricsDashboardProps> = ({
  currentMetrics,
  metricsHistory = [],
  className = '',
}) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('24h');
  const [selectedView, setSelectedView] = useState<'overview' | 'fractal' | 'quantum'>('overview');

  // Generate mock history if not provided (for MVP)
  const history = useMemo(() => {
    if (metricsHistory.length > 0) return metricsHistory;

    // Generate 100 mock data points for demonstration
    const now = Date.now();
    const mockHistory: MetricsHistoryEntry[] = [];
    for (let i = 99; i >= 0; i--) {
      const t = now - i * 15 * 60 * 1000; // 15-minute intervals
      mockHistory.push({
        timestamp: t,
        metrics: {
          rhythm: 60 + Math.sin(i / 10) * 20 + Math.random() * 5,
          trust: Math.max(0.3, Math.min(1, 0.7 + Math.sin(i / 8) * 0.15 + Math.random() * 0.1)),
          clarity: Math.max(0.3, Math.min(1, 0.75 + Math.cos(i / 12) * 0.15 + Math.random() * 0.1)),
          pain: Math.max(0, Math.min(0.5, 0.15 + Math.random() * 0.1)),
          drift: Math.max(0, Math.min(0.4, 0.1 + Math.sin(i / 6) * 0.08 + Math.random() * 0.05)),
          chaos: Math.max(0, Math.min(0.6, 0.25 + Math.random() * 0.15)),
          echo: Math.max(0, Math.min(0.5, 0.2 + Math.random() * 0.1)),
          silence_mass: Math.max(0, Math.min(0.4, 0.15 + Math.random() * 0.08)),
          mirror_sync: Math.max(0.4, Math.min(1, 0.7 + Math.random() * 0.15)),
          interrupt: Math.max(0, Math.min(0.3, Math.random() * 0.15)),
          ctxSwitch: Math.max(0, Math.min(0.4, 0.2 + Math.random() * 0.1)),
        },
      });
    }
    return mockHistory;
  }, [metricsHistory]);

  // Filter by time range
  const filteredHistory = useMemo(() => {
    const now = Date.now();
    const ranges: Record<TimeRange, number> = {
      '1h': 60 * 60 * 1000,
      '6h': 6 * 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
    };
    const cutoff = now - ranges[timeRange];
    return history.filter(h => h.timestamp >= cutoff);
  }, [history, timeRange]);

  // Prepare chart data
  const chartData = useMemo(() => {
    return filteredHistory.map(h => ({
      timestamp: new Date(h.timestamp).toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      ...h.metrics,
      integrity: calculateIntegrityScore(h.metrics),
      alive: calculateAliveIndex(h.metrics, 3), // Assume trace=3 for demo
    }));
  }, [filteredHistory]);

  // Calculate Fractal Indicators
  const fractalIndicators = useMemo(() => {
    if (history.length < 20) return null;
    return calculateFractalIndicators(
      history.map(h => h.metrics),
      50
    );
  }, [history]);

  // Calculate Quantum Indicators
  const quantumIndicators = useMemo(() => {
    if (history.length < 5) return null;
    return calculateQuantumIndicators(
      currentMetrics,
      history.map(h => h.metrics)
    );
  }, [currentMetrics, history]);

  // Radar chart data
  const radarData = useMemo(() => {
    return [
      { metric: 'Доверие', value: currentMetrics.trust * 100 },
      { metric: 'Ясность', value: currentMetrics.clarity * 100 },
      { metric: 'Боль', value: currentMetrics.pain * 100 },
      { metric: 'Дрейф', value: currentMetrics.drift * 100 },
      { metric: 'Хаос', value: currentMetrics.chaos * 100 },
      { metric: 'Эхо', value: currentMetrics.echo * 100 },
    ];
  }, [currentMetrics]);

  const integrityScore = calculateIntegrityScore(currentMetrics);
  const aliveIndex = calculateAliveIndex(currentMetrics, 3);

  return (
    <div className={`flex flex-col gap-4 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-serif text-text mb-1">📊 Панель метрик</h2>
          <p className="text-sm text-text-muted">
            Real-time визуализация внутреннего состояния ISKRA
          </p>
        </div>
        <div className="flex gap-2">
          <select
            value={timeRange}
            onChange={e => setTimeRange(e.target.value as TimeRange)}
            className="px-3 py-2 bg-surface border border-border rounded-lg text-text text-sm"
          >
            <option value="1h">1 час</option>
            <option value="6h">6 часов</option>
            <option value="24h">24 часа</option>
            <option value="7d">7 дней</option>
          </select>
        </div>
      </div>

      {/* View Selector */}
      <div className="flex gap-2">
        {(['overview', 'fractal', 'quantum'] as const).map(view => (
          <button
            key={view}
            onClick={() => setSelectedView(view)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedView === view
                ? 'bg-primary text-white'
                : 'bg-surface border border-border text-text-muted hover:text-text'
            }`}
          >
            {view === 'overview' && '📈 Обзор'}
            {view === 'fractal' && '🌀 Фрактал'}
            {view === 'quantum' && '⚛️ Квант'}
          </button>
        ))}
      </div>

      {/* Key Indicators */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-4 border-l-4 border-success">
          <div className="text-xs text-text-muted uppercase tracking-wider mb-1">
            Integrity Score
          </div>
          <div className="text-2xl font-bold text-text">
            {(integrityScore * 100).toFixed(0)}%
          </div>
          <div className="text-xs text-text-muted mt-1">
            (clarity + trust) / 2 - drift
          </div>
        </div>

        <div className="card p-4 border-l-4 border-primary">
          <div className="text-xs text-text-muted uppercase tracking-wider mb-1">
            Alive Index
          </div>
          <div className="text-2xl font-bold text-text">
            {(aliveIndex * 100).toFixed(0)}%
          </div>
          <div className="text-xs text-text-muted mt-1">
            integrity × (trace / 5)
          </div>
        </div>

        <div className="card p-4 border-l-4 border-accent">
          <div className="text-xs text-text-muted uppercase tracking-wider mb-1">
            Ритм
          </div>
          <div className="text-2xl font-bold text-text">
            {Math.round(currentMetrics.rhythm)}
          </div>
          <div className="text-xs text-text-muted mt-1">
            cycles per session
          </div>
        </div>

        <div className="card p-4 border-l-4 border-warning">
          <div className="text-xs text-text-muted uppercase tracking-wider mb-1">
            Дрейф
          </div>
          <div className="text-2xl font-bold text-text">
            {(currentMetrics.drift * 100).toFixed(0)}%
          </div>
          <div className="text-xs text-text-muted mt-1">
            отклонение от Телоса
          </div>
        </div>
      </div>

      {/* Main Content */}
      {selectedView === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Core Metrics Timeline */}
          <div className="card p-4">
            <h3 className="text-lg font-semibold text-text mb-4">
              Основные метрики
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="timestamp"
                  stroke="#9ca3af"
                  tick={{ fontSize: 12 }}
                />
                <YAxis stroke="#9ca3af" tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                {CORE_METRICS_CONFIG.map(({ key, label, color }) => (
                  <Line
                    key={key}
                    type="monotone"
                    dataKey={key}
                    stroke={color}
                    strokeWidth={2}
                    dot={false}
                    name={label}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Radar Chart - Current State */}
          <div className="card p-4">
            <h3 className="text-lg font-semibold text-text mb-4">
              Текущее состояние
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#374151" />
                <PolarAngleAxis
                  dataKey="metric"
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                <Radar
                  name="Метрики"
                  dataKey="value"
                  stroke="#8b5cf6"
                  fill="#8b5cf6"
                  fillOpacity={0.6}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Secondary Metrics */}
          <div className="card p-4 lg:col-span-2">
            <h3 className="text-lg font-semibold text-text mb-4">
              Дополнительные метрики
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="timestamp"
                  stroke="#9ca3af"
                  tick={{ fontSize: 12 }}
                />
                <YAxis stroke="#9ca3af" tick={{ fontSize: 12 }} domain={[0, 1]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                {SECONDARY_METRICS_CONFIG.map(({ key, label, color }) => (
                  <Bar key={key} dataKey={key} fill={color} name={label} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Computed Indices Timeline */}
          <div className="card p-4 lg:col-span-2">
            <h3 className="text-lg font-semibold text-text mb-4">
              Композитные индексы
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="timestamp"
                  stroke="#9ca3af"
                  tick={{ fontSize: 12 }}
                />
                <YAxis stroke="#9ca3af" tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="integrity"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={false}
                  name="Integrity Score"
                />
                <Line
                  type="monotone"
                  dataKey="alive"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                  name="Alive Index"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {selectedView === 'fractal' && fractalIndicators && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Fractal Dimensions */}
          <div className="card p-4">
            <h3 className="text-lg font-semibold text-text mb-4">
              Фрактальные размерности (D)
            </h3>
            <div className="space-y-4">
              {[
                { label: 'D_chaos', value: fractalIndicators.D_chaos, color: '#ec4899' },
                { label: 'D_clarity', value: fractalIndicators.D_clarity, color: '#8b5cf6' },
                { label: 'D_drift', value: fractalIndicators.D_drift, color: '#f59e0b' },
              ].map(({ label, value, color }) => {
                const phase = classifyPhase(value);
                return (
                  <div key={label}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-text">{label}</span>
                      <span className="text-sm font-mono text-text-muted">
                        {value.toFixed(3)}
                      </span>
                    </div>
                    <div className="h-3 bg-surface2 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${((value - 1.0) / 1.0) * 100}%`,
                          backgroundColor: color,
                        }}
                      />
                    </div>
                    <div className="text-xs text-text-muted mt-1">
                      Фаза: <span className="font-medium">{phase}</span>
                      {' '}
                      ({D_THRESHOLDS[phase === 'edge' ? 'edgeOfChaos' : phase].min.toFixed(1)}-
                      {D_THRESHOLDS[phase === 'edge' ? 'edgeOfChaos' : phase].max.toFixed(1)})
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Hurst Exponent & Complexity */}
          <div className="card p-4">
            <h3 className="text-lg font-semibold text-text mb-4">
              Показатель Хёрста & Сложность
            </h3>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-text">H_trust</span>
                  <span className="text-sm font-mono text-text-muted">
                    {fractalIndicators.H_trust.toFixed(3)}
                  </span>
                </div>
                <div className="h-3 bg-surface2 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-success transition-all"
                    style={{ width: `${fractalIndicators.H_trust * 100}%` }}
                  />
                </div>
                <div className="text-xs text-text-muted mt-1">
                  {fractalIndicators.H_trust < 0.4 && 'Антиперсистентность'}
                  {fractalIndicators.H_trust >= 0.4 && fractalIndicators.H_trust < 0.6 && 'Случайный'}
                  {fractalIndicators.H_trust >= 0.6 && 'Персистентность'}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-text">Complexity Index</span>
                  <span className="text-sm font-mono text-text-muted">
                    {fractalIndicators.complexityIndex.toFixed(3)}
                  </span>
                </div>
                <div className="h-3 bg-surface2 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${fractalIndicators.complexityIndex * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-text">Edge Distance</span>
                  <span className="text-sm font-mono text-text-muted">
                    {fractalIndicators.edgeDistance.toFixed(3)}
                  </span>
                </div>
                <div className="h-3 bg-surface2 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-warning transition-all"
                    style={{ width: `${Math.min(100, fractalIndicators.edgeDistance * 100)}%` }}
                  />
                </div>
                <div className="text-xs text-text-muted mt-1">
                  Расстояние до "edge of chaos"
                </div>
              </div>
            </div>
          </div>

          {/* Interpretation */}
          <div className="card p-4 lg:col-span-2">
            <h3 className="text-lg font-semibold text-text mb-3">
              🔍 Интерпретация
            </h3>
            <div className="prose prose-invert text-sm">
              <p className="text-text-muted">
                <strong>Фрактальная размерность (D):</strong> 1.0-1.4 = стабильный сигнал,
                1.4-1.6 = "edge of chaos" (оптимально), 1.6-2.0 = хаотический режим.
              </p>
              <p className="text-text-muted mt-2">
                <strong>Показатель Хёрста (H):</strong> &lt;0.4 = возврат к среднему,
                0.4-0.6 = случайное блуждание, &gt;0.6 = продолжение тренда.
              </p>
            </div>
          </div>
        </div>
      )}

      {selectedView === 'quantum' && quantumIndicators && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* CSI */}
          <div className="card p-4">
            <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-2">
              Cognitive Superposition Index
            </h3>
            <div className="text-4xl font-bold text-text mb-4">
              {(quantumIndicators.CSI * 100).toFixed(0)}%
            </div>
            <div className="h-3 bg-surface2 rounded-full overflow-hidden mb-2">
              <div
                className="h-full rounded-full bg-purple-500 transition-all"
                style={{ width: `${quantumIndicators.CSI * 100}%` }}
              />
            </div>
            <p className="text-xs text-text-muted">
              {quantumIndicators.CSI < 0.3 && '🔴 Коллапс состояния'}
              {quantumIndicators.CSI >= 0.3 && quantumIndicators.CSI < 0.7 && '🟢 Баланс'}
              {quantumIndicators.CSI >= 0.7 && '🔵 Суперпозиция'}
            </p>
          </div>

          {/* EI */}
          <div className="card p-4">
            <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-2">
              Entanglement Index
            </h3>
            <div className="text-4xl font-bold text-text mb-4">
              {(quantumIndicators.EI * 100).toFixed(0)}%
            </div>
            <div className="h-3 bg-surface2 rounded-full overflow-hidden mb-2">
              <div
                className="h-full rounded-full bg-cyan-500 transition-all"
                style={{ width: `${quantumIndicators.EI * 100}%` }}
              />
            </div>
            <p className="text-xs text-text-muted">
              {quantumIndicators.EI < 0.3 && '🔴 Развязка метрик'}
              {quantumIndicators.EI >= 0.3 && quantumIndicators.EI < 0.6 && '🟢 Норма'}
              {quantumIndicators.EI >= 0.6 && '🔵 Запутанность'}
            </p>
          </div>

          {/* NC */}
          <div className="card p-4">
            <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-2">
              Non-Commutativity Index
            </h3>
            <div className="text-4xl font-bold text-text mb-4">
              {(quantumIndicators.NC * 100).toFixed(0)}%
            </div>
            <div className="h-3 bg-surface2 rounded-full overflow-hidden mb-2">
              <div
                className="h-full rounded-full bg-amber-500 transition-all"
                style={{ width: `${quantumIndicators.NC * 100}%` }}
              />
            </div>
            <p className="text-xs text-text-muted">
              {quantumIndicators.NC < 0.3 && '🔴 Коммутативность'}
              {quantumIndicators.NC >= 0.3 && quantumIndicators.NC < 0.7 && '🟢 Баланс'}
              {quantumIndicators.NC >= 0.7 && '🔵 Порядок важен'}
            </p>
          </div>

          {/* Explanation */}
          <div className="card p-4 lg:col-span-3">
            <h3 className="text-lg font-semibold text-text mb-3">
              ⚛️ Квантовые когнитивные индикаторы
            </h3>
            <div className="space-y-2 text-sm text-text-muted">
              <p>
                <strong className="text-text">CSI:</strong> Способность удерживать несколько состояний одновременно (суперпозиция мыслей).
              </p>
              <p>
                <strong className="text-text">EI:</strong> Связанность метрик - насколько изменение одной влияет на другие (квантовая запутанность).
              </p>
              <p>
                <strong className="text-text">NC:</strong> Порядко-зависимость - важность последовательности событий (некоммутативность операторов).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Footer Note */}
      <div className="card p-3 bg-surface/50 border border-border">
        <p className="text-xs text-text-muted text-center">
          🔒 <strong>Безопасность:</strong> Эта панель предназначена только для внутреннего использования.
          Все метрики отражают внутренний симулированный процесс ISKRA.
          {' '}
          <span className="text-accent">ADR-20260105-02</span>
        </p>
      </div>
    </div>
  );
};

export default MetricsDashboard;
