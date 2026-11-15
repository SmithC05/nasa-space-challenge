import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface AsteroidItem {
  id: number;
  initialPos: [number, number, number];
  rotSpeed: [number, number, number];
  driftSpeed: number;
  scale: [number, number, number];
}

// -------------------------------------------------------------
// 1. Drifting & Tumbling 3D Asteroid Field
// -------------------------------------------------------------
function AsteroidCluster() {
  const groupRef = useRef<THREE.Group>(null);

  // Generate 8 distinct 3D asteroids with varied shapes, scales, and orbits
  const asteroids: AsteroidItem[] = useMemo(() => [
    { id: 1, initialPos: [-5, 2.5, -2], rotSpeed: [0.2, 0.3, 0.1], driftSpeed: 0.15, scale: [0.65, 0.5, 0.6] },
    { id: 2, initialPos: [5.5, 1.8, -3], rotSpeed: [0.15, 0.25, 0.3], driftSpeed: 0.1, scale: [0.8, 0.6, 0.7] },
    { id: 3, initialPos: [-4.2, -2.8, -1.5], rotSpeed: [0.3, 0.15, 0.2], driftSpeed: 0.18, scale: [0.55, 0.45, 0.5] },
    { id: 4, initialPos: [4.8, -3.2, -2], rotSpeed: [0.25, 0.2, 0.35], driftSpeed: 0.12, scale: [0.75, 0.6, 0.65] },
    { id: 5, initialPos: [0.5, 3.8, -4], rotSpeed: [0.1, 0.2, 0.15], driftSpeed: 0.08, scale: [0.5, 0.4, 0.45] },
    { id: 6, initialPos: [-2.5, -3.8, -3.5], rotSpeed: [0.22, 0.18, 0.3], driftSpeed: 0.14, scale: [0.45, 0.35, 0.4] },
    { id: 7, initialPos: [6.2, -0.5, -4.5], rotSpeed: [0.18, 0.3, 0.22], driftSpeed: 0.09, scale: [0.9, 0.7, 0.8] },
    { id: 8, initialPos: [-6.5, 0.2, -5], rotSpeed: [0.25, 0.15, 0.2], driftSpeed: 0.11, scale: [0.85, 0.65, 0.7] }
  ], []);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      const elapsed = clock.getElapsedTime();
      groupRef.current.children.forEach((child, i) => {
        const item = asteroids[i];
        if (item) {
          // Continuous 3-axis tumbling rotation
          child.rotation.x += item.rotSpeed[0] * 0.02;
          child.rotation.y += item.rotSpeed[1] * 0.025;
          child.rotation.z += item.rotSpeed[2] * 0.015;

          // Gentle floating sine drift in 3D space
          child.position.y = item.initialPos[1] + Math.sin(elapsed * item.driftSpeed + item.id) * 0.4;
          child.position.x = item.initialPos[0] + Math.cos(elapsed * item.driftSpeed * 0.8 + item.id) * 0.3;
        }
      });
    }
  });

  return (
    <group ref={groupRef}>
      {asteroids.map((ast) => (
        <mesh
          key={ast.id}
          position={ast.initialPos}
          scale={ast.scale}
        >
          <dodecahedronGeometry args={[1, 1]} />
          <meshStandardMaterial
            color="#475569"
            roughness={0.9}
            metalness={0.3}
            flatShading
          />
        </mesh>
      ))}
    </group>
  );
}

// -------------------------------------------------------------
// 2. Deep Space Starfield
// -------------------------------------------------------------
function Starfield({ count = 1800 }: { count?: number }) {
  const points = useMemo(() => {
    const coords = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i += 3) {
      coords[i] = (Math.random() - 0.5) * 45;
      coords[i + 1] = (Math.random() - 0.5) * 45;
      coords[i + 2] = -4 - Math.random() * 20;
    }
    return coords;
  }, [count]);

  const starRef = useRef<THREE.Points>(null);

  useFrame((_, delta) => {
    if (starRef.current) {
      starRef.current.rotation.y += delta * 0.004;
    }
  });

  return (
    <points ref={starRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[points, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.07}
        color="#bae6fd"
        transparent
        opacity={0.8}
        sizeAttenuation
      />
    </points>
  );
}

// -------------------------------------------------------------
// 3. Mouse Parallax Camera Rig
// -------------------------------------------------------------
function CameraRig() {
  useFrame(({ pointer, camera }) => {
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, pointer.x * 0.9, 0.04);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, pointer.y * 0.5, 0.04);
    camera.lookAt(0, 0, 0);
  });

  return null;
}

// -------------------------------------------------------------
// 4. Main Selection 3D Canvas Assembly
// -------------------------------------------------------------
export function Selection3DBackground() {
  return (
    <div className="fixed inset-0 w-full h-full pointer-events-none -z-10 overflow-hidden">
      <Canvas
        camera={{ position: [0, 0, 7], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        {/* Space Lighting */}
        <ambientLight intensity={0.4} />
        <directionalLight position={[-5, 5, 5]} intensity={2.4} color="#ffffff" />
        <pointLight position={[4, -3, 3]} intensity={0.7} color="#38bdf8" />

        {/* Starfield & Floating Asteroids */}
        <Starfield count={1800} />
        <AsteroidCluster />

        {/* Mouse Parallax */}
        <CameraRig />
      </Canvas>
    </div>
  );
}

