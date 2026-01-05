/**
 * BREATHING INDICATOR - Индикатор дыхания под hero-кольцом
 * 
 * Отображает текущую фазу дыхания (вдох/выдох) синхронизированную с анимацией пульса.
 * Помогает пользователю войти в ритм с визуальной обратной связью.
 */

import React, { useState, useEffect } from 'react';

interface BreathingIndicatorProps {
  /** Продолжительность дыхательного цикла в секундах */
  duration: number;
  /** Показывать ли индикатор */
  visible?: boolean;
  /** Дополнительные CSS классы */
  className?: string;
}

type BreathPhase = 'INHALE' | 'EXHALE';

const BreathingIndicator: React.FC<BreathingIndicatorProps> = ({ 
  duration, 
  visible = true,
  className = '' 
}) => {
  const [phase, setPhase] = useState<BreathPhase>('INHALE');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!visible) return;

    // Цикл дыхания: половина времени вдох, половина выдох
    const halfDuration = (duration / 2) * 1000;
    const startTime = Date.now();
    let currentPhase: BreathPhase = 'INHALE';
    let animationId: number;
    let isActive = true;

    const animate = () => {
      if (!isActive) return; // Stop if unmounted or visibility changed
      
      const elapsed = Date.now() - startTime;
      const cyclePosition = elapsed % (halfDuration * 2);
      
      // Определяем фазу
      const newPhase: BreathPhase = cyclePosition < halfDuration ? 'INHALE' : 'EXHALE';
      
      // Вычисляем прогресс внутри текущей фазы (0-1)
      const phaseProgress = cyclePosition < halfDuration 
        ? cyclePosition / halfDuration 
        : (cyclePosition - halfDuration) / halfDuration;

      if (newPhase !== currentPhase) {
        currentPhase = newPhase;
        setPhase(newPhase);
      }
      
      setProgress(phaseProgress);
      
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      isActive = false;
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [duration, visible]);

  if (!visible) return null;

  const isInhale = phase === 'INHALE';
  const opacity = 0.4 + (progress * 0.3); // Плавное изменение прозрачности

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* Текст фазы */}
      <div 
        className="relative text-center"
        style={{ 
          opacity,
          transform: `translateY(${isInhale ? '-2px' : '2px'})`,
          transition: 'opacity 100ms linear'
        }}
      >
        <p className={`text-sm font-mono uppercase tracking-[0.3em] transition-colors duration-1000 ${
          isInhale ? 'text-accent' : 'text-text-muted'
        }`}>
          {isInhale ? 'Вдох' : 'Выдох'}
        </p>
      </div>

      {/* Визуальная волна дыхания */}
      <div className="relative w-24 h-1 mt-3 bg-white/5 rounded-full overflow-hidden">
        <div 
          className={`absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ease-in-out ${
            isInhale ? 'bg-accent' : 'bg-text-muted'
          }`}
          style={{ 
            width: `${progress * 100}%`,
            boxShadow: isInhale 
              ? '0 0 10px rgba(77, 163, 255, 0.5)' 
              : '0 0 5px rgba(138, 145, 153, 0.3)'
          }}
        />
      </div>

      {/* Тонкая пульсация-точка для медитативного фокуса */}
      <div className="mt-4 relative w-2 h-2">
        <div 
          className={`absolute inset-0 rounded-full transition-all duration-1000 ${
            isInhale ? 'bg-accent scale-150' : 'bg-text-muted/50 scale-100'
          }`}
          style={{
            boxShadow: isInhale ? '0 0 15px rgba(77, 163, 255, 0.6)' : 'none'
          }}
        />
      </div>
    </div>
  );
};

export default BreathingIndicator;
