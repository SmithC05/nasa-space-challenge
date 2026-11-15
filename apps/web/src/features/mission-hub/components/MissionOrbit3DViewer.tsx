import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Shield, Eye, Compass, Layers, RotateCw } from 'lucide-react';

interface MissionOrbit3DViewerProps {
  destination: string;
  missionName: string;
  targetOrbit?: string;
}

// 1. Earth with cloud layer and atmosphere
function OrbitingEarth() {
  const earthRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (earthRef.current) {
      earthRef.current.rotation.y += delta * 0.12;
    }
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += delta * 0.16;
    }
  });

  return (
    <group rotation={[0.3, 0.2, 0.41]}>
      {/* Ocean Core */}
      <mesh ref={earthRef}>
        <sphereGeometry args={[1.5, 48, 48]} />
        <meshStandardMaterial
          color="#0b3866"
          roughness={0.4}
          metalness={0.2}
          emissive="#041830"
          emissiveIntensity={0.3}
        />
      </mesh>

      {/* Continents Grid Wireframe */}
      <mesh rotation={[0, 0.5, 0]}>
        <sphereGeometry args={[1.505, 32, 32]} />
        <meshBasicMaterial
          color="#10b981"
          wireframe
          transparent
          opacity={0.35}
        />
      </mesh>

      {/* Cloud Layer */}
      <mesh ref={cloudsRef}>
        <sphereGeometry args={[1.54, 32, 32]} />
        <meshStandardMaterial
          color="#e0f2fe"
          transparent
          opacity={0.32}
          roughness={0.9}
        />
      </mesh>

      {/* Atmospheric Glow Ring */}
      <mesh>
        <sphereGeometry args={[1.68, 32, 32]} />
        <meshBasicMaterial
          color="#38bdf8"
          transparent
          opacity={0.12}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
}

// 2. Moon
function OrbitingMoon() {
  const moonRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (moonRef.current) {
      moonRef.current.rotation.y += delta * 0.1;
    }
  });

  return (
    <group rotation={[0.1, 0.1, 0.1]}>
      <mesh ref={moonRef}>
        <sphereGeometry args={[1.35, 40, 40]} />
        <meshStandardMaterial
          color="#94a3b8"
          roughness={0.9}
          metalness={0.1}
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[1.354, 28, 28]} />
        <meshBasicMaterial
          color="#64748b"
          wireframe
          transparent
          opacity={0.25}
        />
      </mesh>
    </group>
  );
}

// 3. Mars
function OrbitingMars() {
  const marsRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (marsRef.current) {
      marsRef.current.rotation.y += delta * 0.13;
    }
  });

  return (
    <group rotation={[0.4, 0.1, 0.2]}>
      <mesh ref={marsRef}>
        <sphereGeometry args={[1.4, 40, 40]} />
        <meshStandardMaterial
          color="#b45309"
          roughness={0.7}
          metalness={0.15}
          emissive="#78350f"
          emissiveIntensity={0.25}
        />
      </mesh>
      {/* Polar Ice Cap */}
      <mesh position={[0, 1.34, 0]}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial color="#ffffff" roughness={0.2} />
      </mesh>
      {/* Dust Atmosphere */}
      <mesh>
        <sphereGeometry args={[1.52, 32, 32]} />
        <meshBasicMaterial
          color="#f97316"
          transparent
          opacity={0.15}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
}

// 4. Asteroid
function OrbitingAsteroid() {
  const asteroidRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (asteroidRef.current) {
      asteroidRef.current.rotation.x += delta * 0.2;
      asteroidRef.current.rotation.y += delta * 0.25;
    }
  });

  return (
    <mesh ref={asteroidRef}>
      <dodecahedronGeometry args={[1.3, 1]} />
      <meshStandardMaterial
        color="#78716c"
        roughness={0.95}
        metalness={0.2}
        flatShading
      />
    </mesh>
  );
}

// 5. Orbiting Satellite & Trajectory Ring
function OrbitingSatellite({ orbitRadius = 2.6, orbitSpeed = 0.8 }: { orbitRadius?: number; orbitSpeed?: number }) {
  const satelliteGroup = useRef<THREE.Group>(null);
  const timeRef = useRef(0);

  useFrame((_, delta) => {
    timeRef.current += delta * orbitSpeed;
    if (satelliteGroup.current) {
      const angle = timeRef.current;
      const x = Math.cos(angle) * orbitRadius;
      const z = Math.sin(angle) * orbitRadius;
      satelliteGroup.current.position.set(x, 0, z);
      // Orient satellite facing forward along orbit and inward to planet
      satelliteGroup.current.rotation.y = -angle + Math.PI / 2;
    }
  });

  return (
    <group rotation={[0.45, 0.2, 0.15]}>
      {/* Orbit Track Ring in 3D */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[orbitRadius, 0.014, 8, 96]} />
        <meshBasicMaterial color="#06b6d4" transparent opacity={0.55} />
      </mesh>

      {/* Satellite Model */}
      <group ref={satelliteGroup}>
        {/* Main Bus Body */}
        <mesh>
          <boxGeometry args={[0.22, 0.22, 0.32]} />
          <meshStandardMaterial
            color="#e2e8f0"
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>

        {/* Solar Panel Wing Left */}
        <group position={[-0.32, 0, 0]}>
          <mesh>
            <boxGeometry args={[0.38, 0.02, 0.18]} />
            <meshStandardMaterial
              color="#0284c7"
              metalness={0.5}
              roughness={0.1}
              emissive="#0369a1"
              emissiveIntensity={0.2}
            />
          </mesh>
          {/* Solar cell grid line */}
          <mesh position={[0, 0.015, 0]}>
            <planeGeometry args={[0.36, 0.16]} />
            <meshBasicMaterial color="#38bdf8" wireframe />
          </mesh>
        </group>

        {/* Solar Panel Wing Right */}
        <group position={[0.32, 0, 0]}>
          <mesh>
            <boxGeometry args={[0.38, 0.02, 0.18]} />
            <meshStandardMaterial
              color="#0284c7"
              metalness={0.5}
              roughness={0.1}
              emissive="#0369a1"
              emissiveIntensity={0.2}
            />
          </mesh>
          {/* Solar cell grid line */}
          <mesh position={[0, 0.015, 0]}>
            <planeGeometry args={[0.36, 0.16]} />
            <meshBasicMaterial color="#38bdf8" wireframe />
          </mesh>
        </group>

        {/* Dish Antenna Pointing Down at Planet */}
        <group position={[0, -0.16, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <mesh>
            <coneGeometry args={[0.12, 0.06, 16, 1, true]} />
            <meshStandardMaterial
              color="#94a3b8"
              metalness={0.9}
              roughness={0.2}
              side={THREE.DoubleSide}
            />
          </mesh>
          {/* Antenna Feed Needle */}
          <mesh position={[0, 0.05, 0]}>
            <cylinderGeometry args={[0.008, 0.008, 0.08]} />
            <meshBasicMaterial color="#38bdf8" />
          </mesh>
        </group>

        {/* Sensor Beacon Light */}
        <pointLight
          position={[0, -0.18, 0]}
          color="#22d3ee"
          intensity={0.6}
          distance={0.8}
        />
      </group>
    </group>
  );
}

// Background Starfield
function Starfield() {
  const stars = useMemo(() => {
    const count = 350;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 28;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 28;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 28;
    }
    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geom;
  }, []);

  return (
    <points geometry={stars}>
      <pointsMaterial size={0.06} color="#93c5fd" transparent opacity={0.6} />
    </points>
  );
}

// Interactive Camera Rig with Smooth Mouse Movement
function CameraRig({ viewMode }: { viewMode: 'orbit' | 'satellite' }) {
  useFrame((state) => {
    const targetX = state.pointer.x * 0.7;
    const targetY = state.pointer.y * 0.5;

    if (viewMode === 'orbit') {
      state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, targetX, 0.04);
      state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, 1.8 + targetY, 0.04);
      state.camera.position.z = THREE.MathUtils.lerp(state.camera.position.z, 4.8, 0.04);
      state.camera.lookAt(0, 0, 0);
    } else {
      // Close up inspection
      state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, targetX * 0.5, 0.04);
      state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, 1.2, 0.04);
      state.camera.position.z = THREE.MathUtils.lerp(state.camera.position.z, 3.2, 0.04);
      state.camera.lookAt(0, 0, 0);
    }
  });

  return null;
}

export function MissionOrbit3DViewer({
  destination,
  missionName,
  targetOrbit = '550 km Sun-Synchronous Orbit'
}: MissionOrbit3DViewerProps) {
  const [viewMode, setViewMode] = useState<'orbit' | 'satellite'>('orbit');

  const renderBody = () => {
    switch (destination) {
      case 'EARTH':
        return <OrbitingEarth />;
      case 'MOON':
        return <OrbitingMoon />;
      case 'MARS':
        return <OrbitingMars />;
      default:
        return <OrbitingAsteroid />;
    }
  };

  return (
    <div className="relative w-full h-[400px] lg:h-[480px] rounded-3xl overflow-hidden bg-gradient-to-b from-space-950 via-space-900 to-space-950 border border-cyan-500/30 shadow-2xl group">
      {/* Three.js Canvas */}
      <Canvas
        camera={{ position: [0, 1.8, 4.8], fov: 45 }}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.35} />
        <directionalLight position={[6, 4, 5]} intensity={1.5} color="#ffffff" />
        <pointLight position={[-5, -3, -4]} intensity={0.4} color="#38bdf8" />
        <Starfield />
        {renderBody()}
        <OrbitingSatellite orbitRadius={2.4} orbitSpeed={0.7} />
        <CameraRig viewMode={viewMode} />
      </Canvas>

      {/* Top Left HUD Telemetry Badge */}
      <div className="absolute top-4 left-4 z-10 pointer-events-none flex flex-col gap-1.5">
        <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-space-950/85 backdrop-blur-md border border-cyan-500/40 text-cyan-300 shadow-lg">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span className="text-[11px] font-mono font-bold tracking-wider">
            LIVE 3D ORBITAL SIMULATION
          </span>
        </div>
        <div className="text-[10px] font-mono text-slate-400 bg-space-950/70 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-slate-800">
          TARGET BODY: <span className="text-white font-bold">{destination}</span> • {missionName}
        </div>
      </div>

      {/* Top Right View Mode Toggle */}
      <div className="absolute top-4 right-4 z-10 flex items-center space-x-2">
        <button
          type="button"
          onClick={() => setViewMode(viewMode === 'orbit' ? 'satellite' : 'orbit')}
          className="px-3 py-1.5 rounded-xl bg-space-900/90 backdrop-blur-md border border-slate-700 hover:border-cyan-400 text-xs font-mono text-slate-300 hover:text-white transition-all flex items-center space-x-1.5 shadow-md"
        >
          <RotateCw className="w-3.5 h-3.5 text-cyan-400" />
          <span>{viewMode === 'orbit' ? 'Zoom In' : 'Wide Orbit'}</span>
        </button>
      </div>

      {/* Bottom Telemetry HUD Bar */}
      <div className="absolute bottom-4 inset-x-4 z-10 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
        <div className="bg-space-950/85 backdrop-blur-md border border-slate-800/90 rounded-xl p-2.5">
          <div className="text-[10px] text-slate-400 flex items-center space-x-1">
            <Compass className="w-3 h-3 text-cyan-400" />
            <span>TRAJECTORY</span>
          </div>
          <div className="text-white font-bold truncate text-[11px] mt-0.5">{targetOrbit}</div>
        </div>

        <div className="bg-space-950/85 backdrop-blur-md border border-slate-800/90 rounded-xl p-2.5">
          <div className="text-[10px] text-slate-400 flex items-center space-x-1">
            <Eye className="w-3 h-3 text-emerald-400" />
            <span>ORBIT PERIOD</span>
          </div>
          <div className="text-emerald-400 font-bold text-[11px] mt-0.5">~94.8 MIN / REVOLUTION</div>
        </div>

        <div className="bg-space-950/85 backdrop-blur-md border border-slate-800/90 rounded-xl p-2.5">
          <div className="text-[10px] text-slate-400 flex items-center space-x-1">
            <Layers className="w-3 h-3 text-amber-400" />
            <span>SUNLIGHT / SHADOW</span>
          </div>
          <div className="text-amber-300 font-bold text-[11px] mt-0.5">62% SUN • 38% ECLIPSE</div>
        </div>

        <div className="bg-space-950/85 backdrop-blur-md border border-slate-800/90 rounded-xl p-2.5">
          <div className="text-[10px] text-slate-400 flex items-center space-x-1">
            <Shield className="w-3 h-3 text-purple-400" />
            <span>STATUS</span>
          </div>
          <div className="text-cyan-300 font-bold text-[11px] mt-0.5">READY FOR CRAFT BUILD</div>
        </div>
      </div>
    </div>
  );
}
