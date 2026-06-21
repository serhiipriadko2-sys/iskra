import { useMemo } from 'react';
import * as THREE from 'three';

interface SoilMaps {
  colorMap: THREE.CanvasTexture;
  bumpMap: THREE.CanvasTexture;
  displacementMap: THREE.CanvasTexture;
}

function createSoilMaps(): SoilMaps {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to create canvas context');

  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, '#1a0f0a');
  gradient.addColorStop(0.6, '#2D1B14');
  gradient.addColorStop(1, '#0a0504');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  const imageData = ctx.getImageData(0, 0, size, size);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 35;
    data[i] = Math.max(0, Math.min(255, data[i] + noise));
    data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
    data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
  }
  ctx.putImageData(imageData, 0, 0);

  const colorMap = new THREE.CanvasTexture(canvas);
  colorMap.colorSpace = THREE.SRGBColorSpace;

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = size;
  bumpCanvas.height = size;
  const bumpCtx = bumpCanvas.getContext('2d');
  if (!bumpCtx) throw new Error('Failed to create bump canvas context');
  // Grayscale heightfield for bump/displacement.
  bumpCtx.filter = 'grayscale(100%) contrast(120%)';
  bumpCtx.drawImage(canvas, 0, 0);
  const bumpMap = new THREE.CanvasTexture(bumpCanvas);
  bumpMap.colorSpace = THREE.LinearSRGBColorSpace;

  const displacementMap = bumpMap.clone();
  displacementMap.colorSpace = THREE.LinearSRGBColorSpace;

  return { colorMap, bumpMap, displacementMap };
}

export function SoilDisc() {
  const { colorMap, bumpMap, displacementMap } = useMemo(() => createSoilMaps(), []);

  return (
    <group position={[0, -5.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <mesh receiveShadow>
        <circleGeometry args={[7.5, 128]} />
        <meshPhysicalMaterial
          map={colorMap}
          bumpMap={bumpMap}
          bumpScale={0.08}
          displacementMap={displacementMap}
          displacementScale={0.18}
          displacementBias={-0.05}
          roughness={0.95}
          metalness={0.05}
          clearcoat={0}
          transparent
          opacity={0.95}
        />
      </mesh>
      <mesh position={[0, 0, 0.02]}>
        <ringGeometry args={[4, 7, 64]} />
        <meshBasicMaterial color="#5D4037" transparent opacity={0.35} />
      </mesh>
    </group>
  );
}
