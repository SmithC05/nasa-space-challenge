import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface Planet3DViewerProps {
  destination: 'EARTH' | 'MOON' | 'MARS' | 'DEEP SPACE';
}

// -------------------------------------------------------------
// 1. 3D Earth: Oceans, Landmass, Clouds, and Ozone Rim
// -------------------------------------------------------------
function EarthMesh() {
  const earthRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (earthRef.current) earthRef.current.rotation.y += delta * 0.25;
    if (cloudsRef.current) cloudsRef.current.rotation.y += delta * 0.35;
  });

  return (
    <group>
      <mesh ref={earthRef}>
        <sphereGeometry args={[1.6, 48, 48]} />
        <meshStandardMaterial color="#0d2b63" roughness={0.3} metalness={0.2} />
      </mesh>
      {/* Landmass continents */}
      <mesh>
        <sphereGeometry args={[1.605, 32, 32]} />
        <meshStandardMaterial color="#10b981" wireframe transparent opacity={0.3} />
      </mesh>
      {/* Cloud layer */}
      <mesh ref={cloudsRef}>
        <sphereGeometry args={[1.63, 36, 36]} />
        <meshStandardMaterial color="#e0f2fe" wireframe transparent opacity={0.2} />
      </mesh>
      {/* Atmospheric Rim Glow */}
      <mesh>
        <sphereGeometry args={[1.72, 36, 36]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.15} side={THREE.BackSide} />
      </mesh>
    </group>
  );
}

// -------------------------------------------------------------
// 2. 3D Moon: Cratered Grey Regolith & High Contrast Shadows
// -------------------------------------------------------------
function MoonMesh() {
  const moonRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (moonRef.current) moonRef.current.rotation.y += delta * 0.18;
  });

  return (
    <group>
      <mesh ref={moonRef}>
        <sphereGeometry args={[1.6, 48, 48]} />
        <meshStandardMaterial color="#94a3b8" roughness={0.9} metalness={0.05} />
      </mesh>
      {/* Procedural Crater Wireframe / Relief Layer */}
      <mesh>
        <sphereGeometry args={[1.604, 28, 28]} />
        <meshStandardMaterial color="#475569" wireframe transparent opacity={0.35} />
      </mesh>
    </group>
  );
}

// -------------------------------------------------------------
// 3. 3D Mars: Rust-Red Deserts & White Polar Ice Caps
// -------------------------------------------------------------
function MarsMesh() {
  const marsRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (marsRef.current) marsRef.current.rotation.y += delta * 0.22;
  });

  return (
    <group>
      <mesh ref={marsRef}>
        <sphereGeometry args={[1.6, 48, 48]} />
        <meshStandardMaterial color="#c2410c" roughness={0.8} metalness={0.1} />
      </mesh>
      {/* Martian canyons and geological elevation mesh */}
      <mesh>
        <sphereGeometry args={[1.604, 32, 32]} />
        <meshStandardMaterial color="#7c2d12" wireframe transparent opacity={0.4} />
      </mesh>
      {/* North Polar Ice Cap */}
      <mesh position={[0, 1.56, 0]}>
        <cylinderGeometry args={[0.4, 0.45, 0.1, 24]} />
        <meshStandardMaterial color="#ffffff" roughness={0.3} />
      </mesh>
      {/* Thin Dust Atmosphere */}
      <mesh>
        <sphereGeometry args={[1.68, 36, 36]} />
        <meshBasicMaterial color="#fb923c" transparent opacity={0.12} side={THREE.BackSide} />
      </mesh>
    </group>
  );
}

// -------------------------------------------------------------
// 4. 3D Asteroid: Tumbling Irregular Rubble-Pile Rock
// -------------------------------------------------------------
function AsteroidMesh() {
  const asteroidRef = useRef<THREE.Mesh>(null);
  const debrisRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (asteroidRef.current) {
      asteroidRef.current.rotation.x += delta * 0.3;
      asteroidRef.current.rotation.y += delta * 0.45;
      asteroidRef.current.rotation.z += delta * 0.15;
    }
    if (debrisRef.current) {
      debrisRef.current.rotation.y -= delta * 0.2;
    }
  });

  return (
    <group>
      {/* Main Asteroid Body (Irregular polyhedron with metallic rock shading) */}
      <mesh ref={asteroidRef} scale={[1.7, 1.25, 1.4]}>
        <dodecahedronGeometry args={[1, 1]} />
        <meshStandardMaterial
          color="#52525b"
          roughness={0.9}
          metalness={0.4}
          flatShading
        />
      </mesh>

      {/* Orbiting micrometeoroid fragments */}
      <group ref={debrisRef}>
        <mesh position={[2.2, 0.4, 0.5]} scale={[0.15, 0.1, 0.12]}>
          <dodecahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color="#71717a" flatShading />
        </mesh>
        <mesh position={[-2, -0.6, 0.8]} scale={[0.18, 0.14, 0.15]}>
          <dodecahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color="#71717a" flatShading />
        </mesh>
        <mesh position={[0.5, 1.8, -1.2]} scale={[0.12, 0.12, 0.1]}>
          <dodecahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color="#a1a1aa" flatShading />
        </mesh>
      </group>
    </group>
  );
}

// -------------------------------------------------------------
// 5. Interactive Mouse Drag / Tilt Rig
// -------------------------------------------------------------
function InteractiveRig() {
  useFrame(({ pointer, camera }) => {
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, pointer.x * 0.6, 0.05);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, pointer.y * 0.4, 0.05);
    camera.lookAt(0, 0, 0);
  });

  return null;
}

// -------------------------------------------------------------
// 6. Main Planet3DViewer Canvas
// -------------------------------------------------------------
export function Planet3DViewer({ destination }: Planet3DViewerProps) {
  return (
    <div className="relative w-full h-56 sm:h-64 rounded-2xl overflow-hidden bg-space-950 border border-cyan-500/30 shadow-inner">
      <Canvas
        camera={{ position: [0, 0, 4.6], fov: 45 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[4, 3, 4]} intensity={2.2} color="#ffffff" />
        <pointLight position={[-3, -2, -2]} intensity={0.5} color="#38bdf8" />

        {destination === 'EARTH' && <EarthMesh />}
        {destination === 'MOON' && <MoonMesh />}
        {destination === 'MARS' && <MarsMesh />}
        {destination === 'DEEP SPACE' && <AsteroidMesh />}

        <InteractiveRig />
      </Canvas>

      {/* Floating 3D interactive badge */}
      <div className="absolute top-2.5 right-3 px-2 py-0.5 rounded bg-space-950/80 border border-cyan-500/40 text-[10px] font-mono text-cyan-300 backdrop-blur-md flex items-center space-x-1">
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
        <span>INTERACTIVE 3D {destination}</span>
      </div>
      <div className="absolute bottom-2.5 left-3 text-[10px] font-mono text-slate-400 bg-space-950/80 px-2 py-0.5 rounded border border-slate-800 backdrop-blur-md">
        Move mouse to tilt & inspect
      </div>
    </div>
  );
}

