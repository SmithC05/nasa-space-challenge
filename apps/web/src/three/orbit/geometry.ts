import * as THREE from 'three';
import { OrbitProfile } from '@orbital/contracts';
import { EARTH_RADIUS_KM } from '@orbital/simulation-engine';

export const SCENE_EARTH_RADIUS = 2.0;
export const SCALE_KM_TO_SCENE = SCENE_EARTH_RADIUS / EARTH_RADIUS_KM; // ~0.00031358
export const EARTH_AXIAL_TILT_RAD = (23.44 * Math.PI) / 180;

export interface OrbitScaledDimensions {
  rp: number; // Scaled perigee radius
  ra: number; // Scaled apogee radius
  semiMajorAxis: number;
  semiMinorAxis: number;
  focalDistance: number;
  inclinationRad: number;
}

/**
 * Calculates scaled geometric dimensions for an orbital profile in Three.js units.
 */
export function getOrbitScaledDimensions(orbit: OrbitProfile): OrbitScaledDimensions {
  const perigeeKm = Math.max(100, orbit.perigeeKm);
  const apogeeKm = Math.max(perigeeKm, orbit.apogeeKm);

  // Scaled perigee and apogee
  const rp = SCENE_EARTH_RADIUS + perigeeKm * SCALE_KM_TO_SCENE;
  const ra = SCENE_EARTH_RADIUS + apogeeKm * SCALE_KM_TO_SCENE;

  const a = (rp + ra) / 2;
  const c = Math.max(0, a - rp);
  const b = Math.sqrt(Math.max(0.01, a * a - c * c));
  const incRad = ((orbit.inclinationDeg ?? 0) * Math.PI) / 180;

  return {
    rp,
    ra,
    semiMajorAxis: a,
    semiMinorAxis: b,
    focalDistance: c,
    inclinationRad: incRad
  };
}

/**
 * Generates an array of closed 3D points forming the orbital ellipse path around Earth.
 * Properly aligns with Earth's equatorial plane and axial obliquity (23.44°).
 */
export function generateOrbitPoints(
  orbit: OrbitProfile,
  segments = 128
): [number, number, number][] {
  const { semiMajorAxis: a, semiMinorAxis: b, focalDistance: c, inclinationRad: incRad } =
    getOrbitScaledDimensions(orbit);

  const points: [number, number, number][] = [];

  // Matrix to rotate from orbit plane to Earth axial equatorial tilt
  const tiltMatrix = new THREE.Matrix4().makeRotationZ(EARTH_AXIAL_TILT_RAD);

  for (let i = 0; i <= segments; i++) {
    const theta = (i / segments) * Math.PI * 2;

    // 1. Point in 2D orbital plane (with focus at origin)
    const xOrb = a * Math.cos(theta) - c;
    const zOrb = b * Math.sin(theta);

    // 2. Inclination rotation around orbital line of nodes (X-axis)
    const yInc = zOrb * Math.sin(incRad);
    const zInc = zOrb * Math.cos(incRad);
    const xInc = xOrb;

    // 3. Transform to Earth's axial reference frame
    const v = new THREE.Vector3(xInc, yInc, zInc).applyMatrix4(tiltMatrix);
    points.push([v.x, v.y, v.z]);
  }

  return points;
}

/**
 * Returns the exact 3D position of a spacecraft along an orbital curve at progress t (0 to 1).
 */
export function getOrbitPointAtProgress(
  points: [number, number, number][],
  progress: number
): [number, number, number] {
  if (points.length === 0) return [0, 0, 0];

  const clamped = Math.max(0, Math.min(1, progress % 1));
  const totalSegments = points.length - 1;
  const floatIndex = clamped * totalSegments;
  const indexA = Math.floor(floatIndex);
  const indexB = Math.min(points.length - 1, indexA + 1);
  const frac = floatIndex - indexA;

  const ptA = points[indexA];
  const ptB = points[indexB];

  return [
    ptA[0] + (ptB[0] - ptA[0]) * frac,
    ptA[1] + (ptB[1] - ptA[1]) * frac,
    ptA[2] + (ptB[2] - ptA[2]) * frac
  ];
}

/**
 * Calculates the forward velocity vector (tangent) at progress t.
 */
export function getOrbitTangentAtProgress(
  points: [number, number, number][],
  progress: number
): [number, number, number] {
  if (points.length < 2) return [1, 0, 0];

  const clamped = Math.max(0, Math.min(1, progress % 1));
  const totalSegments = points.length - 1;
  const indexA = Math.floor(clamped * totalSegments);
  const indexB = (indexA + 1) % points.length;

  const ptA = points[indexA];
  const ptB = points[indexB];

  const dx = ptB[0] - ptA[0];
  const dy = ptB[1] - ptA[1];
  const dz = ptB[2] - ptA[2];
  const len = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1;

  return [dx / len, dy / len, dz / len];
}

/**
 * Returns the recommended camera distance to frame the selected orbit cleanly.
 */
export function getRecommendedCameraDistance(orbit: OrbitProfile): number {
  const { ra } = getOrbitScaledDimensions(orbit);
  if (orbit.type === 'GEO' || ra > 8.0) {
    return 21.0; // Comfortable wide perspective for GEO
  }
  return 7.0; // Standard close-in orbital perspective for LEO, SSO, Polar
}
