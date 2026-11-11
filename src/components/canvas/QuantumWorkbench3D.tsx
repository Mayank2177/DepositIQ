import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, Html, Cylinder } from '@react-three/drei';
import * as THREE from 'three';
import { CandidateCustomer } from '../../types';

interface QuantumWorkbench3DProps {
  candidates: CandidateCustomer[];
  selectedIds: Set<string | number>;
  onToggleCustomer: (id: string | number) => void;
  className?: string;
}

// Single Customer 3D Puck
function CustomerPuck({
  customer,
  index,
  total,
  isSelected,
  dockIndex,
  onToggle,
}: {
  customer: CandidateCustomer;
  index: number;
  total: number;
  isSelected: boolean;
  dockIndex: number;
  onToggle: () => void;
}) {
  const meshRef = useRef<THREE.Group>(null!);

  // Outer circle position when not docked
  const outerRadius = 3.6;
  const angle = (index / total) * Math.PI * 2;
  const outerX = Math.cos(angle) * outerRadius;
  const outerZ = Math.sin(angle) * outerRadius;

  // Inner docked position inside the 6-bay receiver
  const innerRadius = 1.6;
  const dockAngle = (dockIndex / 6) * Math.PI * 2;
  const targetX = isSelected ? Math.cos(dockAngle) * innerRadius : outerX;
  const targetZ = isSelected ? Math.sin(dockAngle) * innerRadius : outerZ;
  const targetY = isSelected ? 0.35 : 0.05;

  useFrame((_, delta) => {
    if (meshRef.current) {
      // Smooth interpolation towards target position
      meshRef.current.position.x = THREE.MathUtils.lerp(meshRef.current.position.x, targetX, delta * 6);
      meshRef.current.position.z = THREE.MathUtils.lerp(meshRef.current.position.z, targetZ, delta * 6);
      meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, targetY, delta * 6);
    }
  });

  return (
    <group
      ref={meshRef}
      position={[outerX, 0.05, outerZ]}
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
    >
      {/* Knurled Copper/Brass Base Ring */}
      <mesh position={[0, 0.04, 0]}>
        <cylinderGeometry args={[0.36, 0.38, 0.08, 32]} />
        <meshStandardMaterial
          color={isSelected ? '#ea580c' : '#b45309'}
          metalness={0.9}
          roughness={0.25}
        />
      </mesh>

      {/* Porcelain Ceramic Top Puck */}
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.34, 0.34, 0.06, 32]} />
        <meshStandardMaterial
          color={isSelected ? '#ffffff' : '#f8fafc'}
          roughness={0.15}
          metalness={0.05}
        />
      </mesh>

      {/* Amber Status Ring Indicator */}
      <mesh position={[0, 0.14, 0]}>
        <torusGeometry args={[0.26, 0.02, 16, 32]} />
        <meshStandardMaterial
          color={isSelected ? '#f59e0b' : '#94a3b8'}
          emissive={isSelected ? '#f59e0b' : '#475569'}
          emissiveIntensity={isSelected ? 1.2 : 0.2}
        />
      </mesh>

      {/* 3D Floating Tag */}
      <Html position={[0, 0.45, 0]} center distanceFactor={8}>
        <div
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          className={`px-2 py-0.5 rounded text-[10px] font-mono cursor-pointer transition-all whitespace-nowrap shadow-sm border ${
            isSelected
              ? 'bg-orange-600 text-white border-orange-700 font-bold shadow-orange-500/20 scale-105'
              : 'bg-white/95 dark:bg-zinc-900/95 text-slate-700 dark:text-zinc-300 border-slate-300 dark:border-zinc-700 hover:border-orange-400'
          }`}
        >
          #{customer.customer_id} ({(customer.probability * 100).toFixed(0)}%)
        </div>
      </Html>
    </group>
  );
}

// Central 6-Bay Quantum Processor Chamber
function CentralProcessorChamber({ activeCount }: { activeCount: number }) {
  const coreRef = useRef<THREE.Mesh>(null!);

  useFrame((_, delta) => {
    if (coreRef.current) {
      coreRef.current.rotation.y += delta * 0.5;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Outer Ceramic Platform Base */}
      <mesh position={[0, -0.05, 0]}>
        <cylinderGeometry args={[2.2, 2.4, 0.12, 48]} />
        <meshStandardMaterial color="#ffffff" roughness={0.2} metalness={0.05} />
      </mesh>

      {/* Brushed Copper Accent Perimeter Ring */}
      <mesh position={[0, 0.02, 0]}>
        <torusGeometry args={[2.2, 0.06, 16, 48]} />
        <meshStandardMaterial color="#c2410c" metalness={0.9} roughness={0.3} />
      </mesh>

      {/* 6 Radial Docking Bay Wells */}
      {Array.from({ length: 6 }).map((_, idx) => {
        const angle = (idx / 6) * Math.PI * 2;
        const x = Math.cos(angle) * 1.6;
        const z = Math.sin(angle) * 1.6;
        const isOccupied = idx < activeCount;

        return (
          <group key={idx} position={[x, 0.02, z]}>
            {/* Bay Well Ring */}
            <mesh>
              <cylinderGeometry args={[0.42, 0.42, 0.04, 32]} />
              <meshStandardMaterial
                color={isOccupied ? '#fef3c7' : '#f1f5f9'}
                roughness={0.3}
              />
            </mesh>
            <mesh position={[0, 0.02, 0]}>
              <torusGeometry args={[0.42, 0.02, 16, 32]} />
              <meshStandardMaterial
                color={isOccupied ? '#ea580c' : '#cbd5e1'}
                emissive={isOccupied ? '#ea580c' : '#000000'}
                emissiveIntensity={isOccupied ? 0.6 : 0}
              />
            </mesh>
          </group>
        );
      })}

      {/* Inner Illuminated Amber Optical Glass Core */}
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.8}>
        <mesh ref={coreRef} position={[0, 0.7, 0]}>
          <cylinderGeometry args={[0.55, 0.55, 0.75, 32]} />
          <meshPhysicalMaterial
            color="#f97316"
            emissive="#ea580c"
            emissiveIntensity={0.7}
            transmission={0.8}
            roughness={0.15}
            ior={1.5}
            thickness={1.2}
          />
        </mesh>
      </Float>

      {/* Central Pillar Cap */}
      <mesh position={[0, 1.15, 0]}>
        <cylinderGeometry args={[0.3, 0.4, 0.1, 32]} />
        <meshStandardMaterial color="#c2410c" metalness={0.9} roughness={0.2} />
      </mesh>
    </group>
  );
}

// Floor Studio Surface with Soft Grid
function StudioFloor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.12, 0]}>
      <planeGeometry args={[25, 25]} />
      <meshStandardMaterial color="#f8fafc" roughness={0.8} metalness={0.02} />
    </mesh>
  );
}

export const QuantumWorkbench3D: React.FC<QuantumWorkbench3DProps> = ({
  candidates,
  selectedIds,
  onToggleCustomer,
  className = 'w-full h-80',
}) => {
  // Map selected customer IDs to dock positions 0..5
  const selectedList = candidates.filter((c) => selectedIds.has(c.customer_id));

  return (
    <div className={`relative ${className} rounded-2xl overflow-hidden bg-gradient-to-b from-white via-slate-50 to-orange-50/30 dark:from-zinc-900 dark:via-zinc-950 dark:to-orange-950/20 border border-slate-200/80 dark:border-zinc-800 shadow-soft-card`}>
      <Canvas
        camera={{ position: [0, 4.8, 5.8], fov: 42 }}
        dpr={[1, 2]}
        gl={{ antialias: true }}
      >
        <ambientLight intensity={1.2} />
        <directionalLight position={[6, 10, 6]} intensity={1.8} color="#ffffff" castShadow />
        <pointLight position={[-4, 6, -4]} intensity={1.2} color="#fed7aa" />
        <pointLight position={[0, 2, 0]} intensity={2.0} color="#f97316" />

        <CentralProcessorChamber activeCount={selectedList.length} />

        {candidates.map((cust, idx) => {
          const isSelected = selectedIds.has(cust.customer_id);
          const dockIndex = selectedList.findIndex((c) => c.customer_id === cust.customer_id);

          return (
            <CustomerPuck
              key={cust.customer_id}
              customer={cust}
              index={idx}
              total={candidates.length}
              isSelected={isSelected}
              dockIndex={dockIndex >= 0 ? dockIndex : 0}
              onToggle={() => onToggleCustomer(cust.customer_id)}
            />
          );
        })}

        <StudioFloor />
        <OrbitControls
          enableZoom={true}
          maxPolarAngle={Math.PI / 2 - 0.05}
          minDistance={3.5}
          maxDistance={10}
        />
      </Canvas>

      {/* Top Overlay Pill */}
      <div className="absolute top-3 left-3 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm flex items-center gap-2 text-xs font-mono">
        <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse" />
        <span className="font-bold text-slate-800 dark:text-zinc-200">3D Spatial Workbench:</span>
        <span className="text-orange-600 dark:text-orange-400 font-semibold">{selectedList.length} / 6 Bays Docked</span>
      </div>

      {/* Interaction Help Pill */}
      <div className="absolute bottom-3 right-3 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md px-3 py-1 rounded-lg border border-slate-200 dark:border-zinc-800 text-[11px] font-mono text-slate-600 dark:text-zinc-400 shadow-sm pointer-events-none">
        Click pucks to dock • Drag to rotate
      </div>
    </div>
  );
};
