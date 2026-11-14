import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { LaunchStageId } from './types';

interface CinematicCameraRigProps {
  stageId: LaunchStageId;
  rocketAltitudeMeters: number;
  cameraShakeIntensity: number;
  isReducedMotion: boolean;
}

export function CinematicCameraRig({
  stageId,
  rocketAltitudeMeters,
  cameraShakeIntensity,
  isReducedMotion
}: CinematicCameraRigProps) {
  const { camera } = useThree();
  const currentPosRef = useRef(new THREE.Vector3(14, 5, 18));
  const currentLookAtRef = useRef(new THREE.Vector3(0, 6, 0));

  useFrame((_, delta) => {
    const targetPos = new THREE.Vector3();
    const targetLookAt = new THREE.Vector3(0, rocketAltitudeMeters + 5, 0);

    switch (stageId) {
      case 'STAGE_1_PRE_LAUNCH':
      case 'STAGE_2_COUNTDOWN':
        // Low-angle dramatic pad shot
        targetPos.set(16, 4, 18);
        targetLookAt.set(0, 6, 0);
        break;

      case 'STAGE_3_IGNITION':
        // Close-up on engine base & pad
        targetPos.set(12, 2.5, 12);
        targetLookAt.set(0, 2, 0);
        break;

      case 'STAGE_4_LIFTOFF':
        // Tracking upward from pad tower
        targetPos.set(18, Math.max(6, rocketAltitudeMeters * 0.7 + 5), 20);
        targetLookAt.set(0, rocketAltitudeMeters + 4, 0);
        break;

      case 'STAGE_5_ATMOSPHERIC_ASCENT':
        // Wide high-speed tracking camera looking up with atmospheric curvature
        targetPos.set(22, rocketAltitudeMeters - 4, 25);
        targetLookAt.set(0, rocketAltitudeMeters + 8, 0);
        break;

      case 'STAGE_6_STAGE_SEPARATION':
        // Cinematic close-up on interstage and fairing deployment
        targetPos.set(9, rocketAltitudeMeters + 5, 12);
        targetLookAt.set(0, rocketAltitudeMeters + 6, 0);
        break;

      case 'STAGE_7_SPACECRAFT_DEPLOYMENT':
        // Orbit perspective focused on payload spacecraft and deploying wings
        targetPos.set(6, rocketAltitudeMeters + 8, 8);
        targetLookAt.set(0, rocketAltitudeMeters + 8, 0);
        break;

      case 'STAGE_8_ORBIT_INSERTION':
      case 'STAGE_9_OPERATIONS_HANDOFF':
        // Wide orbital overview with Earth below
        targetPos.set(15, rocketAltitudeMeters + 12, 22);
        targetLookAt.set(0, rocketAltitudeMeters + 4, 0);
        break;

      default:
        targetPos.set(16, 6, 20);
        targetLookAt.set(0, 5, 0);
    }

    // Apply smooth interpolation
    const lerpSpeed = Math.min(1.0, delta * 3.5);
    currentPosRef.current.lerp(targetPos, lerpSpeed);
    currentLookAtRef.current.lerp(targetLookAt, lerpSpeed);

    // Camera shake (suppressed if reduced motion is enabled)
    let shakeX = 0;
    let shakeY = 0;
    if (!isReducedMotion && cameraShakeIntensity > 0) {
      shakeX = (Math.random() - 0.5) * cameraShakeIntensity * 0.35;
      shakeY = (Math.random() - 0.5) * cameraShakeIntensity * 0.35;
    }

    camera.position.set(
      currentPosRef.current.x + shakeX,
      currentPosRef.current.y + shakeY,
      currentPosRef.current.z
    );
    camera.lookAt(currentLookAtRef.current);
  });

  return null;
}
