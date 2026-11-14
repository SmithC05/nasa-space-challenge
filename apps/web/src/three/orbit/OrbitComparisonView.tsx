import React from 'react';
import { OrbitProfile } from '@orbital/contracts';
import { getAllOrbitProfiles } from '@orbital/game-data';
import { OrbitPathRenderer } from './OrbitPathRenderer';

interface OrbitComparisonViewProps {
  selectedOrbit: OrbitProfile;
  visible?: boolean;
}

export function OrbitComparisonView({
  selectedOrbit,
  visible = true
}: OrbitComparisonViewProps) {
  if (!visible) return null;

  const allProfiles = getAllOrbitProfiles();

  return (
    <group>
      {allProfiles.map((orbit) => {
        const isSelected = orbit.id === selectedOrbit.id;
        return (
          <OrbitPathRenderer
            key={orbit.id}
            orbit={orbit}
            isSelected={isSelected}
            visible={true}
          />
        );
      })}
    </group>
  );
}
