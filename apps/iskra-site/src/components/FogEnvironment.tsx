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
    lightRef.current.position.x = Math.sin(t * 0.15) * 7;
    lightRef.current.position.z = Math.cos(t * 0.15) * 7;
    lightRef.current.intensity = 1.6 + Math.sin(t * 1.0) * 0.25;
  });

  return (
    <>
      <color attach="background" args={['#030507']} />
      <fog attach="fog" args={['#030507', 8, 38]} />
      <ambientLight intensity={0.35} />
      <hemisphereLight intensity={0.4} groundColor="#1a0f0a" color="#ffeaa7" />
      <pointLight ref={lightRef} position={[7, 5, 7]} color="#FF7A00" intensity={4.2} distance={45} />
      <pointLight position={[-7, -2, -7]} color="#FFB020" intensity={1.5} distance={45} />
      <pointLight position={[0, 8, 0]} color="#FF9A00" intensity={1.5} distance={35} />
      <pointLight position={[0, -5, 4]} color="#5D4037" intensity={0.8} distance={28} />
      {/* Задний контровой свет для отделения ствола от темного фона */}
      <pointLight position={[0, 2, -6]} color="#FF8A00" intensity={3.5} distance={25} />
      <directionalLight
        position={[-5, 10, 5]}
        intensity={2.2}
        color="#FFB020"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0005}
      >
        <orthographicCamera attach="shadow-camera" args={[-12, 12, 12, -12, 0.5, 50]} />
      </directionalLight>
    </>
  );
}
