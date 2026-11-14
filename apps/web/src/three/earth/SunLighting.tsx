import React from 'react';

export function SunLighting() {
  return (
    <group>
      {/* 1. Primary Sun Directional Light (Simulates parallel solar rays from a distant star) */}
      <directionalLight
        position={[14, 4, 10]}
        intensity={3.2}
        color="#fffbf2"
        castShadow
      />

      {/* 2. Deep Space Ambient Light (Very low intensity to maintain deep shadows on night side) */}
      <ambientLight intensity={0.035} color="#020617" />

      {/* 3. Subtle Night Limb Fill (Earthshine / galactic background bounce) */}
      <pointLight position={[-12, -4, -10]} intensity={0.06} color="#0c4a6e" />
    </group>
  );
}
