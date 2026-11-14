import React, { useMemo } from 'react';
import * as THREE from 'three';
import { Line } from '@react-three/drei';
import { EARTH_AXIAL_TILT_RAD, SCENE_EARTH_RADIUS } from './geometry';

interface EquatorialReferencePlaneProps {
  showEquatorialPlane?: boolean;
  showEarthEquator?: boolean;
}

export function EquatorialReferencePlane({
  showEquatorialPlane = false,
  showEarthEquator = true
}: EquatorialReferencePlaneProps) {
  // Generate circular line for Earth's surface equator
  const equatorPoints = useMemo(() => {
    const pts: [number, number, number][] = [];
    const segments = 96;
    const r = SCENE_EARTH_RADIUS + 0.012; // Hugs slightly above crust
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      pts.push([r * Math.cos(theta), 0, r * Math.sin(theta)]);
    }
    return pts;
  }, []);

  // Generate outer reference rings (GEO distance ~13.2 units, MEO ~6 units)
  const outerRings = useMemo(() => {
    const rings: [number, number, number][][] = [];
    const radii = [4.0, 8.0, 13.22]; // Near, Intermediate, GEO ring
    const segments = 128;

    for (const r of radii) {
      const pts: [number, number, number][] = [];
      for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        pts.push([r * Math.cos(theta), 0, r * Math.sin(theta)]);
      }
      rings.push(pts);
    }
    return rings;
  }, []);

  return (
    <group rotation={[0, 0, EARTH_AXIAL_TILT_RAD]}>
      {/* 1. Earth Equator Line on Planetary Surface */}
      {showEarthEquator && (
        <Line
          points={equatorPoints}
          color="#38bdf8"
          lineWidth={1.5}
          transparent
          opacity={0.65}
        />
      )}

      {/* 2. Celestial Equatorial Reference Disc & Rings (Extends to GEO) */}
      {showEquatorialPlane && (
        <group>
          {/* Subtle concentric equatorial distance rings */}
          {outerRings.map((pts, idx) => (
            <Line
              key={idx}
              points={pts}
              color={idx === 2 ? '#10b981' : '#64748b'}
              lineWidth={idx === 2 ? 1.5 : 0.8}
              transparent
              opacity={idx === 2 ? 0.4 : 0.2}
            />
          ))}

          {/* Semi-transparent disc showing the equatorial reference sheet */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[SCENE_EARTH_RADIUS, 14.5, 64]} />
            <meshBasicMaterial
              color="#0284c7"
              side={THREE.DoubleSide}
              transparent
              opacity={0.035}
              depthWrite={false}
            />
          </mesh>
        </group>
      )}
    </group>
  );
}
