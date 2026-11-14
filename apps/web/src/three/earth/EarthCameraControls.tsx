import React, { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

type OrbitControlsRef = React.ComponentRef<typeof OrbitControls>;

interface EarthCameraControlsProps {
  resetTrigger?: number;
  frameTrigger?: number;
  targetDistance?: number;
  minDistance?: number;
  maxDistance?: number;
}

export const DEFAULT_CAMERA_POSITION: [number, number, number] = [3.8, 3.2, 5.0];
export const DEFAULT_CAMERA_TARGET: [number, number, number] = [0, 0, 0];

export function EarthCameraControls({
  resetTrigger = 0,
  frameTrigger = 0,
  targetDistance = 7.0,
  minDistance = 2.6,
  maxDistance = 28.0
}: EarthCameraControlsProps) {
  const controlsRef = useRef<OrbitControlsRef>(null);
  const { camera } = useThree();

  // Reset to initial default vantage point
  useEffect(() => {
    if (resetTrigger > 0 && controlsRef.current) {
      camera.position.set(
        DEFAULT_CAMERA_POSITION[0],
        DEFAULT_CAMERA_POSITION[1],
        DEFAULT_CAMERA_POSITION[2]
      );
      controlsRef.current.target?.set(
        DEFAULT_CAMERA_TARGET[0],
        DEFAULT_CAMERA_TARGET[1],
        DEFAULT_CAMERA_TARGET[2]
      );
      controlsRef.current.update?.();
    }
  }, [resetTrigger, camera]);

  // Adjust camera distance for orbit scale (LEO/SSO close vs GEO wide)
  useEffect(() => {
    if (frameTrigger > 0 && controlsRef.current) {
      const norm = Math.sqrt(
        DEFAULT_CAMERA_POSITION[0] ** 2 +
        DEFAULT_CAMERA_POSITION[1] ** 2 +
        DEFAULT_CAMERA_POSITION[2] ** 2
      );
      const scale = targetDistance / norm;

      camera.position.set(
        DEFAULT_CAMERA_POSITION[0] * scale,
        DEFAULT_CAMERA_POSITION[1] * scale,
        DEFAULT_CAMERA_POSITION[2] * scale
      );
      controlsRef.current.target?.set(0, 0, 0);
      controlsRef.current.update?.();
    }
  }, [frameTrigger, targetDistance, camera]);

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={true}
      enableZoom={true}
      enableRotate={true}
      enableDamping={true}
      dampingFactor={0.06}
      rotateSpeed={0.8}
      zoomSpeed={1.0}
      minDistance={minDistance} // Safely prevents camera from penetrating the Earth (radius = 2.0)
      maxDistance={maxDistance} // Prevents getting lost in the cosmos
    />
  );
}
