import { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useMediaQuery } from '../hooks/useMediaQuery';
import type { TreeNodeData } from '../lib/treeData';

interface TreeNodeProps {
  node: TreeNodeData;
  isActive: boolean;
  isDimmed: boolean;
  onClick: (id: string) => void;
  onHover?: (id: string | null) => void;
}

export function TreeNode({ node, isActive, isDimmed, onClick, onHover }: TreeNodeProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const coronaRef = useRef<THREE.Points>(null);
  const [hovered, setHovered] = useState(false);
  const reducedMotion = useReducedMotion();
  const isMobile = useMediaQuery('(max-width: 767px)');

  const seed = useMemo(() => node.position[0] * 3.1 + node.position[2] * 1.9, [node.position]);

  // Генерируем 35 локальных искр для короны (halo) вокруг сферы
  const { positions, colors } = useMemo(() => {
    const count = 35;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const nodeColor = new THREE.Color(node.color);
    const goldColor = new THREE.Color('#ffd700');

    for (let i = 0; i < count; i++) {
      // Искры распределены в сферическом слое от 0.35 до 0.58 от центра
      const r = 0.35 + Math.random() * 0.23;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);

      // Смешиваем цвет ноды и золотой цвет для мерцающих частиц
      const mixedColor = nodeColor.clone().lerp(goldColor, Math.random() * 0.65);
      col[i * 3] = mixedColor.r;
      col[i * 3 + 1] = mixedColor.g;
      col[i * 3 + 2] = mixedColor.b;
    }

    return { positions: pos, colors: col };
  }, [node.color]);

  useFrame(({ clock }) => {
    if (reducedMotion) return;
    const t = clock.getElapsedTime();

    // Пульсация внешней сферы
    if (meshRef.current) {
      const baseScale = isActive ? 1.25 : hovered ? 1.1 : 1.0;
      const pulse = 1.0 + Math.sin(t * 2.2 + seed) * 0.05;
      meshRef.current.scale.setScalar(baseScale * pulse);
    }

    // Свечение внутреннего ядра
    if (glowRef.current) {
      const baseScale = isActive ? 1.2 : hovered ? 1.05 : 1.0;
      const pulse = 1.0 + Math.sin(t * 3.5 + seed) * 0.08;
      glowRef.current.scale.setScalar(baseScale * pulse);
    }

    // Вращение короны частиц
    if (coronaRef.current) {
      coronaRef.current.rotation.y = t * (isActive ? 0.9 : hovered ? 0.5 : 0.25) + seed;
      coronaRef.current.rotation.x = Math.sin(t * 0.4 + seed) * 0.12;
    }
  });

  const col = new THREE.Color(node.color);

  return (
    <group position={node.position}>
      {/* 1. Внешняя стеклянная преломляющая сфера */}
      <mesh
        ref={meshRef}
        castShadow
        receiveShadow
        onClick={(e) => {
          e.stopPropagation();
          onClick(node.id);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          onHover?.(node.id);
        }}
        onPointerOut={() => {
          setHovered(false);
          onHover?.(null);
        }}
      >
        <sphereGeometry args={[0.26, 32, 32]} />
        <meshStandardMaterial
          color={col}
          emissive={col}
          emissiveIntensity={isActive ? 1.5 : hovered ? 0.8 : 0.25}
          roughness={0.15}
          metalness={0.25}
          transparent
          opacity={isDimmed ? 0.35 : 1}
        />
      </mesh>

      {/* 2. Внутреннее высокоинтенсивное ядро плазмы */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshBasicMaterial
          color={col}
          toneMapped={false} // Отключаем toneMapping для выбивания в яркий Bloom
          transparent
          opacity={isActive ? 0.95 : hovered ? 0.8 : 0.55}
          depthWrite={false}
        />
      </mesh>

      {/* 3. Персональная орбитальная корона искр */}
      <points ref={coronaRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[colors, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.03}
          vertexColors
          transparent
          opacity={isDimmed ? 0.22 : isActive ? 1.0 : hovered ? 0.85 : 0.65}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* 4. Hover tooltip */}
      {hovered && !isActive && (
        <Html distanceFactor={10} style={{ zIndex: 10 }} center position={[0, 0.72, 0]}>
          <div className="pointer-events-none glass-card px-3 py-2 rounded-xl border border-white/10 max-w-[16rem]">
            <p className="font-serif text-sm text-iskra-text text-center">{node.label}</p>
            <p className="text-[10px] text-iskra-muted text-center mt-1 leading-tight">{node.description}</p>
          </div>
        </Html>
      )}

      {/* 5. Облегченная, изящная стеклянная подпись ноды */}
      <Html distanceFactor={10} style={{ zIndex: 5 }} center position={[0, 0.46, 0]}>
        <a
          href={`#${node.id}`}
          className={`pointer-events-auto rounded-full font-mono uppercase tracking-[0.14em] whitespace-nowrap transition-all text-[8px] md:text-[9px] px-3 py-1.5 backdrop-blur-[3px] border ${
            isActive
              ? 'bg-iskra-primary/15 border-iskra-primary text-iskra-primary font-bold shadow-[0_0_15px_rgba(255,122,0,0.3)]'
              : hovered
              ? 'bg-black/60 border-[#ffd700]/45 text-[#ffd700] shadow-[0_0_8px_rgba(255,215,0,0.25)]'
              : 'bg-black/45 border-white/5 text-iskra-text hover:border-white/20'
          } ${isDimmed ? 'opacity-25' : 'opacity-100'}`}
        >
          {isMobile ? node.shortLabel : node.label}
        </a>
      </Html>
    </group>
  );
}

