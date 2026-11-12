import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sphere, Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

function InnerQuantumCore() {
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame((state, delta) => {
    meshRef.current.rotation.x += delta * 0.4;
    meshRef.current.rotation.y += delta * 0.6;
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={1.5}>
      <mesh ref={meshRef} scale={1.3}>
        <icosahedronGeometry args={[1, 3]} />
        <MeshDistortMaterial
          color="#06b6d4"
          emissive="#0d9488"
          emissiveIntensity={0.6}
          roughness={0.15}
          metalness={0.9}
          distort={0.35}
          speed={3}
          wireframe={false}
        />
      </mesh>
    </Float>
  );
}

function WireframeCage() {
  const cageRef = useRef<THREE.Mesh>(null!);

  useFrame((_, delta) => {
    cageRef.current.rotation.x -= delta * 0.2;
    cageRef.current.rotation.y += delta * 0.3;
  });

  return (
    <mesh ref={cageRef} scale={1.8}>
      <sphereGeometry args={[1, 18, 18]} />
      <meshStandardMaterial
        color="#38bdf8"
        wireframe
        transparent
        opacity={0.35}
        emissive="#0284c7"
        emissiveIntensity={0.4}
      />
    </mesh>
  );
}

function QuantumParticleField() {
  const pointsRef = useRef<THREE.Points>(null!);
  const count = 450;

  const positions = React.useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const radius = 2.0 + Math.random() * 1.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      pos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = radius * Math.cos(phi);
    }
    return pos;
  }, [count]);

  useFrame((_, delta) => {
    pointsRef.current.rotation.y += delta * 0.15;
    pointsRef.current.rotation.z += delta * 0.08;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.035}
        color="#38bdf8"
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export const QuantumOrb: React.FC<{ className?: string }> = ({ className = 'w-full h-full' }) => {
  return (
    <div className={`relative ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 4.5], fov: 45 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.8} />
        <pointLight position={[5, 5, 5]} intensity={2.5} color="#38bdf8" />
        <pointLight position={[-5, -5, -3]} intensity={1.8} color="#a855f7" />
        <InnerQuantumCore />
        <WireframeCage />
        <QuantumParticleField />
      </Canvas>
    </div>
  );
};

