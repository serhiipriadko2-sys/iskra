import React, { useEffect, useRef } from 'react';
import type { IskraMetrics, VoiceID } from '@iskra/core';

interface QuantumFieldProps {
  metrics: IskraMetrics;
  superposition?: { id: VoiceID; prob: number }[];
  width?: number;
  height?: number;
}

const VOICE_COLORS: Record<VoiceID, string> = {
  ISKRA: '#FFFFFF',
  KAIN: '#FF4D4D',
  MAKI: '#4DA3FF',
  HUYNDUN: '#A34DFF',
  PINO: '#FFD700',
  SAM: '#4DFF4D',
  ANHANTRA: '#808080',
  ISKRIV: '#FF8000',
  SIBYL: '#00FFFF'
};

/**
 * Quantum Field Visualization
 * SPEC-004: Dynamic Fractal Visualization
 *
 * Renders interference patterns based on active voices and system chaos.
 */
export const QuantumField: React.FC<QuantumFieldProps> = ({
  metrics,
  superposition = [],
  width = 300,
  height = 300
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let t = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Global chaos factor affects everything
      const chaos = metrics.chaos || 0;
      const jitter = chaos * 8; // Increased jitter for visibility

      // If no superposition data, fallback to single wave (ISKRA)
      const waves = superposition.length > 0
        ? superposition
        : [{ id: 'ISKRA' as VoiceID, prob: 1.0 }];

      // Render each voice as a wave
      waves.forEach((voice, i) => {
        ctx.beginPath();

        const color = VOICE_COLORS[voice.id] || '#FFFFFF';
        const prob = voice.prob;

        // Amplitude based on probability
        const amplitude = prob * (height / 4);

        // Frequency varies per voice
        const freq = 0.02 + (i * 0.015);

        // Phase shift
        const phase = i * (Math.PI / 3);

        ctx.strokeStyle = color;
        ctx.lineWidth = 3 * prob + 1;
        ctx.globalAlpha = Math.max(0.1, prob);

        ctx.moveTo(0, height / 2);

        for (let x = 0; x < width; x += 2) {
          const noise = (Math.random() - 0.5) * jitter;
          const y = height / 2 +
            Math.sin((x * freq) + t + phase) * amplitude +
            noise;

          ctx.lineTo(x, y);
        }

        ctx.stroke();
      });

      // Background energy glow (Chaos influence)
      if (chaos > 0.3) {
          ctx.fillStyle = `rgba(163, 77, 255, ${chaos * 0.1})`;
          ctx.fillRect(0, 0, width, height);
      }

      t += (metrics.rhythm || 60) / 1000;
      animationId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationId);
  }, [metrics, superposition, width, height]);

  return <canvas ref={canvasRef} width={width} height={height} style={{ background: '#05080A' }} />;
};
