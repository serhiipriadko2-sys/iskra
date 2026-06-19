import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useReducedMotion } from '../hooks/useReducedMotion';

interface TreeBranchProps {
  from: [number, number, number];
  to: [number, number, number];
  color?: string;
  isActive?: boolean;
  thickness?: number;
}

export function TreeBranch({
  from,
  to,
  color = '#FF7A00',
  isActive = false,
  thickness = 0.08,
}: TreeBranchProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const reducedMotion = useReducedMotion();

  const direction = new THREE.Vector3(...to).sub(new THREE.Vector3(...from));
  const length = direction.length();
  const midPoint = new THREE.Vector3(...from).add(direction.clone().multiplyScalar(0.5));

  const quaternion = new THREE.Quaternion();
  quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.clone().normalize());

  useFrame(({ clock }) => {
    if (!meshRef.current || reducedMotion) return;
    const t = clock.getElapsedTime();
    const material = meshRef.current.material as THREE.MeshStandardMaterial;
    material.emissiveIntensity = isActive ? 0.8 + Math.sin(t * 3) * 0.3 : 0.2;
  });

  return (
    <mesh ref={meshRef} position={midPoint} quaternion={quaternion}>
      <cylinderGeometry args={[thickness * 0.7, thickness, length, 8]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={isActive ? 0.8 : 0.2}
        roughness={0.6}
        metalness={0.3}
        transparent
        opacity={0.9}
      />
    </mesh>
  );
}
