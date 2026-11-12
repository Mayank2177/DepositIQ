import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Line, Html } from '@react-three/drei';
import * as THREE from 'three';

interface BlochSphereProps {
  theta: number; // in radians
  probability: number;
  qubitLabel?: string;
  customerId?: string | number;
  className?: string;
}

function SphereAxes() {
  return (
    <group>
      {/* Z-axis (|0> / |1>) */}
      <Line points={[[0, -1.3, 0], [0, 1.3, 0]]} color="#94a3b8" lineWidth={1.5} />
      {/* X-axis */}
      <Line points={[[-1.3, 0, 0], [1.3, 0, 0]]} color="#cbd5e1" lineWidth={1} />
      {/* Y-axis */}
      <Line points={[[0, 0, -1.3], [0, 0, 1.3]]} color="#cbd5e1" lineWidth={1} />

      {/* Axis Labels */}
      <Html position={[0, 1.45, 0]} center>
        <div className="text-[10px] font-mono font-bold text-slate-800 bg-white px-1.5 py-0.5 rounded shadow-sm border border-slate-200">
          |0⟩
        </div>
      </Html>
      <Html position={[0, -1.45, 0]} center>
        <div className="text-[10px] font-mono font-bold text-slate-800 bg-white px-1.5 py-0.5 rounded shadow-sm border border-slate-200">
          |1⟩
        </div>
      </Html>
    </group>
  );
}

function EquatorRing() {
  const points = React.useMemo(() => {
    const pts = [];
    const segments = 64;
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(angle), 0, Math.sin(angle)));
    }
    return pts;
  }, []);

  return <Line points={points} color="#e2e8f0" lineWidth={1.2} dashed dashScale={10} />;
}

function StateVector({ theta }: { theta: number }) {
  const x = Math.sin(theta);
  const y = Math.cos(theta);
  const z = 0;

  const tip = new THREE.Vector3(x, y, z);
  const origin = new THREE.Vector3(0, 0, 0);

  return (
    <group>
      {/* Vibrant Sunset Orange State Vector Line */}
      <Line points={[origin, tip]} color="#ea580c" lineWidth={3.5} />

      {/* Amber Glowing Tip Sphere */}
      <mesh position={[x, y, z]}>
        <sphereGeometry args={[0.07, 16, 16]} />
        <meshStandardMaterial
          color="#f59e0b"
          emissive="#ea580c"
          emissiveIntensity={1.2}
        />
      </mesh>

      {/* Projection line to Z-axis */}
      <Line points={[[0, y, 0], [x, y, z]]} color="#dc2626" lineWidth={1.2} dashed dashScale={18} />

      {/* State label */}
      <Html position={[x * 1.15, y * 1.15, z]} center>
        <div className="text-[9px] font-mono font-bold text-orange-950 bg-orange-100/95 px-1.5 py-0.5 rounded border border-orange-300 shadow-sm whitespace-nowrap">
          |ψ⟩ ({(Math.cos(theta/2)**2).toFixed(2)}, {(Math.sin(theta/2)**2).toFixed(2)})
        </div>
      </Html>
    </group>
  );
}

export const BlochSphere3D: React.FC<BlochSphereProps> = ({
  theta,
  probability,
  qubitLabel = 'q0',
  customerId,
  className = 'w-full h-44',
}) => {
  return (
    <div className={`relative ${className} group cursor-grab active:cursor-grabbing bg-white/80 dark:bg-zinc-900/80 rounded-xl border border-slate-200 dark:border-zinc-800 overflow-hidden`}>
      <Canvas
        camera={{ position: [2.2, 1.4, 2.5], fov: 45 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={1.5} />
        <pointLight position={[4, 5, 4]} intensity={1.8} color="#ffffff" />
        <pointLight position={[-4, -3, -4]} intensity={0.8} color="#fed7aa" />

        {/* Optical Translucent Glass Sphere */}
        <mesh>
          <sphereGeometry args={[1, 32, 32]} />
          <meshPhysicalMaterial
            color="#ffffff"
            transmission={0.85}
            roughness={0.1}
            ior={1.4}
            thickness={0.8}
            transparent
            opacity={0.35}
          />
        </mesh>

        {/* Latitude / Longitude Wireframe */}
        <mesh>
          <sphereGeometry args={[1.002, 16, 16]} />
          <meshStandardMaterial
            color="#cbd5e1"
            wireframe
            transparent
            opacity={0.4}
          />
        </mesh>

        <SphereAxes />
        <EquatorRing />
        <StateVector theta={theta} />

        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.8} />
      </Canvas>

      {/* Header overlay */}
      <div className="absolute top-2 left-2 pointer-events-none flex items-center gap-1.5 bg-white/95 dark:bg-zinc-900/95 px-2 py-0.5 rounded border border-slate-200 dark:border-zinc-800 shadow-sm">
        <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
        <span className="text-[11px] font-mono font-bold text-slate-800 dark:text-zinc-200">{qubitLabel}</span>
        {customerId && (
          <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-mono">#{customerId}</span>
        )}
      </div>

      {/* Bottom overlay: rotation info */}
      <div className="absolute bottom-2 left-2 right-2 pointer-events-none flex justify-between items-center bg-white/95 dark:bg-zinc-900/95 px-2 py-1 rounded border border-slate-200 dark:border-zinc-800 text-[10px] font-mono shadow-sm">
        <span className="text-slate-600 dark:text-zinc-400">θ = {(theta * 180 / Math.PI).toFixed(1)}°</span>
        <span className="text-orange-600 dark:text-orange-400 font-bold">P(|1⟩) = {(probability * 100).toFixed(1)}%</span>
      </div>
    </div>
  );
};
