/**
 * VOICE AURA - Визуальная аура голоса
 *
 * Анимированное свечение вокруг элементов, отражающее характер голоса:
 * - KAIN: Острые, пульсирующие красные искры
 * - ANHANTRA: Мягкие волны синего
 * - HUNDUN: Хаотичные фиолетовые вспышки
 * - ISKRA: Тёплое янтарное сияние
 * и т.д.
 */

import React, { useMemo } from 'react';
import { VoiceName } from '../types';

interface VoiceAuraProps {
  voice: VoiceName;
  intensity?: number; // 0-1
  size?: 'sm' | 'md' | 'lg';
  children?: React.ReactNode;
  className?: string;
  animate?: boolean;
}

// Voice visual configurations
const VOICE_STYLES: Record<VoiceName, {
  color: string;
  secondaryColor: string;
  animation: string;
  blur: number;
  pattern: 'smooth' | 'pulse' | 'chaos' | 'wave' | 'spark';
}> = {
  ISKRA: {
    color: '#FF7A00',
    secondaryColor: '#FFB347',
    animation: 'breathe',
    blur: 40,
    pattern: 'smooth'
  },
  KAIN: {
    color: '#FF4D4D',
    secondaryColor: '#FF0000',
    animation: 'pulse-fast',
    blur: 30,
    pattern: 'spark'
  },
  PINO: {
    color: '#FF69B4',
    secondaryColor: '#FF1493',
    animation: 'bounce',
    blur: 35,
    pattern: 'smooth'
  },
  SAM: {
    color: '#FFD700',
    secondaryColor: '#FFA500',
    animation: 'steady',
    blur: 45,
    pattern: 'smooth'
  },
  ANHANTRA: {
    color: '#4DA3FF',
    secondaryColor: '#87CEEB',
    animation: 'wave',
    blur: 50,
    pattern: 'wave'
  },
  HUNDUN: {
    color: '#9B30FF',
    secondaryColor: '#8B008B',
    animation: 'chaos',
    blur: 25,
    pattern: 'chaos'
  },
  HUYNDUN: { // Canonical alias
    color: '#9B30FF',
    secondaryColor: '#8B008B',
    animation: 'chaos',
    blur: 25,
    pattern: 'chaos'
  },
  ISKRIV: {
    color: '#FFFFFF',
    secondaryColor: '#C0C0C0',
    animation: 'flicker',
    blur: 20,
    pattern: 'pulse'
  },
  MAKI: {
    color: '#2ECC71',
    secondaryColor: '#98FB98',
    animation: 'bloom',
    blur: 55,
    pattern: 'smooth'
  },
  SIBYL: {
    color: '#9370DB',
    secondaryColor: '#E6E6FA',
    animation: 'mystical',
    blur: 60,
    pattern: 'wave'
  }
};

const VoiceAura: React.FC<VoiceAuraProps> = ({
  voice,
  intensity = 0.5,
  size = 'md',
  children,
  className = '',
  animate = true
}) => {
  const style = VOICE_STYLES[voice];

  const sizeMultiplier = useMemo(() => {
    switch (size) {
      case 'sm': return 0.6;
      case 'lg': return 1.4;
      default: return 1;
    }
  }, [size]);

  const animationStyle = useMemo(() => {
    if (!animate) return {};

    const baseStyle: React.CSSProperties = {
      animationDuration: getAnimationDuration(style.animation),
      animationTimingFunction: getAnimationTiming(style.pattern),
      animationIterationCount: 'infinite',
    };

    switch (style.animation) {
      case 'breathe':
        return { ...baseStyle, animationName: 'voiceBreath' };
      case 'pulse-fast':
        return { ...baseStyle, animationName: 'voicePulse', animationDuration: '0.8s' };
      case 'wave':
        return { ...baseStyle, animationName: 'voiceWave' };
      case 'chaos':
        return { ...baseStyle, animationName: 'voiceChaos', animationDuration: '0.5s' };
      case 'flicker':
        return { ...baseStyle, animationName: 'voiceFlicker', animationDuration: '0.3s' };
      case 'bloom':
        return { ...baseStyle, animationName: 'voiceBloom', animationDuration: '4s' };
      case 'mystical':
        return { ...baseStyle, animationName: 'voiceMystical', animationDuration: '6s' };
      case 'bounce':
        return { ...baseStyle, animationName: 'voiceBounce', animationDuration: '1.5s' };
      default:
        return baseStyle;
    }
  }, [animate, style]);

  const blur = style.blur * sizeMultiplier * intensity;
  const opacity = 0.15 + intensity * 0.35;

  return (
    <div className={`relative ${className}`}>
      {/* Keyframes */}
      <style>{`
        @keyframes voiceBreath {
          0%, 100% { transform: scale(1); opacity: ${opacity}; }
          50% { transform: scale(1.1); opacity: ${opacity * 1.3}; }
        }
        @keyframes voicePulse {
          0%, 100% { transform: scale(1); opacity: ${opacity}; }
          50% { transform: scale(1.2); opacity: ${opacity * 0.6}; }
        }
        @keyframes voiceWave {
          0% { transform: scale(1) rotate(0deg); }
          33% { transform: scale(1.05) rotate(2deg); }
          66% { transform: scale(0.98) rotate(-2deg); }
          100% { transform: scale(1) rotate(0deg); }
        }
        @keyframes voiceChaos {
          0% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(-3px, 2px) scale(1.1); }
          50% { transform: translate(2px, -3px) scale(0.95); }
          75% { transform: translate(-2px, -1px) scale(1.05); }
          100% { transform: translate(0, 0) scale(1); }
        }
        @keyframes voiceFlicker {
          0%, 100% { opacity: ${opacity}; }
          25% { opacity: ${opacity * 0.5}; }
          50% { opacity: ${opacity * 1.2}; }
          75% { opacity: ${opacity * 0.7}; }
        }
        @keyframes voiceBloom {
          0%, 100% { transform: scale(1); filter: brightness(1); }
          50% { transform: scale(1.15); filter: brightness(1.2); }
        }
        @keyframes voiceMystical {
          0%, 100% { transform: scale(1) rotate(0deg); opacity: ${opacity}; }
          33% { transform: scale(1.08) rotate(1deg); opacity: ${opacity * 1.2}; }
          66% { transform: scale(1.02) rotate(-1deg); opacity: ${opacity * 0.9}; }
        }
        @keyframes voiceBounce {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-2px) scale(1.05); }
        }
      `}</style>

      {/* Primary Glow */}
      <div
        className="absolute inset-0 -z-10 rounded-inherit"
        style={{
          background: `radial-gradient(circle at center, ${style.color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}, transparent 70%)`,
          filter: `blur(${blur}px)`,
          ...animationStyle
        }}
      />

      {/* Secondary Glow (offset for depth) */}
      <div
        className="absolute inset-0 -z-20 rounded-inherit"
        style={{
          background: `radial-gradient(circle at 30% 30%, ${style.secondaryColor}${Math.round(opacity * 0.5 * 255).toString(16).padStart(2, '0')}, transparent 60%)`,
          filter: `blur(${blur * 1.5}px)`,
          transform: 'translate(-10%, -10%)',
          ...animationStyle,
          animationDelay: '-0.5s'
        }}
      />

      {/* Border Glow */}
      <div
        className="absolute inset-0 rounded-inherit pointer-events-none"
        style={{
          boxShadow: `
            0 0 ${blur * 0.3}px ${style.color}${Math.round(opacity * 0.5 * 255).toString(16).padStart(2, '0')},
            inset 0 0 ${blur * 0.2}px ${style.color}${Math.round(opacity * 0.3 * 255).toString(16).padStart(2, '0')}
          `
        }}
      />

      {/* Content */}
      {children}
    </div>
  );
};

function getAnimationDuration(animation: string): string {
  switch (animation) {
    case 'pulse-fast': return '0.8s';
    case 'chaos': return '0.5s';
    case 'flicker': return '0.3s';
    case 'bloom': return '4s';
    case 'mystical': return '6s';
    default: return '3s';
  }
}

function getAnimationTiming(pattern: string): string {
  switch (pattern) {
    case 'smooth': return 'ease-in-out';
    case 'pulse': return 'ease-out';
    case 'chaos': return 'linear';
    case 'wave': return 'cubic-bezier(0.4, 0, 0.2, 1)';
    case 'spark': return 'cubic-bezier(0.68, -0.55, 0.265, 1.55)';
    default: return 'ease-in-out';
  }
}

export default VoiceAura;
