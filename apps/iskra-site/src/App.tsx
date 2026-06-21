import { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { TreeScene } from './components/TreeScene';
import { CameraController } from './components/CameraController';
import { Effects } from './components/Effects';
import { NavigationPanel } from './components/NavigationPanel';
import { MobileNav } from './components/MobileNav';
import { NodeOverlay } from './components/NodeOverlay';
import { SiftLab } from './components/SiftLab';
import { TooltipOverlay } from './components/TooltipOverlay';
import { ReducedMotionFallback } from './components/ReducedMotionFallback';
import { useReducedMotion } from './hooks/useReducedMotion';
import { useHashNodeId } from './hooks/useHashNodeId';
import { useMediaQuery } from './hooks/useMediaQuery';

function Loader() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-iskra-bg text-iskra-text">
      <div className="text-center">
        <div className="w-12 h-12 border-2 border-iskra-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="font-mono text-sm uppercase tracking-wider text-iskra-muted">Пробуждение Искры</p>
      </div>
    </div>
  );
}

export default function App() {
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  const reducedMotion = useReducedMotion();
  const isMobile = useMediaQuery('(max-width: 767px)');

  useHashNodeId(activeNodeId, setActiveNodeId);

  if (reducedMotion) {
    return <ReducedMotionFallback />;
  }

  return (
    <div className="relative h-screen w-full overflow-hidden bg-iskra-bg text-iskra-text">
      <NavigationPanel activeNodeId={activeNodeId} onNavigate={setActiveNodeId} />
      <MobileNav activeNodeId={activeNodeId} onNavigate={setActiveNodeId} />

      <Suspense fallback={<Loader />}>
        <Canvas
          shadows
          camera={{ position: [0, 1, 16], fov: 55, near: 0.1, far: 100 }}
          gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
          dpr={isMobile ? [1, 1] : [1, 1.5]}
          onCreated={(state) => {
            state.gl.toneMapping = THREE.ACESFilmicToneMapping;
            state.gl.toneMappingExposure = 1.15;
            state.gl.shadowMap.type = THREE.PCFSoftShadowMap;
          }}
        >
          <CameraController activeNodeId={activeNodeId} />
          <TreeScene activeNodeId={activeNodeId} onNodeClick={setActiveNodeId} />
          <Effects />
        </Canvas>
      </Suspense>

      <NodeOverlay activeNodeId={activeNodeId} onClose={() => setActiveNodeId(null)} />

      <TooltipOverlay activeNodeId={activeNodeId} />
      <SiftLab activeNodeId={activeNodeId} onReplayNodeSelect={setActiveNodeId} />

      <div className="fixed top-6 left-6 z-20 pointer-events-none">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-iskra-primary to-iskra-accent flex items-center justify-center text-black font-bold text-xs">И</div>
          <div>
            <h1 className="font-serif text-xl text-iskra-text">Древо Искры</h1>
            <p className="font-mono text-[10px] text-iskra-muted uppercase tracking-wider">vΩ.7 · Full Canon</p>
          </div>
        </div>
      </div>
    </div>
  );
}
