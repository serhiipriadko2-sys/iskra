import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useReducedMotion } from '../hooks/useReducedMotion';
import type { TreeNodeData } from '../lib/treeData';

interface TreeNodeProps {
  node: TreeNodeData;
  isActive: boolean;
  isDimmed: boolean;
  onClick: (id: string) => void;
}

export function TreeNode({ node, isActive, isDimmed, onClick }: TreeNodeProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const reducedMotion = useReducedMotion();

  useFrame(({ clock }) => {
    if (!meshRef.current || reducedMotion) return;
    const t = clock.getElapsedTime();
    const baseScale = isActive ? 1.3 : hovered ? 1.1 : 1;
    const pulse = 1 + Math.sin(t * 2 + node.position[0]) * 0.06;
    const finalScale = baseScale * pulse;
    meshRef.current.scale.setScalar(finalScale);
    if (glowRef.current) {
      glowRef.current.scale.setScalar(finalScale * 1.5);
      const mat = glowRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = isActive ? 0.35 + Math.sin(t * 3) * 0.08 : hovered ? 0.22 : 0.12;
    }
  });

  const col = new THREE.Color(node.color);

  return (
    <group position={node.position}>
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          onClick(node.id);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[0.28, 32, 32]} />
        <meshStandardMaterial
          color={col}
          emissive={col}
          emissiveIntensity={isActive ? 1.6 : hovered ? 1 : 0.45}
          roughness={0.2}
          metalness={0.7}
          transparent
          opacity={isDimmed ? 0.35 : 1}
        />
      </mesh>

      <mesh ref={glowRef}>
        <sphereGeometry args={[0.55, 32, 32]} />
        <meshBasicMaterial color={col} transparent opacity={0.12} depthWrite={false} />
      </mesh>

      <Html distanceFactor={10} style={{ zIndex: 5 }}>
        <button
          onClick={() => onClick(node.id)}
          className={`pointer-events-auto px-3 py-1.5 rounded-full font-mono text-[10px] uppercase tracking-wider whitespace-nowrap transition-all backdrop-blur-sm ${
            isActive
              ? 'bg-iskra-primary text-black shadow-[0_0_20px_rgba(255,122,0,0.5)]'
              : 'bg-iskra-surface/80 text-iskra-text hover:bg-white/10'
          } ${isDimmed ? 'opacity-40' : 'opacity-100'}`}
        >
          {node.label}
        </button>
      </Html>
    </group>
  );
}
