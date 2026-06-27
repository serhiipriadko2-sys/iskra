import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useMediaQuery } from '../hooks/useMediaQuery';

const STAR_PALETTE = [
  new THREE.Color('#ffffff'),
  new THREE.Color('#ffeaa7'),
  new THREE.Color('#ffd700'),
  new THREE.Color('#e5c158'),
];
 
const vertexShader = `
  attribute vec3 starColor;
  attribute float starSize;
  uniform float uTime;
  uniform float uTwinkleSpeed;
  varying vec3 vColor;
  varying float vAlpha;
 
  void main() {
    vColor = starColor;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    float twinkle = 0.75 + 0.25 * sin(uTime * uTwinkleSpeed + position.x * 12.0 + position.y * 7.0 + position.z * 3.0);
    vAlpha = twinkle;
    gl_PointSize = starSize * (220.0 / -mvPosition.z) * twinkle;
    gl_Position = projectionMatrix * mvPosition;
  }
`;
 
const fragmentShader = `
  varying vec3 vColor;
  varying float vAlpha;
 
  void main() {
    vec2 coord = gl_PointCoord - vec2(0.5);
    float dist = length(coord);
    if (dist > 0.5) discard;
    float alpha = (1.0 - smoothstep(0.32, 0.5, dist)) * 0.45;
    gl_FragColor = vec4(vColor, alpha * vAlpha);
  }
`;
 
export function StarField() {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const reducedMotion = useReducedMotion();
  const isMobile = useMediaQuery('(max-width: 767px)');
 
  const { geometry } = useMemo(() => {
    const count = isMobile ? 500 : 1600;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
 
    for (let i = 0; i < count; i++) {
      const radius = 85 + Math.random() * 65;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
 
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
 
      const color = STAR_PALETTE[Math.floor(Math.random() * STAR_PALETTE.length)];
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
 
      sizes[i] = 0.03 + Math.random() * 0.12;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('starColor', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('starSize', new THREE.BufferAttribute(sizes, 1));

    return { geometry };
  }, [isMobile]);

  useFrame(({ clock }) => {
    if (!materialRef.current || reducedMotion) return;
    materialRef.current.uniforms.uTime.value = clock.getElapsedTime();
  });

  return (
    <points geometry={geometry} raycast={() => null}>
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={{
          uTime: { value: 0 },
          uTwinkleSpeed: { value: 0.8 },
        }}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
