import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { ComponentDefinition } from '@orbital/contracts';

interface SpacecraftCanvasProps {
  selectedComponents: ComponentDefinition[];
}

function SatelliteModel({ selectedComponents, explode }: { selectedComponents: ComponentDefinition[]; explode: boolean }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.2;
    }
  });

  const busComp = selectedComponents.find((c) => c.category === 'bus');
  const solarWings = selectedComponents.filter((c) => c.subCategory?.includes('Solar'));
  const dishes = selectedComponents.filter((c) => c.category === 'communications');
  const thrusters = selectedComponents.filter((c) => c.category === 'propulsion');
  const instruments = selectedComponents.filter((c) => c.category === 'instruments');
  const radiators = selectedComponents.filter((c) => c.category === 'thermal_aocs');

  const explodeFactor = explode ? 1.6 : 1.0;

  return (
    <group ref={groupRef}>
      {/* --- 1. BUS CHASSIS --- */}
      <mesh castShadow receiveShadow position={[0, 0, 0]}>
        {busComp?.visualModel.shape === 'cylinder' ? (
          <cylinderGeometry args={[0.9, 0.9, 1.8, 16]} />
        ) : (
          <boxGeometry args={[1.3, 1.5, 1.3]} />
        )}
        <meshStandardMaterial
          color={busComp?.visualModel.color || '#c5a059'}
          metalness={0.85}
          roughness={0.25}
        />
      </mesh>

      {/* Multilayer Insulation (MLI) gold foil detail stripes */}
      <mesh position={[0, 0, 0.67]}>
        <planeGeometry args={[0.9, 1.2]} />
        <meshStandardMaterial color="#d97706" metalness={0.9} roughness={0.15} />
      </mesh>

      {/* --- 2. SOLAR WINGS --- */}
      {solarWings.map((solar, idx) => (
        <group key={`solar-${solar.id}-${idx}`} position={[0, 0, 0]}>
          {/* Left Wing */}
          <group position={[-1.8 * explodeFactor, 0, 0]}>
            <mesh castShadow>
              <boxGeometry args={[2.2, 0.05, 0.9]} />
              <meshStandardMaterial color="#1e3a8a" metalness={0.6} roughness={0.2} />
            </mesh>
            {/* Wing boom connector */}
            <mesh position={[1.15, 0, 0]}>
              <cylinderGeometry args={[0.04, 0.04, 0.5, 8]} />
              <meshStandardMaterial color="#475569" metalness={0.8} />
            </mesh>
          </group>

          {/* Right Wing */}
          <group position={[1.8 * explodeFactor, 0, 0]}>
            <mesh castShadow>
              <boxGeometry args={[2.2, 0.05, 0.9]} />
              <meshStandardMaterial color="#1e3a8a" metalness={0.6} roughness={0.2} />
            </mesh>
            <mesh position={[-1.15, 0, 0]}>
              <cylinderGeometry args={[0.04, 0.04, 0.5, 8]} />
              <meshStandardMaterial color="#475569" metalness={0.8} />
            </mesh>
          </group>
        </group>
      ))}

      {/* --- 3. COMMUNICATIONS DISH / ANTENNAS --- */}
      {dishes.map((comm, idx) => {
        if (comm.id === 'comms-ka-dish') {
          return (
            <group key={`dish-${comm.id}-${idx}`} position={[0.75 * explodeFactor, 0.6 * explodeFactor, 0.6 * explodeFactor]} rotation={[0.4, 0.5, 0]}>
              {/* Parabolic reflector */}
              <mesh castShadow>
                <sphereGeometry args={[0.5, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.45]} />
                <meshStandardMaterial color="#f8fafc" metalness={0.4} roughness={0.3} side={THREE.DoubleSide} />
              </mesh>
              {/* Feed horn */}
              <mesh position={[0, 0, 0.35]}>
                <cylinderGeometry args={[0.02, 0.05, 0.25, 8]} />
                <meshStandardMaterial color="#0284c7" metalness={0.8} />
              </mesh>
            </group>
          );
        } else if (comm.id === 'comms-optical-laser') {
          return (
            <group key={`laser-${comm.id}-${idx}`} position={[-0.7 * explodeFactor, 0.6 * explodeFactor, 0.6 * explodeFactor]}>
              <mesh castShadow>
                <cylinderGeometry args={[0.15, 0.18, 0.5, 12]} />
                <meshStandardMaterial color="#9333ea" metalness={0.7} roughness={0.3} />
              </mesh>
              {/* Laser emitter lens */}
              <mesh position={[0, 0.26, 0]}>
                <cylinderGeometry args={[0.12, 0.12, 0.05, 12]} />
                <meshStandardMaterial color="#c084fc" emissive="#9333ea" emissiveIntensity={0.8} />
              </mesh>
            </group>
          );
        } else {
          // Patch antenna
          return (
            <mesh key={`patch-${comm.id}-${idx}`} position={[0, 0.77 * explodeFactor, 0]}>
              <cylinderGeometry args={[0.15, 0.15, 0.08, 16]} />
              <meshStandardMaterial color="#38bdf8" metalness={0.5} roughness={0.4} />
            </mesh>
          );
        }
      })}

      {/* --- 4. PROPULSION THRUSTERS --- */}
      {thrusters.map((prop, idx) => (
        <group key={`prop-${prop.id}-${idx}`} position={[0, -0.9 * explodeFactor, 0]}>
          <mesh castShadow>
            <coneGeometry args={[0.3, 0.5, 16]} />
            <meshStandardMaterial
              color={prop.id.includes('hall') ? '#06b6d4' : '#e11d48'}
              metalness={0.9}
              roughness={0.2}
            />
          </mesh>
          {/* Subtle engine bell glow */}
          <pointLight
            color={prop.id.includes('hall') ? '#38bdf8' : '#f97316'}
            intensity={1.2}
            distance={1.5}
            position={[0, -0.3, 0]}
          />
        </group>
      ))}

      {/* --- 5. SCIENTIFIC PAYLOADS --- */}
      {instruments.map((inst, idx) => {
        if (inst.id === 'inst-multispectral-imager') {
          return (
            <group key={`inst-${inst.id}-${idx}`} position={[0, -0.75 * explodeFactor, 0.35 * explodeFactor]} rotation={[Math.PI, 0, 0]}>
              <mesh castShadow>
                <cylinderGeometry args={[0.2, 0.25, 0.5, 16]} />
                <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.2} />
              </mesh>
              {/* Optical Glass Lens */}
              <mesh position={[0, 0.26, 0]}>
                <sphereGeometry args={[0.18, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
                <meshStandardMaterial color="#38bdf8" metalness={0.9} roughness={0.1} />
              </mesh>
            </group>
          );
        } else if (inst.id === 'inst-synthetic-aperture-radar') {
          return (
            <mesh key={`sar-${inst.id}-${idx}`} position={[0, -0.6 * explodeFactor, -0.75 * explodeFactor]}>
              <boxGeometry args={[2.2, 0.1, 0.6]} />
              <meshStandardMaterial color="#f59e0b" metalness={0.7} roughness={0.3} />
            </mesh>
          );
        } else if (inst.id === 'inst-fluxgate-magnetometer') {
          return (
            <group key={`mag-${inst.id}-${idx}`} position={[0, 1.4 * explodeFactor, 0]}>
              <mesh castShadow>
                <cylinderGeometry args={[0.02, 0.02, 1.4, 8]} />
                <meshStandardMaterial color="#cbd5e1" metalness={0.9} />
              </mesh>
              <mesh position={[0, 0.75, 0]}>
                <sphereGeometry args={[0.08, 12, 12]} />
                <meshStandardMaterial color="#ef4444" />
              </mesh>
            </group>
          );
        } else {
          return (
            <mesh key={`inst-${inst.id}-${idx}`} position={[0.4 * explodeFactor, -0.6 * explodeFactor, 0.4 * explodeFactor]}>
              <sphereGeometry args={[0.2, 16, 16]} />
              <meshStandardMaterial color="#10b981" metalness={0.5} roughness={0.3} />
            </mesh>
          );
        }
      })}

      {/* --- 6. THERMAL RADIATORS --- */}
      {radiators.map((rad, idx) => (
        <mesh key={`rad-${rad.id}-${idx}`} position={[0, 0, -0.7 * explodeFactor]}>
          <boxGeometry args={[1.1, 1.1, 0.05]} />
          <meshStandardMaterial color="#f1f5f9" metalness={0.3} roughness={0.4} />
        </mesh>
      ))}
    </group>
  );
}

export function SpacecraftCanvas({ selectedComponents }: SpacecraftCanvasProps) {
  const [explode, setExplode] = useState(false);

  return (
    <div className="relative w-full h-[400px] lg:h-[460px] bg-space-950/90 rounded-2xl border border-slate-800/80 overflow-hidden shadow-2xl">
      {/* 3D Canvas */}
      <Canvas camera={{ position: [2.8, 2.2, 3.2], fov: 45 }} shadows>
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[5, 8, 5]}
          intensity={1.8}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <pointLight position={[-4, -3, -4]} intensity={0.5} color="#38bdf8" />

        <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
        <SatelliteModel selectedComponents={selectedComponents} explode={explode} />
        <OrbitControls enablePan={true} enableZoom={true} minDistance={1.8} maxDistance={7} />
      </Canvas>

      {/* Controls HUD overlay */}
      <div className="absolute top-4 left-4 z-10 flex items-center space-x-2">
        <span className="px-2.5 py-1 text-xs font-mono font-medium rounded-md bg-cyan-950/80 border border-cyan-500/40 text-cyan-300">
          3D SATELLITE VISUALIZER
        </span>
        <button
          onClick={() => setExplode(!explode)}
          className={`px-2.5 py-1 text-xs font-mono rounded-md border transition-colors ${
            explode
              ? 'bg-amber-950 border-amber-500 text-amber-300'
              : 'bg-space-900/80 border-slate-700 text-slate-300 hover:border-slate-500'
          }`}
        >
          {explode ? 'ASSEMBLE' : 'EXPLODE VIEW'}
        </button>
      </div>

      <div className="absolute bottom-3 right-4 z-10 text-[11px] font-mono text-slate-400 bg-space-900/80 px-2 py-1 rounded border border-slate-800 pointer-events-none">
        DRAG TO ROTATE • SCROLL TO ZOOM
      </div>
    </div>
  );
}
