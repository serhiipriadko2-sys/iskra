import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three/examples/jsm/controls/OrbitControls.js';
import * as THREE from 'three';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { findNodeById } from '../lib/treeData';

interface CameraControllerProps {
  activeNodeId: string | null;
}

const HOME_POSITION: [number, number, number] = [0, 1.5, 16];
const HOME_TARGET: [number, number, number] = [0, 1, 0];

export function CameraController({ activeNodeId }: CameraControllerProps) {
  const { camera, controls } = useThree();
  const reducedMotion = useReducedMotion();
  const isMobile = useMediaQuery('(max-width: 767px)');
  const targetPosition = useRef(new THREE.Vector3(...HOME_POSITION));
  const lookAtTarget = useRef(new THREE.Vector3(...HOME_TARGET));

  useEffect(() => {
    const perspectiveCamera = camera as THREE.PerspectiveCamera;
    perspectiveCamera.fov = isMobile ? 62 : 55;
    perspectiveCamera.updateProjectionMatrix();
  }, [camera, isMobile]);

  useEffect(() => {
    const node = activeNodeId ? findNodeById(activeNodeId) : null;
    if (node) {
      targetPosition.current.set(...node.cameraPosition);
      lookAtTarget.current.set(...node.lookAt);
    } else {
      targetPosition.current.set(...HOME_POSITION);
      lookAtTarget.current.set(...HOME_TARGET);
    }
  }, [activeNodeId]);

  useFrame((_, delta) => {
    const orbit = controls as OrbitControlsImpl | null;
    const speed = reducedMotion ? 1 : Math.min(2.2 * delta, 1);
    const distanceScale = isMobile ? 1.05 : 1;

    const scaledTarget = new THREE.Vector3()
      .subVectors(targetPosition.current, lookAtTarget.current)
      .multiplyScalar(distanceScale)
      .add(lookAtTarget.current);

    camera.position.lerp(scaledTarget, speed);

    if (orbit) {
      orbit.target.lerp(lookAtTarget.current, speed);
      orbit.update();
    } else {
      const currentLook = new THREE.Vector3(0, 0, -1)
        .applyQuaternion(camera.quaternion)
        .add(camera.position);
      currentLook.lerp(lookAtTarget.current, speed);
      camera.lookAt(currentLook);
    }
  });

  if (reducedMotion) return null;

  return (
    <OrbitControls
      makeDefault
      enablePan={false}
      minDistance={isMobile ? 4 : 3}
      maxDistance={isMobile ? 35 : 30}
      enableDamping
      dampingFactor={0.05}
      rotateSpeed={isMobile ? 0.4 : 0.6}
      zoomSpeed={isMobile ? 0.5 : 0.8}
    />
  );
}
