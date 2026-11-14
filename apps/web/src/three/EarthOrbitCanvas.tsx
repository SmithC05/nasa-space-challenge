import React, { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Line, OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { OrbitProfile } from '@orbital/contracts';

interface EarthOrbitCanvasProps {
  orbit: OrbitProfile;
  isLaunching?: boolean;
}

function EarthWithAtmosphere() {
  const earthRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (earthRef.current) {
      earthRef.current.rotation.y += delta * 0.05;
    }
  });

  return (
    <group>
      {/* Central Earth Globe */}
      <mesh ref={earthRef} castShadow receiveShadow>
        <sphereGeometry args={[2, 64, 64]} />
        <meshStandardMaterial
          color="#1e3a8a" // deep ocean blue
          roughness={0.6}
          metalness={0.1}
        />
      </mesh>

      {/* Continents overlay layer (procedural wireframe grid representing landmasses) */}
      <mesh>
        <sphereGeometry args={[2.01, 32, 32]} />
        <meshStandardMaterial
          color="#10b981" // green/emerald continents
          wireframe
          transparent
          opacity={0.15}
        />
      </mesh>

      {/* Atmospheric Glow Mesh */}
      <mesh>
        <sphereGeometry args={[2.14, 48, 48]} />
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

function OrbitPath({ orbit, isLaunching }: { orbit: OrbitProfile; isLaunching?: boolean }) {
  const satRef = useRef<THREE.Mesh>(null);
  const launchRocketRef = useRef<THREE.Group>(null);

  // Generate 3D ellipse points based on perigee and apogee scaled to Earth radius = 2 units
  const points = useMemo(() => {
    const scale = 2 / 6378; // 2 units = 6378 km
    const rp = 2 + orbit.perigeeKm * scale;
    const ra = 2 + orbit.apogeeKm * scale;
    const a = (rp + ra) / 2;
    const c = a - rp; // focal distance
    const b = Math.sqrt(Math.max(0.1, a * a - c * c));

    const pts: [number, number, number][] = [];
    const segments = 128;
    const incRad = (orbit.inclinationDeg * Math.PI) / 180;

    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      const xOrb = a * Math.cos(theta) - c;
      const zOrb = b * Math.sin(theta);

      // Rotate by inclination around X axis
      const y = zOrb * Math.sin(incRad);
      const z = zOrb * Math.cos(incRad);
      pts.push([xOrb, y, z]);
    }
    return pts;
  }, [orbit]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * 0.4;
    const idx = Math.floor((t % 1) * (points.length - 1));
    const nextPt = points[idx] || points[0];

    if (satRef.current) {
      satRef.current.position.set(nextPt[0], nextPt[1], nextPt[2]);
    }

    if (launchRocketRef.current) {
      if (isLaunching) {
        const launchPhase = (clock.getElapsedTime() * 0.8) % 4;
        const progress = Math.min(1, launchPhase / 3);
        const pt = points[Math.floor(progress * (points.length - 1))];
        launchRocketRef.current.position.set(
          THREE.MathUtils.lerp(0, pt[0], progress),
          THREE.MathUtils.lerp(2, pt[1], progress),
          THREE.MathUtils.lerp(0, pt[2], progress)
        );
      }
    }
  });

  return (
    <group>
      {/* Orbit Trajectory Line */}
      <Line
        points={points}
        color={orbit.type === 'TLI' ? '#f43f5e' : orbit.type === 'GTO' ? '#f59e0b' : '#38bdf8'}
        lineWidth={2}
        transparent
        opacity={0.85}
      />

      {/* Orbiting Spacecraft Marker */}
      <mesh ref={satRef}>
        <sphereGeometry args={[0.09, 16, 16]} />
        <meshBasicMaterial color="#38bdf8" />
        <pointLight color="#38bdf8" intensity={1} distance={1} />
      </mesh>

      {/* Animated Launch Rocket when launching */}
      {isLaunching && (
        <group ref={launchRocketRef}>
          <mesh>
            <coneGeometry args={[0.08, 0.35, 12]} />
            <meshStandardMaterial color="#f97316" emissive="#ea580c" emissiveIntensity={0.6} />
          </mesh>
          <pointLight color="#fb923c" intensity={2} distance={1.2} />
        </group>
      )}
    </group>
  );
}

export function EarthOrbitCanvas({ orbit, isLaunching = false }: EarthOrbitCanvasProps) {
  return (
    <div className="relative w-full h-[400px] lg:h-[480px] bg-space-950/95 rounded-2xl border border-slate-800/80 overflow-hidden shadow-2xl">
      <Canvas camera={{ position: [3.8, 3.2, 5.0], fov: 45 }}>
        <ambientLight intensity={0.25} />
        {/* Sun light shining from one direction creates authentic Earth day/night terminator */}
        <directionalLight position={[10, 5, 8]} intensity={2.2} />
        <pointLight position={[-8, -5, -8]} intensity={0.2} color="#1e3a8a" />

        <Stars radius={120} depth={60} count={4000} factor={4} saturation={0} fade speed={0.5} />
        <EarthWithAtmosphere />
        <OrbitPath orbit={orbit} isLaunching={isLaunching} />

        <OrbitControls enablePan={true} enableZoom={true} minDistance={2.6} maxDistance={12} />
      </Canvas>

      {/* Trajectory Stats HUD */}
      <div className="absolute top-4 left-4 z-10 flex flex-col space-y-1">
        <span className="px-2.5 py-1 text-xs font-mono font-medium rounded-md bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 w-fit">
          3D ORBITAL MECHANICS ENGINE
        </span>
        <div className="bg-space-900/90 border border-slate-800 rounded-lg p-2.5 text-xs font-mono space-y-1 backdrop-blur-sm">
          <div className="flex justify-between space-x-4 text-slate-300">
            <span className="text-slate-400">PROFILE:</span>
            <span className="text-cyan-400 font-bold">{orbit.name}</span>
          </div>
          <div className="flex justify-between space-x-4 text-slate-300">
            <span className="text-slate-400">PERIGEE / APOGEE:</span>
            <span>{orbit.perigeeKm} × {orbit.apogeeKm} km</span>
          </div>
          <div className="flex justify-between space-x-4 text-slate-300">
            <span className="text-slate-400">INCLINATION:</span>
            <span className="text-amber-400">{orbit.inclinationDeg}°</span>
          </div>
          <div className="flex justify-between space-x-4 text-slate-300">
            <span className="text-slate-400">PERIOD:</span>
            <span>{orbit.orbitalPeriodMin} min</span>
          </div>
        </div>
      </div>

      <div className="absolute bottom-3 right-4 z-10 text-[11px] font-mono text-slate-400 bg-space-900/80 px-2 py-1 rounded border border-slate-800 pointer-events-none">
        ROTATION: ORBITAL FRAME • EARTH AXIAL 23.5°
      </div>
    </div>
  );
}
