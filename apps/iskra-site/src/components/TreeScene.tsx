import { useMemo } from 'react';
import * as THREE from 'three';
import { TreeNode } from './TreeNode';
import { TreeTrunk } from './TreeTrunk';
import { SoilDisc } from './SoilDisc';
import { FogEnvironment } from './FogEnvironment';
import { LocalEnvironment } from './LocalEnvironment';
import { ContactShadows } from '@react-three/drei';
import { StarField } from './StarField';
import { ParticleField } from './ParticleField';
import { DustParticles } from './DustParticles';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { TREE_NODES, allTreeNodes, findNodeById } from '../lib/treeData';
import type { TreeNodeData } from '../lib/treeData';

interface TreeSceneProps {
  activeNodeId: string | null;
  onNodeClick: (id: string) => void;
}

function collectIds(node: TreeNodeData): string[] {
  const ids = [node.id];
  if (node.children) {
    for (const child of node.children) {
      ids.push(...collectIds(child));
    }
  }
  return ids;
}

function getActiveBranchIds(activeId: string | null): Set<string> {
  const activeBranchIds = new Set<string>();
  if (!activeId) return activeBranchIds;

  const activeNode = findNodeById(activeId);
  if (!activeNode) return activeBranchIds;

  activeBranchIds.add(activeNode.id);
  if (activeNode.children) {
    for (const child of activeNode.children) {
      collectIds(child).forEach((id) => activeBranchIds.add(id));
    }
  }

  function walkAncestors(nodes: TreeNodeData[], targetId: string): boolean {
    for (const node of nodes) {
      if (node.id === targetId) {
        activeBranchIds.add(node.id);
        return true;
      }
      if (node.children) {
        const found = walkAncestors(node.children, targetId);
        if (found) {
          activeBranchIds.add(node.id);
          return true;
        }
      }
    }
    return false;
  }
  walkAncestors(TREE_NODES, activeId);

  return activeBranchIds;
}

function createBranchStrands(
  start: THREE.Vector3,
  end: THREE.Vector3,
  seed: number,
  count = 2,
  isRoot = false
): THREE.CatmullRomCurve3[] {
  const dir = new THREE.Vector3().subVectors(end, start).normalize();
  const up = Math.abs(dir.y) > 0.9 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0);
  const right = new THREE.Vector3().crossVectors(dir, up).normalize();
  const localUp = new THREE.Vector3().crossVectors(right, dir).normalize();

  const strands: THREE.CatmullRomCurve3[] = [];

  for (let s = 0; s < count; s++) {
    const strandAngle = (s * 2 * Math.PI) / count + seed;
    const points: THREE.Vector3[] = [];
    const segments = 8;
    const offsetLength = isRoot ? 0.0 : 0.35;
    const actualEnd = new THREE.Vector3().addScaledVector(dir, -offsetLength).add(end);

    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const p = new THREE.Vector3().lerpVectors(start, actualEnd, t);

      if (i > 0 && i < segments) {
        const bundleRadius = (isRoot ? 0.22 : 0.15) * (1.0 - t * 0.7) * Math.sin(t * Math.PI);
        const spiralAngle = t * Math.PI * 1.6 + strandAngle;

        p.addScaledVector(right, Math.cos(spiralAngle) * bundleRadius);
        p.addScaledVector(localUp, Math.sin(spiralAngle) * bundleRadius);

        const wobble = (isRoot ? 0.16 : 0.11) * Math.sin(t * Math.PI);
        p.x += Math.sin(t * Math.PI + seed) * wobble;
        p.z += Math.cos(t * Math.PI + seed) * wobble;
        p.y += (isRoot ? -0.1 : 0.08) * Math.sin(t * Math.PI);
      }
      points.push(p);
    }
    strands.push(new THREE.CatmullRomCurve3(points));
  }

  return strands;
}

function getClawCurves(start: THREE.Vector3, end: THREE.Vector3, seed: number): THREE.CatmullRomCurve3[] {
  const dir = new THREE.Vector3().subVectors(end, start).normalize();
  const preEnd = new THREE.Vector3().addScaledVector(dir, -0.35).add(end);

  const up = Math.abs(dir.y) > 0.9 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0);
  const right = new THREE.Vector3().crossVectors(dir, up).normalize();
  const localUp = new THREE.Vector3().crossVectors(right, dir).normalize();

  const clawCurves: THREE.CatmullRomCurve3[] = [];
  const clawCount = 3;

  for (let k = 0; k < clawCount; k++) {
    const angle = k * ((2 * Math.PI) / clawCount) + seed;
    const radialDir = new THREE.Vector3()
      .addScaledVector(right, Math.cos(angle))
      .addScaledVector(localUp, Math.sin(angle))
      .normalize();

    const p0 = preEnd.clone();
    const p1 = end.clone().addScaledVector(radialDir, 0.35).addScaledVector(dir, -0.15);
    const p2 = end.clone().addScaledVector(radialDir, 0.28).addScaledVector(dir, 0.06);

    clawCurves.push(new THREE.CatmullRomCurve3([p0, p1, p2]));
  }

  return clawCurves;
}

function GoldenWoodMaterial({ isActive }: { isActive: boolean }) {
  return (
    <meshStandardMaterial
      color="#e5c158"
      roughness={0.18}
      metalness={0.96}
      emissive="#ff7a00"
      emissiveIntensity={isActive ? 0.45 : 0.12}
      transparent
      opacity={isActive ? 1.0 : 0.8}
    />
  );
}

function TreeRoots({ activeBranchIds }: { activeBranchIds: Set<string> }) {
  const rootNodes = useMemo(() => allTreeNodes.filter((n) => n.group === 'roots' || n.group === 'soil'), []);

  return (
    <>
      {rootNodes.map((node) => {
        const start = new THREE.Vector3(0, -2.4, 0);
        const end = new THREE.Vector3(...node.position);
        const seed = node.position[0] * 3.5 + node.position[2] * 2.1;
        const isActive = activeBranchIds.has(node.id);
        const strands = createBranchStrands(start, end, seed, 2, true);

        return strands.map((curve, idx) => (
          <mesh key={`root-${node.id}-${idx}`} castShadow>
            <tubeGeometry args={[curve, 24, isActive ? 0.045 : 0.024, 6, false]} />
            <GoldenWoodMaterial isActive={isActive} />
          </mesh>
        ));
      })}
    </>
  );
}

function TreeBranches({ activeBranchIds }: { activeBranchIds: Set<string> }) {
  const branchNodes = useMemo(() => allTreeNodes.filter((n) => n.group === 'branches' || n.group === 'crown'), []);

  return (
    <>
      {branchNodes.map((node) => {
        const start = new THREE.Vector3(0, 1.6, 0);
        const end = new THREE.Vector3(...node.position);
        const seed = node.position[0] * 2.8 + node.position[2] * 1.7;
        const isActive = activeBranchIds.has(node.id);
        const strands = createBranchStrands(start, end, seed, 3, false);
        const claws = getClawCurves(start, end, seed);

        return (
          <group key={`branch-group-${node.id}`}>
            {strands.map((curve, idx) => (
              <mesh key={`branch-${node.id}-${idx}`} castShadow>
                <tubeGeometry args={[curve, 28, isActive ? 0.045 : 0.024, 6, false]} />
                <GoldenWoodMaterial isActive={isActive} />
              </mesh>
            ))}
            {claws.map((curve, idx) => (
              <mesh key={`branch-claw-${node.id}-${idx}`} castShadow>
                <tubeGeometry args={[curve, 8, isActive ? 0.028 : 0.016, 6, false]} />
                <GoldenWoodMaterial isActive={isActive} />
              </mesh>
            ))}
          </group>
        );
      })}
    </>
  );
}

function LeafBranches({ activeBranchIds }: { activeBranchIds: Set<string> }) {
  const leaves = useMemo(() => allTreeNodes.filter((n) => n.group === 'leaves'), []);

  return (
    <>
      {leaves.map((leaf) => {
        const parent = findNodeById('voices');
        if (!parent) return null;
        const start = new THREE.Vector3(...parent.position);
        const end = new THREE.Vector3(...leaf.position);
        const seed = leaf.position[0] * 4.2 + leaf.position[2] * 2.5;
        const isActive = activeBranchIds.has(leaf.id);
        const strands = createBranchStrands(start, end, seed, 2, false);
        const claws = getClawCurves(start, end, seed);

        return (
          <group key={`leaf-branch-group-${leaf.id}`}>
            {strands.map((curve, idx) => (
              <mesh key={`leaf-branch-${leaf.id}-${idx}`}>
                <tubeGeometry args={[curve, 20, isActive ? 0.028 : 0.015, 6, false]} />
                <GoldenWoodMaterial isActive={isActive} />
              </mesh>
            ))}
            {claws.map((curve, idx) => (
              <mesh key={`leaf-claw-${leaf.id}-${idx}`}>
                <tubeGeometry args={[curve, 8, isActive ? 0.018 : 0.01, 6, false]} />
                <GoldenWoodMaterial isActive={isActive} />
              </mesh>
            ))}
          </group>
        );
      })}
    </>
  );
}

export function TreeScene({ activeNodeId, onNodeClick }: TreeSceneProps) {
  const activeBranchIds = useMemo(() => getActiveBranchIds(activeNodeId), [activeNodeId]);
  const isMobile = useMediaQuery('(max-width: 767px)');

  return (
    <>
      <FogEnvironment />
      <LocalEnvironment />
      <StarField />
      <ParticleField />
      <DustParticles />
      <ContactShadows
        position={[0, -5.48, 0]}
        scale={22}
        far={30}
        blur={2.5}
        opacity={0.35}
        resolution={isMobile ? 256 : 512}
        frames={1}
      />
      <SoilDisc />
      <TreeTrunk />
      <TreeRoots activeBranchIds={activeBranchIds} />
      <TreeBranches activeBranchIds={activeBranchIds} />
      <LeafBranches activeBranchIds={activeBranchIds} />

      {allTreeNodes.map((node) => {
        const isActive = node.id === activeNodeId;
        const isDimmed = activeNodeId ? !activeBranchIds.has(node.id) : false;
        return <TreeNode key={node.id} node={node} isActive={isActive} isDimmed={isDimmed} onClick={onNodeClick} />;
      })}
    </>
  );
}
