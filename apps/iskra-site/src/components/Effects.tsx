import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import * as THREE from 'three';
import { useReducedMotion } from '../hooks/useReducedMotion';

export function Effects() {
  const { gl, scene, camera, size } = useThree();
  const reducedMotion = useReducedMotion();
  const composerRef = useRef<EffectComposer | null>(null);

  useEffect(() => {
    const composer = new EffectComposer(gl);
    composer.addPass(new RenderPass(scene, camera));

    const resolution = new THREE.Vector2(size.width, size.height);
    const bloomPass = new UnrealBloomPass(resolution, 0.9, 0.5, 0.75);
    composer.addPass(bloomPass);

    composer.setSize(size.width, size.height);
    composerRef.current = composer;

    return () => {
      composer.dispose();
      composerRef.current = null;
    };
  }, [gl, scene, camera, size.width, size.height]);

  useEffect(() => {
    composerRef.current?.setSize(size.width, size.height);
  }, [size]);

  useFrame(() => {
    if (composerRef.current && !reducedMotion) {
      composerRef.current.render();
    }
  }, 1);

  return null;
}
