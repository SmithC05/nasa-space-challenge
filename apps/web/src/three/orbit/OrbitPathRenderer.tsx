import React, { useMemo } from 'react';
import { Line } from '@react-three/drei';
import { OrbitProfile } from '@orbital/contracts';
import { generateOrbitPoints } from './geometry';
import { getOrbitColorForProfile } from './types';

interface OrbitPathRendererProps {
  orbit: OrbitProfile;
  isSelected?: boolean;
  visible?: boolean;
}

export function OrbitPathRenderer({
  orbit,
  isSelected = true,
  visible = true
}: OrbitPathRendererProps) {
  const points = useMemo(() => generateOrbitPoints(orbit, 160), [orbit]);
  const baseColor = getOrbitColorForProfile(orbit);

  if (!visible) return null;

  return (
    <group>
      {/* 1. Core Orbital Path Curve */}
      <Line
        points={points}
        color={baseColor}
        lineWidth={isSelected ? 2.5 : 1.2}
        transparent
        opacity={isSelected ? 0.95 : 0.35}
      />

      {/* 2. Highlight Aura for selected orbit */}
      {isSelected && (
        <Line
          points={points}
          color={baseColor}
          lineWidth={4.5}
          transparent
          opacity={0.2}
        />
      )}
    </group>
  );
}
