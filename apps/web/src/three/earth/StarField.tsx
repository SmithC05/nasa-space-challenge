import React from 'react';
import { Stars } from '@react-three/drei';

interface StarFieldProps {
  visible?: boolean;
}

export function StarField({ visible = true }: StarFieldProps) {
  if (!visible) return null;

  return (
    <group>
      {/* Primary deep space background star field */}
      <Stars
        radius={140}
        depth={80}
        count={4500}
        factor={4.2}
        saturation={0.1}
        fade
        speed={0.3}
      />
      {/* Secondary close foreground bright star field */}
      <Stars
        radius={60}
        depth={30}
        count={500}
        factor={3.0}
        saturation={0.2}
        fade
        speed={0.2}
      />
    </group>
  );
}
