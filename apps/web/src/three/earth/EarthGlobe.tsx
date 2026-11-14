import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import {
  loadEarthDayTexture,
  loadEarthNormalTexture,
  loadEarthSpecularTexture
} from './textures';

interface EarthGlobeProps {
  visible?: boolean;
  isRotating?: boolean;
}

// Earth's real axial obliquity is 23.44 degrees
const AXIAL_TILT_RAD = (23.44 * Math.PI) / 180;

export function EarthGlobe({ visible = true, isRotating = true }: EarthGlobeProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  const dayTexture = useMemo(() => loadEarthDayTexture(), []);
  const specularMap = useMemo(() => loadEarthSpecularTexture(), []);
  const normalMap = useMemo(() => loadEarthNormalTexture(), []);

  useFrame((_, delta) => {
    if (meshRef.current && isRotating) {
      // Smooth frame-rate independent rotation (approx 0.035 rad/sec for natural space observation)
      meshRef.current.rotation.y += delta * 0.035;
    }
  });

  if (!visible) return null;

  return (
    <group rotation={[0, 0, AXIAL_TILT_RAD]}>
      <mesh ref={meshRef} castShadow receiveShadow>
        <sphereGeometry args={[2, 64, 64]} />
        <meshStandardMaterial
          map={dayTexture}
          normalMap={normalMap.image ? normalMap : undefined}
          normalScale={new THREE.Vector2(0.55, 0.55)}
          roughnessMap={specularMap}
          roughness={0.62}
          metalness={0.1}
        />
      </mesh>
    </group>
  );
}
