import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useReducedMotion } from '../hooks/useReducedMotion';

export function TreeTrunk() {
  const trunkRef = useRef<THREE.Group>(null);
  const reducedMotion = useReducedMotion();

  // Генерируем 12 спиральных сплетенных золотых волокон для ствола
  const strands = useMemo(() => {
    const count = 12;
    const curves: THREE.CatmullRomCurve3[] = [];
    const segments = 12;

    for (let i = 0; i < count; i++) {
      const phi = (i * 2 * Math.PI) / count;
      const points: THREE.Vector3[] = [];

      for (let j = 0; j <= segments; j++) {
        const t = j / segments;
        const y = -2.8 + t * 4.6;

        const angle = phi + y * 0.42;

        let r = 0.32;
        if (y < -1.0) {
          const factor = Math.pow(Math.abs(y + 1.0) / 1.8, 1.8);
          r = 0.32 + factor * 0.35;
        } else if (y > 0.8) {
          const factor = Math.pow((y - 0.8) / 1.0, 1.5);
          r = 0.32 + factor * 0.22;
        } else {
          const midFactor = Math.cos(((y + 1.0) / 1.8) * Math.PI - Math.PI / 2);
          r = 0.29 + midFactor * 0.03;
        }

        const wobbleX = Math.sin(y * 3.5 + phi) * 0.025;
        const wobbleZ = Math.cos(y * 2.8 + phi) * 0.025;

        const x = r * Math.cos(angle) + wobbleX;
        const z = r * Math.sin(angle) + wobbleZ;

        points.push(new THREE.Vector3(x, y, z));
      }
      curves.push(new THREE.CatmullRomCurve3(points));
    }
    return curves;
  }, []);

  useFrame(({ clock }) => {
    if (!trunkRef.current || reducedMotion) return;
    trunkRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.12) * 0.04;
  });

  return (
    <group ref={trunkRef}>
      {strands.map((curve, idx) => (
        <mesh key={`strand-${idx}`} castShadow receiveShadow>
          <tubeGeometry args={[curve, 32, 0.024, 8, false]} />
          <meshStandardMaterial
            color="#ffd700"
            emissive="#ff7a00"
            emissiveIntensity={0.25}
            roughness={0.16}
            metalness={0.96}
          />
        </mesh>
      ))}

      {/* Text disabled for WebGL compatibility */}

      <mesh position={[0, -0.5, 0]}>
        <cylinderGeometry args={[0.08, 0.18, 5.0, 16]} />
        <meshBasicMaterial
          color="#ff7a00"
          transparent
          opacity={0.32}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <mesh position={[0, 0.1, 0]}>
        <sphereGeometry args={[0.26, 32, 32]} />
        <meshStandardMaterial
          color="#ff5500"
          emissive="#ff7a00"
          emissiveIntensity={1.8}
          transparent
          opacity={0.9}
          roughness={0.1}
          metalness={0.15}
        />
      </mesh>

      {[1.8, 2.8].map((r, i) => (
        <mesh key={`glow-disc-${i}`} position={[0, -0.8 + i * 0.9, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[r * 0.5, r, 64]} />
          <meshBasicMaterial
            color="#ff7a00"
            transparent
            opacity={0.035}
            side={THREE.DoubleSide}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
    </group>
  );
}
