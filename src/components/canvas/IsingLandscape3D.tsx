import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float } from '@react-three/drei';
import * as THREE from 'three';

interface IsingLandscapeProps {
  gamma?: number;
  beta?: number;
  qaoaEnergyHistory?: number[];
  optimalBitstring?: string;
  className?: string;
}

function TerrainMesh({ gamma = 0.5, beta = 0.5 }: { gamma: number; beta: number }) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const gridSize = 40;
  const size = 4.0;

  const { geometry } = React.useMemo(() => {
    const geo = new THREE.PlaneGeometry(size, size, gridSize, gridSize);
    const pos = geo.attributes.position;

    for (let i = 0; i < pos.count; i++) {
      const u = pos.getX(i);
      const v = pos.getY(i);

      // Multi-minima Hamiltonian cost function
      const z =
        Math.sin(u * 2.5 + gamma * 2) * Math.cos(v * 2.5 + beta * 2) * 0.45 +
        Math.sin(Math.sqrt(u * u + v * v) * 3) * 0.25 -
        Math.exp(-(u * u + v * v) * 1.5) * 0.6; // Global minimum ground state

      pos.setZ(i, z);
    }

    geo.computeVertexNormals();
    return { geometry: geo };
  }, [gamma, beta]);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.z += delta * 0.08;
    }
  });

  return (
    <mesh ref={meshRef} geometry={geometry} rotation={[-Math.PI / 3, 0, 0]}>
      <meshStandardMaterial
        wireframe
        color="#ea580c"
        emissive="#f97316"
        emissiveIntensity={0.25}
        roughness={0.3}
        metalness={0.4}
      />
    </mesh>
  );
}

function GroundStateMarker() {
  return (
    <Float speed={3} rotationIntensity={0.5} floatIntensity={1}>
      <mesh position={[0, -0.4, 0.4]}>
        <sphereGeometry args={[0.09, 24, 24]} />
        <meshStandardMaterial
          color="#f59e0b"
          emissive="#ea580c"
          emissiveIntensity={1.5}
        />
      </mesh>
    </Float>
  );
}

export const IsingLandscape3D: React.FC<IsingLandscapeProps> = ({
  gamma = 0.5,
  beta = 0.5,
  className = 'w-full h-56',
}) => {
  return (
    <div className={`relative ${className} bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 overflow-hidden`}>
      <Canvas
        camera={{ position: [0, -3.2, 2.5], fov: 45 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={1.5} />
        <directionalLight position={[3, 5, 4]} intensity={2.0} color="#ffffff" />
        <pointLight position={[-3, -2, -2]} intensity={1.5} color="#fed7aa" />
        <TerrainMesh gamma={gamma} beta={beta} />
        <GroundStateMarker />
        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
      </Canvas>
      <div className="absolute top-2 right-2 bg-white/95 dark:bg-zinc-900/95 px-2.5 py-0.5 rounded border border-slate-200 dark:border-zinc-800 text-[10px] font-mono text-orange-700 dark:text-orange-400 shadow-sm pointer-events-none">
        QUBO Cost Landscape H(x)
      </div>
    </div>
  );
};
