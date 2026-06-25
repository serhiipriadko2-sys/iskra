import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useReducedMotion } from '../hooks/useReducedMotion';

const ATMOSPHERE_VERTEX_SHADER = /* glsl */ `
  varying vec3 vWorldPosition;
  void main() {
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const ATMOSPHERE_FRAGMENT_SHADER = /* glsl */ `
  uniform vec3 uSunDirection;
  uniform float uSunIntensity;
  uniform vec3 uSkyColor;
  uniform vec3 uHorizonColor;
  uniform vec3 uGroundColor;
  varying vec3 vWorldPosition;

  void main() {
    vec3 viewDir = normalize(vWorldPosition - cameraPosition);
    float height = viewDir.y;

    float horizonFactor = 1.0 - abs(height);
    horizonFactor = pow(horizonFactor, 2.5);

    float groundFactor = smoothstep(0.05, -0.3, height);

    vec3 sky = mix(uSkyColor, uHorizonColor, horizonFactor * 0.8);
    sky = mix(sky, uGroundColor, groundFactor * 0.6);

    float sunDot = max(dot(viewDir, uSunDirection), 0.0);
    float sunGlow = pow(sunDot, 24.0) * uSunIntensity;
    float sunHalo = pow(sunDot, 6.0) * uSunIntensity * 0.12;
    vec3 sunColor = vec3(1.0, 0.72, 0.38);

    sky += sunColor * sunGlow;
    sky += sunColor * sunHalo;

    gl_FragColor = vec4(sky, 1.0);
  }
`;

function AtmosphericDome() {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(
    () => ({
      uSunDirection: { value: new THREE.Vector3(-0.35, 0.25, 0.9).normalize() },
      uSunIntensity: { value: 1.0 },
      uSkyColor: { value: new THREE.Color('#030507') },
      uHorizonColor: { value: new THREE.Color('#1a0f2e') },
      uGroundColor: { value: new THREE.Color('#0b0608') },
    }),
    []
  );

  useFrame(({ clock }) => {
    if (!materialRef.current) return;
    const t = clock.getElapsedTime();
    const angle = t * 0.03;
    const dir = new THREE.Vector3(Math.sin(angle) * 0.6, 0.22, Math.cos(angle) * 0.6).normalize();
    materialRef.current.uniforms.uSunDirection.value.copy(dir);
    materialRef.current.uniforms.uSunIntensity.value = 0.9 + Math.sin(t * 0.1) * 0.15;
  });

  return (
    <mesh scale={[-1, 1, 1]}>
      <sphereGeometry args={[80, 48, 48]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={ATMOSPHERE_VERTEX_SHADER}
        fragmentShader={ATMOSPHERE_FRAGMENT_SHADER}
        uniforms={uniforms}
        side={THREE.BackSide}
        depthWrite={false}
        depthTest={false}
      />
    </mesh>
  );
}

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
      <fogExp2 attach="fog" args={['#070a10', 0.018]} />
      <AtmosphericDome />
      <ambientLight intensity={0.15} />
      <hemisphereLight intensity={0.2} groundColor="#2D1B14" color="#4DA3FF" />
      <pointLight ref={lightRef} position={[7, 5, 7]} color="#FF7A00" intensity={2.2} distance={45} />
      <pointLight position={[-7, -2, -7]} color="#4DA3FF" intensity={0.9} distance={45} />
      <pointLight position={[0, 9, 0]} color="#9B59B6" intensity={0.8} distance={35} />
      <pointLight position={[0, -5, 4]} color="#5D4037" intensity={0.7} distance={28} />
      <directionalLight
        position={[-5, 10, 5]}
        intensity={0.4}
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
