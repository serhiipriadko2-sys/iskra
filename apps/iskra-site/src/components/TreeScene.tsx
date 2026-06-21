import { useMemo } from 'react';
import * as THREE from 'three';
import { TreeNode } from './TreeNode';
import { TreeTrunk } from './TreeTrunk';
import { SoilDisc } from './SoilDisc';
import { ParticleField } from './ParticleField';
import { DustParticles } from './DustParticles';
import { FogEnvironment } from './FogEnvironment';
import { Stars, ContactShadows } from '@react-three/drei';
import { StarField } from './StarField';
import { LocalEnvironment } from './LocalEnvironment';
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

function TreeRoots({ activeBranchIds }: { activeBranchIds: Set<string> }) {
  const rootNodes = useMemo(() => allTreeNodes.filter((n) => n.group === 'roots'), []);
  return (
    <>
      {rootNodes.map((node) => {
        const start = new THREE.Vector3(0, -1.8, 0);
        const end = new THREE.Vector3(...node.position);
        const mid = new THREE.Vector3().lerpVectors(start, end, 0.5).setY(start.y - 1.2);
        const curve = new THREE.CatmullRomCurve3([start, mid, end]);
        const isActive = activeBranchIds.has(node.id);
        return (
          <mesh key={`root-${node.id}`} castShadow>
            <tubeGeometry args={[curve, 24, isActive ? 0.1 : 0.05, 8, false]} />
            <meshPhysicalMaterial
              color={node.color}
              emissive={node.color}
              emissiveIntensity={isActive ? 0.7 : 0.15}
              roughness={0.65}
              metalness={0.15}
              clearcoat={0.25}
              transparent
              opacity={isActive ? 0.95 : 0.55}
            />
          </mesh>
        );
      })}
    </>
  );
}

function TreeBranches({ activeBranchIds }: { activeBranchIds: Set<string> }) {
  const branchNodes = useMemo(() => allTreeNodes.filter((n) => n.group === 'branches' || n.group === 'crown'), []);
  return (
    <>
      {branchNodes.map((node) => {
        const start = new THREE.Vector3(0, 1.8, 0);
        const end = new THREE.Vector3(...node.position);
        const mid = new THREE.Vector3().lerpVectors(start, end, 0.5).setY(end.y + 0.4);
        const curve = new THREE.CatmullRomCurve3([start, mid, end]);
        const isActive = activeBranchIds.has(node.id);
        return (
          <mesh key={`branch-${node.id}`} castShadow>
            <tubeGeometry args={[curve, 24, isActive ? 0.11 : 0.05, 8, false]} />
            <meshPhysicalMaterial
              color={node.color}
              emissive={node.color}
              emissiveIntensity={isActive ? 0.75 : 0.15}
              roughness={0.55}
              metalness={0.2}
              clearcoat={0.3}
              transparent
              opacity={isActive ? 0.95 : 0.55}
            />
          </mesh>
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
        const mid = new THREE.Vector3().lerpVectors(start, end, 0.5).setY(end.y + 0.3);
        const curve = new THREE.CatmullRomCurve3([start, mid, end]);
        const isActive = activeBranchIds.has(leaf.id);
        return (
          <mesh key={`leaf-branch-${leaf.id}`}>
            <tubeGeometry args={[curve, 16, isActive ? 0.05 : 0.025, 6, false]} />
            <meshPhysicalMaterial
              color={leaf.color}
              emissive={leaf.color}
              emissiveIntensity={isActive ? 0.8 : 0.2}
              roughness={0.45}
              metalness={0.25}
              clearcoat={0.3}
              transparent
              opacity={isActive ? 0.95 : 0.5}
            />
          </mesh>
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
      <ParticleField />
      <DustParticles />
      <StarField />
      <Stars radius={80} depth={50} count={1000} factor={2} saturation={0} fade speed={0.5} />
      <ContactShadows
        position={[0, -5.48, 0]}
        scale={22}
        far={30}
        blur={2.5}
        opacity={0.35}
        resolution={isMobile ? 256 : 512}
        frames={isMobile ? 1 : Infinity}
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
