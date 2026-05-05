import { Canvas, useFrame } from "@react-three/fiber";
import { Float, OrbitControls, Sphere, Cylinder, Box } from "@react-three/drei";
import { useRef, Suspense } from "react";
import * as THREE from "three";

function Tree({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((s) => {
    if (ref.current) ref.current.rotation.z = Math.sin(s.clock.elapsedTime + position[0]) * 0.04;
  });
  return (
    <group ref={ref} position={position} scale={scale}>
      <Cylinder args={[0.12, 0.18, 0.9, 8]} position={[0, 0.45, 0]}>
        <meshStandardMaterial color="#5b3a1f" roughness={0.9} />
      </Cylinder>
      <Sphere args={[0.55, 16, 16]} position={[0, 1.2, 0]}>
        <meshStandardMaterial color="#3f8a3f" roughness={0.7} />
      </Sphere>
      <Sphere args={[0.4, 16, 16]} position={[0.3, 1.5, 0.1]}>
        <meshStandardMaterial color="#4ba14b" roughness={0.7} />
      </Sphere>
    </group>
  );
}

function Crop({ x, z }: { x: number; z: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((s) => {
    if (ref.current) ref.current.rotation.z = Math.sin(s.clock.elapsedTime * 2 + x + z) * 0.15;
  });
  return (
    <Cylinder ref={ref} args={[0.04, 0.06, 0.4, 6]} position={[x, 0.2, z]}>
      <meshStandardMaterial color="#c9a227" />
    </Cylinder>
  );
}

function Sun() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((s) => {
    if (ref.current) {
      ref.current.position.x = Math.cos(s.clock.elapsedTime * 0.1) * 6;
      ref.current.position.y = 4 + Math.sin(s.clock.elapsedTime * 0.1) * 0.5;
    }
  });
  return (
    <Sphere ref={ref} args={[0.5, 32, 32]} position={[4, 4, -3]}>
      <meshBasicMaterial color="#ffd166" />
    </Sphere>
  );
}

function Scene() {
  const crops = [];
  for (let x = -3; x <= 3; x += 0.6) {
    for (let z = 0; z <= 2; z += 0.5) crops.push({ x, z: z + 0.2 });
  }
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 8, 5]} intensity={1.2} castShadow />
      <Sun />

      {/* Ground */}
      <Box args={[20, 0.2, 20]} position={[0, -0.1, 0]} receiveShadow>
        <meshStandardMaterial color="#7cb342" />
      </Box>
      {/* Soil patch */}
      <Box args={[8, 0.05, 3]} position={[0, 0.02, 1]}>
        <meshStandardMaterial color="#6d4c2b" />
      </Box>

      {crops.map((c, i) => <Crop key={i} x={c.x} z={c.z} />)}

      <Tree position={[-4, 0, -2]} scale={1.2} />
      <Tree position={[4.5, 0, -1.5]} />
      <Tree position={[-3, 0, 3]} scale={0.9} />

      {/* Barn */}
      <Float speed={1} floatIntensity={0.2} rotationIntensity={0.1}>
        <group position={[3, 0, -3]}>
          <Box args={[1.6, 1.2, 1.4]} position={[0, 0.6, 0]}>
            <meshStandardMaterial color="#b34747" />
          </Box>
          <mesh position={[0, 1.4, 0]} rotation={[0, Math.PI / 4, 0]}>
            <coneGeometry args={[1.2, 0.6, 4]} />
            <meshStandardMaterial color="#3a2018" />
          </mesh>
        </group>
      </Float>
    </>
  );
}

export function FarmScene() {
  return (
    <Canvas
      shadows
      camera={{ position: [0, 3, 7], fov: 50 }}
      style={{ width: "100%", height: "100%" }}
    >
      <Suspense fallback={null}>
        <Scene />
        <OrbitControls enablePan={false} enableZoom={false} autoRotate autoRotateSpeed={0.6} maxPolarAngle={Math.PI / 2.2} minPolarAngle={Math.PI / 3} />
      </Suspense>
    </Canvas>
  );
}
