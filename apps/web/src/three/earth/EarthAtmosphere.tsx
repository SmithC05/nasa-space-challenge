import React from 'react';
import * as THREE from 'three';

interface EarthAtmosphereProps {
  visible?: boolean;
}

export function EarthAtmosphere({ visible = true }: EarthAtmosphereProps) {
  if (!visible) return null;

  return (
    <group>
      {/* 1. Troposphere/Stratosphere Haze (Forward Side) */}
      <mesh>
        <sphereGeometry args={[2.015, 64, 64]} />
        <meshBasicMaterial
          color="#38bdf8"
          transparent
          opacity={0.08}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* 2. Primary Atmospheric Limb / Rayleigh Scattering Rim (Back Side) */}
      <mesh>
        <sphereGeometry args={[2.075, 64, 64]} />
        <meshBasicMaterial
          color="#0284c7"
          side={THREE.BackSide}
          transparent
          opacity={0.32}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* 3. Subtle Outer Exosphere Diffuse Halo (Back Side) */}
      <mesh>
        <sphereGeometry args={[2.14, 48, 48]} />
        <meshBasicMaterial
          color="#1d4ed8"
          side={THREE.BackSide}
          transparent
          opacity={0.14}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
