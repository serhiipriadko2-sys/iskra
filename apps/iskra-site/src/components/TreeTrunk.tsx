import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
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
        const y = -2.8 + t * 4.6; // высота от корней (-2.8) до разветвления ветвей (1.8)

        // Спиральное закручивание по высоте
        const angle = phi + y * 0.42;

        // Переменный радиус ствола для формирования органического силуэта
        let r = 0.32;
        if (y < -1.0) {
          // Корни расширяются книзу
          const factor = Math.pow(Math.abs(y + 1.0) / 1.8, 1.8);
          r = 0.32 + factor * 0.35;
        } else if (y > 0.8) {
          // Ветви расширяются кверху
          const factor = Math.pow((y - 0.8) / 1.0, 1.5);
          r = 0.32 + factor * 0.22;
        } else {
          // Небольшое сужение посередине
          const midFactor = Math.cos(((y + 1.0) / 1.8) * Math.PI - Math.PI / 2);
          r = 0.29 + midFactor * 0.03;
        }

        // Небольшой органический шум/волнистость
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
    // Деликатное покачивание по оси Y, чтобы надпись всегда смотрела вперед
    trunkRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.12) * 0.04;
  });

  return (
    <group ref={trunkRef}>
      {/* 12 сплетенных золотых волокон */}
      {strands.map((curve, idx) => (
        <mesh key={`strand-${idx}`} castShadow receiveShadow>
          <tubeGeometry args={[curve, 32, 0.024, 8, false]} />
          <meshPhysicalMaterial
            color="#ffd700" // Чистое золото
            emissive="#ff7a00"
            emissiveIntensity={0.25}
            roughness={0.16}
            metalness={0.96}
            clearcoat={1.0}
            clearcoatRoughness={0.05}
          />
        </mesh>
      ))}

      {/* Светящаяся надпись ISKRA на стволе */}
      <Text
        position={[0, 0.05, 0.4]}
        fontSize={0.26}
        font="https://fonts.gstatic.com/s/cormorantgaramond/v16/co3bmGY0vh4R1ldtKP7EXyHyOfq763U3ceg.woff2"
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.16}
      >
        ISKRA
        <meshBasicMaterial color="#fff2cc" toneMapped={false} />
      </Text>

      {/* Внутренний светящийся сердечник */}
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

      {/* Ядро сердца (Heart core) */}
      <mesh position={[0, 0.1, 0]}>
        <sphereGeometry args={[0.26, 32, 32]} />
        <meshPhysicalMaterial
          color="#ff5500"
          emissive="#ff7a00"
          emissiveIntensity={1.8}
          transparent
          opacity={0.9}
          roughness={0.1}
          metalness={0.15}
          transmission={0.92}
          thickness={0.5}
          ior={1.5}
        />
      </mesh>

      {/* Мягкие диски свечения вокруг ствола */}
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

