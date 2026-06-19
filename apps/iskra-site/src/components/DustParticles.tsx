import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { useReducedMotion } from '../hooks/useReducedMotion';

const COUNT = 1200;

export function DustParticles() {
  const pointsRef = useRef<THREE.Points>(null);
  const reducedMotion = useReducedMotion();

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(COUNT * 3);
    const col = new Float32Array(COUNT * 3);

    for (let i = 0; i < COUNT; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 0.5 + Math.random() * 6;
      const y = (Math.random() - 0.5) * 10;

      pos[i * 3] = Math.cos(angle) * radius;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = Math.sin(angle) * radius;

      const mix = Math.random();
      col[i * 3] = THREE.MathUtils.lerp(1.0, 0.6, mix);
      col[i * 3 + 1] = THREE.MathUtils.lerp(0.5, 0.7, mix);
      col[i * 3 + 2] = THREE.MathUtils.lerp(0.0, 0.6, mix);
    }

    return [pos, col];
  }, []);

  useFrame(({ clock }) => {
    if (!pointsRef.current || reducedMotion) return;
    const t = clock.getElapsedTime();
    pointsRef.current.rotation.y = -t * 0.012;
    const material = pointsRef.current.material as THREE.PointsMaterial;
    material.opacity = 0.35 + Math.sin(t * 0.8) * 0.1;
  });

  return (
    <Points ref={pointsRef} positions={positions} colors={colors} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        vertexColors
        size={0.035}
        sizeAttenuation
        depthWrite={false}
        opacity={0.35}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
}
