import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// -------------------------------------------------------------
// 1. Pure Three.js Cosmic Starfield (Ultra-fast, zero-dependency)
// -------------------------------------------------------------
function Starfield({ count = 2000 }: { count?: number }) {
  const points = useMemo(() => {
    const coords = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i += 3) {
      coords[i] = (Math.random() - 0.5) * 40;
      coords[i + 1] = (Math.random() - 0.5) * 40;
      coords[i + 2] = -5 - Math.random() * 25; // distribute in background
    }
    return coords;
  }, [count]);

  const starRef = useRef<THREE.Points>(null);

  useFrame((_, delta) => {
    if (starRef.current) {
      starRef.current.rotation.y += delta * 0.005;
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
        size={0.08}
        color="#e0f2fe"
        transparent
        opacity={0.85}
        sizeAttenuation
      />
    </points>
  );
}

// -------------------------------------------------------------
// 2. Realistic 3D Earth Globe with Atmosphere & Cloud Layers
// -------------------------------------------------------------
function RealisticEarth() {
  const earthRef = useRef<THREE.Mesh>(null);
  const continentsRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (earthRef.current) {
      earthRef.current.rotation.y += delta * 0.03;
    }
    if (continentsRef.current) {
      continentsRef.current.rotation.y += delta * 0.03;
    }
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += delta * 0.045;
    }
  });

  return (
    <group position={[1.8, -0.2, 0]}>
      {/* Deep Ocean Blue Globe */}
      <mesh ref={earthRef}>
        <sphereGeometry args={[2.2, 64, 64]} />
        <meshStandardMaterial
          color="#0d2552"
          roughness={0.3}
          metalness={0.2}
        />
      </mesh>

      {/* Continents Wireframe Landmass Layer */}
      <mesh ref={continentsRef}>
        <sphereGeometry args={[2.208, 40, 40]} />
        <meshStandardMaterial
          color="#10b981"
          wireframe
          transparent
          opacity={0.25}
        />
      </mesh>

      {/* Swirling Atmospheric Cloud Mesh */}
      <mesh ref={cloudsRef}>
        <sphereGeometry args={[2.24, 48, 48]} />
        <meshStandardMaterial
          color="#e0f2fe"
          transparent
          opacity={0.15}
          wireframe
        />
      </mesh>

      {/* Atmospheric Rim Glow */}
      <mesh>
        <sphereGeometry args={[2.35, 48, 48]} />
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

// -------------------------------------------------------------
// 3. Orbiting Scientific Satellite with Solar Panels
// -------------------------------------------------------------
function OrbitingSatellite() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      const t = clock.getElapsedTime() * 0.4;
      const radiusX = 3.6;
      const radiusZ = 3.4;
      const x = 1.8 + Math.cos(t) * radiusX;
      const y = -0.2 + Math.sin(t * 1.2) * 1.1;
      const z = Math.sin(t) * radiusZ;
      groupRef.current.position.set(x, y, z);
      groupRef.current.rotation.y = -t + Math.PI / 2;
    }
  });

  return (
    <group ref={groupRef} scale={[0.35, 0.35, 0.35]}>
      {/* Central Satellite Body (Gold Foil) */}
      <mesh>
        <boxGeometry args={[0.9, 0.9, 1.3]} />
        <meshStandardMaterial color="#f59e0b" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Left Blue Solar Wing */}
      <mesh position={[-1.7, 0, 0]}>
        <boxGeometry args={[2.4, 0.05, 0.9]} />
        <meshStandardMaterial color="#1e40af" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Right Blue Solar Wing */}
      <mesh position={[1.7, 0, 0]}>
        <boxGeometry args={[2.4, 0.05, 0.9]} />
        <meshStandardMaterial color="#1e40af" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Communications Antenna Dish */}
      <mesh position={[0, 0.6, 0.5]} rotation={[Math.PI / 4, 0, 0]}>
        <coneGeometry args={[0.5, 0.3, 16, 1, true]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.6} roughness={0.3} side={THREE.DoubleSide} />
      </mesh>

      {/* Optical Science Sensor */}
      <mesh position={[0, -0.5, 0]}>
        <cylinderGeometry args={[0.2, 0.25, 0.4, 16]} />
        <meshStandardMaterial color="#38bdf8" metalness={0.5} roughness={0.2} />
      </mesh>
    </group>
  );
}

// -------------------------------------------------------------
// 4. Smooth Mouse Parallax Camera Rig
// -------------------------------------------------------------
function CameraRig() {
  useFrame(({ pointer, camera }) => {
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, pointer.x * 0.8, 0.03);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, pointer.y * 0.4, 0.03);
    camera.lookAt(0.6, 0, 0);
  });

  return null;
}

// -------------------------------------------------------------
// 5. Main 3D Canvas Assembly
// -------------------------------------------------------------
export function Landing3DCanvas() {
  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden">
      <Canvas
        camera={{ position: [0, 0, 7.2], fov: 46 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <color attach="background" args={['#030712']} />

        {/* Space Sunlight Lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[-6, 4, 6]} intensity={2.5} color="#ffffff" />
        <pointLight position={[3, -2, 2]} intensity={0.9} color="#38bdf8" />

        {/* 3D Scene Elements */}
        <Starfield count={2200} />
        <RealisticEarth />
        <OrbitingSatellite />

        {/* Mouse Parallax Effect */}
        <CameraRig />
      </Canvas>
    </div>
  );
}
