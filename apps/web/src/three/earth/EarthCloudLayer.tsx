import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { loadEarthCloudTexture } from './textures';

interface EarthCloudLayerProps {
  visible?: boolean;
  isRotating?: boolean;
}

const AXIAL_TILT_RAD = (23.44 * Math.PI) / 180;

export function EarthCloudLayer({ visible = true, isRotating = true }: EarthCloudLayerProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const cloudTexture = useMemo(() => loadEarthCloudTexture(), []);

  useFrame((_, delta) => {
    if (meshRef.current && isRotating) {
      // Atmospheric zonal winds cause clouds to drift slightly faster than the planetary crust
      meshRef.current.rotation.y += delta * 0.046;
    }
  });

  if (!visible) return null;

  return (
    <group rotation={[0, 0, AXIAL_TILT_RAD]}>
      <mesh ref={meshRef}>
        {/* Radius 2.025 placed safely above the Earth surface (radius 2.0) to prevent z-fighting */}
        <sphereGeometry args={[2.025, 64, 64]} />
        <meshStandardMaterial
          map={cloudTexture}
          transparent
          opacity={0.82}
          blending={THREE.NormalBlending}
          depthWrite={false}
          roughness={0.95}
          metalness={0.0}
        />
      </mesh>
    </group>
  );
}
