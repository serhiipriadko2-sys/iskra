import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { BokehPass } from 'three/examples/jsm/postprocessing/BokehPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import * as THREE from 'three';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useMediaQuery } from '../hooks/useMediaQuery';

interface OrbitControlsLike {
  target: THREE.Vector3;
}

export function Effects() {
  const { gl, scene, camera, size } = useThree();
  const controls = useThree((state) => state.controls) as OrbitControlsLike | null;
  const reducedMotion = useReducedMotion();
  const isMobile = useMediaQuery('(max-width: 767px)');
  const composerRef = useRef<EffectComposer | null>(null);
  const bokehPassRef = useRef<BokehPass | null>(null);

  useEffect(() => {
    const composer = new EffectComposer(gl);
    composer.addPass(new RenderPass(scene, camera));

    const resolution = new THREE.Vector2(size.width, size.height);
    const strength = isMobile ? 0.65 : 0.85;
    const radius = isMobile ? 0.3 : 0.4;
    const threshold = 0.55;
    const bloomPass = new UnrealBloomPass(resolution, strength, radius, threshold);
    composer.addPass(bloomPass);

    if (!isMobile) {
      const bokehPass = new BokehPass(scene, camera, {
        focus: 16,
        aperture: 0.0045,
        maxblur: 0.006,
        width: size.width,
        height: size.height,
      });
      bokehPass.renderToScreen = false;
      composer.addPass(bokehPass);
      bokehPassRef.current = bokehPass;
    }

    const outputPass = new OutputPass();
    outputPass.renderToScreen = true;
    composer.addPass(outputPass);

    composer.setSize(size.width, size.height);
    composerRef.current = composer;

    return () => {
      composer.dispose();
      composerRef.current = null;
      bokehPassRef.current = null;
    };
  }, [gl, scene, camera, size.width, size.height, isMobile]);

  useEffect(() => {
    composerRef.current?.setSize(size.width, size.height);
  }, [size]);

  useFrame(() => {
    if (composerRef.current && !reducedMotion) {
      composerRef.current.render();
    }

    if (bokehPassRef.current && controls) {
      const focusTarget = controls.target.clone();
      const distance = camera.position.distanceTo(focusTarget);
      bokehPassRef.current.uniforms.focus.value = distance;
    }
  }, 1);

  return null;
}
