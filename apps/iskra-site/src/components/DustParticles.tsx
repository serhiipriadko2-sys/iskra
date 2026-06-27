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

    const goldColor = new THREE.Color('#ffd700');
    const whiteColor = new THREE.Color('#ffffff');
    const orangeColor = new THREE.Color('#e08e45');

    for (let i = 0; i < COUNT; i++) {
      const angle = Math.random() * Math.PI * 2;
      // Концентрация частиц ближе к центру (стволу дерева)
      const radius = 0.15 + Math.pow(Math.random(), 2.2) * 3.8;
      // Высота распределена вдоль ствола и корней дерева
      const y = -4.5 + Math.random() * 9.5;

      pos[i * 3] = Math.cos(angle) * radius;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = Math.sin(angle) * radius;

      const rand = Math.random();
      const mixedColor = rand < 0.65
        ? goldColor.clone().lerp(orangeColor, Math.random() * 0.5)
        : whiteColor.clone().lerp(goldColor, Math.random() * 0.5);

      col[i * 3] = mixedColor.r;
      col[i * 3 + 1] = mixedColor.g;
      col[i * 3 + 2] = mixedColor.b;
    }

    return [pos, col];
  }, []);

  useFrame(({ clock }) => {
    if (!pointsRef.current || reducedMotion) return;
    const t = clock.getElapsedTime();
    // Медленное величественное вращение пыльцы вокруг дерева
    pointsRef.current.rotation.y = -t * 0.015;
    const material = pointsRef.current.material as THREE.PointsMaterial;
    // Деликатное мерцание пыльцы
    material.opacity = 0.45 + Math.sin(t * 0.9) * 0.12;
  });

  return (
    <Points ref={pointsRef} positions={positions} colors={colors} stride={3} frustumCulled={false} raycast={() => null}>
      <PointMaterial
        transparent
        vertexColors
        size={0.048}
        sizeAttenuation
        depthWrite={false}
        opacity={0.45}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
}

