import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { useReducedMotion } from '../hooks/useReducedMotion';

const COUNT = 3500;

export function ParticleField() {
  const pointsRef = useRef<THREE.Points>(null);
  const reducedMotion = useReducedMotion();

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(COUNT * 3);
    const col = new Float32Array(COUNT * 3);

    for (let i = 0; i < COUNT; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const radius = 4 + Math.random() * 22;

      pos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta) * 0.8;
      pos[i * 3 + 2] = radius * Math.cos(phi);

      const mix = Math.random();
      col[i * 3] = THREE.MathUtils.lerp(1.0, 0.25, mix);
      col[i * 3 + 1] = THREE.MathUtils.lerp(0.45, 0.6, mix);
      col[i * 3 + 2] = THREE.MathUtils.lerp(0.0, 1.0, mix);
    }

    return [pos, col];
  }, []);

  useFrame(({ clock }) => {
    if (!pointsRef.current || reducedMotion) return;
    const t = clock.getElapsedTime();
    pointsRef.current.rotation.y = t * 0.008;
    pointsRef.current.rotation.x = Math.sin(t * 0.03) * 0.015;
  });

  return (
    <Points ref={pointsRef} positions={positions} colors={colors} stride={3} frustumCulled={false} raycast={() => null}>
      <PointMaterial
        transparent
        vertexColors
        size={0.06}
        sizeAttenuation
        depthWrite={false}
        opacity={0.7}
      />
    </Points>
  );
}
