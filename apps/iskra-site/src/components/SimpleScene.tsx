export function SimpleScene() {
  return (
    <>
      <ambientLight intensity={1} />
      <mesh>
        <boxGeometry args={[2, 2, 2]} />
        <meshStandardMaterial color="red" />
      </mesh>
    </>
  );
}
