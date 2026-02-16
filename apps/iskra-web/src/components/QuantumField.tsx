import React, { useEffect, useRef } from 'react';
import type { IskraMetrics } from '@iskra/core';

interface QuantumFieldProps {
  metrics: IskraMetrics;
  width?: number;
  height?: number;
}

export const QuantumField: React.FC<QuantumFieldProps> = ({
  metrics,
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
      ctx.beginPath();

      const jitter = metrics.chaos * 10;
      const amplitude = metrics.trust * 50;

      ctx.strokeStyle = '#4DA3FF';
      ctx.lineWidth = 2;

      ctx.moveTo(0, height / 2);

      for (let x = 0; x < width; x++) {
        const y = height / 2 +
          Math.sin((x + t) * 0.05) * amplitude +
          (Math.random() - 0.5) * jitter;

        ctx.lineTo(x, y);
      }

      ctx.stroke();

      t += metrics.rhythm / 60;
      animationId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationId);
  }, [metrics, width, height]);

  return React.createElement('canvas', { ref: canvasRef, width, height });
};
