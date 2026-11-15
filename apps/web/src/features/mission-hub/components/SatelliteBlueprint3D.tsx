import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Sun, Battery, Radio, Camera, Cpu } from 'lucide-react';

function SatelliteMesh() {
  const satelliteGroup = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (satelliteGroup.current) {
      satelliteGroup.current.rotation.y += delta * 0.4;
      satelliteGroup.current.rotation.x = Math.sin(Date.now() * 0.001) * 0.12;
    }
  });

  return (
    <group ref={satelliteGroup} position={[0, 0, 0]}>
      {/* Central Electronics & Battery Bus */}
      <mesh>
        <boxGeometry args={[1.2, 1.2, 1.8]} />
        <meshStandardMaterial
          color="#334155"
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Gold Foil Thermal Insulation Wrap Panels */}
      <mesh position={[0, 0, 0.91]}>
        <planeGeometry args={[1.1, 1.1]} />
        <meshStandardMaterial
          color="#fbbf24"
          metalness={0.9}
          roughness={0.1}
          emissive="#78350f"
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* Solar Wing Array - Port (Left) */}
      <group position={[-1.7, 0, 0]}>
        <mesh>
          <boxGeometry args={[2.0, 0.06, 1.1]} />
          <meshStandardMaterial
            color="#0284c7"
            metalness={0.4}
            roughness={0.1}
            emissive="#0369a1"
            emissiveIntensity={0.25}
          />
        </mesh>
        {/* Blue solar cell pattern grid */}
        <mesh position={[0, 0.035, 0]}>
          <planeGeometry args={[1.9, 1.0]} />
          <meshBasicMaterial color="#38bdf8" wireframe />
        </mesh>
      </group>

      {/* Solar Wing Array - Starboard (Right) */}
      <group position={[1.7, 0, 0]}>
        <mesh>
          <boxGeometry args={[2.0, 0.06, 1.1]} />
          <meshStandardMaterial
            color="#0284c7"
            metalness={0.4}
            roughness={0.1}
            emissive="#0369a1"
            emissiveIntensity={0.25}
          />
        </mesh>
        <mesh position={[0, 0.035, 0]}>
          <planeGeometry args={[1.9, 1.0]} />
          <meshBasicMaterial color="#38bdf8" wireframe />
        </mesh>
      </group>

      {/* Communication Parabolic High-Gain Dish */}
      <group position={[0, 1.0, 0]} rotation={[0, 0, 0]}>
        <mesh>
          <coneGeometry args={[0.55, 0.28, 24, 1, true]} />
          <meshStandardMaterial
            color="#e2e8f0"
            metalness={0.9}
            roughness={0.2}
            side={THREE.DoubleSide}
          />
        </mesh>
        <mesh position={[0, 0.25, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.3]} />
          <meshBasicMaterial color="#38bdf8" />
        </mesh>
      </group>

      {/* Earth Observing Scientific Camera Payload */}
      <group position={[0, -0.75, 0.3]} rotation={[Math.PI / 2, 0, 0]}>
        <mesh>
          <cylinderGeometry args={[0.26, 0.32, 0.5, 24]} />
          <meshStandardMaterial
            color="#0f172a"
            metalness={0.7}
            roughness={0.3}
          />
        </mesh>
        {/* Camera Lens Element */}
        <mesh position={[0, -0.26, 0]}>
          <circleGeometry args={[0.22, 24]} />
          <meshStandardMaterial
            color="#06b6d4"
            emissive="#0891b2"
            emissiveIntensity={0.6}
            roughness={0.1}
          />
        </mesh>
      </group>

      {/* Reaction Wheels Attitude Control Cylinders */}
      <mesh position={[0, 0, -0.92]}>
        <cylinderGeometry args={[0.28, 0.28, 0.2, 16]} />
        <meshStandardMaterial color="#64748b" metalness={0.9} roughness={0.2} />
      </mesh>
    </group>
  );
}

export function SatelliteBlueprint3D() {
  return (
    <div className="rounded-3xl bg-space-900/80 border border-slate-800 p-6 shadow-2xl overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 mb-1">
            <Cpu className="w-4 h-4" />
            <span>INTERACTIVE HARDWARE BLUEPRINT</span>
          </div>
          <h3 className="text-xl font-black text-white">
            What You'll Build in the Spacecraft Lab
          </h3>
          <p className="text-xs text-slate-300 mt-0.5">
            Every satellite needs power, communications, navigation, and science cameras.
          </p>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800 self-start sm:self-auto">
          DEV 02 INTEGRATION READY
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* 3D Model View */}
        <div className="lg:col-span-7 h-[280px] sm:h-[320px] rounded-2xl bg-space-950 border border-slate-800/80 relative overflow-hidden">
          <Canvas
            camera={{ position: [0, 2, 5], fov: 45 }}
            gl={{ antialias: true, alpha: true }}
            className="w-full h-full cursor-grab active:cursor-grabbing"
          >
            <ambientLight intensity={0.5} />
            <directionalLight position={[5, 6, 4]} intensity={1.8} />
            <pointLight position={[-4, -3, -2]} intensity={0.6} color="#06b6d4" />
            <SatelliteMesh />
          </Canvas>
          <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg bg-space-950/80 backdrop-blur-sm border border-slate-800 text-[10px] font-mono text-slate-400">
            DRAG TO ROTATE & INSPECT 3D CHASSIS
          </div>
        </div>

        {/* Component Explanations (Easy Non-Tech Language) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="p-3 rounded-xl bg-space-950/70 border border-slate-800/80 flex items-start space-x-3 hover:border-cyan-500/40 transition-colors">
            <div className="w-8 h-8 rounded-lg bg-sky-950 border border-sky-800/80 flex items-center justify-center flex-shrink-0 text-sky-400">
              <Sun className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center justify-between">
                <span>Solar Panels</span>
                <span className="text-[10px] font-mono text-cyan-400">Generates Power</span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                Soaks up natural sunlight to continuously charge your on-board systems while in daylight.
              </p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-space-950/70 border border-slate-800/80 flex items-start space-x-3 hover:border-cyan-500/40 transition-colors">
            <div className="w-8 h-8 rounded-lg bg-amber-950 border border-amber-800/80 flex items-center justify-center flex-shrink-0 text-amber-400">
              <Battery className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center justify-between">
                <span>Batteries</span>
                <span className="text-[10px] font-mono text-amber-400">Night Survival</span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                Stores extra energy so your satellite stays active and alive when Earth blocks the sun!
              </p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-space-950/70 border border-slate-800/80 flex items-start space-x-3 hover:border-cyan-500/40 transition-colors">
            <div className="w-8 h-8 rounded-lg bg-purple-950 border border-purple-800/80 flex items-center justify-center flex-shrink-0 text-purple-400">
              <Radio className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center justify-between">
                <span>Dish Antenna</span>
                <span className="text-[10px] font-mono text-purple-400">Sends Discoveries</span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                Beams photos, wildfire maps, and sensor readings from deep space directly down to NASA.
              </p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-space-950/70 border border-slate-800/80 flex items-start space-x-3 hover:border-cyan-500/40 transition-colors">
            <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-800/80 flex items-center justify-center flex-shrink-0 text-emerald-400">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center justify-between">
                <span>Scientific Sensors</span>
                <span className="text-[10px] font-mono text-emerald-400">Your Eyes & Ears</span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                Infrared cameras detect wildfires through clouds; radar penetrates ice and darkness.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

