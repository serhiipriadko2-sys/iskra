export function SoilDisc() {
  return (
    <group position={[0, -5.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <mesh>
        <circleGeometry args={[7, 64]} />
        <meshStandardMaterial color="#2D1B14" roughness={0.95} metalness={0.1} transparent opacity={0.75} />
      </mesh>
      <mesh position={[0, 0, 0.03]}>
        <ringGeometry args={[4, 6.5, 64]} />
        <meshBasicMaterial color="#5D4037" transparent opacity={0.4} />
      </mesh>
    </group>
  );
}
