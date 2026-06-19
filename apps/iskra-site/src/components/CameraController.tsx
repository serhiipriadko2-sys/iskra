import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { findNodeById } from '../lib/treeData';

interface CameraControllerProps {
  activeNodeId: string | null;
}

const HOME_POSITION: [number, number, number] = [0, 1, 16];
const HOME_TARGET: [number, number, number] = [0, 1, 0];

export function CameraController({ activeNodeId }: CameraControllerProps) {
  const reducedMotion = useReducedMotion();
  const targetPosition = useRef(new THREE.Vector3(...HOME_POSITION));
  const lookAtTarget = useRef(new THREE.Vector3(...HOME_TARGET));

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
    const speed = reducedMotion ? 1 : Math.min(2.5 * delta, 1);
    const { camera } = _;
    camera.position.lerp(targetPosition.current, speed);

    const currentLook = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion).add(camera.position);
    currentLook.lerp(lookAtTarget.current, speed);
    camera.lookAt(currentLook);
  });

  return null;
}
