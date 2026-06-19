import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useReducedMotion } from '../hooks/useReducedMotion';

export function FogEnvironment() {
  const lightRef = useRef<THREE.PointLight>(null);
  const reducedMotion = useReducedMotion();

  useFrame(({ clock }) => {
    if (!lightRef.current || reducedMotion) return;
    const t = clock.getElapsedTime();
    lightRef.current.position.x = Math.sin(t * 0.2) * 6;
    lightRef.current.position.z = Math.cos(t * 0.2) * 6;
    lightRef.current.intensity = 1.5 + Math.sin(t * 1.2) * 0.3;
  });

  return (
    <>
      <color attach="background" args={['#05080A']} />
      <fog attach="fog" args={['#05080A', 10, 35]} />
      <ambientLight intensity={0.2} />
      <pointLight ref={lightRef} position={[6, 4, 6]} color="#FF7A00" intensity={2} distance={40} />
      <pointLight position={[-6, -2, -6]} color="#4DA3FF" intensity={0.8} distance={40} />
      <pointLight position={[0, 8, 0]} color="#9B59B6" intensity={0.7} distance={30} />
      <pointLight position={[0, -4, 4]} color="#5D4037" intensity={0.6} distance={25} />
    </>
  );
}
