export function SoilDisc() {
  return (
    <group position={[0, -5.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <mesh>
        <planeGeometry args={[15, 15, 32, 32]} />
        <meshStandardMaterial color="#2D1B14" roughness={0.9} metalness={0.1} />
      </mesh>
    </group>
  );
}
