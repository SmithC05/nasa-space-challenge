import React, { useMemo } from 'react';
import * as THREE from 'three';

interface LaunchPadEnvironment3DProps {
  altitudeKm: number; // 0 km to 200+ km
  isIgnited: boolean;
  smokeIntensity: number; // 0 to 1
}

export function LaunchPadEnvironment3D({ altitudeKm, isIgnited, smokeIntensity }: LaunchPadEnvironment3DProps) {
  // Atmosphere color interpolation:
  // 0 km: Sky daylight blue #1e3a8a / #38bdf8
  // 25 km: Deep stratospheric indigo #0f172a
  // 80+ km: Pitch black space #020617
  const skyColor = useMemo(() => {
    if (altitudeKm < 15) {
      return '#0f2744';
    } else if (altitudeKm < 45) {
      return '#09152b';
    } else if (altitudeKm < 85) {
      return '#030712';
    }
    return '#000000';
  }, [altitudeKm]);

  // Launch pad remains visible within lower atmosphere
  const showGround = altitudeKm < 40;
  const groundOpacity = Math.max(0, 1 - altitudeKm / 35);

  return (
    <group>
      {/* Sky Ambient / Atmospheric Fill */}
      <color attach="background" args={[skyColor]} />
      <fog attach="fog" args={[skyColor, 15, Math.max(50, 450 - altitudeKm * 4)]} />

      {/* Terrestrial Ground & Launch Pad Infrastructure */}
      {showGround && (
        <group position={[0, -0.2, 0]}>
          {/* Concrete Pad Foundation */}
          <mesh receiveShadow position={[0, -0.4, 0]}>
            <cylinderGeometry args={[25, 28, 0.8, 32]} />
            <meshStandardMaterial
              color="#334155"
              metalness={0.2}
              roughness={0.8}
              transparent
              opacity={groundOpacity}
            />
          </mesh>

          {/* Flame Trench Below Pad */}
          <mesh position={[0, -1.2, 0]}>
            <boxGeometry args={[6, 1.8, 18]} />
            <meshStandardMaterial color="#0f172a" metalness={0.4} roughness={0.9} />
          </mesh>

          {/* Surrounding Cape Canaveral / Vandenberg Coastline Terrain */}
          <mesh receiveShadow position={[0, -1.0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[500, 500]} />
            <meshStandardMaterial
              color="#0d2818"
              roughness={0.95}
              metalness={0.1}
              transparent
              opacity={groundOpacity}
            />
          </mesh>

          {/* Launch Service Tower / Umbilical Gantry */}
          <group position={[5.5, 7.5, 0]}>
            {/* Main Tower Truss */}
            <mesh castShadow position={[0, 0, 0]}>
              <boxGeometry args={[2.4, 16, 2.4]} />
              <meshStandardMaterial color="#b91c1c" metalness={0.6} roughness={0.4} />
            </mesh>

            {/* Umbilical Swing Arms */}
            <mesh position={[-2.2, 3.5, 0]}>
              <boxGeometry args={[2.5, 0.4, 0.4]} />
              <meshStandardMaterial color="#64748b" metalness={0.8} roughness={0.3} />
            </mesh>
            <mesh position={[-2.2, -1.5, 0]}>
              <boxGeometry args={[2.5, 0.4, 0.4]} />
              <meshStandardMaterial color="#64748b" metalness={0.8} roughness={0.3} />
            </mesh>

            {/* Lightning Mast on top */}
            <mesh position={[0, 9.5, 0]}>
              <cylinderGeometry args={[0.05, 0.15, 3.5, 8]} />
              <meshStandardMaterial color="#94a3b8" metalness={0.9} />
            </mesh>
          </group>

          {/* Deluge Water Steam Clouds (during ignition) */}
          {isIgnited && smokeIntensity > 0 && (
            <group position={[0, -0.4, 0]}>
              {[-3.5, 3.5, -5.5, 5.5].map((pos, idx) => (
                <mesh key={idx} position={[pos * smokeIntensity, 0.8 * smokeIntensity, (idx % 2 === 0 ? 3 : -3) * smokeIntensity]}>
                  <sphereGeometry args={[2.2 * Math.max(0.4, smokeIntensity), 12, 8]} />
                  <meshStandardMaterial
                    color="#e2e8f0"
                    transparent
                    opacity={0.65 * smokeIntensity}
                    roughness={1}
                  />
                </mesh>
              ))}
            </group>
          )}
        </group>
      )}

      {/* Celestial Deep Space Stars (Fade in as altitude increases) */}
      {altitudeKm > 20 && (
        <group>
          <points>
            <sphereGeometry args={[180, 24, 24]} />
            <pointsMaterial
              color="#ffffff"
              size={1.2}
              sizeAttenuation={false}
              transparent
              opacity={Math.min(1.0, (altitudeKm - 20) / 40)}
            />
          </points>
        </group>
      )}

      {/* Curved Earth Horizon in High-Altitude Ascent / Orbit Insertion */}
      {altitudeKm > 60 && (
        <group position={[0, -180, -40]}>
          <mesh receiveShadow>
            <sphereGeometry args={[170, 64, 32]} />
            <meshStandardMaterial
              color="#0284c7"
              roughness={0.6}
              metalness={0.2}
            />
          </mesh>
          {/* Atmospheric Limb Glow */}
          <mesh>
            <sphereGeometry args={[172, 64, 32]} />
            <meshStandardMaterial
              color="#38bdf8"
              transparent
              opacity={0.35}
              side={THREE.BackSide}
            />
          </mesh>
        </group>
      )}
    </group>
  );
}
