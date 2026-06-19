import { useMemo } from 'react';
import * as THREE from 'three';

function createSoilTexture(): THREE.CanvasTexture {
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
    const noise = (Math.random() - 0.5) * 20;
    data[i] = Math.max(0, Math.min(255, data[i] + noise));
    data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
    data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
  }
  ctx.putImageData(imageData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function SoilDisc() {
  const texture = useMemo(() => createSoilTexture(), []);

  return (
    <group position={[0, -5.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <mesh>
        <circleGeometry args={[7.5, 64]} />
        <meshStandardMaterial map={texture} roughness={0.95} metalness={0.05} transparent opacity={0.9} />
      </mesh>
      <mesh position={[0, 0, 0.02]}>
        <ringGeometry args={[4, 7, 64]} />
        <meshBasicMaterial color="#5D4037" transparent opacity={0.35} />
      </mesh>
    </group>
  );
}
