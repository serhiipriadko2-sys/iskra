import { useMemo } from 'react';
import * as THREE from 'three';
import { Environment } from '@react-three/drei';

export function LocalEnvironment() {
  const texture = useMemo(() => {
    const width = 1024;
    const height = 512;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Failed to create environment canvas context');

    // Dark space base.
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#020408');
    gradient.addColorStop(0.5, '#080c14');
    gradient.addColorStop(1, '#020408');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Nebula patches.
    ctx.globalCompositeOperation = 'screen';
    const nebulae = [
      { x: 0.25, y: 0.35, r: 0.28, color: 'rgba(90, 45, 130, 0.35)' },
      { x: 0.72, y: 0.25, r: 0.24, color: 'rgba(35, 65, 130, 0.3)' },
      { x: 0.52, y: 0.68, r: 0.3, color: 'rgba(130, 65, 25, 0.25)' },
      { x: 0.85, y: 0.6, r: 0.2, color: 'rgba(60, 30, 90, 0.2)' },
    ];

    for (const nebula of nebulae) {
      const radial = ctx.createRadialGradient(
        nebula.x * width,
        nebula.y * height,
        0,
        nebula.x * width,
        nebula.y * height,
        nebula.r * width,
      );
      radial.addColorStop(0, nebula.color);
      radial.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = radial;
      ctx.fillRect(0, 0, width, height);
    }

    // Subtle Milky-Way-like band across the equator.
    const band = ctx.createLinearGradient(0, height * 0.55, width, height * 0.45);
    band.addColorStop(0, 'rgba(130, 130, 150, 0.06)');
    band.addColorStop(0.5, 'rgba(170, 170, 190, 0.12)');
    band.addColorStop(1, 'rgba(130, 130, 150, 0.06)');
    ctx.fillStyle = band;
    ctx.fillRect(0, height * 0.4, width, height * 0.2);

    ctx.globalCompositeOperation = 'source-over';

    const tex = new THREE.CanvasTexture(canvas);
    tex.mapping = THREE.EquirectangularReflectionMapping;
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);

  return <Environment map={texture} background={false} blur={0.6} resolution={512} />;
}
