import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useReducedMotion } from '../hooks/useReducedMotion';

export function TreeTrunk() {
  const trunkRef = useRef<THREE.Group>(null);
  const reducedMotion = useReducedMotion();

  useFrame(({ clock }) => {
    if (!trunkRef.current || reducedMotion) return;
    trunkRef.current.rotation.y = clock.getElapsedTime() * 0.015;
  });

  return (
    <group ref={trunkRef}>
      {/* Central trunk */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.28, 0.48, 5.5, 32]} />
        <meshStandardMaterial
          color="#F5F0E8"
          emissive="#FF7A00"
          emissiveIntensity={0.35}
          roughness={0.4}
          metalness={0.3}
        />
      </mesh>

      {/* Inner glow column */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.16, 0.16, 5.2, 32]} />
        <meshBasicMaterial
          color="#FF7A00"
          transparent
          opacity={0.15}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Rotating rings */}
      {[0, 1.4, -1.4].map((y, i) => (
        <mesh key={`ring-${i}`} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.0 + i * 0.2, 0.035, 12, 64]} />
          <meshStandardMaterial color="#FF7A00" emissive="#FF7A00" emissiveIntensity={1.4} transparent opacity={0.85} />
        </mesh>
      ))}

      {/* Heart core */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshStandardMaterial color="#FF7A00" emissive="#FF7A00" emissiveIntensity={2.8} transparent opacity={0.95} />
      </mesh>
    </group>
  );
}
