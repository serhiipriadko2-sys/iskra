import { useState, Suspense, lazy } from 'react';
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
const RepoAtlas = lazy(() => import('./components/RepoAtlas').then((m) => ({ default: m.RepoAtlas })));
import { useReducedMotion } from './hooks/useReducedMotion';
import { useHashNodeId } from './hooks/useHashNodeId';
import { useKeyboardNavigation } from './hooks/useKeyboardNavigation';
import { useMediaQuery } from './hooks/useMediaQuery';
import type { AudienceMode } from './types';

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
  const [audienceMode, setAudienceMode] = useState<AudienceMode>('novice');
  const [showAtlas, setShowAtlas] = useState(false);
  const reducedMotion = useReducedMotion();
  const isMobile = useMediaQuery('(max-width: 767px)');

  useHashNodeId(activeNodeId, setActiveNodeId);
  useKeyboardNavigation({
    activeNodeId,
    showAtlas,
    onNavigate: setActiveNodeId,
    onCloseAtlas: () => setShowAtlas(false),
  });

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
          dpr={isMobile ? [1, 1] : [1, 1.25]}
          onPointerMissed={() => setActiveNodeId(null)}
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

      <NodeOverlay activeNodeId={activeNodeId} onClose={() => setActiveNodeId(null)} onNavigate={setActiveNodeId} audienceMode={audienceMode} />

      <TooltipOverlay activeNodeId={activeNodeId} />
      <SiftLab activeNodeId={activeNodeId} onReplayNodeSelect={setActiveNodeId} />

      <div className="fixed top-4 left-4 md:top-6 md:left-6 z-20 pointer-events-none">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-iskra-primary to-iskra-accent flex items-center justify-center text-black font-bold text-xs">И</div>
          <div>
            <h1 className="font-serif text-xl text-iskra-text">Древо Искры</h1>
            <p className="font-mono text-[10px] text-iskra-muted uppercase tracking-wider">vΩ.7 · Full Canon</p>
          </div>
        </div>
      </div>

      <div className="fixed top-4 right-4 md:top-6 md:right-6 z-50 flex items-center gap-2">
        <div className="flex items-center bg-iskra-surface/60 backdrop-blur-md border border-white/10 rounded-lg p-1">
          <button
            onClick={() => setAudienceMode('novice')}
            className={`px-3 py-1.5 rounded-md text-[10px] font-mono uppercase tracking-wider transition-colors ${
              audienceMode === 'novice' ? 'bg-iskra-primary/20 text-iskra-primary' : 'text-iskra-muted hover:text-iskra-text'
            }`}
          >
            Новичок
          </button>
          <button
            onClick={() => setAudienceMode('expert')}
            className={`px-3 py-1.5 rounded-md text-[10px] font-mono uppercase tracking-wider transition-colors ${
              audienceMode === 'expert' ? 'bg-iskra-accent/20 text-iskra-accent' : 'text-iskra-muted hover:text-iskra-text'
            }`}
          >
            Эксперт
          </button>
        </div>
        <button
          onClick={() => setActiveNodeId(null)}
          className="px-3 py-2 rounded-lg text-[10px] font-mono uppercase tracking-wider bg-iskra-surface/60 backdrop-blur-md border border-white/10 text-iskra-text hover:border-iskra-primary/50 transition-colors"
          aria-label="Вернуться к общему виду дерева"
        >
          Домой
        </button>
        <button
          onClick={() => setShowAtlas(true)}
          className="px-3 py-2 rounded-lg text-[10px] font-mono uppercase tracking-wider bg-iskra-surface/60 backdrop-blur-md border border-white/10 text-iskra-text hover:border-iskra-primary/50 transition-colors"
        >
          Атлас
        </button>
      </div>

      {showAtlas && (
        <div className="fixed inset-0 z-50 bg-iskra-bg/95 backdrop-blur-xl p-4 md:p-8 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-serif text-2xl text-iskra-text">Атлас репозитория</h2>
              <p className="font-mono text-[10px] text-iskra-muted uppercase tracking-wider mt-1">
                Полный индекс tracked files · режим {audienceMode === 'novice' ? '«Новичок»' : '«Эксперт»'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center bg-iskra-surface/60 backdrop-blur-md border border-white/10 rounded-lg p-1">
                <button
                  onClick={() => setAudienceMode('novice')}
                  className={`px-3 py-1.5 rounded-md text-[10px] font-mono uppercase tracking-wider transition-colors ${
                    audienceMode === 'novice' ? 'bg-iskra-primary/20 text-iskra-primary' : 'text-iskra-muted hover:text-iskra-text'
                  }`}
                >
                  Новичок
                </button>
                <button
                  onClick={() => setAudienceMode('expert')}
                  className={`px-3 py-1.5 rounded-md text-[10px] font-mono uppercase tracking-wider transition-colors ${
                    audienceMode === 'expert' ? 'bg-iskra-accent/20 text-iskra-accent' : 'text-iskra-muted hover:text-iskra-text'
                  }`}
                >
                  Эксперт
                </button>
              </div>
              <button
                onClick={() => setShowAtlas(false)}
                className="px-4 py-2 rounded-lg text-xs font-mono uppercase tracking-wider bg-iskra-surface/60 border border-white/10 text-iskra-text hover:border-iskra-primary/50 transition-colors"
              >
                Закрыть
              </button>
            </div>
          </div>
          <div className="flex-1 min-h-0">
            <Suspense fallback={
              <div className="h-full flex items-center justify-center text-iskra-muted">
                <div className="text-center">
                  <div className="w-10 h-10 border-2 border-iskra-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className="font-mono text-xs uppercase tracking-wider">Загрузка Атласа…</p>
                </div>
              </div>
            }>
              <RepoAtlas audienceMode={audienceMode} />
            </Suspense>
          </div>
        </div>
      )}
    </div>
  );
}
