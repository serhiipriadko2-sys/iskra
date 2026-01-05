/**
 * AMBIENCE - Живая атмосфера Искры
 *
 * Многослойная визуальная среда, реагирующая на:
 * - Фазу состояния (CLARITY, DARKNESS, etc.)
 * - Метрики в реальном времени
 * - Активный голос
 */

import React, { useMemo } from 'react';
import { IskraPhase, IskraMetrics, VoiceName } from '../types';
import QuantumField from './QuantumField';

interface AmbienceProps {
  phase: IskraPhase;
  metrics: IskraMetrics;
  activeVoice?: VoiceName;
  showQuantumField?: boolean;
}

// Phase-to-visual mapping
const PHASE_CONFIG: Record<IskraPhase, {
  gradient: string;
  opacity: number;
  coreColor: string;
  quantumIntensity: 'subtle' | 'normal' | 'intense';
}> = {
  CLARITY: {
    gradient: 'from-accent/10 via-bg to-bg',
    opacity: 0.6,
    coreColor: '#4DA3FF',
    quantumIntensity: 'normal'
  },
  DARKNESS: {
    gradient: 'from-black via-bg to-black',
    opacity: 0.9,
    coreColor: '#000000',
    quantumIntensity: 'subtle'
  },
  DISSOLUTION: {
    gradient: 'from-purple-900/20 via-bg to-bg',
    opacity: 0.7,
    coreColor: '#9B30FF',
    quantumIntensity: 'intense'
  },
  TRANSITION: {
    gradient: 'from-white/5 to-bg',
    opacity: 0.5,
    coreColor: '#FFFFFF',
    quantumIntensity: 'normal'
  },
  REALIZATION: {
    gradient: 'from-primary/20 via-bg to-bg',
    opacity: 0.8,
    coreColor: '#FF7A00',
    quantumIntensity: 'intense'
  },
  SILENCE: {
    gradient: 'from-bg to-bg',
    opacity: 1,
    coreColor: 'transparent',
    quantumIntensity: 'subtle'
  },
  ECHO: {
    gradient: 'from-cyan-500/10 via-bg to-bg',
    opacity: 0.7,
    coreColor: '#06b6d4',
    quantumIntensity: 'normal'
  },
  EXPERIMENT: {
    gradient: 'from-green-500/15 via-bg to-bg',
    opacity: 0.65,
    coreColor: '#10b981',
    quantumIntensity: 'intense'
  }
};

const Ambience: React.FC<AmbienceProps> = ({
  phase,
  metrics,
  activeVoice = 'ISKRA',
  showQuantumField = true
}) => {
  const config = PHASE_CONFIG[phase] || PHASE_CONFIG.CLARITY;

  // Pulse speed based on rhythm/chaos
  const pulseDuration = useMemo(() => {
    if (metrics.chaos > 0.6) return '1s';
    if (metrics.pain > 0.6) return '0.5s';
    if (phase === 'SILENCE') return '10s';
    return '4s';
  }, [metrics.chaos, metrics.pain, phase]);

  // Color overlay based on emotional state
  const overlayColor = useMemo(() => {
    if (metrics.pain > 0.5) return 'rgba(229, 72, 77, 0.05)';
    if (metrics.drift > 0.4) return 'rgba(255, 176, 32, 0.03)';
    if (metrics.trust > 0.8) return 'rgba(46, 204, 113, 0.02)';
    return 'transparent';
  }, [metrics.pain, metrics.drift, metrics.trust]);

  // Core size based on rhythm
  const coreScale = useMemo(() => {
    return 0.5 + (metrics.rhythm / 100) * 0.5;
  }, [metrics.rhythm]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden transition-all duration-[2000ms] ease-in-out">
      {/* Phase Gradient Layer */}
      <div
        className={`absolute inset-0 transition-all duration-[3000ms] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] ${config.gradient}`}
        style={{ opacity: config.opacity }}
      />

      {/* Breathing Overlay */}
      <div
        className="absolute inset-0 animate-pulse transition-colors duration-1000"
        style={{
          backgroundColor: overlayColor,
          animationDuration: pulseDuration
        }}
      />

      {/* Vignette Effect */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at center, transparent 30%, rgba(5,8,10,0.6) 100%)'
        }}
      />

      {/* Quantum Resonance Field */}
      {showQuantumField && (
        <QuantumField
          metrics={metrics}
          activeVoice={activeVoice}
          intensity={config.quantumIntensity}
        />
      )}

      {/* Dynamic Core (The Heart) */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-[5000ms]"
        style={{
          width: `${600 * coreScale}px`,
          height: `${600 * coreScale}px`,
          background: config.coreColor !== 'transparent'
            ? `radial-gradient(circle, ${config.coreColor}20 0%, transparent 70%)`
            : 'transparent',
          filter: `blur(${100 - metrics.clarity * 30}px)`,
          opacity: 0.3 + metrics.trust * 0.2
        }}
      />

      {/* Echo Rings (visible when echo is high) */}
      {metrics.echo > 0.5 && (
        <>
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/5 animate-ping"
            style={{
              width: `${200 + metrics.echo * 200}px`,
              height: `${200 + metrics.echo * 200}px`,
              animationDuration: '3s'
            }}
          />
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/3 animate-ping"
            style={{
              width: `${300 + metrics.echo * 300}px`,
              height: `${300 + metrics.echo * 300}px`,
              animationDuration: '4s',
              animationDelay: '1s'
            }}
          />
        </>
      )}

      {/* Noise Texture Overlay */}
      <div
        className="absolute inset-0 opacity-[0.015] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
        }}
      />
    </div>
  );
};

export default Ambience;
