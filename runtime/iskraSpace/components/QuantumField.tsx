/**
 * QUANTUM RESONANCE FIELD - Уникальная визуальная фишка Iskra
 *
 * Живое поле частиц, которое:
 * - Реагирует на метрики в реальном времени
 * - Меняет цвет в зависимости от активного голоса
 * - Создаёт эффект "дыхания" синхронизированного с ритмом
 * - Формирует уникальные паттерны резонанса
 */

import React, { useRef, useEffect, useMemo } from 'react';
import { IskraMetrics, VoiceName } from '../types';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  hue: number;
  life: number;
  maxLife: number;
}

interface QuantumFieldProps {
  metrics: IskraMetrics;
  activeVoice?: VoiceName;
  intensity?: 'subtle' | 'normal' | 'intense';
  className?: string;
}

// Voice-to-color mapping (HSL hue values)
const VOICE_HUES: Record<VoiceName, number> = {
  ISKRA: 25,      // Orange-amber
  KAIN: 0,        // Red
  PINO: 330,      // Pink
  SAM: 45,        // Gold
  ANHANTRA: 200,  // Cyan
  HUNDUN: 280,    // Purple
  ISKRIV: 0,      // White (saturation=0)
  MAKI: 140,      // Green
  SIBYL: 260,     // Violet
};

const QuantumField: React.FC<QuantumFieldProps> = ({
  metrics,
  activeVoice = 'ISKRA',
  intensity = 'normal',
  className = ''
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  // Particle count based on intensity
  const particleCount = useMemo(() => {
    const base = intensity === 'subtle' ? 30 : intensity === 'intense' ? 100 : 60;
    // Add more particles when chaos is high
    return Math.floor(base * (1 + metrics.chaos * 0.5));
  }, [intensity, metrics.chaos]);

  // Initialize particles
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;

    // Create initial particles
    particlesRef.current = Array.from({ length: particleCount }, () =>
      createParticle(canvas.width, canvas.height, VOICE_HUES[activeVoice])
    );
  }, [particleCount, activeVoice]);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = (timestamp: number) => {
      const deltaTime = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;

      // Clear with fade effect for trails
      ctx.fillStyle = `rgba(5, 8, 10, ${0.1 + metrics.chaos * 0.05})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const targetHue = VOICE_HUES[activeVoice];

      // Breathing rate based on rhythm
      const breathRate = 0.001 + (metrics.rhythm / 100) * 0.002;
      const breathPhase = Math.sin(timestamp * breathRate);

      // Update and draw particles
      particlesRef.current.forEach((particle, index) => {
        // Attraction to center based on trust
        const dx = centerX - particle.x;
        const dy = centerY - particle.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const attraction = 0.00005 * metrics.trust;

        particle.vx += (dx / dist) * attraction * deltaTime;
        particle.vy += (dy / dist) * attraction * deltaTime;

        // Chaos creates turbulence
        if (metrics.chaos > 0.3) {
          particle.vx += (Math.random() - 0.5) * metrics.chaos * 0.1;
          particle.vy += (Math.random() - 0.5) * metrics.chaos * 0.1;
        }

        // Pain creates pulsation
        if (metrics.pain > 0.5) {
          const pulseFactor = Math.sin(timestamp * 0.01) * metrics.pain;
          particle.size = particle.size * (1 + pulseFactor * 0.3);
        }

        // Update position
        particle.x += particle.vx * deltaTime;
        particle.y += particle.vy * deltaTime;

        // Drift affects direction
        if (metrics.drift > 0.2) {
          particle.vx += Math.sin(timestamp * 0.0005 + index) * metrics.drift * 0.01;
        }

        // Gradually shift hue towards active voice
        const hueDiff = targetHue - particle.hue;
        particle.hue += hueDiff * 0.02;

        // Life cycle
        particle.life -= deltaTime * 0.001;
        particle.opacity = Math.min(1, particle.life / particle.maxLife) * (0.3 + breathPhase * 0.2);

        // Respawn if dead or out of bounds
        if (particle.life <= 0 ||
            particle.x < -50 || particle.x > canvas.width + 50 ||
            particle.y < -50 || particle.y > canvas.height + 50) {
          Object.assign(particle, createParticle(canvas.width, canvas.height, targetHue));
        }

        // Draw particle
        const saturation = activeVoice === 'ISKRIV' ? 0 : 70 + metrics.clarity * 30;
        const lightness = 50 + metrics.clarity * 20;

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * (1 + breathPhase * 0.1), 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${particle.hue}, ${saturation}%, ${lightness}%, ${particle.opacity})`;
        ctx.fill();

        // Glow effect for high rhythm
        if (metrics.rhythm > 60) {
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size * 3, 0, Math.PI * 2);
          const gradient = ctx.createRadialGradient(
            particle.x, particle.y, 0,
            particle.x, particle.y, particle.size * 3
          );
          gradient.addColorStop(0, `hsla(${particle.hue}, ${saturation}%, ${lightness}%, ${particle.opacity * 0.3})`);
          gradient.addColorStop(1, 'transparent');
          ctx.fillStyle = gradient;
          ctx.fill();
        }
      });

      // Draw connection lines between nearby particles (mirror_sync effect)
      if (metrics.mirror_sync > 0.4) {
        ctx.strokeStyle = `rgba(255, 255, 255, ${metrics.mirror_sync * 0.05})`;
        ctx.lineWidth = 0.5;

        for (let i = 0; i < particlesRef.current.length; i++) {
          for (let j = i + 1; j < particlesRef.current.length; j++) {
            const p1 = particlesRef.current[i];
            const p2 = particlesRef.current[j];
            const dx = p2.x - p1.x;
            const dy = p2.y - p1.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 100 * metrics.mirror_sync) {
              ctx.beginPath();
              ctx.moveTo(p1.x, p1.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.stroke();
            }
          }
        }
      }

      // Central core glow
      const coreSize = 50 + metrics.rhythm * 0.5 + breathPhase * 10;
      const coreGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, coreSize);
      coreGradient.addColorStop(0, `hsla(${targetHue}, 80%, 60%, ${0.2 + metrics.trust * 0.1})`);
      coreGradient.addColorStop(0.5, `hsla(${targetHue}, 60%, 40%, ${0.1 + metrics.trust * 0.05})`);
      coreGradient.addColorStop(1, 'transparent');

      ctx.beginPath();
      ctx.arc(centerX, centerY, coreSize, 0, Math.PI * 2);
      ctx.fillStyle = coreGradient;
      ctx.fill();

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [metrics, activeVoice]);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{
        width: '100%',
        height: '100%',
        mixBlendMode: 'screen'
      }}
    />
  );
};

function createParticle(width: number, height: number, baseHue: number): Particle {
  const angle = Math.random() * Math.PI * 2;
  const distance = Math.random() * Math.min(width, height) * 0.4;

  return {
    x: width / 2 + Math.cos(angle) * distance,
    y: height / 2 + Math.sin(angle) * distance,
    vx: (Math.random() - 0.5) * 0.5,
    vy: (Math.random() - 0.5) * 0.5,
    size: 1 + Math.random() * 3,
    opacity: Math.random() * 0.5 + 0.2,
    hue: baseHue + (Math.random() - 0.5) * 30,
    life: Math.random() * 5 + 3,
    maxLife: Math.random() * 5 + 3,
  };
}

export default QuantumField;
