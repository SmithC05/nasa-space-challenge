import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { LaunchVehicle, SpacecraftDesign } from '@orbital/contracts';

interface Rocket3DModelProps {
  vehicle: LaunchVehicle;
  spacecraft: SpacecraftDesign;
  altitudeMeters: number;
  throttle: number; // 0.0 to 1.0
  isIgnited: boolean;
  boosterSeparated: boolean;
  boosterSeparationDist: number;
  fairingJettisoned: boolean;
  fairingOpenAngle: number;
  spacecraftSeparated: boolean;
  spacecraftSeparationDist: number;
  solarDeploymentProgress: number; // 0.0 (stowed) to 1.0 (deployed)
}

export function Rocket3DModel({
  vehicle,
  spacecraft,
  altitudeMeters,
  throttle,
  isIgnited,
  boosterSeparated,
  boosterSeparationDist,
  fairingJettisoned,
  fairingOpenAngle,
  spacecraftSeparated,
  spacecraftSeparationDist,
  solarDeploymentProgress
}: Rocket3DModelProps) {
  const isHeavy = vehicle.id.includes('heavy') && !vehicle.id.includes('superheavy');
  const isSuperHeavy = vehicle.id.includes('superheavy');
  const isLite = vehicle.id.includes('lite');

  // Dimensions based on vehicle class
  const coreRadius = isSuperHeavy ? 1.4 : isHeavy || !isLite ? 0.75 : 0.45;
  const boosterLength = isSuperHeavy ? 9.0 : isHeavy || !isLite ? 7.5 : 4.5;
  const upperStageLength = isSuperHeavy ? 5.5 : isHeavy || !isLite ? 3.8 : 2.2;
  const fairingLength = isSuperHeavy ? 4.8 : isHeavy || !isLite ? 3.2 : 2.0;

  // Particle plume refs
  const flameParticlesRef = useRef<THREE.Points>(null);
  const smokeParticlesRef = useRef<THREE.Points>(null);

  // Flame particle buffer
  const particleCount = 200;
  const [particlePositions, particleScales] = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    const scales = new Float32Array(particleCount);
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * coreRadius * 1.2;
      positions[i * 3 + 1] = -Math.random() * 4.0;
      positions[i * 3 + 2] = (Math.random() - 0.5) * coreRadius * 1.2;
      scales[i] = Math.random() * 0.4 + 0.1;
    }
    return [positions, scales];
  }, [coreRadius]);

  // Frame animation for flame flicker & smoke drift
  useFrame((_, delta) => {
    if (flameParticlesRef.current && isIgnited) {
      const positions = flameParticlesRef.current.geometry.attributes.position.array as Float32Array;
      const speed = Math.max(12, throttle * 28);
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3 + 1] -= delta * speed;
        if (positions[i * 3 + 1] < -6.0 * Math.max(0.2, throttle)) {
          positions[i * 3 + 1] = 0;
          positions[i * 3 + 0] = (Math.random() - 0.5) * coreRadius * 0.8;
          positions[i * 3 + 2] = (Math.random() - 0.5) * coreRadius * 0.8;
        }
      }
      flameParticlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <group position={[0, altitudeMeters, 0]}>
      {/* ============================================================== */}
      {/* 1. FIRST STAGE BOOSTER (Separates during Stage 6) */}
      {/* ============================================================== */}
      <group position={[0, -boosterSeparationDist, 0]}>
        {/* Center Booster Tank */}
        <mesh position={[0, boosterLength / 2, 0]} castShadow>
          <cylinderGeometry args={[coreRadius, coreRadius, boosterLength, 32]} />
          <meshStandardMaterial
            color={isSuperHeavy ? '#cbd5e1' : '#f8fafc'}
            metalness={isSuperHeavy ? 0.85 : 0.4}
            roughness={isSuperHeavy ? 0.2 : 0.3}
          />
        </mesh>

        {/* Livery Accent Stripe & Interstage Ring */}
        <mesh position={[0, boosterLength - 0.4, 0]}>
          <cylinderGeometry args={[coreRadius * 1.01, coreRadius * 1.01, 0.8, 32]} />
          <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.3} />
        </mesh>

        {/* Engine Base Heat Shield Dome */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[coreRadius, coreRadius * 0.9, 0.4, 32]} />
          <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.2} />
        </mesh>

        {/* Engine Bells */}
        <group position={[0, -0.3, 0]}>
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[coreRadius * 0.25, coreRadius * 0.45, 0.7, 16, 1, true]} />
            <meshStandardMaterial color="#475569" metalness={0.9} roughness={0.3} side={THREE.DoubleSide} />
          </mesh>
          {!isLite && (
            <>
              {[-0.35, 0.35].map((x) =>
                [-0.35, 0.35].map((z) => (
                  <mesh key={`eng-${x}-${z}`} position={[x * coreRadius, 0, z * coreRadius]}>
                    <cylinderGeometry args={[coreRadius * 0.15, coreRadius * 0.3, 0.6, 12, 1, true]} />
                    <meshStandardMaterial color="#475569" metalness={0.9} roughness={0.3} side={THREE.DoubleSide} />
                  </mesh>
                ))
              )}
            </>
          )}
        </group>

        {/* Side Boosters for ORBITAL-Heavy */}
        {isHeavy && (
          <>
            {/* Left Strap-on Core */}
            <group position={[-coreRadius * 2.1, 0, 0]}>
              <mesh position={[0, boosterLength / 2, 0]} castShadow>
                <cylinderGeometry args={[coreRadius, coreRadius, boosterLength, 32]} />
                <meshStandardMaterial color="#f8fafc" metalness={0.4} roughness={0.3} />
              </mesh>
              {/* Nose Cone */}
              <mesh position={[0, boosterLength + 0.9, 0]}>
                <coneGeometry args={[coreRadius, 1.8, 32]} />
                <meshStandardMaterial color="#0f172a" metalness={0.6} roughness={0.3} />
              </mesh>
            </group>

            {/* Right Strap-on Core */}
            <group position={[coreRadius * 2.1, 0, 0]}>
              <mesh position={[0, boosterLength / 2, 0]} castShadow>
                <cylinderGeometry args={[coreRadius, coreRadius, boosterLength, 32]} />
                <meshStandardMaterial color="#f8fafc" metalness={0.4} roughness={0.3} />
              </mesh>
              <mesh position={[0, boosterLength + 0.9, 0]}>
                <coneGeometry args={[coreRadius, 1.8, 32]} />
                <meshStandardMaterial color="#0f172a" metalness={0.6} roughness={0.3} />
              </mesh>
            </group>
          </>
        )}

        {/* Grid Fins (for reusable Core and Heavy) */}
        {!isLite && !isSuperHeavy && (
          <group position={[0, boosterLength - 1.0, 0]}>
            {[0, Math.PI / 2, Math.PI, (Math.PI * 3) / 2].map((angle, i) => (
              <mesh
                key={i}
                position={[Math.cos(angle) * (coreRadius + 0.2), 0, Math.sin(angle) * (coreRadius + 0.2)]}
                rotation={[0, -angle, 0]}
              >
                <boxGeometry args={[0.08, 0.35, 0.45]} />
                <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.2} />
              </mesh>
            ))}
          </group>
        )}

        {/* First Stage Exhaust Flame & Dynamic Light */}
        {isIgnited && !boosterSeparated && (
          <group position={[0, -0.6, 0]}>
            {/* Core engine flame cone */}
            <mesh position={[0, -1.8 * throttle, 0]}>
              <coneGeometry args={[coreRadius * 0.85, 3.8 * Math.max(0.4, throttle), 16]} />
              <meshBasicMaterial color="#f97316" transparent opacity={0.88} />
            </mesh>
            <mesh position={[0, -1.1 * throttle, 0]}>
              <coneGeometry args={[coreRadius * 0.45, 2.2 * Math.max(0.4, throttle), 16]} />
              <meshBasicMaterial color="#fef08a" transparent opacity={0.95} />
            </mesh>

            {/* Dynamic Launchpad / Rocket Glare Light */}
            <pointLight color="#f97316" intensity={8.0 * throttle} distance={25} />

            {/* Particle Flame Jets */}
            <points ref={flameParticlesRef}>
              <bufferGeometry>
                <bufferAttribute
                  attach="attributes-position"
                  args={[particlePositions, 3]}
                />
              </bufferGeometry>
              <pointsMaterial
                color="#fb923c"
                size={0.25}
                transparent
                opacity={0.7}
                blending={THREE.AdditiveBlending}
              />
            </points>
          </group>
        )}
      </group>

      {/* ============================================================== */}
      {/* 2. UPPER STAGE (Continues Ascent into Orbit) */}
      {/* ============================================================== */}
      <group position={[0, boosterLength, 0]}>
        {/* Upper Stage Tank */}
        <mesh position={[0, upperStageLength / 2, 0]} castShadow>
          <cylinderGeometry args={[coreRadius, coreRadius, upperStageLength, 32]} />
          <meshStandardMaterial
            color={isSuperHeavy ? '#cbd5e1' : '#f8fafc'}
            metalness={isSuperHeavy ? 0.85 : 0.3}
            roughness={0.3}
          />
        </mesh>

        {/* Upper Stage Vacuum Engine Bell */}
        <mesh position={[0, 0.2, 0]}>
          <cylinderGeometry args={[coreRadius * 0.3, coreRadius * 0.65, 0.9, 16, 1, true]} />
          <meshStandardMaterial color="#64748b" metalness={0.9} roughness={0.2} side={THREE.DoubleSide} />
        </mesh>

        {/* Upper Stage Vacuum Plume (Ignites after Booster Separation) */}
        {boosterSeparated && !spacecraftSeparated && (
          <group position={[0, -0.6, 0]}>
            <mesh position={[0, -1.2, 0]}>
              <coneGeometry args={[coreRadius * 0.8, 2.5, 16]} />
              <meshBasicMaterial color="#38bdf8" transparent opacity={0.75} />
            </mesh>
            <pointLight color="#0284c7" intensity={5} distance={15} />
          </group>
        )}

        {/* ============================================================== */}
        {/* 3. PAYLOAD FAIRING HALVES & ENCAPSULATED SPACECRAFT */}
        {/* ============================================================== */}
        <group position={[0, upperStageLength, 0]}>
          {/* Internal Payload Spacecraft (Inside Fairing, then deploys) */}
          <group position={[0, 0.8 + spacecraftSeparationDist, 0]}>
            {/* Spacecraft Bus Chassis */}
            <mesh position={[0, 0.4, 0]} castShadow>
              <boxGeometry args={[coreRadius * 0.9, coreRadius * 1.1, coreRadius * 0.9]} />
              <meshStandardMaterial color="#d97706" metalness={0.88} roughness={0.2} />
            </mesh>

            {/* Comm Dish */}
            <mesh position={[0, 1.1, 0.3]} rotation={[0.4, 0, 0]}>
              <sphereGeometry args={[coreRadius * 0.35, 16, 8, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
              <meshStandardMaterial color="#f8fafc" metalness={0.5} roughness={0.3} side={THREE.DoubleSide} />
            </mesh>

            {/* Solar Panel Wings (Folded -> Deploying -> Unfolded) */}
            <group position={[0, 0.4, 0]}>
              {/* Left Wing */}
              <group
                position={[-coreRadius * 0.48, 0, 0]}
                rotation={[0, 0, (1 - solarDeploymentProgress) * Math.PI * 0.48]}
              >
                <mesh position={[-coreRadius * 0.8 * solarDeploymentProgress, 0, 0]}>
                  <boxGeometry args={[coreRadius * 1.6 * Math.max(0.2, solarDeploymentProgress), 0.04, coreRadius * 0.7]} />
                  <meshStandardMaterial color="#1e3a8a" metalness={0.6} roughness={0.25} />
                </mesh>
              </group>

              {/* Right Wing */}
              <group
                position={[coreRadius * 0.48, 0, 0]}
                rotation={[0, 0, -(1 - solarDeploymentProgress) * Math.PI * 0.48]}
              >
                <mesh position={[coreRadius * 0.8 * solarDeploymentProgress, 0, 0]}>
                  <boxGeometry args={[coreRadius * 1.6 * Math.max(0.2, solarDeploymentProgress), 0.04, coreRadius * 0.7]} />
                  <meshStandardMaterial color="#1e3a8a" metalness={0.6} roughness={0.25} />
                </mesh>
              </group>
            </group>
          </group>

          {/* Left Fairing Half */}
          <group
            position={[-fairingOpenAngle * 1.5, 0, 0]}
            rotation={[0, 0, -fairingOpenAngle]}
          >
            <mesh position={[0, fairingLength / 2, 0]} castShadow>
              <cylinderGeometry
                args={[coreRadius * 1.05, coreRadius * 1.05, fairingLength, 16, 1, false, Math.PI / 2, Math.PI]}
              />
              <meshStandardMaterial color="#f1f5f9" metalness={0.3} roughness={0.3} side={THREE.DoubleSide} />
            </mesh>
            {/* Fairing Nose Cone Half */}
            <mesh position={[0, fairingLength + 0.6, 0]}>
              <coneGeometry args={[coreRadius * 1.05, 1.2, 16, 1, false, Math.PI / 2, Math.PI]} />
              <meshStandardMaterial color="#f1f5f9" metalness={0.3} roughness={0.3} side={THREE.DoubleSide} />
            </mesh>
          </group>

          {/* Right Fairing Half */}
          <group
            position={[fairingOpenAngle * 1.5, 0, 0]}
            rotation={[0, 0, fairingOpenAngle]}
          >
            <mesh position={[0, fairingLength / 2, 0]} castShadow>
              <cylinderGeometry
                args={[coreRadius * 1.05, coreRadius * 1.05, fairingLength, 16, 1, false, -Math.PI / 2, Math.PI]}
              />
              <meshStandardMaterial color="#f1f5f9" metalness={0.3} roughness={0.3} side={THREE.DoubleSide} />
            </mesh>
            {/* Fairing Nose Cone Half */}
            <mesh position={[0, fairingLength + 0.6, 0]}>
              <coneGeometry args={[coreRadius * 1.05, 1.2, 16, 1, false, -Math.PI / 2, Math.PI]} />
              <meshStandardMaterial color="#f1f5f9" metalness={0.3} roughness={0.3} side={THREE.DoubleSide} />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  );
}
