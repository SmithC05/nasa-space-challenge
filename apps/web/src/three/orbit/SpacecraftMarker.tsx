import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { OrbitProfile } from '@orbital/contracts';
import {
  generateOrbitPoints,
  getOrbitPointAtProgress,
  getOrbitTangentAtProgress
} from './geometry';
import { getOrbitColorForProfile } from './types';

interface SpacecraftMarkerProps {
  orbit: OrbitProfile;
  visible?: boolean;
  isAnimating?: boolean;
  speedMultiplier?: number;
  resetTrigger?: number;
}

export function SpacecraftMarker({
  orbit,
  visible = true,
  isAnimating = true,
  speedMultiplier = 1.0,
  resetTrigger = 0
}: SpacecraftMarkerProps) {
  const groupRef = useRef<THREE.Group>(null);
  const beaconRef = useRef<THREE.PointLight>(null);
  const progressRef = useRef(0);
  const lastResetRef = useRef(resetTrigger);

  // Generate orbit path points
  const points = useMemo(() => generateOrbitPoints(orbit, 160), [orbit]);
  const orbitColor = getOrbitColorForProfile(orbit);

  // Handle position reset when trigger updates
  if (resetTrigger !== lastResetRef.current) {
    lastResetRef.current = resetTrigger;
    progressRef.current = 0;
  }

  // Animation loop attached to Three.js clock
  useFrame((_, delta) => {
    if (!visible || !groupRef.current) return;

    if (isAnimating) {
      // Scale speed based on real orbital period (LEO ~92m completes faster than GEO ~24h)
      // Visual base speed: 1 orbit per 25 seconds for LEO, scaled down for GEO
      const orbitalPeriodMin = Math.max(80, orbit.orbitalPeriodMin ?? 92.8);
      const periodFactor = 92.8 / orbitalPeriodMin;
      const rate = 0.04 * periodFactor * speedMultiplier;

      progressRef.current = (progressRef.current + delta * rate) % 1;
    }

    const [px, py, pz] = getOrbitPointAtProgress(points, progressRef.current);
    groupRef.current.position.set(px, py, pz);

    // Compute velocity tangent and orient satellite towards motion direction
    const [tx, ty, tz] = getOrbitTangentAtProgress(points, progressRef.current);
    const targetPoint = new THREE.Vector3(px + tx, py + ty, pz + tz);
    groupRef.current.lookAt(targetPoint);

    // Gentle pulsing on telemetry beacon
    if (beaconRef.current) {
      beaconRef.current.intensity = 1.2 + Math.sin(Date.now() * 0.005) * 0.4;
    }
  });

  if (!visible) return null;

  return (
    <group ref={groupRef}>
      {/* ================================================================= */}
      {/* PROCEDURAL DETAILED SATELLITE MODEL */}
      {/* ================================================================= */}

      {/* 1. Main Cubical Avionics Bus (Gold Multi-Layer Insulation Foil) */}
      <mesh castShadow>
        <boxGeometry args={[0.07, 0.07, 0.09]} />
        <meshStandardMaterial
          color="#d4af37" // Metallic Gold MLI
          metalness={0.9}
          roughness={0.2}
        />
      </mesh>

      {/* 2. Dual Photovoltaic Solar Array Wings (Port & Starboard) */}
      {/* Left Wing */}
      <mesh position={[-0.13, 0, 0]}>
        <boxGeometry args={[0.15, 0.004, 0.06]} />
        <meshStandardMaterial
          color="#1e3a8a" // Deep Blue Solar Cells
          metalness={0.8}
          roughness={0.15}
        />
      </mesh>
      {/* Right Wing */}
      <mesh position={[0.13, 0, 0]}>
        <boxGeometry args={[0.15, 0.004, 0.06]} />
        <meshStandardMaterial
          color="#1e3a8a"
          metalness={0.8}
          roughness={0.15}
        />
      </mesh>

      {/* 3. Parabolic Communications Dish (Nadir/Earth pointing) */}
      <mesh position={[0, -0.05, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.04, 0.008, 0.015, 12]} />
        <meshStandardMaterial color="#f8fafc" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* 4. Apogee / RCS Propulsion Thruster Nozzle */}
      <mesh position={[0, 0, -0.055]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.018, 0.025, 8]} />
        <meshStandardMaterial color="#475569" metalness={0.9} roughness={0.4} />
      </mesh>

      {/* 5. Telemetry Status Beacon Light */}
      <mesh position={[0, 0.045, 0]}>
        <sphereGeometry args={[0.012, 8, 8]} />
        <meshBasicMaterial color={orbitColor} />
      </mesh>
      <pointLight ref={beaconRef} color={orbitColor} distance={0.6} intensity={1.5} />
    </group>
  );
}
